// app/layout.js

import "./styles/globals.css";
import { ClerkProvider, SignedIn, SignedOut } from "@clerk/nextjs";
import { Inter as FontSans } from "next/font/google";
import { cn } from "../lib/utils";
import SidebarNavigation from "@/components/SidebarNavigation";
import Navbar from "@/components/ui/Navbar";
import { Toaster } from "sonner";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default async function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={cn(
            "min-h-screen bg-background font-sans antialiased",
            fontSans.variable
          )}
        >
          <main className="h-screen flex flex-col relative">
            <SignedIn>
              <div className="flex flex-1">
                <SidebarNavigation />

                <div className="flex flex-col w-full overflow-y-auto h-screen">
                  <Navbar />
                  <div className="flex-grow">
                    {children}
                    <Toaster richColors />
                  </div>
                </div>
              </div>
            </SignedIn>

            <SignedOut>
              {/* Content for signed-out users */}
              <div className="flex-grow p-4">{children}</div>
            </SignedOut>
          </main>
        </body>
      </html>
    </ClerkProvider>
  );
}
