import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { reducers, tables } from "./module_bindings";
import { useReducer, useTable } from "spacetimedb/react";
import type {
  Business,
  CustomerAgent,
  SimStoreDay,
  SimVisit,
} from "./module_bindings/types";
import {
  liveOwnRevenue,
  liveVisitsForJob,
  PLAY_HOLD_MS,
  tripsFromVisits,
  type MapTrip,
} from "./liveSim";
import { ENSEMBLE_RUNS } from "./ensemble";

type Totals = {
  customers: number;
  revenue: number;
  cost: number;
  profit: number;
};

function money(cents: number) {
  const dollars = Math.round(cents / 100);
  return `${dollars < 0 ? "-" : ""}$${Math.abs(dollars).toLocaleString()}`;
}

function signedMoney(cents: number) {
  return `${cents > 0 ? "+" : ""}${money(cents)}`;
}

function signed(value: number, digits = 0) {
  return `${value > 0 ? "+" : ""}${value.toFixed(digits)}`;
}

function totalsOf(rows: SimStoreDay[]): Totals {
  const customers = rows.reduce((sum, r) => sum + r.customers, 0);
  const revenue = rows.reduce((sum, r) => sum + r.revenueCents, 0);
  const cost = rows.reduce((sum, r) => sum + r.costCents, 0);
  return { customers, revenue, cost, profit: revenue - cost };
}

function averageTotals(rows: Totals[]): Totals {
  const n = rows.length || 1;
  const customers = rows.reduce((sum, r) => sum + r.customers, 0) / n;
  const revenue = rows.reduce((sum, r) => sum + r.revenue, 0) / n;
  const cost = rows.reduce((sum, r) => sum + r.cost, 0) / n;
  return { customers, revenue, cost, profit: revenue - cost };
}

function averageStoreDays(rows: SimStoreDay[], runCount: number): SimStoreDay[] {
  const n = Math.max(1, runCount);
  const byPlace = new Map<string, SimStoreDay[]>();
  for (const row of rows) {
    byPlace.set(row.placeId, [...(byPlace.get(row.placeId) ?? []), row]);
  }
  return [...byPlace.entries()].map(([placeId, group], i) => ({
    rowId: group[0]?.rowId ?? i,
    dayId: group[0]?.dayId ?? 0,
    scenarioId: group[0]?.scenarioId ?? 0,
    placeId,
    customers: group.reduce((sum, r) => sum + r.customers, 0) / n,
    revenueCents: group.reduce((sum, r) => sum + r.revenueCents, 0) / n,
    costCents: group.reduce((sum, r) => sum + r.costCents, 0) / n,
  }));
}

function winCount(runs: number[], base: number) {
  return runs.filter((value) => value > base + 50).length;
}

function averageVisits(visits: SimVisit[], runCount: number): SimVisit[] {
  const n = Math.max(1, runCount);
  const groups = new Map<string, SimVisit[]>();
  for (const visit of visits) {
    const key = `${visit.agentId}|${visit.placeId}`;
    groups.set(key, [...(groups.get(key) ?? []), visit]);
  }
  return [...groups.values()]
    .map((group) => {
      const best = [...group].sort((a, b) => b.chance - a.chance)[0];
      return {
        ...best,
        chance: group.reduce((sum, visit) => sum + visit.chance, 0) / n,
        customers: group.reduce((sum, visit) => sum + visit.customers, 0) / n,
      };
    })
    .filter((visit) => visit.chance > 0.001);
}

function changeClass(value: number) {
  return Math.abs(value) < 0.5 ? "flat" : value > 0 ? "up" : "down";
}

function shortDate(date: string) {
  return new Date(`${date}T12:00:00Z`).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

function visitKey(visit: SimVisit) {
  return `${visit.chance.toFixed(2)}|${visit.itemsJson}`;
}

function groupOf(agent: CustomerAgent | undefined, visit?: SimVisit) {
  if (agent && agent.representsCustomers > 0) {
    return Math.max(1, Math.round(agent.representsCustomers));
  }
  if (visit && visit.chance > 0.001) {
    return Math.max(1, Math.round(visit.customers / visit.chance));
  }
  return Math.max(1, Math.round(visit?.customers ?? 1));
}

function peopleCount(chance: number, group: number) {
  return Math.round(group * chance);
}

function comingLine(chance: number, group: number) {
  const n = peopleCount(chance, group);
  if (n <= 0) return `None of the ${group} similar people come in`;
  if (n >= group) return `All ${group} similar people come in`;
  return `About ${n} of ${group} similar people come in`;
}

export type SimHandle = {
  runDay: (runs: number) => Promise<{ day: number }>;
  openDay: (day: number) => void;
};

function sleep(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function itemNames(visit: SimVisit) {
  try {
    const items = JSON.parse(visit.itemsJson) as unknown;
    return Array.isArray(items) ? items.map(String).filter(Boolean) : [];
  } catch {
    return [];
  }
}

export default function Timeline({
  stores,
  ownPlaceId,
  agents,
  scenarioId,
  ensemble,
  scenarioName,
  running,
  jobMessage,
  radiusKm,
  onError,
  onLiveTrips,
  onDayOpen,
  simRef,
}: {
  stores: Business[];
  ownPlaceId: string;
  agents: readonly CustomerAgent[];
  // 0 is the base universe
  scenarioId: number;
  ensemble: boolean;
  scenarioName: string;
  running: boolean;
  jobMessage: string;
  radiusKm: number;
  onError: (error: unknown) => void;
  onLiveTrips?: (trips: MapTrip[], jobId: number) => void;
  onDayOpen?: () => void;
  simRef?: MutableRefObject<SimHandle | null>;
}) {
  const startAgentDay = useReducer(reducers.startAgentDay);
  const resetTimeline = useReducer(reducers.resetTimeline);
  const [days] = useTable(tables.sim_day);
  const [storeDays] = useTable(tables.sim_store_day);
  const [visits] = useTable(tables.sim_visit);
  const [agentJobs] = useTable(tables.agent_job);
  const [agentPlans] = useTable(tables.agent_plan);
  const [universeMenu] = useTable(tables.universe_menu);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [playHold, setPlayHold] = useState(false);
  const [showDots, setShowDots] = useState(false);
  const wasBusy = useRef(false);
  const agentBusy = agentJobs.some(
    (job) => job.status === "queued" || job.status === "running",
  );
  const latestJob = [...agentJobs].sort((a, b) =>
    Number(b.updatedAt.microsSinceUnixEpoch - a.updatedAt.microsSinceUnixEpoch),
  )[0];
  const liveJob =
    agentJobs.find(
      (job) => job.status === "running" && job.scenarioId === scenarioId,
    ) ??
    agentJobs.find(
      (job) => job.status === "queued" && job.scenarioId === scenarioId,
    ) ??
    agentJobs.find((job) => job.status === "running") ??
    agentJobs.find((job) => job.status === "queued") ??
    [...agentJobs]
      .filter((job) => job.scenarioId === scenarioId)
      .sort(
        (a, b) =>
          Number(
            b.updatedAt.microsSinceUnixEpoch - a.updatedAt.microsSinceUnixEpoch,
          ),
      )[0];
  const busy = running || agentBusy;
  const status = agentBusy
    ? latestJob?.message || "Agents are deciding..."
    : jobMessage;

  const comparing = scenarioId !== 0;
  const runsFor = (sid: number, dayNum: number) =>
    days
      .filter((d) => d.scenarioId === sid && d.day === dayNum)
      .sort((a, b) => a.dayId - b.dayId);
  const ownDayNums = [
    ...new Set(
      days.filter((d) => d.scenarioId === scenarioId).map((d) => d.day),
    ),
  ].sort((a, b) => a - b);
  const lastDay = ownDayNums[ownDayNums.length - 1] ?? 0;
  const shownDay =
    (agentBusy ? liveJob?.day : undefined) ?? lastDay + 1;

  useEffect(() => {
    setSelectedDay(lastDay || null);
    if (!lastDay) setDetailOpen(false);
  }, [lastDay, scenarioId]);

  const rowsFor = (dayId: number | undefined) =>
    storeDays.filter((r) => r.dayId === dayId);
  const ownTotals = (dayId: number | undefined) =>
    totalsOf(rowsFor(dayId).filter((r) => r.placeId === ownPlaceId));

  const timeline = ownDayNums.flatMap((dayNum) => {
    const runDays = runsFor(scenarioId, dayNum);
    const day = runDays[0];
    if (!day) return [];
    const base = ownTotals(runsFor(0, dayNum)[0]?.dayId);
    const scenario = comparing
      ? averageTotals(runDays.map((row) => ownTotals(row.dayId)))
      : base;
    return [{ day, runDays, base, scenario }];
  });
  const sum = (key: "base" | "scenario") =>
    timeline.reduce((total, t) => total + t[key].revenue, 0);
  const baseProfit = sum("base");
  const scenarioProfit = sum("scenario");

  const dayRuns = comparing && ensemble ? ENSEMBLE_RUNS : 1;
  const onSimulate = (count: number) => {
    setPlaying(false);
    setPlayHold(false);
    setShowDots(true);
    startAgentDay({ scenarioId, days: count, runs: dayRuns }).catch(onError);
  };
  const onPlay = () => {
    setPlaying(true);
    setShowDots(true);
    if (!busy && agents.length > 0 && !wasBusy.current)
      startAgentDay({ scenarioId, days: 1, runs: dayRuns }).catch(onError);
  };
  useEffect(() => {
    if (agentBusy) {
      wasBusy.current = true;
      setPlayHold(false);
      return;
    }
    if (!playing || running || agents.length === 0 || !wasBusy.current) {
      if (!playing) setPlayHold(false);
      return;
    }
    setPlayHold(true);
    const timer = window.setTimeout(() => {
      wasBusy.current = false;
      setPlayHold(false);
      startAgentDay({ scenarioId, days: 1, runs: dayRuns }).catch(onError);
    }, PLAY_HOLD_MS);
    return () => clearTimeout(timer);
  }, [agentBusy, playing, running, agents.length, scenarioId, dayRuns, startAgentDay, onError]);
  const onRestart = () => {
    const what = comparing
      ? `Clear the simulated days of "${scenarioName}"?`
      : "Clear every simulated day, in the base universe and in all scenarios?";
    if (window.confirm(what)) resetTimeline({ scenarioId }).catch(onError);
  };

  const lastDayRef = useRef(lastDay);
  lastDayRef.current = lastDay;
  const agentBusyRef = useRef(agentBusy);
  agentBusyRef.current = agentBusy;
  const scenarioIdRef = useRef(scenarioId);
  scenarioIdRef.current = scenarioId;
  const startAgentDayRef = useRef(startAgentDay);
  startAgentDayRef.current = startAgentDay;
  const agentsLenRef = useRef(agents.length);
  agentsLenRef.current = agents.length;
  const onDayOpenRef = useRef(onDayOpen);
  onDayOpenRef.current = onDayOpen;

  useEffect(() => {
    if (!simRef) return;
    simRef.current = {
      async runDay(runs: number) {
        if (agentsLenRef.current === 0) throw new Error("No customer agents yet");
        setPlaying(false);
        setPlayHold(false);
        setShowDots(true);
        const started = Date.now();
        while (agentBusyRef.current) {
          if (Date.now() - started > 300_000) throw new Error("Simulation timed out");
          await sleep(400);
        }
        const before = lastDayRef.current;
        await startAgentDayRef.current({
          scenarioId: scenarioIdRef.current,
          days: 1,
          runs: Math.min(5, Math.max(1, Math.round(runs) || 1)),
        });
        while (!agentBusyRef.current && lastDayRef.current <= before) {
          if (Date.now() - started > 60_000) throw new Error("Simulation did not start");
          await sleep(250);
        }
        while (agentBusyRef.current) {
          if (Date.now() - started > 300_000) throw new Error("Simulation timed out");
          await sleep(400);
        }
        if (lastDayRef.current <= before) throw new Error("The day did not save");
        return { day: lastDayRef.current };
      },
      openDay(day: number) {
        setMoreOpen(true);
        setSelectedDay(day);
        setDetailOpen(true);
        onDayOpenRef.current?.();
      },
    };
    return () => {
      simRef.current = null;
    };
  }, [simRef]);

  const selected = timeline.find((t) => t.day.day === selectedDay);
  const agentsById = new Map(agents.map((a) => [a.agentId, a]));
  const storesById = new Map(stores.map((s) => [s.placeId, s]));

  const baseDayForJob = days.find(
    (day) => day.scenarioId === 0 && day.day === liveJob?.day,
  );
  const liveVisits = useMemo(
    () =>
      liveVisitsForJob({
        job: liveJob,
        plans: agentPlans,
        agents,
        baseVisits: visits.filter((visit) => visit.dayId === baseDayForJob?.dayId),
      }),
    [liveJob, agentPlans, agents, visits, baseDayForJob?.dayId],
  );
  const liveTrips = useMemo(
    () => tripsFromVisits(liveVisits, agents, stores, ownPlaceId, radiusKm),
    [liveVisits, agents, stores, ownPlaceId, radiusKm],
  );
  const liveDayJobs = agentJobs.filter(
    (job) =>
      !!liveJob &&
      job.day === liveJob.day &&
      job.scenarioId === liveJob.scenarioId &&
      (job.status === "queued" || job.status === "running"),
  );

  const profitAt = (sid: number, day: number) => {
    const saved = runsFor(sid, day).map((row) => ownTotals(row.dayId).revenue);
    const live =
      liveJob &&
      agentBusy &&
      liveJob.day === day &&
      liveJob.scenarioId === sid
        ? liveDayJobs.map((job) => {
            const prices = new Map(
              universeMenu
                .filter(
                  (row) =>
                    row.scenarioId === sid &&
                    row.placeId === ownPlaceId &&
                    row.change !== "removed",
                )
                .map((row) => [row.name.toLowerCase(), row.priceCents]),
            );
            return liveOwnRevenue(
              liveVisitsForJob({
                job,
                plans: agentPlans,
                agents,
                baseVisits: visits.filter(
                  (visit) => visit.dayId === baseDayForJob?.dayId,
                ),
              }),
              ownPlaceId,
              (name) => prices.get(name.trim().toLowerCase()) ?? 0,
            );
          })
        : [];
    const values = [...saved, ...live];
    if (values.length === 0) return null;
    return values.reduce((sum, value) => sum + value, 0) / values.length;
  };
  const chartMaxDay = Math.max(lastDay, liveJob?.day ?? 0);
  const profitPoints = Array.from({ length: chartMaxDay }, (_, i) => {
    const day = i + 1;
    return {
      day,
      base: profitAt(0, day),
      scenario: comparing ? profitAt(scenarioId, day) : null,
    };
  });
  const liveProfit = comparing
    ? (profitAt(scenarioId, liveJob?.day ?? lastDay) ??
      profitAt(0, liveJob?.day ?? lastDay) ??
      0)
    : (profitAt(scenarioId, liveJob?.day ?? lastDay) ?? 0);

  const tripKey = `${liveJob?.jobId ?? 0}:${liveTrips
    .map((trip) => `${trip.id}:${trip.from[0].toFixed(5)}`)
    .join("|")}`;
  const sentTrips = useRef("");
  const onLiveTripsRef = useRef(onLiveTrips);
  onLiveTripsRef.current = onLiveTrips;
  useEffect(() => {
    if (!showDots || !agentBusy) return;
    if (sentTrips.current === tripKey) return;
    sentTrips.current = tripKey;
    onLiveTripsRef.current?.(liveTrips, liveJob?.jobId ?? 0);
  }, [showDots, agentBusy, tripKey, liveTrips, liveJob?.jobId]);
  useEffect(() => {
    return () => {
      onLiveTripsRef.current?.([], 0);
    };
  }, []);

  return (
    <div className="timeline">
      {moreOpen && (
        <div className="timeline-more">
      {(playing || agentBusy || profitPoints.length > 0) && (
        <div className="hourly">
          <div className="hourly-head">
            <strong>Your store's profit</strong>
            <span className="muted">
              {money(liveProfit)} today
              {liveJob
                ? ` · ${liveJob.agentsDone}/${liveJob.agentsTotal} decided${
                    liveDayJobs.length +
                      runsFor(liveJob.scenarioId, liveJob.day).length >
                    1
                      ? ` · ${runsFor(liveJob.scenarioId, liveJob.day).length} of ${
                          liveDayJobs.length +
                          runsFor(liveJob.scenarioId, liveJob.day).length
                        } runs`
                      : ""
                  }`
                : ""}
            </span>
          </div>
          <ProfitChart points={profitPoints} comparing={comparing} />
          <p className="muted small">
            Dots follow streets and fade when they arrive: red is your café,
            teal is a competitor. The line is daily profit at your store
            {comparing ? "; gray is base" : ""}
            {timeline.some((t) => t.runDays.length > 1)
              ? ". 5x days use the average"
              : ""}
            . The last point moves as people buy.
          </p>
        </div>
      )}

      {agents.length === 0 ? (
        <p className="muted">Create customer agents first.</p>
      ) : timeline.length === 0 ? (
        <p className="muted">No days simulated yet.</p>
      ) : (
        <>
          <div className="timeline-track">
            {timeline.map(({ day, runDays, base, scenario }) => {
              const change = scenario.revenue - base.revenue;
              const runRevenues = runDays.map((row) => ownTotals(row.dayId).revenue);
              return (
                <button
                  type="button"
                  key={day.day}
                  className={`day-chip ${day.day === selectedDay && detailOpen ? "selected" : ""}`}
                  onClick={() => {
                    setSelectedDay(day.day);
                    setDetailOpen(true);
                    onDayOpen?.();
                  }}
                >
                  <span className="day-label">
                    Day {day.day} · {day.weekday.slice(0, 3)}{" "}
                    {shortDate(day.date)}
                  </span>
                  <strong>{money(scenario.revenue)}</strong>
                  {comparing && (
                    <span className={`change ${changeClass(change / 100)}`}>
                      {signedMoney(change)} vs base
                    </span>
                  )}
                  <span className="muted">
                    {Math.round(scenario.customers)} customers
                    {runDays.length > 1 ? " · avg" : ""}
                  </span>
                  {runDays.length > 1 && (
                    <WinSquares
                      wins={winCount(runRevenues, base.revenue)}
                    />
                  )}
                </button>
              );
            })}
          </div>

          <p className="timeline-summary">
            Over {timeline.length} day{timeline.length === 1 ? "" : "s"}, your
            revenue is{" "}
            <strong>{money(comparing ? scenarioProfit : baseProfit)}</strong>
            {comparing && (
              <>
                {" "}
                in {scenarioName} vs <strong>{money(baseProfit)}</strong> in the
                base universe (
                <span
                  className={`change ${changeClass((scenarioProfit - baseProfit) / 100)}`}
                >
                  {signedMoney(scenarioProfit - baseProfit)}
                  {baseProfit > 0 &&
                    `, ${signed(((scenarioProfit - baseProfit) / baseProfit) * 100, 1)}%`}
                </span>
                )
              </>
            )}
            . Click a day to see who went where.
          </p>
        </>
      )}
        </div>
      )}

      {detailOpen &&
        selected &&
        createPortal(
          <div className="day-window">
            <div className="day-window-head">
              <div>
                <h3>
                  Day {selected.day.day} · {selected.day.weekday}{" "}
                  {shortDate(selected.day.date)}
                </h3>
                <p className="muted small">
                  {selected.runDays.length > 1
                    ? `Average of ${selected.runDays.length} independent runs. Green squares beat the base universe.`
                    : "Who visits your cafe today, who stays away, and why."}
                </p>
              </div>
              <button
                type="button"
                className="secondary"
                onClick={() => setDetailOpen(false)}
              >
                Close
              </button>
            </div>
            <DayDetail
              comparing={comparing}
              scenarioName={scenarioName}
              ownPlaceId={ownPlaceId}
              stores={stores}
              storesById={storesById}
              agentsById={agentsById}
              runRevenues={selected.runDays.map(
                (row) => ownTotals(row.dayId).revenue,
              )}
              base={{
                totals: selected.base,
                rows: rowsFor(runsFor(0, selected.day.day)[0]?.dayId),
                visits: visits.filter(
                  (v) => v.dayId === runsFor(0, selected.day.day)[0]?.dayId,
                ),
              }}
              scenario={{
                totals: selected.scenario,
                rows: averageStoreDays(
                  selected.runDays.flatMap((row) => rowsFor(row.dayId)),
                  selected.runDays.length,
                ),
                visits: averageVisits(
                  visits.filter((v) =>
                    selected.runDays.some((row) => row.dayId === v.dayId),
                  ),
                  selected.runDays.length,
                ),
              }}
            />
          </div>,
          document.body,
        )}

      {(busy || playHold) && (
        <p className="timeline-status">
          {busy && <span className="spinner" />}
          {playHold
            ? "Walk-in finishing, then the next day starts..."
            : status}
          {latestJob &&
            agentBusy &&
            ` (${latestJob.agentsDone}/${latestJob.agentsTotal})`}
        </p>
      )}

      <div className="timeline-bar">
        <button
          type="button"
          className="play-btn"
          aria-label={playing ? "Pause" : "Play"}
          title={
            playing
              ? "Pause"
              : dayRuns > 1
                ? "Play: each day runs five independent samples"
                : "Play"
          }
          onClick={playing ? () => setPlaying(false) : onPlay}
          disabled={agents.length === 0 || running}
        >
          {playing ? <PauseIcon /> : <PlayIcon />}
        </button>
        <button
          type="button"
          onClick={() => onSimulate(1)}
          disabled={busy || playHold || agents.length === 0}
          title={
            dayRuns > 1
              ? `Simulate day ${shownDay} with ${dayRuns} independent runs`
              : undefined
          }
        >
          Day {shownDay}
        </button>
        <button
          type="button"
          className="secondary"
          aria-expanded={moreOpen}
          onClick={() => setMoreOpen((open) => !open)}
        >
          {moreOpen ? "Less" : "More"}
        </button>
        {moreOpen && (
          <button
            type="button"
            className="danger timeline-restart"
            onClick={onRestart}
            disabled={busy || ownDayNums.length === 0}
          >
            Restart
          </button>
        )}
      </div>
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
  runRevenues,
  base,
  scenario,
}: {
  comparing: boolean;
  scenarioName: string;
  ownPlaceId: string;
  stores: Business[];
  storesById: Map<string, Business>;
  agentsById: Map<number, CustomerAgent>;
  runRevenues: number[];
  base: Universe;
  scenario: Universe;
}) {
  const shown = comparing ? scenario : base;
  const pnl: [string, keyof Totals, (v: number) => string][] = [
    ["Customers", "customers", (v) => Math.round(v).toLocaleString()],
    ["Revenue", "revenue", money],
  ];

  const storeRow = (u: Universe, placeId: string) =>
    totalsOf(u.rows.filter((r) => r.placeId === placeId));
  const marketCustomers = (u: Universe) =>
    u.rows.reduce((sum, r) => sum + r.customers, 0);

  const baseVisits = new Map(
    base.visits
      .filter((v) => v.placeId === ownPlaceId)
      .map((v) => [v.agentId, v]),
  );
  const visitChanged = (visit: SimVisit) =>
    comparing &&
    (!baseVisits.has(visit.agentId) ||
      visitKey(baseVisits.get(visit.agentId)!) !== visitKey(visit));
  const ownVisits = shown.visits
    .filter((v) => v.placeId === ownPlaceId)
    .sort(
      (a, b) =>
        Number(visitChanged(b)) - Number(visitChanged(a)) ||
        b.customers - a.customers,
    );
  // Agents who came to your store in the base universe but not in the scenario
  const lost = comparing
    ? [...baseVisits.values()].filter(
        (v) => !ownVisits.some((o) => o.agentId === v.agentId),
      )
    : [];

  const [view, setView] = useState<"store" | "all">("store");
  const plansOf = (u: Universe, agentId: number) =>
    u.visits
      .filter((v) => v.agentId === agentId)
      .sort((a, b) => b.chance - a.chance);
  const planKey = (visits: SimVisit[]) =>
    visits
      .map((v) => `${v.placeId}|${visitKey(v)}`)
      .sort()
      .join(";");
  const changedAgents = new Set(
    comparing
      ? [...agentsById.keys()].filter(
          (id) => planKey(plansOf(base, id)) !== planKey(plansOf(scenario, id)),
        )
      : [],
  );
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
                <tr
                  key={key}
                  className={key === "revenue" ? "total" : undefined}
                >
                  <td>{label}</td>
                  <td>{format(base.totals[key])}</td>
                  {comparing && (
                    <>
                      <td>{format(scenario.totals[key])}</td>
                      <td
                        className={`change ${changeClass(key === "customers" ? change : change / 100)}`}
                      >
                        {key === "customers"
                          ? signed(change)
                          : signedMoney(change)}
                      </td>
                    </>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
        <p className="muted small">
          This is ticket sales only. We do not subtract ingredient, rent, or
          labor costs.
        </p>
        {comparing && runRevenues.length > 1 && (
          <div className="ensemble">
            <div className="hourly-head">
              <strong>Runs vs base</strong>
              <span className="muted">
                {winCount(runRevenues, base.totals.revenue)} of {ENSEMBLE_RUNS}{" "}
                beat the base universe
              </span>
            </div>
            <WinSquares wins={winCount(runRevenues, base.totals.revenue)} />
          </div>
        )}

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
            {stores.map((s) => {
              const shownRow = storeRow(shown, s.placeId);
              const change =
                shownRow.customers - storeRow(base, s.placeId).customers;
              const total = marketCustomers(shown);
              return (
                <tr
                  key={s.placeId}
                  className={s.placeId === ownPlaceId ? "own-store" : undefined}
                >
                  <td>{s.name}</td>
                  <td>{Math.round(shownRow.customers)}</td>
                  {comparing && (
                    <td className={`change ${changeClass(change)}`}>
                      {signed(change)}
                    </td>
                  )}
                  <td>
                    {total
                      ? `${Math.round((shownRow.customers / total) * 100)}%`
                      : "–"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div>
        <div className="detail-tabs">
          <button
            type="button"
            className={view === "store" ? undefined : "secondary"}
            onClick={() => setView("store")}
          >
            Who came to you
          </button>
          <button
            type="button"
            className={view === "all" ? undefined : "secondary"}
            onClick={() => setView("all")}
          >
            Everyone
          </button>
        </div>
        <p className="muted small">
          Each name is a persona that stands for a group of similar people.
          “About 15 of 25 come in” means 15 visits, not a yes for the whole
          group.
          {comparing &&
            (changedAgents.size === 0
              ? ` Nobody switched because of ${scenarioName}'s menu.`
              : ` ${changedAgents.size} persona${changedAgents.size === 1 ? "" : "s"} changed plans vs the base universe.`)}
        </p>
        {view === "all" ? (
          <AllCustomers
            agents={[...agentsById.values()]}
            ownPlaceId={ownPlaceId}
            comparing={comparing}
            changedAgents={changedAgents}
            plansOf={plansOf}
            shown={shown}
            base={base}
            storesById={storesById}
          />
        ) : (
          <StoreCustomers
            comparing={comparing}
            ownVisits={ownVisits}
            lost={lost}
            baseVisits={baseVisits}
            scenario={scenario}
            agentsById={agentsById}
            storesById={storesById}
            visitChanged={visitChanged}
          />
        )}
      </div>
    </div>
  );
}

function ownStatus(
  visit: SimVisit,
  before: SimVisit | undefined,
  isNew: boolean,
): { label: string; kind: "come" | "more" | "fewer" | "new" | "away" } {
  if (isNew) return { label: "New", kind: "new" };
  if (before && visit.chance > before.chance + 0.02)
    return { label: "More coming", kind: "more" };
  if (before && visit.chance < before.chance - 0.02)
    return { label: "Fewer coming", kind: "fewer" };
  return { label: "Coming", kind: "come" };
}

function StoreCustomers({
  comparing,
  ownVisits,
  lost,
  baseVisits,
  scenario,
  agentsById,
  storesById,
  visitChanged,
}: {
  comparing: boolean;
  ownVisits: SimVisit[];
  lost: SimVisit[];
  baseVisits: Map<number, SimVisit>;
  scenario: Universe;
  agentsById: Map<number, CustomerAgent>;
  storesById: Map<string, Business>;
  visitChanged: (visit: SimVisit) => boolean;
}) {
  const newcomers = comparing
    ? ownVisits.filter((visit) => !baseVisits.has(visit.agentId))
    : [];
  const returning = ownVisits.filter(
    (visit) => !newcomers.some((row) => row.agentId === visit.agentId),
  );
  if (ownVisits.length === 0 && lost.length === 0) {
    return <p className="muted small">Nobody is likely to visit you today.</p>;
  }
  return (
    <div className="visit-groups">
      {returning.length > 0 && (
        <VisitSection
          title={`Coming to you · ${returning.length}`}
        >
          {returning.map((visit) => {
            const agent = agentsById.get(visit.agentId);
            const before = baseVisits.get(visit.agentId);
            const group = groupOf(agent, visit);
            return (
              <VisitCard
                key={visit.visitId}
                status={ownStatus(visit, before, false)}
                name={agent?.name ?? "Customer"}
                who={`${agent?.archetype ?? ""}${
                  agent && agent.placeId !== visit.placeId
                    ? ` · regular at ${storesById.get(agent.placeId)?.name}`
                    : ""
                }`}
                action={comingLine(visit.chance, group)}
                before={
                  comparing && before && before.chance !== visit.chance
                    ? `In the base universe, ${comingLine(before.chance, groupOf(agent, before)).toLowerCase()}`
                    : undefined
                }
                order={`${itemNames(visit).join(", ")} · ${money(visit.spendCents)} each`}
                why={visit.reason}
                className={visitChanged(visit) ? "changed" : undefined}
              />
            );
          })}
        </VisitSection>
      )}
      {newcomers.length > 0 && (
        <VisitSection title={`New to you · ${newcomers.length}`}>
          {newcomers.map((visit) => {
            const agent = agentsById.get(visit.agentId);
            const group = groupOf(agent, visit);
            return (
              <VisitCard
                key={visit.visitId}
                status={{ label: "New", kind: "new" }}
                name={agent?.name ?? "Customer"}
                who={`${agent?.archetype ?? ""}${
                  agent
                    ? ` · regular at ${storesById.get(agent.placeId)?.name}`
                    : ""
                }`}
                action={comingLine(visit.chance, group)}
                before="Did not visit you in the base universe"
                order={`${itemNames(visit).join(", ")} · ${money(visit.spendCents)} each`}
                why={visit.reason}
                className="changed"
              />
            );
          })}
        </VisitSection>
      )}
      {lost.length > 0 && (
        <VisitSection title={`Didn't come · ${lost.length}`}>
          {lost.map((visit) => {
            const agent = agentsById.get(visit.agentId);
            const group = groupOf(agent, visit);
            const elsewhere = scenario.visits
              .filter((row) => row.agentId === visit.agentId)
              .sort((a, b) => b.chance - a.chance);
            const dest = elsewhere
              .map((row) => storesById.get(row.placeId)?.name ?? "another cafe")
              .join(", ");
            return (
              <VisitCard
                key={`lost-${visit.visitId}`}
                status={{ label: "Didn't come", kind: "away" }}
                name={agent?.name ?? "Customer"}
                who={agent?.archetype ?? ""}
                action={`None of the ${group} similar people come in`}
                before={`In the base universe, ${comingLine(visit.chance, group).toLowerCase()}`}
                order={
                  dest
                    ? `Went to ${dest} instead`
                    : "Stayed home / skipped these cafes"
                }
                why={elsewhere[0]?.reason}
                className="lost"
              />
            );
          })}
        </VisitSection>
      )}
    </div>
  );
}

function AllCustomers({
  agents,
  ownPlaceId,
  comparing,
  changedAgents,
  plansOf,
  shown,
  base,
  storesById,
}: {
  agents: CustomerAgent[];
  ownPlaceId: string;
  comparing: boolean;
  changedAgents: Set<number>;
  plansOf: (u: Universe, agentId: number) => SimVisit[];
  shown: Universe;
  base: Universe;
  storesById: Map<string, Business>;
}) {
  const bucket = (agent: CustomerAgent) => {
    const visits = plansOf(shown, agent.agentId);
    if (visits.some((visit) => visit.placeId === ownPlaceId)) return "yours";
    if (visits.length > 0) return "rival";
    return "home";
  };
  const groups: { key: "yours" | "rival" | "home"; title: string }[] = [
    { key: "yours", title: "At your cafe" },
    { key: "rival", title: "At a competitor" },
    { key: "home", title: "Not going out" },
  ];
  return (
    <div className="visit-groups">
      {groups.map(({ key, title }) => {
        const rows = agents
          .filter((agent) => bucket(agent) === key)
          .sort(
            (a, b) =>
              Number(changedAgents.has(b.agentId)) -
                Number(changedAgents.has(a.agentId)) ||
              Number(b.placeId === ownPlaceId) -
                Number(a.placeId === ownPlaceId),
          );
        if (rows.length === 0) return null;
        return (
          <VisitSection key={key} title={`${title} · ${rows.length}`}>
            {rows.map((agent) => {
              const visits = plansOf(shown, agent.agentId);
              const changed = changedAgents.has(agent.agentId);
              const top = visits[0];
              const group = groupOf(agent, top);
              const status =
                key === "yours"
                  ? { label: "Coming", kind: "come" as const }
                  : key === "rival"
                    ? { label: "Elsewhere", kind: "rival" as const }
                    : { label: "Staying home", kind: "home" as const };
              return (
                <VisitCard
                  key={agent.agentId}
                  status={status}
                  name={agent.name}
                  who={`${agent.archetype} · regular at ${storesById.get(agent.placeId)?.name}`}
                  action={
                    top
                      ? `${comingLine(top.chance, group)} · ${storesById.get(top.placeId)?.name}`
                      : `None of the ${group} similar people visit these cafes`
                  }
                  order={
                    top
                      ? `${itemNames(top).join(", ")} · ${money(top.spendCents)} each`
                      : undefined
                  }
                  why={top?.reason}
                  before={
                    comparing && changed
                      ? `In the base universe: ${
                          plansOf(base, agent.agentId)[0]
                            ? `${comingLine(
                                plansOf(base, agent.agentId)[0].chance,
                                groupOf(agent, plansOf(base, agent.agentId)[0]),
                              )} · ${storesById.get(plansOf(base, agent.agentId)[0].placeId)?.name}`
                            : "they also stayed home"
                        }`
                      : undefined
                  }
                  className={changed ? "changed" : undefined}
                />
              );
            })}
          </VisitSection>
        );
      })}
    </div>
  );
}

function VisitSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <>
      <h4 className="visit-section">{title}</h4>
      <ul className="visit-list">{children}</ul>
    </>
  );
}

function VisitCard({
  status,
  name,
  who,
  action,
  order,
  why,
  before,
  className,
}: {
  status: {
    label: string;
    kind: "come" | "more" | "fewer" | "new" | "away" | "rival" | "home";
  };
  name: string;
  who: string;
  action: string;
  order?: string;
  why?: string;
  before?: string;
  className?: string;
}) {
  return (
    <li className={className}>
      <div className="visit-head">
        <span className={`visit-tag ${status.kind}`}>{status.label}</span>
        <strong>{name}</strong>
        {who && <span className="muted">{who}</span>}
      </div>
      <div>{action}</div>
      {order && <div className="muted">{order}</div>}
      {why && (
        <div className="visit-why">
          <span className="muted">Why: </span>
          {why}
        </div>
      )}
      {before && <div className="base-plan">{before}</div>}
    </li>
  );
}

function WinSquares({ wins }: { wins: number }) {
  const filled = Math.max(0, Math.min(ENSEMBLE_RUNS, wins));
  return (
    <span
      className="win-squares"
      aria-label={`${filled} of ${ENSEMBLE_RUNS} runs beat the base universe`}
    >
      {Array.from({ length: ENSEMBLE_RUNS }, (_, i) => (
        <span
          key={i}
          className={`win-sq ${i < filled ? "filled" : ""}`}
        />
      ))}
    </span>
  );
}

function ProfitChart({
  points,
  comparing,
}: {
  points: { day: number; base: number | null; scenario: number | null }[];
  comparing: boolean;
}) {
  if (points.length === 0) {
    return (
      <div className="profit-empty muted">Profit will plot as people buy.</div>
    );
  }
  const width = 360;
  const height = 120;
  const left = 40;
  const right = 8;
  const top = 10;
  const bottom = 22;
  const innerW = width - left - right;
  const innerH = height - top - bottom;
  const values = points.flatMap((point) =>
    [point.base, comparing ? point.scenario : null].filter(
      (value): value is number => value != null,
    ),
  );
  const maxY = Math.max(1, ...values);
  const x = (index: number) =>
    left + (points.length === 1 ? innerW / 2 : (index / (points.length - 1)) * innerW);
  const y = (value: number) => top + (1 - value / maxY) * innerH;
  const pathOf = (key: "base" | "scenario") =>
    points
      .map((point, index) => {
        const value = point[key];
        if (value == null) return null;
        return `${x(index)},${y(value)}`;
      })
      .filter((part): part is string => part != null)
      .map((part, i) => `${i === 0 ? "M" : "L"}${part}`)
      .join(" ");
  const ticks = [0, maxY / 2, maxY];
  return (
    <svg
      className="profit-chart"
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="Your store profit by day"
    >
      {ticks.map((tick) => (
        <g key={tick}>
          <line
            className="profit-grid"
            x1={left}
            x2={width - right}
            y1={y(tick)}
            y2={y(tick)}
          />
          <text className="profit-label" x={left - 4} y={y(tick) + 3} textAnchor="end">
            {money(tick)}
          </text>
        </g>
      ))}
      {comparing && pathOf("base") && (
        <path className="profit-line base" d={pathOf("base")} />
      )}
      <path
        className="profit-line yours"
        d={pathOf(comparing ? "scenario" : "base")}
      />
      {points.map((point, index) => {
        const value = comparing ? point.scenario : point.base;
        if (value == null) return null;
        return (
          <circle
            key={point.day}
            className="profit-dot yours"
            cx={x(index)}
            cy={y(value)}
            r="3"
          />
        );
      })}
      {points.map((point, index) => (
        <text
          key={`d${point.day}`}
          className="profit-label"
          x={x(index)}
          y={height - 6}
          textAnchor="middle"
        >
          {point.day}
        </text>
      ))}
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 5h4v14H6zm8 0h4v14h-4z" />
    </svg>
  );
}
