"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { 
  X, User, Mail, Phone, MapPin, AlertCircle, Building2, Image as ImageIcon, 
  Calendar, CheckCircle, XCircle, AlertTriangle, UserX, UserCheck, ShieldAlert,
  Loader2, Plus, HeartHandshake
} from "lucide-react";
import toast from "react-hot-toast";

interface UserProfileModalProps {
  userId: string;
  onClose: () => void;
  onUpdate?: () => void;
}

interface UserDetail {
  id: string;
  full_name: string;
  email: string;
  role: string;
  phone?: string;
  address?: string;
  emergency_contact?: string;
  gov_id_card_url?: string;
  is_active: boolean;
  center_id?: string;
  student_profile?: {
    is_zakat_eligible: boolean;
    address?: string;
    emergency_contact?: string;
    gov_id_card_url?: string;
  };
}

interface LeaveRequestItem {
  id: string;
  student_id: string;
  start_date: string;
  end_date: string;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
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

const getMediaUrl = (url?: string) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  if (cleanPath.startsWith('/uploads/')) {
    return `/api/v1${cleanPath}`;
  }
  return cleanPath;
};

export default function UserProfileModal({ userId, onClose, onUpdate }: UserProfileModalProps) {
  const [user, setUser] = useState<UserDetail | null>(null);
  const [leaves, setLeaves] = useState<LeaveRequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"profile" | "leaves" | "actions">("profile");

  // Action states
  const [actionLoading, setActionLoading] = useState(false);
  const [showApplyLeave, setShowApplyLeave] = useState(false);
  const [leaveForm, setLeaveForm] = useState({
    start_date: "",
    end_date: "",
    reason: "",
  });

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const [uRes, lRes] = await Promise.all([
        api.get(`/users/${userId}`),
        api.get(`/academic/leave-requests/user/${userId}`).catch(() => ({ data: [] }))
      ]);
      setUser(uRes.data);
      setLeaves(Array.isArray(lRes.data) ? lRes.data : []);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to load user profile details"));
      onClose();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) fetchUserData();
  }, [userId]);

  // 1. Toggle Active / Suspension Status
  const handleToggleStatus = async () => {
    if (!user) return;
    const newStatus = !user.is_active;
    setActionLoading(true);
    try {
      await api.patch(`/users/${user.id}/status`, { is_active: newStatus });
      toast.success(newStatus ? "Account re-activated successfully!" : "Account suspended!");
      setUser({ ...user, is_active: newStatus });
      if (onUpdate) onUpdate();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to update user status"));
    } finally {
      setActionLoading(false);
    }
  };

  // 2. Dismiss / Remove User
  const handleDismissUser = async () => {
    if (!user) return;
    if (!confirm(`Are you sure you want to DISMISS / DEACTIVATE ${user.full_name}? This action will prevent access.`)) {
      return;
    }
    setActionLoading(true);
    try {
      await api.delete(`/users/${user.id}`);
      toast.success(`${user.full_name} has been dismissed/deactivated.`);
      if (onUpdate) onUpdate();
      onClose();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to dismiss user"));
    } finally {
      setActionLoading(false);
    }
  };

  // 3. Submit Leave Application
  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setActionLoading(true);
    try {
      await api.post("/academic/leave-requests", {
        student_id: user.id,
        start_date: leaveForm.start_date,
        end_date: leaveForm.end_date,
        reason: leaveForm.reason,
      });
      toast.success("Leave application submitted!");
      setShowApplyLeave(false);
      setLeaveForm({ start_date: "", end_date: "", reason: "" });
      fetchUserData();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to submit leave application"));
    } finally {
      setActionLoading(false);
    }
  };

  // 4. Approve or Reject Leave
  const handleReviewLeave = async (leaveId: string, status: "APPROVED" | "REJECTED") => {
    setActionLoading(true);
    try {
      await api.patch(`/academic/leave-requests/${leaveId}/approve`, { status });
      toast.success(`Leave request ${status.toLowerCase()}!`);
      fetchUserData();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to update leave status"));
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="bg-white rounded-2xl p-8 flex items-center gap-3 shadow-2xl">
          <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
          <span className="text-sm font-semibold text-slate-700">Loading profile...</span>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const initial = (user.full_name || "U").charAt(0).toUpperCase();
  const emergency = user.emergency_contact || user.student_profile?.emergency_contact;
  const address = user.address || user.student_profile?.address;
  const idCard = user.gov_id_card_url || user.student_profile?.gov_id_card_url;
  const isZakat = user.student_profile?.is_zakat_eligible;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* --- HEADER --- */}
        <div className="p-6 bg-slate-900 text-white flex items-start justify-between relative">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white font-black text-xl flex items-center justify-center shadow-inner border border-emerald-400/30">
              {initial}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold">{user.full_name}</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-wide">
                  {user.role}
                </span>
                {user.is_active ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500 text-white">
                    Active
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500 text-white">
                    Suspended
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 mt-1 flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-slate-400" /> {user.email}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* --- TABS --- */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 gap-2 pt-2">
          <button
            onClick={() => setActiveTab("profile")}
            className={`pb-3 px-4 text-xs font-bold transition border-b-2 ${
              activeTab === "profile"
                ? "border-emerald-600 text-emerald-700"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            👤 Profile Info
          </button>
          <button
            onClick={() => setActiveTab("leaves")}
            className={`pb-3 px-4 text-xs font-bold transition border-b-2 ${
              activeTab === "leaves"
                ? "border-emerald-600 text-emerald-700"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            📝 Leave Applications ({leaves.length})
          </button>
          <button
            onClick={() => setActiveTab("actions")}
            className={`pb-3 px-4 text-xs font-bold transition border-b-2 ${
              activeTab === "actions"
                ? "border-rose-600 text-rose-700"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            ⚠️ Actions & Suspension
          </button>
        </div>

        {/* --- BODY CONTENT --- */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* TAB 1: PROFILE INFO */}
          {activeTab === "profile" && (
            <div className="space-y-4 text-xs text-slate-600">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-1">Phone Number</p>
                  <p className="font-semibold text-slate-800 flex items-center gap-1.5">
                    <Phone className="h-4 w-4 text-slate-400" /> {user.phone || "No phone provided"}
                  </p>
                </div>

                <div className="p-3.5 bg-rose-50/50 rounded-xl border border-rose-100">
                  <p className="text-[11px] font-bold text-rose-500 uppercase tracking-wide mb-1">Emergency Contact</p>
                  <p className="font-semibold text-rose-700 flex items-center gap-1.5">
                    <AlertCircle className="h-4 w-4 text-rose-500" /> {emergency || "Not provided"}
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 md:col-span-2">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-1">Residential Address</p>
                  <p className="font-medium text-slate-700 flex items-start gap-1.5">
                    <MapPin className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" /> {address || "No residential address added."}
                  </p>
                </div>

                {isZakat !== undefined && (
                  <div className="p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-100">
                    <p className="text-[11px] font-bold text-emerald-700 uppercase tracking-wide mb-1">Zakat Eligibility</p>
                    {isZakat ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800">
                        <HeartHandshake className="h-4 w-4 text-emerald-600" /> Eligible for Financial Assistance
                      </span>
                    ) : (
                      <span className="text-xs text-slate-500">Standard Student</span>
                    )}
                  </div>
                )}

                <div className="p-3.5 bg-indigo-50/60 rounded-xl border border-indigo-100">
                  <p className="text-[11px] font-bold text-indigo-700 uppercase tracking-wide mb-1">Government ID Proof</p>
                  {idCard ? (
                    <a
                      href={getMediaUrl(idCard)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 bg-white border border-indigo-200 px-3 py-1.5 rounded-lg shadow-sm hover:bg-indigo-50 transition"
                    >
                      <ImageIcon className="h-4 w-4" /> View ID Card Document
                    </a>
                  ) : (
                    <span className="text-slate-400 italic">No Govt ID photo uploaded</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: LEAVE APPLICATIONS */}
          {activeTab === "leaves" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-800">Leave History (Chutti)</h3>
                <button
                  onClick={() => setShowApplyLeave(!showApplyLeave)}
                  className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition"
                >
                  <Plus className="h-3.5 w-3.5" /> Apply New Leave
                </button>
              </div>

              {showApplyLeave && (
                <form onSubmit={handleApplyLeave} className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200 space-y-3">
                  <h4 className="text-xs font-bold text-emerald-900">Submit Leave Request for {user.full_name}</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Start Date</label>
                      <input
                        type="date"
                        required
                        className="w-full p-2 border border-slate-300 rounded-lg text-xs bg-white"
                        value={leaveForm.start_date}
                        onChange={(e) => setLeaveForm({ ...leaveForm, start_date: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">End Date</label>
                      <input
                        type="date"
                        required
                        className="w-full p-2 border border-slate-300 rounded-lg text-xs bg-white"
                        value={leaveForm.end_date}
                        onChange={(e) => setLeaveForm({ ...leaveForm, end_date: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Reason for Leave</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Urgent family travel / Medical illness"
                      className="w-full p-2 border border-slate-300 rounded-lg text-xs bg-white"
                      value={leaveForm.reason}
                      onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowApplyLeave(false)}
                      className="px-3 py-1.5 bg-slate-200 text-slate-700 text-xs font-bold rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={actionLoading}
                      className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg flex items-center gap-1"
                    >
                      {actionLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Submit Request"}
                    </button>
                  </div>
                </form>
              )}

              {leaves.length === 0 ? (
                <div className="p-8 bg-slate-50 rounded-xl border border-slate-200 text-center text-slate-400 space-y-1">
                  <Calendar className="h-8 w-8 mx-auto text-slate-300" />
                  <p className="text-xs font-semibold">No leave applications submitted yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {leaves.map((l) => (
                    <div key={l.id} className="p-3.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">
                            {l.start_date} to {l.end_date}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            l.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                            l.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {l.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">{l.reason}</p>
                      </div>

                      {l.status === 'PENDING' && (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleReviewLeave(l.id, "APPROVED")}
                            disabled={actionLoading}
                            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs px-2.5 py-1 rounded-md flex items-center gap-1 transition"
                          >
                            <CheckCircle className="h-3.5 w-3.5 text-emerald-600" /> Approve
                          </button>
                          <button
                            onClick={() => handleReviewLeave(l.id, "REJECTED")}
                            disabled={actionLoading}
                            className="bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs px-2.5 py-1 rounded-md flex items-center gap-1 transition"
                          >
                            <XCircle className="h-3.5 w-3.5 text-rose-600" /> Reject
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ACTIONS & SUSPENSION */}
          {activeTab === "actions" && (
            <div className="space-y-4 text-xs">
              {/* 1. SUSPENSION TOGGLE */}
              <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
                      <AlertTriangle className="h-4 w-4 text-amber-600" /> Account Suspension Status
                    </h4>
                    <p className="text-xs text-slate-600 mt-1">
                      {user.is_active
                        ? "Currently ACTIVE. Suspending will lock access immediately."
                        : "Currently SUSPENDED. Re-activating will restore login access."}
                    </p>
                  </div>
                  <button
                    onClick={handleToggleStatus}
                    disabled={actionLoading}
                    className={`font-bold text-xs px-4 py-2 rounded-xl text-white shadow-sm flex items-center gap-1.5 transition ${
                      user.is_active
                        ? "bg-amber-600 hover:bg-amber-700"
                        : "bg-emerald-600 hover:bg-emerald-700"
                    }`}
                  >
                    {actionLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : user.is_active ? (
                      <>
                        <UserX className="h-4 w-4" /> Suspend Account
                      </>
                    ) : (
                      <>
                        <UserCheck className="h-4 w-4" /> Re-activate Account
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* 2. DISMISSAL / REMOVAL */}
              <div className="p-4 bg-rose-50/70 border border-rose-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-rose-900 flex items-center gap-1.5 text-sm">
                      <ShieldAlert className="h-4 w-4 text-rose-600" /> Staff / Student Dismissal
                    </h4>
                    <p className="text-xs text-rose-700 mt-1">
                      Permanently dismiss or remove {user.full_name} from the active center registry.
                    </p>
                  </div>
                  <button
                    onClick={handleDismissUser}
                    disabled={actionLoading}
                    className="font-bold text-xs px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-sm flex items-center gap-1.5 transition"
                  >
                    {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Dismiss User"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
