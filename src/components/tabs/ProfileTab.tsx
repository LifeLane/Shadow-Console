
"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Award, BarChart2, BrainCircuit, Gem, ShieldCheck, User, Users, Loader2, Send } from 'lucide-react';
import type { User as UserType } from '@/lib/types';
import { getProfileAction, getLeaderboardAction, askOracleAction } from '@/app/profile/actions';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { ScrollArea } from '../ui/scroll-area';
import { Input } from '../ui/input';
import { Button } from '../ui/button';

export type Message = {
    role: 'user' | 'model';
    text: string;
};

const getTierStyling = (xp: number) => {
    if (xp >= 9000) return { name: 'Oracle Lord', className: 'text-purple-400 border-purple-400', progress: 100 };
    if (xp >= 7000) return { name: 'Cypher Runner', className: 'text-cyan-400 border-cyan-400', progress: (xp - 7000) / 2000 * 100 };
    if (xp >= 5000) return { name: 'Grid Ghost', className: 'text-yellow-400 border-yellow-400', progress: (xp - 5000) / 2000 * 100 };
    return { name: 'Neon Pilot', className: 'text-green-400 border-green-400', progress: (xp / 5000) * 100 };
}

const getRankStyling = (rank: number) => {
    if (rank === 0) return 'bg-yellow-400 text-yellow-900';
    if (rank === 1) return 'bg-gray-400 text-gray-900';
    if (rank === 2) return 'bg-yellow-600 text-yellow-100';
    return 'bg-secondary text-secondary-foreground';
}

const StatCard = ({ icon, label, value, description }: { icon: React.ElementType, label: string, value: string | number, description?: string }) => (
    <Card className="bg-card/70">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{label}</CardTitle>
            {React.createElement(icon, { className: "h-4 w-4 text-muted-foreground" })}
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{value}</div>
            {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </CardContent>
    </Card>
);

export default function ProfileTab({ isDbInitialized }: { isDbInitialized: boolean }) {
    const [profile, setProfile] = useState<UserType | null>(null);
    const [leaderboard, setLeaderboard] = useState<UserType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    // Chat state
    const [messages, setMessages] = useState<Message[]>([
        { role: 'model', text: 'The data streams are open, Pilot. What knowledge do you seek?' }
    ]);
    const [isChatting, setIsChatting] = useState(false);
    const chatInputRef = useRef<HTMLInputElement>(null);
    const scrollAreaRef = useRef<HTMLDivElement>(null);


    useEffect(() => {
        async function loadProfileData() {
            if (!isDbInitialized) return;
            setIsLoading(true);
            try {
                const [profileData, leaderboardData] = await Promise.all([
                    getProfileAction(),
                    getLeaderboardAction()
                ]);
                setProfile(profileData);
                setLeaderboard(leaderboardData);
            } catch (error) {
                toast({ title: "Error", description: "Could not load profile and leaderboard data.", variant: "destructive" });
            } finally {
                setIsLoading(false);
            }
        }
        loadProfileData();
    }, [isDbInitialized, toast]);

     useEffect(() => {
        // Auto-scroll to bottom of chat
        if (scrollAreaRef.current) {
            const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
            if (scrollElement) {
                scrollElement.scrollTo({ top: scrollElement.scrollHeight, behavior: 'smooth' });
            }
        }
    }, [messages]);

    const handleChatSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const userInput = chatInputRef.current?.value;
        if (!userInput || isChatting) return;

        const newMessages: Message[] = [...messages, { role: 'user', text: userInput }];
        setMessages(newMessages);
        setIsChatting(true);
        if(chatInputRef.current) chatInputRef.current.value = '';

        try {
            const oracleResponse = await askOracleAction(newMessages, userInput);
            setMessages(prev => [...prev, { role: 'model', text: oracleResponse }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'model', text: "Connection to the Oracle flickered and was lost. Try again." }]);
        } finally {
            setIsChatting(false);
        }
    };


    const userTier = useMemo(() => profile ? getTierStyling(profile.xp) : null, [profile]);

    if (isLoading) {
        return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }

    if (!profile) {
        return <div className="text-center p-8">Could not load user profile.</div>;
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="lg:col-span-1 space-y-6">
                <Card className="glow-border-accent">
                    <CardHeader className="items-center text-center">
                        <Avatar className="h-24 w-24 mb-4 border-2 border-accent">
                            <AvatarImage src={profile.avatarUrl} alt={profile.name} />
                            <AvatarFallback>{profile.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <CardTitle className="text-3xl text-accent">{profile.name}</CardTitle>
                        {userTier && <Badge variant="outline" className={cn("text-lg mt-2", userTier.className)}>{userTier.name}</Badge>}
                    </CardHeader>
                    <CardContent className="text-center">
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span>XP</span>
                                    <span>{profile.xp.toLocaleString()} / {(userTier?.name === 'Oracle Lord' ? profile.xp : (getTierStyling(profile.xp + 1000).progress > 0 ? (profile.xp + 2000 - profile.xp % 2000) : 5000)).toLocaleString()}</span>
                                </div>
                                <Progress value={userTier?.progress} className="h-3 bg-muted" />
                            </div>
                            <div className="text-sm text-muted-foreground">
                                Next Tier: {userTier?.name === 'Oracle Lord' ? 'MAX' : getTierStyling(profile.xp + 2000).name}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center"><Users className="mr-2"/> Leaderboard</CardTitle>
                        <CardDescription>Top 10 Shadow Arena Traders</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-3">
                            {leaderboard.map((user, index) => (
                                <li key={user.id} className="flex items-center space-x-3 p-2 rounded-md bg-muted/30">
                                    <span className={cn('flex items-center justify-center h-6 w-6 rounded-full text-xs font-bold', getRankStyling(index))}>{index + 1}</span>
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={user.avatarUrl} />
                                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <span className="flex-1 font-medium">{user.name}</span>
                                    <span className="text-primary font-code">{user.xp.toLocaleString()} XP</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            </div>

            <div className="lg:col-span-2 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Performance Dashboard</CardTitle>
                        <CardDescription>Your lifetime statistics in the Shadow Arena.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <StatCard icon={Award} label="Trade Win Rate" value={`${profile.winRate}%`} description="Based on all completed trades" />
                        <StatCard icon={ShieldCheck} label="Signal Accuracy" value={`${profile.signalAccuracy}%`} description="AI signal prediction success" />
                        <StatCard icon={Gem} label="SHADOW Balance" value={profile.shadowBalance.toLocaleString()} description="Your liquid token balance" />
                        <StatCard icon={BrainCircuit} label="Total XP Gained" value={profile.xp.toLocaleString()} description="Experience points earned" />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>AI Configuration</CardTitle>
                        <CardDescription>Chat directly with your AI trading assistant.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col h-[400px]">
                            <ScrollArea className="flex-grow p-4 border rounded-md bg-muted/20" ref={scrollAreaRef}>
                                <div className="space-y-4">
                                    {messages.map((msg, index) => (
                                        <div key={index} className={cn("flex items-start gap-3", msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                                            {msg.role === 'model' && <Avatar className="w-8 h-8"><AvatarFallback><BrainCircuit/></AvatarFallback></Avatar>}
                                            <div className={cn("p-3 rounded-lg max-w-sm", msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary')}>
                                                <p className="text-sm break-words">{msg.text}</p>
                                            </div>
                                            {msg.role === 'user' && <Avatar className="w-8 h-8"><AvatarFallback><User/></AvatarFallback></Avatar>}
                                        </div>
                                    ))}
                                    {isChatting && (
                                        <div className="flex items-start gap-3 justify-start">
                                            <Avatar className="w-8 h-8"><AvatarFallback><BrainCircuit/></AvatarFallback></Avatar>
                                            <div className="p-3 rounded-lg bg-secondary flex items-center justify-center">
                                                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </ScrollArea>
                            <form onSubmit={handleChatSubmit} className="flex items-center gap-2 pt-4">
                                <Input ref={chatInputRef} placeholder="Ask the Oracle..." disabled={isChatting} />
                                <Button type="submit" disabled={isChatting}><Send/></Button>
                            </form>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
