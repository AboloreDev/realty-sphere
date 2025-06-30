import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Realty Sphere Website",
  description: "A place to find a new home",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Toaster />
        <Providers>
          <ThemeProvider attribute="class" enableSystem defaultTheme="system">
            {children}
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
