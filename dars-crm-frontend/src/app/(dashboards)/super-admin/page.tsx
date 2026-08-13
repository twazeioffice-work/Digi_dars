export default function SuperAdminPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Super Admin Global Dashboard</h1>
        <p className="text-sm text-slate-600">Multi-tenant management and cross-Masjid analytics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase">Active Masjids</span>
          <p className="text-3xl font-black text-slate-900 mt-1">24</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase">Total Enrolled Students</span>
          <p className="text-3xl font-black text-emerald-600 mt-1">1,850</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase">HQ Escalation Tickets</span>
          <p className="text-3xl font-black text-rose-600 mt-1">2 Urgent</p>
        </div>
      </div>
    </div>
  );
}
