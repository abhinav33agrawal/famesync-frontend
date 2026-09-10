import { useState, useEffect } from 'react';
import api from '../lib/api/config';
import { City } from '../lib/api/types';

export const useCities = () => {
    const [cities, setCities] = useState<City[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCities = async () => {
            try {
                setIsLoading(true);
                const response = await api.get('/campaigns/config/cities/');
                setCities(response.data);
                setError(null);
            } catch (err: any) {
                console.error('Failed to fetch cities:', err);
                setError(err.response?.data?.error || 'Failed to load cities');
            } finally {
                setIsLoading(false);
            }
        };

        fetchCities();
    }, []);

    return { cities, isLoading, error };
};
