'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/src/components/ui/button';
import { Card, CardHeader, CardContent, CardFooter } from '@/src/components/ui/card';
import { Alert, AlertDescription } from '@/src/components/ui/alert';
import { Skeleton } from '@/src/components/ui/skeleton';
import { supabase } from '@/src/lib/supabase';
import { Paste } from '@/types';


interface ErrorState {
    type: 'error' | 'not-found' | 'expired';
    message: string;
}


export default function ViewPaste() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pasteId = searchParams?.get('pasteId');

    const [paste, setPaste] = useState<Paste | null>(null);
    const [error, setError] = useState<ErrorState | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchPaste = async () => {
            if (!pasteId) {
                setError({ type: 'error', message: 'No paste ID provided' });
                setIsLoading(false);
                return;
            }

            try {
                const { data: paste, error: fetchError } = await supabase
                    .from('paste')
                    .select('*')
                    .eq('id', pasteId)
                    .single();

                if (fetchError) {
                    setError({ type: 'not-found', message: 'Paste not found' });
                    return;
                }

                if (!paste) {
                    setError({ type: 'not-found', message: 'Paste not found' });
                    return;
                }

                if (paste.expires_at && new Date(paste.expires_at) < new Date()) {
                    setError({ type: 'expired', message: 'This paste has expired' });
                    return;
                }

                const { data: session } = await supabase.auth.getSession();
                if (paste.visibility === 'private' && paste.user_id !== session?.session?.user?.id) {
                    setError({ type: 'error', message: 'You do not have permission to view this paste' });
                    return;
                }

                setPaste(paste as Paste);
            } catch (error) {
                setError({ type: 'error', message: 'An unexpected error occurred'+error });
            } finally {
                setIsLoading(false);
            }
        };

        fetchPaste();
    }, [pasteId]);

    // Loading Skeleton
    if (isLoading) {
        return (
            <div className="container mx-auto p-4">
                <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-3/4" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-4 w-3/4" />
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Error Handling
    if (error) {
        return (
            <div className="container mx-auto p-4">
                <Alert variant="destructive">
                    <AlertDescription>{error.message}</AlertDescription>
                </Alert>
                <Button
                    onClick={() => router.push('/')}
                    className="mt-4"
                >
                    Back to Home
                </Button>
            </div>
        );
    }

    // No paste or valid data
    if (!paste) {
        return null;
    }

    // Render the Paste Content
    return (
        <div className="container mx-auto p-4">
            <Card>
                <CardHeader>
                    <h1 className="text-3xl font-bold">{paste.title}</h1>
                </CardHeader>

                <CardContent>
                    <pre className="whitespace-pre-wrap break-words bg-muted p-4 rounded-md">
                        <code>{paste.content}</code>
                    </pre>
                </CardContent>

                <CardFooter className="flex flex-col items-start gap-2">
                    <p className="text-sm text-muted-foreground">
                        Created: {new Date(paste.createdAt).toLocaleString()}
                    </p>
                    {paste.expiresAt && (
                        <p className="text-sm text-muted-foreground">
                            Expires: {new Date(paste.expiresAt).toLocaleString()}
                        </p>
                    )}
                    <Button
                        onClick={() => router.push('/')}
                        className="mt-2"
                    >
                        Back to Home
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
