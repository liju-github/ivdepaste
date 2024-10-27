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
    
    const [currentTheme, setCurrentTheme] = useState<string>('dark'); 

    
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            setCurrentTheme(savedTheme);
            document.documentElement.className = savedTheme; 
        }
    }, []);

    
    const handleColorChange = (newTheme: string) => {
        localStorage.setItem('theme', newTheme);
        setCurrentTheme(newTheme);
        document.documentElement.className = newTheme; 
    };

    
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.shiftKey && event.key === 'W') {
                const currentIndex = themes.findIndex(t => t.className === currentTheme);
                const nextIndex = (currentIndex + 1) % themes.length;
                handleColorChange(themes[nextIndex].className);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentTheme]);

    
    const currentThemeColors = themes.find(t => t.className === currentTheme) || themes[0];

    return (
        <div style={{ position: 'absolute', bottom: '20px', right: '20px' }}>
            <Select onValueChange={handleColorChange} value={currentThemeColors.className}>
                <SelectTrigger className="w-[200px]">
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
                            </div>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
};

export default ThemeButton;
