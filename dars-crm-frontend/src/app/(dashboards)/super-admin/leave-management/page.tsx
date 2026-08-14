"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { 
  Search, Calendar, Star, AlertTriangle, ShieldCheck, CheckCircle2, XCircle, 
  User, Building2, BookOpen, Award, Clock, FileText, ChevronRight, X, Loader2 
} from "lucide-react";
import toast from "react-hot-toast";
import CenterProfileModal from "@/components/CenterProfileModal";

interface StarRecord {
  id: string;
  student_id: string;
  student_name: string;
  issuing_ustad_id: string;
  issuing_ustad_name: string;
  category: string;
  explanation: string;
  awarded_date: string;
}

interface WarningRecord {
  id: string;
  student_id: string;
  student_name: string;
  issuing_ustad_id: string;
  issuing_ustad_name: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | string;
  category: string;
  reasoning: string;
  issued_date: string;
}

interface LeaveRequestItem {
  id: string;
  student_id?: string;
  user_id?: string;
  start_date: string;
  end_date: string;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | string;
  admin_notes?: string;
}

interface StudentDossier {
  id: string;
  code: string;
  full_name: string;
  email: string;
  center_id: string;
  center_name: string;
  center_code: string;
  parent_name: string;
  juz_progress: string;
  sabaq_score: string;
  attendance_percentage: number;
  stars: StarRecord[];
  warnings: WarningRecord[];
  leave_requests: LeaveRequestItem[];
}

interface StaffDossier {
  id: string;
  code: string;
  full_name: string;
  role: string;
  email: string;
  center_id: string;
  center_name: string;
  center_code: string;
  performance_grade: string;
  completed_duties: number;
  total_duties: number;
  duty_compliance_ratio: string;
  leave_requests: LeaveRequestItem[];
}

interface CenterGroup {
  center_id: string;
  center_name: string;
  center_code: string;
  students: StudentDossier[];
  staff: StaffDossier[];
}

export default function SuperAdminLeaveManagementPage() {
  const [activeTab, setActiveTab] = useState<"students" | "staff">("students");
  const [searchQuery, setSearchQuery] = useState("");
  const [centerGroups, setCenterGroups] = useState<CenterGroup[]>([]);
  const [loading, setLoading] = useState(true);

  // Interactive Center Profile Modal State
  const [viewCenterId, setViewCenterId] = useState<string | null>(null);

  // Selected Dossier for Interactive Sidebar
  const [selectedStudent, setSelectedStudent] = useState<StudentDossier | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<StaffDossier | null>(null);

  // Expanded Star/Warning ID states for "Why did they get a star/warning?"
  const [expandedStarId, setExpandedStarId] = useState<string | null>(null);
  const [expandedWarningId, setExpandedWarningId] = useState<string | null>(null);

  // Leave Action State
  const [actionLeaveId, setActionLeaveId] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [processingLeave, setProcessingLeave] = useState(false);

  const fetchOverview = async (query = "") => {
    setLoading(true);
    try {
      const res = await api.get(`/academic/super-admin/leave-performance-overview${query ? `?q=${encodeURIComponent(query)}` : ""}`);
      setCenterGroups(res.data);
    } catch (err) {
      toast.error("Failed to load leave & performance overview");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchOverview(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleProcessLeave = async (leaveId: string, status: "APPROVED" | "REJECTED") => {
    setProcessingLeave(true);
    try {
      await api.patch(`/academic/leave-requests/${leaveId}/approve`, {
        status,
        admin_notes: adminNotes
      });
      toast.success(`Leave request ${status.toLowerCase()} successfully!`);
      setActionLeaveId(null);
      setAdminNotes("");
      fetchOverview(searchQuery);

      // Refresh selected dossier leave status locally
      if (selectedStudent) {
        setSelectedStudent({
          ...selectedStudent,
          leave_requests: selectedStudent.leave_requests.map((l) =>
            l.id === leaveId ? { ...l, status, admin_notes: adminNotes } : l
          )
        });
      }
      if (selectedStaff) {
        setSelectedStaff({
          ...selectedStaff,
          leave_requests: selectedStaff.leave_requests.map((l) =>
            l.id === leaveId ? { ...l, status, admin_notes: adminNotes } : l
          )
        });
      }
    } catch (err) {
      toast.error("Failed to process leave action.");
    } finally {
      setProcessingLeave(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* --------------------------------------------------------- */}
      {/* TOP HEADER & UNIFIED SEARCH BAR */}
      {/* --------------------------------------------------------- */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 text-slate-900 shadow-sm space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold mb-2">
              <ShieldCheck className="h-4 w-4" /> Multi-Tenant HQ Console
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              Leave Management & Star/Warning Performance
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Center-wise leave application reviews, curricular dossiers, gold star badges, and severity warnings tracking.
            </p>
          </div>

          {/* SUBMENU NAVIGATION TABS */}
          <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shrink-0">
            <button
              onClick={() => {
                setActiveTab("students");
                setSelectedStaff(null);
              }}
              className={`px-5 py-2.5 rounded-xl font-extrabold text-xs transition flex items-center gap-2 ${
                activeTab === "students"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                  : "text-slate-600 hover:text-slate-900 font-semibold"
              }`}
            >
              <Award className="h-4 w-4" /> 🎓 Students Submenu
            </button>

            <button
              onClick={() => {
                setActiveTab("staff");
                setSelectedStudent(null);
              }}
              className={`px-5 py-2.5 rounded-xl font-extrabold text-xs transition flex items-center gap-2 ${
                activeTab === "staff"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                  : "text-slate-600 hover:text-slate-900 font-semibold"
              }`}
            >
              <User className="h-4 w-4" /> 👳‍♂️ Staff Submenu
            </button>
          </div>
        </div>

        {/* UNIFIED SEARCH BAR */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Center Code/Name (e.g. CTR-01, Al-Noor) or Student/Staff Code/Name (e.g. Azaan, STUD-401)..."
            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 text-slate-900 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white placeholder-slate-400 transition shadow-inner"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* --------------------------------------------------------- */}
      {/* MAIN CONTENT AREA: CENTER-WISE CLASSIFICATION */}
      {/* --------------------------------------------------------- */}
      {loading ? (
        <div className="flex items-center justify-center p-12 text-slate-500 gap-2 font-bold text-sm">
          <Loader2 className="h-6 w-6 animate-spin text-emerald-600" /> Loading center-wise performance dossiers...
        </div>
      ) : centerGroups.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-500 space-y-2 shadow-sm">
          <Building2 className="h-10 w-10 mx-auto text-slate-400" />
          <h3 className="font-bold text-slate-800">No matching centers or dossiers found</h3>
          <p className="text-xs">Try adjusting your search criteria (e.g., center code or student/staff name).</p>
        </div>
      ) : (
        <div className="space-y-8">
          {centerGroups.map((center) => (
            <div key={center.center_id} className="space-y-4">
              {/* CENTER HEADER */}
              <div 
                onClick={() => setViewCenterId(center.center_id)}
                className="flex items-center justify-between bg-white text-slate-900 px-5 py-3.5 rounded-2xl border border-slate-200 shadow-sm cursor-pointer hover:border-emerald-300 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-200">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="font-black text-base tracking-wide flex items-center gap-2 text-slate-900 group">
                      <span className="hover:text-emerald-700 underline decoration-emerald-300 underline-offset-2">{center.center_name}</span>
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md text-xs font-mono font-bold">
                        {center.center_code}
                      </span>
                    </h2>
                  </div>
                </div>
                <div className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                  <span>{activeTab === "students" ? `${center.students.length} Students` : `${center.staff.length} Staff Members`}</span>
                  <ChevronRight className="h-4 w-4" />
                </div>
              </div>

              {/* --------------------------------------------------- */}
              {/* 1. STUDENTS SUBMENU CARD GRID */}
              {/* --------------------------------------------------- */}
              {activeTab === "students" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {center.students.map((st) => {
                    const pendingLeaves = st.leave_requests.filter((l) => l.status === "PENDING").length;
                    return (
                      <div
                        key={st.id}
                        onClick={() => setSelectedStudent(st)}
                        className={`bg-white border rounded-2xl p-5 shadow-sm hover:shadow-md transition cursor-pointer space-y-4 ${
                          selectedStudent?.id === st.id
                            ? "border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/30"
                            : "border-slate-200 hover:border-emerald-300"
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                              {st.code}
                            </span>
                            <h3 className="font-bold text-slate-900 text-base mt-1">
                              {st.full_name}
                            </h3>
                            <p className="text-xs text-slate-500">{st.parent_name}</p>
                          </div>
                          <span className="px-2.5 py-1 rounded-full text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {st.attendance_percentage}% Att.
                          </span>
                        </div>

                        {/* STATS BADGES ROW */}
                        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center">
                          <div className="p-2 bg-amber-50 rounded-xl border border-amber-200">
                            <span className="block text-xs font-black text-amber-600 flex items-center justify-center gap-1">
                              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" /> {st.stars.length}
                            </span>
                            <span className="text-[10px] font-bold text-slate-500 uppercase">Stars</span>
                          </div>

                          <div className="p-2 bg-rose-50 rounded-xl border border-rose-200">
                            <span className="block text-xs font-black text-rose-600 flex items-center justify-center gap-1">
                              <AlertTriangle className="h-3.5 w-3.5 text-rose-500" /> {st.warnings.length}
                            </span>
                            <span className="text-[10px] font-bold text-slate-500 uppercase">Warns</span>
                          </div>

                          <div className="p-2 bg-blue-50 rounded-xl border border-blue-200">
                            <span className="block text-xs font-black text-blue-600 flex items-center justify-center gap-1">
                              <Calendar className="h-3.5 w-3.5 text-blue-500" /> {st.leave_requests.length}
                            </span>
                            <span className="text-[10px] font-bold text-slate-500 uppercase">Leaves</span>
                          </div>
                        </div>

                        {pendingLeaves > 0 && (
                          <div className="p-2 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs font-bold flex items-center justify-between">
                            <span>{pendingLeaves} Pending Leave Request(s)</span>
                            <ChevronRight className="h-4 w-4 text-amber-600" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* --------------------------------------------------- */}
              {/* 2. STAFF SUBMENU CARD GRID */}
              {/* --------------------------------------------------- */}
              {activeTab === "staff" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {center.staff.map((sf) => {
                    const pendingStaffLeaves = sf.leave_requests.filter((l) => l.status === "PENDING").length;
                    return (
                      <div
                        key={sf.id}
                        onClick={() => setSelectedStaff(sf)}
                        className={`bg-white border rounded-2xl p-5 shadow-sm hover:shadow-md transition cursor-pointer space-y-4 ${
                          selectedStaff?.id === sf.id
                            ? "border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50/30"
                            : "border-slate-200 hover:border-indigo-300"
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                                {sf.code}
                              </span>
                              <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md border border-indigo-200">
                                {sf.role}
                              </span>
                            </div>
                            <h3 className="font-bold text-slate-900 text-base mt-1">
                              {sf.full_name}
                            </h3>
                            <p className="text-xs text-slate-500">{sf.email}</p>
                          </div>
                          <span className="px-2.5 py-1 rounded-full text-xs font-black bg-indigo-50 text-indigo-700 border border-indigo-200">
                            {sf.performance_grade}
                          </span>
                        </div>

                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center text-xs">
                          <span className="text-slate-500 font-medium">Duty Compliance Ratio:</span>
                          <span className="font-bold text-slate-900">
                            {sf.completed_duties}/{sf.total_duties} ({sf.duty_compliance_ratio})
                          </span>
                        </div>

                        {pendingStaffLeaves > 0 && (
                          <div className="p-2 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs font-bold flex items-center justify-between">
                            <span>{pendingStaffLeaves} Pending Staff Leave(s)</span>
                            <ChevronRight className="h-4 w-4 text-amber-600" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* --------------------------------------------------------- */}
      {/* INTERACTIVE DOSSIER SIDEBAR / MODAL PANEL (STUDENT) */}
      {/* --------------------------------------------------------- */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-xl h-full shadow-2xl overflow-y-auto p-6 space-y-6 border-l border-slate-200 dark:border-slate-800">
            {/* DOSSIER HEADER */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-2xl">
                  <Award className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-md">
                      {selectedStudent.code}
                    </span>
                    <span className="text-xs font-bold text-emerald-600">{selectedStudent.center_name}</span>
                  </div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">{selectedStudent.full_name}</h2>
                </div>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* CURRICULAR & DOSSIER CONTEXT */}
            <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
              <h3 className="text-xs font-extrabold uppercase text-slate-500 tracking-wider">Curricular & Behavior Context</h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block font-medium">Assigned Parent</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{selectedStudent.parent_name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Class Attendance Rate</span>
                  <span className="font-bold text-emerald-600">{selectedStudent.attendance_percentage}%</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Juz Progress</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{selectedStudent.juz_progress}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Sabak Hifz Score</span>
                  <span className="font-bold text-indigo-600">{selectedStudent.sabaq_score}</span>
                </div>
              </div>
            </div>

            {/* GOLD STAR RATINGS BLOCK ("Why did they get a star?") */}
            <div className="space-y-3">
              <h3 className="text-xs font-extrabold uppercase text-amber-600 flex items-center gap-1.5 tracking-wider">
                <Star className="h-4 w-4 fill-amber-400" /> Gold Star Badges ({selectedStudent.stars.length})
              </h3>
              {selectedStudent.stars.length === 0 ? (
                <div className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-xl text-xs text-slate-400 text-center font-medium">
                  No gold star badges awarded yet.
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedStudent.stars.map((star) => (
                    <div
                      key={star.id}
                      onClick={() => setExpandedStarId(expandedStarId === star.id ? null : star.id)}
                      className="p-3.5 bg-amber-500/10 border border-amber-400/30 rounded-xl hover:border-amber-400 transition cursor-pointer space-y-2"
                    >
                      <div className="flex justify-between items-center text-xs font-bold text-amber-900 dark:text-amber-200">
                        <span className="flex items-center gap-1.5">
                          <Star className="h-4 w-4 fill-amber-400 text-amber-500" /> {star.category}
                        </span>
                        <span className="text-[10px] text-amber-700 dark:text-amber-400">{star.awarded_date}</span>
                      </div>

                      {/* EXPANDABLE REASONING BLOCK ("Why did they get a star?") */}
                      {expandedStarId === star.id && (
                        <div className="pt-2 border-t border-amber-300/30 text-xs text-slate-700 dark:text-slate-300 space-y-1">
                          <p className="font-semibold text-amber-800 dark:text-amber-300">
                            <strong>Issuing Usthad:</strong> {star.issuing_ustad_name}
                          </p>
                          <p className="bg-white/60 dark:bg-slate-900/60 p-2.5 rounded-lg border border-amber-200 dark:border-amber-900/40 font-medium">
                            {star.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* WARNING RECORDS BLOCK ("Why did they get a warning?") */}
            <div className="space-y-3">
              <h3 className="text-xs font-extrabold uppercase text-rose-600 flex items-center gap-1.5 tracking-wider">
                <AlertTriangle className="h-4 w-4" /> Warning Records ({selectedStudent.warnings.length})
              </h3>
              {selectedStudent.warnings.length === 0 ? (
                <div className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-xl text-xs text-slate-400 text-center font-medium">
                  No warning records on file.
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedStudent.warnings.map((warn) => (
                    <div
                      key={warn.id}
                      onClick={() => setExpandedWarningId(expandedWarningId === warn.id ? null : warn.id)}
                      className={`p-3.5 rounded-xl border transition cursor-pointer space-y-2 ${
                        warn.severity === "HIGH"
                          ? "bg-rose-500/10 border-rose-400/40 text-rose-900 dark:text-rose-200"
                          : warn.severity === "MEDIUM"
                          ? "bg-amber-500/10 border-amber-400/40 text-amber-900 dark:text-amber-200"
                          : "bg-yellow-500/10 border-yellow-400/40 text-yellow-900 dark:text-yellow-200"
                      }`}
                    >
                      <div className="flex justify-between items-center text-xs font-bold">
                        <span className="flex items-center gap-1.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                            warn.severity === "HIGH" ? "bg-rose-600 text-white" : "bg-amber-600 text-white"
                          }`}>
                            {warn.severity} SEVERITY
                          </span>
                          <span>{warn.category}</span>
                        </span>
                        <span className="text-[10px] text-slate-500">{warn.issued_date}</span>
                      </div>

                      {/* EXPANDABLE REASONING BLOCK ("Why did they get a warning?") */}
                      {expandedWarningId === warn.id && (
                        <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 space-y-1">
                          <p className="font-semibold">
                            <strong>Issuing Teacher:</strong> {warn.issuing_ustad_name}
                          </p>
                          <p className="bg-white/60 dark:bg-slate-900/60 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 font-medium">
                            {warn.reasoning}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* DIRECT LEAVE ACTIONS BLOCK */}
            <div className="space-y-3 border-t border-slate-100 dark:border-slate-800 pt-4">
              <h3 className="text-xs font-extrabold uppercase text-slate-500 tracking-wider">Active Leave Applications</h3>
              {selectedStudent.leave_requests.length === 0 ? (
                <div className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-xl text-xs text-slate-400 text-center font-medium">
                  No leave requests submitted.
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedStudent.leave_requests.map((l) => (
                    <div key={l.id} className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white">
                            📅 {l.start_date} → {l.end_date}
                          </span>
                          <p className="text-slate-500 mt-1">{l.reason}</p>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                          l.status === "APPROVED"
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                            : l.status === "REJECTED"
                            ? "bg-rose-100 text-rose-800 border border-rose-300"
                            : "bg-amber-100 text-amber-800 border border-amber-300"
                        }`}>
                          {l.status}
                        </span>
                      </div>

                      {l.admin_notes && (
                        <p className="text-[11px] font-medium text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-800">
                          <strong>Admin Note:</strong> {l.admin_notes}
                        </p>
                      )}

                      {l.status === "PENDING" && (
                        <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                          <input
                            type="text"
                            placeholder="Optional administrative note..."
                            className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                            value={actionLeaveId === l.id ? adminNotes : ""}
                            onChange={(e) => {
                              setActionLeaveId(l.id);
                              setAdminNotes(e.target.value);
                            }}
                          />
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleProcessLeave(l.id, "APPROVED")}
                              disabled={processingLeave}
                              className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1 shadow-sm"
                            >
                              <CheckCircle2 className="h-4 w-4" /> Approve Leave
                            </button>
                            <button
                              onClick={() => handleProcessLeave(l.id, "REJECTED")}
                              disabled={processingLeave}
                              className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1 shadow-sm"
                            >
                              <XCircle className="h-4 w-4" /> Reject Leave
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------- */}
      {/* INTERACTIVE DOSSIER SIDEBAR / MODAL PANEL (STAFF) */}
      {/* --------------------------------------------------------- */}
      {selectedStaff && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-xl h-full shadow-2xl overflow-y-auto p-6 space-y-6 border-l border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-500/10 text-indigo-600 rounded-2xl">
                  <User className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-md">
                      {selectedStaff.code}
                    </span>
                    <span className="text-xs font-bold text-indigo-600">{selectedStaff.role}</span>
                  </div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">{selectedStaff.full_name}</h2>
                </div>
              </div>
              <button
                onClick={() => setSelectedStaff(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
              <h3 className="text-xs font-extrabold uppercase text-slate-500 tracking-wider">Staff Operational Log</h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block font-medium">Performance Grade</span>
                  <span className="font-bold text-indigo-600">{selectedStaff.performance_grade}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Duty Compliance Ratio</span>
                  <span className="font-bold text-emerald-600">{selectedStaff.duty_compliance_ratio}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Completed Duties</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{selectedStaff.completed_duties}/{selectedStaff.total_duties}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Assigned Center</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{selectedStaff.center_name}</span>
                </div>
              </div>
            </div>

            {/* STAFF LEAVE APPROVALS */}
            <div className="space-y-3">
              <h3 className="text-xs font-extrabold uppercase text-slate-500 tracking-wider">Staff Leave Applications</h3>
              {selectedStaff.leave_requests.length === 0 ? (
                <div className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-xl text-xs text-slate-400 text-center font-medium">
                  No staff leave requests submitted.
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedStaff.leave_requests.map((l) => (
                    <div key={l.id} className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white">
                            📅 {l.start_date} → {l.end_date}
                          </span>
                          <p className="text-slate-500 mt-1">{l.reason}</p>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                          l.status === "APPROVED"
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                            : l.status === "REJECTED"
                            ? "bg-rose-100 text-rose-800 border border-rose-300"
                            : "bg-amber-100 text-amber-800 border border-amber-300"
                        }`}>
                          {l.status}
                        </span>
                      </div>

                      {l.admin_notes && (
                        <p className="text-[11px] font-medium text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-800">
                          <strong>Admin Note:</strong> {l.admin_notes}
                        </p>
                      )}

                      {l.status === "PENDING" && (
                        <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                          <input
                            type="text"
                            placeholder="Optional administrative note..."
                            className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                            value={actionLeaveId === l.id ? adminNotes : ""}
                            onChange={(e) => {
                              setActionLeaveId(l.id);
                              setAdminNotes(e.target.value);
                            }}
                          />
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleProcessLeave(l.id, "APPROVED")}
                              disabled={processingLeave}
                              className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1 shadow-sm"
                            >
                              <CheckCircle2 className="h-4 w-4" /> Approve Staff Leave
                            </button>
                            <button
                              onClick={() => handleProcessLeave(l.id, "REJECTED")}
                              disabled={processingLeave}
                              className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1 shadow-sm"
                            >
                              <XCircle className="h-4 w-4" /> Reject Staff Leave
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- CENTER PROFILE DOSSIER & ROSTER MODAL OVERLAY --- */}
      {viewCenterId && (
        <CenterProfileModal
          centerId={viewCenterId}
          onClose={() => setViewCenterId(null)}
          onUpdate={() => fetchOverview(searchQuery)}
        />
      )}
    </div>
  );
}
