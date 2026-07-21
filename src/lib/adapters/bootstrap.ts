// Import once (server-side) to populate every adapter registry via each module's
// register() side effect. API routes import this before resolving an adapter.
import "./signal-source/human";
import "./backing-provider/ledger";
import "./approval-channel/in-app";
import "./approval-channel/discord";
