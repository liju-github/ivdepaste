'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/src/providers/auth-provider';
import { supabase } from "@/src/lib/supabase";
import { Paste } from '@/types';

const HomePage = () => {
    const { user, isLoading: authLoading, error: authError } = useAuth();
    const [pastes, setPastes] = useState<Paste[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPastes = async () => {
            if (authLoading) return;

            if (!user) {
                const pastesIdArray: string[] = JSON.parse(localStorage.getItem("pasteIdArray") || "[]");

                if (pastesIdArray.length > 0) {
                    try {
                        const { data, error } = await supabase
                            .from('paste')
                            .select('*')
                            .in('id', pastesIdArray);

                        if (error) {
                            throw new Error(error.message);
                        }

                        setPastes(data || []);
                    } catch (err) {
                        setError('Failed to fetch pastes: ' + err);
                    }
                } else {
                    setError('No pastes found in localStorage.');
                }

                setLoading(false);
                return;
            }

            const toggle = false;

            try {
                if (toggle) {
                    console.log("Fetching pastes from API");

                    // Fetch pastes from your newly created API route
                    const response = await fetch(`/api/pastes?userId=${user.id}`);
                    if (!response.ok) {
                        throw new Error('Failed to fetch pastes');
                    }

                    const data = await response.json();
                    setPastes(data);
                } else {
                    console.log("Running Supabase");

                    // Fetch pastes from Supabase
                    const { data, error } = await supabase
                        .from('paste')
                        .select('*')
                        .eq('userId', user.id)
                        .order('createdAt', { ascending: false });

                    if (error) {
                        throw new Error(error.message);
                    }

                    setPastes(data || []);
                }
            } catch (error: unknown) {
                if (error instanceof Error) {
                    setError(error.message);
                } else {
                    setError(String(error));
                }
            } finally {
                setLoading(false);
            }
        };

        fetchPastes();
    }, [authLoading, user]);

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
