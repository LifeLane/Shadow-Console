
"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AppLayout from '@/components/AppLayout';


export default function AdminPage() {
    const { toast } = useToast();

    const handleDownloadData = () => {
        try {
            const agents = localStorage.getItem('shadow_trader_agents') || '[]';
            const walletInfo = {
                connected: !!localStorage.getItem("connectedWalletName_simulated"),
                walletName: localStorage.getItem("connectedWalletName_simulated") || "Not connected",
            };
            
            const dataToDownload = {
                agents: JSON.parse(agents),
                wallet: walletInfo,
                timestamp: new Date().toISOString(),
            };

            const dataStr = JSON.stringify(dataToDownload, null, 2);
            const dataBlob = new Blob([dataStr], {type: "application/json"});
            const url = URL.createObjectURL(dataBlob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = 'shadow_trader_data.json';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            toast({
                title: "Data Exported",
                description: "User agent and wallet data has been downloaded.",
            });

        } catch (error) {
            console.error("Failed to download data:", error);
            toast({
                title: "Export Failed",
                description: "There was an error preparing the data for download.",
                variant: "destructive",
            });
        }
    };

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-24 bg-background">
            <div className="container mx-auto max-w-2xl">
                 <Card className="glow-border-primary">
                    <CardHeader>
                        <div className="flex items-center space-x-3">
                            <Shield className="h-8 w-8 text-primary" />
                            <div>
                                <CardTitle className="font-headline text-3xl text-primary">Admin Control Panel</CardTitle>
                                <CardDescription>Manage and export user data from local storage.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4 p-6">
                        <p className="text-sm text-muted-foreground">
                            This panel provides access to data stored in the user's browser. You can export this data for analysis or backup.
                        </p>
                        <Button onClick={handleDownloadData} variant="outline" className="w-full font-code border-primary text-primary hover:bg-primary/10 transition-colors">
                            <Download className="w-4 h-4 mr-2" />
                            Export User Data (JSON)
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}
