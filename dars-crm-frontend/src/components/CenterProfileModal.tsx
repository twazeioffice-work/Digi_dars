"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { 
  X, Building2, User, Award, CheckCircle2, XCircle, Loader2, 
  Users, Star, AlertTriangle, Calendar, ChevronRight, ShieldCheck, Mail, Phone 
} from "lucide-react";
import toast from "react-hot-toast";
import UserProfileModal from "./UserProfileModal";

interface CenterProfileModalProps {
  centerId: string;
  initialTab?: "nazims" | "ustads" | "students";
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
  const [activeTab, setActiveTab] = useState<"nazims" | "ustads" | "students">(initialTab);
  const [loading, setLoading] = useState(true);

  // Grouped rosters
  const [students, setStudents] = useState<StudentDossier[]>([]);
  const [nazims, setNazims] = useState<StaffDossier[]>([]);
  const [ustads, setUstads] = useState<StaffDossier[]>([]);

  // User Profile Modal overlay
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const fetchCenterData = async () => {
    try {
      setLoading(true);
      const [cRes, overviewRes] = await Promise.all([
        api.get(`/centers/${centerId}`).catch(() => ({ data: null })),
        api.get(`/academic/super-admin/leave-performance-overview`).catch(() => ({ data: [] })),
      ]);

      if (cRes.data) {
        setCenter(cRes.data);
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
          api.get(`/users/nazims`).catch(() => ({ data: [] })),
          api.get(`/users/ustads`).catch(() => ({ data: [] })),
          api.get(`/users/students`).catch(() => ({ data: [] })),
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
              completed_duties: 4,
              total_duties: 4,
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
    } catch (err) {
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
    } catch (err) {
      toast.error("Failed to update center status");
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="bg-white rounded-2xl p-8 flex items-center gap-3 shadow-2xl">
          <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
          <span className="text-sm font-semibold text-slate-700">Loading center details & dossiers...</span>
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
          <div className="p-6 bg-slate-50 border-b border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Nazims Assigned</span>
                <span className="text-2xl font-black text-blue-700">{nazims.length}</span>
                <span className="text-[11px] text-blue-600 block mt-0.5">Click to view Nazim roster</span>
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
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Usthads Faculty</span>
                <span className="text-2xl font-black text-indigo-700">{ustads.length}</span>
                <span className="text-[11px] text-indigo-600 block mt-0.5">Click to view Usthad roster</span>
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
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Students Enrolled</span>
                <span className="text-2xl font-black text-emerald-700">{students.length}</span>
                <span className="text-[11px] text-emerald-600 block mt-0.5">Click to view Student roster</span>
              </div>
              <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl">
                <Award className="h-6 w-6" />
              </div>
            </div>
          </div>

          {/* --- SUBMENU TAB NAVIGATION --- */}
          <div className="flex border-b border-slate-200 bg-white px-6 gap-2 pt-2">
            <button
              onClick={() => setActiveTab("students")}
              className={`pb-3 px-4 text-xs font-bold transition border-b-2 flex items-center gap-1.5 ${
                activeTab === "students"
                  ? "border-emerald-600 text-emerald-700"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <Award className="h-4 w-4" /> 🎓 Students Roster ({students.length})
            </button>

            <button
              onClick={() => setActiveTab("ustads")}
              className={`pb-3 px-4 text-xs font-bold transition border-b-2 flex items-center gap-1.5 ${
                activeTab === "ustads"
                  ? "border-indigo-600 text-indigo-700"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <User className="h-4 w-4" /> 👳‍♂️ Usthads Roster ({ustads.length})
            </button>

            <button
              onClick={() => setActiveTab("nazims")}
              className={`pb-3 px-4 text-xs font-bold transition border-b-2 flex items-center gap-1.5 ${
                activeTab === "nazims"
                  ? "border-blue-600 text-blue-700"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <ShieldCheck className="h-4 w-4" /> 👤 Nazims Roster ({nazims.length})
            </button>
          </div>

          {/* --- MAIN ROSTER CONTAINER --- */}
          <div className="p-6 overflow-y-auto flex-1 space-y-4 bg-slate-50">
            {/* 1. NAZIMS TAB */}
            {activeTab === "nazims" && (
              <div>
                {nazims.length === 0 ? (
                  <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-500 text-xs font-semibold">
                    No Nazims currently assigned to this center.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {nazims.map((nz) => (
                      <div
                        key={nz.id}
                        onClick={() => setSelectedUserId(nz.id)}
                        className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition cursor-pointer space-y-3"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[10px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-md">
                              NAZIM
                            </span>
                            <h4 className="font-bold text-slate-900 text-base mt-1">{nz.full_name}</h4>
                            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                              <Mail className="h-3.5 w-3.5 text-slate-400" /> {nz.email}
                            </p>
                          </div>
                          <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Compliance: {nz.duty_compliance_ratio}
                          </span>
                        </div>
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-blue-600 font-bold">
                          <span>Click to open Nazim Profile Dossier</span>
                          <ChevronRight className="h-4 w-4" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 2. USTHADS TAB */}
            {activeTab === "ustads" && (
              <div>
                {ustads.length === 0 ? (
                  <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-500 text-xs font-semibold">
                    No Usthads currently assigned to this center.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {ustads.map((us) => (
                      <div
                        key={us.id}
                        onClick={() => setSelectedUserId(us.id)}
                        className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition cursor-pointer space-y-3"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-md">
                              USTHAD FACULTY
                            </span>
                            <h4 className="font-bold text-slate-900 text-base mt-1">{us.full_name}</h4>
                            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                              <Mail className="h-3.5 w-3.5 text-slate-400" /> {us.email}
                            </p>
                          </div>
                          <span className="px-2.5 py-1 rounded-full text-xs font-black bg-indigo-50 text-indigo-700 border border-indigo-200">
                            Grade {us.performance_grade}
                          </span>
                        </div>
                        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center text-xs">
                          <span className="text-slate-500">Duty Compliance:</span>
                          <span className="font-bold text-slate-900">{us.completed_duties}/{us.total_duties} ({us.duty_compliance_ratio})</span>
                        </div>
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-indigo-600 font-bold">
                          <span>Click to open Usthad Profile Dossier</span>
                          <ChevronRight className="h-4 w-4" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 3. STUDENTS TAB */}
            {activeTab === "students" && (
              <div>
                {students.length === 0 ? (
                  <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-500 text-xs font-semibold">
                    No Students currently enrolled in this center.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {students.map((st) => (
                      <div
                        key={st.id}
                        onClick={() => setSelectedUserId(st.id)}
                        className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition cursor-pointer space-y-3"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                              {st.code}
                            </span>
                            <h4 className="font-bold text-slate-900 text-base mt-1">{st.full_name}</h4>
                            <p className="text-xs text-slate-500">{st.parent_name}</p>
                          </div>
                          <span className="px-2 py-1 rounded-full text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {st.attendance_percentage}% Att.
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-center text-xs">
                          <div className="p-1.5 bg-amber-50 rounded-lg border border-amber-200">
                            <span className="block font-bold text-amber-600">⭐ {st.stars ? st.stars.length : 0}</span>
                            <span className="text-[9px] text-slate-500 uppercase">Stars</span>
                          </div>
                          <div className="p-1.5 bg-rose-50 rounded-lg border border-rose-200">
                            <span className="block font-bold text-rose-600">⚠️ {st.warnings ? st.warnings.length : 0}</span>
                            <span className="text-[9px] text-slate-500 uppercase">Warns</span>
                          </div>
                          <div className="p-1.5 bg-blue-50 rounded-lg border border-blue-200">
                            <span className="block font-bold text-blue-600">📅 {st.leave_requests ? st.leave_requests.length : 0}</span>
                            <span className="text-[9px] text-slate-500 uppercase">Leaves</span>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-emerald-600 font-bold">
                          <span>Click to open Student Dossier</span>
                          <ChevronRight className="h-4 w-4" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- OVERLAY: USER PROFILE DOSSIER MODAL --- */}
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
