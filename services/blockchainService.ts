
import { Block, StageData } from '../types';

// Helper to compute SHA-256 hash
async function computeHash(
  index: number,
  previousHash: string,
  timestamp: number,
  data: StageData,
  emissions: number
): Promise<string> {
  const content = `${index}${previousHash}${timestamp}${JSON.stringify(data)}${emissions}`;
  const msgBuffer = new TextEncoder().encode(content);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Fix: Changed actor parameter to string to support dynamic roles from categories and resolve App.tsx type error
export const createBlock = async (
  chain: Block[],
  actor: string,
  data: StageData,
  emissions: number,
  trustAnalysis?: any
): Promise<Block> => {
  const previousBlock = chain[chain.length - 1];
  const index = chain.length;
  const timestamp = Date.now();
  const previousHash = previousBlock ? previousBlock.hash : '0';
  const cumulativeEmissions = (previousBlock ? previousBlock.cumulativeEmissions : 0) + emissions;

  const hash = await computeHash(index, previousHash, timestamp, data, emissions);

  return {
    index,
    timestamp,
    actor,
    data,
    emissions,
    cumulativeEmissions,
    previousHash,
    hash,
    trustAnalysis,
    isTampered: false,
  };
};

export const validateChain = async (chain: Block[]): Promise<boolean[]> => {
  const validity = await Promise.all(
    chain.map(async (block, i) => {
      if (i === 0) return true; // Genesis block assumed valid for this demo
      const prevBlock = chain[i - 1];
      
      // check link
      if (block.previousHash !== prevBlock.hash) return false;

      // check data integrity (recompute hash)
      const targetHash = await computeHash(
        block.index,
        block.previousHash,
        block.timestamp,
        block.data,
        block.emissions
      );

      return targetHash === block.hash;
    })
  );
  return validity;
};

// Simulation function to "hack" a block
export const tamperBlock = async (block: Block): Promise<Block> => {
    return {
        ...block,
        data: { ...block.data, notes: "HACKED DATA" }, // Modify payload
        // We do NOT update the hash, to simulate a mismatch
    };
}
