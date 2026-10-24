// Keeps build_card (the light per-café row clients subscribe to) in step with twin_build,
// menu_source and area_map. Call after any write to those for a build.
import type { Ctx } from './sim';

export function syncCard(ctx: { db: Ctx['db'] }, buildId: bigint) {
  const b = ctx.db.twinBuild.id.find(buildId);
  if (!b) return;
  let place: { title?: string; address?: string; totalScore?: number; reviewsCount?: number } = {};
  try {
    if (b.placeJson) place = JSON.parse(b.placeJson);
  } catch {
    // keep defaults
  }
  const cafeName = b.universeId ? ctx.db.cafe.universeId.find(b.universeId)?.name : undefined;
  const row = {
    buildId,
    universeId: b.universeId,
    query: b.query,
    name: cafeName ?? b.label ?? place.title ?? b.query,
    address: place.address ?? '',
    rating: place.totalScore ?? 0,
    reviewsCount: place.reviewsCount ?? 0,
    cutoffDate: b.cutoffDate,
    status: b.status,
    detail: b.detail,
    batchesDone: b.batchesDone,
    batchesTotal: b.batchesTotal,
    menuSource: ctx.db.menuSource.buildId.find(buildId)?.source ?? '',
    mapReady: ctx.db.areaMap.buildId.find(buildId)?.status === 'ready',
  };
  if (!row.name) row.name = place.title ?? b.query;
  if (ctx.db.buildCard.buildId.find(buildId)) ctx.db.buildCard.buildId.update(row);
  else ctx.db.buildCard.insert(row);
}
