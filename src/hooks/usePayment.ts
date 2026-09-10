import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { subscriptionsApi } from '@/lib/api';
import type { CreatePaymentResponse, VerifyPaymentPayload, RazorpayCreateResponse } from '@/lib/api/types';

// Minimal Razorpay types
type RazorpayHandlerResponse = {
  razorpay_subscription_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type RazorpayCheckoutOptions = {
  key: string;
  subscription_id: string;
  name?: string;
  description?: string;
  image?: string;
  prefill?: { name?: string; email?: string; contact?: string };
  theme?: { color?: string };
  handler: (response: RazorpayHandlerResponse) => void;
  modal?: { ondismiss?: () => void };
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayCheckoutOptions) => { open: () => void };
  }
}

async function loadRazorpayScript(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  if (window.Razorpay) return true;
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export const usePayment = () => {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const create = async (gateway: 'stripe' | 'razorpay'): Promise<CreatePaymentResponse | null> => {
    setIsLoading(true);
    try {
      const resp = await subscriptionsApi.createPayment(gateway);
      return resp;
    } catch (e) {
      toast({
        title: 'Payment Error',
        description: 'Could not initiate payment. Please try again.',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const startStripeCheckout = async () => {
    const data = await create('stripe');
    if (!data) return;
    const stripeData = data as { url?: string };
    if (stripeData.url) {
      window.open(stripeData.url, '_blank');
    } else {
      toast({ title: 'Error', description: 'Stripe checkout URL missing.', variant: 'destructive' });
    }
  };

  const startRazorpayCheckout = async (options?: {
    name?: string;
    description?: string;
    image?: string;
    prefill?: { name?: string; email?: string; contact?: string };
    theme?: { color?: string };
  }) => {
    const ok = await loadRazorpayScript();
    if (!ok) {
      toast({ title: 'Error', description: 'Failed to load Razorpay SDK.', variant: 'destructive' });
      return;
    }

    const data = await create('razorpay');
    if (!data) return;

    const { subscription_id, key_id } = data as RazorpayCreateResponse;
    if (!subscription_id || !key_id) {
      toast({ title: 'Error', description: 'Invalid Razorpay subscription.', variant: 'destructive' });
      return;
    }

    const rz = new window.Razorpay!({
      key: key_id,
      subscription_id,
      name: options?.name ?? 'FameSync Pro',
      description: options?.description ?? 'Monthly subscription',
      image: options?.image,
      prefill: options?.prefill,
      theme: options?.theme,
      handler: async function (response: RazorpayHandlerResponse) {
        try {
          const payload: VerifyPaymentPayload = {
            gateway: 'razorpay',
            razorpay_subscription_id: response.razorpay_subscription_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          };
          await subscriptionsApi.verifyPayment(payload);
          // Invalidate queries to refresh user data and subscription status
          queryClient.invalidateQueries({ queryKey: ['subscription'] });
          queryClient.invalidateQueries({ queryKey: ['user'] });
          toast({ title: 'Welcome to Pro! 🎉', description: 'Your subscription is active.' });
        } catch (err) {
          toast({ title: 'Verification failed', description: 'Please contact support.', variant: 'destructive' });
        }
      },
      modal: {
        ondismiss: function () {
          toast({ title: 'Payment cancelled', description: 'You can try again anytime.' });
        },
      },
    });

    rz.open();
  };

  return {
    isLoading,
    startStripeCheckout,
    startRazorpayCheckout,
  };
};
