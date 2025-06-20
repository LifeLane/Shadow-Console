"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useTheme } from 'next-themes';
import { Wallet, Bell, Palette, KeyRound, Sun, Moon, Eye, EyeOff } from 'lucide-react';

export default function SettingsTab() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [showApiKey, setShowApiKey] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Avoid hydration mismatch
    return null; 
  }

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="space-y-8">
      <Card className="glow-border-primary">
        <CardHeader>
          <CardTitle className="font-headline text-3xl text-primary">Settings</CardTitle>
          <CardDescription>Manage your preferences and connections.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-10">
          {/* Wallet Connection */}
          <div className="space-y-3 p-4 border border-border rounded-lg shadow-sm glow-border-accent">
            <h3 className="text-xl font-semibold font-headline text-accent flex items-center"><Wallet className="w-6 h-6 mr-2" /> Wallet Connection</h3>
            <p className="text-sm text-muted-foreground">Connect your preferred wallet (e.g., MetaMask, Phantom).</p>
            <Button className="font-code bg-accent text-accent-foreground hover:bg-accent/90">Connect Wallet</Button>
            {/* Placeholder for connected wallet info */}
            <p className="text-xs text-muted-foreground pt-2">Currently not connected.</p>
          </div>

          {/* Theme Settings */}
          <div className="space-y-3 p-4 border border-border rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold font-headline text-primary flex items-center"><Palette className="w-6 h-6 mr-2" /> Theme</h3>
            <div className="flex items-center justify-between">
              <Label htmlFor="theme-toggle" className="text-base">
                {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
              </Label>
              <Button onClick={toggleTheme} variant="outline" size="icon" className="border-primary text-primary hover:bg-primary/10">
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                <span className="sr-only">Toggle theme</span>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">Current edge glow color is based on active elements (Primary: Purple, Accent: Green).</p>
          </div>

          {/* Notification Preferences */}
          <div className="space-y-3 p-4 border border-border rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold font-headline text-primary flex items-center"><Bell className="w-6 h-6 mr-2" /> Notifications</h3>
            <div className="flex items-center justify-between">
              <Label htmlFor="notifications-switch" className="text-base">
                Enable Signal Alerts
              </Label>
              <Switch
                id="notifications-switch"
                checked={notificationsEnabled}
                onCheckedChange={setNotificationsEnabled}
                className="data-[state=checked]:bg-primary"
              />
            </div>
            <p className="text-xs text-muted-foreground">Receive notifications for new Shadow signals and important updates.</p>
          </div>

          {/* API Keys */}
          <div className="space-y-3 p-4 border border-border rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold font-headline text-primary flex items-center"><KeyRound className="w-6 h-6 mr-2" /> API Keys</h3>
            <p className="text-sm text-muted-foreground">Securely input your Binance API keys for simulated trading features (optional).</p>
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
            <Button variant="outline" className="font-code border-primary text-primary hover:bg-primary/10">Save API Keys</Button>
            <p className="text-xs text-destructive pt-1">API keys are stored locally and used only for features you enable. Handle with care.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
