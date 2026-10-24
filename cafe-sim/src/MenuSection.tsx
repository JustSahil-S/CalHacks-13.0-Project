import { useState } from 'react';
import { tables } from './module_bindings';
import { useTable } from 'spacetimedb/react';

type Store = { placeId: string; name: string };

const SOURCE_LABELS: Record<string, string> = {
  website: 'Website',
  uber_adjusted: 'Uber Eats, adjusted',
  area_estimate: 'Area estimate',
};

const WEBSITE_STATUS_LABELS: Record<string, string> = {
  ok: 'prices found',
  no_website: 'no website',
  no_prices: 'no prices online',
  failed: 'could not read',
};

function formatPrice(cents: number | undefined | null) {
  return cents == null ? '–' : `$${(cents / 100).toFixed(2)}`;
}

function formatPercent(ratio: number) {
  const percent = Math.round((ratio - 1) * 100);
  return percent === 0 ? 'average' : `${percent > 0 ? '+' : '−'}${Math.abs(percent)}%`;
}

function median(values: number[]) {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
}

export default function MenuSection({
  stores,
  ownPlaceId,
  running,
  onFetch,
}: {
  stores: Store[];
  ownPlaceId: string;
  running: boolean;
  onFetch: () => void;
}) {
  const [items] = useTable(tables.menu_item);
  const [sources] = useTable(tables.menu_source);
  const [selectedId, setSelectedId] = useState('');

  const sourcesById = new Map(sources.map(s => [s.placeId, s]));
  const itemsByStore = new Map<string, typeof items>();
  for (const item of items) itemsByStore.set(item.placeId, [...(itemsByStore.get(item.placeId) ?? []), item]);
  const categoryPrice = (placeId: string, category: string) =>
    median((itemsByStore.get(placeId) ?? []).filter(i => i.category === category).map(i => i.predictedPriceCents));

  const selected = stores.find(s => s.placeId === selectedId);
  const selectedItems = [...(itemsByStore.get(selectedId) ?? [])].sort(
    (a, b) => a.section.localeCompare(b.section) || a.name.localeCompare(b.name),
  );

  return (
    <section className="card controls">
      <h2>Menus &amp; prices</h2>
      <p className="muted">
        In-store prices come from each store's own website (pages, menu PDFs and photos, read by Claude). Uber Eats
        prices fill the gaps after removing the delivery markup, measured from items listed on both. Stores with no menu
        online get estimates from nearby stores.
      </p>
      <div className="actions">
        <button type="button" onClick={onFetch} disabled={running}>
          {running ? 'Working...' : sources.length > 0 ? 'Refresh menus' : 'Fetch menus'}
        </button>
      </div>

      {sources.length > 0 && (
        <table className="menu-summary">
          <thead>
            <tr>
              <th>Store</th>
              <th>Website</th>
              <th>Uber Eats</th>
              <th>Items</th>
              <th>Latte</th>
              <th>Drip</th>
              <th>Price level</th>
            </tr>
          </thead>
          <tbody>
            {stores.map(store => {
              const source = sourcesById.get(store.placeId);
              if (!source) return null;
              const storeItems = itemsByStore.get(store.placeId) ?? [];
              const estimated = storeItems.every(i => i.priceSource === 'area_estimate');
              const classes = [
                store.placeId === ownPlaceId ? 'own-store' : '',
                store.placeId === selectedId ? 'selected' : '',
              ].join(' ');
              return (
                <tr
                  key={store.placeId}
                  className={`clickable ${classes}`}
                  onClick={() => setSelectedId(id => (id === store.placeId ? '' : store.placeId))}
                >
                  <td>{store.name}</td>
                  <td>
                    {source.websiteItems > 0
                      ? `${source.websiteItems} items`
                      : WEBSITE_STATUS_LABELS[source.websiteStatus]}
                  </td>
                  <td>
                    {source.uberItems > 0 ? (
                      <>
                        {source.uberItems} items
                        <div className="muted">
                          {formatPercent(source.uberMarkup)} markup (
                          {source.markupBasis === 'store' ? 'measured' : source.markupBasis})
                        </div>
                      </>
                    ) : (
                      'not listed'
                    )}
                  </td>
                  <td>{estimated ? 'estimated' : storeItems.length}</td>
                  <td>{formatPrice(categoryPrice(store.placeId, 'latte'))}</td>
                  <td>{formatPrice(categoryPrice(store.placeId, 'drip_coffee'))}</td>
                  <td>{formatPercent(source.priceIndex)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {selected && (
        <>
          <h3>{selected.name} menu</h3>
          {selectedItems.length === 0 ? (
            <p className="muted">No items found.</p>
          ) : (
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Section</th>
                    <th>Item</th>
                    <th>Predicted</th>
                    <th>Source</th>
                    <th>Website</th>
                    <th>Uber Eats</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedItems.map(item => (
                    <tr key={item.itemId}>
                      <td className="muted">{item.section}</td>
                      <td>{item.name}</td>
                      <td>
                        <strong>{formatPrice(item.overridePriceCents ?? item.predictedPriceCents)}</strong>
                      </td>
                      <td>
                        <span className={`source-badge ${item.priceSource}`}>{SOURCE_LABELS[item.priceSource]}</span>
                      </td>
                      <td>{formatPrice(item.websitePriceCents)}</td>
                      <td>{formatPrice(item.uberPriceCents)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </section>
  );
}
