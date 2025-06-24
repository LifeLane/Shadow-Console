'use server';

import { query } from '@/lib/postgres';
import type { Agent } from '@/lib/types';

/**
 * Fetches agents for the default user from PostgreSQL.
 * @returns A promise that resolves to an array of agents.
 */
export async function getAgents(): Promise<Agent[]> {
    try {
        const agents = await query<Agent>(`SELECT * FROM agents WHERE user_id = $1`, ['default_user']);
        return agents.map(agent => ({
            ...agent,
            parameters: JSON.parse(agent.parameters as any),
            performance: JSON.parse(agent.performance as any),
        }));
    } catch (error) {
        console.error('Error fetching agents:', error);
        throw new Error('Could not retrieve agents data.');
    }
}

/**
 * Fetches ALL agents from PostgreSQL for admin purposes.
 * @returns A promise that resolves to an array of all agents.
 */
export async function getAllAgents(): Promise<Agent[]> {
    try {
        const agents = await query<Agent>(`SELECT * FROM agents`);
        return agents.map(agent => ({
            ...agent,
            parameters: JSON.parse(agent.parameters as any),
            performance: JSON.parse(agent.performance as any),
        }));
    } catch (error) {
        console.error('Error fetching all agents:', error);
        throw new Error('Could not retrieve all agents data.');
    }
}

/**
 * Saves or updates an agent in PostgreSQL.
 * @param agent The agent object to save.
 */
export async function saveAgent(agent: Agent) {
    try {
        const existingAgent = await query(`SELECT id FROM agents WHERE id = $1`, [agent.id]);

        const agentToSave = {
            ...agent,
            user_id: agent.user_id || 'default_user',
            parameters: JSON.stringify(agent.parameters),
            performance: JSON.stringify(agent.performance),
        };

        if (existingAgent.length > 0) {
            // Update existing agent
            await query(
                `UPDATE agents SET name = $1, description = $2, status = $3, is_custom = $4, parameters = $5, strategy_id = $6, performance = $7, user_id = $8 WHERE id = $9`,
                [
                    agentToSave.name,
                    agentToSave.description,
                    agentToSave.status,
                    agentToSave.is_custom,
                    agentToSave.parameters,
                    agentToSave.strategy_id,
                    agentToSave.performance,
                    agentToSave.user_id,
                    agentToSave.id,
                ]
            );
        } else {
            // Insert new agent
            await query(
                `INSERT INTO agents (id, name, description, status, is_custom, parameters, strategy_id, performance, user_id)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
                [
                    agentToSave.id,
                    agentToSave.name,
                    agentToSave.description,
                    agentToSave.status,
                    agentToSave.is_custom,
                    agentToSave.parameters,
                    agentToSave.strategy_id,
                    agentToSave.performance,
                    agentToSave.user_id,
                ]
            );
        }
    } catch (error) {
        console.error(`Error saving agent ${agent.id}:`, error);
        throw new Error(`Could not save agent ${agent.id}.`);
    }
}

/**
 * Updates the status of a specific agent in PostgreSQL.
 * @param agentId The ID of the agent to update.
 * @param status The new status.
 */
export async function updateAgentStatus(agentId: string, status: Agent['status']) {
    try {
        await query(
            `UPDATE agents SET status = $1 WHERE id = $2`,
            [status, agentId]
        );
    } catch (error) {
        console.error(`Error updating status for agent ${agentId}:`, error);
        throw new Error(`Could not update status for agent ${agentId}.`);
    }
}
