"use client"; 

import { AuthProvider } from "../providers/auth-provider";
import { Navbar } from "@/src/components/header/Navbar";
import "./globals.css";
import { Toaster } from "@/src/components/ui/toaster";
import { ThemeWrapper } from "../components/ui/theme";
import ThemeButton from "../components/ui/themebutton";
import { KeybindingShortcutsProvider } from "../components/keyboard/keybinding";


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <KeybindingShortcutsProvider>
            <AuthProvider>
              <ThemeWrapper>
                <Navbar />
                <ThemeButton />
                <main>{children}</main>
                <Toaster />
              </ThemeWrapper>
            </AuthProvider>
          </KeybindingShortcutsProvider>
      </body>
    </html>
  );
}
