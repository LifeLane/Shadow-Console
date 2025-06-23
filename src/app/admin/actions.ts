'use server';

import { getAgents } from '@/services/agentService';
import type { Agent } from '@/lib/types';

export async function getAllAgentsForExport(): Promise<Agent[]> {
    try {
        const agents = await getAgents();
        return agents;
    } catch (error) {
        console.error('Failed to fetch agents for export', error);
        return [];
    }
}
