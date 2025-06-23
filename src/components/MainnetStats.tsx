
"use client";

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import TypewriterText from '@/components/TypewriterText';

const MainnetStats = () => {
    const [stats, setStats] = useState({
        currentBlock: 69442,
        tps: 789,
        gasPrice: 40,
        networkStatus: 'Operational',
    });
    const [lineKey, setLineKey] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setStats(prevStats => ({
                currentBlock: prevStats.currentBlock + Math.floor(Math.random() * 3),
                tps: Math.max(200, prevStats.tps + Math.floor((Math.random() - 0.5) * 40)),
                gasPrice: Math.max(20, prevStats.gasPrice + Math.floor((Math.random() - 0.5) * 6)),
                networkStatus: Math.random() > 0.05 ? 'Operational' : 'Degraded',
            }));
            setLineKey(prev => prev + 1); // Retrigger animation
        }, 3000); // Slower interval for readability

        return () => clearInterval(interval);
    }, []);
    
    const statusColor = stats.networkStatus === 'Operational' ? 'text-green-400' : 'text-yellow-400';

    const logLines = [
        { id: `block-${lineKey}`, text: `> Current Block...........: ${stats.currentBlock.toLocaleString()}` },
        { id: `tps-${lineKey}`, text: `> Transactions (TPS)......: ${stats.tps.toLocaleString()}` },
        { id: `gas-${lineKey}`, text: `> Gas Price (GWEI)........: ${stats.gasPrice}` },
        { id: `status-${lineKey}`, text: `> Network Status..........: [${stats.networkStatus.toUpperCase()}]`, color: statusColor },
    ];


    return (
        <div className="container mx-auto px-2 sm:px-4 mb-4 sm:mb-6">
            <Card className="bg-black/70 backdrop-blur-sm border-2 border-primary/50 glow-border-primary p-3 sm:p-4 font-code text-xs sm:text-sm">
                <h2 className="text-center font-bold text-primary text-base sm:text-lg tracking-wider mb-2">
                    BlockShadow Mainnet Stream
                </h2>
                <CardContent className="p-0 space-y-1">
                    {logLines.map((line, index) => (
                         <TypewriterText
                            key={line.id}
                            text={line.text}
                            speed={5}
                            className={cn("whitespace-pre-wrap break-words text-gray-300", line.color)}
                            showCaret={false}
                        />
                    ))}
                </CardContent>
            </Card>
        </div>
    );
};

export default MainnetStats;
