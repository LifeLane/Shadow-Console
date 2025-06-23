
'use server';

import sql from '@/lib/db';
import type { Signal } from '@/lib/types';

/**
 * Fetches signal history for a user.
 */
export async function getSignalsForUser(userId: string, limit = 10): Promise<Signal[]> {
    try {
        const signals = await sql<Signal[]>`
            SELECT * FROM signals
            WHERE user_id = ${userId}
            ORDER BY created_at DESC
            LIMIT ${limit}
        `;
        return signals;
    } catch (error) {
        console.error(`Database Error: Failed to fetch signals for user ${userId}.`, error);
        if (error.message.includes('relation "signals" does not exist')) {
            return [];
        }
        throw error;
    }
}

/**
 * Saves a new signal to the database and updates user stats.
 */
export async function saveSignal(signal: Omit<Signal, 'id' | 'created_at'>): Promise<void> {
    const { user_id, asset, prediction, trade_mode, outcome, reward_bsai, reward_xp, gas_paid } = signal;

    await sql.begin(async (sql) => {
        // 1. Insert the signal
        await sql`
            INSERT INTO signals (user_id, asset, prediction, trade_mode, outcome, reward_bsai, reward_xp, gas_paid)
            VALUES (${user_id}, ${asset}, ${prediction}, ${trade_mode}, ${outcome}, ${reward_bsai}, ${reward_xp}, ${gas_paid})
        `;

        // 2. Update user stats
        await sql`
            UPDATE users
            SET
                signals_generated = signals_generated + 1,
                signals_won = signals_won + ${outcome === 'TP_HIT' ? 1 : 0},
                bsai_earned = bsai_earned + ${reward_bsai},
                xp = xp + ${reward_xp},
                updated_at = NOW()
            WHERE id = ${user_id}
        `;
    });
}
