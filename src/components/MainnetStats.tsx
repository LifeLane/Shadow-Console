
"use client";

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

const StatIndicator = ({ label, value, valueClassName, children }: { label: string; value: string | number; valueClassName?: string, children?: React.ReactNode }) => (
    <div className="flex-1 flex items-center justify-center space-x-2 px-2 sm:px-4 py-1 text-center">
        <span className="text-muted-foreground uppercase text-[0.6rem] sm:text-xs tracking-wider">{label}</span>
        <span className={cn("font-bold font-code text-xs sm:text-sm", valueClassName)}>{value}</span>
        {children}
    </div>
);

const MainnetStats = () => {
    const [stats, setStats] = useState({
        currentBlock: 69442,
        tps: 789,
        gasPrice: 40,
        networkStatus: 'Operational',
    });

    useEffect(() => {
        const interval = setInterval(() => {
            setStats(prevStats => ({
                currentBlock: prevStats.currentBlock + Math.floor(Math.random() * 3),
                tps: Math.max(200, prevStats.tps + Math.floor((Math.random() - 0.5) * 40)),
                gasPrice: Math.max(20, prevStats.gasPrice + Math.floor((Math.random() - 0.5) * 6)),
                networkStatus: Math.random() > 0.05 ? 'Operational' : 'Degraded',
            }));
        }, 3000);

        return () => clearInterval(interval);
    }, []);
    
    const isOperational = stats.networkStatus === 'Operational';
    const statusColor = isOperational ? 'text-primary' : 'text-yellow-400';
    const statusBgColor = isOperational ? 'bg-primary' : 'bg-yellow-400';

    return (
        <div className="container mx-auto px-2 sm:px-4 mb-4 sm:mb-6">
            <div className="relative w-full bg-card/60 rounded-full border border-primary/30 glow-border-primary overflow-hidden backdrop-blur-sm">
                <div className="flex justify-between items-center divide-x divide-primary/20">
                    <StatIndicator label="Block" value={stats.currentBlock.toLocaleString()} />
                    <StatIndicator label="TPS" value={stats.tps.toLocaleString()} />
                    <StatIndicator label="Gas (Gwei)" value={stats.gasPrice} />
                    <StatIndicator label="Network" value={stats.networkStatus} valueClassName={statusColor}>
                         <div className={cn("w-2 h-2 rounded-full ml-1", statusBgColor, "animate-pulse")}></div>
                    </StatIndicator>
                </div>
            </div>
        </div>
    );
};

export default MainnetStats;
