export default function UstadPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Hifz Batch A - Morning Overview</h1>
        <p className="text-sm text-slate-600">Daily Sabaq, Sabqi, Manzil & Tarbiyyah Logging</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase">Enrolled Students</span>
          <p className="text-3xl font-black text-slate-900 mt-1">15 Students</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase">Fajr Jamaat Average</span>
          <p className="text-3xl font-black text-emerald-600 mt-1">88%</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase">Monthly AI Reports</span>
          <p className="text-3xl font-black text-amber-600 mt-1">3 Drafts Ready</p>
        </div>
      </div>
    </div>
  );
}
