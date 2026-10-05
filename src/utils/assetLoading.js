// Bound concurrent downloads/decodes without dropping items or changing order.
export async function mapAssetsWithConcurrency(items, load, concurrency = 4) {
  const results = new Array(items.length);
  let nextIndex = 0;
  const limit = Number.isFinite(concurrency) ? Math.max(1, Math.floor(concurrency)) : 4;
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (nextIndex < items.length) {
      const index = nextIndex++;
      results[index] = await load(items[index], index);
    }
  }));
  return results;
}
