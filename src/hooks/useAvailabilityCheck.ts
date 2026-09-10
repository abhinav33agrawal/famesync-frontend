import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '@/lib/api';

type AvailabilityStatus = 'idle' | 'checking' | 'available' | 'taken' | 'invalid';

interface AvailabilityResult {
  status: AvailabilityStatus;
  message: string;
}

export function useAvailabilityCheck(
  type: 'username' | 'email',
  value: string,
  debounceMs: number = 400
): AvailabilityResult {
  const [status, setStatus] = useState<AvailabilityStatus>('idle');
  const [message, setMessage] = useState('');
  const abortControllerRef = useRef<AbortController | null>(null);

  const checkAvailability = useCallback(async (val: string) => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const trimmedValue = val.trim();

    // Validation for username
    if (type === 'username') {
      if (trimmedValue.length === 0) {
        setStatus('idle');
        setMessage('');
        return;
      }
      if (trimmedValue.length < 3) {
        setStatus('invalid');
        setMessage('Username must be at least 3 characters');
        return;
      }
      // Check if username contains spaces
      if (/\s/.test(trimmedValue)) {
        setStatus('invalid');
        setMessage('Username cannot contain spaces');
        return;
      }
      // Check if username looks like an email
      if (trimmedValue.includes('@') && trimmedValue.includes('.')) {
        setStatus('invalid');
        setMessage('Username cannot be an email address');
        return;
      }
      // Check for valid characters: only letters, numbers, and @, +, -, _ (no special chars like spaces, #, etc.)
      if (!/^[a-zA-Z0-9@+\-_.]+$/.test(trimmedValue)) {
        setStatus('invalid');
        setMessage('Username can only contain letters, numbers, and @/+/-/./_ characters');
        return;
      }
    }

    // Validation for email
    if (type === 'email') {
      if (trimmedValue.length === 0) {
        setStatus('idle');
        setMessage('');
        return;
      }
      if (!trimmedValue.includes('@') || trimmedValue.length < 5) {
        setStatus('invalid');
        setMessage('Enter a valid email address');
        return;
      }
    }

    setStatus('checking');
    setMessage('Checking...');

    abortControllerRef.current = new AbortController();

    try {
      const endpoint = type === 'username'
        ? `/auth/check-username/?username=${encodeURIComponent(trimmedValue)}`
        : `/auth/check-email/?email=${encodeURIComponent(trimmedValue)}`;

      const response = await api.get(endpoint, {
        signal: abortControllerRef.current.signal
      });

      if (response.data.available) {
        setStatus('available');
        setMessage('Available');
      } else {
        setStatus('taken');
        setMessage(response.data.message || `${type === 'username' ? 'Username' : 'Email'} is already taken`);
      }
    } catch (error: any) {
      if (error.name === 'CanceledError' || error.name === 'AbortError') {
        return; // Request was cancelled, don't update state
      }
      setStatus('idle');
      setMessage('');
    }
  }, [type]);

  useEffect(() => {
    const handler = setTimeout(() => {
      checkAvailability(value);
    }, debounceMs);

    return () => {
      clearTimeout(handler);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [value, debounceMs, checkAvailability]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return { status, message };
}
