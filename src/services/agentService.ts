'use server';

import { readDb, writeDb } from '@/lib/file-system-db';
import type { Agent } from '@/lib/types';
import path from 'path';

const AGENTS_DB_PATH = path.resolve(process.cwd(), 'src/data/agents.json');

async function getAgentsData(): Promise<Agent[]> {
    return await readDb<Agent[]>(AGENTS_DB_PATH);
}

/**
 * Fetches agents for the default user from the local JSON file.
 * @returns A promise that resolves to an array of agents.
 */
export async function getAgents(): Promise<Agent[]> {
    try {
        const agents = await getAgentsData();
        return agents.filter(agent => agent.userId === 'default_user');
    } catch (error) {
        console.error('Error fetching agents:', error);
        throw new Error('Could not retrieve agents data.');
    }
}

/**
 * Fetches ALL agents from the local JSON file for admin purposes.
 * @returns A promise that resolves to an array of all agents.
 */
export async function getAllAgents(): Promise<Agent[]> {
    try {
        return await getAgentsData();
    } catch (error) {
        console.error('Error fetching all agents:', error);
        throw new Error('Could not retrieve all agents data.');
    }
}

/**
 * Saves or updates an agent in the local JSON file.
 * @param agent The agent object to save.
 */
export async function saveAgent(agent: Agent) {
    try {
        const agents = await getAgentsData();
        const agentIndex = agents.findIndex(a => a.id === agent.id);

        const agentToSave = {
            ...agent,
            userId: agent.userId || 'default_user',
        };

        if (agentIndex > -1) {
            agents[agentIndex] = agentToSave;
        } else {
            agents.push(agentToSave);
        }

        await writeDb(AGENTS_DB_PATH, agents);
    } catch (error) {
        console.error(`Error saving agent ${agent.id}:`, error);
        throw new Error(`Could not save agent ${agent.id}.`);
    }
}

/**
 * Updates the status of a specific agent in the local JSON file.
 * @param agentId The ID of the agent to update.
 * @param status The new status.
 */
export async function updateAgentStatus(agentId: string, status: Agent['status']) {
    try {
        const agents = await getAgentsData();
        const agentIndex = agents.findIndex(a => a.id === agentId);
        
        if (agentIndex > -1) {
            agents[agentIndex].status = status;
            await writeDb(AGENTS_DB_PATH, agents);
        } else {
            throw new Error(`Agent with ID ${agentId} not found.`);
        }
    } catch (error) {
        console.error(`Error updating status for agent ${agentId}:`, error);
        throw new Error(`Could not update status for agent ${agentId}.`);
    }
}
