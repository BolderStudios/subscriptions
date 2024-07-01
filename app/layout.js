// app/layout.js
import "./styles/globals.css";
import { ClerkProvider, SignedIn, SignedOut } from "@clerk/nextjs";
import { Inter as FontSans } from "next/font/google";
import { cn } from "../lib/utils";
import { Toaster } from "sonner";
import SignedInPage from "@/components/SignedInPage";
import ClientLoadingWrapper from "@/components/ClientLoadingWrapper";

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
          <ClientLoadingWrapper>
            <main className="h-screen flex flex-col relative">
              <SignedIn>
                <SignedInPage>{children}</SignedInPage>
              </SignedIn>
              <SignedOut>
                <div className="flex-grow relative">{children}</div>
              </SignedOut>
              <Toaster richColors />
            </main>
          </ClientLoadingWrapper>
        </body>
      </html>
    </ClerkProvider>
  );
}