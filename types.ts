
export enum ActorType {
  AUTHORITY = 'Authority',
  ADMIN = 'Administrator',
  FARMER = 'Farmer',
  PROCESSOR = 'Processor',
  TRANSPORTER = 'Transporter',
  ROASTER = 'Roaster',
  RETAILER = 'Retailer'
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
  roles: string[];
}

export interface BaseData {
  actorType: string;
  notes?: string;
}

export interface StageData extends BaseData {
  [key: string]: any;
}

export interface TrustAnalysis {
  trustScore: number;
  anomalies: string[];
  suggestions: string[];
  isVerified: boolean;
}

export interface Block {
  index: number;
  timestamp: number;
  actor: string;
  category?: string;
  data: StageData;
  emissions: number;
  cumulativeEmissions: number;
  previousHash: string;
  hash: string;
  trustAnalysis?: TrustAnalysis;
  isTampered?: boolean;
}

export interface BlockchainState {
  chain: Block[];
  isValid: boolean;
}
