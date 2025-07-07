
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Award, BrainCircuit, Gem, ShieldCheck, Loader2, KeyRound, User } from 'lucide-react';
import type { User as UserType } from '@/lib/types';
import { getProfileAction } from '@/app/profile/actions';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '../ui/input';
import { Button } from '../ui/button';

const getTierStyling = (xp: number) => {
    if (xp >= 9000) return { name: 'Oracle Lord', className: 'text-purple-400 border-purple-400', progress: 100 };
    if (xp >= 7000) return { name: 'Cypher Runner', className: 'text-cyan-400 border-cyan-400', progress: (xp - 7000) / 2000 * 100 };
    if (xp >= 5000) return { name: 'Grid Ghost', className: 'text-yellow-400 border-yellow-400', progress: (xp - 5000) / 2000 * 100 };
    if (xp < 5000) return { name: 'Neon Pilot', className: 'text-green-400 border-green-400', progress: (xp / 5000) * 100 };
    return { name: 'Neon Pilot', className: 'text-green-400 border-green-400', progress: (xp / 5000) * 100 };
}

const StatCard = ({ icon, label, value, description }: { icon: React.ElementType, label: string, value: string | number, description?: string }) => (
    <Card className="bg-card/70">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
            <CardTitle className="text-sm font-medium">{label}</CardTitle>
            {React.createElement(icon, { className: "h-4 w-4 text-muted-foreground" })}
        </CardHeader>
        <CardContent className="p-4 pt-0">
            <div className="text-xl sm:text-2xl font-bold">{value}</div>
            {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </CardContent>
    </Card>
);

export default function ProfileTab({ isDbInitialized }: { isDbInitialized: boolean }) {
    const [profile, setProfile] = useState<UserType | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        async function loadProfileData() {
            if (!isDbInitialized) return;
            setIsLoading(true);
            try {
                const profileData = await getProfileAction();
                setProfile(profileData);
            } catch (error) {
                toast({ title: "Error", description: "Could not load profile data.", variant: "destructive" });
            } finally {
                setIsLoading(false);
            }
        }
        loadProfileData();
    }, [isDbInitialized, toast]);

    const userTier = useMemo(() => profile ? getTierStyling(profile.xp) : null, [profile]);

    if (isLoading) {
        return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }

    if (!profile) {
        return <div className="text-center p-8">Could not load user profile.</div>;
    }

    const nextTierXP = userTier?.name === 'Oracle Lord' ? profile.xp :
                       userTier?.name === 'Cypher Runner' ? 9000 :
                       userTier?.name === 'Grid Ghost' ? 7000 : 5000;
    const nextTierName = userTier?.name === 'Oracle Lord' ? 'MAX' :
                         userTier?.name === 'Cypher Runner' ? 'Oracle Lord' :
                         userTier?.name === 'Grid Ghost' ? 'Cypher Runner' : 'Neon Pilot';

    return (
        <Card className="glow-border">
            <CardHeader>
                <CardTitle className="text-primary flex items-center text-xl sm:text-2xl"><User className="mr-3"/> Profile</CardTitle>
                <CardDescription className="text-sm">Manage your profile and application preferences.</CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="profile" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="profile" className="text-xs sm:text-sm">Profile</TabsTrigger>
                        <TabsTrigger value="settings" className="text-xs sm:text-sm">Settings</TabsTrigger>
                    </TabsList>

                    <TabsContent value="profile" className="mt-4 sm:mt-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                            <div className="lg:col-span-1 space-y-4 sm:space-y-6">
                                <Card className="glow-border-accent">
                                    <CardHeader className="items-center text-center p-4">
                                        <Avatar className="h-20 w-20 sm:h-24 sm:w-24 mb-4 border-2 border-accent">
                                            <AvatarImage src={profile.avatarUrl} alt={profile.name} data-ai-hint="futuristic pilot" />
                                            <AvatarFallback>{profile.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <CardTitle className="text-xl sm:text-2xl text-accent">{profile.name}</CardTitle>
                                        {userTier && <Badge variant="outline" className={cn("text-sm sm:text-base mt-2", userTier.className)}>{userTier.name}</Badge>}
                                    </CardHeader>
                                    <CardContent className="text-center p-4">
                                        <div className="space-y-3">
                                            <div>
                                                <div className="flex justify-between text-xs mb-1">
                                                    <span>XP</span>
                                                    <span>{profile.xp.toLocaleString()} / {nextTierXP.toLocaleString()}</span>
                                                </div>
                                                <Progress value={userTier?.progress} className="h-2 bg-muted" />
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                Next Tier: {nextTierName}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="lg:col-span-2">
                                 <Card>
                                    <CardHeader className="p-4">
                                        <CardTitle className="text-lg sm:text-xl">Performance Dashboard</CardTitle>
                                        <CardDescription className="text-sm">Your lifetime statistics in the Shadow Arena.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 pt-0">
                                        <StatCard icon={Award} label="Trade Win Rate" value={`${profile.winRate}%`} description="Based on all completed trades" />
                                        <StatCard icon={ShieldCheck} label="Signal Accuracy" value={`${profile.signalAccuracy}%`} description="AI signal prediction success" />
                                        <StatCard icon={Gem} label="SHADOW Balance" value={profile.shadowBalance.toLocaleString()} description="Your liquid token balance" />
                                        <StatCard icon={BrainCircuit} label="Total XP Gained" value={profile.xp.toLocaleString()} description="Experience points earned" />
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="settings" className="mt-6 space-y-6">
                         <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center text-lg sm:text-xl"><KeyRound className="mr-2"/> API Keys</CardTitle>
                                <CardDescription className="text-sm">Enter your own API keys for enhanced functionality (optional).</CardDescription>
                             </CardHeader>
                             <CardContent>
                                <div className="space-y-4">
                                    <Input placeholder="Binance API Key (optional)" type="password" />
                                    <Input placeholder="Polygonscan API Key (optional)" type="password" />
                                    <Button>Save Keys</Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}
