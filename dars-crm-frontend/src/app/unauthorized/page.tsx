import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white p-4">
      <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 max-w-md text-center space-y-4">
        <span className="text-4xl">🛑</span>
        <h1 className="text-2xl font-bold text-rose-400">403 Permission Denied</h1>
        <p className="text-xs text-slate-300">
          Your role does not have authorization to access this area. Access is restricted under Row-Level Security & Role-Based Access Control policies.
        </p>
        <Link href="/login" className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-lg transition">
          Return to Login
        </Link>
      </div>
    </div>
  );
}
