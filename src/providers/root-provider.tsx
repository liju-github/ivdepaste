'use client';

import { ThemeWrapper } from "./theme-wrapper"
import { AuthProvider } from "./auth-provider"
import { Toaster } from "@/components/ui/toaster"

export function RootProvider({ children }: { children: React.ReactNode }) {
    return (
        <ThemeWrapper>
            <AuthProvider>
                {children}
                <Toaster />
            </AuthProvider>
        </ThemeWrapper>
    )
}