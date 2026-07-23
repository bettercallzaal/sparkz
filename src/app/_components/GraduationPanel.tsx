// Graduation transparency panel - shown on a spark (no-token) Capsule. Implements the
// #1 note from the Nounish Prof brainstorm: be radically transparent about what a
// creator pays and what they get, up front, so they decide. No hype, no pressure -
// "only if it fits", with the real numbers and the DWR test in plain sight.

const RAILS = [
  {
    rail: "Stay a spark",
    fee: "0%",
    get: "Keep everything. Identity, backers, receipts - no coin, no wallet.",
    accent: "text-accent",
  },
  {
    rail: "Tokenless empire",
    fee: "0% until first interaction",
    get: "A create2 + 0xSplits treasury on Base. A shared account before any token.",
    accent: "text-accent",
  },
  {
    rail: "Empire → token",
    fee: "~20% to the Empire Builder team",
    get: "The launchpad, liquidity handled, LP locked, fees routed to your 0xSplits split.",
    accent: "text-accent-3",
  },
  {
    rail: "Clanker (V5 soon)",
    fee: "creator-first split, shown at launch",
    get: "A Farcaster-native token on Base, permanent liquidity. Exact % finalizes with V5.",
    accent: "text-accent-3",
  },
];

export default function GraduationPanel() {
  return (
    <section className="mb-8">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-medium">Graduate to a token? Only if it fits.</h2>
        <span className="text-xs text-muted">transparent by default</span>
      </div>
      <div className="card-solid p-4">
        <p className="text-sm leading-relaxed text-muted">
          This is a spark - no coin. If the momentum is real, you can graduate later. Here
          is exactly what each path costs and what you get for it. You always see the
          number, and you decide.
        </p>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
                <th className="py-2 pr-3 font-medium">Path</th>
                <th className="py-2 pr-3 font-medium">You pay</th>
                <th className="py-2 font-medium">You get</th>
              </tr>
            </thead>
            <tbody>
              {RAILS.map((r) => (
                <tr key={r.rail} className="border-b border-border/60 align-top">
                  <td className="py-2.5 pr-3 font-medium">{r.rail}</td>
                  <td className={`py-2.5 pr-3 font-mono text-xs ${r.accent}`}>{r.fee}</td>
                  <td className="py-2.5 text-muted">{r.get}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-4 text-xs text-muted">
          The test: <span className="text-foreground">what would the token do?</span> Until
          there is a real answer, stay a spark. No vendor lock - your data, audience, and
          IP stay yours whichever path you take.
        </p>
      </div>
    </section>
  );
}
