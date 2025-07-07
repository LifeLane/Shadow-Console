'use server';

import { getUser, getLeaderboardData } from '@/services/userService';
import type { User } from '@/lib/types';
import { chatWithOracle } from "@/ai/flows/chat-with-oracle";
import type { Message } from '@/components/tabs/ProfileTab';

export async function getProfileAction(): Promise<User | null> {
    // For now, always gets the default user's profile
    return getUser('default_user');
}

export async function getLeaderboardAction(): Promise<User[]> {
    return getLeaderboardData();
}

export async function askOracleAction(history: Message[], newMessage: string): Promise<string> {
    try {
        // The flow expects a specific history format, so we adapt it here.
        // We only pass the text content, which is sufficient for the LLM.
        const flowHistory = history.map(h => ({
            role: h.role,
            content: [{ text: h.text }]
        }));

        const responseText = await chatWithOracle({
            history: flowHistory,
            message: newMessage,
        });
        return responseText;
    } catch (error) {
        console.error("Error in askOracleAction:", error);
        return "The Oracle is currently recalibrating... please try again in a moment.";
    }
}
