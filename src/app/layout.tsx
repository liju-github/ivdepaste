import { AuthProvider } from "../providers/auth-provider";
import { Navbar } from "@/src/components/common/Navbar"
import "./globals.css"
import { Toaster } from "@/src/components/ui/toaster";
import { ReduxProvider } from '@/src/providers/redux-provider';
import { ThemeWrapper } from "../components/theme/theme";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <ReduxProvider>
            <ThemeWrapper>
              <Navbar />
              <main>{children}</main>
              <Toaster />
            </ThemeWrapper>
          </ReduxProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
