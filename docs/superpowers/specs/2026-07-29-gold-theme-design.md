# Sparkz gold re-theme - design

2026-07-29. Full visual overhaul around the new Sparkz logo (gold holographic Z with
a flame, "SPARKZ" wordmark, near-black). Approved direction: rich metallic gold as
primary, tasteful holographic accents, animated logo hero, logo everywhere.

## Palette (globals.css `:root`)
- `--background` `#0a0908` (warm near-black, was cool `#0a0a0a`)
- `--surface` `#16130d`, `--card` `#191510`, `--border` `#2b2418` (warm)
- `--foreground` `#f6f3ec`, `--muted` `#a29a88` (warm)
- `--accent` `#e8c66a` (rich metallic gold, PRIMARY - was violet `#c084fc`)
- `--accent-2` / `--gold-bright` `#ffd700` (highlights/glow)
- `--violet` `#c084fc` demoted to a holographic bit-player only
- `--flame-1` `#f97316` kept (flame identity)

## Holographic foil (signature, used sparingly)
- `@property --holo-a` angle + `holo-spin` keyframe drive a conic oil-slick gradient
- `.holo-text` (clipped to text) and `.holo-border` (padding-box/border-box trick)
- Applied to: logo, hero heading, CTA hover sweep, select borders. Reduced-motion safe.

## Component restyle
- `.spark-gradient` / `.spark-text`: flame-orange -> gold -> bright gold
- `.btn-spark`: gold gradient + a holographic sheen sweep on hover (::after)
- Cards / `.glass` / focus rings / links: inherit gold via `var(--accent)` cascade
- hero blobs -> deep-gold + amber; flame glow -> warm gold

## Logo surfaces
- `Flame.tsx` + `icon.svg` recolored gold (header mark + favicon)
- Homepage hero: animated logo `<video>` (webm+mp4, poster PNG) - the brand moment
- OG card (`/api/og`): gold constants, gold flame, warm-gold background radial
- README: animated logo GIF hero + "Part of The ZAO"

## Assets (`public/brand/`)
- `sparkz-logo.png` (still, 1024), `sparkz-logo.mp4` + `.webm` (512, web hero),
  `sparkz-logo.gif` (300px, README inline). Converted from the supplied .mov via ffmpeg.

## Delivery
Branch `ws/gold-theme` -> PR -> Vercel preview -> merge to main. Zaal iterates after.
