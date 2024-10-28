'use client'
import { useEffect, useState } from "react";
import { ThemeProvider } from "next-themes";

const AVAILABLE_THEMES = [
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
] as const;

type AvailableTheme = typeof AVAILABLE_THEMES[number];

const THEMES_MAP = AVAILABLE_THEMES.reduce((acc, theme) => ({
    ...acc,
    [theme]: theme
}), {} as Record<AvailableTheme, string>);

function ThemeContent({ children }: { children: React.ReactNode }) {
    const [currentTheme, setCurrentTheme] = useState<AvailableTheme | "dark">("dark");

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') as AvailableTheme;

        if (savedTheme && AVAILABLE_THEMES.includes(savedTheme)) {
            setCurrentTheme(savedTheme);
        } else {
            localStorage.setItem('theme', "dark");
            setCurrentTheme("dark");
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('theme', currentTheme);
    }, [currentTheme]);

    return (
        <ThemeProvider
            attribute="class"
            defaultTheme={currentTheme}
            value={THEMES_MAP}
            themes={Object.keys(THEMES_MAP)}
            disableTransitionOnChange
            enableColorScheme={true}
            storageKey="theme"
        >
            {children}
        </ThemeProvider>
    );
}

export function ThemeWrapper({ children }: { children: React.ReactNode }) {
    const [mounted, setMounted] = useState(false);
    const [fallbackTheme, setFallbackTheme] = useState('dark');

    useEffect(() => {
        setMounted(true);
        // Only access localStorage after component is mounted (client-side)
        const savedTheme = localStorage.getItem('theme') || 'watermelon';
        setFallbackTheme(savedTheme);
    }, []);

    if (!mounted) {
        return (
            <div className={`${fallbackTheme} h-full`}>
                <div className="contents">
                    {children}
                </div>
            </div>
        );
    }

    return <ThemeContent>{children}</ThemeContent>;
}