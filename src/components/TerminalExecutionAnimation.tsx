
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { cn } from '@/lib/utils';
import TypewriterText from './TypewriterText';
import { Card, CardContent } from '@/components/ui/card';

interface TerminalExecutionAnimationProps {
  target: string;
  tradeMode: string;
  risk: string;
  // onAnimationComplete?: () => void; // Optional callback when all lines typed
}

const getLogLinesConfig = (target: string, tradeMode: string, risk: string) => [
  { id: 'init', text: `> Initializing ShadowNet v2.1 for [${target}]...`, speed: 40, color: "text-gray-300" },
  { id: 'connect', text: `> Connecting to quantum market flux... ${Math.random() > 0.1 ? "[OK]" : "[WARN: REROUTING]"}`, speed: 40, color: Math.random() > 0.1 ? "text-green-400" : "text-yellow-400" },
  { id: 'mode', text: `> Trade Mode Engaged: [${tradeMode}]`, speed: 35, color: "text-cyan-400" },
  { id: 'analyze', text: `> Analyzing symbol: ${target.toUpperCase()} via multi-vector algorithm...`, speed: 30, color: "text-gray-300" },
  { id: 'risk_profile', text: `> Risk Profile Calibration: [${risk.toUpperCase()}] - Adjusting parameters...`, speed: 30, color: risk.toLowerCase() === 'low' ? "text-green-400" : risk.toLowerCase() === 'medium' ? "text-yellow-400" : "text-red-400" },
  { id: 'data_stream', text: "> Streaming terabytes of arcane market data... (entropy check nominal)", speed: 50, color: "text-gray-400" },
  { id: 'oracle', text: "> Consulting the digital oracle... synchronizing with ancient patterns...", speed: 40, color: "text-purple-400" },
  { id: 'finalize', text: `> Finalizing prediction sequence for ${target.toUpperCase()}... Standby...`, speed: 35, color: "text-orange-400" },
];

const TerminalExecutionAnimation: React.FC<TerminalExecutionAnimationProps> = ({
  target,
  tradeMode,
  risk,
  // onAnimationComplete
}) => {
  const [completedLineIds, setCompletedLineIds] = useState<string[]>([]);
  const logLines = useMemo(() => getLogLinesConfig(target, tradeMode, risk), [target, tradeMode, risk]);

  useEffect(() => {
    setCompletedLineIds([]); // Reset on prop change
  }, [logLines]);

  const handleTypeComplete = (lineId: string) => {
    setCompletedLineIds(prev => [...prev, lineId]);
    // const currentLineIndex = logLines.findIndex(line => line.id === lineId);
    // if (currentLineIndex === logLines.length - 1 && onAnimationComplete) {
    //   onAnimationComplete();
    // }
  };

  return (
    <Card className="bg-black p-4 rounded-lg shadow-2xl font-code text-sm h-auto min-h-[280px] max-h-[400px] overflow-y-auto border border-primary/50 glow-border-primary">
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
                caretClassName="bg-green-400 animate-blink-block-caret opacity-100" // Use new animation
              />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default TerminalExecutionAnimation;
