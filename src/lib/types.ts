
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
    is_custom: boolean; // Changed to match db snake_case
    parameters: AgentParameters;
    code: string;
    performance: AgentPerformance;
    user_id?: string;
}

// This is the type for data stored in the `missions` table.
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

// This is the type for data stored in the `users` table.
export interface User {
    id: string;
    wallet_address: string | null;
    wallet_chain: string | null;
    signals_generated: number;
    signals_won: number;
    bsai_earned: number;
    xp: number;
    created_at: string;
    updated_at: string;
}
