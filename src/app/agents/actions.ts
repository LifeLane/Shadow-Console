'use server';

import { revalidatePath } from 'next/cache';
import { getAgents, saveAgent, updateAgentStatus, setupAgentsTable, seedInitialAgents } from '@/services/agentService';
import type { Agent } from '@/lib/types';


export async function setupDatabaseAndSeed(initialAgents: Agent[]) {
  await setupAgentsTable();
  await seedInitialAgents(initialAgents);
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

export async function saveAgentAction(agent: Agent) {
  try {
    await saveAgent(agent);
    revalidatePath('/#agents'); // Or whatever the path to your agents tab is
  } catch (error) {
    console.error('Action Error: Failed to save agent.', error);
    throw new Error('Failed to save agent.');
  }
}

export async function updateAgentStatusAction(agentId: string, status: Agent['status']) {
  try {
    await updateAgentStatus(agentId, status);
    revalidatePath('/#agents');
  } catch (error) {
    console.error('Action Error: Failed to update agent status.', error);
    throw new Error('Failed to update agent status.');
  }
}
