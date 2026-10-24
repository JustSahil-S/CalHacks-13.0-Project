import { useEffect, useState, type FormEvent } from 'react';
import { reducers } from './module_bindings';
import { useReducer } from 'spacetimedb/react';
import type { Business, MenuItem, ScenarioEdit } from './module_bindings/types';
import { scenarioMenu, type MenuRow } from './scenarioMenu';

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

// Commits on Enter or blur, so each edit is one reducer call; Escape puts the saved price back
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

  const [filter, setFilter] = useState('');
  const [newName, setNewName] = useState('');
  const [newSection, setNewSection] = useState('');
  const [newPrice, setNewPrice] = useState('');

  const editable = isOwnStore && scenarioId !== 0;
  const rows = scenarioMenu(items, isOwnStore ? edits : []);
  const query = filter.trim().toLowerCase();
  const shown = query ? rows.filter(r => `${r.name} ${r.section}`.toLowerCase().includes(query)) : rows;
  const sections = [...new Set(rows.map(r => r.section))];
  const changes = rows.filter(r => r.status !== 'base').length;

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
    if (!newName.trim() || priceCents === null) return;
    call(
      addItem({ scenarioId, name: newName, section: newSection, priceCents }).then(() => {
        setNewName('');
        setNewPrice('');
      }),
    );
  };

  return (
    <aside className="menu-panel" onClick={e => e.stopPropagation()}>
      <header>
        <div>
          <strong>{business.name}</strong>
          <div className="muted">
            ⭐ {business.rating ? business.rating.toFixed(1) : '–'} · {business.reviewsCount} reviews ·{' '}
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

      <div className="menu-list">
        {rows.length === 0 && <p className="muted">No menu yet. Fetch menus first.</p>}
        {shown.map((row, i) => (
          <div key={row.key}>
            {(i === 0 || shown[i - 1].section !== row.section) && <h4>{row.section || 'Menu'}</h4>}
            <div className={`menu-row ${row.status}`}>
              <span className="item-name">
                {row.name}
                {row.status === 'added' && <span className="tag">new</span>}
                {row.status === 'removed' && <span className="tag">removed</span>}
              </span>
              {row.status === 'changed' && <s className="muted">{formatPrice(row.basePrice)}</s>}
              {editable && row.status !== 'removed' ? (
                <PriceInput cents={row.price} onCommit={cents => onPrice(row, cents)} />
              ) : (
                <span className="price">{formatPrice(row.price)}</span>
              )}
              {editable && (
                <span className="row-actions">
                  {row.status === 'changed' && (
                    <button
                      type="button"
                      title="Back to the real price"
                      onClick={() => call(revertEdit({ editId: row.priceEditId! }))}
                    >
                      ↺
                    </button>
                  )}
                  {row.status === 'removed' ? (
                    <button
                      type="button"
                      title="Put back on the menu"
                      onClick={() => call(revertEdit({ editId: row.removeEditId! }))}
                    >
                      ↺
                    </button>
                  ) : row.status === 'added' ? (
                    <button
                      type="button"
                      title="Delete this item"
                      onClick={() => call(revertEdit({ editId: row.addEditId! }))}
                    >
                      ×
                    </button>
                  ) : (
                    <button
                      type="button"
                      title="Take off the menu"
                      onClick={() => call(removeItem({ scenarioId, itemName: row.name }))}
                    >
                      ×
                    </button>
                  )}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {editable && (
        <form className="add-item" onSubmit={onAdd}>
          <input placeholder="New item" value={newName} onChange={e => setNewName(e.target.value)} required />
          <input
            placeholder="Section"
            list="menu-sections"
            value={newSection}
            onChange={e => setNewSection(e.target.value)}
          />
          <datalist id="menu-sections">
            {sections.map(s => (
              <option key={s} value={s} />
            ))}
          </datalist>
          <input
            placeholder="$0.00"
            inputMode="decimal"
            value={newPrice}
            onChange={e => setNewPrice(e.target.value)}
            required
          />
          <button type="submit">Add</button>
        </form>
      )}
    </aside>
  );
}
