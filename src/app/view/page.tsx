'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/src/components/ui/button';
import { Card, CardHeader, CardContent } from '@/src/components/ui/card';
import { Alert, AlertDescription } from '@/src/components/ui/alert';
import { Slider } from "@/src/components/ui/slider";
import { Skeleton } from '@/src/components/ui/skeleton';
import { supabase } from '@/src/lib/supabase';
import { FiSettings } from 'react-icons/fi';

interface Paste {
    id: string;
    title: string;
    content: string;
    visibility: 'public' | 'private';
    user_id: string;
    createdAt: string;
    expiresAt: string | null;
}

interface ErrorState {
    type: 'error' | 'not-found' | 'expired';
    message: string;
}

const FormattedDate = ({ date }: { date: string }) => {
    const [formattedDate, setFormattedDate] = useState<string>('Loading...');

    console.log('date is ', date)
    useEffect(() => {
        setFormattedDate(new Date(date).toLocaleString());
    }, [date]);

    return <span>{formattedDate}</span>;
};

const fontFamilies = [
    'Arial, sans-serif',
    'Courier New, monospace',
    'Georgia, serif',
    'Times New Roman, serif',
    'Verdana, sans-serif',
    'Roboto, sans-serif',
    'Montserrat, sans-serif'
];

export default function ViewPaste() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pasteId = searchParams?.get('pasteId');

    const [paste, setPaste] = useState<Paste | null>(null);
    const [error, setError] = useState<ErrorState | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isMounted, setIsMounted] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    const [fontSize, setFontSize] = useState<number>(16);
    const [fontFamily, setFontFamily] = useState<string>('');
    const [fontColor, setFontColor] = useState<string>('');

    useEffect(() => {
        setIsMounted(true);
    }, []);

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
                
                console.log("the paste is",paste)

                if (fetchError || !paste) {
                    setError({ type: 'not-found', message: 'Paste not found' });
                    return;
                }

                if (paste.expiresAt && new Date(paste.expiresAt) < new Date()) {
                    setError({ type: 'expired', message: 'This paste has expired' });
                    return;
                }

                const { data: session } = await supabase.auth.getSession();
                if (paste.visibility === 'private' && paste.user_id !== session?.session?.user?.id) {
                    setError({
                        type: 'error',
                        message: 'You do not have permission to view this paste'
                    });
                    return;
                }

                setPaste(paste as Paste);
            } catch (error) {
                setError({
                    type: 'error',
                    message: 'An unexpected error occurred' + error
                });
            } finally {
                setIsLoading(false);
            }
        };

        if (isMounted) {
            fetchPaste();
        }
    }, [pasteId, isMounted]);

    if (!isMounted || isLoading) {
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
                <div className="flex justify-end mt-4">
                    <Button
                        onClick={() => router.push('/')}
                        className="w-32"
                    >
                        Back to Home
                    </Button>
                </div>
            </div>
        );
    }

    // No paste or valid data
    if (!paste) {
        return null;
    }

    // Render the Paste Content
    return (
        <div className="container mx-auto p-4"  >
            <Card>
                <CardHeader>
                    <h1 className="text-3xl font-bold">{paste.title}</h1>
                </CardHeader>

                <CardContent>
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex flex-col">
                            <p className="text-sm text-muted-foreground">
                                {(paste.createdAt !== undefined) ? (
                                    <span>Created: <FormattedDate date={paste.createdAt} /></span>
                                ) : null}
                            </p>
                            {paste.expiresAt && (
                                <p className="text-sm text-muted-foreground">
                                    Expires: <FormattedDate date={paste.expiresAt} />
                                </p>
                            )}
                        </div>
                        <Button
                            onClick={() => router.push('/')}
                            className="w-32"
                        >
                            Back to Home
                        </Button>
                    </div>

                    <pre
                        className="whitespace-pre-wrap break-words bg-muted p-4 rounded-md"
                        style={{
                            fontSize: `${fontSize}px`,
                            fontLanguageOverride: "normal",
                            MozFontFeatureSettings: "normal",
                            fontStyle: "italic",
                            color: fontColor,
                        }}
                    >
                        <code>{paste.content}</code>
                    </pre>
                </CardContent>
            </Card>

            {/* Settings Icon */}
            <div className="fixed bottom-8 right-8 bg-gray-200 p-2 rounded-full cursor-pointer shadow-lg" onClick={() => setIsSettingsOpen(!isSettingsOpen)}>
                <FiSettings size={24} />
            </div>

            {/* Settings Card */}
            {isSettingsOpen && (
                <Card className="fixed bottom-16 right-8 p-4 rounded-lg shadow-lg z-50">
                    <CardHeader>
                        <h2 className="text-xl font-semibold">Font Settings</h2>

                    </CardHeader>
                    <CardContent>
                        {/* Font Size Control */}
                        <div className="mb-4">
                            <label className="block mb-2 font-medium">Font Size:</label>
                            <Slider
                                defaultValue={[fontSize]}
                                min={10}
                                max={40}
                                step={1}
                                onValueChange={(value) => setFontSize(value[0])}
                            />
                        </div>

                        {/* Font Family Control */}
                        <div className="mb-4">
                            <label className="block mb-2 font-medium">Font Family:</label>
                            <select
                                value={fontFamily}
                                onChange={(e) => setFontFamily(e.target.value)}
                                className="border rounded p-2 w-full"
                            >
                                {fontFamilies.map((font) => (
                                    <option key={font} value={font}>{font}</option>
                                ))}
                            </select>
                        </div>

                        {/* Font Color Control */}
                        <div className="mb-4">
                            <label className="block mb-2 font-medium">Font Color:</label>
                            <input
                                type="color"
                                value={fontColor}
                                onChange={(e) => setFontColor(e.target.value)}
                                className="w-16 h-8 p-0 border rounded"
                            />
                        </div>

                        {/* Reset and Close Buttons */}
                        <div className="flex justify-between">
                            <Button
                                onClick={() => {
                                    setFontSize(16);
                                    setFontFamily('');
                                    setFontColor('');
                                }}
                                className="bg-gray-300"
                            >
                                Reset
                            </Button>
                            <Button onClick={() => setIsSettingsOpen(false)}>
                                Close
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

        </div>
    );
}
