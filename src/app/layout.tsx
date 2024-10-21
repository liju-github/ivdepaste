import { AuthProvider } from "../providers/auth-provider";
import { ThemeProvider } from "../components/ui/theme-provider";
import { Navbar } from "@/src/components/common/Navbar"
import "./globals.css"
import { Toaster } from "@/src/components/ui/toaster";

export default function RootLayout({ children }: { children: React.ReactNode }) {

  return (
    <html lang="en">
      <body>
        <AuthProvider>
          
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Navbar />
            <main>{children}</main>
          </ThemeProvider>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
