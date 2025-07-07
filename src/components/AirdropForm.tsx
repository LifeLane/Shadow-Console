
"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { Gift, Sparkles, Mail, Phone, Send, Youtube, Loader2 } from 'lucide-react';
import { registerForAirdropAction } from '@/app/airdrop/actions';
import type { AirdropRegistration } from '@/lib/types';

const airdropFormSchema = z.object({
  email: z.string().email("Invalid email address.").optional().or(z.literal('')),
  phone: z.string().optional(),
  twitterHandle: z.string().min(1, "Twitter handle is required."),
  telegramHandle: z.string().min(1, "Telegram handle is required."),
  youtubeHandle: z.string().optional(),
  airdropWalletType: z.enum(['ETH', 'SOL', 'TON'], { required_error: "Please select a wallet type." }),
  airdropWalletAddress: z.string().min(10, "A valid wallet address is required."),
});

type AirdropFormValues = z.infer<typeof airdropFormSchema>;

interface AirdropFormProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSuccess: () => void;
}

const XIcon = () => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 fill-current">
        <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/>
    </svg>
);

export default function AirdropForm({ isOpen, onOpenChange, onSuccess }: AirdropFormProps) {
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
    }
  });

  const onSubmit = async (data: AirdropFormValues) => {
    setIsSubmitting(true);
    try {
      await registerForAirdropAction(data as Omit<AirdropRegistration, 'userId' | 'timestamp'>);
      toast({
        title: "Registration Complete!",
        description: "You are now eligible for the airdrop and have unlocked full access.",
        className: "bg-accent text-accent-foreground border-primary"
      });
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast({ title: "Submission Error", description: "Could not process your registration. Please try again.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-primary/30 max-w-lg text-foreground">
        <DialogHeader className="text-center items-center">
          <div className="bg-primary/10 p-3 rounded-full mb-4">
            <Gift className="h-8 w-8 text-primary" />
          </div>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            Join the BlockShadow Initiative!
          </DialogTitle>
          <p className="text-muted-foreground pt-2 text-sm">Complete your registration to become eligible for the <span className="text-primary font-bold">#BSAI airdrop</span> and future rewards.</p>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 px-2">
            
            <FormField control={form.control} name="email" render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2 text-xs"><Mail className="h-4 w-4 text-primary" /> Email Address (Optional)</FormLabel>
                <FormControl><Input placeholder="you@example.com" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}/>
            <FormField control={form.control} name="phone" render={({ field }) => (
                <FormItem>
                    <FormLabel className="flex items-center gap-2 text-xs"><Phone className="h-4 w-4 text-primary" /> Phone Number (Optional)</FormLabel>
                    <FormControl><Input placeholder="+1 555 123 4567" {...field} /></FormControl>
                    <FormMessage />
                </FormItem>
            )}/>
            
            <p className="text-sm font-semibold text-primary pt-2">Social Handles (for verification)</p>
            
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
             <FormField control={form.control} name="youtubeHandle" render={({ field }) => (
                <FormItem>
                    <FormLabel className="flex items-center gap-2 text-xs"><Youtube className="h-4 w-4 text-primary" /> YouTube Handle (Optional)</FormLabel>
                    <FormControl><Input placeholder="Your Channel Name or Handle" {...field} /></FormControl>
                    <FormMessage />
                </FormItem>
            )}/>

            <p className="text-sm font-semibold text-primary pt-2">Airdrop Wallet Type</p>

            <FormField control={form.control} name="airdropWalletType" render={({ field }) => (
              <FormItem className="space-y-2">
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

            <Button type="submit" disabled={isSubmitting} className="w-full h-12 bg-primary text-primary-foreground text-base hover:bg-primary/90 mt-6">
              {isSubmitting ? <Loader2 className="animate-spin" /> : 'Confirm Eligibility & Register'}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
