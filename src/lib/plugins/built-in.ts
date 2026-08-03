// Built-in plugins - the v1 defaults, one per current adapter so each can be toggled
// per-Capsule independently later. Bundling the existing singleton instances (no new
// behavior); registering these reproduces exactly what bootstrap.ts used to do via
// side-effect imports.

import { humanSignalSource } from "@/lib/adapters/signal-source/human";
import { farcasterSignalSource } from "@/lib/adapters/signal-source/farcaster";
import { ledgerProvider } from "@/lib/adapters/backing-provider/ledger";
import { inAppChannel } from "@/lib/adapters/approval-channel/in-app";
import { discordChannel } from "@/lib/adapters/approval-channel/discord";
import { telegramChannel } from "@/lib/adapters/approval-channel/telegram";
import type { CapsulePlugin } from "./types";

export const signalHumanPlugin: CapsulePlugin = {
  id: "signal-human",
  version: "1.0.0",
  name: "Human Signal Source",
  description: "A human (or ZOL) flags a cultural moment - the v1 Meme Engine source.",
  signalSources: [humanSignalSource],
};

export const signalFarcasterPlugin: CapsulePlugin = {
  id: "signal-farcaster",
  version: "1.0.0",
  name: "Farcaster Signal Source",
  description:
    "Surfaces candidate cultural moments from Farcaster (casts about the Capsule) so the operator curates instead of authoring. Dark until configured.",
  signalSources: [farcasterSignalSource],
  configSchema: {
    NEYNAR_API_KEY: {
      required: false,
      secret: true,
      description: "Neynar API key (read-only cast search). When set, the source goes live.",
    },
  },
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

export const approvalTelegramPlugin: CapsulePlugin = {
  id: "approval-telegram",
  version: "1.0.0",
  name: "Telegram Approval",
  description:
    "Posts the signal + drafts + approve link to Telegram, so approval reaches you on your phone. Dark until configured.",
  approvalChannels: [telegramChannel],
  configSchema: {
    TELEGRAM_BOT_TOKEN: {
      required: false,
      secret: true,
      description: "Telegram bot token (from @BotFather). Needed with the chat id to go live.",
    },
    TELEGRAM_CHAT_ID: {
      required: false,
      secret: false,
      description: "Destination chat id (your DM or a group). Set with the token to go live.",
    },
  },
};

// The default set registered at boot.
export const BUILT_IN_PLUGINS: CapsulePlugin[] = [
  signalHumanPlugin,
  signalFarcasterPlugin,
  backingLedgerPlugin,
  approvalInAppPlugin,
  approvalDiscordPlugin,
  approvalTelegramPlugin,
];
