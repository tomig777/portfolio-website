export function summarizeFrameDeltas(deltas) {
  const values = deltas.filter(value => Number.isFinite(value) && value > 0).sort((a, b) => a - b);
  if (!values.length) return null;
  const percentile = fraction => values[Math.min(values.length - 1, Math.ceil(values.length * fraction) - 1)];
  const round = value => Math.round(value * 100) / 100;
  return {
    samples: values.length,
    meanMs: round(values.reduce((sum, value) => sum + value, 0) / values.length),
    medianMs: round(percentile(.5)),
    p95Ms: round(percentile(.95)),
    maxMs: round(values.at(-1)),
    gapsOver50Ms: values.filter(value => value > 50).length,
  };
}

export function summarizeResources(entries) {
  const resources = entries.map(entry => ({
    url: entry.name,
    initiator: entry.initiatorType,
    durationMs: Math.round(entry.duration * 100) / 100,
    transferBytes: entry.transferSize,
    encodedBodyBytes: entry.encodedBodySize,
    decodedBodyBytes: entry.decodedBodySize,
  }));
  return {
    count: resources.length,
    reportedTransferBytes: resources.reduce((sum, entry) => sum + entry.transferBytes, 0),
    zeroOrUnavailableTransferCount: resources.filter(entry => !entry.transferBytes).length,
    largestObserved: [...resources].sort((a, b) => b.decodedBodyBytes - a.decodedBodyBytes).slice(0, 16),
  };
}
