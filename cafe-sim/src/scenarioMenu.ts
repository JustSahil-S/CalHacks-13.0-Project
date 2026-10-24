import type { MenuItem, ScenarioEdit } from './module_bindings/types';

export type MenuRow = {
  key: string;
  name: string;
  section: string;
  // Real price in the base universe; null for items the scenario added
  basePrice: number | null;
  // Price in this scenario
  price: number;
  status: 'base' | 'changed' | 'removed' | 'added';
  priceSource: string;
  priceEditId?: number;
  removeEditId?: number;
  addEditId?: number;
};

export function basePrice(item: MenuItem) {
  return item.overridePriceCents ?? item.predictedPriceCents;
}

// A store's menu in one scenario: the base menu with the scenario's edits applied (edits match items by name)
export function scenarioMenu(items: MenuItem[], edits: ScenarioEdit[]): MenuRow[] {
  const editFor = (kind: string, name: string) => edits.find(e => e.kind === kind && e.targetName === name);
  const rows: MenuRow[] = items.map(item => {
    const priceEdit = editFor('price', item.name);
    const removeEdit = editFor('remove', item.name);
    return {
      key: `item-${item.itemId}`,
      name: item.name,
      section: item.section,
      basePrice: basePrice(item),
      price: priceEdit?.priceCents ?? basePrice(item),
      status: removeEdit ? 'removed' : priceEdit ? 'changed' : 'base',
      priceSource: item.priceSource,
      priceEditId: priceEdit?.editId,
      removeEditId: removeEdit?.editId,
    };
  });
  for (const edit of edits) {
    if (edit.kind !== 'add') continue;
    rows.push({
      key: `edit-${edit.editId}`,
      name: edit.name,
      section: edit.section,
      basePrice: null,
      price: edit.priceCents,
      status: 'added',
      priceSource: 'scenario',
      addEditId: edit.editId,
    });
  }
  return rows.sort((a, b) => a.section.localeCompare(b.section) || a.name.localeCompare(b.name));
}
