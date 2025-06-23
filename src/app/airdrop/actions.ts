
'use server';

import { getUser } from '@/services/userService';
import { getSignalsForUser } from '@/services/signalService';
import { getCompletedMissionIds } from '@/services/missionService';

const DEFAULT_USER_ID = 'default_user';

export interface AirdropStats {
    wallet: {
        synced: boolean;
        address: string | null;
        chain: string | null;
    };
    bsaiHolder: boolean; // Based on wallet sync
    genesisInvite: boolean; // Always true for this simulation
    signalPoints: number;
    agentPoints: number; // Derived from user XP
    missionPoints: number;
}

const POINTS = {
    WALLET_SYNC: 100,
    BSAI_HOLDER: 150,
    GENESIS_INVITE: 25,
    PER_SIGNAL_WIN: 5,
    PER_XP: 0.1,
    PER_MISSION: 30,
};

export async function getAirdropStatsAction(): Promise<AirdropStats> {
    const user = await getUser(DEFAULT_USER_ID);
    const signals = await getSignalsForUser(DEFAULT_USER_ID, 1000); // Get all signals to calculate points
    const completedMissions = await getCompletedMissionIds(DEFAULT_USER_ID);

    if (!user) {
        // Return default state if user not found, though they should be seeded
        return {
            wallet: { synced: false, address: null, chain: null },
            bsaiHolder: false,
            genesisInvite: true,
            signalPoints: 0,
            agentPoints: 0,
            missionPoints: 0,
        };
    }

    const walletSynced = !!user.wallet_address && !!user.wallet_chain;
    
    // Calculate points from signals
    const successfulSignals = signals.filter(s => s.outcome === 'TP_HIT').length;
    const signalPoints = successfulSignals * POINTS.PER_SIGNAL_WIN;

    // Calculate points from agent performance (user XP)
    const agentPoints = Math.floor(user.xp * POINTS.PER_XP);

    // Calculate points from missions
    const missionPoints = completedMissions.length * POINTS.PER_MISSION;

    return {
        wallet: {
            synced: walletSynced,
            address: user.wallet_address,
            chain: user.wallet_chain,
        },
        bsaiHolder: walletSynced, // We'll tie this to wallet sync for the simulation
        genesisInvite: true,
        signalPoints,
        agentPoints,
        missionPoints,
    };
}
