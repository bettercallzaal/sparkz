type Eip1193 = { request(args: { method: string; params?: unknown[] }): Promise<unknown> };

function provider(): Eip1193 {
  const p = (globalThis as { ethereum?: Eip1193 }).ethereum;
  if (!p) throw new Error("No wallet found. Install MetaMask or a Base wallet.");
  return p;
}

export async function getInjectedAddress(): Promise<`0x${string}`> {
  const accounts = (await provider().request({ method: "eth_requestAccounts" })) as string[];
  if (!accounts?.length) throw new Error("No account authorized");
  return accounts[0] as `0x${string}`;
}

export async function signMessageInjected(message: string): Promise<`0x${string}`> {
  const from = await getInjectedAddress();
  return (await provider().request({
    method: "personal_sign",
    params: [message, from],
  })) as `0x${string}`;
}
