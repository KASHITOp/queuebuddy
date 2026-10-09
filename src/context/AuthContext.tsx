'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole, AdminSubRole, BuddyApplication, SupportedLanguage } from '@/types';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  role: UserRole;
  adminSubRole: AdminSubRole | null;
  buddyApplication: BuddyApplication | null;
  signInWithGoogle: () => Promise<{ error?: string }>;
  signInWithEmail: (email: string, pass: string) => Promise<{ error?: string }>;
  signUpWithEmail: (
    email: string,
    pass: string,
    fullName: string,
    phone?: string
  ) => Promise<{ error?: string }>;
  signInWithMagicLink: (email: string) => Promise<{ error?: string; message?: string }>;
  requestPhoneOtp: (phone: string) => Promise<{ error?: string; success?: boolean }>;
  verifyPhoneOtp: (phone: string, otp: string) => Promise<{ error?: string }>;
  resetPassword: (email: string) => Promise<{ error?: string; message?: string }>;
  submitBuddyApplication: (data: {
    fullName: string;
    phone: string;
    languages: SupportedLanguage[];
    preferredZones: string[];
    idType: string;
    idUrl?: string;
    selfieUrl?: string;
  }) => Promise<{ error?: string }>;
  deleteAccountAndData: () => Promise<void>;
  signOut: () => Promise<void>;
  quickDemoLogin: (
    role: UserRole,
    adminSubRole?: AdminSubRole,
    status?: 'verified' | 'pending'
  ) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Initial demo user (Customer)
const DEMO_CUSTOMER: UserProfile = {
  id: 'usr-customer-1',
  email: 'arjun.mehta@example.com',
  phone: '+91 98451 99887',
  full_name: 'Arjun Mehta',
  role: 'customer',
  created_at: '2026-09-01T10:00:00Z',
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [buddyApplication, setBuddyApplication] = useState<BuddyApplication | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  // Load user from local storage or check Supabase session
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (typeof window !== 'undefined') {
          const savedUser = localStorage.getItem('qb_auth_user');
          const savedApp = localStorage.getItem('qb_buddy_application');

          if (savedUser) {
            setUser(JSON.parse(savedUser));
          } else {
            // Default logged out or set customer demo
            setUser(DEMO_CUSTOMER);
          }

          if (savedApp) {
            setBuddyApplication(JSON.parse(savedApp));
          }
        }

        // If Supabase is connected, check real auth session
        if (isSupabaseConfigured()) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            // Fetch real role from user_roles table
            const { data: roleData } = await supabase
              .from('user_roles')
              .select('role, admin_sub_role')
              .eq('user_id', session.user.id)
              .single();

            setUser({
              id: session.user.id,
              email: session.user.email || '',
              phone: session.user.phone,
              full_name:
                session.user.user_metadata?.full_name ||
                session.user.email?.split('@')[0] ||
                'User',
              role: (roleData?.role as UserRole) || 'customer',
              admin_sub_role: (roleData?.admin_sub_role as AdminSubRole) || undefined,
              created_at: session.user.created_at,
            });
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const persistUser = (u: UserProfile | null) => {
    setUser(u);
    if (typeof window !== 'undefined') {
      if (u) {
        localStorage.setItem('qb_auth_user', JSON.stringify(u));
      } else {
        localStorage.removeItem('qb_auth_user');
      }
    }
  };

  const persistApplication = (app: BuddyApplication | null) => {
    setBuddyApplication(app);
    if (typeof window !== 'undefined') {
      if (app) {
        localStorage.setItem('qb_buddy_application', JSON.stringify(app));
      } else {
        localStorage.removeItem('qb_buddy_application');
      }
    }
  };

  const getRedirectForRole = (role: UserRole) => {
    switch (role) {
      case 'buddy':
        return '/buddy';
      case 'admin':
        return '/admin';
      default:
        return '/app';
    }
  };

  // Google OAuth Login
  const signInWithGoogle = async () => {
    try {
      if (isSupabaseConfigured()) {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/app`,
          },
        });
        if (error) return { error: error.message };
      } else {
        // Demo simulation
        const demoGoogleUser: UserProfile = {
          id: `usr-google-${Date.now()}`,
          email: 'google.user@example.com',
          full_name: 'Bengaluru Citizen',
          role: 'customer',
          created_at: new Date().toISOString(),
        };
        persistUser(demoGoogleUser);
        router.push(getRedirectForRole(demoGoogleUser.role));
      }
      return {};
    } catch (e: any) {
      return { error: e.message || 'Google sign-in failed' };
    }
  };

  // Email + Password Sign In
  const signInWithEmail = async (email: string, pass: string) => {
    try {
      if (isSupabaseConfigured()) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password: pass,
        });
        if (error) return { error: error.message };

        if (data.user) {
          const { data: roleData } = await supabase
            .from('user_roles')
            .select('role, admin_sub_role')
            .eq('user_id', data.user.id)
            .single();

          const authed: UserProfile = {
            id: data.user.id,
            email: data.user.email || email,
            phone: data.user.phone,
            full_name: data.user.user_metadata?.full_name || email.split('@')[0],
            role: (roleData?.role as UserRole) || 'customer',
            admin_sub_role: roleData?.admin_sub_role as AdminSubRole,
            created_at: data.user.created_at,
          };
          persistUser(authed);
          router.push(getRedirectForRole(authed.role));
        }
      } else {
        // Local validation simulation
        if (pass.length < 6) {
          return { error: 'Password must be at least 6 characters long.' };
        }
        const authed: UserProfile = {
          id: `usr-${Date.now()}`,
          email,
          full_name: email.split('@')[0],
          role: email.includes('admin') ? 'admin' : email.includes('buddy') ? 'buddy' : 'customer',
          admin_sub_role: email.includes('admin') ? 'super_admin' : undefined,
          created_at: new Date().toISOString(),
        };
        persistUser(authed);
        router.push(getRedirectForRole(authed.role));
      }
      return {};
    } catch (e: any) {
      return { error: e.message || 'Login failed' };
    }
  };

  // Email + Password Sign Up
  const signUpWithEmail = async (
    email: string,
    pass: string,
    fullName: string,
    phone?: string
  ) => {
    try {
      if (isSupabaseConfigured()) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password: pass,
          options: {
            data: { full_name: fullName, phone },
          },
        });
        if (error) return { error: error.message };
        if (data.user) {
          const newUser: UserProfile = {
            id: data.user.id,
            email,
            phone,
            full_name: fullName,
            role: 'customer',
            created_at: new Date().toISOString(),
          };
          persistUser(newUser);
          router.push('/app');
        }
      } else {
        if (pass.length < 6) {
          return { error: 'Password must be at least 6 characters.' };
        }
        const newUser: UserProfile = {
          id: `usr-${Date.now()}`,
          email,
          phone,
          full_name: fullName,
          role: 'customer',
          created_at: new Date().toISOString(),
        };
        persistUser(newUser);
        router.push('/app');
      }
      return {};
    } catch (e: any) {
      return { error: e.message || 'Sign up failed' };
    }
  };

  // Passwordless Magic Link
  const signInWithMagicLink = async (email: string) => {
    try {
      if (isSupabaseConfigured()) {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: { emailRedirectTo: `${window.location.origin}/app` },
        });
        if (error) return { error: error.message };
      }
      return { message: `Magic login link dispatched to ${email}! Check your inbox.` };
    } catch (e: any) {
      return { error: e.message || 'Failed to send magic link' };
    }
  };

  // Phone OTP (for Buddies)
  const requestPhoneOtp = async (phone: string) => {
    try {
      if (isSupabaseConfigured()) {
        const { error } = await supabase.auth.signInWithOtp({ phone });
        if (error) return { error: error.message };
      }
      return { success: true };
    } catch (e: any) {
      return { error: e.message || 'Failed to send OTP' };
    }
  };

  const verifyPhoneOtp = async (phone: string, token: string) => {
    try {
      if (isSupabaseConfigured()) {
        const { data, error } = await supabase.auth.verifyOtp({
          phone,
          token,
          type: 'sms',
        });
        if (error) return { error: error.message };
        if (data.user) {
          const authed: UserProfile = {
            id: data.user.id,
            email: data.user.email || `${phone}@buddy.local`,
            phone,
            full_name: 'Queue Buddy',
            role: 'buddy',
            created_at: data.user.created_at,
          };
          persistUser(authed);
          router.push('/buddy');
        }
      } else {
        if (token !== '123456' && token.length !== 6) {
          return { error: 'Invalid verification code. (Hint: use 123456 for test)' };
        }
        const authed: UserProfile = {
          id: `usr-buddy-${Date.now()}`,
          email: `${phone}@buddy.queuebuddy.local`,
          phone,
          full_name: 'Verified Buddy',
          role: 'buddy',
          created_at: new Date().toISOString(),
        };
        persistUser(authed);
        router.push('/buddy');
      }
      return {};
    } catch (e: any) {
      return { error: e.message || 'OTP verification failed' };
    }
  };

  // Forgot password
  const resetPassword = async (email: string) => {
    try {
      if (isSupabaseConfigured()) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/account`,
        });
        if (error) return { error: error.message };
      }
      return { message: `Password reset instructions sent to ${email}` };
    } catch (e: any) {
      return { error: e.message || 'Failed to send reset link' };
    }
  };

  // Submit Buddy Application at /buddy/apply
  const submitBuddyApplication = async (data: {
    fullName: string;
    phone: string;
    languages: SupportedLanguage[];
    preferredZones: string[];
    idType: string;
    idUrl?: string;
    selfieUrl?: string;
  }) => {
    try {
      const newApp: BuddyApplication = {
        id: `app-${Date.now()}`,
        user_id: user?.id || `usr-applicant-${Date.now()}`,
        full_name: data.fullName,
        phone: data.phone,
        languages: data.languages,
        preferred_zones: data.preferredZones,
        id_document_type: data.idType,
        id_document_url: data.idUrl || '/icons/sample-aadhaar.png',
        selfie_url: data.selfieUrl || '/icons/sample-selfie.png',
        status: 'pending',
        created_at: new Date().toISOString(),
      };

      persistApplication(newApp);

      // Upgrade user profile role to buddy with pending status
      const updatedUser: UserProfile = {
        id: user?.id || newApp.user_id,
        email: user?.email || `${data.phone}@buddy.queuebuddy.local`,
        phone: data.phone,
        full_name: data.fullName,
        role: 'buddy',
        created_at: new Date().toISOString(),
      };
      persistUser(updatedUser);

      router.push('/buddy');
      return {};
    } catch (e: any) {
      return { error: e.message || 'Application submission failed' };
    }
  };

  // Delete account and data (DPDP-compliant)
  const deleteAccountAndData = async () => {
    if (isSupabaseConfigured() && user) {
      await supabase.from('profiles').delete().eq('id', user.id);
      await supabase.from('user_roles').delete().eq('user_id', user.id);
    }
    persistUser(null);
    persistApplication(null);
    if (typeof window !== 'undefined') {
      localStorage.clear();
    }
    router.push('/');
  };

  // Sign out
  const signOut = async () => {
    if (isSupabaseConfigured()) {
      await supabase.auth.signOut();
    }
    persistUser(null);
    router.push('/login');
  };

  // Quick Demo Login (for 1-click test of all roles & permissions)
  const quickDemoLogin = (
    targetRole: UserRole,
    adminSubRole?: AdminSubRole,
    buddyStatus: 'verified' | 'pending' = 'verified'
  ) => {
    let mockUser: UserProfile;

    if (targetRole === 'customer') {
      mockUser = DEMO_CUSTOMER;
    } else if (targetRole === 'buddy') {
      mockUser = {
        id: buddyStatus === 'pending' ? 'usr-buddy-pending' : 'usr-buddy-verified',
        email: 'ramesh.gowda@buddy.local',
        phone: '+91 98450 12345',
        full_name: buddyStatus === 'pending' ? 'Manjunath K. (Applicant)' : 'Ramesh Gowda',
        role: 'buddy',
        created_at: '2026-08-15T10:00:00Z',
      };

      if (buddyStatus === 'pending') {
        persistApplication({
          id: 'app-pending-demo',
          user_id: mockUser.id,
          full_name: mockUser.full_name,
          phone: mockUser.phone || '',
          languages: ['Kannada', 'Telugu'],
          preferred_zones: ['Yelahanka', 'Malleshwaram'],
          id_document_type: 'Aadhaar Card',
          status: 'pending',
          created_at: new Date().toISOString(),
        });
      } else {
        persistApplication(null);
      }
    } else {
      // Admin
      mockUser = {
        id: `usr-admin-${adminSubRole || 'super'}`,
        email: `${adminSubRole || 'super'}.admin@queuebuddy.gov`,
        full_name: `${
          adminSubRole
            ? adminSubRole.charAt(0).toUpperCase() + adminSubRole.slice(1).replace('_', ' ')
            : 'Super'
        } Admin`,
        role: 'admin',
        admin_sub_role: adminSubRole || 'super_admin',
        created_at: '2026-01-01T10:00:00Z',
        mfa_enabled: true,
      };
    }

    persistUser(mockUser);
    router.push(getRedirectForRole(mockUser.role));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        role: user?.role || 'customer',
        adminSubRole: user?.admin_sub_role || null,
        buddyApplication,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        signInWithMagicLink,
        requestPhoneOtp,
        verifyPhoneOtp,
        resetPassword,
        submitBuddyApplication,
        deleteAccountAndData,
        signOut,
        quickDemoLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
