'use client';

import { ThemeProvider } from "@/src/components/ui/theme-provider";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

export function ThemeWrapper({ children }: { children: React.ReactNode }) {


    return (
        <ThemeProvider
            attribute="class"
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
            ]
}
            enableSystem
            disableTransitionOnChange
        >
            {children}
        </ThemeProvider>
    );
}
