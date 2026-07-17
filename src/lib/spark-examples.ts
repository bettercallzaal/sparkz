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
      'Start with patronage. If the group fund reaches a milestone (e.g. 50 backers, $5k raised), graduate to a token. The backers become token holders — their proof-of-backing maps directly to allocation.',
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
]

export function getExampleBySlug(slug: string): SparkExample | undefined {
  return SPARK_EXAMPLES.find((e) => e.slug === slug)
}
