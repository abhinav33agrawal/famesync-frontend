import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import type { User } from '@/lib/api/types';
import { api, API_BASE_URL } from '@/lib/api';
import {
  clearInstagramServiceToken,
  fetchInstagramServiceUser,
  getInstagramServiceToken,
  setInstagramServiceToken,
  type InstagramServiceUser,
} from '@/lib/instagramService';

type AuthSource = 'famee' | 'instagram' | null;

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
  refreshUser: () => Promise<void>;
  loginWithGoogle: (idToken: string, role: 'influencer' | 'brand') => Promise<'influencer' | 'brand'>;
  completeInstagramLogin: (token: string, role: 'influencer' | 'brand', email?: string) => Promise<'influencer' | 'brand' | 'needs_email'>;
  authSource: AuthSource;
  isAuthenticated: boolean;
  loading: boolean;
}

const AUTH_SOURCE_KEY = 'famee_auth_source';

const readAuthSource = (): AuthSource => {
  const value = `${localStorage.getItem(AUTH_SOURCE_KEY) || ''}`.trim().toLowerCase();
  if (value === 'famee' || value === 'instagram') return value;
  return null;
};

const persistAuthSource = (source: AuthSource) => {
  if (source) {
    localStorage.setItem(AUTH_SOURCE_KEY, source);
    return;
  }
  localStorage.removeItem(AUTH_SOURCE_KEY);
};

const toInstagramSessionUser = (instagramUser: InstagramServiceUser): User => {
  const username = `${instagramUser.username || ''}`.trim() || 'instagram-user';
  const numericId = Number.parseInt(`${instagramUser.id || ''}`.trim(), 10);
  const role: User['role'] = instagramUser.role === 'brand' ? 'brand' : 'influencer';

  return {
    id: Number.isFinite(numericId) ? numericId : 0,
    username,
    email: `${instagramUser.email || ''}`.trim(),
    first_name: username,
    last_name: '',
    role,
    credits: 0,
    created_at: new Date().toISOString(),
    subscription_plan: 'free',
    has_profile: true,
    email_verified: true,
    is_approved: true,
    is_new_member: false,
  };
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authSource, setAuthSource] = useState<AuthSource>(() => readAuthSource());
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('famee_user');
    if (!savedUser) return null;

    const source = readAuthSource();
    const hasFameeToken = Boolean(localStorage.getItem('famee_tokens'));
    const hasInstagramToken = Boolean(getInstagramServiceToken());
    const canRestoreSession =
      (source === 'famee' && hasFameeToken) || (source === 'instagram' && hasInstagramToken);

    if (!canRestoreSession) return null;

    try {
      return JSON.parse(savedUser);
    } catch {
      return null;
    }
  });
  const [isInstagramBootstrapping, setIsInstagramBootstrapping] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const savedTokens = localStorage.getItem('famee_tokens');
  const hasFameeToken = Boolean(savedTokens);

  const setSession = (nextUser: User, source: Exclude<AuthSource, null>) => {
    setUser(nextUser);
    setAuthSource(source);
    localStorage.setItem('famee_user', JSON.stringify(nextUser));
    persistAuthSource(source);
  };

  const clearSession = () => {
    localStorage.removeItem('famee_tokens');
    localStorage.removeItem('famee_user');
    clearInstagramServiceToken();
    setAuthSource(null);
    persistAuthSource(null);
    setUser(null);
  };

  const { data: currentUser, isLoading: isQueryLoading, refetch } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      try {
        const res = await api.get('/auth/me/');
        return res.data as User;
      } catch (error: any) {
        if (error.response?.status === 401 && hasFameeToken) {
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
            localStorage.removeItem('famee_tokens');
            localStorage.removeItem('famee_user');
            persistAuthSource(null);
            window.location.href = '/auth';
            throw error;
          }
        }
        throw error;
      }
    },
    enabled: hasFameeToken,
    retry: false,
  });

  useEffect(() => {
    if (!currentUser) return;
    setSession(currentUser, 'famee');
  }, [currentUser]);

  useEffect(() => {
    if (hasFameeToken) return;

    const instagramToken = getInstagramServiceToken();
    if (!instagramToken) {
      if (authSource === 'instagram') {
        localStorage.removeItem('famee_user');
        setAuthSource(null);
        persistAuthSource(null);
        setUser(null);
      }
      return;
    }

    if (authSource && authSource !== 'instagram') return;

    let isMounted = true;
    setIsInstagramBootstrapping(true);

    fetchInstagramServiceUser(instagramToken)
      .then(({ user: instagramUser }) => {
        if (!isMounted) return;
        setSession(toInstagramSessionUser(instagramUser), 'instagram');
      })
      .catch(() => {
        if (!isMounted) return;
        clearInstagramServiceToken();
        localStorage.removeItem('famee_user');
        setAuthSource(null);
        persistAuthSource(null);
        setUser(null);
      })
      .finally(() => {
        if (isMounted) {
          setIsInstagramBootstrapping(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [hasFameeToken, authSource]);

  const loading =
    (hasFameeToken && isQueryLoading && !user) || (isInstagramBootstrapping && !user);
  const isAuthenticated = Boolean(user);

  const login = async (username: string, password: string): Promise<'influencer' | 'brand'> => {
    try {
      const response = await api.post('/auth/login/', { username, password });
      const tokens = { access: response.data.access, refresh: response.data.refresh };
      localStorage.setItem('famee_tokens', JSON.stringify(tokens));

      const currentFameeUser = await api.get('/auth/me/').then((res) => res.data as User);
      setSession(currentFameeUser, 'famee');

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
      const tokens = { access: response.data.access, refresh: response.data.refresh };
      localStorage.setItem('famee_tokens', JSON.stringify(tokens));

      const currentFameeUser = response.data.user as User;
      setSession(currentFameeUser, 'famee');

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

  const completeInstagramLogin = async (token: string, role: 'influencer' | 'brand', email?: string): Promise<'influencer' | 'brand' | 'needs_email'> => {
    const normalizedToken = `${token || ''}`.trim();
    if (!normalizedToken) {
      throw new Error('Instagram callback token is missing.');
    }

    setInstagramServiceToken(normalizedToken);
    
    try {
      const response = await api.post(`${API_BASE_URL}/auth/instagram-login/`, { token: normalizedToken, role, email });
      
      if (response.status === 206) {
        return 'needs_email';
      }

      const tokens = { access: response.data.access, refresh: response.data.refresh };
      localStorage.setItem('famee_tokens', JSON.stringify(tokens));

      const currentFameeUser = response.data.user as User;
      setSession(currentFameeUser, 'famee');

      queryClient.invalidateQueries({ queryKey: ['user'] });
      queryClient.invalidateQueries({ queryKey: ['subscription'] });

      toast({ title: 'Login successful', description: `Welcome back, ${currentFameeUser.username}!` });
      return currentFameeUser.role;
    } catch (error: any) {
      if (error.response?.status === 206) {
        return 'needs_email';
      }
      const errorMessage = error.response?.data?.error || 'Instagram login failed';
      toast({ title: 'Instagram login failed', description: errorMessage, variant: 'destructive' });
      throw new Error(errorMessage);
    }
  };

  const refreshUser = async () => {
    try {
      if (authSource === 'instagram') {
        const instagramToken = getInstagramServiceToken();
        if (!instagramToken) return;
        const { user: instagramUser } = await fetchInstagramServiceUser(instagramToken);
        setSession(toInstagramSessionUser(instagramUser), 'instagram');
        return;
      }

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

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        logout,
        refreshUser,
        loginWithGoogle,
        completeInstagramLogin,
        authSource,
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
