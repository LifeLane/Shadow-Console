

export interface User {
    id: string;
    name: string;
    xp: number;
    winRate: number; // Overall trade win rate %
    signalAccuracy: number; // Prediction accuracy %
    shadowBalance: number;
    stakedAmount: number;
    avatarUrl?: string;
    completedMissions: string[];
    walletAddress?: string;
}

export interface Trade {
    id: number;
    userId: string;
    asset: string; // e.g., BTCUSDT
    side: 'LONG' | 'SHORT';
    entryPrice: number;
    takeProfit: number;
    stopLoss: number;
    stake: number; // Amount of SHADOW tokens
    status: 'OPEN' | 'CLOSED';
    pnl?: number; // Profit and Loss in SHADOW tokens
    closePrice?: number;
    timestamp: string;
}

export interface Signal {
    id: number;
    userId: string;
    asset: string;
    prediction: 'LONG' | 'SHORT' | 'HOLD';
    confidence: number;
    entryPrice: number;
    takeProfit: number;
    stopLoss: number;
    status: 'PENDING' | 'WIN' | 'LOSS';
    source: 'AI_ORACLE' | 'MANUAL';
    timestamp: string;
}

export interface Mission {
    id: string;
    title: string;
    description: string;
    xp: number;
    reward: {
        type: 'SHADOW' | 'XP_BOOST' | 'NFT_SKIN';
        amount: number;
    };
}

export interface WalletStats {
    userId: string;
    shadowBalance: number;
    stakedAmount: number;
    miningPower: number; // SHADOW per hour
    apr: number; // Annual Percentage Rate
}

export type Message = {
    role: 'user' | 'model';
    text: string;
};
