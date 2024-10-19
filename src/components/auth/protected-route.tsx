'use client';

import { useAuth } from '@/src/providers/auth-provider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Card } from '@/src/components/ui/card';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/');
        }
    }, [user, isLoading, router]);

    if (isLoading) {
        return (
            <Card className="p-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-700 rounded"></div>
                    <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                </div>
            </Card>
        );
    }

    if (!user) {
        return children ?? null;
    }

    return <>{children}</>;
}
