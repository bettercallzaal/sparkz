export type SparkExample = {
  slug: string
  emoji: string
  title: string
  tagline: string
  situation: string
  noTokenAction: string
  metric: string
  splitConfig: {
    communityPool: number
    creatorPool: number
    treasury: number
    zaoStake: number
    note?: string
  }
  perks: string[]
  realExample?: { name: string; href: string }
  tokenPath: 'now' | 'later' | 'never'
  tokenNote: string
  advisorPreset: {
    situation: 'crowdfund' | 'collab' | 'solo'
    tokenTiming: 'now' | 'later' | 'never'
    feeModel: 'low' | 'medium' | 'high'
  }
}

export const SPARK_EXAMPLES: SparkExample[] = [
  {
    slug: 'leaderboard-boost',
    emoji: '🏆',
    title: 'Community leaderboard',
    tagline: 'Your superfans earn fee share just by showing up.',
    situation:
      'You have a community that boosts your content. They like your posts, share your drops, show up in comments. You want to reward the ones who actually show up — not just whoever buys the most.',
    noTokenAction:
      'Start the leaderboard now. Connect Boostr (or any points platform). Your top fans see their ranking and projected earnings before any token exists. The leaderboard is live; the token is optional.',
    metric: 'Leaderboard points (zabalLikesCount from Boostr, or equivalent)',
    splitConfig: {
      communityPool: 50,
      creatorPool: 25,
      treasury: 25,
      zaoStake: 5,
      note: 'This is the evolved split — after 30+ real boosters have shown up for weeks. Start creator-first (97% creator, 2% treasury, 1% community). Increase community pool to 50% once the leaderboard has proven itself. The advisor starts you at 97/2/1; this is where Zoostr arrived.',
    },
    perks: [
      'Fee share proportional to boost points (no claiming — lands in wallet)',
      'Top-3 podium on the site',
      'Named in weekly receipt casts',
      'Early access to future drops',
    ],
    realExample: { name: 'Zoostr ($ZOOSTR)', href: 'https://zoostr.xyz' },
    tokenPath: 'later',
    tokenNote:
      'Prove the leaderboard first. When 30+ real boosters have been showing up for 4+ weeks, launch the token. Their engagement is the proof. The token makes it pay.',
    advisorPreset: { situation: 'solo', tokenTiming: 'later', feeModel: 'low' },
  },
  {
    slug: 'music-collab',
    emoji: '🎵',
    title: 'Music collab',
    tagline: 'Two artists, one split. Both incentivized to share.',
    situation:
      'You and a collaborator are releasing together. Producer, engineer, maybe a featured artist. You want everyone\'s share locked in before anything is published — no disputes, no awkward conversations after the fact.',
    noTokenAction:
      'Use the split wizard to document roles and percentages now, before recording is done. Export the split config. Everyone signs off on the JSON. When you launch, the split is already agreed and on-chain.',
    metric: 'Fixed role-based allocation (no weekly updates — collab splits are set at launch)',
    splitConfig: {
      communityPool: 40,
      creatorPool: 40,
      treasury: 20,
      zaoStake: 5,
      note: 'Creator pool divided by role: e.g. Artist A 60% / Artist B 30% / Producer 10% of that 40%. Community pool goes to both artists\' combined fan base by engagement.',
    },
    perks: [
      'Fee share by contribution (both artists earn from every trade)',
      'Producer credit on-chain and in receipt casts',
      'Combined community pool = bigger reward for fans who support both artists',
    ],
    tokenPath: 'now',
    tokenNote:
      'Collab releases can launch with a token immediately — both artists have an audience, both are promoting. The 0xSplits contract handles the multi-recipient fee split; Clanker just needs one address (the Splits contract).',
    advisorPreset: { situation: 'collab', tokenTiming: 'now', feeModel: 'medium' },
  },
  {
    slug: 'group-crowdfund',
    emoji: '🌐',
    title: 'Group crowdfund',
    tagline: 'A community backs a shared project. Backers share the pool.',
    situation:
      'A group of people wants to back a project together — an album, an event, a travel fund (like Farcaster-to-Devcon). The backers are the community. They want to govern the treasury and earn from the project\'s success.',
    noTokenAction:
      'Open the backing now (card payment, no wallet required). Backers get a proof-of-backing NFT immediately. Treasury accrues. Token launch is optional — the project can run on patronage alone.',
    metric: 'Contribution size (backer stake / total raised = community pool weight)',
    splitConfig: {
      communityPool: 60,
      creatorPool: 15,
      treasury: 25,
      zaoStake: 5,
      note: 'Community pool distributed to backers by their contribution size. Creator/operator pool covers production. Treasury is the shared war chest for proposals and votes.',
    },
    perks: [
      'Proof-of-backing NFT minted at contribution time',
      'Proportional fee share from any token that launches',
      'Treasury voting rights on how funds are used',
      'Named in project credits',
    ],
    tokenPath: 'later',
    tokenNote:
      'Start with patronage. If the group fund reaches a milestone (e.g. 50 backers, $5k raised), graduate to a token. If and when a token launches, backers can be prioritized — their proof-of-backing can inform their initial allocation.',
    advisorPreset: { situation: 'crowdfund', tokenTiming: 'later', feeModel: 'low' },
  },
  {
    slug: 'pfp-nft-community',
    emoji: '🎨',
    title: 'PFP / NFT community',
    tagline: 'Holders earn fee share. The NFT becomes the membership card.',
    situation:
      'You have an NFT collection. Holders already have skin in the game. You want to give them ongoing fee share — not a one-time mint, but recurring income from every trade of your creator token.',
    noTokenAction:
      'Publish the community snapshot now. Show holders their projected earnings at any volume. The leaderboard is holders by NFT count (or rarity weight). No token needed to see what they\'d earn.',
    metric: 'NFT holdings (wallet holds N NFTs → weight proportional to N, or rarity-adjusted)',
    splitConfig: {
      communityPool: 50,
      creatorPool: 30,
      treasury: 20,
      zaoStake: 5,
      note: 'Community pool split by NFT holdings snapshot. NFT rarity weighting optional — equal weight per NFT is simpler and harder to game.',
    },
    perks: [
      'Passive fee income proportional to NFT holdings',
      'Weekly on-chain receipt — holders see their earnings per NFT',
      'Treasury fund for community proposals (new drops, collabs, events)',
    ],
    tokenPath: 'now',
    tokenNote:
      'PFP communities with active markets can launch immediately. The token is the revenue layer on top of the NFT — holders earn from NFT rarity AND from trading fees. Two asset classes, one community.',
    advisorPreset: { situation: 'solo', tokenTiming: 'now', feeModel: 'high' },
  },
  {
    slug: 'dao-staking',
    emoji: '🏛',
    title: 'Light DAO — proposal + staking',
    tagline: 'A Nouns-style DAO with liquid tokens. Stake to vote, earn while staked.',
    situation:
      'You want community governance without the overhead of a full DAO. Holders stake their tokens to vote on treasury proposals. Staked tokens earn a share of the fee pool — so governance participation is financially incentivized.',
    noTokenAction:
      'Draft the governance rules now (which decisions go to a vote, quorum requirements, veto power). Publish them publicly. Governance legitimacy is established before any token launches.',
    metric:
      'Staked token balance (stake → vote weight → fee share proportional to stake). Unstaking = losing vote weight + losing fee share. Incentivizes long-term alignment.',
    splitConfig: {
      communityPool: 45,
      creatorPool: 20,
      treasury: 35,
      zaoStake: 5,
      note: 'Higher treasury % because the DAO governs it. Community pool goes to stakers. Creator pool covers ops. Treasury is the subject of governance.',
    },
    perks: [
      'Staking fee share (earn by participating in governance)',
      'Proposal rights on treasury allocation',
      'Token-weighted voting (no plutocracy protection — design carefully)',
      'ZAO "light DAO" template as the governance rules starting point',
    ],
    tokenPath: 'now',
    tokenNote:
      'The DAO model requires a token by definition — staking needs something to stake. Launch with a token and publish the governance rules simultaneously. The token IS the governance mechanism.',
    advisorPreset: { situation: 'crowdfund', tokenTiming: 'now', feeModel: 'high' },
  },
  {
    slug: 'patronage-solo',
    emoji: '☕',
    title: 'Solo patronage — no token, ever',
    tagline: 'Recurring memberships. No coin. Your community backs the work.',
    situation:
      'You make music, write, or create consistently. You have 50–200 fans who want to support you. You do not want a token — the speculation risk, the regulatory grey area, the "what does this coin DO?" questions. You just want recurring revenue from people who believe in the work.',
    noTokenAction:
      'Set up your three patronage tiers ($5/$25/$100) with concrete perks for each. Publish the tier page. Your fans back you with a card — no wallet, no gas, no speculation. You get a monthly income stream while you create.',
    metric:
      'Active patron count per tier × monthly recurring revenue. The metric is simple: paying fans, not holders.',
    splitConfig: {
      communityPool: 0,
      creatorPool: 97,
      treasury: 3,
      zaoStake: 0,
      note: 'No token = no community pool. Creator keeps nearly everything. A small treasury covers platform upkeep (ZOL compute). ZAO stake is 0% because there is no token to stake.',
    },
    perks: [
      'Direct access to the creator (Discord, group chat, or email)',
      'Early access to new releases',
      'Monthly Q&A or listening session',
      '$100 tier: name in the credits of the next release',
    ],
    tokenPath: 'never',
    tokenNote:
      'This is a deliberate, permanent decision. No token. Patronage is the model — recurring revenue from real fans, no speculation layer. If you later want a token, start a new Sparkz advisor flow.',
    advisorPreset: { situation: 'solo', tokenTiming: 'never', feeModel: 'low' },
  },
  {
    slug: 'collab-split-no-token',
    emoji: '🤝',
    title: 'Collab split — no token',
    tagline: 'Multiple artists, one shared split. No coin required.',
    situation:
      'Two or more artists are releasing together — a joint EP, a remix series, a featured collab. Both bring their own communities. You want every contributor to get paid directly from streaming royalties and fan backing, proportional to their contribution, without issuing a token.',
    noTokenAction:
      'Use the split wizard to set each collaborator\'s percentage now. Publish the split sheet before the release. Both communities see the terms before they back it. Zero ambiguity, no handshake agreements.',
    metric:
      'Weighted fan engagement per artist — each creator\'s community boosting the shared release. Split weights match the contribution percentages in the split sheet.',
    splitConfig: {
      communityPool: 5,
      creatorPool: 90,
      treasury: 5,
      zaoStake: 0,
      note: 'Creator pool is split between both artists per the split sheet (e.g., 60/40 or 50/50 — you set it in the wizard). 5% community pool rewards fans who amplified the collab. No token = no ZAO stake.',
    },
    perks: [
      'Both artists\' communities get access to exclusive collab content',
      'Small community pool for top amplifiers (no token — just points + recognition)',
      'On-chain split sheet — publicly verifiable, no dispute possible',
      'Named in the weekly receipt if backing exceeds threshold',
    ],
    tokenPath: 'never',
    tokenNote:
      'No token needed for a collab split. The 0xSplits contract handles direct payments to all contributors. If one artist later wants to launch a token for their solo work, they do that separately — the collab split stays independent.',
    advisorPreset: { situation: 'collab', tokenTiming: 'never', feeModel: 'low' },
  },
]

export function getExampleBySlug(slug: string): SparkExample | undefined {
  return SPARK_EXAMPLES.find((e) => e.slug === slug)
}
