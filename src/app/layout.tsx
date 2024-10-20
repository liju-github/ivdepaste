import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/src/providers/auth-provider";
import { Navbar } from "@/src/components/common/Navbar";
import { ThemeProvider } from "../components/ui/theme-provider";


export const metadata: Metadata = {
  title: "ivdepaste",
  description: "opensource pastebin alternative",
};


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <Navbar />
            <main>{children}</main>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
