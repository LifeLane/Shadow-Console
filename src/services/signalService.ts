
'use server';

import { query, getClient } from '@/lib/postgres';
import type { Signal, User } from '@/lib/types';

/**
 * Fetches signal history for a user from PostgreSQL.
 */
export async function getSignalsForUser(userId: string, limitCount = 10): Promise<Signal[]> {
    try {
        const signals = await query<Signal>(`SELECT * FROM signals WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2`, [userId, limitCount]);
        return signals.map(signal => ({
            ...signal,
            id: signal.id, // PostgreSQL SERIAL type maps directly
            entryRange: signal.entryRange || null,
            stopLoss: signal.stopLoss || null,
            takeProfit: signal.takeProfit || null,
            confidence: signal.confidence || null,
            shadowScore: signal.shadowScore || null,
        }));
    } catch (error) {
        console.error(`Error fetching signals for user ${userId}:`, error);
        throw new Error(`Could not retrieve signals for user ${userId}.`);
    }
}

/**
 * Saves a new signal and updates user stats in PostgreSQL.
 */
export async function saveSignal(signal: Omit<Signal, 'id' | 'created_at'>): Promise<void> {
    const { user_id, outcome, reward_bsai, reward_xp } = signal;

    const client = await getClient();
    try {
        await client.query('BEGIN');

        // 1. Insert the new signal
        await client.query(
            `INSERT INTO signals (user_id, asset, prediction, trade_mode, outcome, reward_bsai, reward_xp, gas_paid, created_at, entryRange, stopLoss, takeProfit, confidence, shadowScore)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
            [
                signal.user_id,
                signal.asset,
                signal.prediction,
                signal.trade_mode,
                signal.outcome,
                signal.reward_bsai,
                signal.reward_xp,
                signal.gas_paid,
                new Date().toISOString(),
                signal.entryRange || null,
                signal.stopLoss || null,
                signal.takeProfit || null,
                signal.confidence || null,
                signal.shadowScore || null,
            ]
        );

        // 2. Update user stats
        const userResult = await client.query<User>(`SELECT signals_generated, signals_won, bsai_earned, xp FROM users WHERE id = $1 FOR UPDATE`, [user_id]);

        if (userResult.rows.length > 0) {
            const user = userResult.rows[0];
            const updatedSignalsGenerated = (user.signals_generated || 0) + 1;
            const updatedSignalsWon = outcome === 'TP_HIT' ? (user.signals_won || 0) + 1 : (user.signals_won || 0);
            const updatedBsaiEarned = (Number(user.bsai_earned || 0) + reward_bsai);
            const updatedXp = (user.xp || 0) + reward_xp;

            await client.query(
                `UPDATE users SET signals_generated = $1, signals_won = $2, bsai_earned = $3, xp = $4, updated_at = $5 WHERE id = $6`,
                [
                    updatedSignalsGenerated,
                    updatedSignalsWon,
                    updatedBsaiEarned,
                    updatedXp,
                    new Date().toISOString(),
                    user_id,
                ]
            );
        } else {
            console.warn(`Could not find user ${user_id} to update stats.`);
        }

        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error saving signal or updating user stats:', error);
        throw new Error('Could not save signal or update user data.');
    } finally {
        client.release();
    }
}
