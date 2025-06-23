'use server';

import { cache } from 'react';
import sql from '@/lib/db';
import type { Agent } from '@/lib/types';

/**
 * Fetches agents for the default user from the database.
 * This function is cached to optimize data fetching.
 * @returns A promise that resolves to an array of agents.
 */
export const getAgents = cache(async (): Promise<Agent[]> => {
  try {
    // For now, we'll assume a single default user. This can be parameterized later.
    const agents = await sql<Agent[]>`SELECT * FROM agents WHERE user_id = 'default_user'`;
    return agents;
  } catch (error) {
    console.error('Database Error: Failed to fetch agents.', error);
    // If the table doesn't exist, it's not a fatal error on first run.
    if (error.message.includes('relation "agents" does not exist')) {
        return [];
    }
    throw error;
  }
});

/**
 * Fetches ALL agents from the database, for admin purposes.
 * This function is cached to optimize data fetching.
 * @returns A promise that resolves to an array of all agents.
 */
export const getAllAgents = cache(async (): Promise<Agent[]> => {
  try {
    const agents = await sql<Agent[]>`SELECT * FROM agents`;
    return agents;
  } catch (error) {
    console.error('Database Error: Failed to fetch all agents.', error);
    if (error.message.includes('relation "agents" does not exist')) {
        return [];
    }
    throw error;
  }
});


/**
 * Saves or updates an agent in the database.
 * @param agent The agent object to save.
 */
export async function saveAgent(agent: Agent) {
  const { id, name, description, status, is_custom, parameters, code, performance, user_id } = agent;
  try {
    await sql`
      INSERT INTO agents (id, name, description, status, is_custom, parameters, code, performance, user_id)
      VALUES (${id}, ${name}, ${description}, ${status}, ${is_custom}, ${sql.json(parameters)}, ${code}, ${sql.json(performance)}, ${user_id || 'default_user'})
      ON CONFLICT (id) 
      DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        status = EXCLUDED.status,
        is_custom = EXCLUDED.is_custom,
        parameters = EXCLUDED.parameters,
        code = EXCLUDED.code,
        performance = EXCLUDED.performance;
    `;
  } catch (error) {
    console.error(`Database Error: Failed to save agent ${id}.`, error);
    throw new Error('Failed to save agent.');
  }
}

/**
 * Updates the status of a specific agent.
 * @param agentId The ID of the agent to update.
 * @param status The new status.
 */
export async function updateAgentStatus(agentId: string, status: Agent['status']) {
  try {
    await sql`
      UPDATE agents
      SET status = ${status}
      WHERE id = ${agentId};
    `;
  } catch (error) {
    console.error(`Database Error: Failed to update status for agent ${agentId}.`, error);
    throw new Error('Failed to update agent status.');
  }
}
