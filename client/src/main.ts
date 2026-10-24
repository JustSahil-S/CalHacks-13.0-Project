// Fork viewer: live twin of a real café's neighborhood, forked futures, and the people in them.
import './style.css';
import { connect } from './conn';
import { drawChart, type Series } from './chart';
import { Neighborhood, type AreaMap } from './geo';
import { Crowd, type Tally } from './people';
import { IsoScene } from './scene';
import type { DbConnection, SubscriptionHandle } from './module_bindings';
import type { Experiment, TwinBuild, Universe } from './module_bindings/types';

const SECONDS_PER_DAY = 5;
const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;
const money = (cents: number) => `$${(cents / 100).toFixed(2)}`;
const pct = (x: number) => `${x >= 0 ? '+' : ''}${(x * 100).toFixed(1)}%`;
const esc = (s: string) => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

let conn: DbConnection | null = null;
const scene = new IsoScene($('stage'));
let hood: Neighborhood | null = null;
let crowd: Crowd | null = null;

let buildId: bigint | null = null;
let rootUniverse: bigint | null = null;
let experimentId: bigint | null = null;
let playUniverse: bigint | null = null;
let selected: number | null = null; // pawn instance index
let dayFloat = 0;
let playing = false;
let speed = 1;
let dirty = true;
let crowdDirty = true;
const scoped = new Map<string, SubscriptionHandle>();

function toast(msg: string) {
  const t = $('toast');
  t.textContent = msg;
  t.hidden = false;
  clearTimeout((toast as any).timer);
  (toast as any).timer = setTimeout(() => (t.hidden = true), 3500);
}

/** Replace the subscription in one named slot (e.g. "play" or "experiment"). */
function subscribeSlot(slot: string, queries: string[], onApplied?: () => void) {
  scoped.get(slot)?.unsubscribe();
  scoped.delete(slot);
  if (!conn || !queries.length) return;
  const handle = conn
    .subscriptionBuilder()
    .onApplied(() => {
      crowdDirty = dirty = true;
      onApplied?.();
    })
    .subscribe(queries);
  scoped.set(slot, handle);
}

// ---- Connection ----------------------------------------------------------------

let myIdentity = '';
const amAdmin = () => !!conn && [...conn.db.admin.iter()].some(a => a.identity.toHexString() === myIdentity);

connect({
  ready: (c, identityHex) => {
    conn = c;
    myIdentity = identityHex;
    // Team members open the viewer once with ?admin=<key> to unlock building twins.
    const params = new URLSearchParams(location.search);
    const key = params.get('admin');
    if (key) {
      c.reducers.claimAdmin({ key }).then(
        () => toast('Admin mode on: you can build twins.'),
        err => toast(String(err?.message ?? err))
      );
      params.delete('admin');
      history.replaceState(null, '', `${location.pathname}${params.size ? `?${params}` : ''}`);
    }
    const status = $('conn-status');
    status.className = 'status live';
    status.lastElementChild!.textContent = 'live';
    c.subscriptionBuilder()
      .onApplied(() => {
        dirty = true;
        if (buildId === null) autoSelect();
      })
      .subscribe([
        'SELECT * FROM twin_build',
        'SELECT * FROM area_map',
        'SELECT * FROM universe',
        'SELECT * FROM experiment',
        'SELECT * FROM experiment_result',
        'SELECT * FROM cafe',
        'SELECT * FROM menu_item',
        'SELECT * FROM competitor',
        'SELECT * FROM menu_source',
        'SELECT * FROM admin',
      ]);
    c.db.admin.onInsert(() => (dirty = true));
    const mark = () => (dirty = true);
    const markCrowd = () => (crowdDirty = dirty = true);
    for (const table of [c.db.twinBuild, c.db.areaMap, c.db.universe, c.db.experiment, c.db.experimentResult] as any[]) {
      table.onInsert(mark);
      table.onUpdate?.(mark);
      table.onDelete(mark);
    }
    c.db.visit.onInsert(markCrowd);
    c.db.event.onInsert(markCrowd);
    c.db.areaMap.onUpdate((_ctx, _old, row) => {
      if (row.buildId === buildId && row.status === 'ready' && !hood) selectBuild(row.buildId);
    });
    c.db.experiment.onInsert((_ctx, exp) => {
      if (exp.baseUniverseId === rootUniverse) setExperiment(exp.id);
    });
  },
  down: why => {
    const status = $('conn-status');
    status.className = 'status down';
    status.lastElementChild!.textContent = why;
  },
});

// ---- Café selection ----------------------------------------------------------------

function viewableBuilds(): TwinBuild[] {
  if (!conn) return [];
  return [...conn.db.twinBuild.iter()].filter(b => b.status === 'done' && b.universeId !== 0n);
}

function buildLabel(b: TwinBuild) {
  const name = b.label || b.query.split(',')[0];
  return b.cutoffDate && b.cutoffDate !== 'scan' ? `${name} — as of ${b.cutoffDate}` : name;
}

function autoSelect() {
  const builds = viewableBuilds().filter(b => conn!.db.areaMap.buildId.find(b.id)?.status === 'ready');
  if (builds.length) selectBuild(builds[builds.length - 1].id);
}

$<HTMLSelectElement>('cafe-select').addEventListener('change', e => {
  selectBuild(BigInt((e.target as HTMLSelectElement).value));
});

function selectBuild(id: bigint) {
  if (!conn) return;
  const b = conn.db.twinBuild.id.find(id);
  const area = conn.db.areaMap.buildId.find(id);
  buildId = id;
  rootUniverse = b?.universeId ?? null;
  experimentId = null;
  playUniverse = null;
  selected = null;
  $('inspector').hidden = true;
  $('result-card').hidden = true;
  hood = null;
  crowd = null;
  if (!b || !area || area.status !== 'ready') {
    toast(area?.status === 'failed' ? `Map failed: ${area.detail}` : 'Fetching this neighborhood from OpenStreetMap…');
    if (!area) conn.reducers.fetchAreaMap({ buildId: id });
    dirty = true;
    return;
  }
  const map: AreaMap = JSON.parse(area.mapJson);
  hood = new Neighborhood(map);
  scene.setMap(map);
  crowd = new Crowd(scene, hood);
  subscribeSlot('root', [`SELECT * FROM agent WHERE universe_id = ${rootUniverse}`], () => {
    crowd?.setAgents([...conn!.db.agent.iter()].filter(a => a.universeId === rootUniverse).map(a => a.key));
  });
  const latest = [...conn.db.experiment.iter()].filter(e => e.baseUniverseId === rootUniverse).sort((a, b) => Number(b.id - a.id))[0];
  if (latest) setExperiment(latest.id);
  else {
    subscribeSlot('experiment', []);
    subscribeSlot('play', []);
    renderTabs();
  }
  renderMenuEditor();
  dirty = true;
}

// ---- Experiments -------------------------------------------------------------------

function experimentUniverses(expId: bigint): Universe[] {
  return [...conn!.db.universe.iter()].filter(u => u.experimentId === expId);
}

function setExperiment(expId: bigint) {
  experimentId = expId;
  const unis = experimentUniverses(expId);
  subscribeSlot(
    'experiment',
    unis.map(u => `SELECT * FROM daily_metric WHERE universe_id = ${u.id}`)
  );
  const exp = conn!.db.experiment.id.find(expId)!;
  const options: { label: string }[] = JSON.parse(exp.optionsJson);
  const traced = (label: string) => unis.find(u => u.optionLabel === label && u.copyNumber === 1);
  const pick = traced(options[1]?.label ?? options[0].label) ?? traced(options[0].label);
  if (pick) setPlayUniverse(pick.id);
  renderTabs();
}

function setPlayUniverse(uid: bigint) {
  playUniverse = uid;
  selected = null;
  $('inspector').hidden = true;
  const u = conn!.db.universe.id.find(uid);
  dayFloat = (u?.forkTick ?? 0) + 1;
  subscribeSlot('play', [
    `SELECT * FROM visit WHERE universe_id = ${uid}`,
    `SELECT * FROM event WHERE universe_id = ${uid}`,
    `SELECT * FROM agent WHERE universe_id = ${uid}`,
    `SELECT * FROM memory WHERE universe_id = ${uid}`,
    `SELECT * FROM review WHERE universe_id = ${uid}`,
  ]);
  renderTabs();
}

function renderTabs() {
  const tabs = $('option-tabs');
  tabs.innerHTML = '';
  if (!conn || experimentId === null) return;
  for (const u of experimentUniverses(experimentId).filter(u => u.copyNumber === 1)) {
    const btn = document.createElement('button');
    btn.textContent = u.optionLabel;
    btn.className = u.id === playUniverse ? 'on' : '';
    btn.onclick = () => setPlayUniverse(u.id);
    tabs.appendChild(btn);
  }
}

function renderMenuEditor() {
  const box = $('menu-editor');
  box.innerHTML = '';
  if (!conn || rootUniverse === null) return;
  const items = [...conn.db.menuItem.iter()].filter(m => m.universeId === rootUniverse);
  for (const m of items) {
    const row = document.createElement('div');
    row.className = 'menu-row';
    row.innerHTML = `<span class="name">${esc(m.name)}</span><span class="old">${money(m.priceCents)}</span>`;
    const input = document.createElement('input');
    input.value = (m.priceCents / 100).toFixed(2);
    input.dataset.key = m.key;
    input.dataset.old = String(m.priceCents);
    input.inputMode = 'decimal';
    input.oninput = () => input.classList.toggle('changed', Math.round(parseFloat(input.value) * 100) !== m.priceCents);
    row.appendChild(input);
    box.appendChild(row);
  }
}

$('run-btn').addEventListener('click', () => {
  if (!conn || rootUniverse === null) return toast('Pick a café first.');
  const prices: Record<string, number> = {};
  const parts: string[] = [];
  for (const input of $('menu-editor').querySelectorAll('input')) {
    const cents = Math.round(parseFloat(input.value) * 100);
    const old = Number(input.dataset.old);
    if (cents > 0 && cents !== old) {
      prices[input.dataset.key!] = cents;
      parts.push(`${input.parentElement!.querySelector('.name')!.textContent} ${money(old)}→${money(cents)}`);
    }
  }
  if (!parts.length) return toast('Change at least one price first.');
  const copies = Math.max(2, Math.min(20, Number($<HTMLInputElement>('copies').value) || 10));
  const days = Math.max(14, Math.min(180, Number($<HTMLInputElement>('days').value) || 60));
  const label = parts.length === 1 ? parts[0] : `${parts.length} price changes`;
  conn.reducers.startExperiment({
    baseUniverseId: rootUniverse,
    label,
    optionsJson: JSON.stringify([
      { label: 'no change', prices: {} },
      { label: 'price change', prices },
    ]),
    copies,
    days,
    brain: 'ai',
  }).then(
    () => toast(`Forking ${copies} futures × 2 options. Claude is deciding for customers who notice.`),
    err => toast(String(err?.message ?? err))
  );
});

// ---- Twin builds -----------------------------------------------------------------

$('build-btn').addEventListener('click', () => {
  if (!conn) return;
  const query = $<HTMLInputElement>('build-query').value.trim();
  if (!query) return toast('Paste a Google Maps link or a café name and city.');
  const menu = $<HTMLTextAreaElement>('build-menu')
    .value.split('\n')
    .map(line => line.match(/^\s*(.+?)[,\s]+\$?(\d+(?:\.\d{1,2})?)\s*$/))
    .filter((m): m is RegExpMatchArray => !!m)
    .map(m => ({
      key: m[1].toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, ''),
      name: m[1].trim(),
      priceCents: Math.round(parseFloat(m[2]) * 100),
    }));
  conn.reducers.startTwinBuild({ query, label: '', menuJson: JSON.stringify(menu), cutoffDate: '' }).then(
    () =>
      toast(
        menu.length
          ? 'Building the twin: Google Maps, reviews, then Claude reads them. A few minutes.'
          : 'Building the twin: Claude will read the menu from their website (or estimate it), then the reviews. A few minutes.'
      ),
    err => toast(String(err?.message ?? err))
  );
});

// ---- Playback controls --------------------------------------------------------------

$('play-btn').addEventListener('click', () => {
  playing = !playing;
  $('play-btn').textContent = playing ? '❚❚' : '▶';
});
$('day-slider').addEventListener('input', e => {
  dayFloat = Number((e.target as HTMLInputElement).value) + 0.001;
  crowdDirty = true;
});
for (const b of $('speed').querySelectorAll('button')) {
  b.addEventListener('click', () => {
    speed = Number(b.dataset.speed);
    $('speed').querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b));
  });
}
$('rot-left').addEventListener('click', () => scene.rotate(-1));
$('rot-right').addEventListener('click', () => scene.rotate(1));
$('inspector-close').addEventListener('click', () => {
  selected = null;
  $('inspector').hidden = true;
});
scene.onPick = i => {
  selected = i;
  if (i === null) $('inspector').hidden = true;
  else renderInspector();
};

// ---- Frame loop ----------------------------------------------------------------------

let uiTimer = 0;
scene.onFrame = dt => {
  if (!conn) return;
  if (dirty) {
    dirty = false;
    renderPanels();
  }
  const u = playUniverse !== null ? conn.db.universe.id.find(playUniverse) : null;
  const first = (u?.forkTick ?? 0) + 1;
  const last = u?.currentTick ?? 0;
  if (crowd && u && last >= first) {
    if (playing) dayFloat += (dt * speed) / SECONDS_PER_DAY;
    if (dayFloat >= last + 1) dayFloat = playing ? first : last + 0.999; // loop
    if (dayFloat < first) dayFloat = first;
    if (crowdDirty) {
      crowdDirty = false;
      const visits = [...conn.db.visit.iter()].filter(v => v.universeId === playUniverse);
      crowd.setVisits(visits);
      crowd.setNotices(
        [...conn.db.event.iter()].filter(e => e.universeId === playUniverse && e.kind === 'notice_price')
      );
    }
    const tick = Math.floor(dayFloat);
    const tally = crowd.update(tick, dayFloat - tick);
    const pos = selected !== null ? crowd.positions.get(selected) : undefined;
    scene.ringAt(pos ? pos[0] : null, pos ? pos[1] : 0);
    uiTimer += dt;
    if (uiTimer > 0.15) {
      uiTimer = 0;
      renderDeck(tick - first + 1, last - first + 1, tally);
    }
  } else if (uiTimer === 0) {
    renderDeck(0, 0, null);
    uiTimer = 1;
  }
};

function renderDeck(day: number, of: number, tally: Tally | null) {
  $('day-num').textContent = String(Math.max(0, day));
  $('day-of').textContent = `/ ${of}`;
  const slider = $<HTMLInputElement>('day-slider');
  const u = playUniverse !== null ? conn!.db.universe.id.find(playUniverse) : null;
  slider.min = String((u?.forkTick ?? 0) + 1);
  slider.max = String(u?.currentTick ?? 0);
  if (document.activeElement !== slider) slider.value = String(Math.floor(dayFloat));
  $('tally').innerHTML = tally
    ? `<span><b class="c">${tally.toCafe + tally.inCafe}</b> at the café</span><span><b class="r">${tally.toRival + tally.inRival}</b> at the rival</span><span><b>${tally.home}</b> home</span>`
    : '<span>Run an experiment to watch customers walk.</span>';
  if (tally) {
    scene.setPinNote('cafe', `${tally.inCafe} inside`);
    scene.setPinNote('rival', `${tally.inRival} inside`);
  }
  if (experimentId !== null) renderChart();
}

// ---- Panels ------------------------------------------------------------------------------

function renderPanels() {
  if (!conn) return;
  // Café picker
  const select = $<HTMLSelectElement>('cafe-select');
  const builds = viewableBuilds();
  const want = builds.map(b => `${b.id}:${buildLabel(b)}`).join('|');
  if (select.dataset.sig !== want) {
    select.dataset.sig = want;
    select.innerHTML = builds.length
      ? builds.map(b => `<option value="${b.id}">${esc(buildLabel(b))}</option>`).join('')
      : '<option>No twins yet — build one</option>';
  }
  if (buildId !== null) select.value = String(buildId);

  // Café card
  const b = buildId !== null ? conn.db.twinBuild.id.find(buildId) : null;
  if (b && rootUniverse !== null) {
    const place = b.placeJson ? JSON.parse(b.placeJson) : {};
    const cafe = conn.db.cafe.universeId.find(rootUniverse);
    const rival = [...conn.db.competitor.iter()].find(c => c.universeId === rootUniverse);
    $('cafe-name').textContent = cafe?.name ?? place.title ?? '—';
    $('cafe-meta').textContent = place.address ?? '';
    const reviewers = b.batchesTotal ? `${b.detail.match(/from (\d+) real/)?.[1] ?? '?'} reviewers` : '';
    $('cafe-facts').innerHTML = [
      ['Google rating', place.totalScore ? `${place.totalScore}★` : '—'],
      ['Reviews', place.reviewsCount ?? '—'],
      ['Customers', `200 · ${reviewers}`],
      ['Hours', cafe ? `${cafe.openHour}–${cafe.closeHour}` : '—'],
      ['Rival', rival?.name ?? 'none found'],
      ['Built from', b.cutoffDate ? `reviews before ${b.cutoffDate}` : 'all reviews'],
      ['Menu', menuSourceLabel(conn.db.menuSource.buildId.find(b.id)?.source)],
    ]
      .map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(String(v))}</dd></div>`)
      .join('');
    if (!$('menu-editor').children.length) renderMenuEditor();
  }

  // Run button state
  const exp = experimentId !== null ? conn.db.experiment.id.find(experimentId) : null;
  const runBtn = $<HTMLButtonElement>('run-btn');
  if (exp && exp.status === 'running') {
    const unis = experimentUniverses(exp.id);
    const minTick = Math.min(...unis.map(u => u.currentTick - u.forkTick));
    runBtn.disabled = true;
    runBtn.textContent = `Simulating… day ${minTick} of ${exp.days}`;
  } else {
    runBtn.disabled = false;
    runBtn.textContent = `Run ${$<HTMLInputElement>('copies').value || 10} futures`;
  }
  renderResult(exp ?? null);
  renderTabs();
  $('build-card').hidden = !amAdmin(); // building twins costs scraping + Claude credits
  renderBuildList();
}

function menuSourceLabel(source: string | undefined): string {
  switch (source) {
    case 'website':
      return 'read from their website';
    case 'menu photo':
      return 'read from their menu photos';
    case 'estimated':
      return 'estimated (no menu online)';
    case 'provided':
      return 'documented prices';
    default:
      return '—';
  }
}

function renderResult(exp: Experiment | null) {
  const card = $('result-card');
  if (!exp) {
    card.hidden = true;
    return;
  }
  card.hidden = false;
  const results = [...conn!.db.experimentResult.iter()].filter(r => r.experimentId === exp.id);
  const ctl = results.find(r => r.optionLabel === 'no change') ?? results[0];
  const chg = results.find(r => r !== ctl);
  const body = $('result-body');
  if (exp.status !== 'done' || !ctl || !chg) {
    body.innerHTML = `<p class="verdict">${esc(exp.label)}<br/><small class="hint">Simulating ${exp.copies} futures per option…</small></p>`;
  } else {
    const wins = chg.profitWins;
    const good = wins * 10 >= chg.copies * 7;
    const visits = chg.meanVisits / (ctl.meanVisits || 1) - 1;
    const stars = chg.meanStars - ctl.meanStars;
    body.innerHTML = `
      <p class="verdict ${good ? 'good' : ''}">${esc(exp.label)}: profit higher in <em>${wins} of ${chg.copies}</em> futures</p>
      <div class="stat-grid">
        <div><b>${pct(visits)}</b><span>visits</span></div>
        <div><b>${stars >= 0 ? '+' : ''}${stars.toFixed(2)}★</b><span>rating</span></div>
        <div><b>${(chg.priceMentionShare * 100).toFixed(1)}%</b><span>reviews on price</span></div>
      </div>`;
  }
}

function renderChart() {
  if (!conn || experimentId === null) return;
  const unis = experimentUniverses(experimentId);
  const metrics = [...conn.db.dailyMetric.iter()];
  const series: Series[] = [];
  const labels = [...new Set(unis.map(u => u.optionLabel))];
  labels.forEach((label, li) => {
    const copies = unis
      .filter(u => u.optionLabel === label)
      .map(u =>
        metrics
          .filter(m => m.universeId === u.id)
          .sort((a, b) => a.tick - b.tick)
          .map(m => Number(m.revenueCents) / 100)
      )
      .filter(c => c.length);
    if (copies.length) series.push({ label, color: li === 0 ? '#958c7c' : '#d9472b', copies });
  });
  const u = playUniverse !== null ? conn.db.universe.id.find(playUniverse) : null;
  drawChart($('chart') as unknown as SVGSVGElement, $('chart-legend'), series, u ? Math.floor(dayFloat) - u.forkTick - 1 : null);
}

function renderBuildList() {
  const list = $('build-list');
  const builds = [...conn!.db.twinBuild.iter()].filter(b => b.cutoffDate !== 'scan').sort((a, b) => Number(b.id - a.id)).slice(0, 6);
  const stageWidth: Record<string, number> = { queued: 5, place: 15, scraping: 40, profiling: 60, assembling: 92, done: 100, failed: 100 };
  list.innerHTML = builds
    .map(b => {
      const w = b.status === 'profiling' && b.batchesTotal ? 60 + (30 * b.batchesDone) / b.batchesTotal : stageWidth[b.status] ?? 0;
      return `<li><b>${esc(b.label || b.query.split(',')[0])}</b> · ${esc(b.status)}<br/>${esc(b.detail.slice(0, 120))}<div class="bar"><i style="width:${w}%;${b.status === 'failed' ? 'background:var(--bad)' : ''}"></i></div></li>`;
    })
    .join('');
}

function renderInspector() {
  if (!conn || !crowd || selected === null || playUniverse === null) return;
  const key = crowd.keys[selected];
  const a = [...conn.db.agent.iter()].find(x => x.universeId === playUniverse && x.key === key);
  if (!a) return;
  const menu = new Map([...conn.db.menuItem.iter()].filter(m => m.universeId === playUniverse).map(m => [m.key, m]));
  const order: string[] = JSON.parse(a.usualOrder);
  $('insp-type').textContent = a.archetype;
  $('insp-name').textContent = a.name;
  $('insp-facts').innerHTML = [
    ['Usual order', order.map(k => menu.get(k)?.name ?? k).join(' + ')],
    ['Pays', money(order.reduce((s, k) => s + (menu.get(k)?.priceCents ?? 0), 0))],
    ['Visits / week', a.visitsPerWeek.toFixed(1)],
    ['Here vs rival', `${Math.round((a.pHere / (a.pHere + a.pCompetitor || 1)) * 100)}% here`],
    ['Price sensitivity', a.priceSensitivity.toFixed(2)],
    ['Mood', `${a.satisfaction.toFixed(1)} / 5`],
  ]
    .map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(String(v))}</dd></div>`)
    .join('');
  const u = conn.db.universe.id.find(playUniverse);
  const dayOf = (tick: number) => (tick < 0 ? 'from a real Google review' : `day ${tick - (u?.forkTick ?? 0)}`);
  const memories = [...conn.db.memory.iter()].filter(m => m.universeId === playUniverse && m.agentKey === key).sort((x, y) => x.tick - y.tick);
  $('insp-memories').innerHTML = memories.map(m => `<li>${esc(m.text)}<small>${dayOf(m.tick)}</small></li>`).join('') || '<li>—</li>';
  const reviews = [...conn.db.review.iter()].filter(r => r.universeId === playUniverse && r.agentKey === key);
  $('insp-reviews-label').hidden = !reviews.length;
  $('insp-reviews').innerHTML = reviews.map(r => `<li>${'★'.repeat(r.stars)} ${esc(r.text)}<small>${dayOf(r.tick)}</small></li>`).join('');
  $('inspector').hidden = false;
}
