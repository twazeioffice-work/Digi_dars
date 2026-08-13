"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { 
  DollarSign, ArrowUpRight, ArrowDownRight, ShieldCheck, Loader2, RefreshCw 
} from "lucide-react";
import toast from "react-hot-toast";

interface Transaction {
  id: string;
  type: "CREDIT" | "DEBIT";
  amount: number;
  description: string;
  fund_type: "ZAKAT" | "SADAQAH" | "GENERAL";
  category_name?: string;
  student_name?: string;
  created_at: string;
}

interface StudentOption {
  id: string;
  full_name: string;
  email: string;
}

const getErrorMessage = (err: any, fallback: string) => {
  const detail = err?.response?.data?.detail;
  if (!detail) return fallback;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail.map((d: any) => (typeof d === "string" ? d : d.msg || JSON.stringify(d))).join(", ");
  }
  if (typeof detail === "object") return JSON.stringify(detail);
  return fallback;
};

export default function ZakatFinancePage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalCollected, setTotalCollected] = useState(0);
  const [totalDisbursed, setTotalDisbursed] = useState(0);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<StudentOption[]>([]);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [txType, setTxType] = useState<"INCOME" | "EXPENSE">("INCOME");
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [form, setForm] = useState({
    amount: "",
    fund_type: "ZAKAT",
    category_name: "STIPEND",
    description: "",
    student_id: "",
  });

  const fetchLedger = async () => {
    try {
      const res = await api.get("/finance/transactions");
      const data = res.data?.transactions || res.data?.data || res.data || [];
      const txList: Transaction[] = Array.isArray(data) ? data : [];
      setTransactions(txList);

      let collected = 0;
      let disbursed = 0;
      txList.forEach((t) => {
        const amt = Number(t.amount) || 0;
        if (t.type === "CREDIT") collected += amt;
        if (t.type === "DEBIT") disbursed += amt;
      });
      setTotalCollected(collected);
      setTotalDisbursed(disbursed);
      setBalance(collected - disbursed);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to load financial ledger."));
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await api.get("/users/students");
      setStudents(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.warn("Could not fetch students", e);
    }
  };

  useEffect(() => {
    fetchLedger();
    fetchStudents();
  }, []);

  const handleRecordTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(form.amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error("Please enter a valid positive amount");
      return;
    }
    setSubmitting(true);
    try {
      if (txType === "INCOME") {
        await api.post("/finance/transactions/income", {
          amount: parsedAmount,
          fund_type: form.fund_type,
          category_name: form.category_name || "DONATION",
          description: form.description.trim() || "Income collection",
        });
        toast.success("Income recorded into ledger!");
      } else {
        await api.post("/finance/transactions/expense", {
          amount: parsedAmount,
          fund_type: form.fund_type,
          category_name: form.category_name || "STIPEND",
          description: form.description.trim() || "Expense disbursement",
          student_id: form.student_id ? form.student_id : undefined,
        });
        toast.success("Disbursement recorded into ledger!");
      }

      setShowModal(false);
      setForm({ amount: "", fund_type: "ZAKAT", category_name: "STIPEND", description: "", student_id: "" });
      fetchLedger();
    } catch (err: any) {
      toast.error(getErrorMessage(err, "Transaction failed"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-8 space-y-8 bg-gray-50 min-h-screen">
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Zakat & Finance Ledger</h1>
          <p className="text-sm text-gray-500 mt-1">
            Strict religious compliance ledger for Zakat collections & student disbursements
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => {
              setTxType("INCOME");
              setShowModal(true);
            }}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow-sm transition"
          >
            <ArrowUpRight className="h-4 w-4" /> + Record Collection
          </button>
          <button
            onClick={() => {
              setTxType("EXPENSE");
              setShowModal(true);
            }}
            className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow-sm transition"
          >
            <ArrowDownRight className="h-4 w-4" /> + Record Expense / Aid
          </button>
        </div>
      </div>

      {/* --- COMPLIANCE GAURD BANNER --- */}
      <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs rounded-xl font-medium flex items-center gap-2">
        <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0" />
        <span>
          <strong>Zakat Compliance Guard Active:</strong> All Zakat debits verify that the student profile is marked <code className="bg-emerald-100 px-1 py-0.5 rounded font-mono">is_zakat_eligible == True</code> prior to disbursement.
        </span>
      </div>

      {/* --- SUMMARY METRICS CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Zakat / Funds Collected</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">
              ₹{totalCollected.toLocaleString()}
            </p>
          </div>
          <div className="p-3 bg-emerald-50 rounded-lg">
            <ArrowUpRight className="h-6 w-6 text-emerald-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Disbursed / Spent</p>
            <p className="text-2xl font-bold text-rose-600 mt-1">
              ₹{totalDisbursed.toLocaleString()}
            </p>
          </div>
          <div className="p-3 bg-rose-50 rounded-lg">
            <ArrowDownRight className="h-6 w-6 text-rose-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Net Center Balance</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">
              ₹{balance.toLocaleString()}
            </p>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg">
            <DollarSign className="h-6 w-6 text-blue-600" />
          </div>
        </div>
      </div>

      {/* --- TRANSACTIONS LEDGER TABLE --- */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden space-y-4">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Immutable Ledger Records</h2>
          <button onClick={fetchLedger} className="text-xs text-gray-500 hover:text-gray-800 flex items-center gap-1">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </button>
        </div>

        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-12 text-center text-gray-500 space-y-2">
            <DollarSign className="h-10 w-10 text-gray-300 mx-auto" />
            <p className="font-semibold text-base">No transactions recorded yet</p>
            <p className="text-xs">Click "+ Record Collection" or "+ Record Expense" to log your first transaction.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-gray-700 uppercase text-xs font-semibold">
                <tr>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Fund Category</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Description</th>
                  <th className="px-6 py-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {transactions.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-bold">
                      <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full ${
                        t.type === "CREDIT" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                      }`}>
                        {t.type === "CREDIT" ? "INCOME (CREDIT)" : "EXPENSE (DEBIT)"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-gray-900">{t.fund_type || "ZAKAT"}</span>
                      {t.category_name && <span className="text-xs text-gray-400 block">{t.category_name}</span>}
                    </td>
                    <td className={`px-6 py-4 font-bold text-base ${t.type === "CREDIT" ? "text-emerald-600" : "text-rose-600"}`}>
                      {t.type === "CREDIT" ? "+" : "-"}₹{(Number(t.amount) || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-600 max-w-xs truncate">
                      {t.description || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-400 font-mono">
                      {new Date(t.created_at || Date.now()).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* --- MODAL: RECORD TRANSACTION --- */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {txType === "INCOME" ? "Record Income Collection" : "Record Expense / Student Disbursement"}
              </h2>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                txType === "INCOME" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
              }`}>
                {txType}
              </span>
            </div>

            <form onSubmit={handleRecordTransaction} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Fund Type</label>
                <select
                  className="w-full p-2.5 border border-gray-300 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-emerald-500"
                  value={form.fund_type}
                  onChange={(e) => setForm({ ...form, fund_type: e.target.value })}
                >
                  <option value="ZAKAT">Zakat Fund</option>
                  <option value="SADAQAH">Sadaqah / General Charity</option>
                  <option value="GENERAL">General Operational Fund</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Amount (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="e.g. 5000"
                  className="w-full p-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                />
              </div>

              {txType === "EXPENSE" && (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Recipient Student (Optional)</label>
                  <select
                    className="w-full p-2.5 border border-gray-300 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-emerald-500"
                    value={form.student_id}
                    onChange={(e) => setForm({ ...form, student_id: e.target.value })}
                  >
                    <option value="">Select a Student (If applicable)...</option>
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.full_name || "Student"} ({s.email || "N/A"})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Description / Remarks</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Monthly Zakat contribution from donor"
                  className="w-full p-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-lg text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`flex-1 py-2.5 text-white font-semibold rounded-lg text-sm flex items-center justify-center ${
                    txType === "INCOME" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-rose-600 hover:bg-rose-700"
                  }`}
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Transaction"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
