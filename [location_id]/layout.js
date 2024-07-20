// [location_id]/layout.js

import "./styles/globals.css";
import { Inter as FontSans } from "next/font/google";
import { cn } from "../lib/utils";
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
    <html lang="en">
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}
      >
        <main className="h-screen flex flex-col relative overflow-y-hidden">
          <div className="flex-grow relative">{children}</div>

          <Toaster richColors />
        </main>
      </body>
    </html>
  );
}
