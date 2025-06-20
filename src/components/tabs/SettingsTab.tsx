
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useTheme } from 'next-themes';
import { Wallet, Bell, Palette, KeyRound, Sun, Moon, Eye, EyeOff, CheckCircle, XCircle, Settings as SettingsGear } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function SettingsTab() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [showApiKey, setShowApiKey] = useState(false);
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [connectedWalletName, setConnectedWalletName] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    setMounted(true);
    // Simulate checking existing connection status (e.g., from localStorage)
    const storedWallet = localStorage.getItem("connectedWalletName_simulated");
    if (storedWallet) {
        setIsWalletConnected(true);
        setConnectedWalletName(storedWallet);
    }
  }, []);

  if (!mounted) {
    return null; 
  }

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleWalletConnection = () => {
    if (isWalletConnected) {
      setIsWalletConnected(false);
      setConnectedWalletName('');
      localStorage.removeItem("connectedWalletName_simulated");
      toast({ title: "Wallet Disconnected", description: "Your wallet has been disconnected from Shadow Core (Simulated)." });
    } else {
      // Simulate connecting to a generic wallet
      const simulatedAddress = `0x${Array(40).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`;
      const shortAddress = `${simulatedAddress.substring(0,6)}...${simulatedAddress.substring(simulatedAddress.length - 4)}`;
      const walletName = `Simulated Wallet (${shortAddress})`;
      
      setIsWalletConnected(true);
      setConnectedWalletName(walletName);
      localStorage.setItem("connectedWalletName_simulated", walletName);
      toast({ title: "Wallet Connected!", description: `Successfully connected to ${walletName} (Simulated). Ready for Airdrop sync.` });
    }
  };
  
  const handleSaveApiKeys = () => {
    toast({
        title: "API Keys Configuration Updated (Simulated)",
        description: "Your Binance API keys have been securely processed for simulated operations.",
    });
  };

  return (
    <div className="space-y-8">
      <Card className="glow-border-primary">
        <CardHeader>
          <CardTitle className="font-headline text-3xl text-primary flex items-center"><SettingsGear className="w-8 h-8 mr-3" />Configuration Panel</CardTitle>
          <CardDescription>Manage your agent preferences, connections, and interface settings.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Wallet Connection */}
          <Card className="p-4 sm:p-6 border border-border rounded-lg shadow-sm glow-border-accent">
            <CardHeader className="p-0 pb-4">
                <CardTitle className="text-xl font-semibold font-headline text-accent flex items-center"><Wallet className="w-6 h-6 mr-2" /> Wallet Synchronization</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">Connect your primary wallet (ETH, SOL, TON) to sync with the Shadow Core network for airdrop eligibility and mission rewards.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
                <Button 
                onClick={handleWalletConnection}
                className={cn(
                    "font-code transition-colors w-full sm:w-auto py-2.5 px-5 text-base",
                    isWalletConnected 
                    ? "bg-destructive hover:bg-destructive/90 text-destructive-foreground" 
                    : "bg-accent text-accent-foreground hover:bg-accent/90"
                )}
                >
                {isWalletConnected ? <XCircle className="mr-2 h-5 w-5" /> : <Wallet className="mr-2 h-5 w-5" />}
                {isWalletConnected ? 'Disconnect Wallet' : 'Connect Wallet (Simulated)'}
                </Button>
                {isWalletConnected ? (
                    <p className="text-xs text-accent pt-3 flex items-center"><CheckCircle className="w-4 h-4 mr-1.5"/>Connected: {connectedWalletName}</p>
                ) : (
                    <p className="text-xs text-muted-foreground pt-3">Status: Not currently synced with Shadow Core network.</p>
                )}
            </CardContent>
          </Card>

          {/* Theme Settings */}
          <Card className="p-4 sm:p-6 border border-border rounded-lg shadow-sm">
            <CardHeader className="p-0 pb-4">
                <CardTitle className="text-xl font-semibold font-headline text-primary flex items-center"><Palette className="w-6 h-6 mr-2" /> Visual Interface Theme</CardTitle>
            </CardHeader>
            <CardContent className="p-0 space-y-3">
                <div className="flex items-center justify-between">
                <Label htmlFor="theme-toggle" className="text-base">
                    Current Mode: {theme === 'dark' ? 'Shadow Ops (Dark)' : 'Daylight Ops (Light)'}
                </Label>
                <Button onClick={toggleTheme} variant="outline" size="icon" className="border-primary text-primary hover:bg-primary/10 transition-colors">
                    {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                    <span className="sr-only">Toggle theme</span>
                </Button>
                </div>
                <p className="text-xs text-muted-foreground">Interface glow effects adapt to the active theme (Primary: Purple/Neon Green, Accent: Neon Green).</p>
            </CardContent>
          </Card>

          {/* Notification Preferences */}
          <Card className="p-4 sm:p-6 border border-border rounded-lg shadow-sm">
            <CardHeader className="p-0 pb-4">
                <CardTitle className="text-xl font-semibold font-headline text-primary flex items-center"><Bell className="w-6 h-6 mr-2" /> Alert Configuration</CardTitle>
            </CardHeader>
            <CardContent className="p-0 space-y-3">
                <div className="flex items-center justify-between">
                <Label htmlFor="notifications-switch" className="text-base">
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
                <p className="text-xs text-muted-foreground">Receive notifications for new Shadow Core signals and critical mission updates.</p>
            </CardContent>
          </Card>

          {/* API Keys */}
          <Card className="p-4 sm:p-6 border border-border rounded-lg shadow-sm">
             <CardHeader className="p-0 pb-4">
                <CardTitle className="text-xl font-semibold font-headline text-primary flex items-center"><KeyRound className="w-6 h-6 mr-2" /> Exchange API Keys (Simulated)</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">Securely input your Binance API keys for enhanced simulated trading features and data contribution (optional).</CardDescription>
            </CardHeader>
            <CardContent className="p-0 space-y-4">
                <div className="space-y-2">
                <div>
                    <Label htmlFor="binance-api-key" className="font-code text-sm">Binance API Key</Label>
                    <div className="relative">
                    <Input id="binance-api-key" type={showApiKey ? "text" : "password"} placeholder="Enter your Binance API Key" className="font-code mt-1 bg-card border-primary/50 focus:border-primary focus:ring-primary pr-10" />
                    <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:text-primary" onClick={() => setShowApiKey(!showApiKey)}>
                        {showApiKey ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
                    </Button>
                    </div>
                </div>
                <div>
                    <Label htmlFor="binance-secret-key" className="font-code text-sm">Binance Secret Key</Label>
                    <div className="relative">
                        <Input id="binance-secret-key" type={showApiKey ? "text" : "password"} placeholder="Enter your Binance Secret Key" className="font-code mt-1 bg-card border-primary/50 focus:border-primary focus:ring-primary pr-10" />
                        <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:text-primary" onClick={() => setShowApiKey(!showApiKey)}>
                            {showApiKey ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
                    </Button>
                    </div>
                </div>
                </div>
                <Button onClick={handleSaveApiKeys} variant="outline" className="font-code border-primary text-primary hover:bg-primary/10 transition-colors">Save API Keys (Simulated)</Button>
                <p className="text-xs text-destructive pt-1">Handle API keys with extreme caution. For this simulation, keys are not stored or transmitted externally beyond local browser interactions if any.</p>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
