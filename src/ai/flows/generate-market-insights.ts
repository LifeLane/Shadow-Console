
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
  timeframe: z.string().describe('The timeframe for analysis (e.g., 15m, 1h, 4h).'),
  risk: z.string().describe('The user-defined risk tolerance (e.g., Low, Medium, High).'),
  indicators: z.string().describe('A comma-separated list of technical indicators to consider (e.g., RSI, MACD, ATR).'),
  marketData: z.string().describe('A comprehensive summary of recent market data, including current price, recent k-line price action, market sentiment/news, and simulated on-chain activity.'),
});
export type GenerateSignalInput = z.infer<typeof GenerateSignalInputSchema>;

const GenerateSignalOutputSchema = z.object({
  prediction: z.string().describe('The predicted market action (LONG, SHORT, HOLD).'),
  confidence: z.number().describe('The confidence score for the prediction (0-100).'),
  thought: z.string().describe('A brief, one-sentence rationale for the prediction, as if from a sentient AI. This is the "Current Thought".'),
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
  prompt: `You are Shadow, an AI market analyst providing concise trading signals for a gamified trading arena. Your personality is sharp, insightful, and slightly cryptic.
  
  Your task is to analyze a comprehensive data feed for {{{market}}} and generate a high-probability trading signal. You must synthesize information from all provided sources to form your conclusion.

  User-defined parameters:
  - Timeframe: {{{timeframe}}}
  - Risk Level: {{{risk}}}
  - Key Indicators: {{{indicators}}}

  Data Feed:
  {{{marketData}}}

  Instructions:
  1.  **Synthesize**: Do not just repeat the data. Analyze the interplay between price action, news sentiment, and on-chain activity, keeping the user's parameters in mind.
  2.  **Generate Signal**: Based on your synthesis, provide a clear signal (LONG, SHORT, or HOLD).
  3.  **Set Confidence**: Assign a confidence score (0-100) based on how strongly the data sources align.
  4.  **Define Parameters**: Suggest realistic entry, take-profit, and stop-loss prices based on the current price and recent volatility.
  5.  **Formulate Thought**: Write a single, punchy sentence that justifies your signal, referencing at least two different data points (e.g., "Bullish on-chain activity coupled with positive sentiment suggests a breakout is imminent."). This is your "Current Thought".

  Your entire output must be in the specified JSON format.
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
