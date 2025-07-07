
"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { Gift, Sparkles, Mail, Phone, Send, Youtube, Loader2, ArrowLeft, ArrowRight } from 'lucide-react';
import { registerForAirdropAction } from '@/app/airdrop/actions';
import type { AirdropRegistration } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { Progress } from './ui/progress';

// Define schemas for each step
const step1Schema = z.object({
  twitterHandle: z.string().min(1, "Twitter handle is required."),
  telegramHandle: z.string().min(1, "Telegram handle is required."),
});
const step2Schema = z.object({
  youtubeHandle: z.string().optional(),
});
const step3Schema = z.object({
  email: z.string().email("Invalid email address.").optional().or(z.literal('')),
  phone: z.string().optional(),
});
const step4Schema = z.object({
  airdropWalletType: z.enum(['ETH', 'SOL', 'TON'], { required_error: "Please select a wallet type." }),
  airdropWalletAddress: z.string().min(10, "A valid wallet address is required."),
});

// Combined schema for final submission
const airdropFormSchema = step1Schema.merge(step2Schema).merge(step3Schema).merge(step4Schema);
type AirdropFormValues = z.infer<typeof airdropFormSchema>;

const XIcon = () => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 fill-current">
        <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/>
    </svg>
);

const steps = [
  { id: 1, title: 'Social Verification', fields: ['twitterHandle', 'telegramHandle'] },
  { id: 2, title: 'Bonus Entry', fields: ['youtubeHandle'] },
  { id: 3, title: 'Contact Info', fields: ['email', 'phone'] },
  { id: 4, title: 'Wallet Details', fields: ['airdropWalletType', 'airdropWalletAddress'] },
  { id: 5, title: 'Confirmation' },
];

const slideVariants = {
  hidden: { x: '100%', opacity: 0 },
  visible: { x: 0, opacity: 1 },
  exit: { x: '-100%', opacity: 0 },
};

export default function AirdropForm({ onSuccess }: { onSuccess: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<AirdropFormValues>({
    resolver: zodResolver(airdropFormSchema),
    defaultValues: {
        email: '',
        phone: '',
        twitterHandle: '',
        telegramHandle: '',
        youtubeHandle: '',
        airdropWalletAddress: '',
    },
    mode: 'onChange'
  });

  const onSubmit = async (data: AirdropFormValues) => {
    setIsSubmitting(true);
    try {
      await registerForAirdropAction(data as Omit<AirdropRegistration, 'userId' | 'timestamp'>);
      toast({
        title: "Registration Complete!",
        description: "You are now whitelisted for the airdrop and have unlocked full access.",
        className: "bg-accent text-accent-foreground border-primary"
      });
      onSuccess();
    } catch (error) {
      toast({ title: "Submission Error", description: "Could not process your registration. Please try again.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = async () => {
    const fields = steps[currentStep].fields;
    const isValid = await form.trigger(fields as any);
    if (isValid) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const progressValue = ((currentStep + 1) / steps.length) * 100;

  return (
    <Card className="glow-border w-full max-w-2xl mx-auto">
        <CardHeader>
            <div className='flex items-center justify-between'>
                <CardTitle className="text-primary flex items-center text-xl sm:text-2xl"><Gift className="mr-3" /> Airdrop Whitelist</CardTitle>
                <span className="text-sm text-muted-foreground font-medium">Step {currentStep + 1} of {steps.length}</span>
            </div>
            <CardDescription className="text-sm">Complete all steps to secure your spot in the BlockShadow airdrop.</CardDescription>
            <Progress value={progressValue} className="mt-2 h-2" />
        </CardHeader>
        <CardContent>
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <AnimatePresence mode="wait">
                <motion.div
                    key={currentStep}
                    variants={slideVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    transition={{ duration: 0.3 }}
                >
                {currentStep === 0 && (
                    <div className="space-y-4">
                        <h3 className="font-semibold">Social Handles (for verification)</h3>
                         <FormField control={form.control} name="twitterHandle" render={({ field }) => (
                            <FormItem>
                                <FormLabel className="flex items-center gap-2 text-xs"><XIcon /> X (Twitter) Handle</FormLabel>
                                <FormControl><Input placeholder="@YourHandle" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}/>
                         <FormField control={form.control} name="telegramHandle" render={({ field }) => (
                            <FormItem>
                                <FormLabel className="flex items-center gap-2 text-xs"><Send className="h-4 w-4 text-primary" /> Telegram Handle</FormLabel>
                                <FormControl><Input placeholder="@YourHandle" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}/>
                    </div>
                )}
                {currentStep === 1 && (
                     <div className="space-y-4">
                        <h3 className="font-semibold">Bonus Entry (Optional)</h3>
                        <FormField control={form.control} name="youtubeHandle" render={({ field }) => (
                            <FormItem>
                                <FormLabel className="flex items-center gap-2 text-xs"><Youtube className="h-4 w-4 text-primary" /> YouTube Handle</FormLabel>
                                <FormControl><Input placeholder="Your Channel Name or Handle" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}/>
                    </div>
                )}
                 {currentStep === 2 && (
                     <div className="space-y-4">
                        <h3 className="font-semibold">Contact Details (Optional)</h3>
                         <FormField control={form.control} name="email" render={({ field }) => (
                            <FormItem>
                                <FormLabel className="flex items-center gap-2 text-xs"><Mail className="h-4 w-4 text-primary" /> Email Address</FormLabel>
                                <FormControl><Input placeholder="you@example.com" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}/>
                        <FormField control={form.control} name="phone" render={({ field }) => (
                            <FormItem>
                                <FormLabel className="flex items-center gap-2 text-xs"><Phone className="h-4 w-4 text-primary" /> Phone Number</FormLabel>
                                <FormControl><Input placeholder="+1 555 123 4567" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}/>
                    </div>
                )}
                {currentStep === 3 && (
                    <div className="space-y-4">
                        <h3 className="font-semibold">Airdrop Wallet</h3>
                         <FormField control={form.control} name="airdropWalletType" render={({ field }) => (
                            <FormItem className="space-y-2">
                                <FormLabel>Wallet Network</FormLabel>
                                <FormControl>
                                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-2">
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                        <FormControl><RadioGroupItem value="ETH" /></FormControl>
                                        <FormLabel className="font-normal text-sm">Ethereum (ETH)</FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                        <FormControl><RadioGroupItem value="SOL" /></FormControl>
                                        <FormLabel className="font-normal text-sm">Solana (SOL)</FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                        <FormControl><RadioGroupItem value="TON" /></FormControl>
                                        <FormLabel className="font-normal text-sm">TON</FormLabel>
                                    </FormItem>
                                </RadioGroup>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}/>

                        <FormField control={form.control} name="airdropWalletAddress" render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-xs">Wallet Address</FormLabel>
                                <FormControl><Input placeholder="Your public wallet address" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}/>
                    </div>
                )}
                {currentStep === 4 && (
                    <div className="text-center space-y-4">
                        <Sparkles className="h-12 w-12 text-primary mx-auto animate-pulse" />
                        <h3 className="text-2xl font-bold">Ready to Join?</h3>
                        <p className="text-muted-foreground">You've completed all the steps. Click below to submit your registration and join the BlockShadow Initiative!</p>
                         <Button type="submit" disabled={isSubmitting} className="w-full h-12 bg-primary text-primary-foreground text-base hover:bg-primary/90 mt-6">
                            {isSubmitting ? <Loader2 className="animate-spin" /> : 'Confirm Eligibility & Register'}
                        </Button>
                    </div>
                )}
                </motion.div>
              </AnimatePresence>

              <div className="flex justify-between mt-6">
                {currentStep > 0 && currentStep < steps.length - 1 && (
                  <Button type="button" variant="outline" onClick={prevStep}>
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back
                  </Button>
                )}
                <div />
                {currentStep < steps.length - 2 && (
                  <Button type="button" onClick={nextStep}>
                    Next <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                )}
                {currentStep === steps.length - 2 && (
                  <Button type="button" onClick={nextStep} className="bg-accent text-accent-foreground hover:bg-accent/90">
                    Finish <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </div>
            </form>
            </Form>
        </CardContent>
    </Card>
  );
}
