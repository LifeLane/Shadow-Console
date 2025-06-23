
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
}
