// Empty stub aliased in place of the optional @x402/* payment modules that
// @coinbase/cdp-sdk imports (pulled transitively by the Reown wagmi adapter via the
// Coinbase baseAccount connector). Sparkz never uses Coinbase x402 payments, so
// these code paths are never hit. Dynamic imports here need no named exports;
// STATIC imports do, so the names that cdp-sdk statically imports are provided as
// no-ops to satisfy Turbopack's build-time export checking.

const noop = (): never => {
  throw new Error("x402 payment path is stubbed in Sparkz and must not be called");
};

// Statically imported by @coinbase/cdp-sdk/_esm/x402/account-signers.js
export const toClientEvmSigner = noop;

// Defensive: other names that may be statically imported across @x402/* subpaths.
export const toClientSvmSigner = noop;
export const registerExactEvmScheme = noop;
export const registerExactSvmScheme = noop;
export const ExactEvmScheme = noop;
export const ExactSvmScheme = noop;
export const UptoEvmScheme = noop;

const x402Stub = {};
export default x402Stub;
