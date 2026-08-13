"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { 
  Building2, Users, DollarSign, ShieldAlert, Plus, UserPlus, Search, Loader2, 
  Sparkles, Send, ArrowUpRight, ArrowDownRight, CheckCircle2, XCircle, RefreshCw 
} from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend 
} from "recharts";
import toast from "react-hot-toast";

interface Center {
  id: string;
  name: string;
  code: string;
  address?: string;
  capacity: number;
  status: "ACTIVE" | "SUSPENDED";
  created_at: string;
}

interface CenterBreakdown {
  center_id: string;
  center_name: string;
  total_collected: number;
  total_spent: number;
  balance: number;
}

interface GlobalZakatStats {
  global_collected: number;
  global_spent: number;
  global_balance: number;
  centers_breakdown: CenterBreakdown[];
}

interface SqlResponse {
  question: string;
  generated_sql: string;
  raw_data: Record<string, unknown>[];
  ai_summary: string;
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

export default function SuperAdminPage() {
  const [activeTab, setActiveTab] = useState<"centers" | "zakat">("centers");
  const [centers, setCenters] = useState<Center[]>([]);
  const [zakatStats, setZakatStats] = useState<GlobalZakatStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modals
  const [showCenterModal, setShowCenterModal] = useState(false);
  const [showNazimModal, setShowNazimModal] = useState(false);
  const [selectedCenterId, setSelectedCenterId] = useState<string>("");

  // Forms
  const [centerForm, setCenterForm] = useState({ name: "", code: "", address: "", capacity: 100 });
  const [nazimForm, setNazimForm] = useState({ full_name: "", email: "", password: "", phone: "", center_id: "" });
  const [submitting, setSubmitting] = useState(false);

  // AI Assistant State
  const [aiQuestion, setAiQuestion] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<SqlResponse | null>(null);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [cRes, zRes] = await Promise.all([
        api.get("/centers").catch(() => ({ data: [] })),
        api.get("/finance/global-stats/zakat").catch(() => ({ data: null })),
      ]);
      setCenters(cRes.data || []);
      setZakatStats(zRes.data);
    } catch (err) {
      toast.error("Failed to load Super Admin dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // 1. Create Center
  const handleCreateCenter = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/centers", centerForm);
      toast.success("Center registered successfully!");
      setShowCenterModal(false);
      setCenterForm({ name: "", code: "", address: "", capacity: 100 });
      fetchAllData();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to create center"));
    } finally {
      setSubmitting(false);
    }
  };

  // 2. Create Nazim User
  const handleCreateNazim = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/auth/register", {
        ...nazimForm,
        role: "NAZIM",
        center_id: nazimForm.center_id || selectedCenterId,
      });
      toast.success("Nazim registered and assigned to center!");
      setShowNazimModal(false);
      setNazimForm({ full_name: "", email: "", password: "", phone: "", center_id: "" });
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to register Nazim"));
    } finally {
      setSubmitting(false);
    }
  };

  // 3. Toggle Center Status (Activate / Suspend)
  const handleToggleStatus = async (centerId: string, currentStatus: string) => {
    const newStatus = currentStatus === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    try {
      await api.patch(`/centers/${centerId}/status`, { status: newStatus });
      toast.success(`Center ${newStatus.toLowerCase()} successfully!`);
      fetchAllData();
    } catch (err) {
      toast.error("Failed to update center status");
    }
  };

  // 4. Text-to-SQL AI Engine Query
  const handleAskAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuestion.trim()) return;

    setAiLoading(true);
    setAiResult(null);
    try {
      const response = await api.post("/ai/ask-database", { question: aiQuestion });
      setAiResult(response.data);
    } catch (err) {
      toast.error("AI failed to process the database query");
    } finally {
      setAiLoading(false);
    }
  };

  const filteredCenters = centers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase())
  );

  const totalZakatCollected = zakatStats?.global_collected ?? 0;
  const activeCentersCount = centers.filter((c) => c.status === "ACTIVE").length;

  return (
    <div className="p-8 space-y-8 bg-slate-50 min-h-screen">
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="h-8 w-8 text-emerald-600" /> Super Admin Global Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Complete multi-tenant center management, Nazim onboarding, and global Zakat financial control right on this page.
          </p>
        </div>

        <button
          onClick={fetchAllData}
          className="flex items-center gap-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold px-4 py-2.5 rounded-lg text-xs shadow-sm transition"
        >
          <RefreshCw className="h-4 w-4" /> Refresh Global Data
        </button>
      </div>

      {/* --- GLOBAL SUMMARY METRICS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Registered Centers</p>
            <p className="text-3xl font-black text-slate-900 mt-1">{centers.length}</p>
            <p className="text-xs text-emerald-600 font-medium mt-1">{activeCentersCount} Currently Active</p>
          </div>
          <div className="p-3.5 bg-slate-100 rounded-xl text-slate-800">
            <Building2 className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Global Zakat Collected</p>
            <p className="text-3xl font-black text-emerald-600 mt-1">₹{totalZakatCollected.toLocaleString()}</p>
            <p className="text-xs text-slate-400 mt-1">Cross-tenant Zakat audit ledger</p>
          </div>
          <div className="p-3.5 bg-emerald-50 rounded-xl text-emerald-600">
            <DollarSign className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Security & Multi-Tenancy</p>
            <p className="text-3xl font-black text-indigo-600 mt-1">RLS Active</p>
            <p className="text-xs text-slate-400 mt-1">Tenant Isolation Guard Enabled</p>
          </div>
          <div className="p-3.5 bg-indigo-50 rounded-xl text-indigo-600">
            <ShieldAlert className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* --- DASHBOARD SECTION FILTER TABS --- */}
      <div className="flex border-b border-slate-200 gap-6">
        <button
          onClick={() => setActiveTab("centers")}
          className={`pb-3 text-sm font-bold transition flex items-center gap-2 border-b-2 ${
            activeTab === "centers"
              ? "border-emerald-600 text-emerald-600"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <Building2 className="h-4 w-4" /> 🏛️ Manage Masjids, Centers & Nazims ({centers.length})
        </button>

        <button
          onClick={() => setActiveTab("zakat")}
          className={`pb-3 text-sm font-bold transition flex items-center gap-2 border-b-2 ${
            activeTab === "zakat"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <Sparkles className="h-4 w-4" /> 🪙 Global Zakat Ledger & AI Assistant
        </button>
      </div>

      {/* ========================================================= */}
      {/* SECTION 1: MANAGE CENTERS & NAZIMS                        */}
      {/* ========================================================= */}
      {activeTab === "centers" && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="relative max-w-md w-full">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search center by name or code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setShowCenterModal(true)}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2.5 rounded-lg text-sm shadow-sm transition"
              >
                <Plus className="h-4 w-4" /> Register New Center
              </button>
              <button
                onClick={() => {
                  if (centers.length > 0) setNazimForm((prev) => ({ ...prev, center_id: centers[0].id }));
                  setShowNazimModal(true);
                }}
                className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold px-4 py-2.5 rounded-lg text-sm shadow-sm transition"
              >
                <UserPlus className="h-4 w-4" /> Register Nazim
              </button>
            </div>
          </div>

          {/* CENTERS TABLE */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {loading ? (
              <div className="flex h-48 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
              </div>
            ) : filteredCenters.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">
                No centers found matching your query.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold text-[11px] tracking-wider">
                      <th className="py-3.5 px-6">Center Name</th>
                      <th className="py-3.5 px-6">Center Code</th>
                      <th className="py-3.5 px-6">Address</th>
                      <th className="py-3.5 px-6">Capacity</th>
                      <th className="py-3.5 px-6">Status</th>
                      <th className="py-3.5 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredCenters.map((center) => (
                      <tr key={center.id} className="hover:bg-slate-50 transition">
                        <td className="py-4 px-6 font-bold text-slate-900 flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-emerald-600" />
                          {center.name}
                        </td>
                        <td className="py-4 px-6 font-mono text-xs text-slate-600">{center.code}</td>
                        <td className="py-4 px-6 text-slate-500">{center.address || "Main Branch"}</td>
                        <td className="py-4 px-6 text-slate-700">{center.capacity} Students</td>
                        <td className="py-4 px-6">
                          {center.status === "ACTIVE" ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-200">
                              <CheckCircle2 className="h-3 w-3" /> Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-rose-50 text-rose-700 px-2.5 py-1 rounded-full border border-rose-200">
                              <XCircle className="h-3 w-3" /> Suspended
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-right space-x-2">
                          <button
                            onClick={() => {
                              setSelectedCenterId(center.id);
                              setNazimForm((prev) => ({ ...prev, center_id: center.id }));
                              setShowNazimModal(true);
                            }}
                            className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-md font-semibold transition"
                          >
                            + Assign Nazim
                          </button>
                          <button
                            onClick={() => handleToggleStatus(center.id, center.status)}
                            className={`text-xs px-3 py-1.5 rounded-md font-semibold transition ${
                              center.status === "ACTIVE"
                                ? "bg-rose-50 text-rose-600 hover:bg-rose-100"
                                : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                            }`}
                          >
                            {center.status === "ACTIVE" ? "Suspend" : "Activate"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SECTION 2: GLOBAL ZAKAT LEDGER & AI ASSISTANT             */}
      {/* ========================================================= */}
      {activeTab === "zakat" && (
        <div className="space-y-8">
          {/* ZAKAT AUDIT METRICS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Zakat Collected</p>
                <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                  <ArrowUpRight className="h-5 w-5" />
                </div>
              </div>
              <p className="text-3xl font-black text-emerald-600 mt-2">
                ₹{(zakatStats?.global_collected ?? 0).toLocaleString()}
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Disbursed</p>
                <div className="p-2 bg-rose-50 rounded-lg text-rose-600">
                  <ArrowDownRight className="h-5 w-5" />
                </div>
              </div>
              <p className="text-3xl font-black text-rose-600 mt-2">
                ₹{(zakatStats?.global_spent ?? 0).toLocaleString()}
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Net Reserve Balance</p>
                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                  <DollarSign className="h-5 w-5" />
                </div>
              </div>
              <p className="text-3xl font-black text-indigo-600 mt-2">
                ₹{(zakatStats?.global_balance ?? 0).toLocaleString()}
              </p>
            </div>
          </div>

          {/* CENTER LEDGER RECHARTS BAR CHART */}
          {zakatStats?.centers_breakdown && zakatStats.centers_breakdown.length > 0 && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-base font-extrabold text-slate-900">Center-by-Center Zakat Audit Breakdown</h3>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={zakatStats.centers_breakdown}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="center_name" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="total_collected" name="Collected (₹)" fill="#16a34a" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="total_spent" name="Disbursed (₹)" fill="#dc2626" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="balance" name="Reserve (₹)" fill="#2563eb" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* TEXT-TO-SQL AI ASSISTANT QUERY BOX */}
          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-6 rounded-2xl shadow-lg space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-amber-400" />
              <h3 className="text-lg font-bold">Natural Language AI Database Query Engine</h3>
            </div>
            <p className="text-xs text-indigo-200">
              Ask any operational or financial question in plain text. AI converts it to safe SQL and audits live database records.
            </p>

            <form onSubmit={handleAskAI} className="flex gap-2">
              <input
                type="text"
                value={aiQuestion}
                onChange={(e) => setAiQuestion(e.target.value)}
                placeholder="e.g., How much Zakat was collected across all centers this month?"
                className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm text-white placeholder-white/50 outline-none focus:ring-2 focus:ring-amber-400"
              />
              <button
                type="submit"
                disabled={aiLoading}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-6 py-3 rounded-xl text-sm transition flex items-center gap-2"
              >
                {aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Ask AI
              </button>
            </form>

            {aiResult && (
              <div className="bg-white/10 p-5 rounded-xl border border-white/15 space-y-3 mt-4 text-xs">
                <div>
                  <p className="font-bold text-amber-300 uppercase tracking-wider text-[10px]">AI Insight Summary</p>
                  <p className="text-sm font-semibold text-white mt-1">{aiResult.ai_summary}</p>
                </div>
                <div>
                  <p className="font-bold text-indigo-300 uppercase tracking-wider text-[10px]">Generated SQL</p>
                  <pre className="bg-slate-950/80 p-3 rounded-lg font-mono text-[11px] text-emerald-400 overflow-x-auto mt-1">
                    {aiResult.generated_sql}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 1: REGISTER NEW CENTER                              */}
      {/* ========================================================= */}
      {showCenterModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-100">
            <h3 className="text-xl font-bold text-slate-900">Register New Dars Center</h3>
            <form onSubmit={handleCreateCenter} className="space-y-3 text-sm">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Center Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Masjid Umar - Main Branch"
                  value={centerForm.name}
                  onChange={(e) => setCenterForm({ ...centerForm, name: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Center Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. UMAR-001"
                  value={centerForm.code}
                  onChange={(e) => setCenterForm({ ...centerForm, code: e.target.value.toUpperCase() })}
                  className="w-full p-2.5 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Address / Location</label>
                <input
                  type="text"
                  placeholder="e.g. Downtown District"
                  value={centerForm.address}
                  onChange={(e) => setCenterForm({ ...centerForm, address: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Student Capacity</label>
                <input
                  type="number"
                  required
                  value={centerForm.capacity}
                  onChange={(e) => setCenterForm({ ...centerForm, capacity: parseInt(e.target.value, 10) || 100 })}
                  className="w-full p-2.5 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCenterModal(false)}
                  className="px-4 py-2 text-slate-600 font-semibold hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm"
                >
                  {submitting ? "Saving..." : "Create Center"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: REGISTER NAZIM USER                              */}
      {/* ========================================================= */}
      {showNazimModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-100">
            <h3 className="text-xl font-bold text-slate-900">Register & Assign Nazim</h3>
            <form onSubmit={handleCreateNazim} className="space-y-3 text-sm">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Dars Center</label>
                <select
                  required
                  value={nazimForm.center_id}
                  onChange={(e) => setNazimForm({ ...nazimForm, center_id: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">-- Choose Center --</option>
                  {centers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nazim Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Maulana Tariq"
                  value={nazimForm.full_name}
                  onChange={(e) => setNazimForm({ ...nazimForm, full_name: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. nazim.tariq@dars.local"
                  value={nazimForm.email}
                  onChange={(e) => setNazimForm({ ...nazimForm, email: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={nazimForm.password}
                  onChange={(e) => setNazimForm({ ...nazimForm, password: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  placeholder="+91 9876543210"
                  value={nazimForm.phone}
                  onChange={(e) => setNazimForm({ ...nazimForm, phone: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNazimModal(false)}
                  className="px-4 py-2 text-slate-600 font-semibold hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg shadow-sm"
                >
                  {submitting ? "Registering..." : "Register Nazim"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
