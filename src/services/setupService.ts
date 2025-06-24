'use server';

import { writeDb } from '@/lib/file-system-db';
import type { Agent, Mission, User } from '@/lib/types';
import fs from 'fs/promises';
import path from 'path';

// Define paths for data files
const DATA_DIR = path.resolve(process.cwd(), 'src/data');
const USERS_PATH = path.join(DATA_DIR, 'users.json');
const AGENTS_PATH = path.join(DATA_DIR, 'agents.json');
const MISSIONS_PATH = path.join(DATA_DIR, 'missions.json');
const SIGNALS_PATH = path.join(DATA_DIR, 'signals.json');

// Initial seed data
const initialMissionsToSeed: Mission[] = [
  { id: 'signal', title: 'Shadow Core: First Signal Test', description: 'Use the Market Command Console to generate and analyze one signal. Your input trains the Core!', xp: 50, reward: { type: 'NFT', name: 'ShadowBox NFT (Common)'} },
  { id: 'wallet', title: 'Sync Wallet with Polygon Network', description: 'Connect your primary wallet (ETH, SOL, or TON) and perform a test sync via Polygon for BSAI airdrop eligibility.', xp: 100, reward: { type: 'Key', name: 'ShadowNet Testnet Key'} },
  { id: 'share', title: 'Broadcast: Share Prediction on X', description: 'Share one of your Shadow Core predictions on X (Twitter) with #ShadowTrader.', xp: 75, reward: { type: 'XP_Boost', name: '+20% XP Boost (24h)'} },
  { id: 'learn', title: 'Intel Briefing: ShadowScore Module', description: 'Complete the "Intro to ShadowScore" learning module to understand Core analysis.', xp: 60, reward: { type: 'Badge', name: 'Shadow Analyst Badge'} },
  { id: 'daily_login', title: 'Daily Check-in: Report to Core', description: 'Log in daily to maintain your agent status and receive bonus XP.', xp: 25, reward: { type: 'Airdrop_Multiplier', name: 'Airdrop Multiplier +0.1x'} },
];

const initialAgentsToSeed: Agent[] = [
    { id: 'agent-custom-my-eth-momentum-bot', name: 'My ETH Momentum Bot', description: 'Custom agent focusing on ETH/USDT momentum.', status: 'Active', isCustom: true, parameters: { symbol: 'ETHUSDT', tradeMode: 'Intraday', risk: 'Medium', indicators: ['RSI', 'MACD'] }, code: '// Custom logic', performance: { signals: 40, winRate: 85 }, userId: 'default_user' },
    { id: 'agent-custom-sol-scalper-v2', name: 'SOL Scalper v2', description: 'High-frequency scalping for SOL/USDT on the 5m timeframe.', status: 'Inactive', isCustom: true, parameters: { symbol: 'SOLUSDT', tradeMode: 'Scalping', risk: 'High', indicators: ['EMA', 'Volume Profile'] }, code: '// Custom logic', performance: { signals: 38, winRate: 72 }, userId: 'default_user' },
    { id: 'agent-premade-btc-sentinel-prime', name: 'BTC Sentinel Prime', description: 'Balanced agent for BTC/USDT, operating on the 4h chart.', status: 'Inactive', isCustom: false, parameters: { symbol: 'BTCUSDT', tradeMode: 'Swing Trading', risk: 'Medium', indicators: ['Ichimoku Cloud', 'Fib Retracement'] }, code: '// Premade logic', performance: { signals: 0, winRate: 0 }, userId: 'default_user' },
];

const initialUserToSeed: User[] = [{
    id: 'default_user',
    name: 'Shadow Agent 001',
    xp: 1850,
    signalsGenerated: 78,
    signalsWon: 62,
    bsaiEarned: 12450.00,
    avatarUrl: 'https://placehold.co/100x100.png',
    walletAddress: null,
    walletChain: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    completedMissions: [],
}];

async function fileExists(filePath: string): Promise<boolean> {
    try {
        await fs.access(filePath);
        return true;
    } catch {
        return false;
    }
}

async function seedFile<T>(filePath: string, data: T) {
    if (!(await fileExists(filePath))) {
        await writeDb(filePath, data);
        console.log(`Seeded file: ${path.basename(filePath)}`);
    }
}

/**
 * Ensures all necessary JSON data files exist and seeds them with initial data if they are not present.
 */
export async function setupAndSeedLocalData() {
    try {
        // Ensure data directory exists
        await fs.mkdir(DATA_DIR, { recursive: true });

        // Seed initial data if files don't exist
        await Promise.all([
            seedFile(USERS_PATH, initialUserToSeed),
            seedFile(AGENTS_PATH, initialAgentsToSeed),
            seedFile(MISSIONS_PATH, initialMissionsToSeed),
            seedFile(SIGNALS_PATH, []) // Start with empty signals
        ]);

        console.log('Local data store setup check complete.');

    } catch (error) {
        console.error('Error setting up and seeding local data:', error);
        throw error;
    }
}
