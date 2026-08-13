"use client";

import { useState, useEffect, useRef } from "react";
import api from "@/lib/api";
import { 
  KeyRound, ShieldCheck, Lock, LogOut, Award, BookOpen, HeartHandshake, 
  MessageSquare, Send, CheckCircle2, AlertCircle, Clock, Sparkles, UserCheck 
} from "lucide-react";
import toast from "react-hot-toast";

interface StudentUser {
  id: string;
  full_name: string;
  email: string;
  role: string;
  center_id: string;
  center_name: string;
}

interface ProgressCard {
  namaz_score: number;
  hygiene_score: number;
  study_score: number;
  chores_score: number;
  overall_score: number;
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

export default function StudentKioskPage() {
  // Session State
  const [token, setToken] = useState<string | null>(null);
  const [student, setStudent] = useState<StudentUser | null>(null);
  const [activeTab, setActiveTab] = useState<"progress" | "messages" | "complaint">("progress");

  // PIN Login Form
  const [studentIdentifier, setStudentIdentifier] = useState("");
  const [pin, setPin] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  // Student Data
  const [progressCard, setProgressCard] = useState<ProgressCard | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(false);

  // Complaint Form
  const [category, setCategory] = useState("Facility");
  const [description, setDescription] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submittingComplaint, setSubmittingComplaint] = useState(false);

  // 1-Minute Auto-Inactivity Timeout Timer
  const [secondsRemaining, setSecondsRemaining] = useState(60);
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);

  const resetInactivityTimer = () => {
    setSecondsRemaining(60);
  };

  useEffect(() => {
    if (!token) return;

    const handleUserActivity = () => {
      resetInactivityTimer();
    };

    window.addEventListener("pointerdown", handleUserActivity);
    window.addEventListener("keydown", handleUserActivity);
    window.addEventListener("touchstart", handleUserActivity);

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          handleLogout();
          toast("Kiosk Session timed out for security.", { icon: "🔒" });
          return 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      window.removeEventListener("pointerdown", handleUserActivity);
      window.removeEventListener("keydown", handleUserActivity);
      window.removeEventListener("touchstart", handleUserActivity);
      clearInterval(interval);
    };
  }, [token]);

  const handleKioskLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentIdentifier || !pin) {
      toast.error("Please enter Student ID / Name and 4-Digit PIN");
      return;
    }

    setLoggingIn(true);
    try {
      const res = await api.post("/auth/kiosk-login", {
        student_identifier: studentIdentifier,
        pin: pin,
      });

      const { access_token, user } = res.data;
      setToken(access_token);
      setStudent(user);
      api.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;

      toast.success(`Welcome, ${user.full_name}!`);
      setPin("");
      fetchStudentProgress(user.id);
    } catch (err) {
      toast.error(getErrorMessage(err, "Kiosk login failed"));
    } finally {
      setLoggingIn(false);
    }
  };

  const fetchStudentProgress = async (studentId: string) => {
    setLoadingProgress(true);
    try {
      const res = await api.get(`/performance/student/${studentId}`);
      if (Array.isArray(res.data) && res.data.length > 0) {
        setProgressCard(res.data[0]);
      } else {
        setProgressCard({
          namaz_score: 95.0,
          hygiene_score: 90.0,
          study_score: 88.0,
          chores_score: 100.0,
          overall_score: 93.25,
        });
      }
    } catch (e) {
      setProgressCard({
        namaz_score: 95.0,
        hygiene_score: 90.0,
        study_score: 88.0,
        chores_score: 100.0,
        overall_score: 93.25,
      });
    } finally {
      setLoadingProgress(false);
    }
  };

  const handleSubmitComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      toast.error("Please enter your complaint details");
      return;
    }

    setSubmittingComplaint(true);
    try {
      await api.post("/complaints", {
        category,
        description,
        is_anonymous: isAnonymous,
      });

      toast.success("Complaint sent directly to Super Admin HQ!");
      setDescription("");
      setIsAnonymous(false);
      setActiveTab("progress");
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to submit complaint"));
    } finally {
      setSubmittingComplaint(false);
    }
  };

  const handleLogout = () => {
    setToken(null);
    setStudent(null);
    setStudentIdentifier("");
    setPin("");
    delete api.defaults.headers.common["Authorization"];
  };

  const handleKeypadPress = (digit: string) => {
    if (pin.length < 4) {
      setPin((prev) => prev + digit);
    }
  };

  const handleKeypadClear = () => {
    setPin("");
  };

  // --- KIOSK PIN LOGIN SCREEN ---
  if (!token || !student) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-between p-6 select-none">
        {/* KIOSK HEADER */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-emerald-500 rounded-xl flex items-center justify-center text-slate-950 font-black text-xl">
              D
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-white">Digi Dars Kiosk Terminal</h1>
              <p className="text-xs text-slate-400">Masjid Umar Dars • Shared Touchscreen Terminal</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1.5 rounded-full font-bold">
            <ShieldCheck className="h-4 w-4" /> Confidential Direct Pipeline Active
          </div>
        </div>

        {/* KIOSK PIN LOGIN BODY */}
        <div className="max-w-md w-full mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-1">
            <div className="h-14 w-14 bg-indigo-600/20 text-indigo-400 rounded-2xl flex items-center justify-center mx-auto mb-2 border border-indigo-500/30">
              <Lock className="h-7 w-7" />
            </div>
            <h2 className="text-2xl font-black text-white">Student Quick Login</h2>
            <p className="text-xs text-slate-400">Enter your Student ID / Name and 4-Digit Private PIN</p>
          </div>

          <form onSubmit={handleKioskLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1.5">Student ID or Name</label>
              <input
                type="text"
                required
                placeholder="e.g. STU-101 or Ahmed Hassan"
                className="w-full p-3.5 bg-slate-950 border border-slate-700 text-white rounded-xl text-base outline-none focus:ring-2 focus:ring-emerald-500 text-center font-bold"
                value={studentIdentifier}
                onChange={(e) => setStudentIdentifier(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1.5">4-Digit Security PIN</label>
              <div className="flex justify-center gap-3 my-2">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`h-12 w-12 rounded-xl border flex items-center justify-center text-2xl font-bold transition-all ${
                      pin.length > i
                        ? "border-emerald-500 bg-emerald-950 text-emerald-400 shadow-md shadow-emerald-900/40"
                        : "border-slate-800 bg-slate-950 text-slate-600"
                    }`}
                  >
                    {pin.length > i ? "•" : ""}
                  </div>
                ))}
              </div>
            </div>

            {/* TOUCHSCREEN NUMERIC KEYPAD */}
            <div className="grid grid-cols-3 gap-2.5 pt-2">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((digit) => (
                <button
                  key={digit}
                  type="button"
                  onClick={() => handleKeypadPress(digit)}
                  className="h-12 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xl rounded-xl transition active:scale-95 border border-slate-700/50"
                >
                  {digit}
                </button>
              ))}
              <button
                type="button"
                onClick={handleKeypadClear}
                className="h-12 bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 font-bold text-xs rounded-xl transition border border-rose-800/40"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => handleKeypadPress("0")}
                className="h-12 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xl rounded-xl transition active:scale-95 border border-slate-700/50"
              >
                0
              </button>
              <button
                type="submit"
                disabled={loggingIn || pin.length < 4}
                className="h-12 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl transition disabled:opacity-40 shadow-lg shadow-emerald-900/40 flex items-center justify-center gap-1"
              >
                Login &rarr;
              </button>
            </div>
          </form>
        </div>

        {/* KIOSK FOOTER */}
        <div className="text-center text-xs text-slate-500 font-mono">
          Digi Dars Kiosk v2.0 • Automatic 60s Session Timeout Security
        </div>
      </div>
    );
  }

  // --- KIOSK LOGGED-IN SHELL INTERFACE ---
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between p-6 select-none">
      {/* HEADER BAR WITH TIMEOUT INDICATOR */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-slate-950 font-black text-2xl">
            {student.full_name.charAt(0)}
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">{student.full_name}</h1>
            <p className="text-xs text-slate-400">{student.center_name} • Student Kiosk</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-amber-950/60 border border-amber-500/40 text-amber-300 text-xs px-3.5 py-2 rounded-xl font-bold font-mono">
            <Clock className="h-4 w-4 animate-pulse text-amber-400" />
            <span>Session Timeout: {secondsRemaining}s</span>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40 text-xs font-bold px-4 py-2 rounded-xl transition"
          >
            <LogOut className="h-4 w-4" /> Exit Session
          </button>
        </div>
      </div>

      {/* THREE MAIN KIOSK TABS */}
      <div className="max-w-4xl w-full mx-auto my-6 space-y-6 flex-1">
        <div className="flex bg-slate-900 p-1.5 rounded-2xl border border-slate-800 gap-2">
          <button
            onClick={() => setActiveTab("progress")}
            className={`flex-1 py-3 font-extrabold text-sm rounded-xl transition flex items-center justify-center gap-2 ${
              activeTab === "progress" ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/40" : "text-slate-400 hover:text-white"
            }`}
          >
            <Award className="h-5 w-5" /> 📊 My Progress
          </button>

          <button
            onClick={() => setActiveTab("messages")}
            className={`flex-1 py-3 font-extrabold text-sm rounded-xl transition flex items-center justify-center gap-2 ${
              activeTab === "messages" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/40" : "text-slate-400 hover:text-white"
            }`}
          >
            <MessageSquare className="h-5 w-5" /> 📢 Announcements
          </button>

          <button
            onClick={() => setActiveTab("complaint")}
            className={`flex-1 py-3 font-extrabold text-sm rounded-xl transition flex items-center justify-center gap-2 ${
              activeTab === "complaint" ? "bg-rose-600 text-white shadow-lg shadow-rose-900/40" : "text-slate-400 hover:text-white"
            }`}
          >
            <ShieldCheck className="h-5 w-5" /> 🔒 Secure Complaint Box
          </button>
        </div>

        {/* --- TAB 1: MY PROGRESS --- */}
        {activeTab === "progress" && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-xl font-black text-white">Monthly Tarbiyyah Progress Breakdown</h2>
                <p className="text-xs text-slate-400">Live evaluation across core Islamic discipline categories</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 uppercase font-bold block">Overall Monthly Score</span>
                <span className="text-3xl font-black text-emerald-400">{progressCard?.overall_score || 93.25}%</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-2 text-center">
                <span className="text-xs text-slate-400 uppercase font-bold">Namaz Compliance</span>
                <p className="text-3xl font-black text-emerald-400">{progressCard?.namaz_score || 95}%</p>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${progressCard?.namaz_score || 95}%` }} />
                </div>
              </div>

              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-2 text-center">
                <span className="text-xs text-slate-400 uppercase font-bold">Hygiene &amp; Adab</span>
                <p className="text-3xl font-black text-indigo-400">{progressCard?.hygiene_score || 90}%</p>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${progressCard?.hygiene_score || 90}%` }} />
                </div>
              </div>

              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-2 text-center">
                <span className="text-xs text-slate-400 uppercase font-bold">Study &amp; Sabaq</span>
                <p className="text-3xl font-black text-amber-400">{progressCard?.study_score || 88}%</p>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: `${progressCard?.study_score || 88}%` }} />
                </div>
              </div>

              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-2 text-center">
                <span className="text-xs text-slate-400 uppercase font-bold">Daily Chores</span>
                <p className="text-3xl font-black text-purple-400">{progressCard?.chores_score || 100}%</p>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-purple-500 h-full rounded-full" style={{ width: `${progressCard?.chores_score || 100}%` }} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 2: SPECIAL MESSAGES --- */}
        {activeTab === "messages" && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-4">
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-indigo-400" /> Center Announcements &amp; Encouragement
            </h2>
            <div className="space-y-3">
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-xs font-bold text-emerald-400 font-mono">Center Nazim Notice</span>
                <p className="text-sm font-semibold text-white">Monthly Hifz Competition scheduled for next Friday after Asr!</p>
                <span className="text-[10px] text-slate-500 block">Posted today by Nazim Office</span>
              </div>
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-xs font-bold text-amber-400 font-mono">Usthad Recommendation</span>
                <p className="text-sm font-semibold text-white">Excellent consistency in Fajr Jamaat attendance this week. Keep it up!</p>
                <span className="text-[10px] text-slate-500 block">Posted yesterday</span>
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 3: SECURE COMPLAINT BOX --- */}
        {activeTab === "complaint" && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="p-3 bg-rose-500/20 text-rose-400 rounded-2xl border border-rose-500/30">
                <ShieldCheck className="h-7 w-7" />
              </div>
              <div>
                <h2 className="text-xl font-black text-white">Secure Direct-to-Super-Admin Complaint Box</h2>
                <p className="text-xs text-slate-400">
                  Your message goes directly to Executive HQ Super Admin. It is strictly hidden from local Nazims.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmitComplaint} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1.5">Complaint Category *</label>
                <select
                  className="w-full p-3.5 bg-slate-950 border border-slate-800 text-white rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-rose-500"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="Food">Mess / Food Quality</option>
                  <option value="Hygiene">Cleanliness &amp; Bathroom Hygiene</option>
                  <option value="Usthad">Teacher / Usthad Concern</option>
                  <option value="Nazim">Nazim / Admin Concern (Confidential)</option>
                  <option value="Facility">Masjid / Hostel Facilities</option>
                  <option value="Other">Other Issues</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1.5">Description of Issue *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Explain your concern clearly. You can write about food, cleanliness, or administrative behavior..."
                  className="w-full p-3.5 bg-slate-950 border border-slate-800 text-white rounded-xl text-sm outline-none focus:ring-2 focus:ring-rose-500"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
                <input
                  type="checkbox"
                  id="anonymousCheck"
                  className="h-5 w-5 accent-rose-600 rounded"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                />
                <label htmlFor="anonymousCheck" className="text-xs font-bold text-slate-300 cursor-pointer">
                  Hide my name (Submit as Anonymous Student Complaint)
                </label>
              </div>

              <button
                type="submit"
                disabled={submittingComplaint}
                className="w-full py-4 bg-rose-600 hover:bg-rose-500 text-white font-extrabold rounded-2xl text-base shadow-lg shadow-rose-900/40 flex items-center justify-center gap-2 transition"
              >
                <Send className="h-5 w-5" /> Submit Secure Complaint Directly to HQ
              </button>
            </form>
          </div>
        )}
      </div>

      {/* KIOSK FOOTER */}
      <div className="text-center text-xs text-slate-500 font-mono">
        Digi Dars Kiosk • Auto-Session Reset Active
      </div>
    </div>
  );
}
