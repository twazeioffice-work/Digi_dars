"use client";
import Link from 'next/link';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

export default function UstadLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const handleLogout = () => {
    Cookies.remove('dars_auth_token');
    Cookies.remove('user_role');
    router.push('/login');
  };

  return (
    <div className="flex h-screen bg-slate-100">
      {/* Ustad Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col border-r border-slate-800">
        <div className="p-5 border-b border-slate-800">
          <h2 className="font-black text-xl text-emerald-400 tracking-tight">Digi Dars</h2>
          <p className="text-xs text-slate-400 mt-0.5">Ustad Class Portal</p>
        </div>

        <nav className="flex-1 p-4 flex flex-col gap-1 text-sm font-medium">
          <Link href="/ustad" className="px-3 py-2 rounded-lg hover:bg-slate-800 text-slate-200 transition">
            📖 My Halqa Overview
          </Link>
          <Link href="/ustad/reports" className="px-3 py-2 rounded-lg hover:bg-slate-800 text-slate-200 transition">
            ✨ AI Report Reviewer
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full bg-rose-600/20 text-rose-300 hover:bg-rose-600 hover:text-white text-xs font-bold py-2 rounded-lg transition"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Content Area */}
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}
