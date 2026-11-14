# Sparkz on Hypersnap

Sparkz reads Farcaster data straight from a Hypersnap node (ZAOresearch 2485). No Neynar,
no API key: the node is the source. This is step 1 of 3; signed writes (an app key added
at sign-in, Sparks and Boosts as casts and likes) are steps 2 and 3.

## What reads from the node today

- `src/lib/hypersnap.ts`: profiles (`/v1/userDataByFid`), fid by name
  (`/v1/userNameProofByName`, native fids from 2^32 included), node info (`/v1/info`).
  Reads are cached for five minutes by Next's fetch cache and cut off after two seconds
  (`NODE_TIMEOUT_MS`), so a node that is down or hanging returns null and a page never
  waits on it. Casts and reactions come with step 3, where they get their callers.
- `GET /api/hypersnap/health`: which node, whether it answers, version, counts, shard heights.
- `GET /api/hypersnap/profile?fid=19640` (or `?name=zaal`): a public profile from the node.
  Public route, so it is capped at 60 reads a minute per IP (per server instance) and
  carries a five-minute CDN cache header, so a loop over fids cannot use Sparkz to hammer
  the node.
- The Hearth page shows the owner's Farcaster profile (pfp, name, @name, bio) from the
  node when the Hearth carries a Farcaster fid.

## Which node

`HYPERSNAP_NODE_URL` in the environment. Unset, it is Quilibrium's public read node,
`https://haatz.quilibrium.com`. Any Snapchain-compatible node works (the HTTP API is the
same); to run our own, see the hypersnap README (16 GB RAM, 4 cores, 1.5 TB, about two
hours to sync) or Kite's guide (ZAOresearch 2470).

## Why Hypersnap

Same FIDs, same app keys, same wire format as Farcaster's Snapchain, run by nobody in
particular. The shuttle relays signed user messages both ways, so a cast written to
Hypersnap also lands on Snapchain. Zaal's decision in ZAOOS doc 2666: keep both, read from
the node, and do not migrate the ZAO FIDs.
