
"use client";

import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Server, Zap, Fuel, Activity } from 'lucide-react';

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
        }, 2000);

        return () => clearInterval(interval);
    }, []);

    const StatCard = ({ icon: Icon, value }: { icon: React.ElementType, value: React.ReactNode }) => (
        <div className="flex flex-col items-center justify-center p-3 bg-black/40 rounded-lg shadow-inner space-y-1">
            <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            <span className="text-xl sm:text-2xl font-bold font-code text-foreground">{value}</span>
        </div>
    );

    return (
        <div className="bg-black/50 backdrop-blur-sm border-b-2 border-primary/50 p-3 sm:p-4 mb-4 sm:mb-6 rounded-b-lg shadow-lg glow-border-primary">
            <div className="container mx-auto space-y-3">
                <h2 className="text-center font-bold text-primary text-base sm:text-lg tracking-wider font-code">
                    BlockShadow Mainnet
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <StatCard icon={Server} value={stats.currentBlock.toLocaleString()} />
                    <StatCard icon={Activity} value={stats.tps.toLocaleString()} />
                    <StatCard icon={Fuel} value={stats.gasPrice} />
                    <div className="flex flex-col items-center justify-center p-3 bg-black/40 rounded-lg shadow-inner space-y-1">
                        <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                        <Badge className={cn(
                            "text-white font-semibold px-4 py-1 text-sm rounded-full",
                            stats.networkStatus === 'Operational' 
                                ? 'bg-green-600 border-green-500' 
                                : 'bg-yellow-600 border-yellow-500 animate-pulse'
                        )}>
                            {stats.networkStatus}
                        </Badge>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MainnetStats;
