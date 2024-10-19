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

export default function NewPaste() {
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [expiration, setExpiration] = useState('1month');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

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

            // Expiration date mapping
            const expirationMap = {
                '1month': new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                '1week': new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                'permanent': null
            };
            const expiresAt = expirationMap[expiration as keyof typeof expirationMap];
            const pasteId = uuidv4();

            const { data: pasteData, error: pasteError } = await supabase
                .from('paste')
                .insert([
                    {
                        id: pasteId,
                        title,
                        content,
                        userId: userId || null,
                        createdAt: new Date().toISOString(),
                        expiresAt: expiresAt?.toISOString() || null,
                        visibility: userId ? 'private' : 'public',
                        language: 'text',
                    }
                ])
                .select()
                .single();

            if (pasteError) {
                console.error('Supabase error:', pasteError);
                setErrorMessage('Error creating paste: ' + pasteError.message);
            } else {
                // Redirect to the unique paste URL with the pasteId
                router.push(`/view?pasteId=${pasteId}`);
                router.refresh();
            }
        } catch (err) {
            console.error('Unexpected error:', err);
            setErrorMessage('An unexpected error occurred: ' + (err as Error).message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container mx-auto p-4">
            <Card className="p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
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
                            className="min-h-[200px] w-full"
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

                    {errorMessage && (
                        <div className="text-red-500 text-sm">{errorMessage}</div>
                    )}

                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full"
                    >
                        {isSubmitting ? 'Creating...' : 'Create Paste'}
                    </Button>
                </form>
            </Card>
        </div>
    );
}
