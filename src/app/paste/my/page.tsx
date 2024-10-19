'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/src/providers/auth-provider';
import { supabase } from "@/src/lib/supabase"
import { HomePageProps } from "@/types/index"



const HomePage = ({ toggle = false }: HomePageProps) => {
    const { user, isLoading: authLoading, error: authError } = useAuth();
    const [pastes, setPastes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {

        const fetchPastes = async () => {
            if (authLoading) return;
            if (!user) {
                setError('User not authenticated');
                setLoading(false);
                return;
            }

            try {
                if (toggle) {
                    console.log("running prisma")
                    const response = await fetch(`/api/pastes?userId=${user.id}`);

                    if (!response.ok) {
                        throw new Error('Failed to fetch pastes');
                    }

                    const data = await response.json();

                    setPastes(data || []);
                } else {
                    console.log("running supabase")
                    const { data, error } = await supabase
                        .from('paste')
                        .select('*')
                        .eq('userId', user.id)
                        .order('createdAt', { ascending: false });

                    setPastes(data || []);

                    if (error) {
                        throw new Error(error.message);
                    }

                }

            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchPastes();
    }, [authLoading]);

    if (authLoading) {
        return <p>Loading authentication...</p>;
    }

    if (authError) {
        return <p>Error: {error}</p>;
    }

    return (
        <div>
            <h1>Welcome to the Paste App</h1>

            {loading && <p>Loading pastes...</p>}
            {error && <p>Error: {error}</p>}

            <ul>
                {pastes.length === 0 && !loading ? (
                    <p>No pastes available</p>
                ) : (
                    pastes.map((paste) => (
                        <li key={paste.id}>
                            <h3>Paste {paste.id}</h3>
                            <p>{paste.content}</p>
                        </li>
                    ))
                )}
            </ul>
        </div>
    );
};

export default HomePage;
