"use client";

import { useState } from 'react';
import Link from 'next/link';
import Cookies from 'js-cookie';
import { useRouter, usePathname } from 'next/navigation';
import ThemeToggle from '@/components/ThemeToggle';
import { useTheme } from '@/context/ThemeContext';

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme } = useTheme();

  const handleLogout = () => {
    Cookies.remove('dars_auth_token');
    Cookies.remove('user_role');
    router.push('/login');
  };

  const navItems = [
    { href: '/super-admin', label: '🏢 Global Dashboard' },
    { href: '/super-admin/centers', label: '🕌 Manage Masjids & Centers' },
    { href: '/super-admin/nazims', label: '👤 Manage Nazims' },
    { href: '/super-admin/ustads', label: '👳‍♂️ Manage Ustads' },
    { href: '/super-admin/students', label: '🎓 Manage Students' },
    { href: '/super-admin/leaderboard', label: '🏆 Center Rankings & Leaderboard' },
    { href: '/super-admin/complaints', label: '🔒 Kiosk Complaints Inbox' },
    { href: '/super-admin/leave-management', label: '📝 Leaves & Performance Tracking' },
    { href: '/super-admin/whatsapp', label: '💬 Global WhatsApp Oversight' },
    { href: '/super-admin/library', label: '📖 Digital Hadith Library' },
    { href: '/super-admin/kitchen', label: '🍳 Kitchen & Cook Headcounts' },
    { href: '/super-admin/test-bench', label: '🧪 Master Test Bench' },
    { href: '/super-admin/finance', label: '💰 Global Financial Audit & AI' },
  ];

  return (
    <div className={`flex flex-col md:flex-row min-h-screen transition-colors ${
      theme === 'dark' ? 'bg-black text-white' : 'bg-white text-slate-900'
    }`}>
      {/* Mobile Top Navbar */}
      <header className={`md:hidden flex items-center justify-between px-4 py-3 border-b sticky top-0 z-50 shadow-md ${
        theme === 'dark' ? 'bg-neutral-900 text-white border-neutral-800' : 'bg-slate-900 text-white border-slate-800'
      }`}>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg hover:bg-slate-800 focus:outline-none"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? (
              <span className="text-xl">✕</span>
            ) : (
              <span className="text-xl">☰</span>
            )}
          </button>
          <div>
            <h2 className="font-black text-lg text-emerald-400 tracking-tight leading-tight">Digi Dars HQ</h2>
            <p className="text-[10px] text-slate-400">Super Admin Portal</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle showText={false} />
          <button
            onClick={handleLogout}
            className="bg-rose-600/20 text-rose-300 hover:bg-rose-600 hover:text-white text-xs font-bold px-3 py-1.5 rounded-lg transition"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Mobile Navigation Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/80 backdrop-blur-sm flex flex-col pt-16">
          <nav className={`p-4 flex flex-col gap-2 text-base font-medium border-b shadow-xl ${
            theme === 'dark' ? 'bg-neutral-950 border-neutral-800' : 'bg-slate-900 border-slate-800'
          }`}>
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-3 rounded-xl transition ${
                    isActive ? 'bg-emerald-600 text-white font-bold' : 'hover:bg-slate-800 text-slate-200'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className={`hidden md:flex md:w-64 flex-col border-r shrink-0 ${
        theme === 'dark' ? 'bg-neutral-950 text-white border-neutral-800' : 'bg-slate-900 text-white border-slate-800'
      }`}>
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <div>
            <h2 className="font-black text-xl text-emerald-400 tracking-tight">Digi Dars HQ</h2>
            <p className="text-xs text-slate-400 mt-0.5">Super Admin Portal</p>
          </div>
        </div>

        <nav className="flex-1 p-4 flex flex-col gap-1 text-sm font-medium overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2.5 rounded-xl transition ${
                  isActive ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-900/40' : 'hover:bg-slate-800 text-slate-200'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Theme:</span>
            <ThemeToggle />
          </div>
          <button
            onClick={handleLogout}
            className="w-full bg-rose-600/20 text-rose-300 hover:bg-rose-600 hover:text-white text-xs font-bold py-2 rounded-xl transition"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Content Area */}
      <main className={`flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full transition-colors ${
        theme === 'dark' ? 'bg-black text-white' : 'bg-white text-slate-900'
      }`}>
        {children}
      </main>
    </div>
  );
}
