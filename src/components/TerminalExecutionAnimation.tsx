
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { cn } from '@/lib/utils';
import TypewriterText from './TypewriterText';
import { Card, CardContent } from '@/components/ui/card';

interface TerminalExecutionAnimationProps {
  target: string;
  tradeMode: string;
  risk: string;
}

const getLogLinesConfig = (target: string, tradeMode: string, risk: string) => [
  { id: 'init_core', text: `> Shadow Core v2.0 Protocol Engaged for [${target}]...`, speed: 40, color: "text-gray-300" },
  { id: 'auth_node', text: `> Authenticating with ShadowNet Secure Node... ${Math.random() > 0.05 ? "[ACCESS GRANTED]" : "[WARN: ANOMALY DETECTED - REROUTING]"}`, speed: 40, color: Math.random() > 0.05 ? "text-green-400" : "text-yellow-400" },
  { id: 'trade_mode', text: `> Trade Mode Matrix: [${tradeMode.toUpperCase()}]`, speed: 35, color: "text-cyan-400" },
  { id: 'risk_calibration', text: `> Risk Calibration Matrix: [${risk.toUpperCase()}] - Quantum parameters adjusting...`, speed: 30, color: risk.toLowerCase() === 'low' ? "text-green-400" : risk.toLowerCase() === 'medium' ? "text-yellow-400" : "text-red-400" },
  { id: 'data_ingest', text: `> Ingesting multi-terabyte arcane data streams (Binance, Polygon, CoinDesk)...`, speed: 50, color: "text-gray-400" },
  { id: 'liquidity_analysis', text: `> :: Analyzing fragmented liquidity patterns & cross-chain resonances...`, speed: 30, color: "text-purple-400" },
  { id: 'sentiment_scan', text: `> :: Scanning Noosphere for emergent sentiment clusters...`, speed: 35, color: "text-teal-400" },
  { id: 'oracle_sync', text: `> :: Synchronizing with the Chronos Oracle... aligning temporal echoes...`, speed: 40, color: "text-purple-300" },
  { id: 'quantum_sim', text: `> :: Executing quantum entanglement simulation for predictive accuracy...`, speed: 30, color: "text-indigo-400" },
  { id: 'neural_filter', text: `> :: Filtering through neural net probability filters...`, speed: 35, color: "text-pink-400" },
  { id: 'predict_vector', text: `> :: Computing predictive vector for ${target.toUpperCase()}... Standby for Shadow Insight...`, speed: 35, color: "text-orange-400" },
];

const TerminalExecutionAnimation: React.FC<TerminalExecutionAnimationProps> = ({
  target,
  tradeMode,
  risk,
}) => {
  const [completedLineIds, setCompletedLineIds] = useState<string[]>([]);
  const logLines = useMemo(() => getLogLinesConfig(target, tradeMode, risk), [target, tradeMode, risk]);

  useEffect(() => {
    setCompletedLineIds([]);
  }, [logLines]);

  const handleTypeComplete = (lineId: string) => {
    setCompletedLineIds(prev => [...prev, lineId]);
  };

  return (
    <Card className="bg-black p-4 rounded-lg shadow-2xl font-code text-sm h-auto min-h-[300px] max-h-[450px] overflow-y-auto border border-primary/50 glow-border-primary">
      <CardContent className="p-0">
        {logLines.map((line, index) => {
          const isPreviousLineCompleted = index === 0 || completedLineIds.includes(logLines[index - 1].id);
          
          if (!isPreviousLineCompleted) {
            return null; 
          }

          return (
            <div key={line.id} className={cn("mb-1 min-h-[1.5em]", line.color || "text-green-400")}>
              <TypewriterText
                text={line.text}
                speed={line.speed}
                className="whitespace-pre-wrap break-words"
                onComplete={() => handleTypeComplete(line.id)}
                showCaret={!completedLineIds.includes(line.id)} 
                caretClassName="bg-green-400 animate-blink-block-caret opacity-100"
              />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default TerminalExecutionAnimation;

    