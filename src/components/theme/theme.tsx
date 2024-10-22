'use client';

import { ThemeProvider } from "@/src/components/ui/theme-provider";
import { RootState } from "@/src/redux/store";
import { useSelector } from "react-redux";

export function ThemeWrapper({ children }: { children: React.ReactNode }) {
    const currentColor = useSelector((state: RootState) => state.color.currentColor);

    return (
        <ThemeProvider
            attribute="class"
            defaultTheme={currentColor.toString()}
            enableSystem
            disableTransitionOnChange
        >
            {children}
        </ThemeProvider>
    );
}