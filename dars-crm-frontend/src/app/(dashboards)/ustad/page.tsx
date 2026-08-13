"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { BookOpen, Activity, Save, User, Loader2, CheckCircle2, Users } from "lucide-react";
import toast from "react-hot-toast";
import ResponsiveStudentList, { StudentListItem } from "@/components/ResponsiveStudentList";

// --- Types & Enums matching the Backend ---
type MasteryLevel = "EXCELLENT" | "GOOD" | "NEEDS_WORK" | "FAIL";
type JamaatStatus = "PRESENT_IN_JAMAAT" | "LATE" | "PRAYED_ALONE" | "MISSED" | "EXCUSED";

interface Student {
  id: string;
  full_name: string;
}

export default function UstadDailyLogPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [activeTab, setActiveTab] = useState<"hifz" | "tarbiyyah" | "overview">("hifz");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
  useEffect(() => {
    async function fetchStudents() {
      try {
        const res = await api.get("/academic/halqa/students");
        setStudents(res.data);
        if (res.data.length > 0) setSelectedStudent(res.data[0]);
      } catch (err) {
        toast.error("Failed to load students.");
      } finally {
        setLoading(false);
      }
    }
    fetchStudents();
  }, []);

  // Map students for ResponsiveStudentList component
  const studentListItems: StudentListItem[] = students.map((s, idx) => ({
    id: s.id,
    name: s.full_name,
    hifz: idx % 2 === 0 ? "Surah Yaseen (Page 4)" : "Surah Mulk (Page 2)",
    status: idx % 3 === 0 ? "ABSENT" : "PRESENT",
  }));

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

          <ResponsiveStudentList students={studentListItems} />
        </div>
      )}

    </div>
  );
}
