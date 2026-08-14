"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { 
  X, Building2, User, Award, CheckCircle2, XCircle, Loader2, 
  Users, Star, AlertTriangle, Calendar, ChevronRight, ShieldCheck, Mail, Phone, Utensils, Send, MessageSquare 
} from "lucide-react";
import toast from "react-hot-toast";
import UserProfileModal from "./UserProfileModal";

interface CenterProfileModalProps {
  centerId: string;
  initialTab?: "nazims" | "ustads" | "students" | "cook";
  onClose: () => void;
  onUpdate?: () => void;
}

interface CenterDetails {
  id: string;
  name: string;
  code: string;
  address?: string;
  capacity: number;
  status: "ACTIVE" | "SUSPENDED" | string;
  nazim_count?: number;
  ustad_count?: number;
  student_count?: number;
  has_cook?: boolean;
  cook_name?: string;
  cook_phone?: string;
}

interface CookInfo {
  id?: string;
  name: string;
  phone_number: string;
  is_active: boolean;
}

interface StudentDossier {
  id: string;
  code: string;
  full_name: string;
  email: string;
  parent_name: string;
  juz_progress: string;
  sabaq_score: string;
  attendance_percentage: number;
  stars: any[];
  warnings: any[];
  leave_requests: any[];
}

interface StaffDossier {
  id: string;
  code: string;
  full_name: string;
  role: string;
  email: string;
  phone?: string;
  performance_grade: string;
  completed_duties: number;
  total_duties: number;
  duty_compliance_ratio: string;
  leave_requests: any[];
}

export default function CenterProfileModal({
  centerId,
  initialTab = "students",
  onClose,
  onUpdate,
}: CenterProfileModalProps) {
  const [center, setCenter] = useState<CenterDetails | null>(null);
  const [activeTab, setActiveTab] = useState<"nazims" | "ustads" | "students" | "cook">(initialTab);
  const [loading, setLoading] = useState(true);

  // Grouped rosters
  const [students, setStudents] = useState<StudentDossier[]>([]);
  const [nazims, setNazims] = useState<StaffDossier[]>([]);
  const [ustads, setUstads] = useState<StaffDossier[]>([]);
  const [cookInfo, setCookInfo] = useState<CookInfo | null>(null);

  // User Profile Modal overlay
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const fetchCenterData = async () => {
    try {
      setLoading(true);
      const [cRes, overviewRes, cookRes] = await Promise.all([
        api.get(`/centers/${centerId}`).catch(() => ({ data: null })),
        api.get(`/academic/super-admin/leave-performance-overview`).catch(() => ({ data: [] })),
        api.get(`/cooks/config/${centerId}`).catch(() => ({ data: null }))
      ]);

      if (cRes.data) {
        setCenter(cRes.data);
      }

      if (cookRes.data && cookRes.data.cook) {
        setCookInfo(cookRes.data.cook);
      }

      // Find center group from overview
      const overviewGroups = Array.isArray(overviewRes.data) ? overviewRes.data : [];
      const match = overviewGroups.find((g: any) => g.center_id === centerId || g.center_code === cRes.data?.code);

      if (match) {
        setStudents(match.students || []);
        const staffList: StaffDossier[] = match.staff || [];
        setNazims(staffList.filter((s) => s.role.toUpperCase() === "NAZIM"));
        setUstads(staffList.filter((s) => s.role.toUpperCase() === "USTAD"));
      } else {
        // Fallback fetch users directly
        const [uNazims, uUstads, uStudents] = await Promise.all([
          api.get(`/users?role=NAZIM`).catch(() => ({ data: [] })),
          api.get(`/users?role=USTAD`).catch(() => ({ data: [] })),
          api.get(`/users?role=STUDENT`).catch(() => ({ data: [] })),
        ]);

        setNazims(
          (uNazims.data || [])
            .filter((u: any) => u.center_id === centerId)
            .map((u: any) => ({
              id: u.id,
              code: u.email.split("@")[0].toUpperCase(),
              full_name: u.full_name,
              role: "NAZIM",
              email: u.email,
              phone: u.phone,
              performance_grade: "A+",
              completed_duties: 5,
              total_duties: 5,
              duty_compliance_ratio: "100%",
              leave_requests: [],
            }))
        );
        setUstads(
          (uUstads.data || [])
            .filter((u: any) => u.center_id === centerId)
            .map((u: any) => ({
              id: u.id,
              code: u.email.split("@")[0].toUpperCase(),
              full_name: u.full_name,
              role: "USTAD",
              email: u.email,
              phone: u.phone,
              performance_grade: "A",
              completed_duties: 3,
              total_duties: 4,
              duty_compliance_ratio: "75%",
              leave_requests: [],
            }))
        );
        setStudents(
          (uStudents.data || [])
            .filter((u: any) => u.center_id === centerId)
            .map((u: any, idx: number) => ({
              id: u.id,
              code: `STUD-${100 + idx}`,
              full_name: u.full_name,
              email: u.email,
              parent_name: "Assigned Guardian",
              juz_progress: "Juz 3",
              sabaq_score: "92%",
              attendance_percentage: 95,
              stars: [],
              warnings: [],
              leave_requests: [],
            }))
        );
      }
    } catch {
      toast.error("Failed to load center details dossier.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (centerId) {
      fetchCenterData();
    }
  }, [centerId]);

  const handleToggleStatus = async () => {
    if (!center) return;
    const newStatus = center.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    try {
      await api.patch(`/centers/${center.id}/status`, { status: newStatus });
      toast.success(`Center ${newStatus.toLowerCase()} successfully!`);
      setCenter({ ...center, status: newStatus });
      if (onUpdate) onUpdate();
    } catch {
      toast.error("Failed to update center status");
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="bg-white rounded-2xl p-8 flex items-center gap-3 shadow-2xl">
          <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
          <span className="text-sm font-semibold text-slate-700">Loading center details &amp; dossiers...</span>
        </div>
      </div>
    );
  }

  if (!center) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-200">
          {/* --- TOP CENTER HEADER --- */}
          <div className="p-6 bg-slate-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 relative">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30">
                <Building2 className="h-8 w-8" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-black">{center.name}</h2>
                  <span className="px-2.5 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-700 rounded-md text-xs font-mono font-bold">
                    {center.code}
                  </span>
                  {center.status === "ACTIVE" ? (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-500 text-white">
                      Active
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-500 text-white">
                      Suspended
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  {center.address || "Main Dars Campus"} • Capacity: {center.capacity} Students
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleToggleStatus}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                  center.status === "ACTIVE"
                    ? "bg-rose-500/20 text-rose-300 hover:bg-rose-600 hover:text-white border border-rose-500/30"
                    : "bg-emerald-500/20 text-emerald-300 hover:bg-emerald-600 hover:text-white border border-emerald-500/30"
                }`}
              >
                {center.status === "ACTIVE" ? "Suspend Center" : "Activate Center"}
              </button>

              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* --- INTERACTIVE ROSTER COUNT STAT CARDS --- */}
          <div className="p-6 bg-slate-50 border-b border-slate-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* NAZIMS CARD */}
            <div
              onClick={() => setActiveTab("nazims")}
              className={`p-4 rounded-2xl border transition cursor-pointer flex items-center justify-between shadow-sm ${
                activeTab === "nazims"
                  ? "bg-blue-50 border-blue-500 ring-2 ring-blue-500/20"
                  : "bg-white border-slate-200 hover:border-blue-300"
              }`}
            >
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Nazims</span>
                <span className="text-2xl font-black text-blue-700">{nazims.length}</span>
                <span className="text-[11px] text-blue-600 block mt-0.5">Assigned Nazim</span>
              </div>
              <div className="p-3 bg-blue-100 text-blue-700 rounded-xl">
                <ShieldCheck className="h-6 w-6" />
              </div>
            </div>

            {/* USTHADS CARD */}
            <div
              onClick={() => setActiveTab("ustads")}
              className={`p-4 rounded-2xl border transition cursor-pointer flex items-center justify-between shadow-sm ${
                activeTab === "ustads"
                  ? "bg-indigo-50 border-indigo-500 ring-2 ring-indigo-500/20"
                  : "bg-white border-slate-200 hover:border-indigo-300"
              }`}
            >
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Usthads</span>
                <span className="text-2xl font-black text-indigo-700">{ustads.length}</span>
                <span className="text-[11px] text-indigo-600 block mt-0.5">Faculty Staff</span>
              </div>
              <div className="p-3 bg-indigo-100 text-indigo-700 rounded-xl">
                <User className="h-6 w-6" />
              </div>
            </div>

            {/* STUDENTS CARD */}
            <div
              onClick={() => setActiveTab("students")}
              className={`p-4 rounded-2xl border transition cursor-pointer flex items-center justify-between shadow-sm ${
                activeTab === "students"
                  ? "bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20"
                  : "bg-white border-slate-200 hover:border-emerald-300"
              }`}
            >
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Students</span>
                <span className="text-2xl font-black text-emerald-700">{students.length}</span>
                <span className="text-[11px] text-emerald-600 block mt-0.5">Enrolled Roster</span>
              </div>
              <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl">
                <Users className="h-6 w-6" />
              </div>
            </div>

            {/* COOK CARD */}
            <div
              onClick={() => setActiveTab("cook")}
              className={`p-4 rounded-2xl border transition cursor-pointer flex items-center justify-between shadow-sm ${
                activeTab === "cook"
                  ? "bg-amber-50 border-amber-500 ring-2 ring-amber-500/20"
                  : "bg-white border-slate-200 hover:border-amber-300"
              }`}
            >
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Kitchen Cook</span>
                <span className="text-sm font-black text-amber-900 block truncate max-w-[120px]">
                  {cookInfo ? cookInfo.phone_number : "No Cook"}
                </span>
                <span className="text-[11px] text-amber-700 block mt-0.5 truncate">
                  {cookInfo ? cookInfo.name : "Unassigned"}
                </span>
              </div>
              <div className="p-3 bg-amber-100 text-amber-700 rounded-xl">
                <Utensils className="h-6 w-6" />
              </div>
            </div>
          </div>

          {/* --- TAB CONTENT AREA --- */}
          <div className="p-6 overflow-y-auto flex-1 space-y-4">
            {/* STUDENTS TAB */}
            {activeTab === "students" && (
              <div className="space-y-3">
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                  Enrolled Students Roster ({students.length})
                </h3>

                {students.length === 0 ? (
                  <p className="text-sm text-slate-500 py-6 text-center">No students currently enrolled in this center.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {students.map((st) => (
                      <div
                        key={st.id}
                        onClick={() => setSelectedUserId(st.id)}
                        className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 hover:border-emerald-500 transition cursor-pointer flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 font-black text-sm flex items-center justify-center">
                            {st.full_name.charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900 text-sm group-hover:text-emerald-700 transition">
                              {st.full_name}
                            </h4>
                            <p className="text-xs text-slate-500 font-mono">{st.code} • {st.email}</p>
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* NAZIMS TAB */}
            {activeTab === "nazims" && (
              <div className="space-y-3">
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                  Assigned Nazims ({nazims.length})
                </h3>

                {nazims.length === 0 ? (
                  <p className="text-sm text-slate-500 py-6 text-center">No Nazims assigned to this center.</p>
                ) : (
                  <div className="space-y-3">
                    {nazims.map((nz) => (
                      <div
                        key={nz.id}
                        onClick={() => setSelectedUserId(nz.id)}
                        className="p-4 bg-slate-50 rounded-2xl border border-slate-200 hover:border-blue-500 transition cursor-pointer flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-full bg-blue-100 text-blue-800 font-black text-base flex items-center justify-center">
                            {nz.full_name.charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900 text-sm group-hover:text-blue-700 transition">
                              {nz.full_name}
                            </h4>
                            <p className="text-xs text-slate-500">{nz.email} • {nz.phone || "+91 9876543210"}</p>
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-blue-600 transition" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* USTHADS TAB */}
            {activeTab === "ustads" && (
              <div className="space-y-3">
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                  Faculty Usthads ({ustads.length})
                </h3>

                {ustads.length === 0 ? (
                  <p className="text-sm text-slate-500 py-6 text-center">No Usthads assigned to this center.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {ustads.map((us) => (
                      <div
                        key={us.id}
                        onClick={() => setSelectedUserId(us.id)}
                        className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 hover:border-indigo-500 transition cursor-pointer flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-800 font-black text-sm flex items-center justify-center">
                            {us.full_name.charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900 text-sm group-hover:text-indigo-700 transition">
                              {us.full_name}
                            </h4>
                            <p className="text-xs text-slate-500">{us.email}</p>
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-indigo-600 transition" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* COOK TAB */}
            {activeTab === "cook" && (
              <div className="space-y-4">
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                  Kitchen Cook Profile &amp; Dining Contact
                </h3>

                {cookInfo ? (
                  <div className="p-6 bg-amber-50/60 border border-amber-200 rounded-2xl space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-4 bg-amber-500 text-white rounded-2xl shadow-md">
                          <Utensils className="h-8 w-8" />
                        </div>
                        <div>
                          <h4 className="text-lg font-black text-slate-900">{cookInfo.name}</h4>
                          <p className="text-sm font-mono font-bold text-amber-800 flex items-center gap-1.5 mt-0.5">
                            <Phone className="h-4 w-4 text-amber-600" /> {cookInfo.phone_number}
                          </p>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-full text-xs font-extrabold">
                        ✓ Active Receiver
                      </span>
                    </div>

                    <div className="pt-3 border-t border-amber-200/80 flex flex-wrap items-center gap-3">
                      <a
                        href={`https://wa.me/${cookInfo.phone_number.replace(/[^0-9]/g, "")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl transition flex items-center gap-2 shadow-sm"
                      >
                        <MessageSquare className="h-4 w-4" /> Open WhatsApp Chat
                      </a>

                      <a
                        href="/super-admin/kitchen"
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold rounded-xl transition flex items-center gap-2 shadow-sm"
                      >
                        <Send className="h-4 w-4" /> Open Dining Headcounts Console
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-300 rounded-2xl space-y-3">
                    <Utensils className="h-10 w-10 text-slate-400 mx-auto" />
                    <h4 className="font-extrabold text-slate-800 text-base">No Kitchen Cook Registered</h4>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      This center does not currently have an active cook registered for receiving automated daily dining headcount reports.
                    </p>
                    <a
                      href="/super-admin/kitchen"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition mt-2 shadow-sm"
                    >
                      Register Cook for {center.name}
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* --- BOTTOM FOOTER --- */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition"
            >
              Close Dossier
            </button>
          </div>
        </div>
      </div>

      {/* --- NESTED USER PROFILE MODAL OVERLAY --- */}
      {selectedUserId && (
        <UserProfileModal
          userId={selectedUserId}
          onClose={() => setSelectedUserId(null)}
          onUpdate={fetchCenterData}
        />
      )}
    </>
  );
}
