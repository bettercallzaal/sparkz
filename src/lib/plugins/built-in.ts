// Built-in plugins - the v1 defaults, one per current adapter so each can be toggled
// per-Hearth independently later. Bundling the existing singleton instances (no new
// behavior); registering these reproduces exactly what bootstrap.ts used to do via
// side-effect imports.

import { ledgerProvider } from "@/lib/adapters/backing-provider/ledger";
import type { HearthPlugin } from "./types";

export const backingLedgerPlugin: HearthPlugin = {
  id: "backing-ledger",
  version: "1.0.0",
  name: "Ledger Backing",
  description: "Off-chain treasury ledger backing - fiat / BYOK / credits, no wallet.",
  backingProviders: [ledgerProvider],
};

// The default set registered at boot.
export const BUILT_IN_PLUGINS: HearthPlugin[] = [
  backingLedgerPlugin,
];
