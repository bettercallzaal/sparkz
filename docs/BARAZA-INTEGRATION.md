# Baraza TV media-kit integration

The partnership contract between **Sparkz** and **Baraza TV** (Aziz). Sparkz turns a
Capsule's spark/recap into an AI-anchor video segment by calling Baraza TV's render
API. This doc is the wire spec both sides build against.

Status: **Sparkz side built, stub-first.** With no `BARAZA_API_URL` set, Sparkz runs
against a deterministic offline stub, so the whole flow is testable today. When Aziz
ships the render API, set the env and it flips to live with zero code change.

## Where it lives (Sparkz)

- Port + selector: `src/lib/adapters/media-kit/index.ts`
- Contract types: `src/lib/adapters/media-kit/types.ts`
- Live client: `src/lib/adapters/media-kit/baraza.ts`
- Offline stub: `src/lib/adapters/media-kit/stub.ts`
- Test surface: `POST|GET /api/capsules/media-kit` (`src/app/api/capsules/media-kit/route.ts`)

Same ports-and-adapters shape as the other Sparkz seams (approval-channel,
signal-source, backing-provider): one interface, swappable implementations, env
selects.

## The model: render is a job

Baraza TV renders asynchronously (HeyGen/Hedra + ElevenLabs), so:

1. `renderSegment(req)` -> `{ jobId, status: "queued" }`
2. poll `getSegment(jobId)` until `status: "ready"` with a `videoUrl`

## Wire spec (what Baraza TV should expose)

Base URL = `BARAZA_API_URL`. Auth = `Authorization: Bearer <BARAZA_API_KEY>`.

### POST `/api/render`

Request:

```json
{
  "script": "Amina reads this. <= 1200 chars.",
  "anchor": "amina",
  "brand": "Sparkz",
  "format": "vertical",
  "sourceRef": "capsule:zoostr"
}
```

- `anchor`: `"amina"` (lead anchor) or `"jabari"` (finance/blockchain correspondent).
- `format`: `"vertical"` (default, Farcaster/mobile) or `"landscape"`.

Response (`200`/`202`):

```json
{ "jobId": "bz_123", "status": "queued", "videoUrl": null }
```

### GET `/api/render/{jobId}`

```json
{ "jobId": "bz_123", "status": "ready", "videoUrl": "https://.../seg.mp4", "anchor": "amina" }
```

`status` is normalized on the Sparkz side, so Baraza can return any of:
`ready|done|complete|completed|succeeded` -> ready; `queued|pending|accepted` ->
queued; `failed|error|errored` -> failed; anything else -> keep polling.

## Testing from the Sparkz side (now, stub mode)

```bash
# 1. render an ad-hoc script (operator token via cookie or header)
curl -sX POST http://localhost:3000/api/capsules/media-kit \
  -H 'content-type: application/json' \
  -H "x-sparkz-admin-token: $SPARKZ_ADMIN_TOKEN" \
  -d '{"script":"Zoostr just lit a spark on Sparkz.","anchor":"jabari","brand":"Zoostr"}'
# -> { ok:true, data:{ mode:"stub", job:{ status:"ready", videoUrl:"https://stub.baraza.local/...", ... } } }

# 2. render from a Capsule (derives the anchor read from name + bio)
curl -sX POST http://localhost:3000/api/capsules/media-kit \
  -H "x-sparkz-admin-token: $SPARKZ_ADMIN_TOKEN" \
  -d '{"capsuleId":"<uuid>","anchor":"amina"}'

# 3. poll a job
curl -s "http://localhost:3000/api/capsules/media-kit?jobId=<jobId>" \
  -H "x-sparkz-admin-token: $SPARKZ_ADMIN_TOKEN"
```

Unit tests: `node --test src/lib/adapters/media-kit/media-kit.test.ts`.

## Flip to live

Set in Sparkz env when Baraza TV's API is up:

```
BARAZA_API_URL=https://<aziz-baraza-deployment>
BARAZA_API_KEY=<key Aziz issues>
```

No code change - the selector returns the live client and the same `/api/capsules/media-kit`
surface now drives real renders. If Aziz's paths/fields differ, the only edits are the
two `fetch` calls + field mapping in `baraza.ts`; the `SegmentJob` contract stays put.

## Not in v1 (next tools on the same seam)

The pitch's other three tools drop in behind this same adapter when needed:
`distribute(segment, platforms)`, `startLiveShow(config)` (OBS bridge),
`transcribe(media)`. v1 wires only `renderSegment` - the one a Capsule needs to turn
on its "stream" toggle.
