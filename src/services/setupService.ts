'use server';

import sql from '@/lib/db';
import type { Agent, Mission } from '@/lib/types';
import { saveAgent } from './agentService';

/**
 * Creates all necessary tables for the application if they don't exist.
 */
export async function setupTables() {
  try {
    // Users Table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        wallet_address TEXT,
        wallet_chain TEXT,
        signals_generated INT NOT NULL DEFAULT 0,
        signals_won INT NOT NULL DEFAULT 0,
        bsai_earned NUMERIC NOT NULL DEFAULT 0,
        xp INT NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;
    console.log('Checked/created "users" table.');

    // Agents Table - with a foreign key to users
    await sql`
      CREATE TABLE IF NOT EXISTS agents (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        status TEXT NOT NULL DEFAULT 'Inactive',
        is_custom BOOLEAN NOT NULL DEFAULT true,
        parameters JSONB,
        code TEXT,
        performance JSONB,
        user_id TEXT REFERENCES users(id) ON DELETE CASCADE
      );
    `;
    console.log('Checked/created "agents" table.');

    // Missions Table
    await sql`
      CREATE TABLE IF NOT EXISTS missions (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        xp INT NOT NULL,
        reward JSONB
      );
    `;
    console.log('Checked/created "missions" table.');

    // User_Missions Table (Join table for completion status)
    await sql`
      CREATE TABLE IF NOT EXISTS user_missions (
        user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
        mission_id TEXT REFERENCES missions(id) ON DELETE CASCADE,
        completed_at TIMESTAMPTZ DEFAULT NOW(),
        PRIMARY KEY (user_id, mission_id)
      );
    `;
    console.log('Checked/created "user_missions" table.');

    // Signals Table
    await sql`
      CREATE TABLE IF NOT EXISTS signals (
        id BIGSERIAL PRIMARY KEY,
        user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
        asset TEXT NOT NULL,
        prediction TEXT NOT NULL,
        trade_mode TEXT NOT NULL,
        outcome TEXT NOT NULL,
        reward_bsai NUMERIC NOT NULL,
        reward_xp INT NOT NULL,
        gas_paid NUMERIC NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;
    console.log('Checked/created "signals" table.');
  } catch (error) {
      console.error('Error setting up database tables:', error);
      throw error;
  }
}

/**
 * Seeds the database with a default user if one doesn't exist.
 */
export async function seedInitialUser() {
    const result = await sql`SELECT COUNT(*) FROM users`;
    if (parseInt(result[0].count, 10) === 0) {
        console.log('Seeding default user...');
        await sql`INSERT INTO users (id, xp, signals_generated, signals_won, bsai_earned) VALUES ('default_user', 1850, 78, 62, 12450)`;
    }
}


/**
 * Seeds the database with initial agents if the table is empty.
 * Associates them with the default user.
 */
export async function seedInitialAgents(initialAgents: Agent[]) {
    const result = await sql`SELECT COUNT(*) FROM agents`;
    if (parseInt(result[0].count, 10) === 0) {
        console.log('Seeding initial agents...');
        for (const agent of initialAgents) {
            // All agents will belong to the default user for now
            const agentWithUser = { ...agent, user_id: 'default_user' };
            await saveAgent(agentWithUser);
        }
    }
}


/**
 * Seeds the database with initial missions if the table is empty.
 */
export async function seedInitialMissions(initialMissions: Mission[]) {
    const result = await sql`SELECT COUNT(*) FROM missions`;
    if (parseInt(result[0].count, 10) === 0) {
        console.log('Seeding initial missions...');
        for (const mission of initialMissions) {
            const { id, title, description, xp, reward } = mission;
            await sql`
                INSERT INTO missions (id, title, description, xp, reward)
                VALUES (${id}, ${title}, ${description}, ${xp}, ${sql.json(reward)})
            `;
        }
    }
}
