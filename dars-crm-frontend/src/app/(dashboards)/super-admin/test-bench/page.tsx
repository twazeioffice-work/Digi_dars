"use client";

import React, { useState, useEffect } from "react";
import {
  Shield,
  Building,
  UserCheck,
  Award,
  AlertTriangle,
  Star,
  CheckSquare,
  Square,
  MessageSquare,
  Send,
  Lock,
  Search,
  Clock,
  Key,
  CreditCard,
  Phone,
  RefreshCw,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Eye,
  Sliders,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  FileText
} from "lucide-react";

// Initial Mock Datasets representing real-time system state
const INITIAL_STUDENTS = [
  { id: "stud-101", cardId: "STUD-101", name: "Zaid Ibrahim", parentPhone: "+919876543210", juz: "Juz 18 (Surah Al-Kahf)", attendance: 96, overallScore: 90, batch: "Hifz Batch A", usthadId: "ustad-01", centerCode: "CTR-01", pin: "1234" },
  { id: "stud-102", cardId: "STUD-102", name: "Nabeel Sajid", parentPhone: "+919876543211", juz: "Juz 12 (Surah Yusuf)", attendance: 94, overallScore: 90, batch: "Hifz Batch A", usthadId: "ustad-01", centerCode: "CTR-01", pin: "1234" },
  { id: "stud-103", cardId: "STUD-103", name: "Azaan Farooq", parentPhone: "+919876543212", juz: "Juz 5 (Surah An-Nisa)", attendance: 72, overallScore: 50, batch: "Hifz Batch A", usthadId: "ustad-01", centerCode: "CTR-01", pin: "1234" },
  { id: "stud-104", cardId: "STUD-104", name: "Yahiya Khan", parentPhone: "+919876543213", juz: "Juz 3 (Surah Al-Imran)", attendance: 65, overallScore: 40, batch: "Hifz Batch A", usthadId: "ustad-01", centerCode: "CTR-01", pin: "4444" },
  { id: "stud-105", cardId: "STUD-105", name: "Ayman Shah", parentPhone: "+919876543214", juz: "Juz 22 (Surah Ahzab)", attendance: 100, overallScore: 100, batch: "Tarbiyyah Batch B", usthadId: "ustad-02", centerCode: "CTR-01", pin: "1234" },
  { id: "stud-106", cardId: "STUD-106", name: "Zuhair Shah", parentPhone: "+919876543215", juz: "Juz 28 (Surah Mujadila)", attendance: 100, overallScore: 100, batch: "Tarbiyyah Batch B", usthadId: "ustad-02", centerCode: "CTR-01", pin: "1234" },
];

const INITIAL_STARS = [
  { id: "star-1", studentId: "stud-101", ustadName: "Usthad Ibrahim Kutty", category: "Tajweed Fluency", explanation: "Achieved flawless makhraj articulation during Sabaq evaluation.", date: "2026-08-12" },
  { id: "star-2", studentId: "stud-101", ustadName: "Usthad Ibrahim Kutty", category: "Namaz Discipline", explanation: "Punctual attendance for Fajr Jamaat prayer throughout the week.", date: "2026-08-10" },
  { id: "star-3", studentId: "stud-105", ustadName: "Usthad Abdul Rahman", category: "Noble Character", explanation: "Exemplary adab and mentoring junior students in class.", date: "2026-08-11" },
];

const INITIAL_WARNINGS = [
  { id: "warn-1", studentId: "stud-103", ustadName: "Usthad Ibrahim Kutty", severity: "MEDIUM", category: "Academic Negligence", reasoning: "Sabak revision incomplete for 3 consecutive days.", date: "2026-08-11" },
  { id: "warn-2", studentId: "stud-104", ustadName: "Usthad Ibrahim Kutty", severity: "HIGH", category: "Unexcused Absence", reasoning: "Missed Fajr Jamaat without prior leave application.", date: "2026-08-09" },
];

const INITIAL_LEAVES = [
  { id: "lv-101", type: "STUDENT", studentId: "stud-101", personName: "Zaid Ibrahim", centerCode: "CTR-01", startDate: "2026-08-18", endDate: "2026-08-20", reason: "Attending family wedding in Ernakulam", status: "PENDING" },
  { id: "lv-102", type: "STAFF", personName: "Usthad Ibrahim Kutty", centerCode: "CTR-01", startDate: "2026-08-22", endDate: "2026-08-23", reason: "Medical checkup for back pain", status: "PENDING" },
];

const INITIAL_COMPLAINTS = [
  { id: "cmpl-1", studentName: "Yahiya Khan", centerCode: "CTR-01", category: "Facility Issue", description: "Nazim locks study room early at 9 PM preventing night revision.", targetsAdmin: true, status: "PENDING" },
  { id: "cmpl-2", studentName: "Anonymous Student", centerCode: "CTR-01", category: "Academic Supply", description: "Requesting additional Tajweed reference books for library.", targetsAdmin: false, status: "PENDING" },
];

const INITIAL_UNLINKED_THREADS = [
  {
    phone: "+919000000000",
    lastMessage: "Hello, is this Al-Noor Madrasa? I want to ask about my son Nabeel's progress.",
    messages: [
      { id: "m1", direction: "INBOUND", text: "Hello, is this Al-Noor Madrasa? I want to ask about my son Nabeel's progress.", time: "10:15 AM" },
      { id: "m2", direction: "OUTBOUND", text: "Assalamu Alaikum. Please reply with your child's student registration ID or full name to verify your identity.", time: "10:18 AM" },
      { id: "m3", direction: "INBOUND", text: "His name is Nabeel Sajid, registration code STUD-102.", time: "10:20 AM" }
    ]
  }
];

export default function MasterTestBenchPage() {
  const [activeRole, setActiveRole] = useState<"SUPER_ADMIN" | "NAZIM" | "USTAD" | "KIOSK" | "WHATSAPP_SIM">("SUPER_ADMIN");

  // Shared Synchronized State Across All 5 Role Consoles
  const [students, setStudents] = useState(INITIAL_STUDENTS);
  const [stars, setStars] = useState(INITIAL_STARS);
  const [warnings, setWarnings] = useState(INITIAL_WARNINGS);
  const [leaves, setLeaves] = useState(INITIAL_LEAVES);
  const [complaints, setComplaints] = useState(INITIAL_COMPLAINTS);
  const [unlinkedThreads, setUnlinkedThreads] = useState(INITIAL_UNLINKED_THREADS);
  const [nazimDuties, setNazimDuties] = useState({ facilityInspection: true, attendanceAudit: true, financeLedger: true, eveningRoster: false });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>("stud-101");
  const [superAdminLeaveSubmenu, setSuperAdminLeaveSubmenu] = useState<"STUDENT" | "STAFF">("STUDENT");

  // Usthad Form State
  const [starForm, setStarForm] = useState({ studentId: "stud-101", category: "Tajweed Fluency", explanation: "" });
  const [warningForm, setWarningForm] = useState({ studentId: "stud-103", severity: "MEDIUM", category: "Tardiness", reasoning: "" });

  // Kiosk Form & Auto-Lock State
  const [kioskCardInput, setKioskCardInput] = useState("STUD-104");
  const [kioskPinInput, setKioskPinInput] = useState("4444");
  const [kioskLoggedInStudent, setKioskLoggedInStudent] = useState<any | null>(null);
  const [kioskComplaintText, setKioskComplaintText] = useState("");
  const [kioskTimer, setKioskTimer] = useState(60);

  // WhatsApp Simulator State
  const [waPhone, setWaPhone] = useState("+919876543210");
  const [waText, setWaText] = useState("Assalamu Alaikum Usthad, how is Zaid performing?");
  const [waLog, setWaLog] = useState<string[]>(["[System Init] WhatsApp WABA Router Ready."]);

  // Nazim Chat State
  const [nazimReplyText, setNazimReplyText] = useState("");
  const [selectedUnlinkedPhone, setSelectedUnlinkedPhone] = useState<string>("+919000000000");

  // Auto-lock timer effect for Kiosk
  useEffect(() => {
    let interval: any;
    if (kioskLoggedInStudent && kioskTimer > 0) {
      interval = setInterval(() => setKioskTimer((prev) => prev - 1), 1000);
    } else if (kioskTimer === 0) {
      setKioskLoggedInStudent(null);
      setKioskTimer(60);
    }
    return () => clearInterval(interval);
  }, [kioskLoggedInStudent, kioskTimer]);

  // Dynamic Score Engine Calculations
  const calcNazimDutyRating = () => {
    const total = Object.keys(nazimDuties).length;
    const completed = Object.values(nazimDuties).filter(Boolean).length;
    return (completed / total) * 100;
  };

  const calcUsthad1Rating = () => {
    // Batch A students: stud-101, 102, 103, 104
    const batchA = students.filter((s) => s.usthadId === "ustad-01");
    const underperforming = batchA.filter((s) => s.overallScore < 70).length;
    const failureRate = underperforming / batchA.length;
    let penalty = 0;
    if (failureRate >= 0.3) {
      penalty = 30.0;
    }
    return Math.max(0, 100 - penalty);
  };

  const calcUsthad2Rating = () => 100.0; // Batch B zero underperforming

  const calcCenterTotalScore = () => {
    const avgStudentScore = students.reduce((acc, s) => acc + s.overallScore, 0) / students.length; // 78.33
    const avgUsthadRating = (calcUsthad1Rating() + calcUsthad2Rating()) / 2; // (70 + 100)/2 = 85.0
    const nazimRating = calcNazimDutyRating(); // e.g. 75.0 or 100.0

    const score = avgStudentScore * 0.4 + avgUsthadRating * 0.35 + nazimRating * 0.25;
    return score.toFixed(2);
  };

  // Actions
  const handleAwardStar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!starForm.explanation.trim()) return;
    const newStar = {
      id: `star-${Date.now()}`,
      studentId: starForm.studentId,
      ustadName: "Usthad Ibrahim Kutty",
      category: starForm.category,
      explanation: starForm.explanation,
      date: new Date().toISOString().split("T")[0],
    };
    setStars([newStar, ...stars]);
    setStarForm({ ...starForm, explanation: "" });
    alert("⭐ Gold Star Badge awarded successfully!");
  };

  const handleIssueWarning = (e: React.FormEvent) => {
    e.preventDefault();
    if (!warningForm.reasoning.trim()) return;
    const newWarn = {
      id: `warn-${Date.now()}`,
      studentId: warningForm.studentId,
      ustadName: "Usthad Ibrahim Kutty",
      severity: warningForm.severity,
      category: warningForm.category,
      reasoning: warningForm.reasoning,
      date: new Date().toISOString().split("T")[0],
    };
    setWarnings([newWarn, ...warnings]);
    setWarningForm({ ...warningForm, reasoning: "" });
    alert("⚠️ Warning Record issued successfully!");
  };

  const handleKioskLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const st = students.find((s) => s.cardId === kioskCardInput && s.pin === kioskPinInput);
    if (st) {
      setKioskLoggedInStudent(st);
      setKioskTimer(60);
    } else {
      alert("Invalid Card ID or PIN!");
    }
  };

  const handleSubmitKioskComplaint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!kioskComplaintText.trim() || !kioskLoggedInStudent) return;
    const targetsAdmin = kioskComplaintText.toLowerCase().includes("nazim") || kioskComplaintText.toLowerCase().includes("admin");
    const newC = {
      id: `cmpl-${Date.now()}`,
      studentName: kioskLoggedInStudent.name,
      centerCode: kioskLoggedInStudent.centerCode,
      category: "Kiosk Grievance",
      description: kioskComplaintText,
      targetsAdmin: targetsAdmin,
      status: "PENDING",
    };
    setComplaints([newC, ...complaints]);
    setKioskComplaintText("");
    alert("🔒 Complaint submitted directly to Super Admin HQ! Local branch logs bypassed.");
  };

  const handleRerouteUnlinkedThread = (studentId: string) => {
    const st = students.find((s) => s.id === studentId);
    if (!st || !selectedUnlinkedPhone) return;

    // Link phone to student
    setStudents(students.map((s) => (s.id === studentId ? { ...s, parentPhone: selectedUnlinkedPhone } : s)));
    // Remove from unlinked
    setUnlinkedThreads(unlinkedThreads.filter((t) => t.phone !== selectedUnlinkedPhone));
    alert(`✅ Linked ${selectedUnlinkedPhone} to ${st.name}! Thread re-routed to Usthad Ibrahim's inbox.`);
  };

  const handleSendWaSim = (e: React.FormEvent) => {
    e.preventDefault();
    const isComplaint = waText.toLowerCase().includes("#complaint") || waText.toLowerCase().includes("complaint:");
    const isReg = students.find((s) => s.parentPhone === waPhone);

    let logMsg = "";
    if (isComplaint) {
      logMsg = `🚨 COMPLAINT EXTRATED from ${waPhone}: Routed directly to Super Admin HQ. Bypassed local branch.`;
      setComplaints([{ id: `cmpl-${Date.now()}`, studentName: isReg ? isReg.name : "WhatsApp Sender", centerCode: "CTR-01", category: "WhatsApp Grievance", description: waText, targetsAdmin: false, status: "PENDING" }, ...complaints]);
    } else if (isReg) {
      logMsg = `✅ MAPPED SENDER (${isReg.name}): Routed directly to Usthad's workspace.`;
    } else {
      logMsg = `⚠️ UNLINKED SENDER (${waPhone}): Flagged for Nazim Verification Workspace.`;
      setUnlinkedThreads([{ phone: waPhone, lastMessage: waText, messages: [{ id: `m-${Date.now()}`, direction: "INBOUND", text: waText, time: "Just now" }] }, ...unlinkedThreads]);
    }
    setWaLog([logMsg, ...waLog]);
    setWaText("");
  };

  const handleApproveLeave = (id: string) => {
    setLeaves(leaves.map((l) => (l.id === id ? { ...l, status: "APPROVED" } : l)));
  };

  const handleRejectLeave = (id: string) => {
    setLeaves(leaves.map((l) => (l.id === id ? { ...l, status: "REJECTED" } : l)));
  };

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.cardId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.centerCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedStudentObj = students.find((s) => s.id === selectedProfileId);
  const selectedStudentStars = stars.filter((st) => st.studentId === selectedProfileId);
  const selectedStudentWarnings = warnings.filter((w) => w.studentId === selectedProfileId);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* --- MASTER TEST BENCH ROLE SWITCHER HEADER --- */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-2xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl font-bold text-xs">
                🧪 E2E TEST BENCH
              </span>
              <h1 className="text-xl md:text-2xl font-black tracking-tight">Digi Dars Master Cockpit</h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Switch roles to inspect real-time state synchronization across Super Admin, Nazim, Usthad, Kiosk, and WhatsApp.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-800 p-1.5 rounded-xl border border-slate-700">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2">Role Cockpit:</span>
            <button
              onClick={() => setActiveRole("SUPER_ADMIN")}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs transition ${
                activeRole === "SUPER_ADMIN" ? "bg-emerald-600 text-white shadow-md" : "text-slate-400 hover:text-white"
              }`}
            >
              🏢 Super Admin
            </button>
            <button
              onClick={() => setActiveRole("NAZIM")}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs transition ${
                activeRole === "NAZIM" ? "bg-emerald-600 text-white shadow-md" : "text-slate-400 hover:text-white"
              }`}
            >
              👤 Nazim
            </button>
            <button
              onClick={() => setActiveRole("USTAD")}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs transition ${
                activeRole === "USTAD" ? "bg-emerald-600 text-white shadow-md" : "text-slate-400 hover:text-white"
              }`}
            >
              👳‍♂️ Usthad
            </button>
            <button
              onClick={() => setActiveRole("KIOSK")}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs transition ${
                activeRole === "KIOSK" ? "bg-emerald-600 text-white shadow-md" : "text-slate-400 hover:text-white"
              }`}
            >
              🖥️ Student Kiosk
            </button>
            <button
              onClick={() => setActiveRole("WHATSAPP_SIM")}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs transition ${
                activeRole === "WHATSAPP_SIM" ? "bg-emerald-600 text-white shadow-md" : "text-slate-400 hover:text-white"
              }`}
            >
              📱 WhatsApp Sim
            </button>
          </div>
        </div>

        {/* Global Live Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-800/80 text-xs">
          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
            <span className="text-slate-400 font-medium block">Center Score (CTR-01)</span>
            <span className="text-lg font-black text-emerald-400">{calcCenterTotalScore()} / 100</span>
          </div>
          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
            <span className="text-slate-400 font-medium block">Usthad Ibrahim Grade</span>
            <span className="text-lg font-black text-amber-400">{calcUsthad1Rating()} / 100 (-30pt)</span>
          </div>
          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
            <span className="text-slate-400 font-medium block">Nazim Compliance</span>
            <span className="text-lg font-black text-blue-400">{calcNazimDutyRating().toFixed(0)}%</span>
          </div>
          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
            <span className="text-slate-400 font-medium block">Unlinked Threads</span>
            <span className="text-lg font-black text-rose-400">{unlinkedThreads.length} Pending</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ROLE 1: SUPER ADMIN COCKPIT VIEW                                           */}
      {/* ========================================================================= */}
      {activeRole === "SUPER_ADMIN" && (
        <div className="space-y-6">
          {/* Top Row: Leaderboard & Safety Triage Box */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Multi-Level Leaderboard (5 cols) */}
            <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-amber-500" />
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">Multi-Level Leaderboard</h3>
                </div>
                <span className="text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md text-slate-600">
                  CTR-01
                </span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl space-y-2 border border-slate-200/60 dark:border-slate-700/60">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Student Avg Component (40%):</span>
                  <span className="font-mono font-bold text-emerald-600">78.3 (31.3 pts)</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Usthad Rating Component (35%):</span>
                  <span className="font-mono font-bold text-amber-600">85.0 (29.7 pts)</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Nazim Rating Component (25%):</span>
                  <span className="font-mono font-bold text-blue-600">{calcNazimDutyRating().toFixed(1)} ({(calcNazimDutyRating() * 0.25).toFixed(1)} pts)</span>
                </div>
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center text-sm font-black">
                  <span className="text-slate-900 dark:text-white">TOTAL INSTITUTION SCORE:</span>
                  <span className="text-emerald-600 font-mono text-base">{calcCenterTotalScore()} / 100</span>
                </div>
              </div>

              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 rounded-xl text-xs text-amber-800 dark:text-amber-300 space-y-1">
                <p className="font-bold flex items-center gap-1">
                  <AlertTriangle className="h-3.5 w-3.5" /> Progressive Penalty Active:
                </p>
                <p className="text-[11px]">
                  Usthad Ibrahim's Batch A failure rate is 50% (2 underperforming). A -30pt penalty is applied, reducing teacher rating from 100 to 70 and pulling down the center score.
                </p>
              </div>
            </div>

            {/* Confidential Safety Triage Box (7 cols) */}
            <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-rose-500" />
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">Direct-to-HQ Safety Triage</h3>
                    <p className="text-xs text-slate-500">Student & WhatsApp grievance isolation box</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/40 px-2.5 py-1 rounded-full border border-rose-200 dark:border-rose-900">
                  {complaints.length} Complaint(s)
                </span>
              </div>

              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {complaints.map((c) => (
                  <div key={c.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 bg-slate-50/50 dark:bg-slate-800/30">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                        <FileText className="h-3.5 w-3.5 text-slate-400" /> {c.studentName} ({c.centerCode})
                      </span>
                      {c.targetsAdmin ? (
                        <span className="text-[10px] font-bold text-rose-600 bg-rose-100 dark:bg-rose-950/60 px-2 py-0.5 rounded-full border border-rose-300">
                          🚨 Targets Local Admin
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-full border border-blue-200">
                          General Grievance
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                      "{c.description}"
                    </p>

                    {c.targetsAdmin && (
                      <div className="p-2.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-lg text-[11px] text-rose-800 dark:text-rose-300 font-semibold flex items-center gap-1.5">
                        <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                        SYSTEM SECURITY WARNING: Local delegation disabled to prevent retaliation against student.
                      </div>
                    )}

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        disabled={c.targetsAdmin}
                        className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 disabled:opacity-40 text-slate-700 dark:text-slate-300 font-bold rounded-lg text-xs"
                      >
                        Delegate to Nazim
                      </button>
                      <button
                        onClick={() => {
                          setComplaints(complaints.filter((item) => item.id !== c.id));
                          alert("✅ Confidential resolution executed by Super Admin HQ!");
                        }}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs shadow-sm"
                      >
                        Execute Direct Resolution
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Section: Search & Dossier View */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            {/* Submenus & Search */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl gap-1">
                <button
                  onClick={() => setSuperAdminLeaveSubmenu("STUDENT")}
                  className={`px-4 py-2 rounded-lg font-bold text-xs transition ${
                    superAdminLeaveSubmenu === "STUDENT" ? "bg-white dark:bg-slate-900 text-emerald-600 shadow-sm" : "text-slate-500"
                  }`}
                >
                  🎓 Student Profiles & Dossiers
                </button>
                <button
                  onClick={() => setSuperAdminLeaveSubmenu("STAFF")}
                  className={`px-4 py-2 rounded-lg font-bold text-xs transition ${
                    superAdminLeaveSubmenu === "STAFF" ? "bg-white dark:bg-slate-900 text-emerald-600 shadow-sm" : "text-slate-500"
                  }`}
                >
                  👳‍♂️ Staff & Teacher Applications
                </button>
              </div>

              <div className="relative w-full sm:w-80">
                <Search className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Unified search by STUD-101, Zaid, CTR-01..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>

            {/* Profile Grid & Dossier View */}
            {superAdminLeaveSubmenu === "STUDENT" ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Student Cards (5 cols) */}
                <div className="lg:col-span-5 space-y-3 max-h-[500px] overflow-y-auto pr-1">
                  {filteredStudents.map((st) => {
                    const isSelected = st.id === selectedProfileId;
                    return (
                      <div
                        key={st.id}
                        onClick={() => setSelectedProfileId(st.id)}
                        className={`p-4 rounded-xl border transition cursor-pointer ${
                          isSelected
                            ? "bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-500 shadow-sm"
                            : "bg-slate-50/50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-emerald-300"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white">{st.name}</h4>
                          <span className="text-[10px] font-mono font-bold bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded text-slate-700 dark:text-slate-300">
                            {st.cardId}
                          </span>
                        </div>

                        <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
                          <span>{st.batch}</span>
                          <span className={`font-bold ${st.overallScore < 70 ? "text-rose-600" : "text-emerald-600"}`}>
                            {st.overallScore}% Score
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Selected Student Dossier (7 cols) */}
                <div className="lg:col-span-7 bg-slate-50 dark:bg-slate-800/40 p-6 rounded-2xl border border-slate-200 dark:border-slate-700/60 space-y-5">
                  {selectedStudentObj ? (
                    <>
                      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
                        <div>
                          <h3 className="font-bold text-lg text-slate-900 dark:text-white">{selectedStudentObj.name}</h3>
                          <p className="text-xs text-slate-500">{selectedStudentObj.batch} • Center {selectedStudentObj.centerCode}</p>
                        </div>
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-300">
                          {selectedStudentObj.attendance}% Attendance
                        </span>
                      </div>

                      {/* Memorized Juz & Score */}
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                          <span className="text-slate-400 block font-medium">Hifz Progress</span>
                          <span className="font-bold text-slate-900 dark:text-white">{selectedStudentObj.juz}</span>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                          <span className="text-slate-400 block font-medium">Parent Phone</span>
                          <span className="font-mono font-bold text-slate-900 dark:text-white">{selectedStudentObj.parentPhone}</span>
                        </div>
                      </div>

                      {/* Gold Stars */}
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                          <Star className="h-4 w-4 fill-amber-400 text-amber-500" /> Gold Star Badges ("Why did they get a star?")
                        </h4>
                        {selectedStudentStars.length === 0 ? (
                          <p className="text-xs text-slate-400 italic">No gold stars awarded yet.</p>
                        ) : (
                          selectedStudentStars.map((st) => (
                            <div key={st.id} className="p-3 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-xl text-xs space-y-1">
                              <div className="flex justify-between font-bold text-amber-800 dark:text-amber-300">
                                <span>⭐ {st.category}</span>
                                <span className="text-[10px] text-amber-600">{st.date}</span>
                              </div>
                              <p className="text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed">"{st.explanation}"</p>
                              <span className="text-[10px] text-slate-400 block">Awarded by: {st.ustadName}</span>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Warnings */}
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                          <AlertTriangle className="h-4 w-4 text-rose-500" /> Warning Records ("Why did they get a warning?")
                        </h4>
                        {selectedStudentWarnings.length === 0 ? (
                          <p className="text-xs text-slate-400 italic">No warning records issued.</p>
                        ) : (
                          selectedStudentWarnings.map((w) => (
                            <div key={w.id} className="p-3 bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-xl text-xs space-y-1">
                              <div className="flex justify-between font-bold text-rose-800 dark:text-rose-300">
                                <span>⚠️ {w.category} ({w.severity})</span>
                                <span className="text-[10px] text-rose-600">{w.date}</span>
                              </div>
                              <p className="text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed">"{w.reasoning}"</p>
                              <span className="text-[10px] text-slate-400 block">Issued by: {w.ustadName}</span>
                            </div>
                          ))
                        )}
                      </div>
                    </>
                  ) : (
                    <p className="text-xs text-slate-400 text-center py-8">Select a student card from left to inspect dossier.</p>
                  )}
                </div>
              </div>
            ) : (
              /* Staff Submenu View */
              <div className="space-y-4">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Pending Leave Applications</h3>
                {leaves.map((l) => (
                  <div key={l.id} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">{l.personName}</span>
                        <span className="text-[10px] font-bold bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded text-slate-700 dark:text-slate-300">
                          {l.type}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        {l.startDate} to {l.endDate} • Reason: "{l.reason}"
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {l.status === "PENDING" ? (
                        <>
                          <button
                            onClick={() => handleApproveLeave(l.id)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs shadow-sm"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleRejectLeave(l.id)}
                            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs shadow-sm"
                          >
                            Reject
                          </button>
                        </>
                      ) : (
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${l.status === "APPROVED" ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}`}>
                          {l.status}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ROLE 2: LOCAL ADMIN (NAZIM) PORTAL VIEW                                    */}
      {/* ========================================================================= */}
      {activeRole === "NAZIM" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Operational Checklist (5 cols) */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <CheckSquare className="h-5 w-5 text-blue-500" />
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">Daily Operational Checklist</h3>
                  <p className="text-xs text-slate-500">Checking tasks updates Nazim rating & Center score</p>
                </div>
              </div>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-950/40 px-2.5 py-1 rounded-full">
                {calcNazimDutyRating().toFixed(0)}% Done
              </span>
            </div>

            <div className="space-y-3 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <label className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl cursor-pointer border border-slate-200/60 dark:border-slate-700/60">
                <input
                  type="checkbox"
                  checked={nazimDuties.facilityInspection}
                  onChange={(e) => setNazimDuties({ ...nazimDuties, facilityInspection: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded"
                />
                Facility & Hostel Inspection Completed
              </label>

              <label className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl cursor-pointer border border-slate-200/60 dark:border-slate-700/60">
                <input
                  type="checkbox"
                  checked={nazimDuties.attendanceAudit}
                  onChange={(e) => setNazimDuties({ ...nazimDuties, attendanceAudit: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded"
                />
                Morning Fajr Attendance Verification
              </label>

              <label className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl cursor-pointer border border-slate-200/60 dark:border-slate-700/60">
                <input
                  type="checkbox"
                  checked={nazimDuties.financeLedger}
                  onChange={(e) => setNazimDuties({ ...nazimDuties, financeLedger: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded"
                />
                Daily Zakat & Expense Entry Verification
              </label>

              <label className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl cursor-pointer border border-slate-200/60 dark:border-slate-700/60">
                <input
                  type="checkbox"
                  checked={nazimDuties.eveningRoster}
                  onChange={(e) => setNazimDuties({ ...nazimDuties, eveningRoster: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded"
                />
                Evening Class Roster & Usthad Compliance Audit
              </label>
            </div>
          </div>

          {/* Unlinked Parent Chat Handler (7 cols) */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-amber-500" />
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">Unlinked WhatsApp Verification Workspace</h3>
                  <p className="text-xs text-slate-500">Isolate unverified senders & link to student roster</p>
                </div>
              </div>
            </div>

            {unlinkedThreads.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                All parent numbers verified & linked!
              </div>
            ) : (
              unlinkedThreads.map((t) => (
                <div key={t.phone} className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-amber-500" /> {t.phone}
                    </span>
                    <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                      Unlinked Sender
                    </span>
                  </div>

                  <div className="space-y-2 max-h-36 overflow-y-auto bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                    {t.messages.map((m) => (
                      <div key={m.id} className="text-xs">
                        <span className="font-bold text-slate-500">{m.direction === "INBOUND" ? "Parent" : "Nazim"}:</span>{" "}
                        <span className="text-slate-800 dark:text-slate-200">{m.text}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleRerouteUnlinkedThread("stud-102")}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-sm flex items-center gap-1"
                    >
                      <UserCheck className="h-3.5 w-3.5" /> Link to Nabeel Sajid (STUD-102) & Re-Route
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ROLE 3: TEACHER (USTHAD) WORKSPACE VIEW                                    */}
      {/* ========================================================================= */}
      {activeRole === "USTAD" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Issue Stars & Warnings Console (6 cols) */}
          <div className="lg:col-span-6 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <Star className="h-5 w-5 fill-amber-400 text-amber-500" />
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Award Gold Star Badge</h3>
            </div>

            <form onSubmit={handleAwardStar} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-500 mb-1">Select Student</label>
                <select
                  value={starForm.studentId}
                  onChange={(e) => setStarForm({ ...starForm, studentId: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>{s.name} ({s.batch})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-500 mb-1">Achievement Category</label>
                <select
                  value={starForm.category}
                  onChange={(e) => setStarForm({ ...starForm, category: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold"
                >
                  <option value="Tajweed Fluency">Tajweed Fluency ⭐</option>
                  <option value="Namaz Discipline">Namaz Discipline 🕌</option>
                  <option value="Noble Character">Noble Character 🤝</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-500 mb-1">Explanation ("Why did they get a star?")</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Reason for awarding star..."
                  value={starForm.explanation}
                  onChange={(e) => setStarForm({ ...starForm, explanation: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                />
              </div>

              <button type="submit" className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-sm">
                Award Gold Star
              </button>
            </form>
          </div>

          {/* Issue Warnings Console (6 cols) */}
          <div className="lg:col-span-6 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <AlertTriangle className="h-5 w-5 text-rose-500" />
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Issue Warning Record</h3>
            </div>

            <form onSubmit={handleIssueWarning} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-500 mb-1">Select Student</label>
                <select
                  value={warningForm.studentId}
                  onChange={(e) => setWarningForm({ ...warningForm, studentId: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>{s.name} ({s.batch})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-500 mb-1">Severity</label>
                  <select
                    value={warningForm.severity}
                    onChange={(e) => setWarningForm({ ...warningForm, severity: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold"
                  >
                    <option value="LOW">LOW (Mild)</option>
                    <option value="MEDIUM">MEDIUM (Moderate)</option>
                    <option value="HIGH">HIGH (Severe)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-500 mb-1">Category</label>
                  <select
                    value={warningForm.category}
                    onChange={(e) => setWarningForm({ ...warningForm, category: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold"
                  >
                    <option value="Tardiness">Tardiness</option>
                    <option value="Academic Negligence">Academic Negligence</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-500 mb-1">Justification ("Why did they get a warning?")</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Explain teacher reasoning..."
                  value={warningForm.reasoning}
                  onChange={(e) => setWarningForm({ ...warningForm, reasoning: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                />
              </div>

              <button type="submit" className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-sm">
                Issue Warning Record
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ROLE 4: SHARED STUDENT KIOSK VIEW                                         */}
      {/* ========================================================================= */}
      {activeRole === "KIOSK" && (
        <div className="max-w-xl mx-auto bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">Hostel Kiosk Terminal</h2>
            <p className="text-xs text-slate-500">60-Second Auto-Lock Shared Student Interface</p>
          </div>

          {!kioskLoggedInStudent ? (
            <form onSubmit={handleKioskLogin} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-500 mb-1">Tap Card ID (e.g. STUD-104)</label>
                <input
                  type="text"
                  required
                  value={kioskCardInput}
                  onChange={(e) => setKioskCardInput(e.target.value)}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-sm font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-500 mb-1">Private Kiosk PIN (e.g. 4444)</label>
                <input
                  type="password"
                  required
                  value={kioskPinInput}
                  onChange={(e) => setKioskPinInput(e.target.value)}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-sm font-bold"
                />
              </div>

              <button type="submit" className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm shadow-md">
                Authenticate & Login
              </button>
            </form>
          ) : (
            <div className="space-y-5">
              <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-950/40 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-900">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">{kioskLoggedInStudent.name}</h3>
                  <p className="text-xs text-slate-500">{kioskLoggedInStudent.batch}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-emerald-600 block">{kioskTimer}s Auto-Lock</span>
                  <button onClick={() => setKioskLoggedInStudent(null)} className="text-[10px] font-bold text-rose-600 hover:underline">
                    Sign Out
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmitKioskComplaint} className="space-y-3 text-xs">
                <h4 className="font-bold text-slate-900 dark:text-white">Submit Confidential Complaint to HQ</h4>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe issue (e.g. 'Nazim locks study room early at 9 PM')..."
                  value={kioskComplaintText}
                  onChange={(e) => setKioskComplaintText(e.target.value)}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                />
                <button type="submit" className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-md">
                  Submit Direct-to-HQ Complaint
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* ROLE 5: WHATSAPP SIMULATOR PHONE VIEW                                     */}
      {/* ========================================================================= */}
      {activeRole === "WHATSAPP_SIM" && (
        <div className="max-w-md mx-auto bg-slate-900 text-white p-6 rounded-3xl border-4 border-slate-800 shadow-2xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-emerald-400" />
              <h3 className="font-bold text-base">WhatsApp Phone Simulator</h3>
            </div>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
              WABA Live
            </span>
          </div>

          <form onSubmit={handleSendWaSim} className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-slate-400 mb-1">Sender Phone Number</label>
              <select
                value={waPhone}
                onChange={(e) => setWaPhone(e.target.value)}
                className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl font-mono text-xs font-bold text-white"
              >
                <option value="+919876543210">+919876543210 (Zaid's Parent - Registered)</option>
                <option value="+919000000000">+919000000000 (Nabeel's Parent - Unlinked)</option>
                <option value="+919999999999">+919999999999 (Unknown Raw Sender)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-400 mb-1">Message Text (Include #complaint for HQ direct)</label>
              <textarea
                rows={3}
                required
                value={waText}
                onChange={(e) => setWaText(e.target.value)}
                className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-xs font-medium text-white"
              />
            </div>

            <button type="submit" className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md">
              Send WABA Message
            </button>
          </form>

          {/* Log Output */}
          <div className="p-3 bg-black/60 rounded-xl border border-slate-800 space-y-1 font-mono text-[11px] max-h-40 overflow-y-auto">
            <span className="text-slate-500 block font-bold">Routing Execution Log:</span>
            {waLog.map((log, idx) => (
              <p key={idx} className="text-emerald-400 leading-tight">{log}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
