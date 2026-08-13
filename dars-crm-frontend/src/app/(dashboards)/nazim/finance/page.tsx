export default function ZakatFinancePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Zakat & Finance Ledger</h1>
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <p className="text-sm text-slate-600 mb-4">
          Strict religious compliance ledger. Debit transactions linked to ZAKAT check <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">is_zakat_eligible == True</code>.
        </p>
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs rounded-lg font-semibold">
          ✅ Compliance Guard Active: Reversals use immutable reference balancing entries (`reversal_for_id`).
        </div>
      </div>
    </div>
  );
}
