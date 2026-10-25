import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { reducers, tables } from './module_bindings';
import { useReducer, useTable } from 'spacetimedb/react';
import type { Business, MenuItem, ScenarioEdit } from './module_bindings/types';
import { scenarioMenu, type MenuRow } from './scenarioMenu';
import { itemTrend, suggestMenuGaps, type ItemTrend } from './itemTrends';

function formatPrice(cents: number | null) {
  return cents == null ? '–' : `$${(cents / 100).toFixed(2)}`;
}

function formatDistance(meters: number) {
  return meters < 1000 ? `${Math.round(meters)} m` : `${(meters / 1000).toFixed(2)} km`;
}

function parseDollars(text: string) {
  const dollars = Number(text.replace(/[$,\s]/g, ''));
  return Number.isFinite(dollars) && dollars > 0 ? Math.round(dollars * 100) : null;
}

function TrendNote({ trend }: { trend: ItemTrend }) {
  return (
    <p className="item-trend">
      {trend.sellers.length > 0 ? (
        <>
          <span className="rival">
            {trend.sellers.length} nearby{' '}
            {trend.sellers.length === 1 ? 'match' : 'matches'}
          </span>
          {trend.deltaVsAvg != null && (
            <>
              {' '}
              · {trend.deltaVsAvg < -25 ? 'cheaper' : trend.deltaVsAvg > 25 ? 'pricier' : 'close'} vs $
              {(trend.avgRivalCents! / 100).toFixed(2)} avg
            </>
          )}
        </>
      ) : (
        <span>fills a gap nearby</span>
      )}
      {' · '}
      {trend.demand.length === 0
        ? 'no personas mention it yet'
        : `${trend.demand.length} persona${trend.demand.length === 1 ? '' : 's'} (~${Math.round(trend.demandPeople)} people) already want this`}
    </p>
  );
}

// Commits on Enter or blur, so each edit is one reducer call; Escape puts the saved price back
type MenuEntry =
  | { kind: 'section'; key: string; title: string }
  | { kind: 'item'; key: string; row: MenuRow };

function flattenMenu(shown: MenuRow[]): MenuEntry[] {
  const entries: MenuEntry[] = [];
  for (let i = 0; i < shown.length; i++) {
    if (i === 0 || shown[i - 1].section !== shown[i].section) {
      entries.push({
        kind: 'section',
        key: `sec-${shown[i].section || 'menu'}`,
        title: shown[i].section || 'Menu',
      });
    }
    entries.push({ kind: 'item', key: shown[i].key, row: shown[i] });
  }
  return entries;
}

const SECTION_H = 28;
const ROW_H = 38;
const TREND_H = 38;

function VirtualMenuList({
  entries,
  rowHeight,
  renderEntry,
}: {
  entries: MenuEntry[];
  rowHeight: (entry: MenuEntry) => number;
  renderEntry: (entry: MenuEntry) => ReactNode;
}) {
  const scroller = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [height, setHeight] = useState(320);

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const measure = () => setHeight(el.clientHeight);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const offsets = useMemo(() => {
    const next = new Array<number>(entries.length);
    let top = 0;
    for (let i = 0; i < entries.length; i++) {
      next[i] = top;
      top += rowHeight(entries[i]);
    }
    return { next, total: top };
  }, [entries, rowHeight]);

  const pad = ROW_H * 10;
  let start = 0;
  while (
    start < entries.length &&
    offsets.next[start] + rowHeight(entries[start]) < scrollTop - pad
  ) {
    start++;
  }
  let end = start;
  while (end < entries.length && offsets.next[end] < scrollTop + height + pad) end++;
  end = Math.min(entries.length, end + 1);

  return (
    <div
      className="menu-list"
      ref={scroller}
      onScroll={e => setScrollTop(e.currentTarget.scrollTop)}
    >
      <div className="menu-virt-space" style={{ height: offsets.total }}>
        <div className="menu-virt-window" style={{ top: offsets.next[start] ?? 0 }}>
          {entries.slice(start, end).map(renderEntry)}
        </div>
      </div>
    </div>
  );
}

function PriceInput({ cents, onCommit }: { cents: number; onCommit: (cents: number) => void }) {
  const [text, setText] = useState((cents / 100).toFixed(2));
  useEffect(() => setText((cents / 100).toFixed(2)), [cents]);
  const commit = () => {
    const next = parseDollars(text);
    if (next === null) setText((cents / 100).toFixed(2));
    else if (next !== cents) onCommit(next);
  };
  return (
    <span className="price-input">
      $
      <input
        value={text}
        inputMode="decimal"
        onChange={e => setText(e.target.value)}
        onBlur={commit}
        onKeyDown={e => {
          if (e.key === 'Enter') e.currentTarget.blur();
          if (e.key === 'Escape') {
            setText((cents / 100).toFixed(2));
            e.currentTarget.blur();
          }
        }}
      />
    </span>
  );
}

export default function MenuPanel({
  business,
  distanceMeters,
  items,
  edits,
  isOwnStore,
  scenarioId,
  onCreateScenario,
  onClose,
  onError,
}: {
  business: Business;
  distanceMeters?: number;
  items: MenuItem[];
  edits: ScenarioEdit[];
  isOwnStore: boolean;
  // 0 is the base universe, which can't be edited
  scenarioId: number;
  onCreateScenario: () => void;
  onClose: () => void;
  onError: (error: unknown) => void;
}) {
  const setItemPrice = useReducer(reducers.setItemPrice);
  const removeItem = useReducer(reducers.removeItem);
  const addItem = useReducer(reducers.addItem);
  const updateAddedItem = useReducer(reducers.updateAddedItem);
  const revertEdit = useReducer(reducers.revertEdit);

  const [allItems] = useTable(tables.menu_item);
  const [allBusinesses] = useTable(tables.business);
  const [allAgents] = useTable(tables.customer_agent);
  const [filter, setFilter] = useState('');
  const [newName, setNewName] = useState('');
  const [sectionPick, setSectionPick] = useState('');
  const [customSection, setCustomSection] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [queuedAdds, setQueuedAdds] = useState<string[]>([]);
  const [suggestReady, setSuggestReady] = useState(false);

  const editable = isOwnStore && scenarioId !== 0;
  const rows = useMemo(
    () => scenarioMenu(items, isOwnStore ? edits : []),
    [items, edits, isOwnStore],
  );
  const query = filter.trim().toLowerCase();
  const shown = query ? rows.filter(r => `${r.name} ${r.section}`.toLowerCase().includes(query)) : rows;
  const sections = [...new Set(rows.map(r => r.section).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b),
  );
  const NEW_SECTION = '__new__';
  const selectValue =
    sectionPick === NEW_SECTION
      ? NEW_SECTION
      : sections.includes(sectionPick)
        ? sectionPick
        : sections[0] || NEW_SECTION;
  const sectionValue =
    selectValue === NEW_SECTION ? customSection : selectValue || 'Menu';
  const changes = rows.filter(r => r.status !== 'base').length;
  const namesByPlace = useMemo(
    () => new Map(allBusinesses.map(row => [row.placeId, row.name])),
    [allBusinesses],
  );
  const catalog = useMemo(
    () =>
      editable
        ? allItems.map(item => ({
            placeId: item.placeId,
            storeName: namesByPlace.get(item.placeId) ?? item.placeId,
            name: item.name,
            section: item.section,
            priceCents: item.overridePriceCents ?? item.predictedPriceCents,
          }))
        : [],
    [editable, allItems, namesByPlace],
  );
  const profiles = useMemo(
    () =>
      editable
        ? allAgents.map(agent => ({
            agentId: agent.agentId,
            placeId: agent.placeId,
            name: agent.name,
            archetype: agent.archetype,
            backstory: agent.backstory,
            typicalOrder: agent.typicalOrder,
            priceSensitivity: agent.priceSensitivity,
            foodWeight: agent.foodWeight,
            representsCustomers: agent.representsCustomers,
          }))
        : [],
    [editable, allAgents],
  );
  const draftCents = parseDollars(newPrice);
  const draftTrend =
    editable && draftCents
      ? itemTrend(newName, draftCents, business.placeId, catalog, profiles)
      : null;
  const addedTrends = useMemo(() => {
    const next = new Map<string, ItemTrend>();
    if (!suggestReady) return next;
    for (const row of rows) {
      if (row.status !== 'added') continue;
      const trend = itemTrend(row.name, row.price, business.placeId, catalog, profiles);
      if (trend) next.set(row.key, trend);
    }
    return next;
  }, [suggestReady, rows, business.placeId, catalog, profiles]);
  const ownNames = useMemo(() => rows.map(row => row.name), [rows]);
  useEffect(() => {
    setQueuedAdds(queued => {
      const next = queued.filter(
        name => !ownNames.some(own => own.toLowerCase() === name.toLowerCase()),
      );
      return next.length === queued.length ? queued : next;
    });
  }, [ownNames]);
  useEffect(() => {
    if (!editable) {
      setSuggestReady(false);
      return;
    }
    setSuggestReady(false);
    const id = window.setTimeout(() => setSuggestReady(true), 0);
    return () => window.clearTimeout(id);
  }, [editable, business.placeId, scenarioId]);
  const suggestions = useMemo(() => {
    if (!editable || !suggestReady) return [];
    const queued = new Set(queuedAdds.map(name => name.toLowerCase()));
    return suggestMenuGaps(business.placeId, ownNames, catalog, profiles).filter(
      row => !queued.has(row.name.toLowerCase()),
    );
  }, [editable, suggestReady, business.placeId, ownNames, catalog, profiles, queuedAdds]);

  const call = (request: Promise<void>) => request.catch(onError);

  const onPrice = (row: MenuRow, cents: number) => {
    if (row.addEditId !== undefined) {
      call(updateAddedItem({ editId: row.addEditId, name: row.name, section: row.section, priceCents: cents }));
    } else {
      call(setItemPrice({ scenarioId, itemName: row.name, priceCents: cents }));
    }
  };

  const onAdd = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const priceCents = parseDollars(newPrice);
    const section = sectionValue.trim() || 'Menu';
    if (!newName.trim() || priceCents === null) return;
    if (sectionPick === NEW_SECTION && !customSection.trim()) return;
    call(
      addItem({ scenarioId, name: newName, section, priceCents }).then(() => {
        setNewName('');
        setNewPrice('');
        setSectionPick(section);
        setCustomSection('');
      }),
    );
  };

  const entries = useMemo(() => flattenMenu(shown), [shown]);
  const rowHeight = (entry: MenuEntry) => {
    if (entry.kind === 'section') return SECTION_H;
    return addedTrends.has(entry.row.key) ? ROW_H + TREND_H : ROW_H;
  };
  const renderEntry = (entry: MenuEntry) =>
    entry.kind === 'section' ? (
      <h4 key={entry.key}>{entry.title}</h4>
    ) : (
      <div key={entry.key}>
        <div className={`menu-row ${entry.row.status}`}>
          <span className="item-name">
            {entry.row.name}
            {entry.row.status === 'added' && <span className="tag">new</span>}
            {entry.row.status === 'removed' && <span className="tag">removed</span>}
          </span>
          {entry.row.status === 'changed' && <s className="muted">{formatPrice(entry.row.basePrice)}</s>}
          {editable && entry.row.status !== 'removed' ? (
            <PriceInput cents={entry.row.price} onCommit={cents => onPrice(entry.row, cents)} />
          ) : (
            <span className="price">{formatPrice(entry.row.price)}</span>
          )}
          {editable && (
            <span className="row-actions">
              {entry.row.status === 'changed' && (
                <button
                  type="button"
                  title="Back to the real price"
                  onClick={() => call(revertEdit({ editId: entry.row.priceEditId! }))}
                >
                  ↺
                </button>
              )}
              {entry.row.status === 'removed' ? (
                <button
                  type="button"
                  title="Put back on the menu"
                  onClick={() => call(revertEdit({ editId: entry.row.removeEditId! }))}
                >
                  ↺
                </button>
              ) : entry.row.status === 'added' ? (
                <button
                  type="button"
                  title="Delete this item"
                  onClick={() => call(revertEdit({ editId: entry.row.addEditId! }))}
                >
                  ×
                </button>
              ) : (
                <button
                  type="button"
                  title="Take off the menu"
                  onClick={() => call(removeItem({ scenarioId, itemName: entry.row.name }))}
                >
                  ×
                </button>
              )}
            </span>
          )}
        </div>
        {addedTrends.get(entry.row.key) && (
          <TrendNote trend={addedTrends.get(entry.row.key)!} />
        )}
      </div>
    );

  const onAddSuggestion = (name: string, section: string, priceCents: number) => {
    setQueuedAdds(queued => [...queued, name]);
    call(
      addItem({ scenarioId, name, section: section || 'New items', priceCents }).catch(error => {
        setQueuedAdds(queued => queued.filter(row => row !== name));
        throw error;
      }),
    );
  };

  return (
    <aside className="menu-panel" onClick={e => e.stopPropagation()}>
      <header>
        <div>
          <strong>{business.name}</strong>
          <div className="muted">
            {business.rating ? `${business.rating.toFixed(1)}★` : '–'} · {business.reviewsCount} reviews ·{' '}
            {distanceMeters === undefined ? 'your store' : `${formatDistance(distanceMeters)} away`}
          </div>
        </div>
        <button type="button" className="close" onClick={onClose} aria-label="Close menu">
          ×
        </button>
      </header>

      {isOwnStore && scenarioId === 0 && (
        <div className="panel-note">
          This is your real menu. Start a scenario to try new prices or items.
          <button type="button" onClick={onCreateScenario}>
            New scenario
          </button>
        </div>
      )}
      {editable && changes > 0 && (
        <div className="panel-note">
          {changes} change{changes === 1 ? '' : 's'} in this scenario
        </div>
      )}

      {rows.length > 8 && (
        <input
          className="menu-filter"
          placeholder="Search menu"
          value={filter}
          onChange={e => setFilter(e.target.value)}
        />
      )}

      {rows.length === 0 ? (
        <div className="menu-list">
          <p className="muted">No menu yet. Fetch menus first.</p>
        </div>
      ) : entries.length <= 28 ? (
        <div className="menu-list">{entries.map(renderEntry)}</div>
      ) : (
        <VirtualMenuList entries={entries} rowHeight={rowHeight} renderEntry={renderEntry} />
      )}

      {editable && (
        <form className="add-item" onSubmit={onAdd}>
          <input placeholder="New item" value={newName} onChange={e => setNewName(e.target.value)} required />
          <select
            aria-label="Section"
            value={selectValue}
            onChange={e => setSectionPick(e.target.value)}
          >
            {sections.map(section => (
              <option key={section} value={section}>
                {section}
              </option>
            ))}
            <option value={NEW_SECTION}>+ New section</option>
          </select>
          <input
            placeholder="$0.00"
            inputMode="decimal"
            value={newPrice}
            onChange={e => setNewPrice(e.target.value)}
            required
          />
          <button type="submit">Add</button>
          {(sectionPick === NEW_SECTION || sections.length === 0) && (
            <input
              className="new-section"
              placeholder="New section name"
              value={customSection}
              onChange={e => setCustomSection(e.target.value)}
              required
            />
          )}
          {draftTrend && <TrendNote trend={draftTrend} />}
        </form>
      )}

      {editable && (
        <div className="menu-suggest">
          <h4>Suggested</h4>
          <p className="muted small">Nearby items people already want, not on your menu.</p>
          {!suggestReady ? (
            <p className="muted small">Looking for nearby gaps…</p>
          ) : suggestions.length === 0 ? (
            <p className="muted small">No clear gaps right now.</p>
          ) : (
            suggestions.map(row => (
              <div key={`${row.section}-${row.name}`} className="suggest-block">
                <div className="suggest-row">
                  <span className="item-name">{row.name}</span>
                  <span className="price">{formatPrice(row.priceCents)}</span>
                  <button
                    type="button"
                    onClick={() => onAddSuggestion(row.name, row.section, row.priceCents)}
                  >
                    Add
                  </button>
                </div>
                <p className="suggest-why">{row.why}</p>
              </div>
            ))
          )}
        </div>
      )}
    </aside>
  );
}
