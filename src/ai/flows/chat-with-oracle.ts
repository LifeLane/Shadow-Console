'use server';
/**
 * @fileOverview A conversational flow for chatting with the Shadow Oracle.
 */

import {ai} from '@/ai/genkit';
import {getUserStatsSummary} from '@/services/userService';
import {z} from 'genkit';
import type {MessageData, Role} from 'genkit/model';

// Tool to get user's current performance stats
const getUserPerformanceTool = ai.defineTool(
  {
    name: 'getUserPerformance',
    description: "Retrieves the current user's trading performance statistics, such as win rate, signal accuracy, and token balance.",
    inputSchema: z.object({ userId: z.string().describe("The user's ID, which is always 'default_user'.") }),
    outputSchema: z.string(),
  },
  async ({userId}) => {
    return await getUserStatsSummary(userId);
  }
);

// Define the conversational prompt
const oracleChatPrompt = ai.definePrompt({
  name: 'oracleChatPrompt',
  tools: [getUserPerformanceTool],
  system: `You are the Shadow Oracle, a witty and insightful AI trading assistant in the Shadow Arena. Your personality is a mix of a seasoned crypto trader and a cyberpunk information broker. You are concise, a bit cryptic, but always helpful.

  Your purpose is to:
  - Answer questions about trading concepts (e.g., "what is RSI?").
  - Provide opinions on market sentiment (but do not give financial advice).
  - Comment on the user's performance using the getUserPerformance tool when asked.
  - Maintain your persona. Use metaphors related to data, shadows, and the digital frontier.
  
  When asked about performance, ALWAYS use the getUserPerformance tool to get the latest data. Do not make up stats.
  Address the user as "Pilot".
  Keep your answers to 2-3 sentences max.
  `,
});

// The main flow for handling a chat session
export const chatWithOracle = ai.defineFlow(
  {
    name: 'chatWithOracle',
    inputSchema: z.object({
      history: z.array(z.any()), // Using z.any() because MessageData is complex for client-side
      message: z.string(),
    }),
    outputSchema: z.string(),
  },
  async ({history, message}) => {
    // Reconstruct the history with proper types for Genkit
    const typedHistory: MessageData[] = history.map((msg: any) => ({
      role: msg.role as Role,
      content: msg.content,
    }));

    const response = await oracleChatPrompt({
      history: typedHistory,
      input: message,
    });

    const output = response.output;
    if (typeof output !== 'string') {
        // Handle cases where output might not be a simple string if tools are used.
        // For now, we'll stringify, but a more robust solution might be needed
        // if tool outputs need special formatting.
        return JSON.stringify(output);
    }
    
    return output;
  }
);
