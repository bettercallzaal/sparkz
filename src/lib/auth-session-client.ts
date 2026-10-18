// Browser-side calls for the creator session (server: lib/session.ts + /api/auth/*).
// auth-kit's own "signed in" state lives only in the browser and proves nothing to
// the server; these turn a Farcaster proof into the httpOnly server session.

type Json = {
  ok: boolean;
  data?: { fid?: number | null; nonce?: string; address?: string | null; admin?: boolean };
  error?: string;
};

async function call(path: string, init?: RequestInit): Promise<Json> {
  const r = await fetch(path, { credentials: "include", ...init });
  return (await r.json().catch(() => ({ ok: false }))) as Json;
}

// The verified session FID, or null when there is no server session.
export async function currentFid(): Promise<number | null> {
  const j = await call("/api/auth/me");
  return j.ok ? (j.data?.fid ?? null) : null;
}

// The verified session's admin status (Farcaster FID or SIWE address on the allowlist).
export async function currentAdmin(): Promise<boolean> {
  const j = await call("/api/auth/me");
  return Boolean(j.ok && j.data?.admin);
}

// Admin door: exchange a signed Sign-In with Ethereum message for the server session.
// Returns null on success, or the server's error message.
export async function exchangeSiwe(message: string, signature: string): Promise<string | null> {
  const j = await call("/api/auth/siwe", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ message, signature }),
  });
  return j.ok ? null : (j.error ?? "Sign-in failed");
}

// Server-issued nonce for auth-kit's SignInButton (`nonce` prop).
export async function fetchNonce(): Promise<string> {
  const j = await call("/api/auth/nonce");
  if (!j.ok || !j.data?.nonce) throw new Error("could not start sign-in");
  return j.data.nonce;
}

// Web door: exchange auth-kit's signed SIWF message for the server session.
export async function exchangeSiwf(message: string, signature: string): Promise<number | null> {
  const j = await call("/api/auth/siwf", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ message, signature }),
  });
  return j.ok ? (j.data?.fid ?? null) : null;
}

// Mini-app door: Quick Auth JWT -> server session. Returns null outside a Farcaster
// client (the caller falls back to the web door) or if the user declines.
export async function miniAppSignIn(): Promise<number | null> {
  const { sdk } = await import("@farcaster/miniapp-sdk");
  if (!(await sdk.isInMiniApp())) return null;
  const { token } = await sdk.quickAuth.getToken();
  const j = await call("/api/auth/quick", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ token }),
  });
  return j.ok ? (j.data?.fid ?? null) : null;
}

export async function inMiniApp(): Promise<boolean> {
  try {
    const { sdk } = await import("@farcaster/miniapp-sdk");
    return await sdk.isInMiniApp();
  } catch {
    return false;
  }
}

export async function signOut(): Promise<void> {
  await call("/api/auth/logout", { method: "POST" });
}
