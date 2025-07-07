

export interface User {
    id: string;
    name: string; // This will be the editable username
    xp: number;
    winRate: number; // Overall trade win rate %
    signalAccuracy: number; // Prediction accuracy %
    shadowBalance: number;
    stakedAmount: number;
    avatarUrl?: string; // Kept for potential future use, but replaced by AnimatedAvatar
    completedMissions: string[];
    walletAddress?: string; // This is the user's main wallet
    hasRegisteredForAirdrop: boolean; // Tracks airdrop form completion
    nameEditable: boolean; // Tracks if the name can be changed
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
    reasoning?: string;
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

export interface Market {
    symbol: string;
    label: string;
}

export interface Ticker24h {
    symbol: string;
    priceChange: string;
    priceChangePercent: string;
    weightedAvgPrice: string;
    prevClosePrice: string;
    lastPrice: string;
    lastQty: string;
    bidPrice: string;
    bidQty: string;
    askPrice: string;
    askQty: string;
    openPrice: string;
    highPrice: string;
    lowPrice: string;
    volume: string;
    quoteVolume: string;
    openTime: number;
    closeTime: number;
    firstId: number;
    lastId: number;
    count: number;
}

export interface AirdropRegistration {
    userId: string;
    email?: string;
    phone?: string;
    twitterHandle?: string;
    telegramHandle?: string;
    youtubeHandle?: string;
    airdropWalletType: 'ETH' | 'SOL' | 'TON';
    airdropWalletAddress: string;
    timestamp: string;
}
