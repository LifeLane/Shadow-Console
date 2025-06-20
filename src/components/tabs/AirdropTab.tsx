
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Gift, WalletCards, History, ExternalLink, Copy, AlertTriangle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import TypewriterText from '@/components/TypewriterText';

interface EligibilityItem {
  id: string;
  label: string;
  isEligible: boolean;
  details?: string;
  action?: () => void;
  actionLabel?: string;
  disabled?: boolean;
}

const BSAI_CONTRACT_ADDRESS = "CY1LMCWHZiQHf675QJ2uGwSE1w2fD5MYVWUQzgYyEpRS";
const BSAI_TRADING_LINK = "https://birdeye.so/token/CY1LMCWHZiQHf675QJ2uGwSE1w2fD5MYVWUQzgYyEpRS?chain=solana";

const initialEligibilityData: Omit<EligibilityItem, 'action' | 'actionLabel' | 'disabled'>[] = [
  { id: 'walletSubmitted', label: 'Primary Wallet Synced', isEligible: false, details: 'Sync your ETH, SOL, or TON wallet to confirm.' },
  { id: 'bsaiHolder', label: 'BSAI Holder Status (Simulated)', isEligible: false, details: 'Sync wallet to verify contribution.' },
  { id: 'trials', label: 'Shadow Core Signal Trials Completed', isEligible: false, details: '0/1 trial completed. Your analysis aids the Core!' },
  { id: 'invite', label: 'Genesis Invite Code Used (Simulated)', isEligible: true, details: 'Code: SHADOW2024 (Welcome, Agent!)' },
];

const mockTransactions = [
  { id: 'tx1', date: '2024-07-20', type: 'Airdrop Claim', amount: '100 BSAI', status: 'Completed', txHash: '0xabc...def' },
  { id: 'tx2', date: '2024-07-15', type: 'Task Reward', amount: '20 BSAI', status: 'Completed', txHash: '0xdef...' },
];

export default function AirdropTab() {
  const { toast } = useToast();
  const [eligibilityItems, setEligibilityItems] = useState<EligibilityItem[]>([]);
  const [selectedChain, setSelectedChain] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [isWalletFormSubmitted, setIsWalletFormSubmitted] = useState(false);
  const [descriptionKey, setDescriptionKey] = useState(0);

  useEffect(() => {
    setDescriptionKey(prev => prev + 1); // For typewriter
    setEligibilityItems(
      initialEligibilityData.map(item => ({
        ...item,
        action: item.id === 'trials' ? handleCompleteSignalTrial : undefined,
        actionLabel: item.id === 'trials' ? 'Complete Signal Trial (Simulated)' : undefined,
        disabled: item.id === 'trials' ? item.isEligible : false,
      }))
    );
  }, []);


  const handleCompleteSignalTrial = () => {
    setEligibilityItems(prevItems =>
      prevItems.map(item =>
        item.id === 'trials' ? { ...item, isEligible: true, details: '1/1 trial completed. Shadow Core thanks you!', disabled: true } : item
      )
    );
    toast({ title: "Signal Trial Contribution Logged!", description: "Eligibility updated. The Shadow Core learns from your input." });
  };
  
  const handleWalletSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChain || !walletAddress) {
      toast({ title: "Wallet Sync Error", description: "Please select a chain and enter a valid wallet address.", variant: "destructive" });
      return;
    }
    setEligibilityItems(prevItems =>
      prevItems.map(item => {
        if (item.id === 'walletSubmitted') {
          return { ...item, isEligible: true, details: `Synced: ${selectedChain}: ${walletAddress.substring(0,6)}...${walletAddress.substring(walletAddress.length - 4)}` };
        }
        if (item.id === 'bsaiHolder') {
          return { ...item, isEligible: true, details: 'BSAI Holder status confirmed (Simulated). Your support is valued!' };
        }
        return item;
      })
    );
    setIsWalletFormSubmitted(true);
    toast({ title: "Wallet Synced for Airdrop!", description: `Your ${selectedChain} wallet has been synced with the Shadow Core network.` });
  };

  const handleCopyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: `${type} Copied!`, description: `${text} copied to clipboard.` });
    } catch (err) {
      toast({ title: "Copy Failed", description: `Could not copy ${type}.`, variant: "destructive" });
    }
  };

  const eligibleCount = eligibilityItems.filter(item => item.isEligible).length;
  const progressPercentage = eligibilityItems.length > 0 ? (eligibleCount / eligibilityItems.length) * 100 : 0;
  const allEligible = eligibilityItems.length > 0 && eligibleCount === eligibilityItems.length;

  return (
    <div className="space-y-6 sm:space-y-8">
      <Card className="glow-border-primary">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="font-headline text-xl sm:text-3xl text-primary flex items-center"><Gift className="w-6 h-6 sm:w-8 sm:h-8 mr-2 sm:mr-3" />BSAI Airdrop Hub</CardTitle>
          <TypewriterText 
            key={`desc-airdrop-${descriptionKey}`}
            text="Sync your wallet, verify contributions to the Shadow Core, and claim your BSAI airdrop rewards! Your efforts power the collective intelligence." 
            className="text-xs sm:text-sm text-muted-foreground mt-1"
            speed={15}
            showCaret={false}
          />
        </CardHeader>
        <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {!isWalletFormSubmitted ? (
            <Card className="p-4 sm:p-6 bg-card/80 border-primary/30 shadow-inner">
              <form onSubmit={handleWalletSubmit} className="space-y-3 sm:space-y-4">
                <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-primary font-headline">Sync Wallet for Airdrop Eligibility</h3>
                <div>
                  <Label htmlFor="chain-select" className="font-code text-xs sm:text-sm text-muted-foreground">Select Network (ETH, SOL, or TON)</Label>
                  <Select value={selectedChain} onValueChange={setSelectedChain}>
                    <SelectTrigger id="chain-select" className="w-full mt-1 bg-background border-border focus:border-primary focus:ring-primary text-sm sm:text-base h-10">
                      <SelectValue placeholder="Choose your network for BSAI" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ETH">Ethereum (ETH)</SelectItem>
                      <SelectItem value="SOL">Solana (SOL)</SelectItem>
                      <SelectItem value="TON">TON Blockchain (TON)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="wallet-address" className="font-code text-xs sm:text-sm text-muted-foreground">Wallet Address</Label>
                  <Input
                    id="wallet-address"
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                    placeholder="Enter your wallet address (e.g., 0x... or Sol...)"
                    className="mt-1 bg-background border-border focus:border-primary focus:ring-primary text-sm sm:text-base h-10"
                  />
                </div>
                <Button type="submit" className="w-full font-code bg-primary text-primary-foreground hover:bg-primary/90 py-2.5 text-sm sm:text-base">Sync Wallet & Verify</Button>
              </form>
            </Card>
          ) : (
             <Card className="p-4 sm:p-6 bg-accent/10 border-accent/50 shadow-md text-center">
                <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12 text-accent mx-auto mb-2 sm:mb-3" />
                <h3 className="text-lg sm:text-xl font-semibold text-accent font-headline">Wallet Synced Successfully!</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">Network: {selectedChain} | Address: {walletAddress.substring(0,8)}...{walletAddress.substring(walletAddress.length - 6)}</p>
            </Card>
          )}

          <div className="pt-2 sm:pt-4">
            <h3 className="text-lg sm:text-xl font-semibold mb-1 sm:mb-2 text-foreground font-headline">Airdrop Eligibility Progress</h3>
            <Progress value={progressPercentage} className="w-full h-2.5 sm:h-3 mb-1 [&>div]:bg-gradient-to-r [&>div]:from-primary [&>div]:to-accent" />
            <p className="text-xs sm:text-sm text-muted-foreground">{eligibleCount} of {eligibilityItems.length} criteria met. Each step aids the Shadow Core!</p>
          </div>

          <div className="space-y-3 sm:space-y-4">
            {eligibilityItems.map((item) => (
              <Card key={item.id} className={cn(
                "p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between transition-all duration-300 space-y-2 sm:space-y-0", 
                item.isEligible 
                  ? "bg-accent/10 border-accent/50 shadow-sm hover:shadow-accent/20 hover:border-accent" 
                  : "bg-destructive/10 border-destructive/50 shadow-sm hover:shadow-destructive/20 hover:border-destructive"
                )}>
                <div className="flex items-center w-full sm:w-auto">
                  {item.isEligible ? <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-accent shrink-0" /> : <XCircle className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-destructive shrink-0" />}
                  <div className="flex-grow">
                    <p className="font-semibold text-sm sm:text-base text-foreground">{item.label}</p>
                    {item.details && <TypewriterText key={`detail-${item.id}-${descriptionKey}`} text={item.details} className="text-xs text-muted-foreground" speed={10} showCaret={false} />}
                  </div>
                </div>
                {item.action && !item.isEligible && !item.disabled && (
                  <Button variant="outline" size="sm" onClick={item.action} className="font-code border-primary text-primary hover:bg-primary/10 hover:text-primary self-end sm:self-center shrink-0 mt-2 sm:mt-0 text-xs sm:text-sm py-1.5 px-3">
                    {item.actionLabel}
                  </Button>
                )}
              </Card>
            ))}
          </div>
          
          <Button 
            disabled={!allEligible} 
            onClick={() => toast({ title: "Airdrop Claim Initiated!", description: "BSAI Token Claim functionality is simulated. Your contribution is valued!"})}
            className={cn(
              "w-full text-base sm:text-lg py-2.5 sm:py-3 font-code transition-all duration-300",
              allEligible 
                ? "bg-accent text-accent-foreground hover:bg-accent/90 animate-pulse-glow-accent shadow-lg hover:shadow-accent/70" 
                : "bg-muted text-muted-foreground cursor-not-allowed"
            )}
          >
            <WalletCards className="w-4 h-4 sm:w-5 sm:h-5 mr-2" /> {allEligible ? "Claim Your BSAI Airdrop Now!" : "Complete All Criteria to Claim"}
          </Button>
        </CardContent>
      </Card>

      <Card className="glow-border-accent">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="font-headline text-lg sm:text-2xl text-accent flex items-center"><AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" />BSAI Token Intel</CardTitle>
           <TypewriterText 
            key={`desc-intel-${descriptionKey}`}
            text="Key information for the BSAI token on the Solana network. DYOR." 
            className="text-xs sm:text-sm text-muted-foreground mt-1"
            speed={15}
            showCaret={false}
          />
        </CardHeader>
        <CardContent className="p-4 sm:p-6 space-y-3 sm:space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 border border-border rounded-md bg-card hover:bg-muted/30 space-y-2 sm:space-y-0">
            <div className="flex-grow">
              <p className="text-xs sm:text-sm font-semibold text-foreground">BSAI Contract Address (Solana):</p>
              <p className="text-xs font-code text-muted-foreground break-all">{BSAI_CONTRACT_ADDRESS}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => handleCopyToClipboard(BSAI_CONTRACT_ADDRESS, 'Contract Address')} className="text-primary hover:text-primary/80 self-start sm:self-center shrink-0 ml-0 sm:ml-2">
              <Copy className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 border border-border rounded-md bg-card hover:bg-muted/30 space-y-2 sm:space-y-0">
             <div className="flex-grow">
              <p className="text-xs sm:text-sm font-semibold text-foreground">Trade BSAI on Birdeye (Solana):</p>
              <a href={BSAI_TRADING_LINK} target="_blank" rel="noopener noreferrer" className="text-xs font-code text-primary hover:underline break-all block">{BSAI_TRADING_LINK}</a>
            </div>
            <Button variant="ghost" size="icon" asChild className="text-primary hover:text-primary/80 self-start sm:self-center shrink-0 ml-0 sm:ml-2">
              <a href={BSAI_TRADING_LINK} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5" />
              </a>
            </Button>
          </div>
           <p className="text-xs text-muted-foreground text-center pt-1 sm:pt-2">Always verify contract addresses from official Shadow Core channels before interacting.</p>
        </CardContent>
      </Card>

      <Card className="glow-border-primary">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="font-headline text-lg sm:text-2xl text-primary flex items-center"><History className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" />Transaction Ledger (Simulated)</CardTitle>
          <TypewriterText 
            key={`desc-ledger-${descriptionKey}`}
            text="Your recent simulated BSAI token transactions and reward logs." 
            className="text-xs sm:text-sm text-muted-foreground mt-1"
            speed={15}
            showCaret={false}
          />
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          {mockTransactions.length > 0 ? (
            <ul className="space-y-2 sm:space-y-3">
              {mockTransactions.map(tx => (
                <li key={tx.id} className="p-3 border border-border rounded-md flex flex-col sm:flex-row justify-between items-start sm:items-center bg-card hover:bg-muted/30 transition-colors duration-200 space-y-1 sm:space-y-0">
                  <div className="flex-grow">
                    <p className="font-semibold text-sm sm:text-base">{tx.type} - <span className="text-accent font-bold">{tx.amount}</span></p>
                    <p className="text-xs text-muted-foreground">{tx.date} - Status: {tx.status}</p>
                  </div>
                  <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 self-start sm:self-center text-xs px-2 py-1">
                    {tx.txHash} <ExternalLink className="w-3 h-3 ml-1" />
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <TypewriterText 
              key={`desc-no-tx-${descriptionKey}`}
              text="No transactions logged yet. Complete missions to earn rewards!" 
              className="text-muted-foreground text-center py-4 text-sm sm:text-base"
              speed={20}
              showCaret={false}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
