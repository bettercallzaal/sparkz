# Add a spoke (vendor guide)

Sparkz is a **wheel-and-spokes** system. Each project's **Hearth** is the hub; every tool
you connect is a **spoke**. This folder is where vendors add their own spoke. No bespoke
Sparkz change is needed - you contribute a small folder and open one PR.

## Add your tool in 3 files + 1 line

1. **Create a folder** here: `src/lib/plugins/community/<your-tool>/`

2. **`spoke.json`** - your manifest (identity + what you provide + config you read):

   ```json
   {
     "id": "connector-<your-tool>",
     "name": "Your Tool",
     "version": "1.0.0",
     "author": "you",
     "description": "One line on what connecting this does for a Hearth.",
     "type": "connector",
     "provides": { "connectors": ["connector-<your-tool>"] },
     "permissions": ["read:hearth"],
     "configSchema": {
       "YOUR_TOOL_API_KEY": { "required": false, "secret": true, "description": "..." }
     },
     "minSparkzVersion": "1.0.0"
   }
   ```

3. **`index.ts`** - export a `HearthPlugin` whose component is a `Connector`. Copy
   `audius-catalog/index.ts` as your template. A `Connector` is deliberately small:

   ```ts
   const yourConnector: Connector = {
     id: "connector-<your-tool>",
     kind: "distribution",          // category shown in the integrations grid
     label: "Your Tool",
     async status() {               // pure read; dark until configured; must fail soft
       const key = process.env.YOUR_TOOL_API_KEY?.trim();
       return key ? { connected: true, label: "linked" } : { connected: false, label: "not linked" };
     },
   };
   export const yourSpoke: HearthPlugin = {
     id: "connector-<your-tool>", version: "1.0.0", name: "Your Tool",
     connectors: [yourConnector],
     configSchema: { YOUR_TOOL_API_KEY: { secret: true, description: "..." } },
   };
   export default yourSpoke;
   ```

4. **Register it** - add one line to `community/index.ts`:

   ```ts
   import { yourSpoke } from "./your-tool";
   export const COMMUNITY_SPOKES: HearthPlugin[] = [audiusCatalogSpoke, yourSpoke];
   ```

Open a PR. CI runs `tsc` + `eslint` + `build`. A maintainer spot-checks for the rules
below. Merge. Then any community toggles your spoke on per-Hearth in the admin console.

## The rules (what a spoke may and may not do)

- **Secrets are server-only.** Mark them `secret: true`; never send them to the browser,
  never hardcode them. Read from `process.env` on the server.
- **No DB access, no shared state.** A spoke reads its declared config and talks to its
  own external API. All Hearth state lives in Supabase, owned by the hub.
- **Fail soft.** `status()` must never throw the hub down - dark (not connected) until
  configured. A broken spoke is toggled off per-Hearth and never blocks anything.
- **Declare your permissions + config.** No implicit access.
- **Pin `minSparkzVersion`.** So an incompatible Sparkz version disables your spoke
  instead of breaking.

See `audius-catalog/` for a complete working example.
