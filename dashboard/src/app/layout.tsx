import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Sidebar } from '@/components/Sidebar';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Ozon Label Dashboard',
  description: 'Barcode & Shipping Label Generation',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen flex bg-background text-foreground antialiased`}>
        <Sidebar className="w-64 border-r border-border shrink-0 fixed inset-y-0" />
        <main className="flex-1 ml-64 p-8 overflow-y-auto">
          {children}
        </main>
        <Toaster />
      </body>
    </html>
  );
}
