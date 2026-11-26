# Sparkz lore: the Hearth, the Sparks and the logs

Draft for Zaal to confirm. Nothing here is live until the lore routes are approved.

## What a Hearth is (pick one)

1. **Pick: "A Hearth is a project's home: its story, its people, and a record of everyone who helped it burn."**
2. "A Hearth is where a project's people gather to keep it lit, and where every helper and backer is remembered."
3. "A Hearth is a project's page on Sparkz that holds its story, its people and the receipts of what they brought."

Option 1 is the pick: a stranger can read it once and know what it is, with no crypto words.

## The fire story

A Hearth starts with one spark: a project, a show or a record that someone says matters.
Other people and projects light from it. They are the Sparkz.
Every backer, boost, piece of work or receipt is a log, added to the fire.
The logs are remembered, so the fire keeps the story, the people and the record.
Keep adding logs and the fire keeps burning.

## Glossary

- **Hearth**: a project's home on Sparkz. Its story, people, history and receipts.
- **Spark**: a person or project that lights a Hearth or joins one.
- **Log**: a contribution that keeps a Hearth burning and is remembered: backing, a boost, content or a receipt.
- **Boost**: a log that spreads a Hearth to more people.
- **Back**: to add a log of support to a Hearth. Back the album, not a coin.

## Where this fits and where it clashes

Fits:
- `docs/ARCHITECTURE.md` says every project begins as a Hearth and accumulates identity, supporters, history, lore and receipts. The fire story is that idea in plain words.
- `docs/V1-SCOPE.md` says the coin is an optional output of the Hearth, and that pre-token backing needs no token. "Back" and "log" say the same without a token.
- `docs/strategy/positioning.md` hard rules (back the album, perks as utility, no raise language) are kept. The glossary uses no percentages, no raise, invest, earn or profit words.

Clashes to resolve:
- **Spark means a Hearth in the code.** The app uses "spark" for a Hearth (`create-spark`, `sparks` API, `sparks={[{ slug: "sparkz" }]}` in the home page). The lore uses "Spark" for a person or project that joins a Hearth. Either the lore word changes (for example "Ember") or the code word does. This is the largest clash and needs Zaal's call before any App Store copy uses it.
- **"Log" is new.** No code or doc uses it. It needs a single meaning across the app, the receipts and App Store copy.
- **"Boost" is a real feature** (`BoostForm`, `boostr`). The glossary matches it, but the Boostr integration is external and is not described as a log here.
- **The home page says "back the album, not a coin"** and `docs/V1-SCOPE.md` keeps the token optional. The preview hero avoids "coin" for App Store safety, so the two headlines differ on purpose.
