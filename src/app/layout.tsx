'use client'
import { AuthProvider } from "../providers/auth-provider";
import { Navbar } from "@/src/components/header/Navbar";
import "./globals.css";
import { Toaster } from "@/src/components/ui/toaster";
import { ThemeWrapper } from "../components/ui/theme";
import ThemeButton from "../components/ui/themebutton";
import { Provider } from "react-redux";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" >
      
      <body >
        
        <AuthProvider>
          <ThemeWrapper>
            <Navbar />
            <ThemeButton />
            <main>{children}</main>
            <Toaster />
          </ThemeWrapper>
          </AuthProvider>
      </body>
    </html>
  );
}