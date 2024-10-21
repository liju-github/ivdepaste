'use client';

import { useState } from 'react';
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
import { supabase } from '@/src/lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import { Paste } from '@/types';
import { useToast } from '@/src/hooks/use-toast';

export default function NewPaste() {
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [expiration, setExpiration] = useState('1month');
    const [programmingLanguage, setProgrammingLanguage] = useState('text');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrorMessage('');

        try {
            const { data: sessionData, error: userError } = await supabase.auth.getSession();
            if (userError) {
                console.error('Error getting user:', userError);
            }

            const userId = sessionData?.session?.user?.id;

            const expirationMap = {
                '1month': new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                '1week': new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                'permanent': null
            };
            const expiresAt = expirationMap[expiration as keyof typeof expirationMap];

            const pasteData: Paste = {
                id: uuidv4(),
                title,
                content,  // Save the original content here (no highlighting)
                userId: userId || "",
                burn: false,
                createdAt: new Date().toISOString(),
                expiresAt: expiresAt?.toISOString() || null,
                localLanguage: 'text',
                programmingLanguage, // Use the selected language
            };

            const { error: pasteError } = await supabase
                .from('paste')
                .insert([pasteData])
                .select()
                .single();

            if (userId == null) {
                const pasteIdArray: string[] = JSON.parse(localStorage.getItem("pasteIdArray") || "[]");
                pasteIdArray.push(pasteData.id);
                localStorage.setItem("pasteIdArray", JSON.stringify(pasteIdArray));
            }

            if (pasteError) {
                console.error('Supabase error:', pasteError);
                setErrorMessage('Error creating paste: ' + pasteError.message);
                toast({
                    title: 'Error!',
                    description: 'There was an error creating the paste. Please try again.',
                    variant: 'destructive',
                });
            } else {
                router.push(`/view?pasteId=${pasteData.id}`);
                router.refresh();
                toast({
                    title: 'Success!',
                    description: 'Your paste has been created successfully.',
                });
            }
        } catch (err) {
            console.error('Unexpected error:', err);
            setErrorMessage('An unexpected error occurred: ' + (err as Error).message);
            toast({
                title: 'Error!',
                description: 'An unexpected error occurred. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle Auto-detect button click
    const handleAutoDetect = async () => {
        try {
            const detectedLanguage = await detectLanguage(content); // Function to detect the language
            setProgrammingLanguage(detectedLanguage);
        } catch (err) {
            console.error('Error detecting language:', err);
            toast({
                title: 'Error!',
                description: 'There was an error detecting the language.',
                variant: 'destructive',
            });
        }
    };

    // Function to detect language (improved mock detection for demonstration)
    const detectLanguage = (text: string): string => {
        if (text.includes('function') || text.includes('const')) {
            return 'javascript';
        } else if (text.includes('print') || text.includes('def')) {
            return 'python';
        } else if (text.includes('class') || text.includes('public class')) {
            return 'java';
        } else if (text.includes('import') || text.includes('package')) {
            return 'go';
        } else if (text.includes('console') || text.includes('alert')) {
            return 'javascript';
        }
        return 'text'; // Default to plain text
    };

    return (
        <div className="container mx-auto p-4 flex justify-center">
            <Card className="p-6 bg-background w-full md:w-1/2">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <Input
                            placeholder="Paste Title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            className="w-full"
                        />
                    </div>

                    <div>
                        <Textarea
                            placeholder="Paste Content"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            required
                            className="min-h-[250px] w-full"
                        />
                    </div>

                    <div>
                        <Select
                            value={expiration}
                            onValueChange={setExpiration}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select expiration" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="1month">1 Month</SelectItem>
                                <SelectItem value="1week">1 Week</SelectItem>
                                <SelectItem value="permanent">Permanent</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Select
                            value={programmingLanguage}
                            onValueChange={setProgrammingLanguage}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select Language" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="javascript">JavaScript</SelectItem>
                                <SelectItem value="python">Python</SelectItem>
                                <SelectItem value="java">Java</SelectItem>
                                <SelectItem value="go">Go</SelectItem>
                                <SelectItem value="rust">Rust</SelectItem>
                                <SelectItem value="php">PHP</SelectItem>
                                <SelectItem value="ruby">Ruby</SelectItem>
                                <SelectItem value="html">HTML</SelectItem>
                                <SelectItem value="css">CSS</SelectItem>
                                <SelectItem value="text">Plain Text</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Auto-detect button to detect language */}
                    <div className="flex justify-start">
                        <Button
                            type="button"
                            onClick={handleAutoDetect}
                            className="w-full md:w-auto mt-2"
                        >
                            Auto-detect Language
                        </Button>
                    </div>

                    <div className="flex justify-end space-x-4">
                        <Button type="submit" disabled={isSubmitting} className="w-full">
                            {isSubmitting ? 'Submitting...' : 'Submit'}
                        </Button>
                    </div>

                    {errorMessage && (
                        <div className="text-red-500 text-sm">{errorMessage}</div>
                    )}
                </form>
            </Card>
        </div>
    );
}
