import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";

export const metadata: Metadata = {
  title: "Built with Arkiv",
  description: "Portfolio of real apps using Arkiv design system and blockchain technology."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header style={{borderBottom: '1px solid var(--border)'}}>
          <div className="container flex items-center justify-between py-4">
            <Link href="/" className="flex items-center gap-3">
              <span className="title-20" style={{color: 'var(--text)'}}>[ ARKIV ]</span>
            </Link>
            <nav className="flex items-center gap-6 body-14" style={{color: 'var(--text)'}}>
              <a href="https://arkiv.network/#why-arkiv" className="hover:opacity-70 transition-opacity">Why Arkiv</a>
              <a href="https://arkiv.network/#how-it-works" className="hover:opacity-70 transition-opacity">How it Works</a>
              <a href="https://arkiv.network/#use-cases" className="hover:opacity-70 transition-opacity">Use Cases</a>
              <a href="https://arkiv.network/#faq" className="hover:opacity-70 transition-opacity">FAQ</a>
              <a href="https://arkiv.network/#about" className="hover:opacity-70 transition-opacity">About</a>
              <Link href="/submit" className="px-4 py-2 rounded-lg" style={{backgroundColor: 'var(--primary)', color: 'white'}}>Submit a project</Link>
              <ThemeToggle />
            </nav>
          </div>
        </header>
        <main>{children}</main>
        <footer className="mt-16" style={{borderTop: '1px solid var(--border)'}}>
          <div className="container py-10 body-12 flex flex-wrap items-center gap-4 justify-between" style={{color: 'var(--muted)'}}>
            <div>© {new Date().getFullYear()} Arkiv community</div>
            <div className="flex gap-4">
              <a href="https://docs.arkiv.network" target="_blank" rel="noreferrer">Docs</a>
              <a href="https://status.arkiv.network" target="_blank" rel="noreferrer">Status</a>
              <a href="https://github.com/arkiv-network" target="_blank" rel="noreferrer">GitHub</a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
