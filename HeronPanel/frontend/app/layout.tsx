import './globals/globals.css';
import { Inter } from 'next/font/google';
import Image from 'next/image';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'HeronPanel | SNOW ❄️',
  description: 'Premium Game Server Management',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex h-screen bg-background text-foreground">
          {/* Sidebar */}
          <aside className="w-64 border-r border-border bg-card hidden md:flex flex-col">
            <div className="p-6 font-bold text-xl flex items-center gap-3">
              <Image 
                src="/panellogo.png" 
                alt="HeronPanel Logo" 
                width={32} 
                height={32} 
                className="rounded-lg"
              />
              <span className="tracking-tight">HeronPanel</span>
            </div>
            <nav className="flex-1 px-4 space-y-2">
              <a href="/" className="block p-2 rounded hover:bg-accent/10 transition-colors">Dashboard</a>
              <a href="/servers" className="block p-2 rounded hover:bg-accent/10 transition-colors">Servers</a>
              <a href="/nodes" className="block p-2 rounded hover:bg-accent/10 transition-colors">Nodes</a>
              <a href="/settings" className="block p-2 rounded hover:bg-accent/10 transition-colors">Settings</a>
            </nav>
            <div className="p-4 border-t border-border text-xs text-muted-foreground">
              v1.0.0-beta
            </div>
          </aside>
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
