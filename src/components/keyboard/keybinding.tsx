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
    { key: "s", path: "/search", description: "Search" }, //connect with the mypaste search
    { key: "p", path: "/profile", description: "Profile" }, //profile showing stats of the user, total replies given , likes received, dislikes received etc..... 
    { key: "►", path: "Forward", description: "Going Forward" },
    { key: "◄", path: "Backward", description: "Going Backward" },
];

const KEYBINDING_HELP = [
    { keys: "Shift + W", description: "Toggle Theme" },
    { keys: "Shift + F", description: "Toggle Fullscreen" },
    { keys: "Shift + S", description: "Save Current Page" },
    { keys: "Shift + R", description: "Refresh Page" },
    { keys: "Shift + C", description: "Copy Page URL" },
    { keys: "Shift + Z", description: "Zoom In" },
    { keys: "Shift + X", description: "Zoom Out" },
    { keys: "Shift + O", description: "Reset Zoom" },
    
];

type Props = {
    children: ReactNode;
    showHint?: boolean;
    removeHelpOnThemeTransition?: boolean;
};

export function KeybindingShortcutsProvider({ children, showHint = true, removeHelpOnThemeTransition = false }: Props) {
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

            // New keybindings
            if (event.shiftKey) {
                switch (event.key.toLowerCase()) {
                    case 'f':
                        event.preventDefault();
                        toggleFullscreen();
                        break;
                    
                    case 'r':
                        event.preventDefault();
                        refreshPage();
                        break;
                    case 'c':
                        event.preventDefault();
                        copyPageUrl();
                        break;
                    
                    case 'z':
                        event.preventDefault();
                        zoomIn();
                        break;
                    case 'x':
                        event.preventDefault();
                        zoomOut();
                        break;
                    case 'o':
                        event.preventDefault();
                        resetZoom();
                        break;
                    
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

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            toast({ title: "Fullscreen", description: "Entered fullscreen mode", duration: 500 });
        } else {
            document.exitFullscreen();
            toast({ title: "Fullscreen", description: "Exited fullscreen mode", duration: 500 });
        }
    };

    

    const refreshPage = () => {
        window.location.reload();
    };

    const copyPageUrl = () => {
        navigator.clipboard.writeText(window.location.href);
        toast({ title: "Copy", description: "Page URL copied to clipboard", duration: 500 });
    };

    

    const zoomIn = () => {
        document.body.style.zoom = `${(parseFloat(document.body.style.zoom) || 1) * 1.1}`;
        toast({ title: "Zoom", description: "Zoomed in", duration: 500 });
    };

    const zoomOut = () => {
        document.body.style.zoom = `${(parseFloat(document.body.style.zoom) || 1) / 1.1}`;
        toast({ title: "Zoom", description: "Zoomed out", duration: 500 });
    };

    const resetZoom = () => {
        document.body.style.zoom = "1";
        toast({ title: "Zoom", description: "Zoom reset", duration: 500 });
    };

    

    return (
        <>
            {children}

            {showHint && isShiftPressed && (
                <>
                    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40" />
                    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 hidden md:flex space-x-4">
                        <ShortcutsCard
                            title="Navigation Shortcuts"
                            items={NAVIGATION_ROUTES.map(route => ({
                                keys: `Shift + ${route.key.toUpperCase()}`,
                                description: route.description
                            }))}
                        />
                        <ShortcutsCard
                            title="Keybindings Help"
                            items={KEYBINDING_HELP}
                        />
                    </div>
                </>
            )}
        </>
    );

}

const ShortcutsCard = ({ title, items }: { title: string; items: { keys: string; description: string }[] }) => (
    <Card className="w-96 p-0 mb-4 ">
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