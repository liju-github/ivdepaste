"use client";

import { ReactNode, useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useToast } from "@/src/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";

type NavigationRoute = {
    key: string;
    path: string;
    description: string;
};

const NAVIGATION_ROUTES: NavigationRoute[] = [
    { key: "m", path: "/paste/my", description: "My Pastes" },
    { key: "n", path: "/paste/new", description: "New Paste" },
    { key: "h", path: "/", description: "Home" },
    { key: "►", path: "Forward", description: "Going Forward" },
    { key: "◄", path: "Backward", description: "Going Backward" },
];

const KEYBINDING_HELP = [
    { keys: "Shift + W", description: "Toggle Theme" },
    // Add more keybindings here if needed
];

type Props = {
    children: ReactNode;
    showHint?: boolean;
    removeHelpOnThemeTransition?: boolean;
};

export function KeybindingShortcutsProvider({ children, showHint = true, removeHelpOnThemeTransition=false}: Props) {
    const router = useRouter();
    const pathname = usePathname();
    const { toast } = useToast();
    const [isShiftPressed, setIsShiftPressed] = useState(false);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Shift") {
                setIsShiftPressed(true);
            }

            if (removeHelpOnThemeTransition && event.key.toLowerCase() === "w" && event.shiftKey) {
                setIsShiftPressed(false);
                return;
            }

            if (event.shiftKey && event.key === "ArrowLeft") {
                event.preventDefault();
                window.history.back();
                toast({
                    title: "Navigating",
                    description: "Going back",
                    duration: 500,
                });
                return;
            }

            if (event.shiftKey && event.key === "ArrowRight") {
                event.preventDefault();
                window.history.forward();
                toast({
                    title: "Navigating",
                    description: "Going forward",
                    duration: 500,
                });
                return;
            }

            if (!event.shiftKey || ["INPUT", "TEXTAREA"].includes((event.target as HTMLElement).tagName)) {
                return;
            }

            const route = NAVIGATION_ROUTES.find(
                (r) => r.key.toLowerCase() === event.key.toLowerCase()
            );

            if (route) {
                event.preventDefault();

                if (pathname === route.path) {
                    toast({
                        title: "Already Here",
                        description: `You're already on ${route.description}`,
                        duration: 500,
                    });
                } else {
                    router.push(route.path);
                    toast({
                        title: "Navigating",
                        description: `Going to ${route.description}`,
                        duration: 500,
                    });
                }
            }
        };

        const handleKeyUp = (event: KeyboardEvent) => {
            if (event.key === "Shift") {
                setIsShiftPressed(false);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
        };
    }, [router, toast, pathname]);

    return (
        <>
            {children}

            {showHint && isShiftPressed && (
                <>
                    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40" />
                    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 hidden md:block">
                        <ShortcutsCard title="Navigation Shortcuts" items={NAVIGATION_ROUTES.map(route => ({
                            keys: `Shift + ${route.key.toUpperCase()}`, // Update to include 'Shift +'
                            description: route.description
                        }))} />
                        <ShortcutsCard title="Keybindings Help" items={KEYBINDING_HELP} />
                    </div>
                </>
            )}
        </>
    );
}

const ShortcutsCard = ({ title, items }: { title: string; items: { keys: string; description: string }[] }) => (
    <Card className="w-96 p-0 mb-4">
        <CardHeader className="pb-5">
            <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
            {items.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                    <span className="flex items-center space-x-4 font-mono">
                        <span className="border border-gray-300 rounded-lg px-2 py-1 flex items-center shadow-md transition-transform duration-300 ease-in-out transform hover:scale-105 active:scale-95">
                            <span className="text-xs">{item.keys}</span>
                        </span>
                    </span>
                    <span className="text-muted-foreground">{item.description}</span>
                </div>
            ))}
        </CardContent>
    </Card>
);
