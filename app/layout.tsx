import type { Metadata } from "next";
import {Geist_Mono } from "next/font/google";
import "./globals.css";


const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
const geistSans = Geist_Mono({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: "400",
});


export const metadata: Metadata = {
  title: "SplitEase — Split Bills Effortlessly",
  description:
    "Track shared expenses, split bills fairly, and settle up with friends. The modern way to manage group finances.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
  <div className="relative min-h-screen">
    
    {/* Background */}
    <div className="absolute inset-0 overflow-hidden">
    </div>

    {/* Foreground content */}
    <main className="relative z-10 top-0.5">
      {children}
    </main>

  </div>
</body>
    </html>
  );
}
