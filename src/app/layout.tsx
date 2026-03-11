import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryProvider } from "@/lib/providers/query-provider";
import { AuthInitializer } from "@/lib/providers/auth-initializer";
import { WebSocketProvider } from "@/lib/providers/ws-provider";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Jarvis",
  description: "Your cross-device AI assistant",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <QueryProvider>
          <AuthInitializer>
            <WebSocketProvider>
              <TooltipProvider delay={300}>
                {children}
                <Toaster richColors position="bottom-right" />
              </TooltipProvider>
            </WebSocketProvider>
          </AuthInitializer>
        </QueryProvider>
      </body>
    </html>
  );
}
