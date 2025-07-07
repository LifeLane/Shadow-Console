
'use server';

import { writeDb } from '@/lib/file-system-db';
import type { User, Mission, Signal, Trade } from '@/lib/types';
import fs from 'fs/promises';
import path from 'path';

// Define paths for data files
const DATA_DIR = path.resolve(process.cwd(), 'src/data');
const USERS_PATH = path.join(DATA_DIR, 'users.json');
const MISSIONS_PATH = path.join(DATA_DIR, 'missions.json');
const SIGNALS_PATH = path.join(DATA_DIR, 'signals.json');
const TRADES_PATH = path.join(DATA_DIR, 'trades.json');
const USER_MISSIONS_PATH = path.join(DATA_DIR, 'user_missions.json');


// Initial seed data
const initialUsers: User[] = [
    { id: 'default_user', name: 'Neon Pilot', xp: 1250, winRate: 68, signalAccuracy: 74, shadowBalance: 5000, stakedAmount: 1500, avatarUrl: 'https://placehold.co/100x100.png', completedMissions: ['trade_5'], walletAddress: '0x123...abc' },
    { id: 'bot_1', name: 'Cypher Runner', xp: 8420, winRate: 75, signalAccuracy: 81, shadowBalance: 1000, stakedAmount: 0, avatarUrl: 'https://placehold.co/100x100.png', completedMissions: [], walletAddress: '0x456...def'},
    { id: 'bot_2', name: 'Grid Ghost', xp: 5100, winRate: 62, signalAccuracy: 68, shadowBalance: 1000, stakedAmount: 0, avatarUrl: 'https://placehold.co/100x100.png', completedMissions: [], walletAddress: '0x789...ghi'},
    { id: 'bot_3', name: 'Oracle Lord', xp: 9500, winRate: 88, signalAccuracy: 92, shadowBalance: 1000, stakedAmount: 0, avatarUrl: 'https://placehold.co/100x100.png', completedMissions: [], walletAddress: '0xabc...123'},
];

const initialMissions: Mission[] = [
    { id: 'trade_5', title: 'Arena Warmup', description: 'Complete 5 trades in the Trade Arena today.', xp: 100, reward: { type: 'SHADOW', amount: 20 }},
    { id: 'signal_3', title: 'Oracle Challenger', description: 'Generate 3 correct AI signals in the Signal Console.', xp: 125, reward: { type: 'SHADOW', amount: 50 }},
    { id: 'stake_1000', title: 'Vault Commitment', description: 'Stake 1,000 SHADOW in the Wallet Vault.', xp: 200, reward: { type: 'NFT_SKIN', amount: 1 }},
    { id: 'invite_3', title: 'Recruit for the Arena', description: 'Invite 3 friends to join the Shadow Arena.', xp: 150, reward: { type: 'SHADOW', amount: 100 }},
];

const initialSignals: Signal[] = [];
const initialTrades: Trade[] = [];
const initialUserMissions: Record<string, string[]> = { 'default_user': ['trade_5'] };


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
        await fs.mkdir(DATA_DIR, { recursive: true });

        await Promise.all([
            seedFile(USERS_PATH, initialUsers),
            seedFile(MISSIONS_PATH, initialMissions),
            seedFile(SIGNALS_PATH, initialSignals),
            seedFile(TRADES_PATH, initialTrades),
            seedFile(USER_MISSIONS_PATH, initialUserMissions)
        ]);

        console.log('Local data store setup check complete for Shadow Arena.');

    } catch (error) {
        console.error('Error setting up and seeding local data:', error);
        throw error;
    }
}
