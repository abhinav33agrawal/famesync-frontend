import { useState, useEffect } from 'react';
import api from '../lib/api/config';
import { Niche } from '../lib/api/types';

export const useNiches = () => {
    const [niches, setNiches] = useState<Niche[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchNiches = async () => {
            try {
                setIsLoading(true);
                const response = await api.get('/campaigns/config/niches/');
                setNiches(response.data);
                setError(null);
            } catch (err: any) {
                console.error('Failed to fetch niches:', err);
                setError(err.response?.data?.error || 'Failed to load niches');
            } finally {
                setIsLoading(false);
            }
        };

        fetchNiches();
    }, []);

    return { niches, isLoading, error };
};
