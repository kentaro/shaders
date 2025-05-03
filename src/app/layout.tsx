import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SHADER NEXUS | Creative Visual Programming Portfolio",
  description: "A collection of cutting-edge shader experiments for next-generation visual experiences",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <style>{`
          .logo-text-cyan {
            color: #00ffff;
            text-shadow: 0 0 5px rgba(0, 255, 255, 0.8), 0 0 10px rgba(0, 255, 255, 0.5), 0 0 15px rgba(0, 255, 255, 0.3);
          }
          .logo-text-pink {
            color: #ff00ff;
            text-shadow: 0 0 5px rgba(255, 0, 255, 0.8), 0 0 10px rgba(255, 0, 255, 0.5), 0 0 15px rgba(255, 0, 255, 0.3);
          }
          /* ブラウザキャッシュ対策 */
          body::before {
            content: "";
            display: none;
          }
          .site-logo {
            position: relative;
            letter-spacing: 0.05em;
            display: inline-block;
            font-family: monospace;
          }
        `}</style>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <nav className="fixed top-0 left-0 w-full z-50 bg-black/50 backdrop-blur-md border-b border-white/10">
          <div className="container mx-auto px-4 py-3 flex justify-between items-center">
            <Link href="/" className="font-mono text-xl tracking-wide font-bold" style={{ textDecoration: 'none' }}>
              <span className="logo-wrapper">
                <span className="logo-text logo-text-cyan">SHADER</span><span className="logo-text logo-text-pink">NEXUS</span>
              </span>
            </Link>
            <div className="flex space-x-6">
              <Link href="/" className="text-white/80 hover:text-neonCyan transition-colors">Home</Link>
              <Link href="/about" className="text-white/80 hover:text-neonCyan transition-colors">About</Link>
            </div>
          </div>
        </nav>
        <div className="pt-14">
          {children}
        </div>
      </body>
    </html>
  );
}
