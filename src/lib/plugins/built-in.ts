// Built-in plugins - the v1 defaults, one per current adapter so each can be toggled
// per-Capsule independently later. Bundling the existing singleton instances (no new
// behavior); registering these reproduces exactly what bootstrap.ts used to do via
// side-effect imports.

import { humanSignalSource } from "@/lib/adapters/signal-source/human";
import { ledgerProvider } from "@/lib/adapters/backing-provider/ledger";
import { inAppChannel } from "@/lib/adapters/approval-channel/in-app";
import { discordChannel } from "@/lib/adapters/approval-channel/discord";
import type { CapsulePlugin } from "./types";

export const signalHumanPlugin: CapsulePlugin = {
  id: "signal-human",
  version: "1.0.0",
  name: "Human Signal Source",
  description: "A human (or ZOL) flags a cultural moment - the v1 Meme Engine source.",
  signalSources: [humanSignalSource],
};

export const backingLedgerPlugin: CapsulePlugin = {
  id: "backing-ledger",
  version: "1.0.0",
  name: "Ledger Backing",
  description: "Off-chain treasury ledger backing - fiat / BYOK / credits, no wallet.",
  backingProviders: [ledgerProvider],
};

export const approvalInAppPlugin: CapsulePlugin = {
  id: "approval-in-app",
  version: "1.0.0",
  name: "In-App Approval",
  description: "The always-on baseline approval surface (the admin console).",
  approvalChannels: [inAppChannel],
};

export const approvalDiscordPlugin: CapsulePlugin = {
  id: "approval-discord",
  version: "1.0.0",
  name: "Discord Approval",
  description: "Posts the signal + drafts + approve link to Discord. Dark until configured.",
  approvalChannels: [discordChannel],
  configSchema: {
    DISCORD_WEBHOOK_URL: {
      required: false,
      secret: true,
      description: "Discord webhook URL. When set, the channel goes live.",
    },
  },
};

// The default set registered at boot (identical to the pre-plugin bootstrap).
export const BUILT_IN_PLUGINS: CapsulePlugin[] = [
  signalHumanPlugin,
  backingLedgerPlugin,
  approvalInAppPlugin,
  approvalDiscordPlugin,
];
