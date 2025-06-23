
"use client";

import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Server, Zap, Fuel, Activity, Network } from 'lucide-react';

const MainnetStats = () => {
    const [stats, setStats] = useState({
        currentBlock: 69420,
        transactions: 12345678,
        gasPrice: 42,
        networkStatus: 'Operational',
    });

    useEffect(() => {
        const interval = setInterval(() => {
            setStats(prevStats => ({
                currentBlock: prevStats.currentBlock + Math.floor(Math.random() * 3),
                transactions: prevStats.transactions + Math.floor(Math.random() * 10),
                gasPrice: Math.max(20, prevStats.gasPrice + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 3)),
                networkStatus: Math.random() > 0.05 ? 'Operational' : 'Degraded',
            }));
        }, 1500);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="bg-black/50 backdrop-blur-sm border-b border-primary/20 p-2 sm:p-3 mb-4 sm:mb-6 rounded-b-lg shadow-lg glow-border-primary">
            <div className="container mx-auto grid grid-cols-2 md:grid-cols-5 gap-2 text-center text-xs sm:text-sm font-code">
                <div className="font-bold text-primary col-span-2 md:col-span-1 flex items-center justify-center p-2 bg-primary/10 rounded-md">
                    <Network className="w-4 h-4 mr-2 hidden sm:inline-block" />
                    <span>BlockShadow Mainnet</span>
                </div>
                <StatItem icon={Server} label="Block" value={stats.currentBlock.toLocaleString()} />
                <StatItem icon={Activity} label="TPS" value={(stats.transactions % 1000).toLocaleString()} />
                <StatItem icon={Fuel} label="Gas (Gwei)" value={stats.gasPrice} />
                <StatItem 
                    icon={Zap} 
                    label="Status" 
                    value={
                         <Badge className={cn(stats.networkStatus === 'Operational' ? 'bg-green-500/80 border-green-400' : 'bg-yellow-500/80 border-yellow-400 animate-pulse', 'text-white text-xs')}>
                            {stats.networkStatus}
                        </Badge>
                    } 
                />
            </div>
        </div>
    );
};

const StatItem = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: React.ReactNode }) => (
    <div className="flex flex-col sm:flex-row items-center justify-center p-2 bg-black/30 rounded-md">
        <div className="flex items-center text-muted-foreground">
            <Icon className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 text-primary/80" />
            <span className="hidden sm:inline-block mr-1.5">{label}:</span>
        </div>
        <span className="font-bold text-foreground text-sm sm:text-base">{value}</span>
    </div>
);

export default MainnetStats;
