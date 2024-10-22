'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AuthButton } from '@/src/components/auth/auth-button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/src/components/ui/select";
import themes from '@/src/components/ui/theme.json'; 

export const Navbar: React.FC = () => {
    const [theme, setTheme] = useState<string>('');

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') || 'default';
        setTheme(savedTheme);
        document.documentElement.className = savedTheme; 
    }, [theme]);

    const handleColorChange = (newTheme: string) => {
        setTheme(newTheme); 
        localStorage.setItem('theme', newTheme); 
        document.documentElement.className = newTheme; 
    };

    return (
        <nav className="flex flex-col p-4">
            {}
            <div className="flex justify-between items-center w-full">
                <Link href="/">
                    <h1 className="text-lg font-bold">ivdepaste</h1>
                </Link>
                <AuthButton />
            </div>

            {}
            <div className="mt-4 flex justify-end w-full">
                {}
                <div className="flex items-center space-x-2">
                    <Select onValueChange={handleColorChange}>
                        <SelectTrigger className="w-[200px]"> {}
                            <SelectValue placeholder={theme} /> {}
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
                                    <div className="flex">
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
            </div>
        </nav>
    );
};
