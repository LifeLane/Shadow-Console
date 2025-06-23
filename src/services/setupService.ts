'use server';

import { promises as fs } from 'fs';
import path from 'path';
import type { Agent, Mission, User } from '@/lib/types';

const initialMissionsToSeed: Mission[] = [
  { id: 'signal', title: 'Shadow Core: First Signal Test', description: 'Use the Market Command Console to generate and analyze one signal. Your input trains the Core!', xp: 50, reward: { type: 'NFT', name: 'ShadowBox NFT (Common)'} },
  { id: 'wallet', title: 'Sync Wallet with Polygon Network', description: 'Connect your primary wallet (ETH, SOL, or TON) and perform a test sync via Polygon for BSAI airdrop eligibility.', xp: 100, reward: { type: 'Key', name: 'ShadowNet Testnet Key'} },
  { id: 'share', title: 'Broadcast: Share Prediction on X', description: 'Share one of your Shadow Core predictions on X (Twitter) with #ShadowTrader.', xp: 75, reward: { type: 'XP_Boost', name: '+20% XP Boost (24h)'} },
  { id: 'learn', title: 'Intel Briefing: ShadowScore Module', description: 'Complete the "Intro to ShadowScore" learning module to understand Core analysis.', xp: 60, reward: { type: 'Badge', name: 'Shadow Analyst Badge'} },
  { id: 'daily_login', title: 'Daily Check-in: Report to Core', description: 'Log in daily to maintain your agent status and receive bonus XP.', xp: 25, reward: { type: 'Airdrop_Multiplier', name: 'Airdrop Multiplier +0.1x'} },
];

const initialAgentsData: Omit<Agent, 'id' | 'user_id'>[] = [
    { name: 'My ETH Momentum Bot', description: 'Custom agent focusing on ETH/USDT momentum.', status: 'Active', is_custom: true, parameters: { symbol: 'ETHUSDT', tradeMode: 'Intraday', risk: 'Medium', indicators: ['RSI', 'MACD'] }, code: `// Strategy: Momentum\n// Indicators: RSI, MACD\n\nif (crossover(rsi, 70)) {\n  sell();\n} else if (crossover(rsi, 30)) {\n  buy();\n}`, performance: { signals: 40, winRate: 85 } },
    { name: 'SOL Scalper v2', description: 'High-frequency scalping for SOL/USDT on the 5m timeframe.', status: 'Inactive', is_custom: true, parameters: { symbol: 'SOLUSDT', tradeMode: 'Scalping', risk: 'High', indicators: ['EMA', 'Volume Profile'] }, code: `// Strategy: High-frequency\n// Indicators: EMA, Volume\n\nfunction onTick(price, indicators) {\n  if (price > indicators.ema_fast) {\n    return 'BUY';\n  }\n  return 'SELL';\n}`, performance: { signals: 38, winRate: 72 } },
    { name: 'BTC Sentinel Prime', description: 'Balanced agent for BTC/USDT, operating on the 4h chart.', status: 'Inactive', is_custom: false, parameters: { symbol: 'BTCUSDT', tradeMode: 'Swing Trading', risk: 'Medium', indicators: ['Ichimoku Cloud', 'Fib Retracement'] }, code: '// PREMADE AGENT LOGIC - PROTECTED', performance: { signals: 0, winRate: 0 } },
];

const dataDir = path.join(process.cwd(), 'src', 'data');

async function ensureFile(filePath: string, defaultContent: string) {
    try {
        await fs.access(filePath);
    } catch (e) {
        if (e.code === 'ENOENT') {
            await fs.writeFile(filePath, defaultContent, 'utf-8');
            console.log(`Created data file: ${path.basename(filePath)}`);
        } else {
            throw e;
        }
    }
}

async function seedFile<T>(filePath: string, data: T[]) {
    try {
        const fileContent = await fs.readFile(filePath, 'utf-8');
        const existingData = JSON.parse(fileContent);
        if (existingData.length === 0) {
            await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
            console.log(`Seeded data file: ${path.basename(filePath)}`);
        }
    } catch (error) {
        console.error(`Error seeding file ${path.basename(filePath)}:`, error);
    }
}

/**
 * Ensures all necessary JSON data files exist and seeds them with initial data if they are empty.
 */
export async function setupAndSeedLocalJson() {
    try {
        await fs.mkdir(dataDir, { recursive: true });

        // Ensure all files exist with a default empty array/object
        await ensureFile(path.join(dataDir, 'users.json'), '[]');
        await ensureFile(path.join(dataDir, 'agents.json'), '[]');
        await ensureFile(path.join(dataDir, 'missions.json'), '[]');
        await ensureFile(path.join(dataDir, 'user_missions.json'), '{}');
        await ensureFile(path.join(dataDir, 'signals.json'), '[]');

        // Seed initial data if files are empty
        const initialUser: User = { 
            id: 'default_user', 
            name: 'Shadow Agent 001', 
            xp: 1850, 
            signals_generated: 78, 
            signals_won: 62, 
            bsai_earned: 12450, 
            avatarUrl: 'https://placehold.co/100x100.png',
            wallet_address: null,
            wallet_chain: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        await seedFile(path.join(dataDir, 'users.json'), [initialUser]);

        const agentsToSeed = initialAgentsData.map(agent => ({
            ...agent,
            id: `agent-${agent.is_custom ? 'custom' : 'premade'}-${agent.name.toLowerCase().replace(/\s+/g, '-')}`,
            user_id: 'default_user'
        }));
        await seedFile(path.join(dataDir, 'agents.json'), agentsToSeed);
        
        await seedFile(path.join(dataDir, 'missions.json'), initialMissionsToSeed);

    } catch (error) {
        console.error('Error setting up local JSON data store:', error);
        throw error;
    }
}
