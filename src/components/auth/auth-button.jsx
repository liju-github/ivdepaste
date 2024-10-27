'use client';

import { Button } from "@/src/components/ui/button";
import { useAuth } from "@/src/providers/auth-provider";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/src/components/ui/alert";
import { useState } from "react";
import "@/src/app/globals.css"
import defaultimage from "./default.jpg";
import Image from "next/image";

export function AuthButton() {
    const { user, error, signInWithGoogle, signOut } = useAuth();
    const [isButtonLoading, setIsButtonLoading] = useState(false);

    // Handle Google SignIn
    const handleSignIn = async () => {
        setIsButtonLoading(true);
        await signInWithGoogle();
        setIsButtonLoading(false);
    };

    // Handle SignOut
    const handleSignOut = async () => {
        setIsButtonLoading(true);
        await signOut();
        setIsButtonLoading(false);
    };

    if (error) {
        return (
            <Alert variant="destructive" className="bg-destructive text-destructive-foreground">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                    {error.message}
                </AlertDescription>
            </Alert>
        );
    }

    return (
        <div className="flex items-center gap-4">
            {user ? (
                <div className="flex items-center gap-4">
                    <Image
                        src={user.user_metadata.avatar_url || defaultimage}
                        alt="Profile"
                        className="w-8 h-8 rounded-full"
                        width={32} 
                        height={32} 
                    />
                    <div className="flex flex-col">
                        <span className="text-primary font-medium">
                            {user.user_metadata.full_name}
                        </span>
                        <span className="text-primary text-sm">
                            {user.email}
                        </span>
                    </div>
                    <Button
                        onClick={handleSignOut}
                        variant="outline"
                        disabled={isButtonLoading}
                        className="bg-primary text-primary-foreground border-primary hover:bg-primary-foreground hover:text-primary"
                    >
                        {isButtonLoading ? 'Signing out...' : 'Sign Out'}
                    </Button>
                </div>
            ) : (
                <Button
                    onClick={handleSignIn}
                    disabled={isButtonLoading}
                    className="bg-primary text-primary-foreground hover:bg-primary-foreground hover:text-primary-foreground flex items-center gap-2"
                >
                    {isButtonLoading ? (
                        <>
                            <svg
                                className="w-5 h-5"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                            >
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Signing in...
                        </>
                    ) : (
                        <>
                            <svg
                                className="w-5 h-5"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                            >
                                <path d="M20 12c0-4.4-3.6-8-8-8s-8 3.6-8 8 3.6 8 8 8 8-3.6 8-8zm-8-6c3.3 0 6 2.7 6 6s-2.7 6-6 6-6-2.7-6-6 2.7-6 6-6z" />
                            </svg>
                            Sign in with Google
                        </>
                    )}
                </Button>
            )}
        </div>
    );
}
