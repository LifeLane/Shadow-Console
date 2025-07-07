
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Gift, Wallet, ListChecks, CheckCircle, XCircle, HelpCircle, Loader2, Sparkles } from 'lucide-react';
import type { User as UserType } from '@/lib/types';
import { getProfileAction } from '@/app/profile/actions';
import { useToast } from '@/hooks/use-toast';
import AirdropForm from '../AirdropForm';

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

export default function AirdropTab({ isDbInitialized, setActiveTab }: { isDbInitialized: boolean, setActiveTab: (tab: any) => void }) {
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const loadUserData = useCallback(async () => {
    if (!isDbInitialized) return;
    setIsLoading(true);
    try {
      const user = await getProfileAction();
      setCurrentUser(user);
    } catch (error) {
      console.error("Error loading user data:", error);
      toast({ title: "Error", description: "Could not load user data.", variant: "destructive" });
    } finally {
        setIsLoading(false);
    }
  }, [isDbInitialized, toast]);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  const onAirdropSuccess = () => {
    loadUserData();
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }
  
  if (!currentUser) {
    return <p>Could not load user data.</p>
  }
  
  if (currentUser.hasRegisteredForAirdrop) {
    return (
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
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
        <AirdropForm onSuccess={onAirdropSuccess} />
    </div>
  );
}
