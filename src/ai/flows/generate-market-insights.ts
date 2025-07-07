
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
  tradingMode: z.string().describe('The trading style (e.g., Scalper, Sniper, Intraday, Swing).'),
  risk: z.string().describe('The user-defined risk tolerance (e.g., Low, Medium, High).'),
  indicators: z.string().describe('A comma-separated list of technical indicators to consider (e.g., RSI, MACD, ATR).'),
  marketData: z.string().describe('A comprehensive summary of recent market data, including current price, recent k-line price action, market sentiment/news, and simulated on-chain activity.'),
  signalType: z.enum(['instant', 'shadow']).describe("The type of signal to generate: 'instant' for market price execution, 'shadow' for an optimal entry price."),
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
  - Trading Mode: {{{tradingMode}}}
  - Risk Level: {{{risk}}}
  - Key Indicators: {{{indicators}}}
  - Signal Generation Mode: '{{{signalType}}}'

  Data Feed:
  {{{marketData}}}

  Instructions:
  1.  **Analyze Signal Generation Mode**:
      - If the mode is 'instant', your primary goal is immediate action. The suggested entry price MUST be the current market price from the data feed. The analysis should be quick and based on current conditions.
      - If the mode is 'shadow', your primary goal is precision. You must determine the OPTIMAL entry price. This price might be different from the current market price. Your analysis should be deeper, considering potential pullbacks or breakouts to find a better entry.
  2.  **Synthesize**: Do not just repeat the data. Analyze the interplay between price action, news sentiment, and on-chain activity, keeping the user's parameters and the signal generation mode in mind.
  3.  **Generate Signal**: Based on your synthesis, provide a clear signal (LONG, SHORT, or HOLD).
  4.  **Set Confidence**: Assign a confidence score (0-100) based on how strongly the data sources align.
  5.  **Define Parameters**: Based on the chosen Signal Generation Mode, suggest the entry price, and then define realistic take-profit and stop-loss prices based on that entry and recent volatility.
  6.  **Formulate Thought**: Write a single, punchy sentence that justifies your signal, referencing at least two different data points (e.g., "Bullish on-chain activity coupled with positive sentiment suggests a breakout is imminent."). This is your "Current Thought".

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
