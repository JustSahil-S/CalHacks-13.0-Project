import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import "./App.css";
import { procedures, reducers, tables } from "./module_bindings";
import {
  useProcedure,
  useReducer,
  useSpacetimeDB,
  useTable,
} from "spacetimedb/react";
import StoreMap from "./StoreMap";
import MenuPanel from "./MenuPanel";
import Timeline, { type SimHandle } from "./Timeline";
import Assistant from "./Assistant";
import type { MapTrip } from "./liveSim";

const MAX_RADIUS_KM = 2;
const COMPETITOR_LIMIT = 50;
const ENSEMBLE_KEY = "cafe-sim-ensemble";

function loadEnsemble(): Record<string, boolean> {
  try {
    const parsed = JSON.parse(localStorage.getItem(ENSEMBLE_KEY) ?? "{}") as unknown;
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as Record<string, boolean>)
      : {};
  } catch {
    return {};
  }
}

function ForkLogo({ className }: { className?: string }) {
  return (
    <p
      className={className ? `fork-logo ${className}` : "fork-logo"}
      aria-label="Fork"
    >
      fork<span className="fork-dot">.</span>
    </p>
  );
}

function errorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return message.replace(/^.*fatal error:\s*/, "");
}

function App() {
  const { isActive: connected } = useSpacetimeDB();
  const populateStore = useProcedure(procedures.populateStore);
  const clearStoreData = useReducer(reducers.clearStoreData);
  const fetchMenus = useProcedure(procedures.fetchMenus);
  const generateAllAgents = useProcedure(procedures.generateAllAgents);
  const createScenario = useReducer(reducers.createScenario);
  const renameScenario = useReducer(reducers.renameScenario);
  const deleteScenario = useReducer(reducers.deleteScenario);

  const [menuItems] = useTable(tables.menu_item);
  const [scenarios] = useTable(tables.scenario);
  const [scenarioEdits] = useTable(tables.scenario_edit);
  // 0 is the base universe: the real prices
  const [scenarioId, setScenarioId] = useState(0);
  const [selectNewScenarioAfter, setSelectNewScenarioAfter] = useState<
    number | null
  >(null);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [liveTrips, setLiveTrips] = useState<MapTrip[]>([]);
  const [liveStreamId, setLiveStreamId] = useState(0);

  const [businesses] = useTable(tables.business);
  const [competitorLinks] = useTable(tables.competitor);
  const [jobs] = useTable(tables.populate_job);
  const [agents] = useTable(tables.customer_agent);
  const [totalAgents, setTotalAgents] = useState(30);

  const [mapsUrl, setMapsUrl] = useState("");
  const [radiusKm, setRadiusKm] = useState(1);
  const [maxCompetitors, setMaxCompetitors] = useState(20);
  const [requestError, setRequestError] = useState("");
  const [onMap, setOnMap] = useState(true);
  const [ensembleById, setEnsembleById] = useState(loadEnsemble);
  const ensemble = scenarioId !== 0 && !!ensembleById[String(scenarioId)];
  const [renaming, setRenaming] = useState(false);
  const [draftName, setDraftName] = useState("");
  const skipRenameBlur = useRef(false);
  const simRef = useRef<SimHandle | null>(null);

  const job = jobs[0];
  const running = job?.status === "running";
  const store = businesses.find((b) => b.placeId === job?.placeId);
  const businessesById = new Map(businesses.map((b) => [b.placeId, b]));
  const competitors = competitorLinks
    .filter((link) => link.placeId === store?.placeId)
    .map((link) => ({
      link,
      business: businessesById.get(link.competitorPlaceId),
    }))
    .filter((row) => row.business)
    .sort((a, b) => a.link.distanceMeters - b.link.distanceMeters);

  const onLiveTrips = useCallback((trips: MapTrip[], jobId: number) => {
    setLiveTrips(trips);
    setLiveStreamId(jobId);
  }, []);

  const stopLiveSim = useCallback(() => {
    setLiveTrips([]);
    setLiveStreamId(0);
  }, []);

  const onPopulate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (
      businesses.length > 0 &&
      !window.confirm("This replaces all current store data. Continue?")
    )
      return;
    setRequestError("");
    try {
      await populateStore({
        mapsUrl: mapsUrl.trim(),
        radiusKm,
        maxCompetitors,
      });
      await fetchMenus();
      await generateAllAgents({ totalAgents });
      stopLiveSim();
      setOnMap(true);
    } catch (error) {
      setRequestError(errorMessage(error));
    }
  };

  const goToSetup = () => {
    setSelectedPlaceId(null);
    stopLiveSim();
    if (store?.mapsUrl) setMapsUrl(store.mapsUrl);
    if (job?.radiusKm) setRadiusKm(job.radiusKm);
    setOnMap(false);
  };

  // Reducers don't return ids, so a newly created scenario is selected once it shows up
  useEffect(() => {
    if (selectNewScenarioAfter === null) return;
    const created = scenarios.filter(
      (s) => s.scenarioId > selectNewScenarioAfter,
    );
    if (created.length === 0) return;
    setScenarioId(Math.max(...created.map((s) => s.scenarioId)));
    setSelectNewScenarioAfter(null);
  }, [scenarios, selectNewScenarioAfter]);

  useEffect(() => {
    if (scenarioId !== 0 && !scenarios.some((s) => s.scenarioId === scenarioId))
      setScenarioId(0);
  }, [scenarios, scenarioId]);

  useEffect(() => {
    setRenaming(false);
  }, [scenarioId]);

  const onCreateScenario = () => {
    setRequestError("");
    setSelectNewScenarioAfter(
      Math.max(0, ...scenarios.map((s) => s.scenarioId)),
    );
    createScenario({ name: `Scenario ${scenarios.length + 1}` }).catch(
      (error) => setRequestError(errorMessage(error)),
    );
  };

  const onStartRename = () => {
    const current = scenarios.find((s) => s.scenarioId === scenarioId);
    if (!current) return;
    skipRenameBlur.current = false;
    setDraftName(current.name);
    setRenaming(true);
  };

  const onCancelRename = () => {
    skipRenameBlur.current = true;
    setRenaming(false);
  };

  const onSaveRename = (event?: FormEvent) => {
    event?.preventDefault();
    if (skipRenameBlur.current) {
      skipRenameBlur.current = false;
      return;
    }
    skipRenameBlur.current = true;
    const current = scenarios.find((s) => s.scenarioId === scenarioId);
    const name = draftName.trim().replace(/\s+/g, " ");
    setRenaming(false);
    if (!current || !name || name === current.name) return;
    setRequestError("");
    renameScenario({ scenarioId, name }).catch((error) =>
      setRequestError(errorMessage(error)),
    );
  };

  const onToggleEnsemble = () => {
    if (scenarioId === 0) return;
    setEnsembleById((prev) => {
      const next = {
        ...prev,
        [String(scenarioId)]: !prev[String(scenarioId)],
      };
      localStorage.setItem(ENSEMBLE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const onDeleteScenario = () => {
    const current = scenarios.find((s) => s.scenarioId === scenarioId);
    if (
      !current ||
      !window.confirm(`Delete "${current.name}" and all its changes?`)
    )
      return;
    deleteScenario({ scenarioId }).catch((error) =>
      setRequestError(errorMessage(error)),
    );
  };

  const onClear = () => {
    if (
      !window.confirm(
        "Delete all stores, competitors, reviews, agents and menus?",
      )
    )
      return;
    setRequestError("");
    clearStoreData().catch((error) => setRequestError(errorMessage(error)));
  };

  if (!connected) {
    return (
      <main className="App setup-view">
        <div className="setup-card">
          <h1>Connecting...</h1>
        </div>
      </main>
    );
  }

  const statusBanner = (job?.message || requestError) && (
    <p
      className={`status ${requestError || job?.status === "error" ? "error" : job?.status}`}
    >
      {running && <span className="spinner" />}
      {requestError || job?.message}
    </p>
  );

  if (store && onMap) {
    return (
      <main className="App sim-view">
        <div className={`sim-stage ${selectedPlaceId ? "has-menu" : ""}`}>
          <StoreMap
            store={store}
            competitors={competitors.map(({ link, business }) => ({
              business: business!,
              distanceMeters: link.distanceMeters,
            }))}
            radiusKm={job?.radiusKm || radiusKm}
            selectedId={selectedPlaceId}
            onSelect={setSelectedPlaceId}
            trips={liveTrips}
            streamId={liveStreamId}
            overlay={
              selectedPlaceId &&
              businessesById.get(selectedPlaceId) && (
                <MenuPanel
                  business={businessesById.get(selectedPlaceId)!}
                  distanceMeters={
                    competitors.find(
                      (c) => c.business?.placeId === selectedPlaceId,
                    )?.link.distanceMeters
                  }
                  items={menuItems.filter((i) => i.placeId === selectedPlaceId)}
                  edits={scenarioEdits.filter(
                    (e) => e.scenarioId === scenarioId,
                  )}
                  isOwnStore={selectedPlaceId === store.placeId}
                  scenarioId={scenarioId}
                  onCreateScenario={onCreateScenario}
                  onClose={() => setSelectedPlaceId(null)}
                  onError={(error) => setRequestError(errorMessage(error))}
                />
              )
            }
          />
          <div className="map-hud-top">
            <div className="hud-store">
              <ForkLogo className="hud-logo" />
              <a href={store.mapsUrl} target="_blank" rel="noreferrer">
                {store.name}
              </a>
              <span className="muted">
                {store.rating.toFixed(1)}★ · {competitors.length} competitors
                within {job?.radiusKm || radiusKm} km
              </span>
            </div>
            <div className="scenario-bar">
              {renaming ? (
                <form className="scenario-rename" onSubmit={onSaveRename}>
                  <input
                    value={draftName}
                    onChange={(e) => setDraftName(e.target.value)}
                    onBlur={() => onSaveRename()}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") onCancelRename();
                    }}
                    maxLength={60}
                    aria-label="Scenario name"
                    autoFocus
                  />
                  <button type="submit">Save</button>
                </form>
              ) : (
                <select
                  value={scenarioId}
                  onChange={(e) => setScenarioId(Number(e.target.value))}
                  aria-label="Scenario"
                >
                  <option value={0}>Base (real prices)</option>
                  {scenarios.map((s) => (
                    <option key={s.scenarioId} value={s.scenarioId}>
                      {s.name}
                    </option>
                  ))}
                </select>
              )}
              {scenarioId !== 0 && !renaming && (
                <button
                  type="button"
                  className="secondary edit-name"
                  aria-label="Edit name"
                  title="Edit name"
                  onClick={onStartRename}
                >
                  <EditNameIcon />
                </button>
              )}
              <button type="button" onClick={onCreateScenario}>
                New scenario
              </button>
              {scenarioId !== 0 && (
                <>
                  <button
                    type="button"
                    className={ensemble ? undefined : "secondary"}
                    aria-pressed={ensemble}
                    title={
                      ensemble
                        ? "5x is on: Play and Day run five independent samples and average them"
                        : "5x is off: Play and Day run one sample"
                    }
                    onClick={onToggleEnsemble}
                  >
                    5x
                  </button>
                </>
              )}
              {scenarioId !== 0 && (
                <button
                  type="button"
                  className="danger"
                  onClick={onDeleteScenario}
                >
                  Delete
                </button>
              )}
              <button
                type="button"
                className={
                  selectedPlaceId === store.placeId ? "danger-fill" : "danger"
                }
                title={`Show ${store.name}'s menu`}
                onClick={() =>
                  setSelectedPlaceId((id) =>
                    id === store.placeId ? null : store.placeId,
                  )
                }
              >
                Menu
              </button>
            </div>
            {(requestError || job?.status === "error") && statusBanner}
          </div>
          <button
            type="button"
            className="map-setup"
            onClick={goToSetup}
          >
            Setup
          </button>
          <Assistant
            store={store}
            scenarioId={scenarioId}
            setScenarioId={setScenarioId}
            ensemble={ensemble}
            simRef={simRef}
            onShowMenu={() => setSelectedPlaceId(store.placeId)}
            onError={(error) => setRequestError(errorMessage(error))}
          />
          <div className="map-hud-bottom">
            <Timeline
              stores={[store, ...competitors.map(({ business }) => business!)]}
              ownPlaceId={store.placeId}
              agents={agents}
              scenarioId={scenarioId}
              ensemble={ensemble}
              scenarioName={
                scenarios.find((s) => s.scenarioId === scenarioId)?.name ??
                "Base"
              }
              running={running}
              jobMessage={job?.message ?? ""}
              radiusKm={job?.radiusKm || radiusKm}
              onError={(error) => setRequestError(errorMessage(error))}
              onLiveTrips={onLiveTrips}
              onDayOpen={() => setSelectedPlaceId(null)}
              simRef={simRef}
            />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="App setup-view">
      <div className="setup-card">
        <header>
          <ForkLogo className="setup-logo" />
          <h1>Open a cafe</h1>
          <p className="muted">
            Paste a Google Maps link. We load nearby shops, menus, and customer
            agents from reviews.
          </p>
        </header>
        <form className="controls" onSubmit={onPopulate}>
          <label className="field">
            <span>Google Maps link</span>
            <input
              type="url"
              placeholder="https://www.google.com/maps/place/..."
              value={mapsUrl}
              onChange={(e) => setMapsUrl(e.target.value)}
              disabled={running}
              required
            />
          </label>
          <label className="field">
            <span>
              Competitor radius: <strong>{radiusKm.toFixed(1)} km</strong>
            </span>
            <input
              type="range"
              min={0.1}
              max={MAX_RADIUS_KM}
              step={0.1}
              value={radiusKm}
              onChange={(e) => setRadiusKm(Number(e.target.value))}
              disabled={running}
            />
          </label>
          <div className="radius-row">
            <label className="field grow">
              <span>Max competitors</span>
              <NumberField
                min={1}
                max={COMPETITOR_LIMIT}
                value={maxCompetitors}
                onChange={setMaxCompetitors}
                disabled={running}
              />
            </label>
            <label className="field grow">
              <span>Agents</span>
              <NumberField
                min={1}
                max={200}
                value={totalAgents}
                onChange={setTotalAgents}
                disabled={running}
              />
            </label>
          </div>
          {(requestError || running || job?.status === "error") && statusBanner}
          <div className="actions">
            <button type="submit" disabled={running || !mapsUrl.trim()}>
              {running ? "Loading..." : store ? "Reload store" : "Open map"}
            </button>
            {store && (
              <button
                type="button"
                className="secondary"
                onClick={() => setOnMap(true)}
                disabled={running}
              >
                Back to map
              </button>
            )}
          </div>
          {businesses.length > 0 && (
            <button
              type="button"
              className="setup-clear"
              onClick={onClear}
              disabled={running}
            >
              Clear saved data
            </button>
          )}
        </form>
      </div>
    </main>
  );
}

// Keeps the typed text as-is while editing (empty, partial) and only clamps on blur
function NumberField({
  min,
  max,
  value,
  onChange,
  disabled,
}: {
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}) {
  const [draft, setDraft] = useState(String(value));
  useEffect(() => setDraft(String(value)), [value]);
  const clamp = (text: string) =>
    Math.min(max, Math.max(min, Math.round(Number(text)) || min));
  return (
    <input
      type="number"
      inputMode="numeric"
      min={min}
      max={max}
      step={1}
      value={draft}
      onChange={(e) => {
        setDraft(e.target.value);
        const n = Number(e.target.value);
        if (e.target.value !== "" && Number.isFinite(n) && n >= min && n <= max)
          onChange(Math.round(n));
      }}
      onBlur={() => {
        const next = clamp(draft);
        setDraft(String(next));
        onChange(next);
      }}
      disabled={disabled}
    />
  );
}

function EditNameIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M4 20h4.2L18.6 9.6l-4.2-4.2L4 15.8V20zm14.8-12.2 1.6-1.6c.5-.5.5-1.3 0-1.8l-2.4-2.4c-.5-.5-1.3-.5-1.8 0l-1.6 1.6 4.2 4.2z"
        fill="currentColor"
      />
    </svg>
  );
}

export default App;
