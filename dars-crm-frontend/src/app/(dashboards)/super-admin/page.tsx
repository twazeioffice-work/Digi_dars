"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { 
  Building2, DollarSign, Loader2, Sparkles, Send, ArrowDownRight, 
  CheckCircle2, XCircle, RefreshCw 
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

export default function SuperAdminPage() {
  const [centers, setCenters] = useState<Center[]>([]);
  const [zakatStats, setZakatStats] = useState<GlobalZakatStats | null>(null);
  const [loading, setLoading] = useState(true);

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

  // Toggle Center Status (Activate / Suspend)
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

  // Text-to-SQL AI Engine Query
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

  const totalZakatCollected = zakatStats?.global_collected ?? 0;
  const activeCentersCount = centers.filter((c) => c.status === "ACTIVE").length;

  return (
    <div className="p-4 sm:p-8 space-y-6 sm:space-y-8 bg-slate-50 min-h-screen">
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

      {/* --- GLOBAL SUMMARY METRICS (2-COLUMN GRID) --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
      </div>

      {/* ========================================================= */}
      {/* SECTION 1: CENTERS LIST TABLE                             */}
      {/* ========================================================= */}
      <div className="space-y-4">
        <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
          <Building2 className="h-5 w-5 text-emerald-600" /> Registered Dars Centers &amp; Statuses
        </h2>

        {/* CENTERS TABLE */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            </div>
          ) : centers.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">
              No centers registered in the system yet.
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
                  {centers.map((center) => (
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
                      <td className="py-4 px-6 text-right">
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

      {/* ========================================================= */}
      {/* SECTION 2: GLOBAL ZAKAT LEDGER & AI ASSISTANT             */}
      {/* ========================================================= */}
      <div className="space-y-8 pt-4 border-t border-slate-200">
        {/* ZAKAT AUDIT METRICS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
    </div>
  );
}
