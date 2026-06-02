'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FileText, Settings, LogOut, Package } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();

    const links = [
      { name: 'Generate Labels', href: '/generate', icon: FileText },
    ];

  return (
    <div className={cn("flex flex-col bg-card/50 backdrop-blur-md", className)}>
      <div className="p-6">
        <div className="flex items-center text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
          <Package className="h-8 w-8 mr-2 text-primary" />
          <span>LabelFlow Pro</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">Barcode &amp; Shipping Labels</p>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link key={link.href} href={link.href}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={cn("w-full justify-start transition-all", isActive ? "shadow-sm" : "hover:bg-primary/10")}
              >
                <Icon className="mr-3 h-4 w-4" />
                {link.name}
              </Button>
            </Link>
          );
        })}
      </nav>


    </div>
  );
}
