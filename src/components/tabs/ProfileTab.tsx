
"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Award, BrainCircuit, Gem, ShieldCheck, Loader2, KeyRound, User, Edit, Gift, Wallet, ListChecks, CheckCircle, XCircle, HelpCircle, Sparkles } from 'lucide-react';
import type { User as UserType } from '@/lib/types';
import { getProfileAction, updateUserAction } from '@/app/profile/actions';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Form, FormControl, FormField, FormItem } from '../ui/form';
import { useForm } from 'react-hook-form';
import AnimatedAvatar from '../AnimatedAvatar';
import StatCard from '../StatCard';
import AirdropForm from '../AirdropForm';

const getTierStyling = (xp: number) => {
    if (xp >= 9000) return { name: 'Oracle Lord', className: 'text-purple-400 border-purple-400', progress: 100 };
    if (xp >= 7000) return { name: 'Cypher Runner', className: 'text-cyan-400 border-cyan-400', progress: (xp - 7000) / 2000 * 100 };
    if (xp >= 5000) return { name: 'Grid Ghost', className: 'text-yellow-400 border-yellow-400', progress: (xp - 5000) / 2000 * 100 };
    if (xp < 5000) return { name: 'Neon Pilot', className: 'text-green-400 border-green-400', progress: (xp / 5000) * 100 };
    return { name: 'Neon Pilot', className: 'text-green-400 border-green-400', progress: (xp / 5000) * 100 };
}

const EligibilityItem = ({ icon, text, status, tip }: { icon: React.ElementType, text: string, status: 'complete' | 'incomplete' | 'pending', tip: string }) => {
    const statusIcons = {
        complete: <CheckCircle className="text-accent" />,
        incomplete: <XCircle className="text-destructive" />,
        pending: <HelpCircle className="text-yellow-500" />
    };

    return (
        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center space-x-3">
                {React.createElement(icon, { className: "h-5 w-5 sm:h-6 sm:w-6 text-primary" })}
                <div>
                    <p className="font-semibold text-sm sm:text-base">{text}</p>
                    <p className="text-xs text-muted-foreground">{tip}</p>
                </div>
            </div>
            {statusIcons[status]}
        </div>
    );
};


export default function ProfileTab({ isDbInitialized }: { isDbInitialized: boolean }) {
    const [profile, setProfile] = useState<UserType | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();
    const nameForm = useForm<{ name: string }>();

    const loadProfile = useCallback(async () => {
        if (!isDbInitialized) return;
        setIsLoading(true);
        try {
            const profileData = await getProfileAction();
            setProfile(profileData);
            if (profileData) {
                nameForm.setValue('name', profileData.name);
            }
        } catch (error) {
            toast({ title: "Error", description: "Could not load profile data.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    }, [isDbInitialized, toast, nameForm]);

    useEffect(() => {
        loadProfile();
    }, [loadProfile]);

    const onAirdropSuccess = () => {
        loadProfile();
    };

    const handleNameChange = async (values: { name: string }) => {
        if (!profile || !profile.nameEditable) return;

        try {
            const updatedUser = { ...profile, name: values.name, nameEditable: false };
            await updateUserAction(updatedUser);
            setProfile(updatedUser);
            toast({ title: "Name Updated!", description: "Your pilot callsign has been set." });
        } catch (error) {
            toast({ title: "Error", description: "Could not update your name.", variant: "destructive" });
        }
    };
    
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
                         userTier?.name === 'Grid Ghost' ? 'Cypher Runner' : 'Grid Ghost';

    return (
        <Card className="glow-border">
            <CardHeader>
                <CardTitle className="text-primary flex items-center text-xl sm:text-2xl"><User className="mr-3"/> Pilot Hub</CardTitle>
                <CardDescription className="text-sm">Manage your profile and secure your airdrop.</CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="profile" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="profile" className="text-xs sm:text-sm">Profile</TabsTrigger>
                        <TabsTrigger value="airdrop" className="text-xs sm:text-sm">Airdrop</TabsTrigger>
                        <TabsTrigger value="settings" className="text-xs sm:text-sm">Settings</TabsTrigger>
                    </TabsList>

                    <TabsContent value="profile" className="mt-4 sm:mt-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                            <div className="lg:col-span-1 space-y-4 sm:space-y-6">
                                <Card className="glow-border-accent">
                                    <CardHeader className="items-center text-center p-4">
                                        <AnimatedAvatar name={profile.name} className="h-20 w-20 sm:h-24 sm:w-24 mb-4" />
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
                                        <StatCard icon={Award} label="Trade Win Rate" value={profile.winRate} valueSuffix="%" />
                                        <StatCard icon={ShieldCheck} label="Signal Accuracy" value={profile.signalAccuracy} valueSuffix="%" />
                                        <StatCard icon={Gem} label="SHADOW Balance" value={profile.shadowBalance} />
                                        <StatCard icon={BrainCircuit} label="Total XP Gained" value={profile.xp} />
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>
                    
                    <TabsContent value="airdrop" className="mt-6">
                         {profile.hasRegisteredForAirdrop ? (
                            <Card className="glow-border text-center">
                                <CardHeader>
                                    <CardTitle className="text-primary flex items-center justify-center text-xl sm:text-2xl"><Sparkles className="mr-3" /> You're on the Whitelist!</CardTitle>
                                    <CardDescription className="text-sm">You have successfully registered for the BlockShadow airdrop.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground">Your eligibility is confirmed. Stay tuned for announcements regarding the token distribution event. Keep engaging with the platform to maximize your rewards!</p>
                                    <div className="mt-6 space-y-3">
                                        <h3 className="text-base sm:text-lg font-semibold text-center mb-4">Your Airdrop Status</h3>
                                        <EligibilityItem 
                                            icon={Wallet} 
                                            text="Wallet Connected" 
                                            status={'complete'}
                                            tip="Your wallet is synced with the Shadow Protocol."
                                        />
                                         <EligibilityItem 
                                            icon={ListChecks} 
                                            text="Registration Complete" 
                                            status={'complete'}
                                            tip="You have completed the airdrop registration."
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <AirdropForm onSuccess={onAirdropSuccess} />
                        )}
                    </TabsContent>

                    <TabsContent value="settings" className="mt-6 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center text-lg sm:text-xl"><Edit className="mr-2"/> Pilot Callsign</CardTitle>
                                <CardDescription className="text-sm">
                                    {profile.nameEditable 
                                        ? "Set your unique callsign. This can only be done once." 
                                        : "Your callsign is permanently set."}
                                </CardDescription>
                             </CardHeader>
                             <CardContent className="p-4 pt-0">
                                <Form {...nameForm}>
                                    <form onSubmit={nameForm.handleSubmit(handleNameChange)} className="flex items-center gap-2">
                                        <FormField
                                            control={nameForm.control}
                                            name="name"
                                            render={({ field }) => (
                                                <FormItem className="flex-grow">
                                                    <FormControl>
                                                        <Input {...field} disabled={!profile.nameEditable} />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                        <Button type="submit" disabled={!profile.nameEditable}>Save</Button>
                                    </form>
                                </Form>
                            </CardContent>
                        </Card>
                         <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center text-lg sm:text-xl"><KeyRound className="mr-2"/> API Keys</CardTitle>
                                <CardDescription className="text-sm">Enter your own API keys for enhanced functionality (optional).</CardDescription>
                             </CardHeader>
                             <CardContent className="p-4 pt-0">
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
