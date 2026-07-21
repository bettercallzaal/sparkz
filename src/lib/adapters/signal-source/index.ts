// SignalSource seam (Upgrade 1 / BUILD-MILESTONE-1 #2). The Meme Engine's trend
// source is a replaceable adapter so it can grow from human submission ->
// Farcaster activity -> Alpha Radar -> predictive, with NO rebuild. The canonical
// signature from the spec:
//   interface SignalSource { detectSignals(capsuleId): Promise<CulturalSignal[]> }

export interface CulturalSignal {
  capsuleId: string;
  text: string;
  whyItMatched?: string;
  source: string;
  sourceMeta?: Record<string, unknown>;
  flaggedBy?: string;
}

export interface SignalSource {
  readonly id: string;
  detectSignals(capsuleId: string): Promise<CulturalSignal[]>;
}

const registry = new Map<string, SignalSource>();

export function registerSignalSource(source: SignalSource): void {
  registry.set(source.id, source);
}

export function getSignalSource(id: string): SignalSource | undefined {
  return registry.get(id);
}

export function listSignalSources(): SignalSource[] {
  return [...registry.values()];
}
