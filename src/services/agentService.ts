'use server';

import { promises as fs } from 'fs';
import path from 'path';
import type { Agent } from '@/lib/types';

const dataFilePath = path.join(process.cwd(), 'src', 'data', 'agents.json');

async function readAgents(): Promise<Agent[]> {
    try {
        const fileContent = await fs.readFile(dataFilePath, 'utf-8');
        return JSON.parse(fileContent);
    } catch (error) {
        if (error.code === 'ENOENT') {
            return []; // File doesn't exist, return empty array
        }
        console.error('Error reading agents file:', error);
        throw new Error('Could not read agents data.');
    }
}

async function writeAgents(agents: Agent[]) {
    try {
        await fs.writeFile(dataFilePath, JSON.stringify(agents, null, 2), 'utf-8');
    } catch (error) {
        console.error('Error writing agents file:', error);
        throw new Error('Could not write agents data.');
    }
}

/**
 * Fetches agents for the default user from the local JSON file.
 * @returns A promise that resolves to an array of agents.
 */
export async function getAgents(): Promise<Agent[]> {
    const allAgents = await readAgents();
    return allAgents.filter(agent => agent.user_id === 'default_user');
}

/**
 * Fetches ALL agents from the local JSON file for admin purposes.
 * @returns A promise that resolves to an array of all agents.
 */
export async function getAllAgents(): Promise<Agent[]> {
    return readAgents();
}

/**
 * Saves or updates an agent in the local JSON file.
 * @param agent The agent object to save.
 */
export async function saveAgent(agent: Agent) {
    const agents = await readAgents();
    const agentIndex = agents.findIndex(a => a.id === agent.id);

    const agentToSave = { ...agent, user_id: agent.user_id || 'default_user' };

    if (agentIndex > -1) {
        agents[agentIndex] = agentToSave;
    } else {
        agents.push(agentToSave);
    }
    await writeAgents(agents);
}

/**
 * Updates the status of a specific agent.
 * @param agentId The ID of the agent to update.
 * @param status The new status.
 */
export async function updateAgentStatus(agentId: string, status: Agent['status']) {
    const agents = await readAgents();
    const agentIndex = agents.findIndex(a => a.id === agentId);

    if (agentIndex > -1) {
        agents[agentIndex].status = status;
        await writeAgents(agents);
    } else {
        throw new Error(`Agent with id ${agentId} not found.`);
    }
}
