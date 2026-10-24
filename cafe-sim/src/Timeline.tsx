import { useEffect, useState } from 'react';
import { reducers, tables } from './module_bindings';
import { useReducer, useTable } from 'spacetimedb/react';
import type { AgentPlan, Business, CustomerAgent, SimStoreDay, SimVisit } from './module_bindings/types';

const MAX_DAYS_PER_RUN = 7;

type Totals = { customers: number; revenue: number; cost: number; profit: number };

function money(cents: number) {
  const dollars = Math.round(cents / 100);
  return `${dollars < 0 ? '-' : ''}$${Math.abs(dollars).toLocaleString()}`;
}

function signedMoney(cents: number) {
  return `${cents > 0 ? '+' : ''}${money(cents)}`;
}

function signed(value: number, digits = 0) {
  return `${value > 0 ? '+' : ''}${value.toFixed(digits)}`;
}

function totalsOf(rows: SimStoreDay[]): Totals {
  const customers = rows.reduce((sum, r) => sum + r.customers, 0);
  const revenue = rows.reduce((sum, r) => sum + r.revenueCents, 0);
  const cost = rows.reduce((sum, r) => sum + r.costCents, 0);
  return { customers, revenue, cost, profit: revenue - cost };
}

function changeClass(value: number) {
  return Math.abs(value) < 0.5 ? 'flat' : value > 0 ? 'up' : 'down';
}

function shortDate(date: string) {
  return new Date(`${date}T12:00:00Z`).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

function visitKey(visit: SimVisit) {
  return `${visit.chance.toFixed(2)}|${visit.itemsJson}`;
}

export default function Timeline({
  stores,
  ownPlaceId,
  agents,
  scenarioId,
  scenarioName,
  running,
  jobMessage,
  onError,
}: {
  stores: Business[];
  ownPlaceId: string;
  agents: readonly CustomerAgent[];
  // 0 is the base universe
  scenarioId: number;
  scenarioName: string;
  running: boolean;
  jobMessage: string;
  onError: (error: unknown) => void;
}) {
  const startAgentDay = useReducer(reducers.startAgentDay);
  const resetTimeline = useReducer(reducers.resetTimeline);
  const [days] = useTable(tables.sim_day);
  const [storeDays] = useTable(tables.sim_store_day);
  const [visits] = useTable(tables.sim_visit);
  const [agentJobs] = useTable(tables.agent_job);
  const [agentPlans] = useTable(tables.agent_plan);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const agentBusy = agentJobs.some(job => job.status === 'queued' || job.status === 'running');
  const latestJob = [...agentJobs].sort((a, b) =>
    Number(b.updatedAt.microsSinceUnixEpoch - a.updatedAt.microsSinceUnixEpoch),
  )[0];
  const busy = running || agentBusy;
  const status = agentBusy ? latestJob?.message || 'Agents are deciding...' : jobMessage;

  const comparing = scenarioId !== 0;
  const baseDays = new Map(days.filter(d => d.scenarioId === 0).map(d => [d.day, d]));
  const ownDays = days.filter(d => d.scenarioId === scenarioId).sort((a, b) => a.day - b.day);
  const lastDay = ownDays[ownDays.length - 1]?.day ?? 0;

  useEffect(() => {
    setSelectedDay(lastDay || null);
  }, [lastDay, scenarioId]);

  const rowsFor = (dayId: number | undefined) => storeDays.filter(r => r.dayId === dayId);
  const ownTotals = (dayId: number | undefined) => totalsOf(rowsFor(dayId).filter(r => r.placeId === ownPlaceId));

  const timeline = ownDays.map(day => {
    const base = ownTotals(baseDays.get(day.day)?.dayId);
    const scenario = comparing ? ownTotals(day.dayId) : base;
    return { day, base, scenario };
  });
  const sum = (key: 'base' | 'scenario') => timeline.reduce((total, t) => total + t[key].profit, 0);
  const baseProfit = sum('base');
  const scenarioProfit = sum('scenario');

  const onSimulate = (count: number) => startAgentDay({ scenarioId, days: count }).catch(onError);
  const onRestart = () => {
    const what = comparing
      ? `Clear the simulated days of "${scenarioName}"?`
      : 'Clear every simulated day, in the base universe and in all scenarios?';
    if (window.confirm(what)) resetTimeline({ scenarioId }).catch(onError);
  };

  const selected = timeline.find(t => t.day.day === selectedDay);
  const agentsById = new Map(agents.map(a => [a.agentId, a]));
  const storesById = new Map(stores.map(s => [s.placeId, s]));

  return (
    <div className="timeline">
      <div className="timeline-head">
        <h3>Timeline</h3>
        <span className="muted">
          {comparing
            ? `Each agent looks up menus in the live database, then the ones your edits would change update their plans.`
            : 'Each agent looks up nearby stores and menus in the live database, then decides where to go.'}
        </span>
        <div className="timeline-actions">
          <button type="button" onClick={() => onSimulate(1)} disabled={busy || agents.length === 0}>
            {busy ? 'Simulating...' : `Simulate day ${lastDay + 1}`}
          </button>
          <button
            type="button"
            className="secondary"
            onClick={() => onSimulate(MAX_DAYS_PER_RUN)}
            disabled={busy || agents.length === 0}
          >
            Simulate {MAX_DAYS_PER_RUN} days
          </button>
          <button type="button" className="danger" onClick={onRestart} disabled={busy || ownDays.length === 0}>
            Restart
          </button>
        </div>
      </div>

      {busy && status && (
        <p className="timeline-status">
          <span className="spinner" />
          {status}
          {latestJob && agentBusy && ` (${latestJob.agentsDone}/${latestJob.agentsTotal})`}
        </p>
      )}

      {agents.length === 0 ? (
        <p className="muted">Create customer agents first.</p>
      ) : timeline.length === 0 ? (
        <p className="muted">No days simulated yet.</p>
      ) : (
        <>
          <div className="timeline-track">
            {timeline.map(({ day, base, scenario }) => {
              const change = scenario.profit - base.profit;
              return (
                <button
                  type="button"
                  key={day.dayId}
                  className={`day-chip ${day.day === selectedDay ? 'selected' : ''}`}
                  onClick={() => setSelectedDay(day.day)}
                >
                  <span className="day-label">
                    Day {day.day} · {day.weekday.slice(0, 3)} {shortDate(day.date)}
                  </span>
                  <strong>{money(scenario.profit)}</strong>
                  {comparing && (
                    <span className={`change ${changeClass(change / 100)}`}>{signedMoney(change)} vs base</span>
                  )}
                  <span className="muted">{Math.round(scenario.customers)} customers</span>
                </button>
              );
            })}
          </div>

          <p className="timeline-summary">
            Over {timeline.length} day{timeline.length === 1 ? '' : 's'}, your gross profit is{' '}
            <strong>{money(comparing ? scenarioProfit : baseProfit)}</strong>
            {comparing && (
              <>
                {' '}
                in {scenarioName} vs <strong>{money(baseProfit)}</strong> in the base universe (
                <span className={`change ${changeClass((scenarioProfit - baseProfit) / 100)}`}>
                  {signedMoney(scenarioProfit - baseProfit)}
                  {baseProfit > 0 && `, ${signed(((scenarioProfit - baseProfit) / baseProfit) * 100, 1)}%`}
                </span>
                )
              </>
            )}
            .
          </p>

          {selected && (
            <DayDetail
              comparing={comparing}
              scenarioName={scenarioName}
              ownPlaceId={ownPlaceId}
              stores={stores}
              storesById={storesById}
              agentsById={agentsById}
              plans={agentPlans.filter(
                plan =>
                  plan.jobId ===
                  agentJobs.find(job => job.scenarioId === scenarioId && job.day === selected.day.day)?.jobId,
              )}
              base={{
                totals: selected.base,
                rows: rowsFor(baseDays.get(selected.day.day)?.dayId),
                visits: visits.filter(v => v.dayId === baseDays.get(selected.day.day)?.dayId),
              }}
              scenario={{
                totals: selected.scenario,
                rows: rowsFor(selected.day.dayId),
                visits: visits.filter(v => v.dayId === selected.day.dayId),
              }}
            />
          )}
        </>
      )}
    </div>
  );
}

type Universe = { totals: Totals; rows: SimStoreDay[]; visits: SimVisit[] };

function DayDetail({
  comparing,
  scenarioName,
  ownPlaceId,
  stores,
  storesById,
  agentsById,
  plans,
  base,
  scenario,
}: {
  comparing: boolean;
  scenarioName: string;
  ownPlaceId: string;
  stores: Business[];
  storesById: Map<string, Business>;
  agentsById: Map<number, CustomerAgent>;
  plans: AgentPlan[];
  base: Universe;
  scenario: Universe;
}) {
  const shown = comparing ? scenario : base;
  const pnl: [string, keyof Totals, (v: number) => string][] = [
    ['Customers', 'customers', v => Math.round(v).toLocaleString()],
    ['Revenue', 'revenue', money],
    ['Ingredient cost', 'cost', money],
    ['Gross profit', 'profit', money],
  ];

  const storeRow = (u: Universe, placeId: string) => totalsOf(u.rows.filter(r => r.placeId === placeId));
  const marketCustomers = (u: Universe) => u.rows.reduce((sum, r) => sum + r.customers, 0);

  const baseVisits = new Map(base.visits.filter(v => v.placeId === ownPlaceId).map(v => [v.agentId, v]));
  const ownVisits = shown.visits.filter(v => v.placeId === ownPlaceId).sort((a, b) => b.customers - a.customers);
  // Agents who came to your store in the base universe but not in the scenario
  const lost = comparing ? [...baseVisits.values()].filter(v => !ownVisits.some(o => o.agentId === v.agentId)) : [];

  const [view, setView] = useState<'store' | 'all'>('store');
  const plansOf = (u: Universe, agentId: number) =>
    u.visits.filter(v => v.agentId === agentId).sort((a, b) => b.chance - a.chance);
  const planKey = (visits: SimVisit[]) =>
    visits
      .map(v => `${v.placeId}|${visitKey(v)}`)
      .sort()
      .join(';');
  const changedAgents = new Set(
    comparing ? [...agentsById.keys()].filter(id => planKey(plansOf(base, id)) !== planKey(plansOf(scenario, id))) : [],
  );
  const queriesOf = (agentId: number) => {
    const raw = plans.find(plan => plan.agentId === agentId)?.queriesJson;
    if (!raw) return [];
    try {
      return (JSON.parse(raw) as { sql?: string; rows?: number; error?: string }[]).filter(q => q.sql || q.error);
    } catch {
      return [];
    }
  };

  return (
    <div className="day-detail">
      <div>
        <h4>Your store</h4>
        <table className="pnl">
          <thead>
            <tr>
              <th />
              <th>Base</th>
              {comparing && (
                <>
                  <th>{scenarioName}</th>
                  <th>Change</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {pnl.map(([label, key, format]) => {
              const change = scenario.totals[key] - base.totals[key];
              return (
                <tr key={key} className={key === 'profit' ? 'total' : undefined}>
                  <td>{label}</td>
                  <td>{format(base.totals[key])}</td>
                  {comparing && (
                    <>
                      <td>{format(scenario.totals[key])}</td>
                      <td className={`change ${changeClass(key === 'customers' ? change : change / 100)}`}>
                        {key === 'customers' ? signed(change) : signedMoney(change)}
                      </td>
                    </>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
        <p className="muted small">
          Gross profit is revenue minus ingredient cost (25% of a drink's real price, 32% of food's), before rent and
          labor. Changing a price doesn't change what an item costs to make.
        </p>

        <h4>Market</h4>
        <table className="pnl">
          <thead>
            <tr>
              <th>Store</th>
              <th>Customers</th>
              {comparing && <th>Change</th>}
              <th>Share</th>
            </tr>
          </thead>
          <tbody>
            {stores.map(s => {
              const shownRow = storeRow(shown, s.placeId);
              const change = shownRow.customers - storeRow(base, s.placeId).customers;
              const total = marketCustomers(shown);
              return (
                <tr key={s.placeId} className={s.placeId === ownPlaceId ? 'own-store' : undefined}>
                  <td>{s.name}</td>
                  <td>{Math.round(shownRow.customers)}</td>
                  {comparing && <td className={`change ${changeClass(change)}`}>{signed(change)}</td>}
                  <td>{total ? `${Math.round((shownRow.customers / total) * 100)}%` : '–'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div>
        <div className="detail-tabs">
          <button type="button" className={view === 'store' ? undefined : 'secondary'} onClick={() => setView('store')}>
            Your store's customers
          </button>
          <button type="button" className={view === 'all' ? undefined : 'secondary'} onClick={() => setView('all')}>
            All customers
          </button>
        </div>
        {comparing && (
          <p className="muted small">
            {changedAgents.size === 0
              ? `Nobody changed their plans because of ${scenarioName}'s menu today.`
              : `${changedAgents.size} customer${changedAgents.size === 1 ? '' : 's'} changed their plans because of ${scenarioName}'s menu today.`}
          </p>
        )}
        {view === 'all' ? (
          <ul className="visit-list">
            {[...agentsById.values()]
              .sort(
                (a, b) =>
                  Number(changedAgents.has(b.agentId)) - Number(changedAgents.has(a.agentId)) ||
                  Number(b.placeId === ownPlaceId) - Number(a.placeId === ownPlaceId) ||
                  a.placeId.localeCompare(b.placeId),
              )
              .map(agent => {
                const changed = changedAgents.has(agent.agentId);
                return (
                  <li key={agent.agentId} className={changed ? 'changed' : undefined}>
                    <div className="visit-head">
                      <strong>{agent.name}</strong>
                      <span className="muted">
                        {agent.archetype} · regular at {storesById.get(agent.placeId)?.name}
                      </span>
                    </div>
                    <PlanLines visits={plansOf(shown, agent.agentId)} storesById={storesById} />
                    {queriesOf(agent.agentId).length > 0 && (
                      <ul className="query-list">
                        {queriesOf(agent.agentId).map((query, i) => (
                          <li key={i}>
                            {query.error
                              ? `SQL failed: ${query.error}`
                              : `${query.sql} → ${query.rows ?? 0} row${query.rows === 1 ? '' : 's'}`}
                          </li>
                        ))}
                      </ul>
                    )}
                    {changed && (
                      <div className="base-plan">
                        <span className="muted">In the base universe:</span>
                        <PlanLines visits={plansOf(base, agent.agentId)} storesById={storesById} />
                      </div>
                    )}
                  </li>
                );
              })}
          </ul>
        ) : (
          <ul className="visit-list">
            {ownVisits.map(visit => {
              const agent = agentsById.get(visit.agentId);
              const before = baseVisits.get(visit.agentId);
              const changed = comparing && (!before || visitKey(before) !== visitKey(visit));
              return (
                <li key={visit.visitId} className={changed ? 'changed' : undefined}>
                  <div className="visit-head">
                    <strong>{agent?.name ?? 'Customer'}</strong>
                    <span className="muted">
                      {agent?.archetype}
                      {agent && agent.placeId !== ownPlaceId && ` · regular at ${storesById.get(agent.placeId)?.name}`}
                    </span>
                  </div>
                  <div>
                    {Math.round(visit.chance * 100)}% chance{' '}
                    {comparing && before && before.chance !== visit.chance && (
                      <span className="muted">(was {Math.round(before.chance * 100)}%)</span>
                    )}{' '}
                    · ≈{Math.round(visit.customers)} people · {(JSON.parse(visit.itemsJson) as string[]).join(', ')} ·{' '}
                    {money(visit.spendCents)} each
                  </div>
                  <div className="muted">“{visit.reason}”</div>
                </li>
              );
            })}
            {lost.map(visit => {
              const agent = agentsById.get(visit.agentId);
              const elsewhere = scenario.visits.filter(v => v.agentId === visit.agentId);
              return (
                <li key={`lost-${visit.visitId}`} className="lost">
                  <div className="visit-head">
                    <strong>{agent?.name ?? 'Customer'}</strong>
                    <span className="muted">{agent?.archetype}</span>
                  </div>
                  <div>
                    Stopped coming (was {Math.round(visit.chance * 100)}%, ≈{Math.round(visit.customers)} people)
                    {elsewhere.length > 0 &&
                      ` · went to ${elsewhere.map(v => storesById.get(v.placeId)?.name ?? 'another store').join(', ')}`}
                  </div>
                  {elsewhere[0] && <div className="muted">“{elsewhere[0].reason}”</div>}
                </li>
              );
            })}
            {ownVisits.length === 0 && lost.length === 0 && <li className="muted">Nobody is likely to visit today.</li>}
          </ul>
        )}
      </div>
    </div>
  );
}

function PlanLines({ visits, storesById }: { visits: SimVisit[]; storesById: Map<string, Business> }) {
  if (visits.length === 0) return <div className="muted">Not going to any of these stores today.</div>;
  return (
    <>
      {visits.map(visit => (
        <div key={visit.visitId} className="plan-line">
          <div>
            {Math.round(visit.chance * 100)}% {storesById.get(visit.placeId)?.name ?? 'another store'} ·{' '}
            {(JSON.parse(visit.itemsJson) as string[]).join(', ')} · {money(visit.spendCents)}
          </div>
          <div className="muted">“{visit.reason}”</div>
        </div>
      ))}
    </>
  );
}
