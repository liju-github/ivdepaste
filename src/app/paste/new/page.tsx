'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/src/components/ui/button";
import { Card } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/src/components/ui/select";
import { Alert, AlertDescription } from "@/src/components/ui/alert";
import { supabase } from '@/src/lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import { Paste } from '@/types';
import { useToast } from '@/src/hooks/use-toast';
import { detectLanguage, SUPPORTED_LANGUAGES, ProgrammingLanguage } from '@/src/lib/languagedetector';

interface PasteStats {
    wordCount: number;
    charCount: number;
    lineCount: number;
}

const EXPIRATION_OPTIONS = {
    '5 Minutes': '5m',
    '15 Minutes': '15m',
    '30 Minutes': '30m',
    '1 Hour': '1h',
    '6 Hours': '6h',
    '12 Hours': '12h',
    '1 Day': '1d',
    '3 Days': '3d',
    '1 Week': '1w',
    '1 Month': '1mo',
    'Permanent': 'permanent'
} as const;

type ExpirationOption = typeof EXPIRATION_OPTIONS[keyof typeof EXPIRATION_OPTIONS];

const LINE_LIMIT = 1000;

const getExpirationDate = (option: ExpirationOption): string | null => {
    if (option === 'permanent') return null;

    const timeMap: Record<string, number> = {
        'm': 60 * 1000,
        'h': 60 * 60 * 1000,
        'd': 24 * 60 * 60 * 1000,
        'w': 7 * 24 * 60 * 60 * 1000,
        'mo': 30 * 24 * 60 * 60 * 1000,
    };

    const value = parseInt(option);
    const unit = option.replace(/[0-9]/g, '');
    const milliseconds = value * timeMap[unit];

    return new Date(Date.now() + milliseconds).toISOString();
};

const StatsDisplay: React.FC<{ stats: PasteStats }> = ({ stats }) => {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);
    if (!mounted) return null;

    return (
        <div className="flex justify-between text-sm text-muted-foreground">
            <span>Characters: {stats.charCount}</span>
            <span>Words: {stats.wordCount}</span>
            <span>Lines: {stats.lineCount}</span>
        </div>
    );
};

export default function NewPaste() {
    const router = useRouter();
    const { toast } = useToast();
    const [mounted, setMounted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [lineLimitReached, setLineLimitReached] = useState(false);

    const defaultFormState = {
        title: '',
        content: '',
        expiration: '1mo' as ExpirationOption,
        programmingLanguage: 'text' as ProgrammingLanguage,
    };

    const loadFormState = () => {
        const savedFormState = localStorage.getItem('pasteFormData');
        return savedFormState ? JSON.parse(savedFormState) : defaultFormState;
    };

    const [formState, setFormState] = useState(loadFormState);

    const saveFormState = (state: typeof defaultFormState) => {
        localStorage.setItem('pasteFormData', JSON.stringify(state));
    };

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        saveFormState(formState);
    }, [formState]);

    const stats = useMemo(() => {
        if (!formState.content) return { wordCount: 0, charCount: 0, lineCount: 0 };

        const lineCount = formState.content.split('\n').length - (formState.content.endsWith('\n') ? 1 : 0);
        setLineLimitReached(lineCount > LINE_LIMIT);

        return {
            charCount: formState.content.length,
            wordCount: formState.content.trim().split(/\s+/).filter(Boolean).length,
            lineCount,
        };
    }, [formState.content]);

    const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newContent = e.target.value;
        const newLineCount = newContent.split('\n').length - (newContent.endsWith('\n') ? 1 : 0);

        if (newLineCount > LINE_LIMIT) {
            setLineLimitReached(true);
            toast({
                title: 'Line Limit Reached',
                description: `The maximum allowed lines is ${LINE_LIMIT}.`,
                variant: 'destructive',
            });
            return;
        }

        setLineLimitReached(false);
        setFormState((prev: any) => ({ ...prev, content: newContent }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formState.content.trim()) {
            toast({
                title: 'Error!',
                description: 'Paste content cannot be empty.',
                variant: 'destructive',
            });
            return;
        }

        setIsSubmitting(true);
        setErrorMessage('');

        try {
            const { data: sessionData, error: userError } = await supabase.auth.getSession();
            if (userError) throw userError;

            const userId = sessionData?.session?.user?.id;
            const pasteData: Paste = {
                id: uuidv4(),
                title: formState.title || 'Untitled',
                content: formState.content,
                userId: userId || "",
                burn: false,
                createdAt: new Date().toISOString(),
                expiresAt: getExpirationDate(formState.expiration),
                localLanguage: 'text',
                programmingLanguage: formState.programmingLanguage,
            };

            const { error: pasteError } = await supabase
                .from('paste')
                .insert([pasteData])
                .select()
                .single();

            if (!userId) {
                const pasteIdArray: string[] = JSON.parse(localStorage.getItem("pasteIdArray") || "[]");
                pasteIdArray.push(pasteData.id);
                localStorage.setItem("pasteIdArray", JSON.stringify(pasteIdArray));
            }

            if (pasteError) throw pasteError;

            toast({
                title: 'Success!',
                description: 'Your paste has been created successfully.',
            });

            localStorage.removeItem('pasteFormData');  
            router.push(`/view?pasteId=${pasteData.id}`);
            router.refresh();
        } catch (err) {
            console.error('Error creating paste:', err);
            const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
            setErrorMessage(errorMessage);
            toast({
                title: 'Error!',
                description: errorMessage,
                variant: 'destructive',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!mounted) return null;

    return (
        <div className="container mx-auto p-4">
            <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-4">
                <div className="lg:w-2/3">
                    <Card className="p-6 bg-background h-full">
                        <div className="space-y-4">
                            <Input
                                placeholder="Paste Title (optional)"
                                value={formState.title}
                                onChange={(e) => setFormState((prev: any) => ({ ...prev, title: e.target.value }))}
                                className="w-full"
                            />
                            <Textarea
                                placeholder="Paste Content"
                                value={formState.content}
                                onChange={handleContentChange}
                                required
                                className="min-h-[calc(100vh-300px)] font-mono"
                            />
                            <StatsDisplay stats={stats} />
                        </div>
                    </Card>
                </div>

                <div className="lg:w-1/3">
                    <Card className="p-6 bg-background sticky top-4">
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <h3 className="text-lg font-medium">Paste Settings</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm text-muted-foreground">
                                            Expiration
                                        </label>
                                        <Select
                                            value={formState.expiration}
                                            onValueChange={(value: ExpirationOption) =>
                                                setFormState((prev: any) => ({ ...prev, expiration: value }))
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.entries(EXPIRATION_OPTIONS).map(([label, value]) => (
                                                    <SelectItem key={value} value={value}>
                                                        {label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <label className="text-sm text-muted-foreground">
                                            Language
                                        </label>
                                        <Select
                                            value={formState.programmingLanguage}
                                            onValueChange={(value: ProgrammingLanguage) =>
                                                setFormState((prev: any) => ({ ...prev, programmingLanguage: value }))
                                            }
                                        >
                                            <SelectTrigger>

                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.entries(SUPPORTED_LANGUAGES).map(([value, label]) => (
                                                    <SelectItem key={value} value={value}>
                                                        {label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <Button
                                        type="button"
                                        onClick={() => {
                                            const detected = detectLanguage(formState.content);
                                            setFormState((prev: any) => ({
                                                ...prev,
                                                programmingLanguage: detected
                                            }));
                                            toast({
                                                title: 'Language Detected',
                                                description: `Detected language: ${SUPPORTED_LANGUAGES[detected]}`,
                                            });
                                        }}
                                        variant="outline"
                                        className="w-full"
                                    >
                                        Auto-detect Language
                                    </Button>
                                </div>
                            </div>

                            {errorMessage && (
                                <Alert variant="destructive">
                                    <AlertDescription>{errorMessage}</AlertDescription>
                                </Alert>
                            )}

                            <div className="pt-4 border-t">
                                <Button
                                    type="submit"
                                    disabled={isSubmitting || lineLimitReached}
                                    className="w-full"
                                >
                                    {isSubmitting ? 'Creating Paste...' : 'Create Paste'}
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            </form>
        </div>
    );
}
