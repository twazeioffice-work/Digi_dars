export default function NazimDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Center Administration</h1>
        <p className="text-sm text-slate-600">Local Masjid metrics, Halqa rosters, and staff tickets</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase">Active Halqas</span>
          <p className="text-3xl font-black text-slate-900 mt-1">6 Classes</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase">Zakat Fund Balance</span>
          <p className="text-3xl font-black text-emerald-600 mt-1">$14,250</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase">Internal Staff Tickets</span>
          <p className="text-3xl font-black text-amber-600 mt-1">1 Open</p>
        </div>
      </div>
    </div>
  );
}
