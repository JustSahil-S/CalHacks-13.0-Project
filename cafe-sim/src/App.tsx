import { useState, type FormEvent } from 'react';
import './App.css';
import { procedures, reducers, tables } from './module_bindings';
import { useProcedure, useReducer, useSpacetimeDB, useTable } from 'spacetimedb/react';
import StoreMap from './StoreMap';

const MAX_RADIUS_KM = 2;
const COMPETITOR_LIMIT = 50;

function formatDistance(meters: number) {
  return meters < 1000 ? `${Math.round(meters)} m` : `${(meters / 1000).toFixed(2)} km`;
}

function errorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return message.replace(/^.*fatal error:\s*/, '');
}

function App() {
  const { isActive: connected } = useSpacetimeDB();
  const populateStore = useProcedure(procedures.populateStore);
  const clearStoreData = useReducer(reducers.clearStoreData);
  const generateAllAgents = useProcedure(procedures.generateAllAgents);

  const [businesses, businessesReady] = useTable(tables.business);
  const [competitorLinks] = useTable(tables.competitor);
  const [jobs] = useTable(tables.populate_job);
  const [reviews] = useTable(tables.review);
  const loadedReviews = new Map<string, number>();
  for (const review of reviews) loadedReviews.set(review.placeId, (loadedReviews.get(review.placeId) ?? 0) + 1);
  const [agents] = useTable(tables.customer_agent);
  const agentCounts = new Map<string, number>();
  for (const agent of agents) agentCounts.set(agent.placeId, (agentCounts.get(agent.placeId) ?? 0) + 1);
  const [totalAgents, setTotalAgents] = useState(30);

  const [mapsUrl, setMapsUrl] = useState('');
  const [radiusKm, setRadiusKm] = useState(1);
  const [maxCompetitors, setMaxCompetitors] = useState(20);
  const [requestError, setRequestError] = useState('');

  const job = jobs[0];
  const running = job?.status === 'running';
  const store = businesses.find(b => b.placeId === job?.placeId);
  const businessesById = new Map(businesses.map(b => [b.placeId, b]));
  const competitors = competitorLinks
    .filter(link => link.placeId === store?.placeId)
    .map(link => ({ link, business: businessesById.get(link.competitorPlaceId) }))
    .filter(row => row.business)
    .sort((a, b) => a.link.distanceMeters - b.link.distanceMeters);

  // The selected store's agents are listed first, then stores with the most reviews
  const storeRank = (placeId: string) =>
    placeId === store?.placeId ? Number.MAX_SAFE_INTEGER : businessesById.get(placeId)?.reviewsCount ?? 0;

  const onPopulate = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (businesses.length > 0 && !window.confirm('This replaces all current store data. Continue?')) return;
    setRequestError('');
    populateStore({ mapsUrl: mapsUrl.trim(), radiusKm, maxCompetitors }).catch(error => setRequestError(errorMessage(error)));
  };

  const onCreateAgents = () => {
    if (agents.length > 0 && !window.confirm('This replaces the current agents. Continue?')) return;
    setRequestError('');
    generateAllAgents({ totalAgents }).catch(error => setRequestError(errorMessage(error)));
  };

  const onClear = () => {
    if (!window.confirm('Delete all stores, competitors, reviews and agents?')) return;
    setRequestError('');
    clearStoreData().catch(error => setRequestError(errorMessage(error)));
  };

  if (!connected) {
    return (
      <main className="App">
        <h1>Connecting...</h1>
      </main>
    );
  }

  return (
    <main className="App">
      <header>
        <h1>Store &amp; Competitor Finder</h1>
        <p className="muted">Paste a Google Maps link to load the store and every cafe, tea or drink shop around it.</p>
      </header>

      <form className="card controls" onSubmit={onPopulate}>
        <label className="field">
          <span>Google Maps link</span>
          <input
            type="url"
            placeholder="https://www.google.com/maps/place/..."
            value={mapsUrl}
            onChange={e => setMapsUrl(e.target.value)}
            disabled={running}
            required
          />
        </label>

        <div className="radius-row">
          <label className="field grow">
            <span>
              Competitor radius: <strong>{radiusKm.toFixed(1)} km</strong>
            </span>
            <input
              type="range"
              min={0.1}
              max={MAX_RADIUS_KM}
              step={0.1}
              value={radiusKm}
              onChange={e => setRadiusKm(Number(e.target.value))}
              disabled={running}
            />
          </label>
          <label className="field max-field">
            <span>Max competitors</span>
            <input
              type="number"
              min={1}
              max={COMPETITOR_LIMIT}
              step={1}
              value={maxCompetitors}
              onChange={e => setMaxCompetitors(Math.min(COMPETITOR_LIMIT, Math.max(1, Math.round(Number(e.target.value)) || 1)))}
              disabled={running}
            />
          </label>
        </div>

        <div className="actions">
          <button type="submit" disabled={running || !mapsUrl.trim()}>
            {running ? 'Populating...' : 'Populate'}
          </button>
          <button type="button" className="danger" onClick={onClear} disabled={running || businesses.length === 0}>
            Clear data
          </button>
        </div>
      </form>

      {(job?.message || requestError) && (
        <p className={`status ${requestError || job?.status === 'error' ? 'error' : job?.status}`}>
          {running && <span className="spinner" />}
          {requestError || job?.message}
        </p>
      )}

      {store && (
        <section className="card store">
          <h2>
            <a href={store.mapsUrl} target="_blank" rel="noreferrer">
              {store.name}
            </a>
          </h2>
          <p className="muted">
            {store.category} · {store.address}
          </p>
          <p>
            ⭐ {store.rating.toFixed(1)} ({store.reviewsCount} reviews, {loadedReviews.get(store.placeId) ?? 0} loaded)
            {store.price && ` · ${store.price}`}
            {store.phone && ` · ${store.phone}`}
          </p>
        </section>
      )}

      {store && (
        <section className="card map-card">
          <StoreMap
            store={store}
            competitors={competitors.map(({ link, business }) => ({
              business: business!,
              distanceMeters: link.distanceMeters,
            }))}
            radiusKm={job?.radiusKm || radiusKm}
          />
        </section>
      )}

      {store && (
        <section className="card">
          <h2>
            {competitors.length} competitors within {job?.radiusKm} km
          </h2>
          {competitors.length === 0 ? (
            <p className="muted">{running ? 'Searching...' : 'No drink-focused places found in this radius.'}</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Distance</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Rating</th>
                  <th>Reviews</th>
                  <th>Loaded</th>
                  <th>Agents</th>
                </tr>
              </thead>
              <tbody>
                {competitors.map(({ link, business }) => (
                  <tr key={link.linkId}>
                    <td>{formatDistance(link.distanceMeters)}</td>
                    <td>
                      <a href={business!.mapsUrl} target="_blank" rel="noreferrer">
                        {business!.name}
                      </a>
                    </td>
                    <td>{business!.category}</td>
                    <td>{business!.rating ? business!.rating.toFixed(1) : '–'}</td>
                    <td>{business!.reviewsCount}</td>
                    <td>{loadedReviews.get(business!.placeId) ?? 0}</td>
                    <td>{agentCounts.get(business!.placeId) ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      )}

      {store && (
        <section className="card controls">
          <h2>Customer agents</h2>
          <p className="muted">
            Claude turns each store's reviews into customer personas. Stores get agents in proportion to their Google
            review counts, and each agent stands for that many reviewers.
          </p>
          <div className="actions">
            <label className="field max-field">
              <span>Total agents</span>
              <input
                type="number"
                min={1}
                max={100}
                value={totalAgents}
                onChange={e => setTotalAgents(Math.min(100, Math.max(1, Math.round(Number(e.target.value)) || 1)))}
                disabled={running}
              />
            </label>
            <button type="button" onClick={onCreateAgents} disabled={running || reviews.length === 0}>
              {running ? 'Working...' : agents.length > 0 ? 'Recreate agents' : 'Create agents'}
            </button>
          </div>
          {agents.length > 0 && (
            <table>
              <thead>
                <tr>
                  <th>Store</th>
                  <th>Agent</th>
                  <th>Typical order</th>
                  <th>Represents</th>
                </tr>
              </thead>
              <tbody>
                {[...agents]
                  .sort(
                    (a, b) =>
                      storeRank(b.placeId) - storeRank(a.placeId) ||
                      a.placeId.localeCompare(b.placeId) ||
                      a.name.localeCompare(b.name)
                  )
                  .map(agent => (
                    <tr key={agent.agentId} className={agent.placeId === store.placeId ? 'own-store' : undefined}>
                      <td>{businessesById.get(agent.placeId)?.name ?? '–'}</td>
                      <td>
                        <strong>{agent.name}</strong>
                        <div className="muted">{agent.archetype}</div>
                      </td>
                      <td>{agent.typicalOrder}</td>
                      <td>≈{Math.round(agent.representsCustomers)} reviewers</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}
        </section>
      )}

      {!store && businessesReady && !running && (
        <p className="muted empty">No store loaded yet.</p>
      )}
    </main>
  );
}

export default App;
