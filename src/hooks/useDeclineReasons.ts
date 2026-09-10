import { useState, useEffect } from 'react';
import api from '../lib/api/config';
import { DeclineReason } from '../lib/api/types';

export const useDeclineReasons = () => {
    const [reasons, setReasons] = useState<DeclineReason[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchReasons = async () => {
            try {
                setIsLoading(true);
                const response = await api.get('/campaigns/config/decline-reasons/');
                setReasons(response.data);
                setError(null);
            } catch (err: any) {
                console.error('Failed to fetch decline reasons:', err);
                setError(err.response?.data?.error || 'Failed to load decline reasons');
            } finally {
                setIsLoading(false);
            }
        };

        fetchReasons();
    }, []);

    return { reasons, isLoading, error };
};
