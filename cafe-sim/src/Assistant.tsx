import { useEffect, useRef, useState, type FormEvent, type RefObject } from "react";
import { reducers, tables } from "./module_bindings";
import { useReducer, useTable } from "spacetimedb/react";
import type { SimHandle } from "./Timeline";
import {
  assistantTurn,
  type ClaudeMessage,
  type ToolResult,
} from "./assistant/client";
import { toolLabel } from "./assistant/spec";
import {
  inspectDay,
  inspectMarket,
  inspectSuggestions,
  resolveMenuName,
} from "./assistant/snapshots";
import type { Business } from "./module_bindings/types";

export type AssistantStep =
  | { kind: "user"; text: string }
  | { kind: "tool"; name: string; label: string; status: "running" | "done" | "error"; detail?: string }
  | { kind: "answer"; headline: string; text: string };

function sleep(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function waitFor<T>(read: () => T | null | undefined, timeout = 20_000) {
  return new Promise<T>((resolve, reject) => {
    const start = Date.now();
    const tick = () => {
      const value = read();
      if (value != null) return resolve(value);
      if (Date.now() - start > timeout) return reject(new Error("Timed out"));
      window.setTimeout(tick, 200);
    };
    tick();
  });
}

function dollarsToCents(price: number) {
  const cents = Math.round(Number(price) * 100);
  if (!Number.isFinite(cents) || cents < 1 || cents > 10_000) return null;
  return cents;
}

export default function Assistant({
  store,
  scenarioId,
  setScenarioId,
  ensemble,
  simRef,
  onShowMenu,
  onError,
}: {
  store: Business;
  scenarioId: number;
  setScenarioId: (id: number) => void;
  ensemble: boolean;
  simRef: RefObject<SimHandle | null>;
  onShowMenu: () => void;
  onError: (error: unknown) => void;
}) {
  const createScenario = useReducer(reducers.createScenario);
  const setItemPrice = useReducer(reducers.setItemPrice);
  const addItem = useReducer(reducers.addItem);
  const removeItem = useReducer(reducers.removeItem);

  const [items] = useTable(tables.menu_item);
  const [scenarios] = useTable(tables.scenario);
  const [edits] = useTable(tables.scenario_edit);
  const [agents] = useTable(tables.customer_agent);
  const [businesses] = useTable(tables.business);
  const [competitors] = useTable(tables.competitor);
  const [days] = useTable(tables.sim_day);
  const [storeDays] = useTable(tables.sim_store_day);
  const [visits] = useTable(tables.sim_visit);

  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [busy, setBusy] = useState(false);
  const [steps, setSteps] = useState<AssistantStep[]>([]);
  const logRef = useRef<HTMLDivElement>(null);

  const scenarioIdRef = useRef(scenarioId);
  scenarioIdRef.current = scenarioId;
  const ensembleRef = useRef(ensemble);
  ensembleRef.current = ensemble;
  const itemsRef = useRef(items);
  itemsRef.current = items;
  const scenariosRef = useRef(scenarios);
  scenariosRef.current = scenarios;
  const editsRef = useRef(edits);
  editsRef.current = edits;
  const agentsRef = useRef(agents);
  agentsRef.current = agents;
  const businessesRef = useRef(businesses);
  businessesRef.current = businesses;
  const competitorsRef = useRef(competitors);
  competitorsRef.current = competitors;
  const daysRef = useRef(days);
  daysRef.current = days;
  const storeDaysRef = useRef(storeDays);
  storeDaysRef.current = storeDays;
  const visitsRef = useRef(visits);
  visitsRef.current = visits;

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
  }, [steps, busy]);

  const rivalStores = () =>
    competitorsRef.current
      .filter((link) => link.placeId === store.placeId)
      .map((link) => businessesRef.current.find((row) => row.placeId === link.competitorPlaceId))
      .filter((row): row is Business => !!row);

  const ownNames = () =>
    itemsRef.current
      .filter((item) => item.placeId === store.placeId)
      .map((item) => item.name)
      .concat(
        editsRef.current
          .filter((edit) => edit.scenarioId === scenarioIdRef.current && edit.kind === "add")
          .map((edit) => edit.name),
      );

  const snapshot = () => ({
    query: "",
    store,
    competitors: rivalStores(),
    items: itemsRef.current,
    edits: editsRef.current,
    agents: agentsRef.current,
    scenarios: scenariosRef.current,
    scenarioId: scenarioIdRef.current,
    businesses: businessesRef.current,
    days: daysRef.current,
    storeDays: storeDaysRef.current,
    visits: visitsRef.current,
  });

  const runTool = async (name: string, input: Record<string, unknown>) => {
    if (name === "inspect_market") {
      return inspectMarket({ ...snapshot(), query: String(input.query ?? "") });
    }
    if (name === "suggest_items") {
      return inspectSuggestions(snapshot());
    }
    if (name === "create_scenario") {
      const label = String(input.name ?? "").trim() || "Ask";
      const before = Math.max(0, ...scenariosRef.current.map((row) => row.scenarioId));
      await createScenario({ name: label });
      const created = await waitFor(
        () =>
          scenariosRef.current.find((row) => row.scenarioId > before) ?? null,
      );
      setScenarioId(created.scenarioId);
      await waitFor(() =>
        scenarioIdRef.current === created.scenarioId ? true : null,
      );
      onShowMenu();
      return { scenario_id: created.scenarioId, name: created.name };
    }
    if (name === "edit_menu") {
      const sid = scenarioIdRef.current;
      if (sid === 0) throw new Error("Create a scenario before editing the menu");
      onShowMenu();
      await sleep(50);
      const names = ownNames();
      const done: string[] = [];
      for (const row of (input.set_prices as { name?: string; price?: number }[] | undefined) ?? []) {
        const matched = resolveMenuName(String(row.name ?? ""), names);
        const cents = dollarsToCents(Number(row.price));
        if (!matched || cents == null)
          throw new Error(`Could not price “${row.name}”`);
        await setItemPrice({ scenarioId: sid, itemName: matched, priceCents: cents });
        done.push(`${matched} → $${(cents / 100).toFixed(2)}`);
      }
      for (const row of (input.add_items as { name?: string; section?: string; price?: number }[] | undefined) ?? []) {
        const cents = dollarsToCents(Number(row.price));
        const itemName = String(row.name ?? "").trim();
        if (!itemName || cents == null) throw new Error("Need a name and price to add an item");
        await addItem({
          scenarioId: sid,
          name: itemName,
          section: String(row.section ?? "").trim() || "New items",
          priceCents: cents,
        });
        done.push(`added ${itemName} $${(cents / 100).toFixed(2)}`);
      }
      for (const raw of (input.remove_items as string[] | undefined) ?? []) {
        const matched = resolveMenuName(String(raw), names);
        if (!matched) throw new Error(`“${raw}” is not on your menu`);
        await removeItem({ scenarioId: sid, itemName: matched });
        done.push(`removed ${matched}`);
      }
      if (done.length === 0) throw new Error("No menu edits in that call");
      return { scenario_id: sid, changes: done };
    }
    if (name === "run_day") {
      const sid = scenarioIdRef.current;
      if (sid === 0) throw new Error("Create a scenario before running a what-if day");
      const handle = simRef.current;
      if (!handle) throw new Error("Timeline is not ready");
      const ensembleOn = Boolean(input.ensemble) || ensembleRef.current;
      const result = await handle.runDay(ensembleOn ? 5 : 1);
      handle.openDay(result.day);
      return { ...result, ensemble: ensembleOn };
    }
    if (name === "inspect_day") {
      const day = input.day != null ? Number(input.day) : undefined;
      if (day) simRef.current?.openDay(day);
      else {
        const latest = Math.max(
          0,
          ...daysRef.current
            .filter((row) => row.scenarioId === scenarioIdRef.current)
            .map((row) => row.day),
        );
        if (latest) simRef.current?.openDay(latest);
      }
      return inspectDay({ ...snapshot(), day });
    }
    if (name === "finish") {
      return {
        headline: String(input.headline ?? ""),
        answer: String(input.answer ?? ""),
        open_day: input.open_day,
      };
    }
    throw new Error(`Unknown tool ${name}`);
  };

  const ask = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    setBusy(true);
    setSteps((rows) => [...rows, { kind: "user", text: trimmed }]);
    const messages: ClaudeMessage[] = [{ role: "user", content: trimmed }];
    try {
      for (let round = 0; round < 12; round++) {
        const reply = await assistantTurn(messages);
        const toolUses = reply.content.filter((block) => block.type === "tool_use");
        const textBlocks = reply.content
          .filter((block) => block.type === "text")
          .map((block) => block.text)
          .join("\n")
          .trim();
        if (toolUses.length === 0) {
          if (textBlocks) {
            setSteps((rows) => [
              ...rows,
              { kind: "answer", headline: "", text: textBlocks },
            ]);
          }
          return;
        }
        messages.push({ role: "assistant", content: reply.content });
        const results: ToolResult[] = [];
        for (const call of toolUses) {
          const label = toolLabel(call.name, call.input);
          setSteps((rows) => [
            ...rows,
            { kind: "tool", name: call.name, label, status: "running" },
          ]);
          try {
            const output = await runTool(call.name, call.input);
            const detail =
              call.name === "finish"
                ? String((output as { headline?: string }).headline ?? "")
                : JSON.stringify(output).slice(0, 180);
            setSteps((rows) =>
              rows.map((row, index) =>
                index === rows.length - 1 && row.kind === "tool"
                  ? { ...row, status: "done", detail }
                  : row,
              ),
            );
            if (call.name === "finish") {
              const finish = output as { headline: string; answer: string; open_day?: number };
              if (finish.open_day) simRef.current?.openDay(finish.open_day);
              setSteps((rows) => [
                ...rows,
                { kind: "answer", headline: finish.headline, text: finish.answer },
              ]);
              return;
            }
            results.push({
              type: "tool_result",
              tool_use_id: call.id,
              content: JSON.stringify(output),
            });
          } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            setSteps((rows) =>
              rows.map((row, index) =>
                index === rows.length - 1 && row.kind === "tool"
                  ? { ...row, status: "error", detail: message }
                  : row,
              ),
            );
            results.push({
              type: "tool_result",
              tool_use_id: call.id,
              content: JSON.stringify({ error: message }),
            });
          }
        }
        messages.push({ role: "user", content: results });
      }
      throw new Error("Stopped after too many steps");
    } catch (error) {
      onError(error);
      setSteps((rows) => [
        ...rows,
        {
          kind: "answer",
          headline: "Could not finish",
          text: error instanceof Error ? error.message : String(error),
        },
      ]);
    } finally {
      setBusy(false);
    }
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const text = question;
    setQuestion("");
    void ask(text);
  };

  return (
    <>
      <button
        type="button"
        className={`map-ask ${open ? "open" : ""}`}
        aria-pressed={open}
        onClick={() => setOpen((value) => !value)}
      >
        Ask
      </button>
      {open && (
        <aside className="assistant-panel" onClick={(e) => e.stopPropagation()}>
          <header>
            <strong>Ask Fork</strong>
            <button type="button" className="close" onClick={() => setOpen(false)} aria-label="Close assistant">
              ×
            </button>
          </header>
          <p className="muted small">
            Ask a what-if. It reads the market, edits a scenario, runs the day, and cites people.
          </p>
          <div className="assistant-log" ref={logRef}>
            {steps.length === 0 && (
              <p className="muted small">
                Try: Would a $1 oat-latte cut steal students from nearby cafes?
              </p>
            )}
            {steps.map((step, index) =>
              step.kind === "user" ? (
                <p key={index} className="assistant-user">
                  {step.text}
                </p>
              ) : step.kind === "tool" ? (
                <p key={index} className={`assistant-tool ${step.status}`}>
                  <span className="assistant-dot" />
                  {step.label}
                  {step.status === "error" && step.detail ? ` — ${step.detail}` : ""}
                </p>
              ) : (
                <div key={index} className="assistant-answer">
                  {step.headline && <strong>{step.headline}</strong>}
                  <p>{step.text}</p>
                </div>
              ),
            )}
            {busy && <p className="assistant-tool running"><span className="assistant-dot" />Working</p>}
          </div>
          <form className="assistant-form" onSubmit={onSubmit}>
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask a what-if"
              disabled={busy}
            />
            <button type="submit" disabled={busy || !question.trim()}>
              Go
            </button>
          </form>
        </aside>
      )}
    </>
  );
}
