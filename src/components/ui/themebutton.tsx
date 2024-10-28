'use client';

import { useEffect, useState } from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
} from "@/src/components/ui/select";
import themes from '@/src/components/ui/theme.json';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings2 } from 'lucide-react';

export const ThemeButton: React.FC = () => {
    const [currentTheme, setCurrentTheme] = useState<string>('dark');
    const [isOpen, setIsOpen] = useState(false);
    const [isSelectionComplete, setIsSelectionComplete] = useState(false);

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
        setIsSelectionComplete(true);

        setTimeout(() => {
            setIsSelectionComplete(false);
        }, 200);
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
        <motion.div
            className="fixed bottom-5 right-5 z-50"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
        >
            <div className="relative">

                <Select
                    onValueChange={handleColorChange}
                    value={currentThemeColors.className}
                    onOpenChange={setIsOpen}
                    disabled={isSelectionComplete}
                >
                    <SelectTrigger
                        className={`
                            w-[200px] relative overflow-hidden transition-all duration-300
                            hover:shadow-lg hover:scale-105 active:scale-95
                            ${isOpen ? 'ring-2 ring-primary ring-offset-2' : ''}
                            ${isSelectionComplete ? 'opacity-50 cursor-not-allowed' : ''}
                        `}
                    >
                        <motion.div
                            className="flex items-center justify-between w-full"
                            animate={{ x: isOpen ? 10 : 0 }}
                        >
                            <div className="flex items-center">
                                <motion.div
                                    className="w-4 h-4 rounded-full mr-2 relative"
                                    style={{ backgroundColor: currentThemeColors.primaryColor }}
                                    animate={{
                                        scale: isOpen ? 1.1 : 1,
                                        rotate: isOpen ? 180 : 0
                                    }}
                                />
                                <span>{currentThemeColors.name}</span>
                            </div>
                            <div className="flex space-x-1">
                                <motion.div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: currentThemeColors.secondaryColor1 }}
                                    animate={{ y: isOpen ? -3 : 0 }}
                                />
                                <motion.div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: currentThemeColors.secondaryColor2 }}
                                    animate={{ y: isOpen ? 3 : 0 }}
                                />
                            </div>
                        </motion.div>

                        <motion.div
                            className="absolute inset-0 bg-primary/5"
                            initial={{ x: '100%' }}
                            animate={{ x: isOpen ? '0%' : '100%' }}
                            transition={{ duration: 0.3 }}
                        />
                    </SelectTrigger>

                    <SelectContent
                        position="popper"
                        side="top"
                        align="end"
                        className="backdrop-blur-sm bg-background/95 border-primary/20 shadow-2xl"
                    >
                        <div className="p-2 mb-2 border-b border-primary/10">
                            <div className="flex items-center text-sm text-muted-foreground">
                                <Settings2 className="w-4 h-4 mr-2" />
                                Select Theme
                            </div>
                        </div>
                        {themes.map((theme, index) => (
                            <SelectItem
                                key={theme.className}
                                value={theme.className}
                                className="group relative"
                            >
                                <motion.div
                                    className="flex items-center"
                                    initial={{ x: -10, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <div className="flex items-center flex-1">
                                        <motion.div
                                            className="w-4 h-4 rounded-full mr-2"
                                            style={{ backgroundColor: theme.primaryColor }}
                                            whileHover={{ scale: 1.2 }}
                                            transition={{ type: "spring", stiffness: 400 }}
                                        />
                                        <span>{theme.name}</span>
                                    </div>
                                    <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: theme.secondaryColor1 }}
                                        />
                                        <div
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: theme.secondaryColor2 }}
                                        />
                                    </div>
                                </motion.div>
                                <motion.div
                                    className="absolute inset-0 bg-primary/5 rounded-md"
                                    initial={{ scaleX: 0 }}
                                    whileHover={{ scaleX: 1 }}
                                    transition={{ duration: 0.2 }}
                                    style={{ originX: 0 }}
                                />
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </motion.div>
    );
};

export default ThemeButton;