"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { BookOpen, Activity, Save, User, Loader2, CheckCircle2, Users, PhoneCall, Calendar, X, AlertCircle, Star, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";
import ResponsiveStudentList, { StudentListItem } from "@/components/ResponsiveStudentList";

// --- Types & Enums matching the Backend ---
type MasteryLevel = "EXCELLENT" | "GOOD" | "NEEDS_WORK" | "FAIL";
type JamaatStatus = "PRESENT_IN_JAMAAT" | "LATE" | "PRAYED_ALONE" | "MISSED" | "EXCUSED";

interface Student {
  id: string;
  full_name: string;
  status?: string;
  hifz?: string;
}

export default function UstadDailyLogPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [activeTab, setActiveTab] = useState<"hifz" | "tarbiyyah" | "overview" | "console">("hifz");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Star & Warning Console Form States
  const [starForm, setStarForm] = useState({
    student_id: "",
    category: "Tajweed Fluency",
    explanation: "Outstanding recitation fluency and error-free Sabaq presentation.",
  });

  const [warningForm, setWarningForm] = useState({
    student_id: "",
    severity: "LOW",
    category: "Tardiness",
    reasoning: "Arrived late for Fajr Jamaat prayer without prior permission.",
  });

  // Emergency Leave Modal State
  const [emergencyModalStudent, setEmergencyModalStudent] = useState<StudentListItem | null>(null);
  const [emergencyLeaveForm, setEmergencyLeaveForm] = useState({
    start_date: new Date().toISOString().split("T")[0],
    end_date: new Date().toISOString().split("T")[0],
    reason: "Parent verbally communicated emergency leave with Ustad",
  });

  // Form States
  const [hifzForm, setHifzForm] = useState({
    sabaq_details: "", sabaq_grade: "GOOD",
    sabqi_details: "", sabqi_grade: "GOOD",
    manzil_details: "", manzil_grade: "GOOD",
    remarks: "" // <--- Feeds the Vector DB
  });

  const [tarbiyyahForm, setTarbiyyahForm] = useState({
    fajr: "PRESENT_IN_JAMAAT", zuhr: "PRESENT_IN_JAMAAT",
    asr: "PRESENT_IN_JAMAAT", maghrib: "PRESENT_IN_JAMAAT",
    isha: "PRESENT_IN_JAMAAT", adab_score: 5,
    behavior_remarks: "" // <--- Feeds the Vector DB
  });

  // 1. Fetch Students in the Ustad's Halqa on load
  const fetchStudents = async () => {
    try {
      const res = await api.get("/academic/halqa/students");
      setStudents(res.data);
      if (res.data.length > 0 && !selectedStudent) setSelectedStudent(res.data[0]);
    } catch (err) {
      toast.error("Failed to load students.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Map students for ResponsiveStudentList component
  const studentListItems: StudentListItem[] = students.map((s) => ({
    id: s.id,
    name: s.full_name,
    hifz: s.hifz || "Surah Yaseen (Page 4)",
    status: s.status || "UNMARKED",
  }));

  // Quick Attendance Marker (Present / Absent)
  const handleMarkAttendance = async (studentId: string, status: "PRESENT" | "ABSENT") => {
    const prayerVal = status === "PRESENT" ? "PRESENT_IN_JAMAAT" : "MISSED";
    try {
      await api.post("/academic/tarbiyyah", {
        student_id: studentId,
        is_on_leave: false,
        fajr: prayerVal,
        zuhr: prayerVal,
        asr: prayerVal,
        maghrib: prayerVal,
        isha: prayerVal,
      });
      toast.success(`Marked ${status}!`);
      fetchStudents();
    } catch (err) {
      toast.error("Failed to update attendance.");
    }
  };

  // Save Emergency Leave
  const handleSaveEmergencyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emergencyModalStudent) return;
    setSaving(true);
    try {
      await api.post("/academic/leave-requests", {
        student_id: emergencyModalStudent.id,
        start_date: emergencyLeaveForm.start_date,
        end_date: emergencyLeaveForm.end_date,
        reason: `[Emergency Leave - Parent Verified by Ustad] ${emergencyLeaveForm.reason}`,
        is_emergency: true,
        status: "APPROVED"
      });
      toast.success(`Emergency leave recorded for ${emergencyModalStudent.name}!`);
      setEmergencyModalStudent(null);
      fetchStudents();
    } catch (err) {
      toast.error("Failed to submit emergency leave.");
    } finally {
      setSaving(false);
    }
  };

  // Submit Gold Star Award
  const handleAwardStar = async (e: React.FormEvent) => {
    e.preventDefault();
    const stId = starForm.student_id || (selectedStudent ? selectedStudent.id : (students[0] ? students[0].id : ""));
    if (!stId) {
      toast.error("Please select a student to award star.");
      return;
    }
    setSaving(true);
    try {
      await api.post("/academic/stars", {
        student_id: stId,
        category: starForm.category,
        explanation: starForm.explanation,
      });
      toast.success("⭐ Gold star badge awarded successfully!");
      setStarForm({
        ...starForm,
        explanation: "Outstanding recitation fluency and error-free Sabaq presentation.",
      });
    } catch (err) {
      toast.error("Failed to award star.");
    } finally {
      setSaving(false);
    }
  };

  // Submit Warning Record
  const handleIssueWarning = async (e: React.FormEvent) => {
    e.preventDefault();
    const stId = warningForm.student_id || (selectedStudent ? selectedStudent.id : (students[0] ? students[0].id : ""));
    if (!stId) {
      toast.error("Please select a student to issue warning.");
      return;
    }
    setSaving(true);
    try {
      await api.post("/academic/warnings", {
        student_id: stId,
        severity: warningForm.severity,
        category: warningForm.category,
        reasoning: warningForm.reasoning,
      });
      toast.success("⚠️ Warning record issued to student!");
      setWarningForm({
        ...warningForm,
        reasoning: "Arrived late for Fajr Jamaat prayer without prior permission.",
      });
    } catch (err) {
      toast.error("Failed to issue warning.");
    } finally {
      setSaving(false);
    }
  };

  // 2. Submit Hifz Log
  const handleSaveHifz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    setSaving(true);
    
    try {
      await api.post("/academic/hifz", {
        student_id: selectedStudent.id,
        ...hifzForm
      });
      toast.success("Hifz progress saved successfully.");
    } catch (err) {
      toast.error("Failed to save Hifz log.");
    } finally {
      setSaving(false);
    }
  };

  // 3. Submit Tarbiyyah Log
  const handleSaveTarbiyyah = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    setSaving(true);
    
    try {
      await api.post("/academic/tarbiyyah", {
        student_id: selectedStudent.id,
        ...tarbiyyahForm
      });
      toast.success("Tarbiyyah log saved successfully.");
    } catch (err) {
      toast.error("Failed to save Tarbiyyah log.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* --- TOP MOBILE-FIRST STUDENT SELECTOR CAROUSEL / DROPDOWN --- */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
          Select Halqa Student
        </label>
        <select
          value={selectedStudent?.id || ""}
          onChange={(e) => {
            const found = students.find((s) => s.id === e.target.value);
            if (found) setSelectedStudent(found);
          }}
          className="w-full h-12 md:h-10 px-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
        >
          {students.map((student) => (
            <option key={student.id} value={student.id}>
              {student.full_name}
            </option>
          ))}
        </select>
      </div>

      {/* --- TAB NAVIGATION (48px Touch Target on Mobile) --- */}
      <div className="flex bg-slate-200 dark:bg-slate-800 p-1.5 rounded-2xl gap-1">
        <button
          onClick={() => setActiveTab("hifz")}
          className={`flex-1 flex items-center justify-center gap-2 h-12 md:h-10 rounded-xl font-bold text-xs sm:text-sm transition-all ${
            activeTab === "hifz"
              ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
          }`}
        >
          <BookOpen className="h-4 w-4" /> Hifz Progress
        </button>

        <button
          onClick={() => setActiveTab("tarbiyyah")}
          className={`flex-1 flex items-center justify-center gap-2 h-12 md:h-10 rounded-xl font-bold text-xs sm:text-sm transition-all ${
            activeTab === "tarbiyyah"
              ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
          }`}
        >
          <Activity className="h-4 w-4" /> Tarbiyyah & Prayer
        </button>

        <button
          onClick={() => setActiveTab("overview")}
          className={`flex-1 flex items-center justify-center gap-2 h-12 md:h-10 rounded-xl font-bold text-xs sm:text-sm transition-all ${
            activeTab === "overview"
              ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
          }`}
        >
          <Users className="h-4 w-4" /> Roster View
        </button>

        <button
          onClick={() => setActiveTab("console")}
          className={`flex-1 flex items-center justify-center gap-2 h-12 md:h-10 rounded-xl font-bold text-xs sm:text-sm transition-all ${
            activeTab === "console"
              ? "bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
          }`}
        >
          <Star className="h-4 w-4 fill-amber-400 text-amber-500" /> Star & Warning Console
        </button>
      </div>

      {/* --- HIFZ TAB --- */}
      {activeTab === "hifz" && selectedStudent && (
        <form onSubmit={handleSaveHifz} className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Logging Hifz for <span className="text-emerald-600">{selectedStudent.full_name}</span>
            </h2>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full">
              {new Date().toLocaleDateString()}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Sabaq (New Lesson)</label>
              <input 
                type="text" placeholder="e.g., Surah Yaseen Ayah 1-10" 
                className="w-full h-12 md:h-10 px-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                value={hifzForm.sabaq_details}
                onChange={(e) => setHifzForm({...hifzForm, sabaq_details: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Grade</label>
              <select 
                className="w-full h-12 md:h-10 px-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                value={hifzForm.sabaq_grade}
                onChange={(e) => setHifzForm({...hifzForm, sabaq_grade: e.target.value as MasteryLevel})}
              >
                <option value="EXCELLENT">Excellent</option>
                <option value="GOOD">Good</option>
                <option value="NEEDS_WORK">Needs Work</option>
                <option value="FAIL">Fail</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-1">
              Ustad's Remarks (AI Vector DB Context)
            </label>
            <textarea 
              className="w-full p-4 border border-indigo-200 dark:border-indigo-900 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-indigo-50/20 dark:bg-indigo-950/20 text-slate-900 dark:text-slate-100 text-sm"
              rows={4}
              placeholder="Describe student's fluency, struggles, or breakthroughs today..."
              value={hifzForm.remarks}
              onChange={(e) => setHifzForm({...hifzForm, remarks: e.target.value})}
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto h-12 px-8 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20"
            >
              {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
              Save Hifz Progress
            </button>
          </div>
        </form>
      )}

      {/* --- TARBIYYAH TAB --- */}
      {activeTab === "tarbiyyah" && selectedStudent && (
        <form onSubmit={handleSaveTarbiyyah} className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Tarbiyyah & Prayers for <span className="text-emerald-600">{selectedStudent.full_name}</span>
            </h2>
          </div>
          
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Jamaat Attendance</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {['fajr', 'zuhr', 'asr', 'maghrib', 'isha'].map((prayer) => (
                <div key={prayer}>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 capitalize">{prayer}</label>
                  <select 
                    className="w-full h-12 md:h-10 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
                    value={(tarbiyyahForm as any)[prayer]}
                    onChange={(e) => setTarbiyyahForm({...tarbiyyahForm, [prayer]: e.target.value as JamaatStatus})}
                  >
                    <option value="PRESENT_IN_JAMAAT">Jamaat 🕌</option>
                    <option value="LATE">Late ⏰</option>
                    <option value="PRAYED_ALONE">Alone 🧎</option>
                    <option value="MISSED">Missed ✖</option>
                  </select>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-1">Behavior & Adab Remarks</label>
            <textarea 
              className="w-full p-4 border border-indigo-200 dark:border-indigo-900 rounded-xl bg-indigo-50/20 dark:bg-indigo-950/20 text-slate-900 dark:text-slate-100 text-sm"
              rows={3}
              placeholder="Notes on discipline, cleanliness, or interactions..."
              value={tarbiyyahForm.behavior_remarks}
              onChange={(e) => setTarbiyyahForm({...tarbiyyahForm, behavior_remarks: e.target.value})}
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto h-12 px-8 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20"
            >
              {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle2 className="h-5 w-5" />}
              Save Tarbiyyah Log
            </button>
          </div>
        </form>
      )}

      {/* --- OVERVIEW TAB (RESPONSIVE MORPHING: Desktop Table ↔ Mobile Touch Cards) --- */}
      {activeTab === "overview" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              My Halqa Roster Status
            </h2>
            <span className="text-xs font-semibold text-slate-500">
              Auto-adapts between mobile cards and desktop table
            </span>
          </div>

          <ResponsiveStudentList 
            students={studentListItems} 
            onMarkAttendance={handleMarkAttendance}
            onOpenLeaveModal={(st) => {
              setEmergencyModalStudent(st);
              setEmergencyLeaveForm({
                start_date: new Date().toISOString().split("T")[0],
                end_date: new Date().toISOString().split("T")[0],
                reason: "Parent verbally communicated emergency leave with Ustad",
              });
            }}
          />
        </div>
      )}

      {/* --- TAB 4: STAR & WARNING CONSOLE (USTHAD ACTION CONSOLE) --- */}
      {activeTab === "console" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 1. AWARD GOLD STAR FORM */}
          <form onSubmit={handleAwardStar} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="p-2 bg-amber-50 dark:bg-amber-950/40 text-amber-600 rounded-xl">
                <Star className="h-5 w-5 fill-amber-400 text-amber-500" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">Award Gold Star Badge</h3>
                <p className="text-xs text-slate-500">Recognize student academic & moral excellence</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Select Student</label>
              <select
                value={starForm.student_id || (selectedStudent ? selectedStudent.id : "")}
                onChange={(e) => setStarForm({ ...starForm, student_id: e.target.value })}
                className="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-semibold"
              >
                {students.map((st) => (
                  <option key={st.id} value={st.id}>{st.full_name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Achievement Category</label>
              <select
                value={starForm.category}
                onChange={(e) => setStarForm({ ...starForm, category: e.target.value })}
                className="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-semibold"
              >
                <option value="Tajweed Fluency">Tajweed Fluency ⭐</option>
                <option value="Namaz Discipline">Namaz Discipline 🕌</option>
                <option value="Sabak Excellence">Sabak Excellence 📖</option>
                <option value="Hifz Mastery">Hifz Mastery 🧠</option>
                <option value="Noble Character">Noble Character & Adab 🤝</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Explanation ("Why did they get a star?")</label>
              <textarea
                rows={3}
                required
                placeholder="Detail the specific reason for awarding this star..."
                className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-medium"
                value={starForm.explanation}
                onChange={(e) => setStarForm({ ...starForm, explanation: e.target.value })}
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md shadow-amber-600/20"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Star className="h-4 w-4 fill-amber-300" />}
              Award Gold Star Badge
            </button>
          </form>

          {/* 2. ISSUE SEVERITY WARNING FORM */}
          <form onSubmit={handleIssueWarning} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="p-2 bg-rose-50 dark:bg-rose-950/40 text-rose-600 rounded-xl">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">Issue Warning Record</h3>
                <p className="text-xs text-slate-500">Record behavior, tardiness, or academic negligence</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Select Student</label>
              <select
                value={warningForm.student_id || (selectedStudent ? selectedStudent.id : "")}
                onChange={(e) => setWarningForm({ ...warningForm, student_id: e.target.value })}
                className="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-semibold"
              >
                {students.map((st) => (
                  <option key={st.id} value={st.id}>{st.full_name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Warning Severity</label>
                <select
                  value={warningForm.severity}
                  onChange={(e) => setWarningForm({ ...warningForm, severity: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-semibold"
                >
                  <option value="LOW">LOW (Mild)</option>
                  <option value="MEDIUM">MEDIUM (Moderate)</option>
                  <option value="HIGH">HIGH (Severe)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Category</label>
                <select
                  value={warningForm.category}
                  onChange={(e) => setWarningForm({ ...warningForm, category: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-semibold"
                >
                  <option value="Tardiness">Tardiness / Late Arrival</option>
                  <option value="Misconduct">Misconduct / Behavioral Issue</option>
                  <option value="Academic Negligence">Academic Negligence</option>
                  <option value="Unexcused Absence">Unexcused Absence</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Justification ("Why did they get a warning?")</label>
              <textarea
                rows={3}
                required
                placeholder="Explain teacher reasoning and contextual justification..."
                className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-medium"
                value={warningForm.reasoning}
                onChange={(e) => setWarningForm({ ...warningForm, reasoning: e.target.value })}
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md shadow-rose-600/20"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <AlertTriangle className="h-4 w-4" />}
              Issue Warning Record
            </button>
          </form>
        </div>
      )}

      {/* --- EMERGENCY LEAVE MODAL FOR USTAD --- */}
      {emergencyModalStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-50 dark:bg-amber-950/40 text-amber-600 rounded-xl">
                  <PhoneCall className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">Record Emergency Leave</h3>
                  <p className="text-xs text-slate-500">Parent Verbal Communication Verification</p>
                </div>
              </div>
              <button
                onClick={() => setEmergencyModalStudent(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-xl text-xs text-amber-900 dark:text-amber-300 space-y-1">
              <p className="font-bold flex items-center gap-1">
                <AlertCircle className="h-4 w-4 text-amber-600" /> Student: {emergencyModalStudent.name}
              </p>
              <p>Emergency leaves (&lt; 5 days) are recorded directly by Ustad after verifying verbal consent with parents over phone call.</p>
            </div>

            <form onSubmit={handleSaveEmergencyLeave} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                    value={emergencyLeaveForm.start_date}
                    onChange={(e) => setEmergencyLeaveForm({ ...emergencyLeaveForm, start_date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                    value={emergencyLeaveForm.end_date}
                    onChange={(e) => setEmergencyLeaveForm({ ...emergencyLeaveForm, end_date: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Parent Communication & Reason</label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Spoke with father on call. Urgent family event / medical issue..."
                  className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                  value={emergencyLeaveForm.reason}
                  onChange={(e) => setEmergencyLeaveForm({ ...emergencyLeaveForm, reason: e.target.value })}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEmergencyModalStudent(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-md shadow-amber-600/20"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Emergency Leave"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
