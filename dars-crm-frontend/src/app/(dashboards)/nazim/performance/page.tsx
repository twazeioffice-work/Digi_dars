"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { 
  CheckSquare, Calendar, Clock, CheckCircle2, ShieldCheck, Loader2, RefreshCw, Trophy, AlertTriangle 
} from "lucide-react";
import toast from "react-hot-toast";

interface Duty {
  id: string;
  center_id: string;
  title: string;
  description?: string;
  due_date: string;
  is_completed: boolean;
  completed_at?: string;
  created_at: string;
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

export default function NazimPerformancePage() {
  const [duties, setDuties] = useState<Duty[]>([]);
  const [loading, setLoading] = useState(true);
  const [completingId, setCompletingId] = useState<string | null>(null);

  const fetchDuties = async () => {
    try {
      const res = await api.get("/performance/duties");
      setDuties(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to load Nazim duties checklist"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDuties();
  }, []);

  const handleMarkComplete = async (dutyId: string) => {
    setCompletingId(dutyId);
    try {
      await api.patch(`/performance/duties/${dutyId}/complete`);
      toast.success("Administrative duty marked as completed!");
      fetchDuties();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to complete duty"));
    } finally {
      setCompletingId(null);
    }
  };

  const completedCount = duties.filter((d) => d.is_completed).length;
  const totalCount = duties.length;
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 100;

  return (
    <div className="p-8 space-y-8 bg-slate-50 min-h-screen">
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <CheckSquare className="h-8 w-8 text-emerald-600" /> Center Operational Duties & Score
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Complete assigned administrative tasks on time to boost your Center's 25% Nazim Duty rating in global rankings.
          </p>
        </div>

        <button
          onClick={fetchDuties}
          className="flex items-center gap-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold px-4 py-2.5 rounded-lg text-xs shadow-sm transition"
        >
          <RefreshCw className="h-4 w-4" /> Refresh Checklist
        </button>
      </div>

      {/* --- SUMMARY CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase text-slate-400">Total Duties Assigned</p>
            <p className="text-3xl font-black text-slate-900 mt-1">{totalCount}</p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <CheckSquare className="h-7 w-7" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase text-slate-400">Completed On-Time</p>
            <p className="text-3xl font-black text-emerald-600 mt-1">{completedCount}</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle2 className="h-7 w-7" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase text-slate-400">Nazim Duty Compliance Score</p>
            <p className="text-3xl font-black text-indigo-600 mt-1">{completionRate}%</p>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Trophy className="h-7 w-7" />
          </div>
        </div>
      </div>

      {/* --- COMPLIANCE NOTICE --- */}
      <div className="p-4 bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs rounded-xl font-medium flex items-center gap-2">
        <ShieldCheck className="h-5 w-5 text-indigo-600 shrink-0" />
        <span>
          <strong>Gamified Rating Active:</strong> Your Nazim Duty Score contributes <strong>25%</strong> directly to your Center's Global Institution Rank. Completing tasks before the due date avoids score penalties!
        </span>
      </div>

      {/* --- DUTIES CHECKLIST --- */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Administrative Operational Checklist</h2>
          <span className="text-xs font-semibold text-slate-400">
            {completedCount} of {totalCount} Completed
          </span>
        </div>

        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          </div>
        ) : duties.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-2">
            <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto" />
            <p className="font-semibold text-base">All clear! No pending duties assigned.</p>
            <p className="text-xs text-slate-400">Super Admin assigns operational duties for monthly compliance audits.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {duties.map((duty) => {
              const isOverdue = !duty.is_completed && new Date(duty.due_date) < new Date();
              return (
                <div
                  key={duty.id}
                  className={`p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${
                    duty.is_completed ? "bg-slate-50/50" : isOverdue ? "bg-rose-50/40" : "hover:bg-slate-50"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${
                        duty.is_completed ? "bg-emerald-500" : isOverdue ? "bg-rose-500" : "bg-amber-500"
                      }`} />
                      <h3 className={`text-base font-bold ${duty.is_completed ? "line-through text-slate-400" : "text-slate-900"}`}>
                        {duty.title}
                      </h3>
                      {isOverdue && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-rose-100 text-rose-700">
                          <AlertTriangle className="h-3 w-3" /> Overdue
                        </span>
                      )}
                    </div>
                    {duty.description && (
                      <p className="text-xs text-slate-500 pl-4">{duty.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-slate-400 pl-4 pt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" /> Due: {duty.due_date}
                      </span>
                      {duty.completed_at && (
                        <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                          <Clock className="h-3.5 w-3.5" /> Completed: {duty.completed_at}
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    {duty.is_completed ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="h-4 w-4" /> Completed
                      </span>
                    ) : (
                      <button
                        onClick={() => handleMarkComplete(duty.id)}
                        disabled={completingId === duty.id}
                        className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-4 py-2 rounded-lg shadow-sm transition"
                      >
                        {completingId === duty.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <CheckCircle2 className="h-4 w-4" /> Mark Complete
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
