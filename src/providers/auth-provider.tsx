'use client';

import { supabase } from '@/src/lib/supabase';
import { useRouter } from 'next/navigation';
import { createContext, useContext, useEffect, useState } from 'react';
import type { AuthState, UserSession } from '@/types/auth';

interface AuthContextType extends AuthState {
    signInWithGoogle: () => Promise<void>;
    signOut: () => Promise<void>;
    refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    isLoading: true,
    error: null,
    signInWithGoogle: async () => { },
    signOut: async () => { },
    refreshSession: async () => { },
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [authState, setAuthState] = useState<AuthState>({
        user: null,
        isLoading: true,
        error: null,
    });

    const router = useRouter();

    const refreshSession = async () => {
        try {
            const { data: { session }, error } = await supabase.auth.getSession();
            if (error) throw error;

            setAuthState(prev => ({
                ...prev,
                user: session?.user as unknown as UserSession | null,
                isLoading: false,
                error: null,
            }));
        } catch (error) {
            console.error('Error refreshing session:', error);
            setAuthState(prev => ({
                ...prev,
                error: error as Error,
                isLoading: false,
            }));
        }
    };

    useEffect(() => {
        refreshSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            setAuthState(prev => ({
                ...prev,
                user: session?.user as unknown as UserSession | null,
                isLoading: false,
                error: null,
            }));

            if (event === 'SIGNED_IN') {
                router.push('/');
            }

            if (event === 'SIGNED_OUT') {
                router.push('/');
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [router]);

    const signInWithGoogle = async () => {
        try {
            setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent',
                    },
                    scopes: 'email profile',
                },
            });

            router.refresh();

            if (error) throw error;
            console.log('Google sign-in successful');
        } catch (error) {
            console.error('Error signing in with Google:', error);
            setAuthState(prev => ({
                ...prev,
                error: error as Error,
                isLoading: false,
            }));
        }
    };

    const signOut = async () => {
        try {
            setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

            const { error } = await supabase.auth.signOut();
            if (error) throw error;

            console.log('Sign-out successful');
        } catch (error) {
            console.error('Error signing out:', error);
            setAuthState(prev => ({
                ...prev,
                error: error as Error,
                isLoading: false,
            }));
        }
    };

    return (
        <AuthContext.Provider
            value={{
                ...authState,
                signInWithGoogle,
                signOut,
                refreshSession,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);