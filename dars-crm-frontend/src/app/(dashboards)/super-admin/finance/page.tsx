"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend 
} from "recharts";
import { DollarSign, ArrowUpRight, ArrowDownRight, Sparkles, Send, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useTheme } from "@/context/ThemeContext";

interface CenterBreakdown {
  center_id: string;
  center_name: string;
  total_collected: number;
  total_spent: number;
  balance: number;
}

interface GlobalFinanceStats {
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
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const cardBgClass = isDark 
    ? 'bg-neutral-950 border-neutral-800' 
    : 'bg-[#fcf8f2] border-[#e6dfd3] shadow-sm';
  const innerCardClass = isDark 
    ? 'bg-black border-neutral-850' 
    : 'bg-[#f6f0e4] border-[#ebdccb] shadow-sm';
  const textTitleClass = isDark ? 'text-white' : 'text-stone-900';
  const textMutedClass = isDark ? 'text-neutral-400' : 'text-stone-600';

  const [stats, setStats] = useState<GlobalFinanceStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Text-to-SQL AI State
  const [aiQuestion, setAiQuestion] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<SqlResponse | null>(null);

  // 1. Fetch Global Financial Statistics
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
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className={`p-4 md:p-8 space-y-8 min-h-screen transition-colors ${
      isDark ? 'bg-black text-white' : 'bg-white text-stone-900'
    }`}>
      <div>
        <h1 className={`text-3xl font-bold ${textTitleClass}`}>Global Financial Overview</h1>
        <p className={`text-sm ${textMutedClass}`}>Cross-center institutional audit & intelligent analytics</p>
      </div>

      {/* --- TOP METRIC CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`p-6 rounded-xl border flex items-center justify-between transition ${cardBgClass}`}>
          <div>
            <p className={`text-sm font-medium ${textMutedClass}`}>Total Fees & Grants Collected</p>
            <p className="text-2xl font-bold text-emerald-500">
              ₹{(stats?.global_collected ?? 0).toLocaleString()}
            </p>
          </div>
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
            <ArrowUpRight className="h-6 w-6 text-emerald-500" />
          </div>
        </div>

        <div className={`p-6 rounded-xl border flex items-center justify-between transition ${cardBgClass}`}>
          <div>
            <p className={`text-sm font-medium ${textMutedClass}`}>Total Operating Expenses</p>
            <p className="text-2xl font-bold text-rose-500">
              ₹{(stats?.global_spent ?? 0).toLocaleString()}
            </p>
          </div>
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg">
            <ArrowDownRight className="h-6 w-6 text-rose-500" />
          </div>
        </div>

        <div className={`p-6 rounded-xl border flex items-center justify-between transition ${cardBgClass}`}>
          <div>
            <p className={`text-sm font-medium ${textMutedClass}`}>Net Global Reserve Balance</p>
            <p className="text-2xl font-bold text-blue-500">
              ₹{(stats?.global_balance ?? 0).toLocaleString()}
            </p>
          </div>
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <DollarSign className="h-6 w-6 text-blue-500" />
          </div>
        </div>
      </div>

      {/* --- RECHARTS VISUALIZATION CARD --- */}
      <div className={`p-6 rounded-xl border transition ${cardBgClass}`}>
        <h2 className={`text-lg font-semibold mb-4 ${textTitleClass}`}>Center-by-Center Financial Breakdown</h2>
        <div className="h-72 w-full text-xs">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats?.centers_breakdown || []}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#27272a" : "#e6dfd3"} />
              <XAxis dataKey="center_name" stroke={isDark ? "#a1a1aa" : "#78716c"} />
              <YAxis stroke={isDark ? "#a1a1aa" : "#78716c"} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: isDark ? '#09090b' : '#fffdfa', 
                  borderColor: isDark ? '#27272a' : '#e6dfd3', 
                  color: isDark ? '#fff' : '#1c1917' 
                }}
                formatter={(value: any) => `₹${Number(value || 0).toLocaleString()}`} 
              />
              <Legend />
              <Bar dataKey="total_collected" name="Collected (₹)" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="total_spent" name="Disbursed (₹)" fill="#f43f5e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* --- TEXT-TO-SQL AI ASSISTANT --- */}
      <div className={`p-6 rounded-xl border space-y-4 shadow-lg ${
        isDark 
          ? 'bg-gradient-to-r from-neutral-950 to-indigo-950 border-neutral-800 text-white' 
          : 'bg-gradient-to-r from-[#fcf8f2] to-[#f4ebd9] border-[#e6dfd3] text-stone-900'
      }`}>
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-indigo-500" />
          <h2 className={`text-lg font-semibold ${textTitleClass}`}>Super Admin AI Database Assistant</h2>
        </div>
        <p className={`text-sm ${textMutedClass}`}>
          Ask questions in plain English to query live financial data across all centers.
        </p>

        <form onSubmit={handleAskAI} className="flex gap-2">
          <input
            type="text"
            placeholder="e.g., Which center had the highest revenue this month?"
            className={`flex-grow p-3 rounded-lg text-sm border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              isDark ? 'bg-neutral-900 text-white border-neutral-800' : 'bg-[#fffdfa] text-stone-900 border-[#dcd3c1]'
            }`}
            value={aiQuestion}
            onChange={(e) => setAiQuestion(e.target.value)}
          />
          <button
            type="submit"
            disabled={aiLoading}
            className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition flex items-center gap-2 disabled:opacity-50"
          >
            {aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Ask AI
          </button>
        </form>

        {/* AI Query Result */}
        {aiResult && (
          <div className={`mt-4 p-4 rounded-lg border space-y-3 ${innerCardClass}`}>
            <div>
              <p className="text-xs text-indigo-500 font-mono uppercase tracking-wider">AI Insight Summary</p>
              <p className={`mt-1 font-medium ${textTitleClass}`}>{aiResult.ai_summary}</p>
            </div>

            <details className={`text-xs cursor-pointer ${textMutedClass}`}>
              <summary className="hover:text-teal-500 font-semibold">View Generated PostgreSQL Query</summary>
              <pre className={`mt-2 p-2 rounded text-emerald-500 font-mono overflow-x-auto ${
                isDark ? 'bg-neutral-900 border border-neutral-800' : 'bg-[#fffdfa] border border-[#e6dfd3]'
              }`}>
                {aiResult.generated_sql}
              </pre>
            </details>
          </div>
        )}
      </div>
    </div>
  );
}
