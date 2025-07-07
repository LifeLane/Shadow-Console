
"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, HelpCircle, Gift, Wallet, ListChecks, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const EligibilityItem = ({ icon, text, status, tip }: { icon: React.ElementType, text: string, status: 'complete' | 'incomplete' | 'pending', tip: string }) => {
    const statusIcons = {
        complete: <CheckCircle className="text-accent" />,
        incomplete: <XCircle className="text-destructive" />,
        pending: <HelpCircle className="text-yellow-500" />
    };

    return (
        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center space-x-3">
                {React.createElement(icon, { className: "h-6 w-6 text-primary" })}
                <div>
                    <p className="font-semibold">{text}</p>
                    <p className="text-xs text-muted-foreground">{tip}</p>
                </div>
            </div>
            {statusIcons[status]}
        </div>
    );
};


export default function AirdropTab({ isDbInitialized }: { isDbInitialized: boolean }) {
  const { toast } = useToast();

  const handleClaimAirdrop = () => {
    toast({
        title: "Claim In-Progress",
        description: "Airdrop claims are not yet enabled. Check back soon!",
        variant: 'destructive'
    });
  }

  // This data would come from a service in a real app
  const eligibilityStatus = {
      walletConnected: true,
      isBsaiHolder: true,
      trialsCompleted: false,
      inviteUsed: true,
  };

  const isEligible = Object.values(eligibilityStatus).every(status => status === true);

  return (
    <div className="space-y-6 sm:space-y-8">
      <Card className="glow-border">
        <CardHeader>
          <CardTitle className="text-primary flex items-center text-2xl"><Gift className="mr-3" /> Airdrop Claim</CardTitle>
          <CardDescription>Check your eligibility for the upcoming BSAI token airdrop and claim your rewards.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="space-y-4 mb-6">
                <h3 className="text-lg font-semibold text-center mb-4">Eligibility Tracker</h3>
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

            <Button onClick={handleClaimAirdrop} disabled={!isEligible || !isDbInitialized} className="w-full h-12 text-lg bg-accent hover:bg-accent/90 text-accent-foreground">
                {isEligible ? "Claim Airdrop" : "Not Yet Eligible"}
            </Button>
        </CardContent>
      </Card>
    </div>
  );
}
