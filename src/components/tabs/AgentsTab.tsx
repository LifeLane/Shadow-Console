
"use client";

import React, { useState, useMemo } from 'react';
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
import { Bot, History, CheckCircle, Award, Star, Power, PlusCircle, Edit, Rocket, BrainCircuit } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

// --- MOCK DATA & TYPES ---

interface AgentParameters {
    symbol: string;
    tradeMode: string;
    risk: 'Low' | 'Medium' | 'High';
    indicators: string[];
}

interface Agent {
    id: string;
    name: string;
    description: string;
    status: 'Active' | 'Inactive' | 'Training';
    isCustom: boolean;
    parameters: AgentParameters;
    code: string;
}

const userStats = {
    signalsGenerated: 12,
    signalsWon: 9,
    totalBsaiEarned: 7540,
    currentXp: 1250,
    xpForNextLevel: 2000,
};

const initialAgents: Agent[] = [
    { id: 'agent-custom-1', name: 'My ETH Momentum Bot', description: 'Custom agent focusing on ETH/USDT momentum.', status: 'Inactive', isCustom: true, parameters: { symbol: 'ETHUSDT', tradeMode: 'Intraday', risk: 'Medium', indicators: ['RSI', 'MACD'] }, code: `// Strategy: Momentum\n// Indicators: RSI, MACD\n\nif (crossover(rsi, 70)) {\n  sell();\n} else if (crossover(rsi, 30)) {\n  buy();\n}` },
    { id: 'agent-premade-1', name: 'BTC Scalper Prime', description: 'High-frequency scalping for BTC/USDT on the 5m timeframe.', status: 'Inactive', isCustom: false, parameters: { symbol: 'BTCUSDT', tradeMode: 'Scalping', risk: 'High', indicators: ['EMA', 'Volume Profile'] }, code: '// PREMADE AGENT LOGIC - PROTECTED' },
    { id: 'agent-premade-2', name: 'SOL Swing Sentinel', description: 'Swing trading agent for SOL/USDT, operating on the 4h chart.', status: 'Inactive', isCustom: false, parameters: { symbol: 'SOLUSDT', tradeMode: 'Swing Trading', risk: 'Medium', indicators: ['Ichimoku Cloud', 'Fib Retracement'] }, code: '// PREMADE AGENT LOGIC - PROTECTED' },
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
    isCustom: true,
    parameters: { symbol: 'BTCUSDT', tradeMode: 'Intraday', risk: 'Medium', indicators: [] },
    code: `// Define your custom strategy here.\n// Example: Use indicators to trigger buy/sell signals.\n\nfunction onTick(price, indicators) {\n  if (indicators.rsi < 30) {\n    // Buy condition\n    return 'BUY';\n  }\n  return 'HOLD';\n}`
};

// --- COMPONENTS ---

const StatCard = ({ title, value, children }: { title: string; value: string | number; children: React.ReactNode }) => (
    <Card className="p-4 bg-card/80 text-center shadow-inner hover:shadow-lg transition-shadow">
        <div className="text-primary mb-2">{children}</div>
        <p className="text-2xl font-bold font-headline">{value}</p>
        <p className="text-xs text-muted-foreground uppercase tracking-wider">{title}</p>
    </Card>
);

const AgentEditorDialog: React.FC<{ agent: Agent, onSave: (agent: Agent) => void, children: React.ReactNode }> = ({ agent, onSave, children }) => {
    const [editedAgent, setEditedAgent] = useState<Agent>(agent);

    const handleSave = () => {
        onSave(editedAgent);
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
                    <DialogTitle className="font-headline text-2xl text-primary">{editedAgent.isCustom ? 'Configure Custom Agent' : 'View Premade Agent'}</DialogTitle>
                    <DialogDescription>Define your agent's parameters and logic. Your creations strengthen the ShadowNet.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto px-1">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="agent-name" className="text-right">Name</Label>
                        <Input id="agent-name" value={editedAgent.name} onChange={e => setEditedAgent(p => ({ ...p, name: e.target.value }))} className="col-span-3" readOnly={!editedAgent.isCustom} />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="symbol" className="text-right">Symbol</Label>
                        <Input id="symbol" value={editedAgent.parameters.symbol} onChange={e => setEditedAgent(p => ({ ...p, parameters: { ...p.parameters, symbol: e.target.value.toUpperCase() } }))} className="col-span-3" readOnly={!editedAgent.isCustom} />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Trade Mode</Label>
                        <Select value={editedAgent.parameters.tradeMode} onValueChange={(v) => setEditedAgent(p => ({ ...p, parameters: { ...p.parameters, tradeMode: v } }))} disabled={!editedAgent.isCustom}>
                            <SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger>
                            <SelectContent>{tradeModes.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                        </Select>
                    </div>
                     <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Risk</Label>
                         <Select value={editedAgent.parameters.risk} onValueChange={(v) => setEditedAgent(p => ({ ...p, parameters: { ...p.parameters, risk: v as any } }))} disabled={!editedAgent.isCustom}>
                            <SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger>
                            <SelectContent>{riskLevels.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-4 items-start gap-4">
                        <Label className="text-right pt-2">Indicators</Label>
                        <div className="col-span-3 grid grid-cols-2 gap-2">
                            {availableIndicators.map(indicator => (
                                <div key={indicator.id} className="flex items-center space-x-2">
                                    <Checkbox id={indicator.id} checked={editedAgent.parameters.indicators.includes(indicator.id)} onCheckedChange={(c) => handleIndicatorChange(indicator.id, !!c)} disabled={!editedAgent.isCustom}/>
                                    <label htmlFor={indicator.id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{indicator.label}</label>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="grid grid-cols-4 items-start gap-4">
                        <Label htmlFor="code" className="text-right pt-2">Logic</Label>
                        <Textarea id="code" value={editedAgent.code} onChange={e => setEditedAgent(p => ({...p, code: e.target.value }))} className="col-span-3 min-h-[150px]" readOnly={!editedAgent.isCustom} />
                    </div>
                </div>
                <DialogFooter>
                    {editedAgent.isCustom && <Button onClick={handleSave} className="bg-primary hover:bg-primary/90">Save Agent</Button>}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// --- MAIN TAB COMPONENT ---

export default function AgentsTab() {
    const [agents, setAgents] = useState<Agent[]>(initialAgents);
    const { toast } = useToast();

    const handleSaveAgent = (updatedAgent: Agent) => {
        const index = agents.findIndex(a => a.id === updatedAgent.id);
        if (index > -1) {
            const newAgents = [...agents];
            newAgents[index] = updatedAgent;
            setAgents(newAgents);
            toast({ title: "Agent Updated", description: `${updatedAgent.name} has been saved successfully.` });
        } else {
            setAgents(prev => [...prev, { ...updatedAgent, id: `agent-custom-${Date.now()}` }]);
             toast({ title: "Agent Created", description: `${updatedAgent.name} has been added to your control panel.` });
        }
    };

    const handleToggleAgentStatus = (agentId: string) => {
        setAgents(prevAgents =>
            prevAgents.map(agent => {
                if (agent.id === agentId) {
                    const newStatus = agent.status === 'Active' ? 'Inactive' : 'Active';
                    toast({
                        title: `Agent ${newStatus === 'Active' ? 'Deployed to ShadowNet' : 'Deactivated'}`,
                        description: `${agent.name} is now ${newStatus}.`,
                    });
                    return { ...agent, status: newStatus };
                }
                return agent;
            })
        );
    };

    const winRate = useMemo(() => {
        if (userStats.signalsGenerated === 0) return "0.00%";
        return ((userStats.signalsWon / userStats.signalsGenerated) * 100).toFixed(2) + "%";
    }, []);

    const xpProgress = useMemo(() => {
        return (userStats.currentXp / userStats.xpForNextLevel) * 100;
    }, []);
    
    const customAgents = agents.filter(a => a.isCustom);
    const premadeAgents = agents.filter(a => !a.isCustom);

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
                            </div>
                            <div className="flex items-center space-x-3 self-end sm:self-center">
                                <Badge variant={agent.status === 'Active' ? 'default' : 'secondary'} className={cn(agent.status === 'Active' && 'bg-green-600/80 border-green-500')}>{agent.status}</Badge>
                                 <AgentEditorDialog agent={agent} onSave={handleSaveAgent}>
                                     <Button variant="ghost" size="icon" className="h-8 w-8"><Edit className="h-4 w-4"/></Button>
                                 </AgentEditorDialog>
                                <Button size="sm" className="bg-primary hover:bg-primary/90" onClick={() => handleToggleAgentStatus(agent.id)}><Rocket className="mr-2 h-4 w-4" />Deploy</Button>
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
                                <Button size="sm" className="bg-primary hover:bg-primary/90" onClick={() => toast({ title: "Deployment Signal Sent", description: `${agent.name} has been deployed for its daily run.`})}><Rocket className="mr-2 h-4 w-4" />Deploy</Button>
                            </div>
                        </Card>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}
