# Sparkz on Hypersnap

Sparkz reads Farcaster data straight from a Hypersnap node (ZAOresearch 2485). No Neynar,
no API key: the node is the source. Step 1 (reads) and step 2 (the app key) are in; step 3
(Sparks and Boosts as casts and likes) follows.

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

## Step 2: the app key ("Post on Hypersnap" on the profile page)

- `src/lib/hypersnap-proto.ts`: the protocol bits, lifted from Quilcast (MIT, see NOTICE): a
  protobuf writer, the Message envelope (blake3-160 hash, Ed25519 signature, data sent twice
  as the node expects), the EIP-712 typed data the custody wallet signs (SignedKeyRequest and
  KeyAdd), gasless `KEY_ADD` and self-signed `KEY_REMOVE`. Pure functions, tested in
  `hypersnap-proto.test.ts` against a protobuf reader, blake3 and viem's `hashTypedData`.
- `src/lib/hypersnap-vault.ts`: the key is a non-extractable WebCrypto Ed25519 key in
  IndexedDB, one per fid. Page code can sign with it; nothing can read it out; it never
  reaches our server. Browsers without WebCrypto Ed25519 get a clear error.
- `POST /api/hypersnap/submit`: relays the signed bytes to the node's `/v1/submitMessage`
  (octet-stream, 8 KB cap, 20 a minute per IP). The browser signs; the server only relays.
- `GET /api/hypersnap/signer?fid=&signer=0x...`: does the node list the key (fresh read).
- `src/app/_components/HypersnapSigner.tsx` on the profile page: Turn on connects a wallet
  (the existing AppKit/wagmi providers), checks it is the Farcaster custody address, asks it
  for the two signatures, sends the KEY_ADD and waits until the node lists the key. Turn off
  sends a KEY_REMOVE and drops the key. Scopes: casts, reactions, follows, profile edits only.

What the custody check means: an account made in Warpcast keeps its custody wallet inside the
Warpcast app, so its owner cannot sign the KEY_ADD from a browser wallet; the card says so. An
account whose custody is a wallet the person holds (a Hypersnap-native account, or one made
with their own wallet) turns on in two signatures. Native onboarding for people without a
Farcaster account is not in this step.

Dependency: `@noble/hashes` (blake3), already in the tree through viem, now declared.
