"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { 
  ShieldCheck, Lock, AlertCircle, Send, CheckCircle2, RefreshCw, 
  Loader2, UserCheck, MessageSquare, Clock, Building2, FileText, CheckCircle
} from "lucide-react";
import toast from "react-hot-toast";

interface NazimComplaintItem {
  id: string;
  center_id: string;
  center_name?: string;
  student_id: string;
  student_name?: string;
  category: string;
  description: string;
  is_anonymous: boolean;
  status: string;
  assigned_to_nazim_id?: string;
  super_admin_notes?: string;
  nazim_notes?: string;
  created_at: string;
  updated_at?: string;
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

export default function NazimComplaintsPage() {
  const [complaints, setComplaints] = useState<NazimComplaintItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTabFilter, setActiveTabFilter] = useState<"all" | "pending" | "resolved">("all");

  // Resolve Modal State
  const [selectedComplaint, setSelectedComplaint] = useState<NazimComplaintItem | null>(null);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [nazimNotes, setNazimNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const res = await api.get("/complaints/nazim");
      setComplaints(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to load Nazim complaints inbox"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleResolveComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint || !nazimNotes.trim()) {
      toast.error("Please provide resolution notes before marking resolved.");
      return;
    }

    setSubmitting(true);
    try {
      await api.patch(`/complaints/${selectedComplaint.id}/resolve-nazim`, {
        nazim_notes: nazimNotes,
      });
      toast.success("Complaint resolution logged successfully!");
      setShowResolveModal(false);
      setSelectedComplaint(null);
      setNazimNotes("");
      fetchComplaints();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to resolve complaint"));
    } finally {
      setSubmitting(false);
    }
  };

  const filteredComplaints = complaints.filter((c) => {
    if (activeTabFilter === "pending") return c.status === "assigned_to_nazim";
    if (activeTabFilter === "resolved") return c.status === "resolved_by_nazim";
    return true;
  });

  const pendingCount = complaints.filter((c) => c.status === "assigned_to_nazim").length;
  const resolvedCount = complaints.filter((c) => c.status === "resolved_by_nazim").length;

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 md:space-y-8 bg-slate-50 min-h-screen">
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-2">
            <MessageSquare className="h-7 w-7 text-emerald-600" /> Center Complaints &amp; Action Inbox
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Assigned student concerns, hostel facility feedback, and Super Admin routed tickets for your center.
          </p>
        </div>

        <button
          onClick={fetchComplaints}
          disabled={loading}
          className="flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold px-4 py-2.5 rounded-xl text-xs shadow-sm transition"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin text-emerald-600" : ""}`} /> Refresh Inbox
        </button>
      </div>

      {/* --- INFO / CONFIDENTIALITY BANNER --- */}
      <div className="bg-slate-900 text-white p-5 sm:p-6 rounded-2xl border border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30 flex-shrink-0">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-white">Nazim Branch Console Active</h2>
            <p className="text-xs text-slate-300">
              Only student complaints routed by Super Admin HQ or assigned to your branch appear here.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="bg-slate-800 px-3.5 py-1.5 rounded-lg border border-slate-700 text-center flex-1 sm:flex-initial">
            <span className="text-[10px] text-slate-400 font-semibold block uppercase">Action Needed</span>
            <span className="text-base font-black text-amber-400">{pendingCount}</span>
          </div>
          <div className="bg-slate-800 px-3.5 py-1.5 rounded-lg border border-slate-700 text-center flex-1 sm:flex-initial">
            <span className="text-[10px] text-slate-400 font-semibold block uppercase">Resolved</span>
            <span className="text-base font-black text-emerald-400">{resolvedCount}</span>
          </div>
        </div>
      </div>

      {/* --- FILTER TABS & MAIN TABLE --- */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4">
        <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
            <button
              onClick={() => setActiveTabFilter("all")}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition ${
                activeTabFilter === "all" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              All ({complaints.length})
            </button>
            <button
              onClick={() => setActiveTabFilter("pending")}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition ${
                activeTabFilter === "pending" ? "bg-amber-500 text-white shadow-sm" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Pending ({pendingCount})
            </button>
            <button
              onClick={() => setActiveTabFilter("resolved")}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition ${
                activeTabFilter === "resolved" ? "bg-emerald-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Resolved ({resolvedCount})
            </button>
          </div>

          <span className="text-xs font-semibold text-slate-400">
            Showing {filteredComplaints.length} of {complaints.length} tickets
          </span>
        </div>

        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          </div>
        ) : filteredComplaints.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-2">
            <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto" />
            <p className="font-bold text-base text-slate-800">No complaints found</p>
            <p className="text-xs text-slate-400">
              {activeTabFilter === "all"
                ? "No student complaints have been assigned to your center."
                : `No ${activeTabFilter} complaints in your queue.`}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredComplaints.map((item) => {
              const isResolved = item.status === "resolved_by_nazim" || item.status === "resolved_by_super_admin";
              return (
                <div
                  key={item.id}
                  className={`p-5 sm:p-6 flex flex-col md:flex-row md:items-start justify-between gap-4 transition-colors ${
                    isResolved ? "bg-slate-50/50" : "bg-white border-l-4 border-l-amber-500"
                  }`}
                >
                  <div className="space-y-2.5 max-w-3xl flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                        Category: {item.category}
                      </span>

                      <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full ${
                        isResolved ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                      }`}>
                        {item.status.replace(/_/g, " ")}
                      </span>

                      {item.is_anonymous && (
                        <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full bg-slate-800 text-slate-200">
                          Anonymous Student
                        </span>
                      )}
                    </div>

                    <p className="text-sm font-semibold text-slate-900 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                      &quot;{item.description}&quot;
                    </p>

                    <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
                      <span>Student: <strong>{item.is_anonymous ? "[ANONYMOUS STUDENT]" : (item.student_name || "Student")}</strong></span>
                      <span>Filed: {new Date(item.created_at).toLocaleDateString()}</span>
                    </div>

                    {item.super_admin_notes && (
                      <div className="text-xs text-indigo-800 bg-indigo-50 p-3 rounded-xl border border-indigo-100 font-medium space-y-0.5">
                        <strong className="block font-bold text-indigo-900">📌 Super Admin HQ Instruction:</strong>
                        <p>{item.super_admin_notes}</p>
                      </div>
                    )}

                    {item.nazim_notes && (
                      <div className="text-xs text-emerald-800 bg-emerald-50 p-3 rounded-xl border border-emerald-100 font-medium space-y-0.5">
                        <strong className="block font-bold text-emerald-900">✅ Your Resolution Note:</strong>
                        <p>{item.nazim_notes}</p>
                      </div>
                    )}
                  </div>

                  <div className="shrink-0 flex items-center md:items-start pt-2 md:pt-0">
                    {!isResolved ? (
                      <button
                        onClick={() => {
                          setSelectedComplaint(item);
                          setNazimNotes("");
                          setShowResolveModal(true);
                        }}
                        className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md shadow-emerald-900/20 transition flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle className="h-4 w-4" /> Resolve Ticket
                      </button>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                        <CheckCircle2 className="h-4 w-4" /> Resolved
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* --- RESOLVE COMPLAINT MODAL --- */}
      {showResolveModal && selectedComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-lg shadow-2xl space-y-5 border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-xl font-black text-slate-900">Resolve Complaint Ticket</h2>
                <p className="text-xs text-slate-500">Category: {selectedComplaint.category}</p>
              </div>
              <button
                onClick={() => setShowResolveModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs text-slate-700 font-medium">
              <strong>Student Concern:</strong> &quot;{selectedComplaint.description}&quot;
            </div>

            <form onSubmit={handleResolveComplaint} className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1.5">
                  Action Taken &amp; Resolution Notes *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe how this issue was inspected and resolved (e.g. Inspected mess kitchen and replaced cook staff, or fixed bathroom pipe)..."
                  className="w-full p-3.5 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
                  value={nazimNotes}
                  onChange={(e) => setNazimNotes(e.target.value)}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowResolveModal(false)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !nazimNotes.trim()}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-1.5 transition disabled:opacity-50"
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" /> Save &amp; Mark Resolved
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
