export interface AgentPerformance {
    signals: number;
    winRate: number; // as a percentage, e.g., 80 for 80%
}

export interface AgentParameters {
    symbol: string;
    tradeMode: string;
    risk: 'Low' | 'Medium' | 'High';
    indicators: string[];
}

export interface Agent {
    id: string;
    name: string;
    description: string;
    status: 'Active' | 'Inactive' | 'Training';
    isCustom: boolean;
    parameters: AgentParameters;
    code: string;
    performance: AgentPerformance;
    userId?: string;
    strategyId?: string;
}

export interface Mission {
    id: string;
    title: string;
    description: string;
    xp: number;
    reward: {
        type: 'NFT' | 'Key' | 'XP_Boost' | 'Badge' | 'Airdrop_Multiplier';
        name: string;
    };
}

export interface User {
    id: string;
    walletAddress: string | null;
    walletChain: string | null;
    signalsGenerated: number;
    signalsWon: number;
    bsaiEarned: number;
    xp: number;
    createdAt: string;
    updatedAt: string;
    name?: string;
    avatarUrl?: string;
    completedMissions: string[];
}

export interface UserMission {
    userId: string;
    missionId: string;
    completedAt: string;
}

export interface Signal {
    id?: number;
    userId: string;
    asset: string;
    prediction: 'BUY' | 'SELL' | 'HOLD';
    tradeMode: string;
    outcome: 'TP_HIT' | 'SL_HIT' | 'PENDING';
    rewardBsai: number;
    rewardXp: number;
    gasPaid: number;
    createdAt?: string;
    entryRange?: string;
    stopLoss?: string;
    takeProfit?: string;
    confidence?: number;
    shadowScore?: number;
}
