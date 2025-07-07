
'use server';

/**
 * @fileOverview A flow to generate a trading signal using the Gemini Pro API.
 * This flow analyzes market context to produce a simple trading signal.
 *
 * - generateSignal - A function that generates a trading signal.
 * - GenerateSignalInput - The input type for the generateSignal function.
 * - GenerateSignalOutput - The return type for the generateSignal function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateSignalInputSchema = z.object({
  market: z.string().describe('The target market (e.g., BTCUSDT).'),
  marketData: z.string().describe('A summary of recent market data, including price, volume, and major news headlines.'),
});
export type GenerateSignalInput = z.infer<typeof GenerateSignalInputSchema>;

const GenerateSignalOutputSchema = z.object({
  prediction: z.string().describe('The predicted market action (LONG, SHORT, HOLD).'),
  confidence: z.number().describe('The confidence score for the prediction (0-100).'),
  reasoning: z.string().describe('A brief, one-sentence rationale for the prediction.'),
  entry: z.number().describe('A suggested entry price for the trade.'),
  takeProfit: z.number().describe('A suggested take profit price.'),
  stopLoss: z.number().describe('A suggested stop loss price.'),
});
export type GenerateSignalOutput = z.infer<typeof GenerateSignalOutputSchema>;


export async function generateSignal(input: GenerateSignalInput): Promise<GenerateSignalOutput> {
  return generateSignalFlow(input);
}

const signalPrompt = ai.definePrompt({
  name: 'signalPrompt',
  input: {schema: GenerateSignalInputSchema},
  output: {schema: GenerateSignalOutputSchema},
  prompt: `You are Shadow Oracle, an AI market analyst providing concise trading signals for a gamified trading arena.
  
  Analyze the provided market data for {{{market}}}. Based *only* on this data, generate a trading signal.

  Market Data: {{{marketData}}}

  Your response must be a clear signal (LONG, SHORT, or HOLD), a confidence score, a suggested entry price, take-profit, stop-loss, and a very brief thought process.
  The prices should be realistic based on the current market data provided.
  The reasoning should be a single, punchy sentence.

  Example Output:
  {
    "prediction": "LONG",
    "confidence": 75,
    "entry": 68500,
    "takeProfit": 69500,
    "stopLoss": 68000,
    "reasoning": "Positive sentiment and a key support level holding strong suggest a potential bounce."
  }
  `
});

const generateSignalFlow = ai.defineFlow(
  {
    name: 'generateSignalFlow',
    inputSchema: GenerateSignalInputSchema,
    outputSchema: GenerateSignalOutputSchema,
  },
  async (input) => {
    const {output} = await signalPrompt(input);
    if (!output) {
        throw new Error("The Shadow Oracle did not return a signal.");
    }
    return output;
  }
);
