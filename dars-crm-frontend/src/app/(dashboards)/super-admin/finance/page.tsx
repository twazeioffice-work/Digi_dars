"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend 
} from "recharts";
import { DollarSign, ArrowUpRight, ArrowDownRight, Sparkles, Send, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

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

export default function SuperAdminFinancePage() {
  const [stats, setStats] = useState<GlobalZakatStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Text-to-SQL AI State
  const [aiQuestion, setAiQuestion] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<SqlResponse | null>(null);

  // 1. Fetch Global Zakat Statistics
  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await api.get("/finance/global-stats/zakat");
        setStats(response.data);
      } catch (err) {
        toast.error("Failed to load global financial metrics.");
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  // 2. Handle Natural Language AI Queries
  const handleAskAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuestion.trim()) return;

    setAiLoading(true);
    setAiResult(null);

    try {
      const response = await api.post("/ai/ask-database", { question: aiQuestion });
      setAiResult(response.data);
    } catch (err: unknown) {
      toast.error("AI failed to process the database query.");
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 bg-gray-50 min-h-screen">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Global Financial Overview</h1>
        <p className="text-gray-500">Cross-center Zakat audit & intelligent analytics</p>
      </div>

      {/* --- TOP METRIC CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Zakat Collected</p>
            <p className="text-2xl font-bold text-emerald-600">
              ₹{(stats?.global_collected ?? 0).toLocaleString()}
            </p>
          </div>
          <div className="p-3 bg-emerald-50 rounded-lg">
            <ArrowUpRight className="h-6 w-6 text-emerald-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Zakat Disbursed</p>
            <p className="text-2xl font-bold text-rose-600">
              ₹{(stats?.global_spent ?? 0).toLocaleString()}
            </p>
          </div>
          <div className="p-3 bg-rose-50 rounded-lg">
            <ArrowDownRight className="h-6 w-6 text-rose-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Net Global Balance</p>
            <p className="text-2xl font-bold text-blue-600">
              ₹{(stats?.global_balance ?? 0).toLocaleString()}
            </p>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg">
            <DollarSign className="h-6 w-6 text-blue-600" />
          </div>
        </div>
      </div>

      {/* --- RECHARTS VISUALIZATION --- */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Center-by-Center Allocation</h2>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats?.centers_breakdown || []}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="center_name" />
              <YAxis />
              <Tooltip formatter={(value: any) => `₹${Number(value || 0).toLocaleString()}`} />
              <Legend />
              <Bar dataKey="total_collected" name="Collected" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="total_spent" name="Spent" fill="#f43f5e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* --- TEXT-TO-SQL AI ASSISTANT --- */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-6 rounded-xl shadow-lg space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-indigo-400" />
          <h2 className="text-lg font-semibold">Super Admin AI Database Assistant</h2>
        </div>
        <p className="text-sm text-slate-300">
          Ask questions in plain English to query live financial data across all centers.
        </p>

        <form onSubmit={handleAskAI} className="flex gap-2">
          <input
            type="text"
            placeholder="e.g., Which center disbursed the most Zakat this month?"
            className="flex-grow p-3 rounded-lg bg-slate-800 text-white border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            value={aiQuestion}
            onChange={(e) => setAiQuestion(e.target.value)}
          />
          <button
            type="submit"
            disabled={aiLoading}
            className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-medium transition flex items-center gap-2 disabled:opacity-50"
          >
            {aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Ask
          </button>
        </form>

        {/* AI Query Result */}
        {aiResult && (
          <div className="mt-4 p-4 bg-slate-800/80 rounded-lg border border-slate-700 space-y-3">
            <div>
              <p className="text-xs text-indigo-400 font-mono uppercase tracking-wider">AI Insight Summary</p>
              <p className="text-slate-100 mt-1 font-medium">{aiResult.ai_summary}</p>
            </div>

            <details className="text-xs text-slate-400 cursor-pointer">
              <summary className="hover:text-slate-200">View Generated PostgreSQL Query</summary>
              <pre className="mt-2 p-2 bg-slate-950 rounded text-emerald-400 font-mono overflow-x-auto">
                {aiResult.generated_sql}
              </pre>
            </details>
          </div>
        )}
      </div>
    </div>
  );
}
