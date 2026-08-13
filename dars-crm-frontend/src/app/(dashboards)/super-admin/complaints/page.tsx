"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { 
  ShieldCheck, Lock, AlertTriangle, Send, CheckCircle2, RefreshCw, 
  Loader2, UserCheck, MessageSquare, Filter, Building2 
} from "lucide-react";
import toast from "react-hot-toast";

interface ComplaintItem {
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
  assigned_nazim_name?: string;
  super_admin_notes?: string;
  nazim_notes?: string;
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

export default function SuperAdminComplaintsPage() {
  const [complaints, setComplaints] = useState<ComplaintItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [selectedComplaint, setSelectedComplaint] = useState<ComplaintItem | null>(null);
  const [showRouteModal, setShowRouteModal] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchComplaints = async () => {
    try {
      const res = await api.get("/complaints/super-admin");
      setComplaints(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to load complaint inbox"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleRouteToNazim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint) return;

    setSubmitting(true);
    try {
      await api.patch(`/complaints/${selectedComplaint.id}/route-to-nazim`, {
        super_admin_notes: notes,
      });
      toast.success("Complaint routed to local Nazim for resolution!");
      setShowRouteModal(false);
      setSelectedComplaint(null);
      setNotes("");
      fetchComplaints();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to route complaint"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleResolveDirectly = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint) return;

    setSubmitting(true);
    try {
      await api.patch(`/complaints/${selectedComplaint.id}/resolve-super-admin`, {
        super_admin_notes: notes,
      });
      toast.success("Complaint resolved directly by Super Admin HQ!");
      setShowResolveModal(false);
      setSelectedComplaint(null);
      setNotes("");
      fetchComplaints();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to resolve complaint"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-8 space-y-8 bg-slate-50 min-h-screen">
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="h-8 w-8 text-rose-600" /> Direct-to-Super-Admin Complaint Triage Inbox
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Secure confidential pipeline from Student Kiosks across all Centers. Complaints about Nazims remain strictly hidden from local admin consoles.
          </p>
        </div>

        <button
          onClick={fetchComplaints}
          className="flex items-center gap-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold px-4 py-2.5 rounded-lg text-xs shadow-sm transition"
        >
          <RefreshCw className="h-4 w-4" /> Refresh Inbox
        </button>
      </div>

      {/* --- CONFIDENTIALITY BANNER --- */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-rose-500/20 text-rose-400 rounded-xl border border-rose-500/30">
            <Lock className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Strict Routing Protocol Active</h2>
            <p className="text-xs text-slate-300">
              Standard facility issues can be <strong>Routed to Nazim</strong>. Sensitive Nazim complaints remain <strong>Direct-to-HQ Only</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* --- COMPLAINTS TABLE --- */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Student Complaints</h2>
          <span className="text-xs font-semibold text-slate-400">Total: {complaints.length}</span>
        </div>

        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-rose-600" />
          </div>
        ) : complaints.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-2">
            <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto" />
            <p className="font-semibold text-base">No pending complaints!</p>
            <p className="text-xs text-slate-400">All student concerns from Kiosks have been addressed.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {complaints.map((item) => {
              const isNazimIssue = item.category.toLowerCase().includes("nazim");
              return (
                <div
                  key={item.id}
                  className={`p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${
                    isNazimIssue ? "bg-rose-50/30 border-l-4 border-l-rose-500" : "hover:bg-slate-50"
                  }`}
                >
                  <div className="space-y-2 max-w-2xl">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full ${
                        isNazimIssue ? "bg-rose-100 text-rose-800 font-bold" : "bg-slate-100 text-slate-700"
                      }`}>
                        Category: {item.category}
                      </span>

                      {isNazimIssue && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-slate-900 text-rose-400 font-mono">
                          <Lock className="h-3 w-3" /> Confidential HQ Only
                        </span>
                      )}

                      <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full ${
                        item.status === "pending_super_admin"
                          ? "bg-amber-100 text-amber-800"
                          : item.status === "assigned_to_nazim"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-emerald-100 text-emerald-800"
                      }`}>
                        {item.status.replace(/_/g, " ")}
                      </span>
                    </div>

                    <p className="text-sm font-semibold text-slate-900 leading-relaxed">{item.description}</p>

                    <div className="flex items-center gap-4 text-xs text-slate-400 flex-wrap">
                      <span className="flex items-center gap-1 font-bold text-slate-600">
                        <Building2 className="h-3.5 w-3.5" /> {item.center_name || "Center"}
                      </span>
                      <span>Student: <strong>{item.is_anonymous ? "[ANONYMOUS]" : item.student_name}</strong></span>
                      <span>Date: {new Date(item.created_at).toLocaleDateString()}</span>
                    </div>

                    {item.super_admin_notes && (
                      <p className="text-xs text-indigo-700 bg-indigo-50 p-2.5 rounded-lg border border-indigo-100 font-medium">
                        <strong>Super Admin Note:</strong> {item.super_admin_notes}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {item.status === "pending_super_admin" && (
                      <>
                        {!isNazimIssue && (
                          <button
                            onClick={() => {
                              setSelectedComplaint(item);
                              setShowRouteModal(true);
                            }}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-3.5 py-2 rounded-lg shadow-sm transition"
                          >
                            Route to Nazim
                          </button>
                        )}

                        <button
                          onClick={() => {
                            setSelectedComplaint(item);
                            setShowResolveModal(true);
                          }}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-3.5 py-2 rounded-lg shadow-sm transition"
                        >
                          Resolve Directly
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* --- MODAL: ROUTE TO NAZIM --- */}
      {showRouteModal && selectedComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <h2 className="text-xl font-bold text-slate-900">Route Complaint to Local Nazim</h2>
            <p className="text-xs text-slate-500">
              Assigning this standard facility/food complaint to the local Nazim console for branch resolution.
            </p>
            <form onSubmit={handleRouteToNazim} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Super Admin Instructions (Optional)</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Inspect mess food quality and submit action report..."
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRouteModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-semibold rounded-lg text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-sm flex items-center justify-center"
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm Route"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: RESOLVE DIRECTLY --- */}
      {showResolveModal && selectedComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <h2 className="text-xl font-bold text-slate-900">Resolve Complaint Directly (HQ)</h2>
            <p className="text-xs text-slate-500">
              Resolving sensitive or Nazim complaint directly without routing to local branch console.
            </p>
            <form onSubmit={handleResolveDirectly} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Resolution Action &amp; Notes *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Contacted center management directly and initiated administrative audit..."
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowResolveModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-semibold rounded-lg text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-sm flex items-center justify-center"
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Mark Resolved"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
