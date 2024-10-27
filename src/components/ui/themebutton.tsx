'use client';

import { useEffect, useState } from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/src/components/ui/select";
import themes from '@/src/components/ui/theme.json';

export const ThemeButton: React.FC = () => {
    const [themeIndex, setThemeIndex] = useState<number>(0);
    const [currentThemeColors, setCurrentThemeColors] = useState<any>(null);

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') || themes[themeIndex].className;
        setThemeIndex(themes.findIndex(t => t.className === savedTheme));
        document.documentElement.className = savedTheme;

        const themeData = themes[themeIndex];
        if (themeData) {
            setCurrentThemeColors(themeData);
        }
    }, []);

    const handleColorChange = (newTheme: string) => {
        localStorage.setItem('theme', newTheme);
        document.documentElement.className = newTheme;

        const themeData = themes.find((t) => t.className === newTheme);
        if (themeData) {
            setCurrentThemeColors(themeData);
        }
    };

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.shiftKey && event.key === 'W') {
                const nextIndex = (themeIndex + 1) % themes.length;
                setThemeIndex(nextIndex);
                handleColorChange(themes[nextIndex].className);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [themeIndex]); 

    return (
        <div style={{ position: 'absolute', bottom: '20px', right: '20px' }}>
            <Select onValueChange={handleColorChange} value={currentThemeColors?.className}>
                <SelectTrigger className="w-[200px]">
                    {currentThemeColors ? (
                        <div className="flex items-center">
                            <div
                                className="w-4 h-4 rounded-full mr-2"
                                style={{ backgroundColor: currentThemeColors.primaryColor }}
                            />
                            <span>{currentThemeColors.name}</span>
                            <div className="flex ml-2">
                                <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: currentThemeColors.secondaryColor1 }}
                                />
                                <div
                                    className="w-3 h-3 rounded-full ml-1"
                                    style={{ backgroundColor: currentThemeColors.secondaryColor2 }}
                                />
                            </div>
                        </div>
                    ) : (
                        <SelectValue placeholder="Select theme" />
                    )}
                </SelectTrigger>
                <SelectContent>
                    {themes.map((theme) => (
                        <SelectItem key={theme.className} value={theme.className}>
                            <div className="flex items-center">
                                <div
                                    className="w-4 h-4 rounded-full mr-2"
                                    style={{ backgroundColor: theme.primaryColor }}
                                />
                                <span>{theme.name}</span>
                            </div>
                            <div className="flex ml-2">
                                <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: theme.secondaryColor1 }}
                                />
                                <div
                                    className="w-3 h-3 rounded-full ml-1"
                                    style={{ backgroundColor: theme.secondaryColor2 }}
                                />
                            </div>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
};

export default ThemeButton;
