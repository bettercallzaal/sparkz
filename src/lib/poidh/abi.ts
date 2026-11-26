// Minimal human-readable ABI for PoidhV3 on Base (picsoritdidnthappen/poidh-v3,
// src/PoidhV3.sol). Only what Sparkz reads or lets a signed-in wallet send. Signatures
// were checked against the contract source. Sparkz never signs: the writes below are
// built in the browser and signed by the user's own wallet (an EOA - the contract refuses
// contract wallets with ContractsCannotCreateBounties).
//
// Base mainnet deployment. If poidh redeploys, change this constant.
export const POIDH_CONTRACT_ADDRESS = "0x5555Fa783936C260f77385b4E153B9725feF1719" as const;
export const POIDH_CHAIN_ID = 8453; // Base
export const POIDH_SITE = "https://poidh.xyz";

// poidh numbers its bounty PAGES differently from the contract. On Base, the v3 contract
// (POIDH_CONTRACT_ADDRESS) restarted its on-chain ids at 0, and poidh.xyz shows a v3 bounty
// at /base/bounty/<on-chain id + 986>.
// Source: poidh-app src/utils/constants.ts line 24, BASE_LAST_PRE_V3_BOUNTY = 986; checked
// against poidh.xyz/bounties/data, where on-chain id 582 is listed as id 1568.
// If poidh moves this boundary, this constant must move with it.
export const POIDH_BASE_LAST_PRE_V3_BOUNTY = 986;

// The id poidh.xyz uses in its bounty URL for a bounty on the Base v3 contract. Only for
// building links and labels: every stored id and every contract read uses the on-chain id.
export function poidhUrlId(onChainId: bigint | number | string): string {
  return (BigInt(onChainId) + BigInt(POIDH_BASE_LAST_PRE_V3_BOUNTY)).toString();
}

export function poidhBountyUrl(onChainId: bigint | number | string): string {
  return `${POIDH_SITE}/base/bounty/${poidhUrlId(onChainId)}`;
}

export const poidhAbi = [
  // reads
  "function MIN_BOUNTY_AMOUNT() view returns (uint256)",
  "function MIN_CONTRIBUTION() view returns (uint256)",
  "function bounties(uint256) view returns (uint256 id, address issuer, string name, string description, uint256 amount, address claimer, uint256 createdAt, uint256 claimId)",
  "function getBountiesLength() view returns (uint256)",
  "function getClaimsByBountyId(uint256 bountyId, uint256 offset) view returns ((uint256 id, address issuer, uint256 bountyId, address bountyIssuer, string name, string description, uint256 createdAt, bool accepted)[])",
  "function getParticipantsPaged(uint256 bountyId, uint256 offset, uint256 limit) view returns (address[] addrs, uint256[] amts)",
  "function bountyCurrentVotingClaim(uint256) view returns (uint256)",
  "function bountyVotingTracker(uint256) view returns (uint256 yes, uint256 no, uint256 deadline)",
  "function voteRound(uint256) view returns (uint256)",
  // writes (signed by the user's wallet in the browser)
  "function createOpenBounty(string name, string description) payable",
  "function joinOpenBounty(uint256 bountyId) payable",
  "function createClaim(uint256 bountyId, string name, string description, string uri)",
  "function submitClaimForVote(uint256 bountyId, uint256 claimId)",
  "function voteClaim(uint256 bountyId, bool vote)",
  "function resolveVote(uint256 bountyId)",
  "function acceptClaim(uint256 bountyId, uint256 claimId)",
  "function cancelOpenBounty(uint256 bountyId)",
  // event the server reads from the creation receipt
  "event BountyCreated(uint256 indexed id, address indexed issuer, string title, string description, uint256 amount, uint256 createdAt, bool isOpenBounty, uint256 round)",
] as const;
