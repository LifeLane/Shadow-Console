
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useTheme } from 'next-themes';
import { Wallet, Bell, Palette, KeyRound, Sun, Moon, Eye, EyeOff, CheckCircle, XCircle, Settings as SettingsGear, UserCircle, BarChartBig, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import TypewriterText from '@/components/TypewriterText';
import { getUserData, updateWalletAction } from '@/app/settings/actions';
import type { User } from '@/lib/types';


export default function SettingsTab() {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // App State
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [showApiKey, setShowApiKey] = useState(false);
  
  // User Data State
  const [user, setUser] = useState<User | null>(null);
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [connectedWalletInfo, setConnectedWalletInfo] = useState<{address: string, chain: string} | null>(null);

  // UI State
  const [signalStrength, setSignalStrength] = useState(0);
  const [descriptionKey, setDescriptionKey] = useState(0);


  useEffect(() => {
    setMounted(true);
    async function loadUserData() {
        try {
            setIsLoading(true);
            const userData = await getUserData();
            setUser(userData);
            if (userData?.wallet_address && userData.wallet_chain) {
                setIsWalletConnected(true);
                setConnectedWalletInfo({ address: userData.wallet_address, chain: userData.wallet_chain });
                setSignalStrength(Math.floor(Math.random() * 30) + 70); 
            } else {
                 setSignalStrength(Math.floor(Math.random() * 50) + 20); 
            }
        } catch (error) {
            toast({ title: "Error", description: "Could not load user data from database.", variant: "destructive" });
        } finally {
            setIsLoading(false);
            setDescriptionKey(prev => prev + 1);
        }
    }
    loadUserData();
  }, [toast]);

  useEffect(() => {
    if (!mounted) return;
    const interval = setInterval(() => {
        if (isWalletConnected) {
            setSignalStrength(prev => Math.min(100, Math.max(0, prev + (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random()*3)) )));
        } else {
             setSignalStrength(prev => Math.min(100, Math.max(0, prev + (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random()*2)) )));
        }
    }, 2000);
    return () => clearInterval(interval);
  }, [mounted, isWalletConnected]);


  if (!mounted) {
    return null; 
  }

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleWalletConnection = async () => {
    setIsSaving(true);
    if (isWalletConnected) {
      await updateWalletAction(null, null);
      setIsWalletConnected(false);
      setConnectedWalletInfo(null);
      setSignalStrength(Math.floor(Math.random() * 50) + 20);
      toast({ title: "Wallet Disconnected", description: "Your Neural ID has been decoupled from the Shadow Core." });
    } else {
      // In a real app, this would come from a wallet connector like RainbowKit/WAGMI
      const simulatedAddress = `0x${Array(40).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`;
      const simulatedChain = 'ETH';

      await updateWalletAction(simulatedAddress, simulatedChain);
      setIsWalletConnected(true);
      setConnectedWalletInfo({ address: simulatedAddress, chain: simulatedChain });
      setSignalStrength(Math.floor(Math.random() * 30) + 70);
      toast({ title: "Neural ID Synced!", description: `Successfully synced wallet with Shadow Core.` });
    }
    setIsSaving(false);
  };
  
  const handleSaveApiKeys = () => {
    toast({
        title: "API Keys Configuration Updated (Simulated)",
        description: "Your Binance API keys have been securely processed for simulated operations.",
    });
  };

  if (isLoading) {
    return (
        <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-4 text-lg text-muted-foreground">Loading Configuration...</p>
        </div>
    );
  }

  const shortAddress = connectedWalletInfo?.address 
    ? `${connectedWalletInfo.address.substring(0,6)}...${connectedWalletInfo.address.substring(connectedWalletInfo.address.length - 4)}` 
    : '';

  return (
    <div className="space-y-6 sm:space-y-8">
      <Card className="glow-border-primary">
        <CardHeader className="p-4 sm:p-6">
          <div className="flex items-center space-x-2 sm:space-x-3">
             <SettingsGear className="w-6 h-6 sm:w-8 sm:h-8 mr-1 text-primary" />
            <div>
                <CardTitle className="font-headline text-xl sm:text-3xl text-primary">Agent Configuration Panel</CardTitle>
                <TypewriterText 
                    key={`desc-settings-${descriptionKey}`}
                    text="Manage your agent preferences, connections, and interface settings." 
                    className="text-xs sm:text-sm text-muted-foreground mt-1"
                    speed={15}
                    showCaret={false}
                />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">

          {/* Neural ID Section */}
          <Card className="p-3 sm:p-4 border border-border rounded-lg shadow-sm glow-border-accent">
            <CardHeader className="p-0 pb-2 sm:pb-3">
                <CardTitle className="text-lg sm:text-xl font-semibold font-headline text-accent flex items-center"><UserCircle className="w-5 h-5 sm:w-6 sm:h-6 mr-2" /> Your Neural ID</CardTitle>
                <TypewriterText 
                    key={`desc-neuralid-${descriptionKey}`}
                    text="Your unique identifier within the Shadow Core network. Sync for mission rewards and airdrop eligibility." 
                    className="text-xs sm:text-sm text-muted-foreground mt-1"
                    speed={15}
                    showCaret={false}
                />
            </CardHeader>
            <CardContent className="p-0 space-y-2 sm:space-y-3">
                <Button 
                    onClick={handleWalletConnection}
                    disabled={isSaving}
                    className={cn(
                        "font-code transition-colors w-full sm:w-auto py-2 px-4 text-sm sm:text-base",
                        isWalletConnected 
                        ? "bg-destructive hover:bg-destructive/90 text-destructive-foreground" 
                        : "bg-accent text-accent-foreground hover:bg-accent/90"
                    )}
                >
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : isWalletConnected ? <XCircle className="mr-2 h-4 w-4 sm:h-5 sm:w-5" /> : <Wallet className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />}
                    {isSaving ? "Saving..." : isWalletConnected ? 'Decouple Neural ID' : 'Sync Neural ID (Simulated)'}
                </Button>
                {isWalletConnected && connectedWalletInfo ? (
                    <div className="text-xs text-accent pt-1 sm:pt-2 space-y-0.5">
                        <p className="flex items-center"><CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-1.5"/>ID: Agent LX7 ({connectedWalletInfo.chain}: {shortAddress})</p>
                        <p className="flex items-center"><BarChartBig className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-1.5"/>Status: Synchronized • Signal Strength: {signalStrength}%</p>
                    </div>
                ) : (
                    <p className="text-xs text-muted-foreground pt-1 sm:pt-2">Status: Neural ID not synced. Signal strength nominal ({signalStrength}%).</p>
                )}
            </CardContent>
          </Card>


          {/* Theme Settings */}
          <Card className="p-3 sm:p-4 border border-border rounded-lg shadow-sm">
            <CardHeader className="p-0 pb-2 sm:pb-3">
                <CardTitle className="text-lg sm:text-xl font-semibold font-headline text-primary flex items-center"><Palette className="w-5 h-5 sm:w-6 sm:h-6 mr-2" /> Visual Interface Theme</CardTitle>
            </CardHeader>
            <CardContent className="p-0 space-y-2 sm:space-y-3">
                <div className="flex items-center justify-between">
                <Label htmlFor="theme-toggle" className="text-sm sm:text-base">
                    Current Mode: {theme === 'dark' ? 'Shadow Ops (Navy)' : 'Twilight Ops (Purple)'}
                </Label>
                <Button onClick={toggleTheme} variant="outline" size="icon" className="border-primary text-primary hover:bg-primary/10 transition-colors h-8 w-8 sm:h-9 sm:w-9">
                    {theme === 'dark' ? <Sun className="h-4 w-4 sm:h-5 sm:h-5" /> : <Moon className="h-4 w-4 sm:h-5 sm:h-5" />}
                    <span className="sr-only">Toggle theme</span>
                </Button>
                </div>
                 <TypewriterText 
                    key={`desc-theme-${descriptionKey}`}
                    text="Interface glow effects adapt to the active theme." 
                    className="text-xs text-muted-foreground"
                    speed={15}
                    showCaret={false}
                 />
            </CardContent>
          </Card>

          {/* Notification Preferences */}
          <Card className="p-3 sm:p-4 border border-border rounded-lg shadow-sm">
            <CardHeader className="p-0 pb-2 sm:pb-3">
                <CardTitle className="text-lg sm:text-xl font-semibold font-headline text-primary flex items-center"><Bell className="w-5 h-5 sm:w-6 sm:h-6 mr-2" /> Alert Configuration</CardTitle>
            </CardHeader>
            <CardContent className="p-0 space-y-2 sm:space-y-3">
                <div className="flex items-center justify-between">
                <Label htmlFor="notifications-switch" className="text-sm sm:text-base">
                    Enable Shadow Signal Alerts
                </Label>
                <Switch
                    id="notifications-switch"
                    checked={notificationsEnabled}
                    onCheckedChange={(checked) => {
                    setNotificationsEnabled(checked);
                    toast({ title: "Alert Settings Updated", description: `Shadow Signal alerts ${checked ? 'enabled' : 'disabled'}.`});
                    }}
                    className="data-[state=checked]:bg-primary"
                />
                </div>
                <TypewriterText 
                    key={`desc-alerts-${descriptionKey}`}
                    text="Receive notifications for new Shadow Core signals and critical mission updates." 
                    className="text-xs text-muted-foreground"
                    speed={15}
                    showCaret={false}
                 />
            </CardContent>
          </Card>

          {/* API Keys */}
          <Card className="p-3 sm:p-4 border border-border rounded-lg shadow-sm">
             <CardHeader className="p-0 pb-2 sm:pb-3">
                <CardTitle className="text-lg sm:text-xl font-semibold font-headline text-primary flex items-center"><KeyRound className="w-5 h-5 sm:w-6 sm:h-6 mr-2" /> Exchange API Keys (Simulated)</CardTitle>
                <TypewriterText 
                    key={`desc-apikeys-${descriptionKey}`}
                    text="Securely input your Binance API keys for enhanced simulated trading features and data contribution (optional)." 
                    className="text-xs sm:text-sm text-muted-foreground mt-1"
                    speed={15}
                    showCaret={false}
                />
            </CardHeader>
            <CardContent className="p-0 space-y-3 sm:space-y-4">
                <div className="space-y-2 sm:space-y-3">
                <div>
                    <Label htmlFor="binance-api-key" className="font-code text-xs sm:text-sm">Binance API Key</Label>
                    <div className="relative mt-1">
                    <Input id="binance-api-key" type={showApiKey ? "text" : "password"} placeholder="Enter your Binance API Key" className="font-code bg-card border-primary/50 focus:border-primary focus:ring-primary pr-10 h-9 sm:h-10 text-sm" />
                    <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 sm:h-7 sm:w-7 text-muted-foreground hover:text-primary" onClick={() => setShowApiKey(!showApiKey)}>
                        {showApiKey ? <EyeOff className="h-3.5 w-3.5 sm:h-4 sm:h-4"/> : <Eye className="h-3.5 w-3.5 sm:h-4 sm:h-4"/>}
                    </Button>
                    </div>
                </div>
                <div>
                    <Label htmlFor="binance-secret-key" className="font-code text-xs sm:text-sm">Binance Secret Key</Label>
                    <div className="relative mt-1">
                        <Input id="binance-secret-key" type={showApiKey ? "text" : "password"} placeholder="Enter your Binance Secret Key" className="font-code bg-card border-primary/50 focus:border-primary focus:ring-primary pr-10 h-9 sm:h-10 text-sm" />
                        <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 sm:h-7 sm:w-7 text-muted-foreground hover:text-primary" onClick={() => setShowApiKey(!showApiKey)}>
                            {showApiKey ? <EyeOff className="h-3.5 w-3.5 sm:h-4 sm:h-4"/> : <Eye className="h-3.5 w-3.5 sm:h-4 sm:h-4"/>}
                    </Button>
                    </div>
                </div>
                </div>
                <Button onClick={handleSaveApiKeys} variant="outline" className="font-code border-primary text-primary hover:bg-primary/10 transition-colors text-sm py-2 px-3">Save API Keys (Simulated)</Button>
                <TypewriterText 
                    key={`desc-apicaution-${descriptionKey}`}
                    text="Handle API keys with extreme caution. For this simulation, keys are not stored or transmitted externally." 
                    className="text-xs text-destructive pt-1"
                    speed={15}
                    showCaret={false}
                />
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
