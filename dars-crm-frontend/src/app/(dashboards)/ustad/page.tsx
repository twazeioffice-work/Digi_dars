"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { BookOpen, Activity, Save, User, Loader2, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";

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
  const [activeTab, setActiveTab] = useState<"hifz" | "tarbiyyah">("hifz");
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
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-50">
      
      {/* --- LEFT SIDEBAR: Student Roster --- */}
      <div className="w-full md:w-1/4 bg-white border-r border-gray-200 overflow-y-auto">
        <div className="p-4 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-lg font-bold text-gray-800">My Halqa</h2>
          <p className="text-xs text-gray-500">{students.length} Students</p>
        </div>
        <ul className="divide-y divide-gray-100">
          {students.map((student) => (
            <li 
              key={student.id}
              onClick={() => setSelectedStudent(student)}
              className={`p-4 cursor-pointer hover:bg-blue-50 transition-colors flex items-center gap-3 ${
                selectedStudent?.id === student.id ? "bg-blue-50 border-l-4 border-blue-600" : ""
              }`}
            >
              <div className="bg-gray-100 p-2 rounded-full">
                <User className="h-4 w-4 text-gray-600" />
              </div>
              <span className="font-medium text-sm text-gray-700">{student.full_name}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* --- RIGHT WORKSPACE: Data Entry Form --- */}
      <div className="w-full md:w-3/4 p-6 md:p-10 overflow-y-auto">
        {selectedStudent ? (
          <div className="max-w-3xl mx-auto space-y-6">
            
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">
                Logging for {selectedStudent.full_name}
              </h1>
              <span className="text-sm font-medium text-gray-500 bg-gray-200 px-3 py-1 rounded-full">
                {new Date().toLocaleDateString()}
              </span>
            </div>

            {/* TAB NAVIGATION */}
            <div className="flex border-b border-gray-200 mb-6">
              <button
                onClick={() => setActiveTab("hifz")}
                className={`flex items-center gap-2 px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === "hifz" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <BookOpen className="h-4 w-4" /> Hifz Progress
              </button>
              <button
                onClick={() => setActiveTab("tarbiyyah")}
                className={`flex items-center gap-2 px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === "tarbiyyah" ? "border-green-600 text-green-600" : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <Activity className="h-4 w-4" /> Tarbiyyah & Prayers
              </button>
            </div>

            {/* --- HIFZ TAB --- */}
            {activeTab === "hifz" && (
              <form onSubmit={handleSaveHifz} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
                
                {/* Sabaq Row */}
                <div className="grid grid-cols-3 gap-4 items-end">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sabaq (New Lesson)</label>
                    <input 
                      type="text" placeholder="e.g., Surah Yaseen Ayah 1-10" 
                      className="w-full p-2 border rounded-md"
                      value={hifzForm.sabaq_details}
                      onChange={(e) => setHifzForm({...hifzForm, sabaq_details: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Grade</label>
                    <select 
                      className="w-full p-2 border rounded-md bg-gray-50"
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

                {/* AI RAG Remarks */}
                <div>
                  <label className="block text-sm font-bold text-indigo-700 mb-1">
                    Ustad's Remarks (AI Context)
                  </label>
                  <p className="text-xs text-gray-500 mb-2">These notes will be used by the AI to generate the monthly report.</p>
                  <textarea 
                    className="w-full p-3 border border-indigo-200 rounded-md focus:ring-2 focus:ring-indigo-500 bg-indigo-50/30"
                    rows={4}
                    placeholder="Describe the student's fluency, struggles, or breakthroughs today..."
                    value={hifzForm.remarks}
                    onChange={(e) => setHifzForm({...hifzForm, remarks: e.target.value})}
                  />
                </div>

                <div className="flex justify-end">
                  <button type="submit" disabled={saving} className="bg-blue-600 text-white px-6 py-2 rounded-md font-medium hover:bg-blue-700 flex items-center gap-2">
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Save Hifz
                  </button>
                </div>
              </form>
            )}

            {/* --- TARBIYYAH TAB --- */}
            {activeTab === "tarbiyyah" && (
              <form onSubmit={handleSaveTarbiyyah} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
                
                <h3 className="font-semibold text-gray-800 border-b pb-2">Jamaat Attendance</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {['fajr', 'zuhr', 'asr', 'maghrib', 'isha'].map((prayer) => (
                    <div key={prayer}>
                      <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">{prayer}</label>
                      <select 
                        className="w-full p-2 border rounded-md text-sm"
                        value={(tarbiyyahForm as any)[prayer]}
                        onChange={(e) => setTarbiyyahForm({...tarbiyyahForm, [prayer]: e.target.value as JamaatStatus})}
                      >
                        <option value="PRESENT_IN_JAMAAT">Jamaat</option>
                        <option value="LATE">Late</option>
                        <option value="PRAYED_ALONE">Alone</option>
                        <option value="MISSED">Missed</option>
                      </select>
                    </div>
                  ))}
                </div>

                <div>
                  <label className="block text-sm font-bold text-indigo-700 mb-1">Behavior & Adab Remarks</label>
                  <textarea 
                    className="w-full p-3 border border-indigo-200 rounded-md bg-indigo-50/30"
                    rows={3}
                    placeholder="Notes on discipline, cleanliness, or interactions..."
                    value={tarbiyyahForm.behavior_remarks}
                    onChange={(e) => setTarbiyyahForm({...tarbiyyahForm, behavior_remarks: e.target.value})}
                  />
                </div>

                <div className="flex justify-end">
                  <button type="submit" disabled={saving} className="bg-green-600 text-white px-6 py-2 rounded-md font-medium hover:bg-green-700 flex items-center gap-2">
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                    Save Tarbiyyah
                  </button>
                </div>
              </form>
            )}

          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <User className="h-16 w-16 mb-4 opacity-20" />
            <p>Select a student from the left to begin logging.</p>
          </div>
        )}
      </div>
    </div>
  );
}
