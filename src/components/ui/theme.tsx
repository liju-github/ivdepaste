'use client';

import { ThemeProvider } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeWrapper({ children }: { children: React.ReactNode }) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return null;
    }

    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="darky"
            storageKey="theme"  
            enableSystem
            themes={[
                "dark",
                "serika-dark",
                "botanical",
                "carbon",
                "aurora",
                "nebula",
                "copper",
                "beach-sand",
                "tropical-ocean",
                "sunset-warmth",
                "miami",
                "watermelon"
            ]}
            disableTransitionOnChange
            enableColorScheme={true}
        >
            {children}
        </ThemeProvider>
    );
}
