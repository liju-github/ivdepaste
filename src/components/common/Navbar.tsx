'use client';

import { useDispatch, useSelector } from 'react-redux';
import { setColor } from '@/src/redux/color/colorSlice';
import { RootState, AppDispatch } from '@/src/redux/store';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AuthButton } from '@/src/components/auth/auth-button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@radix-ui/react-select';
import { colorThemes } from "@/types/index"

export const Navbar = () => {
    const dispatch: AppDispatch = useDispatch();
    const currentColor = useSelector((state: RootState) => state.color.currentColor);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            dispatch(setColor(savedTheme)); 
        }
    }, [dispatch]);

    const handleColorChange = (color: string) => {
        console.log("Changing color to:", color);
        dispatch(setColor(color));
        localStorage.setItem('theme', color); // Store the selected theme in local storage
    };

    if (!mounted) {
        return null; // Prevent rendering until client-side mounting
    }

    return (
        <nav className={`flex justify-between items-center p-4 `}>
            <Link href="/">
                <h1 className="text-lg font-bold">ivdepaste</h1>
            </Link>
            <div className="space-x-4">
            
            </div>
            <AuthButton />
        </nav>
    );
};
