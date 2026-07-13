import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase.js';
import { normalizeError } from '../lib/helpers.js';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [session, setSession] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [toasts, setToasts] = useState([]);
  const [floatingPanel, setFloatingPanel] = useState(null);

  const toast = useCallback((message, type = 'success') => {
    const id = crypto.randomUUID();
    setToasts((items) => [...items, { id, message, type }]);
    window.setTimeout(() => {
      setToasts((items) => items.filter((item) => item.id !== id));
    }, 3600);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((items) => items.filter((item) => item.id !== id));
  }, []);

  const fetchProfile = useCallback(async (userId) => {
    if (!userId) {
      setCurrentUser(null);
      return null;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) throw error;
    setCurrentUser(data || null);
    return data || null;
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!session?.user?.id) return null;
    try {
      return await fetchProfile(session.user.id);
    } catch (error) {
      toast(normalizeError(error), 'error');
      return null;
    }
  }, [fetchProfile, session?.user?.id, toast]);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(async ({ data }) => {
      if (!mounted) return;
      const nextSession = data.session || null;
      setSession(nextSession);
      if (nextSession?.user?.id) {
        try {
          await fetchProfile(nextSession.user.id);
        } catch (error) {
          console.error(error);
        }
      }
      if (mounted) setAuthLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      setSession(nextSession);
      if (nextSession?.user?.id) {
        try {
          await fetchProfile(nextSession.user.id);
        } catch (error) {
          console.error(error);
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
      setAuthLoading(false);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const register = useCallback(async (payload) => {
    const { email, password, fullName, username, phone, schoolName, faculty, major } = payload;
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          username,
          phone,
          school_name: schoolName,
          faculty,
          major,
        },
      },
    });
    if (error) throw error;
    return data;
  }, []);

  const login = useCallback(async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }, []);

  const logout = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setFloatingPanel(null);
  }, []);

  const toggleFloatingPanel = useCallback((name) => {
    setFloatingPanel((current) => (current === name ? null : name));
  }, []);

  const value = useMemo(() => ({
    session,
    currentUser,
    authLoading,
    register,
    login,
    logout,
    refreshProfile,
    toast,
    toasts,
    removeToast,
    floatingPanel,
    setFloatingPanel,
    toggleFloatingPanel,
  }), [
    session,
    currentUser,
    authLoading,
    register,
    login,
    logout,
    refreshProfile,
    toast,
    toasts,
    removeToast,
    floatingPanel,
    toggleFloatingPanel,
  ]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const value = useContext(AppContext);
  if (!value) throw new Error('useApp phải nằm trong AppProvider');
  return value;
}
