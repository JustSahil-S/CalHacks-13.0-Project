import { scenarioMenu } from "../scenarioMenu";
import { nameSimilarity, suggestMenuGaps } from "../itemTrends";
import type {
  Business,
  CustomerAgent,
  MenuItem,
  Scenario,
  ScenarioEdit,
  SimDay,
  SimStoreDay,
  SimVisit,
} from "../module_bindings/types";

function dollars(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

function money(cents: number) {
  const value = Math.round(cents / 100);
  return `${value < 0 ? "-" : ""}$${Math.abs(value).toLocaleString()}`;
}

export function resolveMenuName(query: string, names: string[]) {
  const needle = query.trim().toLowerCase();
  if (!needle) return null;
  const exact = names.find((name) => name.toLowerCase() === needle);
  if (exact) return exact;
  const scored = names
    .map((name) => ({
      name,
      score:
        name.toLowerCase().includes(needle) || needle.includes(name.toLowerCase())
          ? 0.7 + nameSimilarity(query, name)
          : nameSimilarity(query, name),
    }))
    .filter((row) => row.score >= 0.28)
    .sort((a, b) => b.score - a.score);
  return scored[0]?.name ?? null;
}

function matchesQuery(text: string, query: string) {
  if (!query) return true;
  const hay = text.toLowerCase();
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => word.length > 2)
    .some((word) => hay.includes(word));
}

export function inspectMarket(args: {
  query?: string;
  store: Business;
  competitors: Business[];
  items: MenuItem[];
  edits: ScenarioEdit[];
  agents: CustomerAgent[];
  scenarios: Scenario[];
  scenarioId: number;
}) {
  const query = args.query?.trim() ?? "";
  const own = scenarioMenu(
    args.items.filter((item) => item.placeId === args.store.placeId),
    args.edits.filter((edit) => edit.scenarioId === args.scenarioId),
  );
  const scenario =
    args.scenarioId === 0
      ? "Base (real prices)"
      : args.scenarios.find((row) => row.scenarioId === args.scenarioId)?.name ??
        `Scenario ${args.scenarioId}`;
  const menu = own
    .filter((row) => !query || matchesQuery(`${row.name} ${row.section}`, query))
    .slice(0, 40)
    .map((row) => ({
      name: row.name,
      section: row.section,
      price: dollars(row.price),
      status: row.status,
    }));
  const rivals = args.competitors.slice(0, 12).map((rival) => {
    const items = args.items
      .filter((item) => item.placeId === rival.placeId)
      .filter((item) => !query || matchesQuery(`${item.name} ${item.section}`, query))
      .slice(0, query ? 8 : 3)
      .map((item) => `${item.name} ${dollars(item.overridePriceCents ?? item.predictedPriceCents)}`);
    return { name: rival.name, items };
  });
  const people = args.agents
    .filter(
      (agent) =>
        !query ||
        matchesQuery(
          `${agent.name} ${agent.archetype} ${agent.typicalOrder} ${agent.backstory}`,
          query,
        ),
    )
    .sort((a, b) => b.representsCustomers - a.representsCustomers)
    .slice(0, 18)
    .map((agent) => ({
      name: agent.name,
      archetype: agent.archetype,
      regular: args.competitors.concat(args.store).find((row) => row.placeId === agent.placeId)
        ?.name,
      stands_for: Math.round(agent.representsCustomers),
      typical: agent.typicalOrder.slice(0, 80),
      price_sensitivity: Number(agent.priceSensitivity.toFixed(2)),
    }));
  return {
    cafe: args.store.name,
    scenario,
    scenario_id: args.scenarioId,
    editable: args.scenarioId !== 0,
    menu,
    rivals,
    people,
  };
}

export function inspectSuggestions(args: {
  store: Business;
  items: MenuItem[];
  agents: CustomerAgent[];
  edits: ScenarioEdit[];
  scenarioId: number;
  businesses: Business[];
}) {
  const namesByPlace = new Map(args.businesses.map((row) => [row.placeId, row.name]));
  const catalog = args.items.map((item) => ({
    placeId: item.placeId,
    storeName: namesByPlace.get(item.placeId) ?? item.placeId,
    name: item.name,
    section: item.section,
    priceCents: item.overridePriceCents ?? item.predictedPriceCents,
  }));
  const profiles = args.agents.map((agent) => ({
    agentId: agent.agentId,
    placeId: agent.placeId,
    name: agent.name,
    archetype: agent.archetype,
    backstory: agent.backstory,
    typicalOrder: agent.typicalOrder,
    priceSensitivity: agent.priceSensitivity,
    foodWeight: agent.foodWeight,
    representsCustomers: agent.representsCustomers,
  }));
  const ownNames = scenarioMenu(
    args.items.filter((item) => item.placeId === args.store.placeId),
    args.edits.filter((edit) => edit.scenarioId === args.scenarioId),
  ).map((row) => row.name);
  return suggestMenuGaps(args.store.placeId, ownNames, catalog, profiles, 5).map((row) => ({
    name: row.name,
    price: dollars(row.priceCents),
    why: row.why,
  }));
}

function totals(rows: SimStoreDay[]) {
  return {
    customers: rows.reduce((sum, row) => sum + row.customers, 0),
    revenue: rows.reduce((sum, row) => sum + row.revenueCents, 0),
  };
}

function average(rows: { customers: number; revenue: number }[]) {
  const n = rows.length || 1;
  return {
    customers: rows.reduce((sum, row) => sum + row.customers, 0) / n,
    revenue: rows.reduce((sum, row) => sum + row.revenue, 0) / n,
  };
}

function comingLine(chance: number, group: number) {
  const n = Math.round(group * chance);
  if (n <= 0) return `none of ${group}`;
  if (n >= group) return `all ${group}`;
  return `about ${n} of ${group}`;
}

function itemNames(visit: SimVisit) {
  try {
    const items = JSON.parse(visit.itemsJson) as unknown;
    return Array.isArray(items) ? items.map(String) : [];
  } catch {
    return [];
  }
}

export function inspectDay(args: {
  day?: number;
  store: Business;
  businesses: Business[];
  agents: CustomerAgent[];
  scenarioId: number;
  days: SimDay[];
  storeDays: SimStoreDay[];
  visits: SimVisit[];
}) {
  const own = args.store.placeId;
  const dayNums = [
    ...new Set(
      args.days.filter((row) => row.scenarioId === args.scenarioId).map((row) => row.day),
    ),
  ].sort((a, b) => a - b);
  const dayNum = args.day && dayNums.includes(args.day) ? args.day : dayNums.at(-1);
  if (!dayNum) return { error: "No simulated days yet" };

  const runDays = args.days
    .filter((row) => row.scenarioId === args.scenarioId && row.day === dayNum)
    .sort((a, b) => a.dayId - b.dayId);
  const baseDays = args.days.filter((row) => row.scenarioId === 0 && row.day === dayNum);
  const scenarioTotals = average(
    runDays.map((row) =>
      totals(args.storeDays.filter((line) => line.dayId === row.dayId && line.placeId === own)),
    ),
  );
  const baseTotals = average(
    baseDays.map((row) =>
      totals(args.storeDays.filter((line) => line.dayId === row.dayId && line.placeId === own)),
    ),
  );
  const delta = scenarioTotals.revenue - baseTotals.revenue;
  const wins = runDays.filter((row) => {
    const revenue = totals(
      args.storeDays.filter((line) => line.dayId === row.dayId && line.placeId === own),
    ).revenue;
    return revenue > baseTotals.revenue + 50;
  }).length;

  const scenarioVisits = runDays.flatMap((row) =>
    args.visits.filter((visit) => visit.dayId === row.dayId && visit.placeId === own),
  );
  const baseVisits = baseDays.flatMap((row) =>
    args.visits.filter((visit) => visit.dayId === row.dayId && visit.placeId === own),
  );
  const baseByAgent = new Map(baseVisits.map((visit) => [visit.agentId, visit]));
  const ownByAgent = new Map(scenarioVisits.map((visit) => [visit.agentId, visit]));
  const agentsById = new Map(args.agents.map((agent) => [agent.agentId, agent]));
  const nameOf = (placeId: string) =>
    args.businesses.find((row) => row.placeId === placeId)?.name ?? placeId;

  const card = (visit: SimVisit, extra?: string) => {
    const agent = agentsById.get(visit.agentId);
    const group = Math.max(1, Math.round(agent?.representsCustomers || visit.customers / Math.max(visit.chance, 0.01)));
    return {
      name: agent?.name ?? "Customer",
      archetype: agent?.archetype ?? "",
      regular: agent ? nameOf(agent.placeId) : "",
      coming: comingLine(visit.chance, group),
      order: itemNames(visit).slice(0, 3).join(", "),
      why: visit.reason,
      extra,
    };
  };

  const newcomers = [...ownByAgent.values()]
    .filter((visit) => !baseByAgent.has(visit.agentId))
    .sort((a, b) => b.customers - a.customers)
    .slice(0, 8)
    .map((visit) => card(visit, "did not visit you in the base universe"));
  const lost = [...baseByAgent.values()]
    .filter((visit) => !ownByAgent.has(visit.agentId))
    .sort((a, b) => b.customers - a.customers)
    .slice(0, 8)
    .map((visit) => card(visit, "came in the base universe, not in this run"));
  const changed = [...ownByAgent.values()]
    .filter((visit) => {
      const before = baseByAgent.get(visit.agentId);
      return before && Math.abs(before.chance - visit.chance) > 0.02;
    })
    .sort((a, b) => b.customers - a.customers)
    .slice(0, 8)
    .map((visit) => {
      const before = baseByAgent.get(visit.agentId)!;
      const agent = agentsById.get(visit.agentId);
      const group = Math.max(1, Math.round(agent?.representsCustomers || 1));
      return card(
        visit,
        `base was ${comingLine(before.chance, group)}`,
      );
    });

  return {
    day: dayNum,
    date: runDays[0]?.date,
    weekday: runDays[0]?.weekday,
    runs: runDays.length,
    revenue: money(scenarioTotals.revenue),
    vs_base: `${delta >= 0 ? "+" : ""}${money(delta)}`,
    customers: Math.round(scenarioTotals.customers),
    wins_vs_base: runDays.length > 1 ? `${wins} of ${runDays.length} runs beat base` : undefined,
    new_to_you: newcomers,
    didnt_come: lost,
    changed,
  };
}
