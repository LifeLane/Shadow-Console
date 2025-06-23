'use server';

import { getAllAgents } from '@/services/agentService';
import { getUsers } from '@/services/userService';
import type { Agent, User } from '@/lib/types';

export async function exportAllData() {
    try {
        const agents = await getAllAgents();
        const users = await getUsers();
        // In the future, you could also export missions and signals here.
        return {
            agents,
            users,
            timestamp: new Date().toISOString(),
        };
    } catch (error) {
        console.error('Failed to fetch data for export', error);
        throw new Error('Data export failed');
    }
}
