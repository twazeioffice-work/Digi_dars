"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { 
  Trophy, Award, Medal, RefreshCw, Loader2, Plus, CheckCircle, ShieldCheck, 
  BarChart2, Users, GraduationCap, CheckSquare 
} from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell 
} from "recharts";
import toast from "react-hot-toast";

interface LeaderboardItem {
  center_id: string;
  center_name: string;
  center_code: string;
  global_rank: number;
  total_institution_score: number;
  avg_student_score: number;
  avg_usthad_score: number;
  nazim_duty_score: number;
  log_month: string;
}

interface CenterOption {
  id: string;
  name: string;
  code: string;
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

const RANK_COLORS = ["#EAB308", "#94A3B8", "#B45309", "#3B82F6", "#10B981"];

export default function GlobalLeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>([]);
  const [centers, setCenters] = useState<CenterOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [compiling, setCompiling] = useState(false);

  // Assign Duty Modal
  const [showDutyModal, setShowDutyModal] = useState(false);
  const [submittingDuty, setSubmittingDuty] = useState(false);
  const [dutyForm, setDutyForm] = useState({
    center_id: "",
    title: "",
    description: "",
    due_date: new Date().toISOString().split("T")[0],
  });

  const fetchLeaderboard = async () => {
    try {
      const [lRes, cRes] = await Promise.all([
        api.get("/performance/leaderboard").catch(() => ({ data: { leaderboard: [] } })),
        api.get("/centers").catch(() => ({ data: [] }))
      ]);
      setLeaderboard(lRes.data?.leaderboard || []);
      setCenters(Array.isArray(cRes.data) ? cRes.data : []);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to load leaderboard"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const handleTriggerCompilation = async () => {
    setCompiling(true);
    try {
      await api.post("/performance/trigger-compilation");
      toast.success("Monthly institutional rankings recalculated!");
      fetchLeaderboard();
    } catch (err) {
      toast.error(getErrorMessage(err, "Recalculation failed"));
    } finally {
      setCompiling(false);
    }
  };

  const handleCreateDuty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dutyForm.center_id) {
      toast.error("Please select a target center for the duty");
      return;
    }
    setSubmittingDuty(true);
    try {
      await api.post("/performance/duties", dutyForm);
      toast.success("Administrative duty assigned to Nazim!");
      setShowDutyModal(false);
      setDutyForm({
        center_id: "",
        title: "",
        description: "",
        due_date: new Date().toISOString().split("T")[0],
      });
      fetchLeaderboard();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to assign duty"));
    } finally {
      setSubmittingDuty(false);
    }
  };

  const chartData = leaderboard.slice(0, 10).map((item) => ({
    name: item.center_code || item.center_name.slice(0, 10),
    Score: item.total_institution_score,
    StudentAvg: item.avg_student_score,
    UsthadAvg: item.avg_usthad_score,
    NazimDuty: item.nazim_duty_score,
  }));

  return (
    <div className="p-8 space-y-8 bg-slate-50 min-h-screen">
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <Trophy className="h-8 w-8 text-amber-500" /> Global Center Rankings & Leaderboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Hierarchical scoring engine: 40% Student Outcomes + 35% Usthad Batch Score + 25% Nazim Operational Duties
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => {
              if (centers.length > 0) setDutyForm((prev) => ({ ...prev, center_id: centers[0].id }));
              setShowDutyModal(true);
            }}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2.5 rounded-lg text-xs shadow-sm transition"
          >
            <Plus className="h-4 w-4" /> Assign Nazim Duty
          </button>

          <button
            onClick={handleTriggerCompilation}
            disabled={compiling}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2.5 rounded-lg text-xs shadow-sm transition disabled:opacity-60"
          >
            {compiling ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Recalculate Scores
          </button>
        </div>
      </div>

      {/* --- USTHAD PENALTY MECHANICS AUDIT BANNER --- */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-md space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-emerald-400" />
            <h2 className="text-base font-bold text-white">Usthad Penalty Mechanics & 30% Batch Rule</h2>
          </div>
          <span className="text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 px-2.5 py-1 rounded-full uppercase border border-indigo-400/30">
            Institutional Weight: 35%
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/60 space-y-1">
            <span className="text-emerald-400 font-extrabold block uppercase text-[10px]">1. Underperforming Threshold</span>
            <p className="text-slate-300">
              Students averaging <strong className="text-white">&lt; 70.0%</strong> across Namaz, Hygiene, Study, & Chores are flagged as underperforming.
            </p>
          </div>

          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/60 space-y-1">
            <span className="text-amber-400 font-extrabold block uppercase text-[10px]">2. 30% Safe Zone Rule</span>
            <p className="text-slate-300">
              If <strong className="text-white">&le; 30%</strong> of the batch underperforms, Usthad penalty = <strong className="text-emerald-400">0 pts</strong> (Base Score 100).
            </p>
          </div>

          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/60 space-y-1">
            <span className="text-rose-400 font-extrabold block uppercase text-[10px]">3. Progressive Penalty Formula</span>
            <p className="text-slate-300 font-mono text-[11px]">
              Penalty = (Failure Rate - 0.30) &times; 100 &times; 1.5
            </p>
            <p className="text-[10px] text-slate-400 mt-1">
              Example: 50% failure rate &rarr; (0.50 - 0.30) &times; 150 = 30 pts penalty &rarr; Final Score 70.
            </p>
          </div>
        </div>
      </div>

      {/* --- TOP 3 PODIUM --- */}
      {!loading && leaderboard.length >= 1 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {leaderboard.slice(0, 3).map((item, idx) => (
            <div
              key={item.center_id}
              className={`p-6 rounded-2xl border bg-white shadow-sm flex flex-col justify-between relative overflow-hidden ${
                idx === 0 ? "border-amber-300 ring-2 ring-amber-400/30" : "border-slate-200"
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-black uppercase text-slate-400 tracking-wider">
                    Rank #{item.global_rank}
                  </span>
                  <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">{item.center_name}</h3>
                  <p className="text-xs text-slate-400 font-mono">{item.center_code}</p>
                </div>
                <div className={`p-3 rounded-xl ${
                  idx === 0 ? "bg-amber-100 text-amber-700" : idx === 1 ? "bg-slate-100 text-slate-700" : "bg-amber-50 text-amber-800"
                }`}>
                  {idx === 0 ? <Trophy className="h-7 w-7" /> : idx === 1 ? <Award className="h-7 w-7" /> : <Medal className="h-7 w-7" />}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 grid grid-cols-3 gap-2 text-center">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Students (40%)</span>
                  <span className="text-sm font-extrabold text-emerald-600">{item.avg_student_score}%</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Usthad (35%)</span>
                  <span className="text-sm font-extrabold text-indigo-600">{item.avg_usthad_score}%</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Nazim (25%)</span>
                  <span className="text-sm font-extrabold text-purple-600">{item.nazim_duty_score}%</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">Overall Score</span>
                <span className="text-2xl font-black text-slate-900">{item.total_institution_score}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- VISUAL BAR CHART --- */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <BarChart2 className="h-5 w-5 text-indigo-600" /> Center Institutional Performance Comparison
        </h2>
        <div className="h-64">
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" stroke="#64748B" fontSize={12} tickLine={false} />
                <YAxis domain={[0, 100]} stroke="#64748B" fontSize={12} tickLine={false} />
                <Tooltip />
                <Bar dataKey="Score" radius={[6, 6, 0, 0]}>
                  {chartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={RANK_COLORS[index % RANK_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* --- FULL LEADERBOARD TABLE --- */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Complete Center Rankings</h2>
          <span className="text-xs font-semibold text-slate-400 font-mono">
            Month: {new Date().toLocaleDateString("default", { month: "long", year: "numeric" })}
          </span>
        </div>

        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-2">
            <Trophy className="h-10 w-10 text-slate-300 mx-auto" />
            <p className="font-semibold text-base">No center performance data yet</p>
            <p className="text-xs">Click "Recalculate Scores" to run monthly aggregation.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700 uppercase text-xs font-semibold">
                <tr>
                  <th className="px-6 py-4">Global Rank</th>
                  <th className="px-6 py-4">Center Name</th>
                  <th className="px-6 py-4">Student Avg (40%)</th>
                  <th className="px-6 py-4">Usthad Avg (35%)</th>
                  <th className="px-6 py-4">Nazim Duties (25%)</th>
                  <th className="px-6 py-4">Total Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leaderboard.map((item) => (
                  <tr key={item.center_id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-black text-base">
                      <span className={`inline-flex items-center justify-center h-8 w-8 rounded-full text-xs text-white ${
                        item.global_rank === 1 ? "bg-amber-500" : item.global_rank === 2 ? "bg-slate-400" : item.global_rank === 3 ? "bg-amber-700" : "bg-slate-200 text-slate-700"
                      }`}>
                        #{item.global_rank}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">
                      {item.center_name}
                      <span className="text-xs text-slate-400 font-mono block font-normal">{item.center_code}</span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-emerald-600">
                      {item.avg_student_score}%
                    </td>
                    <td className="px-6 py-4 font-semibold text-indigo-600">
                      {item.avg_usthad_score}%
                    </td>
                    <td className="px-6 py-4 font-semibold text-purple-600">
                      {item.nazim_duty_score}%
                    </td>
                    <td className="px-6 py-4 font-black text-lg text-slate-900">
                      {item.total_institution_score}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* --- MODAL: ASSIGN NAZIM DUTY --- */}
      {showDutyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <h2 className="text-xl font-bold text-slate-900">Assign Administrative Duty to Nazim</h2>
            <form onSubmit={handleCreateDuty} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Center *</label>
                <select
                  required
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-indigo-500"
                  value={dutyForm.center_id}
                  onChange={(e) => setDutyForm({ ...dutyForm, center_id: e.target.value })}
                >
                  <option value="">Select a Center...</option>
                  {centers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Duty Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Monthly Zakat Audit & Student Verification"
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  value={dutyForm.title}
                  onChange={(e) => setDutyForm({ ...dutyForm, title: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Duty Description</label>
                <textarea
                  rows={2}
                  placeholder="Details of administrative task expected from Nazim..."
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  value={dutyForm.description}
                  onChange={(e) => setDutyForm({ ...dutyForm, description: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Due Date *</label>
                <input
                  type="date"
                  required
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  value={dutyForm.due_date}
                  onChange={(e) => setDutyForm({ ...dutyForm, due_date: e.target.value })}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDutyModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-semibold rounded-lg text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingDuty}
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-sm flex items-center justify-center"
                >
                  {submittingDuty ? <Loader2 className="h-4 w-4 animate-spin" /> : "Assign Duty"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
