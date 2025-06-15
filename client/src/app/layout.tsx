import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
import ClientWrapper from "./wrapper";
import { ThemeProvider } from "next-themes";

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
        <Providers>
          <ThemeProvider attribute="class" enableSystem defaultTheme="system">
            <ClientWrapper>{children}</ClientWrapper>
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
