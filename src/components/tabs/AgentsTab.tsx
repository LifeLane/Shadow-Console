
"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Bot, History, CheckCircle, Award, Star, Power, PlusCircle, Edit, Rocket, BrainCircuit, Activity, BarChart, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import type { Agent, AgentParameters } from '@/lib/types';
import { getAgentsAction, saveAgentAction, updateAgentStatusAction, setupDatabaseAndSeed } from '@/app/agents/actions';

// --- INITIAL DATA & TYPES ---

const userStats = {
    signalsGenerated: 78,
    signalsWon: 62,
    totalBsaiEarned: 12450,
    currentXp: 1850,
    xpForNextLevel: 2500,
};

const initialAgentsData: Agent[] = [
    { id: 'agent-custom-1', name: 'My ETH Momentum Bot', description: 'Custom agent focusing on ETH/USDT momentum.', status: 'Active', is_custom: true, parameters: { symbol: 'ETHUSDT', tradeMode: 'Intraday', risk: 'Medium', indicators: ['RSI', 'MACD'] }, code: `// Strategy: Momentum\n// Indicators: RSI, MACD\n\nif (crossover(rsi, 70)) {\n  sell();\n} else if (crossover(rsi, 30)) {\n  buy();\n}`, performance: { signals: 40, winRate: 85 } },
    { id: 'agent-custom-2', name: 'SOL Scalper v2', description: 'High-frequency scalping for SOL/USDT on the 5m timeframe.', status: 'Inactive', is_custom: true, parameters: { symbol: 'SOLUSDT', tradeMode: 'Scalping', risk: 'High', indicators: ['EMA', 'Volume Profile'] }, code: `// Strategy: High-frequency\n// Indicators: EMA, Volume\n\nfunction onTick(price, indicators) {\n  if (price > indicators.ema_fast) {\n    return 'BUY';\n  }\n  return 'SELL';\n}`, performance: { signals: 38, winRate: 72 } },
    { id: 'agent-premade-1', name: 'BTC Sentinel Prime', description: 'Balanced agent for BTC/USDT, operating on the 4h chart.', status: 'Inactive', is_custom: false, parameters: { symbol: 'BTCUSDT', tradeMode: 'Swing Trading', risk: 'Medium', indicators: ['Ichimoku Cloud', 'Fib Retracement'] }, code: '// PREMADE AGENT LOGIC - PROTECTED', performance: { signals: 0, winRate: 0 } },
];


const availableIndicators = [
    { id: 'RSI', label: 'RSI (Relative Strength Index)' },
    { id: 'MACD', label: 'MACD' },
    { id: 'BB', label: 'Bollinger Bands' },
    { id: 'IC', label: 'Ichimoku Cloud' },
    { id: 'VP', label: 'Volume Profile' },
];

const tradeModes = ['Scalping', 'Intraday', 'Swing Trading', 'Position Trading', 'Options', 'Futures'];
const riskLevels: ('Low' | 'Medium' | 'High')[] = ['Low', 'Medium', 'High'];

const newAgentTemplate: Omit<Agent, 'id'> = {
    name: 'New Custom Agent',
    description: 'A new agent ready for configuration.',
    status: 'Inactive',
    is_custom: true,
    parameters: { symbol: 'BTCUSDT', tradeMode: 'Intraday', risk: 'Medium', indicators: [] },
    code: `// Define your custom strategy here.\n// Example: Use indicators to trigger buy/sell signals.\n\nfunction onTick(price, indicators) {\n  if (indicators.rsi < 30) {\n    // Buy condition\n    return 'BUY';\n  }\n  return 'HOLD';\n}`,
    performance: { signals: 0, winRate: 0 },
};

// --- COMPONENTS ---

const StatCard = ({ title, value, children }: { title: string; value: string | number; children: React.ReactNode }) => (
    <Card className="p-4 bg-card/80 text-center shadow-inner hover:shadow-lg transition-shadow">
        <div className="text-primary mb-2">{children}</div>
        <p className="text-2xl font-bold font-headline">{value}</p>
        <p className="text-xs text-muted-foreground uppercase tracking-wider">{title}</p>
    </Card>
);

const AgentEditorDialog: React.FC<{ agent: Omit<Agent, 'id'> | Agent, onSave: (agent: Agent) => void, children: React.ReactNode }> = ({ agent, onSave, children }) => {
    const [editedAgent, setEditedAgent] = useState(agent);
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        const agentToSave = 'id' in editedAgent 
            ? editedAgent 
            : { ...editedAgent, id: `agent-custom-${Date.now()}` };

        try {
            await onSave(agentToSave);
        } finally {
            setIsSaving(false);
        }
    };

    const handleIndicatorChange = (indicatorId: string, checked: boolean) => {
        setEditedAgent(prev => ({
            ...prev,
            parameters: {
                ...prev.parameters,
                indicators: checked
                    ? [...prev.parameters.indicators, indicatorId]
                    : prev.parameters.indicators.filter(id => id !== indicatorId)
            }
        }));
    };

    return (
        <Dialog>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-[600px] bg-background border-primary glow-border-primary text-foreground font-code">
                <DialogHeader>
                    <DialogTitle className="font-headline text-2xl text-primary">{editedAgent.is_custom ? 'Configure Custom Agent' : 'View Premade Agent'}</DialogTitle>
                    <DialogDescription>Define your agent's parameters and logic. Your creations strengthen the ShadowNet.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto px-1">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="agent-name" className="text-right">Name</Label>
                        <Input id="agent-name" value={editedAgent.name} onChange={e => setEditedAgent(p => ({ ...p, name: e.target.value }))} className="col-span-3 bg-input border-border focus:border-primary focus:ring-primary" readOnly={!editedAgent.is_custom} />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="symbol" className="text-right">Symbol</Label>
                        <Input id="symbol" value={editedAgent.parameters.symbol} onChange={e => setEditedAgent(p => ({ ...p, parameters: { ...p.parameters, symbol: e.target.value.toUpperCase() } }))} className="col-span-3 bg-input border-border focus:border-primary focus:ring-primary" readOnly={!editedAgent.is_custom} />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Trade Mode</Label>
                        <Select value={editedAgent.parameters.tradeMode} onValueChange={(v) => setEditedAgent(p => ({ ...p, parameters: { ...p.parameters, tradeMode: v } }))} disabled={!editedAgent.is_custom}>
                            <SelectTrigger className="col-span-3 bg-input border-border focus:border-primary focus:ring-primary"><SelectValue /></SelectTrigger>
                            <SelectContent>{tradeModes.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                        </Select>
                    </div>
                     <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Risk</Label>
                         <Select value={editedAgent.parameters.risk} onValueChange={(v) => setEditedAgent(p => ({ ...p, parameters: { ...p.parameters, risk: v as any } }))} disabled={!editedAgent.is_custom}>
                            <SelectTrigger className="col-span-3 bg-input border-border focus:border-primary focus:ring-primary"><SelectValue /></SelectTrigger>
                            <SelectContent>{riskLevels.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-4 items-start gap-4">
                        <Label className="text-right pt-2">Indicators</Label>
                        <div className="col-span-3 grid grid-cols-2 gap-2">
                            {availableIndicators.map(indicator => (
                                <div key={indicator.id} className="flex items-center space-x-2">
                                    <Checkbox id={indicator.id} checked={editedAgent.parameters.indicators.includes(indicator.id)} onCheckedChange={(c) => handleIndicatorChange(indicator.id, !!c)} disabled={!editedAgent.is_custom}/>
                                    <label htmlFor={indicator.id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{indicator.label}</label>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="grid grid-cols-4 items-start gap-4">
                        <Label htmlFor="code" className="text-right pt-2">Logic</Label>
                        <Textarea id="code" value={editedAgent.code} onChange={e => setEditedAgent(p => ({...p, code: e.target.value }))} className="col-span-3 min-h-[150px] bg-input border-border focus:border-primary focus:ring-primary" readOnly={!editedAgent.is_custom} />
                    </div>
                </div>
                <DialogFooter>
                    {editedAgent.is_custom && (
                        <Button onClick={handleSave} className="bg-primary hover:bg-primary/90" disabled={isSaving}>
                            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isSaving ? 'Saving...' : 'Save Agent'}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// --- MAIN TAB COMPONENT ---

export default function AgentsTab() {
    const [agents, setAgents] = useState<Agent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        async function loadAgents() {
            setIsLoading(true);
            try {
                // This ensures the table exists and seeds it on first run
                await setupDatabaseAndSeed(initialAgentsData);
                const dbAgents = await getAgentsAction();
                setAgents(dbAgents);
            } catch (error) {
                console.error("Failed to load agents from database", error);
                toast({ title: "Error", description: "Could not load agent data.", variant: "destructive" });
            } finally {
                setIsLoading(false);
            }
        }
        loadAgents();
    }, [toast]);

    const handleSaveAgent = async (agentToSave: Agent) => {
        try {
            await saveAgentAction(agentToSave);
            // Refresh data from server
            const updatedAgents = await getAgentsAction();
            setAgents(updatedAgents);
            const isNew = !agents.some(a => a.id === agentToSave.id);
            toast({ 
                title: isNew ? "Agent Created" : "Agent Updated", 
                description: `${agentToSave.name} has been saved to the database.` 
            });
        } catch (error) {
            toast({ title: "Save Failed", description: "Could not save the agent to the database.", variant: "destructive" });
        }
    };
    
    const handleDeployAgent = async (agentId: string) => {
        const agent = agents.find(a => a.id === agentId);
        if (!agent) return;

        try {
            await updateAgentStatusAction(agentId, 'Active');
            // Optimistic update
            setAgents(prev => prev.map(a => a.id === agentId ? { ...a, status: 'Active' } : a));
            toast({
                title: `Agent Deployed to ShadowNet`,
                description: `${agent.name} is now active and generating signals.`,
            });
        } catch (error) {
             toast({ title: "Deploy Failed", description: "Could not update agent status.", variant: "destructive" });
             // Revert optimistic update
             setAgents(prev => prev.map(a => a.id === agentId ? { ...a, status: 'Inactive' } : a));
        }
    };

    const winRate = useMemo(() => {
        if (userStats.signalsGenerated === 0) return "0.00%";
        return ((userStats.signalsWon / userStats.signalsGenerated) * 100).toFixed(2) + "%";
    }, []);

    const xpProgress = useMemo(() => {
        return (userStats.currentXp / userStats.xpForNextLevel) * 100;
    }, []);
    
    const customAgents = agents.filter(a => a.is_custom);
    const premadeAgents = agents.filter(a => !a.is_custom);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-4 text-lg text-muted-foreground">Connecting to Shadow Core Database...</p>
            </div>
        );
    }
    
    return (
        <div className="space-y-6 sm:space-y-8">
            <Card className="glow-border-primary">
                <CardHeader className="p-4 sm:p-6">
                    <div className="flex items-center space-x-2 sm:space-x-3">
                        <Bot className="h-7 w-7 sm:h-8 sm:w-8 text-primary" />
                        <div>
                            <CardTitle className="font-headline text-xl sm:text-3xl text-primary">Your Agent Profile</CardTitle>
                            <CardDescription>Your performance statistics and contributions to the Shadow Core.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 space-y-6">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCard title="Signals Generated" value={userStats.signalsGenerated}><History className="h-8 w-8 mx-auto" /></StatCard>
                        <StatCard title="Win Rate" value={winRate}><CheckCircle className="h-8 w-8 mx-auto" /></StatCard>
                        <StatCard title="Total BSAI Earned" value={userStats.totalBsaiEarned.toLocaleString()}><Award className="h-8 w-8 mx-auto" /></StatCard>
                        <StatCard title="Current XP" value={userStats.currentXp.toLocaleString()}><Star className="h-8 w-8 mx-auto" /></StatCard>
                    </div>
                    <div>
                        <Label className="text-sm font-medium text-muted-foreground">Next Milestone Progress</Label>
                        <Progress value={xpProgress} className="w-full mt-2 h-3" />
                        <p className="text-xs text-right mt-1 text-muted-foreground">{userStats.currentXp.toLocaleString()} / {userStats.xpForNextLevel.toLocaleString()} XP</p>
                    </div>
                </CardContent>
            </Card>

            <Card className="glow-border-accent">
                <CardHeader className="p-4 sm:p-6 flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="font-headline text-lg sm:text-2xl text-accent flex items-center"><BrainCircuit className="mr-2 h-6 w-6"/>Agent Control Panel</CardTitle>
                        <CardDescription>Create, modify, and deploy your custom signal agents to the ShadowNet.</CardDescription>
                    </div>
                     <AgentEditorDialog agent={{...newAgentTemplate}} onSave={handleSaveAgent}>
                        <Button variant="outline" className="text-accent border-accent hover:bg-accent/10 hover:text-accent"><PlusCircle className="mr-2 h-4 w-4"/>Create New Agent</Button>
                    </AgentEditorDialog>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 space-y-4">
                    {customAgents.length > 0 ? customAgents.map(agent => (
                        <Card key={agent.id} className="p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between bg-card/80 hover:bg-muted/50 transition-colors duration-200 space-y-3 sm:space-y-0">
                            <div className="flex-1 space-y-1">
                                <h4 className="font-semibold text-base sm:text-lg flex items-center">{agent.name}</h4>
                                <p className="text-xs sm:text-sm text-muted-foreground">{agent.parameters.symbol} | {agent.parameters.tradeMode} | {agent.parameters.risk} Risk</p>
                                <div className="flex items-center space-x-4 text-xs pt-1">
                                    <span className="flex items-center text-muted-foreground"><Activity className="w-3 h-3 mr-1 text-primary"/>Signals: <b className="text-foreground ml-1">{agent.performance.signals}</b></span>
                                    <span className="flex items-center text-muted-foreground"><BarChart className="w-3 h-3 mr-1 text-primary"/>Win Rate: <b className="text-foreground ml-1">{agent.performance.winRate}%</b></span>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3 self-end sm:self-center">
                                <Badge variant={agent.status === 'Active' ? 'default' : 'secondary'} className={cn(agent.status === 'Active' && 'bg-green-600/80 border-green-500')}>{agent.status}</Badge>
                                 <AgentEditorDialog agent={agent} onSave={handleSaveAgent}>
                                     <Button variant="ghost" size="icon" className="h-8 w-8"><Edit className="h-4 w-4"/></Button>
                                 </AgentEditorDialog>
                                <Button size="sm" className="bg-primary hover:bg-primary/90" disabled={agent.status === 'Active'} onClick={() => handleDeployAgent(agent.id)}><Rocket className="mr-2 h-4 w-4" />Deploy</Button>
                            </div>
                        </Card>
                    )) : (
                        <p className="text-center text-muted-foreground py-4">No custom agents created yet. Click "Create New Agent" to build your first one!</p>
                    )}
                </CardContent>
            </Card>

            <Card className="glow-border-primary">
                <CardHeader className="p-4 sm:p-6">
                    <CardTitle className="font-headline text-lg sm:text-2xl text-primary flex items-center"><Power className="mr-2 h-6 w-6"/>Premade Shadow Agents</CardTitle>
                    <CardDescription>Powerful agents built by the Shadow Core. Deployable once per day, performance scales with your XP.</CardDescription>
                </CardHeader>
                 <CardContent className="p-4 sm:p-6 space-y-4">
                    {premadeAgents.map(agent => (
                        <Card key={agent.id} className="p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between bg-card/80 hover:bg-muted/50 transition-colors duration-200 space-y-3 sm:space-y-0">
                            <div className="flex-1 space-y-1">
                                <h4 className="font-semibold text-base sm:text-lg flex items-center">
                                    {agent.name}
                                    <Badge variant="destructive" className="ml-2 text-xs bg-accent/80 border-accent">Premium</Badge>
                                </h4>
                                <p className="text-xs sm:text-sm text-muted-foreground">{agent.description}</p>
                            </div>
                             <div className="flex items-center space-x-3 self-end sm:self-center">
                                <Badge variant={agent.status === 'Active' ? 'default' : 'secondary'} className={cn(agent.status === 'Active' && 'bg-green-600/80 border-green-500')}>{agent.status}</Badge>
                                <Button size="sm" className="bg-primary hover:bg-primary/90" disabled={agent.status === 'Active'} onClick={() => handleDeployAgent(agent.id)}><Rocket className="mr-2 h-4 w-4" />Deploy</Button>
                            </div>
                        </Card>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}

