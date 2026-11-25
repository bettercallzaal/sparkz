import { getServiceClient } from "@/lib/supabase/server";
import { isAdmin, requireHearthOwner } from "@/lib/auth";
import { getTokenConfig, registerTokenEmpire } from "./client";
import { readDeployTx } from "./verify-deploy";

// Everything the token-launch routes reach outside themselves, in one object, so route
// tests can swap in fakes (review round 2, item 6). Routes call launchDeps.x(...), never
// the imports directly. Not exported from the route files: Next allows only handlers there.
export const launchDeps = {
  getServiceClient,
  isAdmin,
  requireHearthOwner,
  getTokenConfig,
  registerTokenEmpire,
  readDeployTx,
  now: () => Date.now(),
};
