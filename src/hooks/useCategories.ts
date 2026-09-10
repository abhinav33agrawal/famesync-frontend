import { useState, useEffect } from 'react';
import api from '../lib/api/config';
import { Category } from '../lib/api/types';

export const useCategories = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setIsLoading(true);
                // Correct endpoint based on backend implementation
                const response = await api.get('/campaigns/config/categories/');
                setCategories(response.data);
                setError(null);
            } catch (err: any) {
                console.error('Failed to fetch categories:', err);
                setError(err.response?.data?.error || 'Failed to load categories');
            } finally {
                setIsLoading(false);
            }
        };

        fetchCategories();
    }, []);

    return { categories, isLoading, error };
};
