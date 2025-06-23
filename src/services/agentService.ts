'use server';

import sql from '@/lib/db';
import type { Agent } from '@/lib/types';

/**
 * Creates the agents table in the database if it doesn't exist.
 */
export async function setupAgentsTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS agents (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      status TEXT NOT NULL DEFAULT 'Inactive',
      is_custom BOOLEAN NOT NULL DEFAULT true,
      parameters JSONB,
      code TEXT,
      performance JSONB
    );
  `;
}

/**
 * Fetches all agents from the database.
 * @returns A promise that resolves to an array of agents.
 */
export async function getAgents(): Promise<Agent[]> {
  try {
    const agents = await sql<Agent[]>`SELECT * FROM agents`;
    return agents;
  } catch (error) {
    console.error('Database Error: Failed to fetch agents.', error);
    return [];
  }
}

/**
 * Saves or updates an agent in the database.
 * @param agent The agent object to save.
 */
export async function saveAgent(agent: Agent) {
  const { id, name, description, status, is_custom, parameters, code, performance } = agent;
  try {
    await sql`
      INSERT INTO agents (id, name, description, status, is_custom, parameters, code, performance)
      VALUES (${id}, ${name}, ${description}, ${status}, ${is_custom}, ${sql.json(parameters)}, ${code}, ${sql.json(performance)})
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

/**
 * Seeds the database with initial premade agents if the table is empty.
 * @param initialAgents An array of agents to seed.
 */
export async function seedInitialAgents(initialAgents: Agent[]) {
    try {
        const result = await sql`SELECT COUNT(*) FROM agents`;
        const count = parseInt(result[0].count, 10);

        if (count === 0) {
            console.log('No agents found, seeding initial data...');
            for (const agent of initialAgents) {
                await saveAgent(agent);
            }
            console.log('Seeding complete.');
        }
    } catch (error) {
        // This can happen if the table doesn't exist yet, which is fine on first run.
        if (error.message.includes('relation "agents" does not exist')) {
            console.log('Agents table does not exist. It will be created.');
        } else {
            console.error('Database Error: Failed to seed initial agents.', error);
        }
    }
}
