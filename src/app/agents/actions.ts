'use server';

import { revalidatePath } from 'next/cache';
import { getAgents, saveAgent, updateAgentStatus } from '@/services/agentService';
import { setupAndSeedPostgreSQL } from '@/services/setupService'; // Changed import
import type { Agent, User } from '@/lib/types';
import { getUser } from '@/services/userService';

export async function setupDatabaseAndSeed() {
  await setupAndSeedPostgreSQL(); // Changed function call
}

export async function getAgentsAction(): Promise<Agent[]> {
  try {
    const agents = await getAgents();
    return agents;
  } catch (error) {
    console.error('Action Error: Failed to get agents.', error);
    return [];
  }
}

export async function getUserAction(userId: string): Promise<User | null> {
    try {
        return await getUser(userId);
    } catch (error) {
        console.error(`Action Error: Failed to get user ${userId}.`, error);
        return null;
    }
}

export async function saveAgentAction(agent: Agent) {
  try {
    await saveAgent(agent);
    revalidatePath('/');
  } catch (error) {
    console.error('Action Error: Failed to save agent.', error);
    throw new Error('Failed to save agent.');
  }
}

export async function updateAgentStatusAction(agentId: string, status: Agent['status']) {
  try {
    await updateAgentStatus(agentId, status);
    revalidatePath('/');
  } catch (error) {
    console.error('Action Error: Failed to update agent status.', error);
    throw new Error('Failed to update agent status.');
  }
}
