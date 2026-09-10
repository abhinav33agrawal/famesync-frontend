import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { subscriptionsApi } from '@/lib/api';

export const useStripeCheckout = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const createCheckoutSession = async () => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to upgrade your plan.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const data = await subscriptionsApi.createCheckout();

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: 'Error',
        description: 'Failed to create checkout session. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const checkSubscriptionStatus = async () => {
    if (!user) return null;

    setIsLoading(true);
    try {
      const data = await subscriptionsApi.checkStatus();
      
      if (data?.subscribed) {
        toast({
          title: 'Welcome to Pro! 🎉',
          description: 'Your subscription has been activated successfully.',
        });
      }
      
      return data;
    } catch (error) {
      console.error('Subscription check error:', error);
      toast({
        title: 'Error',
        description: 'Failed to check subscription status. Please refresh the page.',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createCheckoutSession,
    checkSubscriptionStatus,
    isLoading,
  };
};
