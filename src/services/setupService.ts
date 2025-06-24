'use server';

import { query } from '@/lib/postgres'; // Changed import
import { createTablesSQL } from './schema';
import type { Agent, Mission, User } from '@/lib/types';

const initialMissionsToSeed: Mission[] = [
  { id: 'signal', title: 'Shadow Core: First Signal Test', description: 'Use the Market Command Console to generate and analyze one signal. Your input trains the Core!', xp: 50, reward: { type: 'NFT', name: 'ShadowBox NFT (Common)'} },
  { id: 'wallet', title: 'Sync Wallet with Polygon Network', description: 'Connect your primary wallet (ETH, SOL, or TON) and perform a test sync via Polygon for BSAI airdrop eligibility.', xp: 100, reward: { type: 'Key', name: 'ShadowNet Testnet Key'} },
  { id: 'share', title: 'Broadcast: Share Prediction on X', description: 'Share one of your Shadow Core predictions on X (Twitter) with #ShadowTrader.', xp: 75, reward: { type: 'XP_Boost', name: '+20% XP Boost (24h)'} },
  { id: 'learn', title: 'Intel Briefing: ShadowScore Module', description: 'Complete the "Intro to ShadowScore" learning module to understand Core analysis.', xp: 60, reward: { type: 'Badge', name: 'Shadow Analyst Badge'} },
  { id: 'daily_login', title: 'Daily Check-in: Report to Core', description: 'Log in daily to maintain your agent status and receive bonus XP.', xp: 25, reward: { type: 'Airdrop_Multiplier', name: 'Airdrop Multiplier +0.1x'} },
];

const initialAgentsData: Omit<Agent, 'id' | 'user_id'>[] = [
    { name: 'My ETH Momentum Bot', description: 'Custom agent focusing on ETH/USDT momentum.', status: 'Active', is_custom: true, parameters: { symbol: 'ETHUSDT', tradeMode: 'Intraday', risk: 'Medium', indicators: ['RSI', 'MACD'] }, strategy_id: 'momentum_rsi_macd', performance: { signals: 40, winRate: 85 } },
    { name: 'SOL Scalper v2', description: 'High-frequency scalping for SOL/USDT on the 5m timeframe.', status: 'Inactive', is_custom: true, parameters: { symbol: 'SOLUSDT', tradeMode: 'Scalping', risk: 'High', indicators: ['EMA', 'Volume Profile'] }, strategy_id: 'scalper_ema_volume', performance: { signals: 38, winRate: 72 } },
    { name: 'BTC Sentinel Prime', description: 'Balanced agent for BTC/USDT, operating on the 4h chart.', status: 'Inactive', is_custom: false, parameters: { symbol: 'BTCUSDT', tradeMode: 'Swing Trading', risk: 'Medium', indicators: ['Ichimoku Cloud', 'Fib Retracement'] }, strategy_id: 'premade_btc_sentinel_prime', performance: { signals: 0, winRate: 0 } },
];

async function seedTable<T extends { id: string }>(tableName: string, data: T[], mapFn: (item: T) => any) {
    for (const item of data) {
        const existing = await query(`SELECT id FROM ${tableName} WHERE id = $1`, [item.id]);
        if (existing.length === 0) {
            const columns = Object.keys(mapFn(item)).join(', ');
            const placeholders = Object.keys(mapFn(item)).map((_, index) => `$${index + 1}`).join(', ');
            const values = Object.values(mapFn(item));
            await query(`INSERT INTO ${tableName} (${columns}) VALUES (${placeholders})`, values);
            console.log(`Seeded record: ${item.id} in ${tableName}`);
        }
    }
}

/**
 * Ensures all necessary PostgreSQL tables exist and seeds them with initial data if they are empty.
 */
export async function setupAndSeedPostgreSQL() { // Renamed function
    try {
        // Create tables
        await query(createTablesSQL);
        console.log('PostgreSQL tables checked/created.');

        // Seed initial data if tables are empty
        const usersCount = await query<{ count: number }>(`SELECT COUNT(*) as count FROM users`);
        if (usersCount[0].count === 0) {
            const initialUser: User = { 
                id: 'default_user', 
                name: 'Shadow Agent 001', 
                xp: 1850, 
                signals_generated: 78, 
                signals_won: 62, 
                bsai_earned: 12450.00, 
                avatarUrl: 'https://placehold.co/100x100.png',
                wallet_address: null,
                wallet_chain: null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                completed_missions: [],
            };
            await seedTable<User>('users', [initialUser], (user) => ({
                id: user.id,
                name: user.name,
                xp: user.xp,
                signals_generated: user.signals_generated,
                signals_won: user.signals_won,
                bsai_earned: user.bsai_earned,
                avatarUrl: user.avatarUrl,
                wallet_address: user.wallet_address,
                wallet_chain: user.wallet_chain,
                created_at: user.created_at,
                updated_at: user.updated_at,
                completed_missions: JSON.stringify(user.completed_missions)
            }));
        }

        const agentsCount = await query<{ count: number }>(`SELECT COUNT(*) as count FROM agents`);
        if (agentsCount[0].count === 0) {
            const agentsToSeed = initialAgentsData.map(agent => ({
                ...agent,
                id: `agent-${agent.is_custom ? 'custom' : 'premade'}-${agent.name.toLowerCase().replace(/\s+/g, '-')}`,
                user_id: 'default_user'
            }));
            await seedTable<Agent>('agents', agentsToSeed, (agent) => ({
                id: agent.id,
                name: agent.name,
                description: agent.description,
                status: agent.status,
                is_custom: agent.is_custom,
                parameters: JSON.stringify(agent.parameters),
                strategy_id: agent.strategy_id,
                performance: JSON.stringify(agent.performance),
                user_id: agent.user_id
            }));
        }
        
        const missionsCount = await query<{ count: number }>(`SELECT COUNT(*) as count FROM missions`);
        if (missionsCount[0].count === 0) {
            await seedTable<Mission>('missions', initialMissionsToSeed, (mission) => ({
                id: mission.id,
                title: mission.title,
                description: mission.description,
                xp: mission.xp,
                reward_type: mission.reward.type,
                reward_name: mission.reward.name
            }));
        }

        console.log('PostgreSQL seeding complete.');

    } catch (error) {
        console.error('Error setting up and seeding PostgreSQL:', error);
        throw error;
    }
}
