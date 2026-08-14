"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { 
  DollarSign, ArrowUpRight, ArrowDownRight, ShieldCheck, Loader2, RefreshCw, UserCheck, Phone, User
} from "lucide-react";
import toast from "react-hot-toast";

interface Transaction {
  id: string;
  type: "CREDIT" | "DEBIT";
  amount: number;
  description: string;
  fund_type: string;
  category_name?: string;
  student_id?: string;
  student_name?: string;
  student_phone?: string;
  donor_name?: string;
  donor_phone?: string;
  recipient_name?: string;
  recipient_phone?: string;
  created_at: string;
}

interface StudentOption {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
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
    donor_name: "",
    donor_phone: "",
    recipient_name: "",
    recipient_phone: "",
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

  const handleStudentSelect = (studentId: string) => {
    if (!studentId) {
      setForm((prev) => ({ ...prev, student_id: "", recipient_name: "", recipient_phone: "" }));
      return;
    }
    const st = students.find((s) => s.id === studentId);
    if (st) {
      setForm((prev) => ({
        ...prev,
        student_id: studentId,
        recipient_name: st.full_name,
        recipient_phone: st.phone || "",
      }));
    }
  };

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
          donor_name: form.donor_name.trim() || undefined,
          donor_phone: form.donor_phone.trim() || undefined,
        });
        toast.success("Income collection recorded!");
      } else {
        await api.post("/finance/transactions/expense", {
          amount: parsedAmount,
          fund_type: form.fund_type,
          category_name: form.category_name || "STIPEND",
          description: form.description.trim() || "Expense disbursement",
          student_id: form.student_id ? form.student_id : undefined,
          recipient_name: form.recipient_name.trim() || undefined,
          recipient_phone: form.recipient_phone.trim() || undefined,
        });
        toast.success("Expense disbursement recorded!");
      }

      setShowModal(false);
      setForm({
        amount: "",
        fund_type: "ZAKAT",
        category_name: "STIPEND",
        description: "",
        student_id: "",
        donor_name: "",
        donor_phone: "",
        recipient_name: "",
        recipient_phone: "",
      });
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
            Audit-ready financial ledger with complete Giver & Recipient records for Zakat & general funds
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => {
              setTxType("INCOME");
              setForm({
                amount: "",
                fund_type: "ZAKAT",
                category_name: "DONATION",
                description: "",
                student_id: "",
                donor_name: "",
                donor_phone: "",
                recipient_name: "",
                recipient_phone: "",
              });
              setShowModal(true);
            }}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow-sm transition"
          >
            <ArrowUpRight className="h-4 w-4" /> + Record Collection
          </button>
          <button
            onClick={() => {
              setTxType("EXPENSE");
              setForm({
                amount: "",
                fund_type: "ZAKAT",
                category_name: "STIPEND",
                description: "",
                student_id: "",
                donor_name: "",
                donor_phone: "",
                recipient_name: "",
                recipient_phone: "",
              });
              setShowModal(true);
            }}
            className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow-sm transition"
          >
            <ArrowDownRight className="h-4 w-4" /> + Record Expense / Aid
          </button>
        </div>
      </div>

      {/* --- COMPLIANCE GUARD BANNER --- */}
      <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs rounded-xl font-medium flex items-center gap-2">
        <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0" />
        <span>
          <strong>Zakat Compliance Active:</strong> Every transaction logs verified <strong>Giver (Donor)</strong> contact details for collections, and verified <strong>Receiver (Beneficiary Student/Recipient)</strong> details for disbursements.
        </span>
      </div>

      {/* --- SUMMARY METRICS CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Funds Collected</p>
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
                  <th className="px-6 py-4">Giver Details (Donor)</th>
                  <th className="px-6 py-4">Receiver Details (Beneficiary)</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Description</th>
                  <th className="px-6 py-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {transactions.map((t) => {
                  const isCredit = t.type === "CREDIT";

                  // Giver Person
                  const giverName = isCredit
                    ? (t.donor_name || "General Donor")
                    : "Center Zakat Fund";
                  const giverPhone = isCredit ? t.donor_phone : undefined;

                  // Receiver Person
                  const receiverName = !isCredit
                    ? (t.recipient_name || t.student_name || "Center Operational Expense")
                    : "Masjid Center Account";
                  const receiverPhone = !isCredit ? (t.recipient_phone || t.student_phone) : undefined;

                  return (
                    <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-bold">
                        <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full ${
                          isCredit ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                        }`}>
                          {isCredit ? "INCOME (CREDIT)" : "EXPENSE (DEBIT)"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-gray-900">{t.fund_type || "ZAKAT"}</span>
                        {t.category_name && <span className="text-xs text-gray-400 block">{t.category_name}</span>}
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-slate-700">
                        <div>
                          <span className="font-bold text-slate-900 block">{giverName}</span>
                          {giverPhone ? (
                            <span className="text-slate-500 font-mono text-[11px] flex items-center gap-1">
                              <Phone className="h-3 w-3 text-slate-400" /> {giverPhone}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[11px] italic">No phone logged</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-slate-700">
                        <div>
                          <span className="font-bold text-emerald-800 block flex items-center gap-1">
                            {t.student_name && <UserCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />}
                            {receiverName}
                          </span>
                          {receiverPhone ? (
                            <span className="text-slate-500 font-mono text-[11px] flex items-center gap-1">
                              <Phone className="h-3 w-3 text-slate-400" /> {receiverPhone}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[11px] italic">No phone logged</span>
                          )}
                        </div>
                      </td>
                      <td className={`px-6 py-4 font-bold text-base ${isCredit ? "text-emerald-600" : "text-rose-600"}`}>
                        {isCredit ? "+" : "-"}₹{(Number(t.amount) || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-600 max-w-xs truncate">
                        {t.description || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-400 font-mono">
                        {new Date(t.created_at || Date.now()).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* --- MODAL: RECORD TRANSACTION --- */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {txType === "INCOME" ? "Record Income Collection" : "Record Expense / Aid Disbursement"}
                </h2>
                <p className="text-xs text-gray-500">
                  {txType === "INCOME"
                    ? "Enter incoming fund details including Giver (Donor) Name & Phone"
                    : "Enter disbursement details including Receiver Name & Phone"}
                </p>
              </div>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                txType === "INCOME" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
              }`}>
                {txType}
              </span>
            </div>

            <form onSubmit={handleRecordTransaction} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Fund Type *</label>
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
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Amount (₹) *</label>
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
              </div>

              {/* --- GIVER (DONOR) FIELDS FOR INCOME --- */}
              {txType === "INCOME" && (
                <div className="bg-emerald-50/60 p-3.5 rounded-xl border border-emerald-200/60 space-y-3">
                  <p className="text-xs font-bold text-emerald-900 flex items-center gap-1">
                    <User className="h-4 w-4 text-emerald-700" /> Giver (Donor) Contact Information
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Giver Full Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Muhammad Hassan"
                        className="w-full p-2.5 border border-gray-300 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-emerald-500"
                        value={form.donor_name}
                        onChange={(e) => setForm({ ...form, donor_name: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Giver Phone Number *</label>
                      <input
                        type="tel"
                        required
                        placeholder="e.g. +91 9876543210"
                        className="w-full p-2.5 border border-gray-300 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-emerald-500"
                        value={form.donor_phone}
                        onChange={(e) => setForm({ ...form, donor_phone: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* --- RECEIVER FIELDS FOR EXPENSE --- */}
              {txType === "EXPENSE" && (
                <div className="bg-rose-50/60 p-3.5 rounded-xl border border-rose-200/60 space-y-3">
                  <p className="text-xs font-bold text-rose-900 flex items-center gap-1">
                    <UserCheck className="h-4 w-4 text-rose-700" /> Receiver (Beneficiary) Information
                  </p>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Select Recipient Student (Auto-links ID & Phone)
                    </label>
                    <select
                      className="w-full p-2.5 border border-gray-300 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-emerald-500"
                      value={form.student_id}
                      onChange={(e) => handleStudentSelect(e.target.value)}
                    >
                      <option value="">-- External / Non-Student Beneficiary --</option>
                      {students.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.full_name || "Student"} ({s.phone || s.email || "No phone"})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Receiver Full Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Fatima Bi / Student Name"
                        className="w-full p-2.5 border border-gray-300 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-emerald-500"
                        value={form.recipient_name}
                        onChange={(e) => setForm({ ...form, recipient_name: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Receiver Phone Number *</label>
                      <input
                        type="tel"
                        required
                        placeholder="e.g. +91 9123456789"
                        className="w-full p-2.5 border border-gray-300 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-emerald-500"
                        value={form.recipient_phone}
                        onChange={(e) => setForm({ ...form, recipient_phone: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Description / Remarks *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Monthly Zakat contribution / Medical Aid support"
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
