
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, HelpCircle, Gift, Wallet, ListChecks, UserPlus, Loader2, Check, Send, Trophy, Award, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getMissionsDataAction, completeMissionAction, type MissionData } from '@/app/tasks/actions';
import type { User as UserType } from '@/lib/types';
import { getLeaderboardAction, getProfileAction } from '@/app/leaderboard/actions';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AnimatedAvatar from '../AnimatedAvatar';

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


export default function MissionsTab({ isDbInitialized }: { isDbInitialized: boolean }) {
  const { toast } = useToast();

  // Airdrop State
  const eligibilityStatus = {
      walletConnected: true,
      isBsaiHolder: true,
      trialsCompleted: false,
      inviteUsed: true,
  };
  const isEligible = Object.values(eligibilityStatus).every(status => status === true);
  const handleClaimAirdrop = () => {
    toast({
        title: "Claim In-Progress",
        description: "Airdrop claims are not yet enabled. Check back soon!",
        variant: 'destructive'
    });
  };

  // Tasks State
  const [missions, setMissions] = useState<MissionData[]>([]);
  const [isLoadingMissions, setIsLoadingMissions] = useState(true);
  const [completingId, setCompletingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadMissions() {
      if (!isDbInitialized) return;
      setIsLoadingMissions(true);
      try {
        const missionsData = await getMissionsDataAction();
        setMissions(missionsData);
      } catch (error) {
        toast({ title: "Error", description: "Could not load missions data.", variant: "destructive" });
      } finally {
        setIsLoadingMissions(false);
      }
    }
    loadMissions();
  }, [isDbInitialized, toast]);

  const handleCompleteMission = async (missionId: string) => {
    setCompletingId(missionId);
    try {
      const completedMission = await completeMissionAction(missionId);
      setMissions(prevMissions =>
        prevMissions.map(m => m.mission.id === missionId ? { ...m, isCompleted: true } : m)
      );
      toast({
        title: `Mission Accomplished!`,
        description: `You've earned ${completedMission.reward.amount} ${completedMission.reward.type} and ${completedMission.xp} XP.`,
        className: "bg-accent text-accent-foreground border-primary"
      });
    } catch (error) {
      toast({ title: "Error", description: "Failed to complete mission.", variant: "destructive" });
    } finally {
      setCompletingId(null);
    }
  };

  // Leaderboard State
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [leaderboard, setLeaderboard] = useState<UserType[]>([]);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(true);

  useEffect(() => {
    async function loadLeaderboardData() {
        if (!isDbInitialized) return;
        setIsLoadingLeaderboard(true);
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
            setIsLoadingLeaderboard(false);
        }
    }
    loadLeaderboardData();
  }, [isDbInitialized, toast]);

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card className="glow-border">
        <CardHeader>
          <CardTitle className="text-primary flex items-center text-xl sm:text-2xl"><Gift className="mr-3" /> Missions Hub</CardTitle>
          <CardDescription className="text-sm">Complete tasks, claim airdrops, and climb the leaderboard to earn rewards.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="tasks" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="tasks" className="text-xs sm:text-sm">Tasks</TabsTrigger>
                <TabsTrigger value="airdrop" className="text-xs sm:text-sm">Airdrop</TabsTrigger>
                <TabsTrigger value="leaderboard" className="text-xs sm:text-sm">Ranks</TabsTrigger>
            </TabsList>

            <TabsContent value="tasks" className="mt-4 sm:mt-6">
                <div className="space-y-3">
                    {isLoadingMissions ? (
                        <div className="flex justify-center items-center h-40"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>
                    ) : (
                        missions.map(({ mission, isCompleted }) => {
                            const isCompleting = completingId === mission.id;
                            return (
                                <Card key={mission.id} className={cn("p-3 flex items-center justify-between transition-all", isCompleted && "bg-muted/30 opacity-70")}>
                                    <div className="flex-1 mr-4">
                                        <h3 className={cn("font-semibold text-sm sm:text-lg", isCompleted && "line-through")}>{mission.title}</h3>
                                        <p className="text-xs sm:text-sm text-muted-foreground">{mission.description}</p>
                                        <div className="text-xs text-accent mt-1 font-bold">Reward: +{mission.reward.amount} {mission.reward.type} / +{mission.xp} XP</div>
                                    </div>
                                    <Button 
                                        onClick={() => handleCompleteMission(mission.id)}
                                        disabled={isCompleted || isCompleting}
                                        variant={isCompleted ? "secondary" : "default"}
                                        className={cn("h-9 w-9 p-0", !isCompleted && "bg-accent hover:bg-accent/90 text-accent-foreground")}
                                    >
                                        {isCompleting ? <Loader2 className="animate-spin h-4 w-4"/> : isCompleted ? <Check className="h-4 w-4"/> : <Send className="h-4 w-4"/>}
                                    </Button>
                                </Card>
                            )
                        })
                    )}
                </div>
            </TabsContent>

            <TabsContent value="airdrop" className="mt-4 sm:mt-6">
                 <div className="space-y-3 mb-6">
                    <h3 className="text-base sm:text-lg font-semibold text-center mb-4">Airdrop Eligibility Tracker</h3>
                    <EligibilityItem 
                        icon={Wallet} 
                        text="Wallet Connected" 
                        status={eligibilityStatus.walletConnected ? 'complete' : 'incomplete'}
                        tip="Your wallet is synced with the Shadow Protocol."
                    />
                     <EligibilityItem 
                        icon={ListChecks} 
                        text="Signal Trials Completed" 
                        status={eligibilityStatus.trialsCompleted ? 'complete' : 'incomplete'}
                        tip="Complete all missions in the Tasks tab."
                    />
                     <EligibilityItem 
                        icon={UserPlus} 
                        text="Invite Code Used" 
                        status={eligibilityStatus.inviteUsed ? 'complete' : 'incomplete'}
                        tip="You have successfully joined via an invite."
                    />
                     <EligibilityItem 
                        icon={HelpCircle} 
                        text="BSAI Holder Status" 
                        status={eligibilityStatus.isBsaiHolder ? 'complete' : 'pending'}
                        tip="On-chain check for BSAI token holdings."
                    />
                </div>
                <Button onClick={handleClaimAirdrop} disabled={!isEligible || !isDbInitialized} className="w-full h-11 text-base bg-accent hover:bg-accent/90 text-accent-foreground">
                    {isEligible ? "Claim Airdrop" : "Not Yet Eligible"}
                </Button>
            </TabsContent>

            <TabsContent value="leaderboard" className="mt-4 sm:mt-6">
                {isLoadingLeaderboard ? (
                    <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                ) : (
                    <ul className="space-y-2">
                        {leaderboard.map((user, index) => {
                            const userTitle = getTitle(user);
                            return (
                                <li key={user.id} className={cn(
                                    "flex items-center space-x-3 p-2 rounded-lg transition-all border",
                                    currentUser && user.id === currentUser.id ? 'bg-primary/20 border-primary' : 'bg-muted/30 border-transparent'
                                )}>
                                    <span className={cn('flex items-center justify-center h-7 w-7 sm:h-8 sm:w-8 rounded-full text-sm font-bold border-2', getRankStyling(index))}>{index + 1}</span>
                                    <AnimatedAvatar name={user.name} className="h-9 w-9 sm:h-10 sm:w-10" />
                                    <div className="flex-1">
                                        <p className="font-semibold text-sm sm:text-base">{user.name}</p>
                                        <div className="flex items-center text-xs text-muted-foreground">
                                            <userTitle.icon className="w-3 h-3 mr-1.5 text-primary" />
                                            {userTitle.title}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-accent font-code text-sm sm:text-base">{user.xp.toLocaleString()} XP</p>
                                        <p className="text-xs text-muted-foreground">Acc: {user.signalAccuracy}%</p>
                                    </div>
                                </li>
                            )
                        })}
                    </ul>
                )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
