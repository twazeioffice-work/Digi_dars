"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { 
  DollarSign, ArrowUpRight, ArrowDownRight, ShieldCheck, Loader2, RefreshCw, UserCheck, Phone, User, Filter
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

const INCOME_CATEGORIES = [
  { value: "SADAQAH", label: "Sadaqah (Charitable Collection)" },
  { value: "HADIYA", label: "Hadiya (Voluntary Gift Contribution)" },
  { value: "TUITION", label: "Student Tuition & Hifz Fee" },
  { value: "HOSTEL", label: "Hostel & Boarding Subscriptions" },
  { value: "GRANT", label: "Institutional / Educational Grant" },
  { value: "GENERAL", label: "General Operational Fund" },
];

const EXPENSE_CATEGORIES = [
  { value: "SALARY", label: "Staff & Ustad Salaries / Payroll" },
  { value: "KITCHEN", label: "Kitchen Provisions & Grocery Expenses" },
  { value: "UTILITIES", label: "Utilities (Electricity, Water, Gas, Internet)" },
  { value: "MAINTENANCE", label: "Facility Maintenance & Building Repairs" },
  { value: "STIPEND", label: "Student Stipends & Educational Aid" },
  { value: "IT_CLOUD", label: "Cloud Infrastructure & WhatsApp API Fees" },
  { value: "TRANSPORT", label: "Transport & Student Logistics" },
  { value: "MISC", label: "Miscellaneous Operational Expenses" },
];

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

export default function NazimFinancePage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filterCategory, setFilterCategory] = useState<string>("ALL");
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
    fund_type: "SADAQAH",
    category_name: "General Collection",
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

  const openIncomeModal = (category: string = "SADAQAH") => {
    setTxType("INCOME");
    setForm({
      amount: "",
      fund_type: category,
      category_name: category === "SADAQAH" ? "Sadaqah Drive" : category === "HADIYA" ? "Hadiya Contribution" : "Tuition Collection",
      description: "",
      student_id: "",
      donor_name: "",
      donor_phone: "",
      recipient_name: "",
      recipient_phone: "",
    });
    setShowModal(true);
  };

  const openExpenseModal = (category: string = "SALARY") => {
    setTxType("EXPENSE");
    setForm({
      amount: "",
      fund_type: category,
      category_name: category === "SALARY" ? "Ustad Salary Payroll" : category === "KITCHEN" ? "Grocery & Provisions" : "Facility Expense",
      description: "",
      student_id: "",
      donor_name: "",
      donor_phone: "",
      recipient_name: "",
      recipient_phone: "",
    });
    setShowModal(true);
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
          category_name: form.category_name || "General Collection",
          description: form.description.trim() || `${form.fund_type} Income Collection`,
          donor_name: form.donor_name.trim() || undefined,
          donor_phone: form.donor_phone.trim() || undefined,
        });
        toast.success("Income collection recorded!");
      } else {
        await api.post("/finance/transactions/expense", {
          amount: parsedAmount,
          fund_type: form.fund_type,
          category_name: form.category_name || "Operational Expense",
          description: form.description.trim() || `${form.fund_type} Expense Disbursement`,
          student_id: form.student_id ? form.student_id : undefined,
          recipient_name: form.recipient_name.trim() || undefined,
          recipient_phone: form.recipient_phone.trim() || undefined,
        });
        toast.success("Expense disbursement recorded!");
      }

      setShowModal(false);
      fetchLedger();
    } catch (err: any) {
      toast.error(getErrorMessage(err, "Transaction failed"));
    } finally {
      setSubmitting(false);
    }
  };

  const filteredTransactions = transactions.filter((t) => {
    if (filterCategory === "ALL") return true;
    if (filterCategory === "INCOME") return t.type === "CREDIT";
    if (filterCategory === "EXPENSE") return t.type === "DEBIT";
    return t.fund_type === filterCategory;
  });

  return (
    <div className="p-4 sm:p-8 space-y-6 sm:space-y-8 bg-gray-50 min-h-screen">
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Financial Ledger & Expense Management</h1>
          <p className="text-sm text-gray-500 mt-1">
            Complete institutional audit for Sadaqah, Hadiya, Tuition Fees, Salaries, Kitchen Provisions, Utilities, and all Operational Expenses
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => openIncomeModal("SADAQAH")}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-2.5 rounded-lg shadow-sm transition"
          >
            <ArrowUpRight className="h-4 w-4" /> + Record Sadaqah / Hadiya
          </button>
          <button
            onClick={() => openExpenseModal("SALARY")}
            className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-3.5 py-2.5 rounded-lg shadow-sm transition"
          >
            <ArrowDownRight className="h-4 w-4" /> + Record Expense / Salary
          </button>
        </div>
      </div>

      {/* --- COMPLIANCE GUARD BANNER --- */}
      <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs rounded-xl font-medium flex items-center gap-2">
        <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0" />
        <span>
          <strong>Audit-Grade Financial Oversight:</strong> Every transaction logs itemized categories (Sadaqah, Hadiya, Salaries, Kitchen, Utilities) along with verified <strong>Giver (Donor)</strong> and <strong>Receiver (Beneficiary)</strong> contact info.
        </span>
      </div>

      {/* --- SUMMARY METRICS CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Funds Collected (Sadaqah/Hadiya/Fees)</p>
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
            <p className="text-sm font-medium text-gray-500">Total Expenses (Salaries/Kitchen/Utilities)</p>
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
            <p className="text-sm font-medium text-gray-500">Net Operational Balance</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">
              ₹{balance.toLocaleString()}
            </p>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg">
            <DollarSign className="h-6 w-6 text-blue-600" />
          </div>
        </div>
      </div>

      {/* --- QUICK CATEGORY SHORTCUT CARDS --- */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Quick Transaction Record Shortcuts</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          <button 
            onClick={() => openIncomeModal("SADAQAH")}
            className="p-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-left transition"
          >
            <span className="text-xs font-bold text-emerald-900 block">💚 Sadaqah</span>
            <span className="text-[10px] text-emerald-700">Record Donation</span>
          </button>
          <button 
            onClick={() => openIncomeModal("HADIYA")}
            className="p-3 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl text-left transition"
          >
            <span className="text-xs font-bold text-amber-900 block">🎁 Hadiya</span>
            <span className="text-[10px] text-amber-700">Voluntary Gift</span>
          </button>
          <button 
            onClick={() => openExpenseModal("SALARY")}
            className="p-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl text-left transition"
          >
            <span className="text-xs font-bold text-blue-900 block">👳‍♂️ Ustad Salaries</span>
            <span className="text-[10px] text-blue-700">Release Payroll</span>
          </button>
          <button 
            onClick={() => openExpenseModal("KITCHEN")}
            className="p-3 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-xl text-left transition"
          >
            <span className="text-xs font-bold text-orange-900 block">🍳 Kitchen Grocery</span>
            <span className="text-[10px] text-orange-700">Provisions & Food</span>
          </button>
          <button 
            onClick={() => openExpenseModal("UTILITIES")}
            className="p-3 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl text-left transition"
          >
            <span className="text-xs font-bold text-indigo-900 block">⚡ Utilities</span>
            <span className="text-[10px] text-indigo-700">Electric / Water / Wifi</span>
          </button>
          <button 
            onClick={() => openExpenseModal("MAINTENANCE")}
            className="p-3 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl text-left transition"
          >
            <span className="text-xs font-bold text-purple-900 block">🛠️ Repairs & Maint.</span>
            <span className="text-[10px] text-purple-700">Facility Upkeep</span>
          </button>
        </div>
      </div>

      {/* --- TRANSACTIONS LEDGER TABLE WITH CATEGORY FILTER --- */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden space-y-4">
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Immutable Ledger Records</h2>
            <p className="text-xs text-gray-500">Showing {filteredTransactions.length} of {transactions.length} total logged entries</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400 shrink-0" />
            <select
              className="p-2 border border-gray-300 rounded-lg text-xs bg-white font-medium outline-none focus:ring-2 focus:ring-emerald-500"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="ALL">All Categories</option>
              <option value="INCOME">All Income (Credit)</option>
              <option value="EXPENSE">All Expenses (Debit)</option>
              <option value="SADAQAH">Sadaqah</option>
              <option value="HADIYA">Hadiya</option>
              <option value="TUITION">Tuition Fees</option>
              <option value="SALARY">Salaries / Payroll</option>
              <option value="KITCHEN">Kitchen Groceries</option>
              <option value="UTILITIES">Utilities</option>
              <option value="MAINTENANCE">Maintenance</option>
              <option value="IT_CLOUD">Cloud & IT</option>
            </select>

            <button onClick={fetchLedger} className="p-2 text-xs text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg flex items-center gap-1">
              <RefreshCw className="h-3.5 w-3.5" /> Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="p-12 text-center text-gray-500 space-y-2">
            <DollarSign className="h-10 w-10 text-gray-300 mx-auto" />
            <p className="font-semibold text-base">No transactions matching filter</p>
            <p className="text-xs">Select "All Categories" or click "+ Record Sadaqah / Expense" above.</p>
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
                {filteredTransactions.map((t) => {
                  const isCredit = t.type === "CREDIT";

                  // Giver Person
                  const giverName = isCredit
                    ? (t.donor_name || "General Donor")
                    : "Center Operational Fund";
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
                        <span className="font-semibold text-gray-900 px-2 py-0.5 rounded bg-slate-100 text-xs border border-slate-200">
                          {t.fund_type || "GENERAL"}
                        </span>
                        {t.category_name && <span className="text-xs text-gray-500 block mt-1">{t.category_name}</span>}
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

      {/* --- MODAL: RECORD TRANSACTION WITH ALL INCOME & EXPENSE TYPES --- */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {txType === "INCOME" ? "Record Incoming Collection" : "Record Operational Expense"}
                </h2>
                <p className="text-xs text-gray-500">
                  {txType === "INCOME"
                    ? "Select category (Sadaqah, Hadiya, Fees, Grants) & Giver details"
                    : "Select expense type (Salaries, Kitchen, Utilities, Repairs, IT) & Receiver details"}
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
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    {txType === "INCOME" ? "Income Category *" : "Expense Category *"}
                  </label>
                  <select
                    className="w-full p-2.5 border border-gray-300 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-emerald-500"
                    value={form.fund_type}
                    onChange={(e) => setForm({ ...form, fund_type: e.target.value })}
                  >
                    {(txType === "INCOME" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
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

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Specific Sub-Category / Note</label>
                <input
                  type="text"
                  placeholder={txType === "INCOME" ? "e.g. Friday Juma Collection / General Donation" : "e.g. August Rice & Milk provisions / EB Bill"}
                  className="w-full p-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                  value={form.category_name}
                  onChange={(e) => setForm({ ...form, category_name: e.target.value })}
                />
              </div>

              {/* --- GIVER (DONOR) FIELDS FOR INCOME --- */}
              {txType === "INCOME" && (
                <div className="bg-emerald-50/60 p-3.5 rounded-xl border border-emerald-200/60 space-y-3">
                  <p className="text-xs font-bold text-emerald-900 flex items-center gap-1">
                    <User className="h-4 w-4 text-emerald-700" /> Giver (Donor / Contributor) Details
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
                    <UserCheck className="h-4 w-4 text-rose-700" /> Receiver (Vendor / Staff / Beneficiary) Info
                  </p>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Link Recipient Student (Optional)
                    </label>
                    <select
                      className="w-full p-2.5 border border-gray-300 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-emerald-500"
                      value={form.student_id}
                      onChange={(e) => handleStudentSelect(e.target.value)}
                    >
                      <option value="">-- External Vendor / Staff / Utility Provider --</option>
                      {students.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.full_name || "Student"} ({s.phone || s.email || "No phone"})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Receiver Full Name / Vendor *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Ustad Ahmed / Al-Madina Grocery"
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
                  placeholder="e.g. Monthly Ustad Salary / Kitchen grocery voucher / Sadaqah collection"
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
