import { useState, useEffect } from 'react';
import api from '../lib/api/config';
import { SubscriptionPlan } from '../lib/api/types';

export const usePlans = () => {
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                setIsLoading(true);
                const response = await api.get('/subscriptions/plans/');
                setPlans(response.data);
                setError(null);
            } catch (err: any) {
                console.error('Failed to fetch plans:', err);
                setError(err.response?.data?.error || 'Failed to load subscription plans');
            } finally {
                setIsLoading(false);
            }
        };

        fetchPlans();
    }, []);

    return { plans, isLoading, error };
};
