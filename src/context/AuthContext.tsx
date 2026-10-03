import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import type { User } from '@/lib/api/types';
import { api, API_BASE_URL } from '@/lib/api';
import { exchangeInstagramCode, type InstagramAccountData } from '@/lib/instagram';

/* Instagram used to sign you into a separate Node service, which issued its
   own token and its own user. The context carried both identities and every
   consumer had to branch on which one was live. Instagram is now just
   another way to obtain a FameSync session, so there is one token, one user
   and no `authSource`. */

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<'influencer' | 'brand'>;
  signup: (
    username: string,
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    role: 'influencer' | 'brand'
  ) => Promise<void>;
  logout: () => Promise<void>;
  /** Drop the local session without calling the API -- for after the
   *  account itself is gone, when /auth/logout/ can only fail. */
  endSession: () => void;
  refreshUser: () => Promise<void>;
  loginWithGoogle: (idToken: string, role: 'influencer' | 'brand') => Promise<'influencer' | 'brand'>;
  completeInstagramLogin: (
    code: string,
    options?: { email?: string; role?: 'influencer' | 'brand' }
  ) => Promise<'influencer' | 'brand' | 'needs_email'>;
  pendingInstagramAccount: InstagramAccountData | null;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('famee_user');
    // A cached user without a token is a stale session, not a logged-in one.
    if (!savedUser || !localStorage.getItem('famee_tokens')) return null;
    try {
      return JSON.parse(savedUser);
    } catch {
      return null;
    }
  });
  const [pendingInstagramAccount, setPendingInstagramAccount] =
    useState<InstagramAccountData | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const hasToken = Boolean(localStorage.getItem('famee_tokens'));

  const setSession = (nextUser: User) => {
    setUser(nextUser);
    localStorage.setItem('famee_user', JSON.stringify(nextUser));
  };

  const storeTokens = (access: string, refresh: string) => {
    localStorage.setItem('famee_tokens', JSON.stringify({ access, refresh }));
  };

  const clearSession = () => {
    localStorage.removeItem('famee_tokens');
    localStorage.removeItem('famee_user');
    setUser(null);
  };

  const { data: currentUser, isLoading: isQueryLoading, refetch } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      try {
        const res = await api.get('/auth/me/');
        return res.data as User;
      } catch (error: any) {
        if (error.response?.status === 401 && hasToken) {
          try {
            const tokensRaw = localStorage.getItem('famee_tokens');
            if (!tokensRaw) throw error;

            const { refresh } = JSON.parse(tokensRaw);
            const response = await api.post('/auth/refresh/', { refresh });
            const newTokens = { ...JSON.parse(tokensRaw), access: response.data.access };
            localStorage.setItem('famee_tokens', JSON.stringify(newTokens));

            const retryRes = await api.get('/auth/me/');
            return retryRes.data as User;
          } catch {
            clearSession();
            window.location.href = '/auth';
            throw error;
          }
        }
        throw error;
      }
    },
    enabled: hasToken,
    retry: false,
  });

  useEffect(() => {
    if (!currentUser) return;
    setSession(currentUser);
  }, [currentUser]);

  const loading = hasToken && isQueryLoading && !user;
  const isAuthenticated = Boolean(user);

  const login = async (username: string, password: string): Promise<'influencer' | 'brand'> => {
    try {
      const response = await api.post('/auth/login/', { username, password });
      storeTokens(response.data.access, response.data.refresh);

      const currentFameeUser = await api.get('/auth/me/').then((res) => res.data as User);
      setSession(currentFameeUser);

      toast({ title: 'Login successful', description: `Welcome back, ${currentFameeUser.username}!` });
      return currentFameeUser.role;
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Invalid credentials';
      toast({ title: 'Login failed', description: errorMessage, variant: 'destructive' });
      throw new Error(errorMessage);
    }
  };

  const signup = async (
    username: string,
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    role: 'influencer' | 'brand'
  ) => {
    try {
      await api.post('/auth/register/', {
        username,
        email,
        password,
        password2: password,
        first_name: firstName,
        last_name: lastName,
        role,
      });

      toast({ title: 'Account created', description: 'Please check your email to verify your account.' });
    } catch (error: any) {
      let errorMessage = 'Signup failed';
      const data = error.response?.data;
      if (data) {
        if (data.username) errorMessage = data.username[0];
        else if (data.email) errorMessage = data.email[0];
        else if (data.password) errorMessage = data.password[0];
        else if (data.error) errorMessage = data.error;
      }

      toast({ title: 'Signup failed', description: errorMessage, variant: 'destructive' });
      throw error;
    }
  };

  const loginWithGoogle = async (
    idToken: string,
    role: 'influencer' | 'brand'
  ): Promise<'influencer' | 'brand'> => {
    try {
      const response = await api.post(`${API_BASE_URL}/auth/google-login/`, { id_token: idToken, role });
      storeTokens(response.data.access, response.data.refresh);

      const currentFameeUser = response.data.user as User;
      setSession(currentFameeUser);

      queryClient.invalidateQueries({ queryKey: ['user'] });
      queryClient.invalidateQueries({ queryKey: ['subscription'] });

      toast({ title: 'Login successful', description: `Welcome back, ${currentFameeUser.username}!` });
      return currentFameeUser.role;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Google login failed';
      toast({ title: 'Google login failed', description: errorMessage, variant: 'destructive' });
      throw new Error(errorMessage);
    }
  };

  /** Redeem the one-time code the API put on /auth/callback. */
  const completeInstagramLogin = async (
    code: string,
    options: { email?: string; role?: 'influencer' | 'brand' } = {}
  ): Promise<'influencer' | 'brand' | 'needs_email'> => {
    const normalizedCode = `${code || ''}`.trim();
    if (!normalizedCode) {
      throw new Error('Instagram sign-in code is missing.');
    }

    try {
      const result = await exchangeInstagramCode(normalizedCode, options);

      if (result.status === 'needs_email') {
        setPendingInstagramAccount(result.instagram);
        return 'needs_email';
      }

      storeTokens(result.access, result.refresh);
      setSession(result.user);
      setPendingInstagramAccount(null);

      queryClient.invalidateQueries({ queryKey: ['user'] });
      queryClient.invalidateQueries({ queryKey: ['subscription'] });

      toast({ title: 'Login successful', description: `Welcome back, ${result.user.username}!` });
      return result.user.role;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Instagram login failed';
      toast({ title: 'Instagram login failed', description: errorMessage, variant: 'destructive' });
      throw new Error(errorMessage);
    }
  };

  const refreshUser = async () => {
    try {
      await refetch();
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  };

  const logout = async () => {
    const tokens = localStorage.getItem('famee_tokens');
    if (tokens) {
      try {
        const { refresh } = JSON.parse(tokens);
        await api.post('/auth/logout/', { refresh });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }

    clearSession();
    queryClient.clear();

    toast({ title: 'Logged out', description: 'You have been logged out.' });
    window.location.href = '/';
  };

  const endSession = () => {
    clearSession();
    queryClient.clear();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        logout,
        endSession,
        refreshUser,
        loginWithGoogle,
        completeInstagramLogin,
        pendingInstagramAccount,
        isAuthenticated,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
