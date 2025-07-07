
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Trophy, Award, Sparkles } from 'lucide-react';
import type { User as UserType } from '@/lib/types';
import { getLeaderboardAction, getProfileAction } from '@/app/leaderboard/actions';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';


const getRankStyling = (rank: number) => {
    if (rank === 0) return 'bg-yellow-400 text-yellow-900 border-yellow-300';
    if (rank === 1) return 'bg-gray-400 text-gray-900 border-gray-300';
    if (rank === 2) return 'bg-yellow-600 text-yellow-100 border-yellow-500';
    return 'bg-secondary text-secondary-foreground border-border';
};

const getTitle = (user: UserType): { title: string, icon: React.ElementType } => {
    if (user.signalAccuracy > 85 && user.xp > 7000) {
        return { title: 'Signal Oracle', icon: Award };
    }
    if (user.winRate > 70 && user.stakedAmount > 5000) {
        return { title: 'Chain Whisperer', icon: Sparkles };
    }
    return { title: 'Neon Pilot', icon: Trophy };
};

export default function LeaderboardTab({ isDbInitialized }: { isDbInitialized: boolean }) {
    const [currentUser, setCurrentUser] = useState<UserType | null>(null);
    const [leaderboard, setLeaderboard] = useState<UserType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        async function loadData() {
            if (!isDbInitialized) return;
            setIsLoading(true);
            try {
                const [leaderboardData, currentUserData] = await Promise.all([
                    getLeaderboardAction(),
                    getProfileAction(),
                ]);
                setLeaderboard(leaderboardData);
                setCurrentUser(currentUserData);
            } catch (error) {
                toast({ title: "Error", description: "Could not load leaderboard data.", variant: "destructive" });
            } finally {
                setIsLoading(false);
            }
        }
        loadData();
    }, [isDbInitialized, toast]);

    if (isLoading) {
        return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }

    return (
        <Card className="glow-border">
            <CardHeader>
                <CardTitle className="flex items-center text-2xl text-primary"><Trophy className="mr-2"/> Leaderboard</CardTitle>
                <CardDescription>Top synced minds in the Shadow Trader arena. Ranked by XP.</CardDescription>
            </CardHeader>
            <CardContent>
                <ul className="space-y-3">
                    {leaderboard.map((user, index) => {
                        const userTitle = getTitle(user);
                        return (
                            <li key={user.id} className={cn(
                                "flex items-center space-x-3 p-3 rounded-lg transition-all border",
                                currentUser && user.id === currentUser.id ? 'bg-primary/20 border-primary' : 'bg-muted/30 border-transparent'
                            )}>
                                <span className={cn('flex items-center justify-center h-8 w-8 rounded-full text-sm font-bold border-2', getRankStyling(index))}>{index + 1}</span>
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={user.avatarUrl} data-ai-hint="futuristic pilot" />
                                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <p className="font-semibold">{user.name}</p>
                                    <div className="flex items-center text-xs text-muted-foreground">
                                        <userTitle.icon className="w-3 h-3 mr-1.5 text-primary" />
                                        {userTitle.title}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-accent font-code">{user.xp.toLocaleString()} XP</p>
                                    <p className="text-xs text-muted-foreground">Acc: {user.signalAccuracy}%</p>
                                </div>
                            </li>
                        )
                    })}
                </ul>
            </CardContent>
        </Card>
    );
}
