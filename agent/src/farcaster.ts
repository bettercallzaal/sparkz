// Farcaster casting via Neynar. The agent has its own Farcaster identity (a managed
// signer), and casts an approved response into the Capsule's channel. This is the
// piece the Sparkz web app cannot do server-side (it holds no signer) - the agent's
// core value-add on top of the app's flag -> draft -> approve -> receipt flow.

export interface CastResult {
  hash: string;
  url: string;
}

export class FarcasterError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "FarcasterError";
  }
}

export class NeynarClient {
  constructor(
    private readonly apiKey: string,
    private readonly signerUuid: string,
    private readonly fetchImpl: typeof fetch = fetch,
  ) {}

  // Publish a cast. `channel` is a Farcaster channel id (e.g. "zao"); when null the
  // cast goes to the signer's home feed.
  async publishCast(text: string, channel: string | null): Promise<CastResult> {
    const res = await this.fetchImpl("https://api.neynar.com/v2/farcaster/cast", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": this.apiKey,
      },
      body: JSON.stringify({
        signer_uuid: this.signerUuid,
        text,
        ...(channel ? { channel_id: channel } : {}),
      }),
    });
    const body = (await res.json().catch(() => null)) as
      | { cast?: { hash?: string; author?: { username?: string } } }
      | { message?: string }
      | null;
    if (!res.ok) {
      const msg = (body && "message" in body && body.message) || `Neynar HTTP ${res.status}`;
      throw new FarcasterError(msg, res.status);
    }
    const hash = (body && "cast" in body && body.cast?.hash) || "";
    const user = (body && "cast" in body && body.cast?.author?.username) || "";
    return { hash, url: hash ? `https://farcaster.xyz/${user || "~"}/${hash}` : "" };
  }
}
