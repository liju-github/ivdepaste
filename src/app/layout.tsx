import { AuthProvider } from "../providers/auth-provider";
import { Navbar } from "@/src/components/header/Navbar";
import "./globals.css";
import { Toaster } from "@/src/components/ui/toaster";
import { ThemeWrapper } from "../components/ui/theme";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" >
      <body >
        <ThemeWrapper>
          <AuthProvider>
            <Navbar />
            <main>{children}</main>
            <Toaster />
          </AuthProvider>
        </ThemeWrapper>
      </body>
    </html>
  );
}