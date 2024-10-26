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

interface PasteStats {
    wordCount: number;
    charCount: number;
    lineCount: number;
}

type ExpirationOption = '1month' | '1week' | 'permanent';

const SUPPORTED_LANGUAGES = {
    javascript: 'JavaScript',
    python: 'Python',
    java: 'Java',
    go: 'Go',
    rust: 'Rust',
    php: 'PHP',
    ruby: 'Ruby',
    html: 'HTML',
    css: 'CSS',
    text: 'Plain Text'
} as const;

type ProgrammingLanguage = keyof typeof SUPPORTED_LANGUAGES;

const EXPIRATION_MAP: Record<ExpirationOption, string | null> = {
    '1month': new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    '1week': new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    'permanent': null
};

// Component to handle client-side stats rendering
const StatsDisplay: React.FC<{ stats: PasteStats }> = ({ stats }) => {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) {
        return null;
    }

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
    const [isClient, setIsClient] = useState(false);
    const { toast } = useToast();

    const [formState, setFormState] = useState({
        title: '',
        content: '',
        expiration: '1month' as ExpirationOption,
        programmingLanguage: 'text' as ProgrammingLanguage
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        setIsClient(true);
    }, []);

    const stats = useMemo(() => {
        if (!formState.content) {
            return { wordCount: 0, charCount: 0, lineCount: 0 };
        }

        const charCount = formState.content.length;
        const words = formState.content.trim().split(/\s+/).filter(word => word.length > 0);
        const lines = formState.content.split('\n');
        const lineCount = formState.content.endsWith('\n') ? lines.length - 1 : lines.length;

        return {
            wordCount: words.length,
            charCount,
            lineCount
        };
    }, [formState.content]);

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
            const expiresAt = EXPIRATION_MAP[formState.expiration];

            const pasteData: Paste = {
                id: uuidv4(),
                title: formState.title || 'Untitled',
                content: formState.content,
                userId: userId || "",
                burn: false,
                createdAt: new Date().toISOString(),
                expiresAt,
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

    const detectLanguage = (text: string): ProgrammingLanguage => {
        const patterns: Record<ProgrammingLanguage, RegExp> = {
            javascript: /(function|const|let|var|=>)/,
            python: /(def|print|import.*from|class.*:)/,
            java: /(public class|private|protected|package)/,
            go: /(func|package|import|defer)/,
            php: /(<\?php|\$[a-zA-Z_\x7f-\xff][a-zA-Z0-9_\x7f-\xff]*)/,
            ruby: /(def|class|require|gem|attr_)/,
            html: /(<html|<div|<body|<head|<!DOCTYPE)/i,
            css: /(@media|@import|{.*}|[a-z-]+\s*:)/,
            rust: /(fn|let mut|impl|struct|enum)/,
            text: /./
        };

        for (const [lang, pattern] of Object.entries(patterns)) {
            if (pattern.test(text) && lang !== 'text') {
                return lang as ProgrammingLanguage;
            }
        }

        return 'text';
    };

    const handleAutoDetect = () => {
        const detectedLanguage = detectLanguage(formState.content);
        setFormState(prev => ({
            ...prev,
            programmingLanguage: detectedLanguage
        }));
        toast({
            title: 'Language Detected',
            description: `Detected language: ${SUPPORTED_LANGUAGES[detectedLanguage]}`,
        });
    };

    if (!isClient) {
        return null;
    }

    return (
        <div className="container mx-auto p-4">
            <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-4">
                <div className="lg:w-2/3">
                    <Card className="p-6 bg-background h-full">
                        <div className="space-y-4">
                            <Input
                                placeholder="Paste Title (optional)"
                                value={formState.title}
                                onChange={(e) => setFormState(prev => ({ ...prev, title: e.target.value }))}
                                className="w-full"
                            />
                            <Textarea
                                placeholder="Paste Content"
                                value={formState.content}
                                onChange={(e) => setFormState(prev => ({ ...prev, content: e.target.value }))}
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
                                                setFormState(prev => ({ ...prev, expiration: value }))
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="1month">1 Month</SelectItem>
                                                <SelectItem value="1week">1 Week</SelectItem>
                                                <SelectItem value="permanent">Permanent</SelectItem>
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
                                                setFormState(prev => ({ ...prev, programmingLanguage: value }))
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
                                        onClick={handleAutoDetect}
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
                                    disabled={isSubmitting}
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