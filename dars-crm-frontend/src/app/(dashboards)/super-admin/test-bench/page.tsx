"use client";

import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, CheckCircle, ArrowRight, Users, Bell, Search, AlertCircle, 
  ChevronRight, Building, Check, UserCheck, Star, Trash2, BookOpen, 
  Settings, ChefHat, CreditCard, DollarSign, Send, HelpCircle, Key, 
  Calendar, Award, MessageSquare, ClipboardList, Filter, Lock, Unlock, 
  RefreshCw, TrendingDown, ShoppingCart, UserPlus, Info
} from 'lucide-react';
import { 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, 
  ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar 
} from 'recharts';

// =============================================================================
// INITIAL UNIFIED DATA STATE (SHARED SEAMLESSLY BETWEEN PORTALS)
// =============================================================================

const INITIAL_STUDENTS = [
  {
    id: "stud_101",
    code: "STUD-101",
    name: "Zaid Ibrahim",
    centerId: "ctr_1",
    centerName: "Al-Noor Central (Calicut)",
    centerCode: "CTR-01",
    batchName: "Hifz Batch A",
    parentName: "Ibrahim Kutty (Father)",
    parentPhone: "+919876543210",
    overallScore: 90,
    attendanceRate: 95,
    memorizedJuz: "Juz 30, 29",
    sabakScore: 92,
    stars: [
      { id: "star_1", category: "Tajweed Fluency", date: "2026-08-10", teacher: "Usthad Ibrahim Kutty", explanation: "Excellent pronunciation and breath control during Surah Al-Mulk recitation." },
      { id: "star_2", category: "Namaz Discipline", date: "2026-08-12", teacher: "Usthad Ibrahim Kutty", explanation: "Consistently leading the student congregation for Fajr prayers." }
    ],
    warnings: [],
    leaveRequests: [
      { id: "sl_1", startDate: "2026-08-15", endDate: "2026-08-18", reason: "Attending family wedding in Ernakulam", status: "PENDING" }
    ]
  },
  {
    id: "stud_102",
    code: "STUD-102",
    name: "Nabeel Sajid",
    centerId: "ctr_1",
    centerName: "Al-Noor Central (Calicut)",
    centerCode: "CTR-01",
    batchName: "Hifz Batch A",
    parentName: "Sajid Rahman (Father)",
    parentPhone: "+919000000000", // Will start unlinked to test Nazim linking!
    overallScore: 88,
    attendanceRate: 92,
    memorizedJuz: "Juz 30",
    sabakScore: 86,
    stars: [
      { id: "star_3", category: "Adab & Hygiene", date: "2026-08-11", teacher: "Usthad Ibrahim Kutty", explanation: "Taking active responsibility in keeping the classroom tidy." }
    ],
    warnings: [
      { id: "warn_1", category: "Academic Negligence", severity: "medium", date: "2026-08-08", teacher: "Usthad Ibrahim Kutty", explanation: "Repeatedly failing to revise Sabak portion before morning Hifz class." }
    ],
    leaveRequests: []
  },
  {
    id: "stud_103",
    code: "STUD-103",
    name: "Azaan Farooq",
    centerId: "ctr_1",
    centerName: "Al-Noor Central (Calicut)",
    centerCode: "CTR-01",
    batchName: "Hifz Batch A",
    parentName: "Farooq Ahmed (Father)",
    parentPhone: "+919111111111",
    overallScore: 50, // Trigger for underperforming!
    attendanceRate: 70,
    memorizedJuz: "Juz 30",
    sabakScore: 55,
    stars: [],
    warnings: [
      { id: "warn_2", category: "Class Absenteeism", severity: "high", date: "2026-08-12", teacher: "Usthad Ibrahim Kutty", explanation: "Unexcused absence from morning Tajweed lessons on multiple days." },
      { id: "warn_3", category: "Chores Neglect", severity: "medium", date: "2026-08-13", teacher: "Usthad Ibrahim Kutty", explanation: "Refusing to assist in the daily hostel dining room cleanup." }
    ],
    leaveRequests: []
  },
  {
    id: "stud_104",
    code: "STUD-104",
    name: "Yahiya Khan",
    centerId: "ctr_1",
    centerName: "Al-Noor Central (Calicut)",
    centerCode: "CTR-01",
    batchName: "Hifz Batch A",
    parentName: "Yunus Khan (Father)",
    parentPhone: "+919222222222",
    overallScore: 40, // Trigger for underperforming!
    attendanceRate: 65,
    memorizedJuz: "Juz 30",
    sabakScore: 42,
    stars: [],
    warnings: [
      { id: "warn_4", category: "Hygiene Neglect", severity: "high", date: "2026-08-13", teacher: "Usthad Ibrahim Kutty", explanation: "Failure to clean bedroom and maintain basic personal hygiene logs." }
    ],
    leaveRequests: []
  },
  {
    id: "stud_201",
    code: "STUD-201",
    name: "Ayman Shah",
    centerId: "ctr_2",
    centerName: "Malappuram Hifz Academy",
    centerCode: "CTR-02",
    batchName: "Tarbiyyah Batch B",
    parentName: "Shahul Hameed (Father)",
    parentPhone: "+447123456789",
    overallScore: 100,
    attendanceRate: 100,
    memorizedJuz: "Juz 30, 29, 28",
    sabakScore: 98,
    stars: [
      { id: "star_4", category: "Namaz Discipline", date: "2026-08-13", teacher: "Usthad Abdul Rahman", explanation: "Flawless compliance with five daily prayers in congregation." }
    ],
    warnings: [],
    leaveRequests: []
  }
];

const INITIAL_STAFF = [
  {
    id: "staff_1",
    code: "STAF-001",
    name: "Usthad Ibrahim Kutty",
    role: "usthad",
    centerId: "ctr_1",
    centerName: "Al-Noor Central (Calicut)",
    baseSalary: 18000,
    advanceTaken: 2500,
    paymentMethod: "Bank Transfer",
    rating: 70, // Penalized rating
    batchManaged: "Hifz Batch A",
    isPaid: false,
    leaveRequests: [
      { id: "tl_1", startDate: "2026-08-20", endDate: "2026-08-22", reason: "Medical checkup for back pain", status: "PENDING" }
    ]
  },
  {
    id: "staff_2",
    code: "STAF-002",
    name: "Usthad Abdul Rahman",
    role: "usthad",
    centerId: "ctr_2",
    centerName: "Malappuram Hifz Academy",
    baseSalary: 19500,
    advanceTaken: 0,
    paymentMethod: "UPI",
    rating: 100,
    batchManaged: "Tarbiyyah Batch B",
    isPaid: false,
    leaveRequests: []
  },
  {
    id: "staff_3",
    code: "STAF-003",
    name: "Nazim Faisal",
    role: "nazim",
    centerId: "ctr_1",
    centerName: "Al-Noor Central (Calicut)",
    baseSalary: 22000,
    advanceTaken: 1000,
    paymentMethod: "Cash-in-hand",
    rating: 75,
    isPaid: false,
    leaveRequests: []
  }
];

const INITIAL_COMPLAINTS = [
  {
    id: "comp_1",
    centerId: "ctr_1",
    centerName: "Al-Noor Central (Calicut)",
    studentName: "Yahiya Khan",
    parentPhone: "+919222222222",
    description: "The local administrator (Nazim Faisal) is locking study rooms early, refusing to allow night Hifz revision without extra payments.",
    category: "Nazim Mismanagement",
    status: "pending_super_admin",
    createdAt: "2026-08-14"
  },
  {
    id: "comp_2",
    centerId: "ctr_1",
    centerName: "Al-Noor Central (Calicut)",
    studentName: "Azaan Farooq",
    parentPhone: "+919111111111",
    description: "The bathroom hygiene in the north hostel dormitory block is very bad. Need more regular cleanings.",
    category: "Hostel & Hygiene",
    status: "pending_super_admin",
    createdAt: "2026-08-14"
  }
];

const INITIAL_CHATS = [
  {
    id: "chat_1",
    parentPhone: "+919876543210",
    parentName: "Ibrahim Kutty (Father)",
    studentName: "Zaid Ibrahim",
    usthadId: "staff_1",
    isRecognized: true,
    messages: [
      { sender: "parent", text: "Assalamu Alaikum Usthad, how is my son Zaid doing in Tajweed classes?", time: "09:30 AM" },
      { sender: "usthad", text: "Wa Alaikumussalam, Zaid is progressing well. However, he needs to practice Surah Al-Mulk at night.", time: "09:45 AM" }
    ]
  },
  {
    id: "chat_2",
    parentPhone: "+919000000000", // Unlinked parent testing!
    parentName: "Unknown Parent",
    studentName: "Unlinked Roster",
    usthadId: null,
    isRecognized: false,
    messages: [
      { sender: "parent", text: "Hello, is this the Al-Noor Madrasa? I want to ask about my son Nabeel's progress.", time: "10:15 AM" }
    ]
  }
];

const INITIAL_KITCHEN_STOCK = [
  { item: "Basmati Rice", currentStock: "45 kg", neededQuantity: "50 kg", lastUpdated: "Today 07:00 AM" },
  { item: "Coconut Oil", currentStock: "8 Liters", neededQuantity: "15 Liters", lastUpdated: "Yesterday" },
  { item: "Onions & Potatoes", currentStock: "5 kg", neededQuantity: "25 kg", lastUpdated: "Today 07:00 AM" }
];

// =============================================================================
// MAIN APP COMPONENT
// =============================================================================

export default function UnifiedDarsCrmApp() {
  // Shared Live Application States
  const [activeRole, setActiveRole] = useState<'super_admin' | 'usthad' | 'nazim' | 'kiosk' | 'parent_sim'>('super_admin');
  const [students, setStudents] = useState(INITIAL_STUDENTS);
  const [staff, setStaff] = useState(INITIAL_STAFF);
  const [complaints, setComplaints] = useState(INITIAL_COMPLAINTS);
  const [chats, setChats] = useState(INITIAL_CHATS);
  const [isLibraryEnabled, setIsLibraryEnabled] = useState(false);
  const [kitchenStock, setKitchenStock] = useState(INITIAL_KITCHEN_STOCK);
  const [chatReplies, setChatReplies] = useState<Record<string, string>>({});
  
  // Cook Leave and Contingency State
  const [cookLeave, setCookLeave] = useState({
    isOnLeave: false,
    startDate: "",
    endDate: "",
    reason: "",
    contingencyPlan: ""
  });

  // Nazim's Duty Accomplishment Tracker
  const [nazimDuties, setNazimDuties] = useState([
    { id: "d1", title: "Daily Food Hygiene Inspection", isCompleted: true },
    { id: "d2", title: "Verify Attendance Logs Database", isCompleted: true },
    { id: "d3", title: "Record Parent WhatsApp Inbound Queries", isCompleted: false },
    { id: "d4", title: "Compile Monthly Payroll Sheet", isCompleted: true }
  ]);

  // Search filter and profile selection in Super Admin Leave and Dossier submenus
  const [adminSubmenu, setAdminSubmenu] = useState<'students' | 'staff'>('students');
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);

  // Super Admin Drill-down and Home States
  const [adminViewMode, setAdminViewMode] = useState<'home' | 'centers_list' | 'center_detail' | 'usthad_list' | 'student_list'>('home');
  const [selectedCenterId, setSelectedCenterId] = useState<string>('ctr_1');

  // Usthad Portal States
  const [selectedStudentId, setSelectedStudentId] = useState("stud_101");
  const [selectedClassTab, setSelectedClassTab] = useState<'tarbiyyah_logs' | 'behavior_star_warn' | 'whatsapp_chat' | 'library' | 'apply_leave'>('tarbiyyah_logs');
  
  // Dynamic Tarbiyyah checklist state for Usthad
  const [tarbiyyahLogs, setTarbiyyahLogs] = useState({
    namaz: true,
    hygiene: true,
    study: false,
    chores: true
  });

  // Action fields for Usthad issuing Star/Warning
  const [actionType, setActionType] = useState<'star' | 'warning'>('star');
  const [actionCategory, setActionCategory] = useState("Tajweed Fluency");
  const [actionSeverity, setActionSeverity] = useState("medium");
  const [actionExplanation, setActionExplanation] = useState("");

  // Usthad Leave Form
  const [usthadLeaveReason, setUsthadLeaveReason] = useState("");
  const [usthadLeaveStart, setUsthadLeaveStart] = useState("2026-08-25");
  const [usthadLeaveEnd, setUsthadLeaveEnd] = useState("2026-08-27");

  // Alim Library State (Usthad View)
  const [libraryQuery, setLibraryQuery] = useState("");
  const [libraryResults, setLibraryResults] = useState<any[]>([]);
  const [isLoadingLibrary, setIsLoadingLibrary] = useState(false);

  // Nazim Workspace States
  const [nazimActiveTab, setNazimActiveTab] = useState<'payroll' | 'contingency' | 'unlinked_chats' | 'store_room' | 'checklist'>('payroll');
  const [selectedUnlinkedChat, setSelectedUnlinkedChat] = useState<any>(null);
  const [linkStudentRosterSearch, setLinkStudentRosterSearch] = useState("");

  // Student Kiosk States
  const [kioskCardId, setKioskCardId] = useState("");
  const [kioskPin, setKioskPin] = useState("");
  const [loggedInKioskStudent, setLoggedInKioskStudent] = useState<any>(null);
  const [kioskError, setKioskError] = useState("");
  const [kioskComplaintCategory, setKioskComplaintCategory] = useState("Hostel & Hygiene");
  const [kioskComplaintText, setKioskComplaintText] = useState("");
  const [kioskInactivityTimer, setKioskInactivityTimer] = useState(60);

  // Parent WhatsApp Simulator States
  const [simPhoneNumber, setSimPhoneNumber] = useState("+919876543210");
  const [simMessageText, setSimMessageText] = useState("");

  // =============================================================================
  // DYNAMIC CALCULATIONS & EFFECT WORKFLOWS
  // =============================================================================

  // Calculate Nazim Rating based on duty checkboxes
  useEffect(() => {
    const completed = nazimDuties.filter(d => d.isCompleted).length;
    const rate = Math.round((completed / nazimDuties.length) * 100);
    setStaff(prev => prev.map(s => s.role === 'nazim' ? { ...s, rating: rate } : s));
  }, [nazimDuties]);

  // Recalculate Usthad Ibrahim's rating based on batch failure rates
  useEffect(() => {
    // Ibrahim's batch has: stud_101, stud_102, stud_103, stud_104
    const ibrahimStudents = students.filter(s => s.centerId === 'ctr_1' && s.batchName === 'Hifz Batch A');
    const underperforming = ibrahimStudents.filter(s => s.overallScore < 70).length;
    const failureRate = underperforming / ibrahimStudents.length;

    let penalty = 0;
    if (failureRate > 0.30) {
      penalty = (failureRate - 0.30) * 100 * 1.5;
    }
    const finalRating = Math.max(0, 100 - Math.round(penalty));

    setStaff(prev => prev.map(s => s.id === 'staff_1' ? { ...s, rating: finalRating } : s));
  }, [students]);

  // Simulated kiosk auto lock timer
  useEffect(() => {
    let interval: any = null;
    if (loggedInKioskStudent) {
      interval = setInterval(() => {
        setKioskInactivityTimer(prev => {
          if (prev <= 1) {
            setLoggedInKioskStudent(null);
            setKioskCardId("");
            setKioskPin("");
            return 60;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setKioskInactivityTimer(60);
    }
    return () => clearInterval(interval);
  }, [loggedInKioskStudent]);

  // Handle Parent WhatsApp Inbound Simulator sending
  const handleSimulateWhatsAppMessage = () => {
    if (!simMessageText.trim()) return;

    // Check if number matches registered student
    const matchedStudent = students.find(s => s.parentPhone === simPhoneNumber);
    
    if (matchedStudent) {
      // Is it a #complaint?
      const isComplaint = simMessageText.toLowerCase().includes("complaint") || simMessageText.startsWith("#complaint");
      
      if (isComplaint) {
        const newComplaint = {
          id: `comp_${Date.now()}`,
          centerId: matchedStudent.centerId,
          centerName: matchedStudent.centerName,
          studentName: matchedStudent.name,
          parentPhone: simPhoneNumber,
          description: simMessageText.replace("#complaint", "").trim(),
          category: "Parent Direct Complaint",
          status: "pending_super_admin",
          createdAt: new Date().toISOString().split('T')[0]
        };
        setComplaints(prev => [newComplaint, ...prev]);
        alert("🚨 Complaint submitted securely and routed directly to the Super Admin panel!");
      } else {
        // Standard Usthad message routing
        setChats(prev => prev.map(chat => {
          if (chat.parentPhone === simPhoneNumber) {
            return {
              ...chat,
              messages: [...chat.messages, { sender: 'parent', text: simMessageText, time: 'Now' }]
            };
          }
          return chat;
        }));
      }
    } else {
      // Unrecognized sender message
      const existingChat = chats.find(c => c.parentPhone === simPhoneNumber);
      if (existingChat) {
        setChats(prev => prev.map(chat => {
          if (chat.parentPhone === simPhoneNumber) {
            return {
              ...chat,
              messages: [...chat.messages, { sender: 'parent', text: simMessageText, time: 'Now' }]
            };
          }
          return chat;
        }));
      } else {
        const newChat = {
          id: `chat_${Date.now()}`,
          parentPhone: simPhoneNumber,
          parentName: "Unknown Parent",
          studentName: "Unlinked Roster",
          usthadId: null,
          isRecognized: false,
          messages: [{ sender: 'parent', text: simMessageText, time: 'Now' }]
        };
        setChats(prev => [...prev, newChat]);
      }
    }

    setSimMessageText("");
  };

  // Student Kiosk PIN Login execution
  const handleKioskLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const found = students.find(s => s.code === kioskCardId);
    if (!found) {
      setKioskError("Student Card ID not recognized.");
      return;
    }
    // Simple mock credential checking
    const mockPins: Record<string, string> = {
      "STUD-101": "1111",
      "STUD-102": "2222",
      "STUD-103": "3333",
      "STUD-104": "4444",
      "STUD-201": "5555"
    };
    if (mockPins[kioskCardId] !== kioskPin) {
      setKioskError("Incorrect 4-digit PIN.");
      return;
    }

    setLoggedInKioskStudent(found);
    setKioskError("");
    setKioskInactivityTimer(60);
  };

  // Student submits direct complaint via kiosk
  const handleKioskComplaintSubmit = () => {
    if (!kioskComplaintText.trim() || !loggedInKioskStudent) return;

    const newComp = {
      id: `comp_${Date.now()}`,
      centerId: loggedInKioskStudent.centerId,
      centerName: loggedInKioskStudent.centerName,
      studentName: loggedInKioskStudent.name,
      parentPhone: loggedInKioskStudent.parentPhone,
      description: kioskComplaintText,
      category: kioskComplaintCategory,
      status: "pending_super_admin",
      createdAt: new Date().toISOString().split('T')[0]
    };

    setComplaints(prev => [newComp, ...prev]);
    setKioskComplaintText("");
    alert("🔒 Your complaint has been sent directly to the Super Admin. The local staff will not see this.");
  };

  // Alim Library Search Proxy (Simulated)
  const handleLibrarySearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!libraryQuery.trim()) return;

    setIsLoadingLibrary(true);
    // Simulate fetching from Sunnah cloud API
    setTimeout(() => {
      const mockHadiths = [
        {
          id: "h1",
          collection: "Sahih al-Bukhari",
          book: "Book of Tahajjud",
          hadithNumber: 1120,
          text_en: "Our Lord, the Blessed, the Superior, comes down every night to the nearest Heaven during the last third of the night...",
          grade: "Sahih (Verified by Alim Board)"
        },
        {
          id: "h2",
          collection: "Riyad as-Salihin",
          book: "Book of Virtues",
          hadithNumber: 1161,
          text_en: "Establish prayer during the night, for indeed it was the practice of the righteous people before you...",
          grade: "Sahih (Verified by Alim Board)"
        }
      ];
      setLibraryResults(mockHadiths);
      setIsLoadingLibrary(false);
    }, 800);
  };

  // Dynamic filter for Super Admin leave and rosters search bar
  const filteredStudents = students.filter(student => {
    const q = searchQuery.toLowerCase();
    return (
      student.name.toLowerCase().includes(q) ||
      student.code.toLowerCase().includes(q) ||
      student.centerName.toLowerCase().includes(q) ||
      student.centerCode.toLowerCase().includes(q)
    );
  });

  const filteredStaff = staff.filter(member => {
    const q = searchQuery.toLowerCase();
    return (
      member.name.toLowerCase().includes(q) ||
      member.code.toLowerCase().includes(q) ||
      member.centerName.toLowerCase().includes(q)
    );
  });

  const activeProfile = adminSubmenu === 'students' 
    ? students.find(s => s.id === selectedProfileId)
    : staff.find(st => st.id === selectedProfileId);

  // Score aggregations for the Super Admin leaderboard
  const avgStudentScore = Math.round(students.reduce((acc, s) => acc + s.overallScore, 0) / students.length);
  const avgUsthadScore = Math.round(staff.filter(s => s.role === 'usthad').reduce((acc, s) => acc + s.rating, 0) / staff.filter(s => s.role === 'usthad').length);
  const nazimScore = staff.find(s => s.role === 'nazim')?.rating || 0;
  const overallInstitutionScore = Math.round((avgStudentScore * 0.4) + (avgUsthadScore * 0.35) + (nazimScore * 0.25));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col selection:bg-teal-500/30 selection:text-teal-200">
      
      {/* =============================================================================
          MASTER GLOBAL ROLE NAV (SIMULATES COMPLETE SYSTEM INTERCONNECIVITY)
          ============================================================================= */}
      <div className="bg-slate-900 border-b border-slate-800 p-3 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-teal-500 flex items-center justify-center font-black text-slate-950 shadow-md shadow-teal-500/20">
              D
            </div>
            <div>
              <span className="font-bold tracking-tight text-white text-sm">DIGI DARS PLATFORM COCKPIT</span>
              <p className="text-[10px] text-teal-400 font-semibold tracking-wider uppercase">Active Integration Workspace</p>
            </div>
          </div>
          
          <div className="flex items-center flex-wrap gap-1.5 bg-slate-950/80 p-1 rounded-lg border border-slate-800 self-start md:self-auto">
            <span className="text-[10px] text-slate-400 font-bold px-2">SWITCH PORTAL:</span>
            <button 
              onClick={() => { setActiveRole('super_admin'); setSelectedProfileId(null); }}
              className={`px-2.5 py-1 rounded text-xs font-bold transition flex items-center gap-1 ${activeRole === 'super_admin' ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/10' : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900'}`}
            >
              <Key className="h-3 w-3" /> Super Admin
            </button>
            <button 
              onClick={() => setActiveRole('usthad')}
              className={`px-2.5 py-1 rounded text-xs font-bold transition flex items-center gap-1 ${activeRole === 'usthad' ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/10' : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900'}`}
            >
              <Award className="h-3 w-3" /> Usthad Portal
            </button>
            <button 
              onClick={() => setActiveRole('nazim')}
              className={`px-2.5 py-1 rounded text-xs font-bold transition flex items-center gap-1 ${activeRole === 'nazim' ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/10' : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900'}`}
            >
              <Building className="h-3 w-3" /> Nazim Workspace
            </button>
            <button 
              onClick={() => setActiveRole('kiosk')}
              className={`px-2.5 py-1 rounded text-xs font-bold transition flex items-center gap-1 ${activeRole === 'kiosk' ? 'bg-rose-500 text-white shadow-md shadow-rose-500/10' : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900'}`}
            >
              <ChefHat className="h-3 w-3" /> Hostel Kiosk
            </button>
            <button 
              onClick={() => setActiveRole('parent_sim')}
              className={`px-2.5 py-1 rounded text-xs font-bold transition flex items-center gap-1 ${activeRole === 'parent_sim' ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10' : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900'}`}
            >
              <MessageSquare className="h-3 w-3" /> WhatsApp Simulator
            </button>
          </div>
        </div>
      </div>

      {/* =============================================================================
          ROLE 1: SUPER ADMIN CONTROL PANEL ("HOME" GLOBAL DASHBOARD WITH FULL DRILL-DOWN)
          ============================================================================= */}
      {activeRole === 'super_admin' && (() => {
        // Dynamic metrics calculation for centers:
        // Center 1: Al-Noor Central (Calicut)
        const ctr1Students = students.filter(s => s.centerId === 'ctr_1');
        const ctr1AvgStudent = ctr1Students.length > 0 ? Math.round(ctr1Students.reduce((acc, s) => acc + s.overallScore, 0) / ctr1Students.length) : 0;
        const ctr1StaffUsthads = staff.filter(s => s.centerId === 'ctr_1' && s.role === 'usthad');
        const ctr1AvgUsthad = ctr1StaffUsthads.length > 0 ? Math.round(ctr1StaffUsthads.reduce((acc, s) => acc + s.rating, 0) / ctr1StaffUsthads.length) : 0;
        const ctr1NazimRating = staff.find(s => s.centerId === 'ctr_1' && s.role === 'nazim')?.rating || 0;
        const ctr1OverallScore = Math.round((ctr1AvgStudent * 0.4) + (ctr1AvgUsthad * 0.35) + (ctr1NazimRating * 0.25));

        // Center 2: Malappuram Hifz Academy
        const ctr2Students = students.filter(s => s.centerId === 'ctr_2');
        const ctr2AvgStudent = ctr2Students.length > 0 ? Math.round(ctr2Students.reduce((acc, s) => acc + s.overallScore, 0) / ctr2Students.length) : 100;
        const ctr2StaffUsthads = staff.filter(s => s.centerId === 'ctr_2' && s.role === 'usthad');
        const ctr2AvgUsthad = ctr2StaffUsthads.length > 0 ? Math.round(ctr2StaffUsthads.reduce((acc, s) => acc + s.rating, 0) / ctr2StaffUsthads.length) : 100;
        const ctr2NazimRating = staff.find(s => s.centerId === 'ctr_2' && s.role === 'nazim')?.rating || 100;
        const ctr2OverallScore = Math.round((ctr2AvgStudent * 0.4) + (ctr2AvgUsthad * 0.35) + (ctr2NazimRating * 0.25));

        // Average Ranking of all centers (Calicut & Malappuram)
        const avgCentersRanking = Math.round((ctr1OverallScore + ctr2OverallScore) / 2);

        // Core Aggregates
        const avgStudentScore = Math.round(students.reduce((acc, s) => acc + s.overallScore, 0) / students.length);

        return (
          <div className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">
            
            {/* Dashboard breadcrumb and title banner */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                  <Settings className="h-6 w-6 text-teal-400 animate-spin-slow" />
                  Super Admin HQ Portal - "Home" Overview
                </h2>
                <p className="text-xs text-slate-400">Centralized governance panel, multi-tenant monitoring, and scholastic auditing</p>
              </div>
              
              {/* Breadcrumb Indicator */}
              <div className="flex items-center gap-2 bg-slate-900 border border-slate-850 p-1.5 px-3 rounded-lg text-xs font-semibold">
                <span className="text-slate-500 cursor-pointer hover:text-slate-300" onClick={() => setAdminViewMode('home')}>Home</span>
                {adminViewMode !== 'home' && <span className="text-slate-600">/</span>}
                {adminViewMode === 'centers_list' && <span className="text-teal-400">Centers Rankings</span>}
                {adminViewMode === 'center_detail' && (
                  <>
                    <span className="text-slate-500 cursor-pointer hover:text-slate-300" onClick={() => setAdminViewMode('centers_list')}>Centers</span>
                    <span className="text-slate-600">/</span>
                    <span className="text-teal-400">{selectedCenterId === 'ctr_1' ? 'Calicut' : 'Malappuram'}</span>
                  </>
                )}
                {adminViewMode === 'usthad_list' && (
                  <>
                    <span className="text-slate-500 cursor-pointer hover:text-slate-300" onClick={() => setAdminViewMode('center_detail')}>Center Detail</span>
                    <span className="text-slate-600">/</span>
                    <span className="text-teal-400">Usthads List</span>
                  </>
                )}
                {adminViewMode === 'student_list' && (
                  <>
                    <span className="text-slate-500 cursor-pointer hover:text-slate-300" onClick={() => setAdminViewMode('center_detail')}>Center Detail</span>
                    <span className="text-slate-600">/</span>
                    <span className="text-teal-400">Students List</span>
                  </>
                )}
              </div>
            </div>

            {/* OVERVIEW OF ALL FACILITIES (6 CARDS WITH DIRECT INTERACTION) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              
              {/* CARD 1: WHATSAPP MESSAGES PENDING */}
              <div 
                onClick={() => {
                  setActiveRole('nazim');
                  setNazimActiveTab('unlinked_chats');
                  alert("🔄 Navigating to Nazim Workspace -> 'Unlinked Chats' to resolve parent queries.");
                }}
                className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col justify-between hover:border-teal-500/50 cursor-pointer transition shadow-md shadow-slate-950/20 group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] text-teal-400 font-extrabold tracking-wider uppercase">WhatsApp Pending</span>
                  <MessageSquare className="h-4.5 w-4.5 text-teal-400 group-hover:scale-110 transition" />
                </div>
                <div>
                  <span className="text-2xl font-black text-white block">
                    {chats.filter(c => !c.isRecognized || c.messages.some(m => m.sender === 'parent')).length} Thread(s)
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium block mt-1">Pending parent inquiries</span>
                </div>
              </div>

              {/* CARD 2: COMPLAINTS PENDING */}
              <div 
                onClick={() => {
                  const element = document.getElementById('complaints-section');
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                  } else {
                    alert("Scroll down to inspect the Student/Parent Complaints Pipeline!");
                  }
                }}
                className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col justify-between hover:border-rose-500/50 cursor-pointer transition shadow-md shadow-slate-950/20 group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] text-rose-400 font-extrabold tracking-wider uppercase">Complaints Open</span>
                  <ShieldAlert className="h-4.5 w-4.5 text-rose-400 animate-pulse group-hover:scale-110 transition" />
                </div>
                <div>
                  <span className="text-2xl font-black text-rose-400 block">
                    {complaints.filter(c => c.status === 'pending_super_admin').length} Active
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium block mt-1">Confidential student reports</span>
                </div>
              </div>

              {/* CARD 3: INCOME */}
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col justify-between shadow-md shadow-slate-950/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] text-emerald-400 font-extrabold tracking-wider uppercase">Monthly Income</span>
                  <DollarSign className="h-4.5 w-4.5 text-emerald-400" />
                </div>
                <div>
                  <span className="text-2xl font-black text-emerald-400 block">₹1,85,000</span>
                  <span className="text-[10px] text-slate-500 font-medium block mt-1">Fee and Zakat collections</span>
                </div>
              </div>

              {/* CARD 4: SPENDING */}
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col justify-between shadow-md shadow-slate-950/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] text-rose-400 font-extrabold tracking-wider uppercase">Monthly Spending</span>
                  <CreditCard className="h-4.5 w-4.5 text-rose-400" />
                </div>
                <div>
                  <span className="text-2xl font-black text-rose-400 block">₹50,500</span>
                  <span className="text-[10px] text-slate-500 font-medium block mt-1">Payroll & food operations</span>
                </div>
              </div>

              {/* CARD 5: TOTAL GRADING OF STUDENTS */}
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col justify-between shadow-md shadow-slate-950/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] text-indigo-400 font-extrabold tracking-wider uppercase">Student Grading</span>
                  <Users className="h-4.5 w-4.5 text-indigo-400" />
                </div>
                <div>
                  <span className="text-2xl font-black text-indigo-400 block">{avgStudentScore}% Avg</span>
                  <span className="text-[10px] text-slate-500 font-medium block mt-1">All branches cumulative</span>
                </div>
              </div>

              {/* CARD 6: AVERAGE RANKING OF ALL CENTERS (CLICKABLE INTERACTIVE ENTRY) */}
              <div 
                onClick={() => {
                  setAdminViewMode('centers_list');
                }}
                className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col justify-between hover:border-amber-500/50 cursor-pointer transition shadow-md shadow-slate-950/20 group border-dashed"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] text-amber-400 font-extrabold tracking-wider uppercase">Centers Average</span>
                  <Award className="h-4.5 w-4.5 text-amber-400 group-hover:scale-110 transition animate-bounce" />
                </div>
                <div>
                  <span className="text-2xl font-black text-amber-400 block">
                    {avgCentersRanking}% Avg
                  </span>
                  <span className="text-[10px] text-amber-400/80 font-extrabold block mt-1 underline">Click to view list</span>
                </div>
              </div>

            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* LEFT COLUMN: ACTIVE INTERACTIVE SUBVIEWS OR GENERAL WORKSPACES */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* SUBVIEW 1A: DEFAULT DIRECTORY SEARCH OVERVIEW */}
                {adminViewMode === 'home' && (
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                      <div>
                        <h3 className="font-bold text-white flex items-center gap-2">
                          <ClipboardList className="h-5 w-5 text-teal-400" />
                          Oversight & Leaves Directory
                        </h3>
                        <p className="text-xs text-slate-400">Search and approve profiles across all network branches</p>
                      </div>
                      
                      {/* Leaves sub-menus toggler */}
                      <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
                        <button 
                          onClick={() => { setAdminSubmenu('students'); setSelectedProfileId(null); }}
                          className={`px-3 py-1 rounded-md text-xs font-bold transition ${adminSubmenu === 'students' ? 'bg-teal-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-slate-100'}`}
                        >
                          Students Directory
                        </button>
                        <button 
                          onClick={() => { setAdminSubmenu('staff'); setSelectedProfileId(null); }}
                          className={`px-3 py-1 rounded-md text-xs font-bold transition ${adminSubmenu === 'staff' ? 'bg-teal-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-slate-100'}`}
                        >
                          Staff Directory
                        </button>
                      </div>
                    </div>

                    {/* Top Search bar */}
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4.5 w-4.5 text-slate-500" />
                      <input 
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={adminSubmenu === 'students' ? "Search student name, code, center name, or code..." : "Search staff name, code, center..."}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-white"
                      />
                    </div>

                    {/* Directory Result List */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[350px] overflow-y-auto pr-1">
                      {adminSubmenu === 'students' ? (
                        filteredStudents.map(student => (
                          <div 
                            key={student.id}
                            onClick={() => setSelectedProfileId(student.id)}
                            className={`p-4 rounded-xl border cursor-pointer transition flex justify-between items-start ${selectedProfileId === student.id ? 'bg-teal-500/5 border-teal-500' : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'}`}
                          >
                            <div>
                              <div className="flex items-center gap-1.5 mb-1">
                                <span className="text-[10px] bg-slate-800 text-slate-300 font-bold px-1.5 py-0.5 rounded uppercase">
                                  {student.code}
                                </span>
                                <span className="text-[10px] bg-teal-500/10 text-teal-400 font-bold px-1.5 py-0.5 rounded">
                                  {student.centerCode}
                                </span>
                              </div>
                              <h4 className="font-bold text-white text-sm">{student.name}</h4>
                              <p className="text-[11px] text-slate-400">{student.centerName} | {student.batchName}</p>
                            </div>
                            
                            <div className="text-right">
                              <span className={`text-xs font-black block ${student.overallScore >= 70 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {student.overallScore}% Grade
                              </span>
                              {student.leaveRequests.some(l => l.status === 'PENDING') && (
                                <span className="text-[9px] bg-amber-500/20 text-amber-400 font-bold px-1 py-0.5 rounded block mt-1 animate-pulse">
                                  Leave Pending
                                </span>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        filteredStaff.map(member => (
                          <div 
                            key={member.id}
                            onClick={() => setSelectedProfileId(member.id)}
                            className={`p-4 rounded-xl border cursor-pointer transition flex justify-between items-start ${selectedProfileId === member.id ? 'bg-teal-500/5 border-teal-500' : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'}`}
                          >
                            <div>
                              <div className="flex items-center gap-1.5 mb-1">
                                <span className="text-[10px] bg-slate-800 text-slate-300 font-bold px-1.5 py-0.5 rounded uppercase">
                                  {member.code}
                                </span>
                                <span className="text-[10px] bg-indigo-500/10 text-indigo-400 font-bold px-1.5 py-0.5 rounded uppercase">
                                  {member.role}
                                </span>
                              </div>
                              <h4 className="font-bold text-white text-sm">{member.name}</h4>
                              <p className="text-[11px] text-slate-400">{member.centerName}</p>
                            </div>
                            
                            <div className="text-right">
                              <span className={`text-xs font-black block ${member.rating >= 80 ? 'text-emerald-400' : member.rating >= 70 ? 'text-amber-400' : 'text-rose-400'}`}>
                                {member.rating}/100 Rating
                              </span>
                              {member.leaveRequests && member.leaveRequests.some(l => l.status === 'PENDING') && (
                                <span className="text-[9px] bg-amber-500/20 text-amber-400 font-bold px-1 py-0.5 rounded block mt-1 animate-pulse">
                                  Leave Pending
                                </span>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* SUBVIEW 1B: CENTER-WISE RANKINGS LIST */}
                {adminViewMode === 'centers_list' && (
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl animate-fadeIn">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div>
                        <h3 className="font-bold text-white flex items-center gap-2">
                          <Award className="h-5 w-5 text-amber-400" />
                          Center-wise Rankings Leaderboard
                        </h3>
                        <p className="text-xs text-slate-400">Relative performance index across all network institutions</p>
                      </div>
                      <button 
                        onClick={() => setAdminViewMode('home')}
                        className="bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-bold px-3 py-1.5 rounded-lg transition"
                      >
                        ← Back Home
                      </button>
                    </div>

                    <div className="space-y-3">
                      {/* CENTER CARD 1: CTR-02 (Malappuram) */}
                      <div 
                        onClick={() => {
                          setSelectedCenterId('ctr_2');
                          setAdminViewMode('center_detail');
                        }}
                        className="bg-slate-950/60 hover:bg-slate-900 border border-slate-800 hover:border-teal-500/40 p-4 rounded-xl cursor-pointer transition flex items-center justify-between gap-4 group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-extrabold text-sm">
                            #1
                          </div>
                          <div>
                            <h4 className="font-bold text-white text-sm group-hover:text-teal-400 transition">Malappuram Hifz Academy</h4>
                            <span className="text-[11px] bg-slate-900 text-slate-400 font-bold px-2 py-0.5 rounded border border-slate-800 uppercase">Code: CTR-02</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-black text-emerald-400 block">{ctr2OverallScore}%</span>
                          <span className="text-[10px] text-slate-500">Global Score</span>
                        </div>
                      </div>

                      {/* CENTER CARD 2: CTR-01 (Calicut) */}
                      <div 
                        onClick={() => {
                          setSelectedCenterId('ctr_1');
                          setAdminViewMode('center_detail');
                        }}
                        className="bg-slate-950/60 hover:bg-slate-900 border border-slate-800 hover:border-teal-500/40 p-4 rounded-xl cursor-pointer transition flex items-center justify-between gap-4 group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-lg bg-slate-800 border border-slate-750 flex items-center justify-center text-slate-400 font-extrabold text-sm">
                            #2
                          </div>
                          <div>
                            <h4 className="font-bold text-white text-sm group-hover:text-teal-400 transition">Al-Noor Central (Calicut)</h4>
                            <span className="text-[11px] bg-slate-900 text-slate-400 font-bold px-2 py-0.5 rounded border border-slate-800 uppercase">Code: CTR-01</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-black text-amber-400 block">{ctr1OverallScore}%</span>
                          <span className="text-[10px] text-slate-500">Global Score</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* SUBVIEW 1C: CENTER DETAILS BREAKDOWNS */}
                {adminViewMode === 'center_detail' && (
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl animate-fadeIn">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div>
                        <h3 className="font-bold text-white flex items-center gap-2">
                          <Building className="h-5 w-5 text-teal-400" />
                          {selectedCenterId === 'ctr_1' ? 'Al-Noor Central (Calicut)' : 'Malappuram Hifz Academy'} - Component Breakdown
                        </h3>
                        <p className="text-xs text-slate-400">Click on any core score parameter below to drill down into localized reports</p>
                      </div>
                      <button 
                        onClick={() => setAdminViewMode('centers_list')}
                        className="bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-bold px-3 py-1.5 rounded-lg transition"
                      >
                        ← Back to List
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      
                      {/* Nazim card - loads detailed profile of the local Nazim */}
                      <div 
                        onClick={() => {
                          if (selectedCenterId === 'ctr_1') {
                            setSelectedProfileId('staff_3');
                            setAdminSubmenu('staff');
                            alert("📋 Loaded Nazim Faisal's detailed profile inside the right-hand panel.");
                          } else {
                            alert("Malappuram local administrator record is not initialized in this session sandbox.");
                          }
                        }}
                        className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 hover:border-emerald-500/40 cursor-pointer transition flex flex-col justify-between min-h-[140px] group"
                      >
                        <div>
                          <span className="text-[10px] text-emerald-400 font-extrabold block uppercase tracking-wider mb-1">Nazim Rating (Avg)</span>
                          <h4 className="font-bold text-white text-sm group-hover:text-emerald-400 transition">Administration & Tasks</h4>
                          <p className="text-[10px] text-slate-500 mt-1">Local compliance tracking and duty audit logs</p>
                        </div>
                        <div className="text-right mt-3 border-t border-slate-900 pt-2 flex items-center justify-between">
                          <span className="text-[10px] text-slate-500 underline group-hover:text-slate-300 transition">View Profile</span>
                          <span className="text-lg font-black text-emerald-400">
                            {selectedCenterId === 'ctr_1' ? ctr1NazimRating : 100}%
                          </span>
                        </div>
                      </div>

                      {/* Usthad card - redirects to the Usthad Drill down list */}
                      <div 
                        onClick={() => setAdminViewMode('usthad_list')}
                        className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 hover:border-indigo-500/40 cursor-pointer transition flex flex-col justify-between min-h-[140px] group"
                      >
                        <div>
                          <span className="text-[10px] text-indigo-400 font-extrabold block uppercase tracking-wider mb-1">Usthad Rating (Avg)</span>
                          <h4 className="font-bold text-white text-sm group-hover:text-indigo-400 transition">Teaching Staff Ratings</h4>
                          <p className="text-[10px] text-slate-500 mt-1">Classroom grading with dynamic class penalties</p>
                        </div>
                        <div className="text-right mt-3 border-t border-slate-900 pt-2 flex items-center justify-between">
                          <span className="text-[10px] text-indigo-450 font-bold group-hover:underline">Drill Down List →</span>
                          <span className="text-lg font-black text-indigo-400">
                            {selectedCenterId === 'ctr_1' ? ctr1AvgUsthad : ctr2AvgUsthad}%
                          </span>
                        </div>
                      </div>

                      {/* Student card - redirects to Student list drill down */}
                      <div 
                        onClick={() => setAdminViewMode('student_list')}
                        className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 hover:border-teal-500/40 cursor-pointer transition flex flex-col justify-between min-h-[140px] group"
                      >
                        <div>
                          <span className="text-[10px] text-teal-400 font-extrabold block uppercase tracking-wider mb-1">Students Rating (Avg)</span>
                          <h4 className="font-bold text-white text-sm group-hover:text-teal-400 transition">Student Progress Grades</h4>
                          <p className="text-[10px] text-slate-500 mt-1">Average daily chores, hygiene, and namaz parameters</p>
                        </div>
                        <div className="text-right mt-3 border-t border-slate-900 pt-2 flex items-center justify-between">
                          <span className="text-[10px] text-teal-450 font-bold group-hover:underline">Drill Down List →</span>
                          <span className="text-lg font-black text-teal-400">
                            {selectedCenterId === 'ctr_1' ? ctr1AvgStudent : ctr2AvgStudent}%
                          </span>
                        </div>
                      </div>

                    </div>
                  </div>
                )}

                {/* SUBVIEW 1D: DRILL DOWN LIST OF USTHADS */}
                {adminViewMode === 'usthad_list' && (
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl animate-fadeIn">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div>
                        <h3 className="font-bold text-white flex items-center gap-2">
                          <Award className="h-5 w-5 text-indigo-400" />
                          Usthads in {selectedCenterId === 'ctr_1' ? 'Al-Noor Central (Calicut)' : 'Malappuram Hifz Academy'}
                        </h3>
                        <p className="text-xs text-slate-400">Click on any teacher's profile to view full records in the right dossier panel</p>
                      </div>
                      <button 
                        onClick={() => setAdminViewMode('center_detail')}
                        className="bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-bold px-3 py-1.5 rounded-lg transition"
                      >
                        ← Back to Center
                      </button>
                    </div>

                    <div className="space-y-3">
                      {staff.filter(st => st.centerId === selectedCenterId && st.role === 'usthad').map(teacher => (
                        <div 
                          key={teacher.id}
                          onClick={() => {
                            setSelectedProfileId(teacher.id);
                            setAdminSubmenu('staff');
                            alert(`Loaded ${teacher.name}'s detailed profile in the right dossier panel.`);
                          }}
                          className={`p-4 rounded-xl border cursor-pointer transition flex items-center justify-between gap-4 ${selectedProfileId === teacher.id ? 'bg-indigo-500/10 border-indigo-500' : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'}`}
                        >
                          <div>
                            <h4 className="font-bold text-white text-sm">{teacher.name}</h4>
                            <p className="text-xs text-slate-400">Managing: <strong>{teacher.batchManaged}</strong> | Code: {teacher.code}</p>
                            {teacher.id === 'staff_1' && teacher.rating < 100 && (
                              <span className="text-[10px] bg-rose-500/15 text-rose-400 px-2 py-0.5 rounded font-bold block mt-1.5 border border-rose-500/20 max-w-max">
                                ⚠️ Class Penalty Triggered (-30 points due to batch underperformance)
                              </span>
                            )}
                          </div>
                          <div className="text-right flex items-center gap-3">
                            <div>
                              <span className="text-sm font-black text-indigo-400 block">{teacher.rating}/100</span>
                              <span className="text-[9px] text-slate-500 block uppercase">Rating Score</span>
                            </div>
                            <ChevronRight className="h-4 w-4 text-slate-600" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* SUBVIEW 1E: DRILL DOWN LIST OF STUDENTS */}
                {adminViewMode === 'student_list' && (
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl animate-fadeIn">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div>
                        <h3 className="font-bold text-white flex items-center gap-2">
                          <Users className="h-5 w-5 text-teal-400" />
                          Students in {selectedCenterId === 'ctr_1' ? 'Al-Noor Central (Calicut)' : 'Malappuram Hifz Academy'}
                        </h3>
                        <p className="text-xs text-slate-400">Click on any profile below to load their achievements dossier and leave applications on the right panel</p>
                      </div>
                      <button 
                        onClick={() => setAdminViewMode('center_detail')}
                        className="bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-bold px-3 py-1.5 rounded-lg transition"
                      >
                        ← Back to Center
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {students.filter(stud => stud.centerId === selectedCenterId).map(student => (
                        <div 
                          key={student.id}
                          onClick={() => {
                            setSelectedProfileId(student.id);
                            setAdminSubmenu('students');
                            alert(`Loaded ${student.name}'s dynamic achievements dossier in the right dossier panel.`);
                          }}
                          className={`p-4 rounded-xl border cursor-pointer transition flex items-center justify-between gap-4 ${selectedProfileId === student.id ? 'bg-teal-500/10 border-teal-500' : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'}`}
                        >
                          <div>
                            <h4 className="font-bold text-white text-sm">{student.name}</h4>
                            <p className="text-xs text-slate-400">{student.batchName} | Card: {student.code}</p>
                            <div className="flex gap-1.5 mt-1">
                              <span className="text-[9px] bg-slate-900 text-slate-400 px-1.5 rounded">Juz: {student.memorizedJuz.split(',')[0]}</span>
                              <span className="text-[9px] bg-slate-900 text-slate-400 px-1.5 rounded">Attd: {student.attendanceRate}%</span>
                            </div>
                          </div>
                          <div className="text-right flex items-center gap-2">
                            <div>
                              <span className={`text-xs font-black block ${student.overallScore >= 70 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {student.overallScore}%
                              </span>
                              <span className="text-[9px] text-slate-500 block uppercase font-medium">Grade</span>
                            </div>
                            <ChevronRight className="h-4 w-4 text-slate-600" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Direct-to-Super-Admin Triage System */}
                <div id="complaints-section" className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl scroll-mt-20">
                  <div>
                    <h3 className="font-bold text-white flex items-center gap-2">
                      <ShieldAlert className="h-5 w-5 text-rose-500 animate-pulse" />
                      Student/Parent Complaints Pipeline
                    </h3>
                    <p className="text-xs text-slate-400">Direct reports bypassing local branch logs. Direct action or route assignment.</p>
                  </div>

                  <div className="space-y-3.5">
                    {complaints.map(comp => (
                      <div key={comp.id} className="bg-slate-950/40 border border-slate-800/80 p-4 rounded-xl space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-900 pb-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${comp.category === 'Nazim Mismanagement' ? 'bg-rose-500/10 text-rose-400' : 'bg-slate-800 text-slate-400'}`}>
                              {comp.category}
                            </span>
                            <span className="text-xs text-slate-400 font-medium">From parent of {comp.studentName} ({comp.centerName})</span>
                          </div>
                          <span className="text-[10px] text-slate-500">{comp.createdAt}</span>
                        </div>

                        <p className="text-sm text-slate-300 bg-slate-950 p-3 rounded-lg border border-slate-900 leading-relaxed italic">
                          &ldquo;{comp.description}&rdquo;
                        </p>

                        {/* Complaint Actions Panel */}
                        {comp.status === 'pending_super_admin' ? (
                          <div className="flex items-center flex-wrap gap-2 pt-1">
                            {comp.category === 'Nazim Mismanagement' ? (
                              <div className="flex items-center gap-2 w-full sm:w-auto">
                                <span className="text-rose-400 text-xs font-bold flex items-center gap-1 bg-rose-500/5 px-3 py-1.5 rounded-lg border border-rose-500/20">
                                  <AlertCircle className="h-3.5 w-3.5 animate-bounce" /> Direct Action Required (Locked from Nazim)
                                </span>
                                <button 
                                  onClick={() => {
                                    setComplaints(prev => prev.map(c => c.id === comp.id ? { ...c, status: 'resolved_by_super_admin' } : c));
                                    alert("✅ Action recorded. Branch Trustees notified. Study rooms ordered to remain open till 11 PM.");
                                  }}
                                  className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition"
                                >
                                  Execute Direct Resolve
                                </button>
                              </div>
                            ) : (
                              <>
                                <button 
                                  onClick={() => {
                                    setComplaints(prev => prev.map(c => c.id === comp.id ? { ...c, status: 'assigned_to_nazim' } : c));
                                    alert("✅ Complaint routed securely down to Nazim Faisal's active portal desk.");
                                  }}
                                  className="bg-teal-500 hover:bg-teal-600 text-slate-950 text-xs font-bold px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition"
                                >
                                  <ArrowRight className="h-3.5 w-3.5" /> Delegate to Nazim
                                </button>
                                <button 
                                  onClick={() => {
                                    setComplaints(prev => prev.map(c => c.id === comp.id ? { ...c, status: 'resolved_by_super_admin' } : c));
                                    alert("✅ Resolved by Super Admin. Standard service notes recorded.");
                                  }}
                                  className="bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-bold px-3 py-1.5 rounded-lg transition"
                                >
                                  Resolve Direct
                                </button>
                              </>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs font-bold inline-flex items-center gap-1 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                            <Check className="h-3.5 w-3.5" /> Status: {comp.status.replace(/_/g, ' ').toUpperCase()}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Scholastic Library Verification Portal */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                    <div>
                      <h3 className="font-bold text-white flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-indigo-400" />
                        Hadith Library Gateway Verification
                      </h3>
                      <p className="text-xs text-slate-400">Review external API collections before student/teacher release</p>
                    </div>

                    {/* Gatekeeper toggle switch */}
                    <div className="flex items-center gap-2 bg-slate-950 p-1.5 px-3 rounded-xl border border-slate-800">
                      <span className="text-xs font-bold text-slate-400">Released to Public:</span>
                      <button 
                        onClick={() => {
                          setIsLibraryEnabled(!isLibraryEnabled);
                          alert(isLibraryEnabled ? "🔒 Library locked globally." : "🔓 Library unlocked. Now visible to students and Usthads.");
                        }}
                        className={`h-6 w-11 rounded-full p-0.5 transition-colors duration-200 focus:outline-none ${isLibraryEnabled ? 'bg-teal-500' : 'bg-slate-800'}`}
                      >
                        <div className={`h-5 w-5 rounded-full bg-slate-950 transition-transform duration-200 flex items-center justify-center ${isLibraryEnabled ? 'transform translate-x-5' : ''}`}>
                          {isLibraryEnabled ? <Unlock className="h-3 w-3 text-teal-400" /> : <Lock className="h-3 w-3 text-slate-500" />}
                        </div>
                      </button>
                    </div>
                  </div>

                  <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-400">Sunnah API Endpoint Hooked:</span>
                      <span className="text-[11px] bg-slate-900 text-teal-400 font-mono px-2 py-0.5 rounded">https://sunnah.amanahagent.cloud/api/v1</span>
                    </div>
                    <div className="text-xs text-slate-400 leading-normal">
                      <strong className="text-slate-200">Alim Verification Protocol:</strong> The Super Admin must audit API translations using scholastic benchmarks. Once verified, flip the gateway toggle to grant access to student tablets.
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: INTERACTIVE PROFILE DETAIL DOSSIER & ACTIONS */}
              <div className="lg:col-span-1 space-y-6">
                
                {/* Detailed profile viewer */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl sticky top-24">
                  <h3 className="font-bold text-white text-sm border-b border-slate-800 pb-3 flex items-center gap-2">
                    <Info className="h-4 w-4 text-teal-400" />
                    Dossier Detail Panel
                  </h3>

                  {activeProfile ? (
                    <div className="space-y-5 animate-fadeIn">
                      
                      {/* Common Header info */}
                      <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 text-center space-y-2">
                        <div className="h-14 w-14 rounded-full bg-teal-500/10 border border-teal-500/30 flex items-center justify-center mx-auto">
                          {adminSubmenu === 'students' ? <Users className="h-7 w-7 text-teal-400" /> : <Award className="h-7 w-7 text-indigo-400" />}
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-base">{activeProfile.name}</h4>
                          <span className="text-xs text-teal-400 font-bold">{activeProfile.code}</span>
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {activeProfile.centerName}
                        </div>
                      </div>

                      {/* Student-specific details */}
                      {adminSubmenu === 'students' && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-3 text-xs bg-slate-950 p-3 rounded-lg border border-slate-850">
                            <div>
                              <span className="text-slate-500 block font-semibold">Attendance</span>
                              <span className="text-white font-bold text-sm">{(activeProfile as any).attendanceRate}%</span>
                            </div>
                            <div>
                              <span className="text-slate-500 block font-semibold">Memorization</span>
                              <span className="text-white font-bold text-sm">{(activeProfile as any).memorizedJuz}</span>
                            </div>
                          </div>

                          {/* Leave requests section */}
                          {(activeProfile as any).leaveRequests && (activeProfile as any).leaveRequests.length > 0 && (
                            <div className="space-y-2">
                              <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Leave Applications</span>
                              {(activeProfile as any).leaveRequests.map((l: any) => (
                                <div key={l.id} className="bg-amber-500/5 border border-amber-500/20 p-3 rounded-lg space-y-2">
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="text-amber-400 font-bold flex items-center gap-1">
                                      <Calendar className="h-3 w-3" /> Leave Request
                                    </span>
                                    <span className="text-[10px] bg-amber-500/10 text-amber-400 font-extrabold px-2 py-0.5 rounded">
                                      {l.status}
                                    </span>
                                  </div>
                                  <p className="text-xs text-slate-300"><strong>Dates:</strong> {l.startDate} to {l.endDate}</p>
                                  <p className="text-xs text-slate-300 font-medium"><strong>Reason:</strong> {l.reason}</p>
                                  
                                  {l.status === 'PENDING' && (
                                    <div className="flex items-center gap-2 pt-1">
                                      <button 
                                        onClick={() => {
                                          setStudents(prev => prev.map(s => {
                                            if (s.id === activeProfile.id) {
                                              return {
                                                ...s,
                                                leaveRequests: s.leaveRequests.map(lr => lr.id === l.id ? { ...lr, status: 'APPROVED' } : lr)
                                              };
                                            }
                                            return s;
                                          }));
                                          alert("✅ Leave Approved! Confirmation dispatched to parent via Meta Cloud WhatsApp API.");
                                        }}
                                        className="flex-1 bg-teal-500 hover:bg-teal-600 text-slate-950 text-[11px] font-black py-1 rounded transition"
                                      >
                                        Approve
                                      </button>
                                      <button 
                                        onClick={() => {
                                          setStudents(prev => prev.map(s => {
                                            if (s.id === activeProfile.id) {
                                              return {
                                                ...s,
                                                leaveRequests: s.leaveRequests.map(lr => lr.id === l.id ? { ...lr, status: 'REJECTED' } : lr)
                                              };
                                            }
                                            return s;
                                          }));
                                          alert("❌ Leave request declined. Status updated.");
                                        }}
                                        className="flex-1 bg-slate-800 hover:bg-slate-700 text-rose-400 text-[11px] font-bold py-1 rounded transition"
                                      >
                                        Decline
                                      </button>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Stars breakdown */}
                          <div className="space-y-2">
                            <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Academic Stars Earned</span>
                            {(activeProfile as any).stars && (activeProfile as any).stars.length > 0 ? (
                              (activeProfile as any).stars.map((s: any) => (
                                <div key={s.id} className="bg-slate-950 p-3 rounded-lg border border-slate-850 space-y-1">
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="text-amber-400 font-bold flex items-center gap-1">
                                      <Star className="h-3 w-3 fill-amber-400" /> {s.category}
                                    </span>
                                    <span className="text-slate-500 text-[10px]">{s.date}</span>
                                  </div>
                                  <p className="text-xs text-slate-300 leading-normal">{s.explanation}</p>
                                  <span className="text-[10px] text-teal-400 block font-medium">Issued by: {s.teacher}</span>
                                </div>
                              ))
                            ) : (
                              <p className="text-xs text-slate-500">No achievements recorded this month.</p>
                            )}
                          </div>

                          {/* Warnings breakdown */}
                          <div className="space-y-2">
                            <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Warning Log</span>
                            {(activeProfile as any).warnings && (activeProfile as any).warnings.length > 0 ? (
                              (activeProfile as any).warnings.map((w: any) => (
                                <div key={w.id} className="bg-rose-500/5 p-3 rounded-lg border border-rose-500/20 space-y-1">
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="text-rose-400 font-bold flex items-center gap-1">
                                      <AlertCircle className="h-3 w-3" /> {w.category}
                                    </span>
                                    <span className="text-rose-500 text-[10px] uppercase font-black">{w.severity}</span>
                                  </div>
                                  <p className="text-xs text-slate-300 leading-normal">{w.explanation}</p>
                                  <span className="text-[10px] text-slate-500 block">Issued by: {w.teacher}</span>
                                </div>
                              ))
                            ) : (
                              <p className="text-xs text-emerald-400 flex items-center gap-1 text-[11px] font-semibold bg-emerald-500/10 p-2.5 rounded-lg border border-emerald-500/20">
                                <CheckCircle className="h-4 w-4" /> Flawless conduct record this month!
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Staff-specific details */}
                      {adminSubmenu === 'staff' && (
                        <div className="space-y-4">
                          <div className="bg-slate-950 p-3 rounded-lg border border-slate-850 space-y-2 text-xs">
                            <div className="flex justify-between">
                              <span className="text-slate-400">Position Role:</span>
                              <span className="font-bold text-slate-200 uppercase">{activeProfile.role}</span>
                            </div>
                            {activeProfile.role === 'usthad' && (
                              <div className="flex justify-between">
                                <span className="text-slate-400">Batch Assigned:</span>
                                <span className="font-bold text-teal-400">{(activeProfile as any).batchManaged}</span>
                              </div>
                            )}
                          </div>

                          {/* Leave request approval block */}
                          {activeProfile.leaveRequests && activeProfile.leaveRequests.length > 0 && (
                            <div className="space-y-2">
                              <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Staff Leave Requests</span>
                              {activeProfile.leaveRequests.map((l: any) => (
                                <div key={l.id} className="bg-amber-500/5 border border-amber-500/20 p-3 rounded-lg space-y-2">
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="text-amber-400 font-bold flex items-center gap-1">
                                      <Calendar className="h-3 w-3" /> Leave Request
                                    </span>
                                    <span className="text-[10px] bg-amber-500/10 text-amber-400 font-extrabold px-2 py-0.5 rounded">
                                      {l.status}
                                    </span>
                                  </div>
                                  <p className="text-xs text-slate-300"><strong>Dates:</strong> {l.startDate} to {l.endDate}</p>
                                  <p className="text-xs text-slate-300 font-medium"><strong>Reason:</strong> {l.reason}</p>
                                  
                                  {l.status === 'PENDING' && (
                                    <div className="flex items-center gap-2 pt-1">
                                      <button 
                                        onClick={() => {
                                          setStaff(prev => prev.map(s => {
                                            if (s.id === activeProfile.id) {
                                              return {
                                                ...s,
                                                leaveRequests: s.leaveRequests.map(lr => lr.id === l.id ? { ...lr, status: 'APPROVED' } : lr)
                                              };
                                            }
                                            return s;
                                          }));
                                          alert("✅ Staff Leave Approved. Work coverage notice dispatched.");
                                        }}
                                        className="flex-1 bg-teal-500 hover:bg-teal-600 text-slate-950 text-[11px] font-black py-1 rounded transition"
                                      >
                                        Approve
                                      </button>
                                      <button 
                                        onClick={() => {
                                          setStaff(prev => prev.map(s => {
                                            if (s.id === activeProfile.id) {
                                              return {
                                                ...s,
                                                leaveRequests: s.leaveRequests.map(lr => lr.id === l.id ? { ...lr, status: 'REJECTED' } : lr)
                                              };
                                            }
                                            return s;
                                          }));
                                          alert("❌ Leave request declined.");
                                        }}
                                        className="flex-1 bg-slate-800 hover:bg-slate-700 text-rose-400 text-[11px] font-bold py-1 rounded transition"
                                      >
                                        Decline
                                      </button>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-slate-500 space-y-2 bg-slate-950/40 border border-slate-850 rounded-xl">
                      <Search className="h-8 w-8 mx-auto text-slate-600" />
                      <p className="text-xs">Select a student or staff member from the search results to load their full behavioral, progress, and leave details here.</p>
                    </div>
                  )}
                </div>

                {/* Finance payroll release console */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
                  <div>
                    <h3 className="font-bold text-white text-sm flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-emerald-400" />
                      Payroll Verification Box
                    </h3>
                    <p className="text-xs text-slate-400">Audit salaries and advance repayments submitted by local Nazims</p>
                  </div>

                  <div className="space-y-3">
                    {staff.map(member => {
                      const netSalary = member.baseSalary - member.advanceTaken;
                      return (
                        <div key={member.id} className="bg-slate-950 p-3 rounded-lg border border-slate-850 flex justify-between items-center">
                          <div>
                            <h4 className="text-xs font-bold text-slate-200">{member.name}</h4>
                            <span className="text-[10px] text-slate-400">Base: ₹{member.baseSalary} | Adv Repay: -₹{member.advanceTaken}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-black block text-emerald-400">₹{netSalary}</span>
                            <button 
                              onClick={() => {
                                setStaff(prev => prev.map(s => s.id === member.id ? { ...s, isPaid: true } : s));
                                alert(`✅ Payment of ₹${netSalary} dispatched successfully via ${member.paymentMethod}!`);
                              }}
                              disabled={member.isPaid}
                              className={`text-[9px] font-bold px-2 py-0.5 rounded mt-1 transition ${member.isPaid ? 'bg-slate-900 text-slate-500 border border-slate-800 cursor-not-allowed' : 'bg-emerald-500 text-slate-950 hover:bg-emerald-600'}`}
                            >
                              {member.isPaid ? 'RELEASED' : 'VERIFY & PAY'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

            </div>
          </div>
        );
      })()}

      {/* =============================================================================
          ROLE 2: USTHAD ACTIVE PORTAL PANEL (WITH ALL SPECIFIED UPDATES CORRECTLY LINKED!)
          ============================================================================= */}
      {activeRole === 'usthad' && (
        <div className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">
          
          {/* Usthad Profile summary bar */}
          <div className="bg-indigo-950/20 border border-indigo-500/20 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center">
                <Award className="h-6 w-6 text-indigo-400" />
              </div>
              <div>
                <h2 className="text-lg font-black text-white">Teacher Center Panel: Usthad Ibrahim Kutty</h2>
                <p className="text-xs text-indigo-300">Managing: <strong>Hifz Batch A (4 Students)</strong> | Al-Noor Central (Calicut)</p>
              </div>
            </div>

            {/* Live progressive penalty notification */}
            <div className="bg-rose-500/5 border border-rose-500/20 p-3 rounded-xl flex items-center gap-3">
              <div className="text-right">
                <span className="text-xs text-slate-400 font-semibold block">Your Monthly Performance Rating:</span>
                <span className="text-sm text-rose-400 font-black">
                  {staff.find(s => s.id === 'staff_1')?.rating}/100 Grade
                </span>
              </div>
              <div className="text-[10px] text-slate-400 leading-snug max-w-[240px]">
                ⚠️ <strong className="text-rose-400">Class Penalty Triggered!</strong> Since 50% of your batch is underperforming (&lt;70% grade), a progressive score deduction is active.
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            
            {/* SUB-MENU TABS */}
            <div className="lg:col-span-1 space-y-2">
              <button 
                onClick={() => setSelectedClassTab('tarbiyyah_logs')}
                className={`w-full text-left p-3.5 rounded-xl border font-bold text-sm flex items-center justify-between transition ${selectedClassTab === 'tarbiyyah_logs' ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400' : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300'}`}
              >
                <span className="flex items-center gap-2"><ClipboardList className="h-4.5 w-4.5" /> Daily Tarbiyyah Logs</span>
                <ChevronRight className="h-4 w-4" />
              </button>
              
              <button 
                onClick={() => setSelectedClassTab('behavior_star_warn')}
                className={`w-full text-left p-3.5 rounded-xl border font-bold text-sm flex items-center justify-between transition ${selectedClassTab === 'behavior_star_warn' ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400' : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300'}`}
              >
                <span className="flex items-center gap-2"><Star className="h-4.5 w-4.5" /> Issue Stars & Warnings</span>
                <ChevronRight className="h-4 w-4" />
              </button>

              <button 
                onClick={() => setSelectedClassTab('whatsapp_chat')}
                className={`w-full text-left p-3.5 rounded-xl border font-bold text-sm flex items-center justify-between transition ${selectedClassTab === 'whatsapp_chat' ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400' : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300'}`}
              >
                <span className="flex items-center gap-2"><MessageSquare className="h-4.5 w-4.5" /> Parent WhatsApp Chats</span>
                <ChevronRight className="h-4 w-4" />
              </button>

              <button 
                onClick={() => setSelectedClassTab('library')}
                className={`w-full text-left p-3.5 rounded-xl border font-bold text-sm flex items-center justify-between transition ${selectedClassTab === 'library' ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400' : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300'}`}
              >
                <span className="flex items-center gap-2"><BookOpen className="h-4.5 w-4.5" /> Hadith Scholastic Library</span>
                <ChevronRight className="h-4 w-4" />
              </button>

              <button 
                onClick={() => setSelectedClassTab('apply_leave')}
                className={`w-full text-left p-3.5 rounded-xl border font-bold text-sm flex items-center justify-between transition ${selectedClassTab === 'apply_leave' ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400' : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300'}`}
              >
                <span className="flex items-center gap-2"><Calendar className="h-4.5 w-4.5" /> Apply for Leave</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* DYNAMIC SUB-VIEW PANEL */}
            <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-2xl p-5 md:p-6 shadow-xl space-y-6">
              
              {/* STUDENT PICKER SELECTOR FOR LOGS AND ASSIGNMENTS */}
              {selectedClassTab !== 'apply_leave' && selectedClassTab !== 'library' && (
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 flex items-center flex-wrap gap-2.5">
                  <span className="text-xs text-slate-400 font-bold px-2">SELECT STUDENT:</span>
                  {students.filter(s => s.centerId === 'ctr_1').map(s => (
                    <button
                      key={s.id}
                      onClick={() => setSelectedStudentId(s.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${selectedStudentId === s.id ? 'bg-indigo-500 text-white shadow-md' : 'bg-slate-900 text-slate-400 hover:bg-slate-850 hover:text-slate-100'}`}
                    >
                      {s.name} ({s.code})
                    </button>
                  ))}
                </div>
              )}

              {/* SUBVIEW 2A: DAILY TARBIYYAH INTERACTIVE TRACKING GRIDS */}
              {selectedClassTab === 'tarbiyyah_logs' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <ClipboardList className="h-5 w-5 text-indigo-400" />
                      Daily Tarbiyyah Checklist - {students.find(s => s.id === selectedStudentId)?.name}
                    </h3>
                    <p className="text-xs text-slate-400">Directly logging chores, studies, hygiene, and namaz. Adjusts overall monthly score in real-time.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 flex items-center justify-between">
                      <div>
                        <strong className="text-white text-sm block">🕌 Namaz Discipline</strong>
                        <span className="text-xs text-slate-400">Performed all 5 prayers in congregation today.</span>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={tarbiyyahLogs.namaz}
                        onChange={(e) => {
                          const val = e.target.checked;
                          setTarbiyyahLogs(prev => ({ ...prev, namaz: val }));
                          // Dynamic math adjustment to trigger underperforming changes
                          setStudents(prev => prev.map(s => s.id === selectedStudentId ? { ...s, overallScore: val ? Math.min(100, s.overallScore + 10) : Math.max(0, s.overallScore - 15) } : s));
                        }}
                        className="h-5 w-5 accent-indigo-500 cursor-pointer"
                      />
                    </div>

                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 flex items-center justify-between">
                      <div>
                        <strong className="text-white text-sm block">🧹 Hostel Chores Log</strong>
                        <span className="text-xs text-slate-400">Completed kitchen assistance or sweeping duty on schedule.</span>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={tarbiyyahLogs.chores}
                        onChange={(e) => {
                          const val = e.target.checked;
                          setTarbiyyahLogs(prev => ({ ...prev, chores: val }));
                          setStudents(prev => prev.map(s => s.id === selectedStudentId ? { ...s, overallScore: val ? Math.min(100, s.overallScore + 8) : Math.max(0, s.overallScore - 12) } : s));
                        }}
                        className="h-5 w-5 accent-indigo-500 cursor-pointer"
                      />
                    </div>

                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 flex items-center justify-between">
                      <div>
                        <strong className="text-white text-sm block">📖 Daily Hifz Study Hours</strong>
                        <span className="text-xs text-slate-400">Completed 4 hours of recitation and revision portions.</span>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={tarbiyyahLogs.study}
                        onChange={(e) => {
                          const val = e.target.checked;
                          setTarbiyyahLogs(prev => ({ ...prev, study: val }));
                          setStudents(prev => prev.map(s => s.id === selectedStudentId ? { ...s, overallScore: val ? Math.min(100, s.overallScore + 15) : Math.max(0, s.overallScore - 18) } : s));
                        }}
                        className="h-5 w-5 accent-indigo-500 cursor-pointer"
                      />
                    </div>

                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 flex items-center justify-between">
                      <div>
                        <strong className="text-white text-sm block">🧼 Personal Hygiene Audit</strong>
                        <span className="text-xs text-slate-400">Clean laundry, tidy bedroom log, and basic sunnah adab.</span>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={tarbiyyahLogs.hygiene}
                        onChange={(e) => {
                          const val = e.target.checked;
                          setTarbiyyahLogs(prev => ({ ...prev, hygiene: val }));
                          setStudents(prev => prev.map(s => s.id === selectedStudentId ? { ...s, overallScore: val ? Math.min(100, s.overallScore + 10) : Math.max(0, s.overallScore - 10) } : s));
                        }}
                        className="h-5 w-5 accent-indigo-500 cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 flex justify-between items-center">
                    <div>
                      <span className="text-xs text-slate-400">Current Student Monthly Grade:</span>
                      <strong className={`text-base block ${students.find(s => s.id === selectedStudentId)!.overallScore >= 70 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {students.find(s => s.id === selectedStudentId)?.overallScore}% Grade
                      </strong>
                    </div>
                    <button 
                      onClick={() => alert("✅ Daily Tarbiyyah Logs pushed to the database server successfully!")}
                      className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-xs px-4.5 py-2 rounded-lg transition"
                    >
                      Save Daily Log Entry
                    </button>
                  </div>
                </div>
              )}

              {/* SUBVIEW 2B: STAR & WARNING DISPATCH HUB (WITH TRACING REASONS) */}
              {selectedClassTab === 'behavior_star_warn' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
                      Behavior Dispatch Desk: {students.find(s => s.id === selectedStudentId)?.name}
                    </h3>
                    <p className="text-xs text-slate-400">Issue stars for scholastic excellence or warnings for discipline concerns. Records immediate justification logs.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Award Action Type</label>
                      <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-850">
                        <button 
                          onClick={() => { setActionType('star'); setActionCategory("Tajweed Fluency"); }}
                          className={`flex-1 py-1.5 rounded-md text-xs font-bold transition flex items-center justify-center gap-1.5 ${actionType === 'star' ? 'bg-indigo-500 text-white' : 'text-slate-400'}`}
                        >
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> Issue Star Achievement
                        </button>
                        <button 
                          onClick={() => { setActionType('warning'); setActionCategory("Class Absenteeism"); }}
                          className={`flex-1 py-1.5 rounded-md text-xs font-bold transition flex items-center justify-center gap-1.5 ${actionType === 'warning' ? 'bg-rose-500/10 text-rose-400' : 'text-slate-400'}`}
                        >
                          <AlertCircle className="h-3.5 w-3.5 text-rose-400" /> Issue Misconduct Warning
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Category Segment</label>
                      <select 
                        value={actionCategory}
                        onChange={(e) => setActionCategory(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 text-xs rounded-lg p-2.5 text-white focus:outline-none"
                      >
                        {actionType === 'star' ? (
                          <>
                            <option value="Tajweed Fluency">Tajweed Recitation Fluency</option>
                            <option value="Namaz Discipline">Congregational Namaz Attendance</option>
                            <option value="Adab & Hygiene">Excellent Manners & Cleanliness</option>
                            <option value="Hifz Memorization">Extensive Memorization Milestone</option>
                          </>
                        ) : (
                          <>
                            <option value="Academic Negligence">Academic Negligence (Hifz Prep)</option>
                            <option value="Class Absenteeism">Unexcused Class Absenteeism</option>
                            <option value="Chores Neglect">Neglect of Daily Chores Duty</option>
                            <option value="General Misconduct">Insubordination or Hostel Misconduct</option>
                          </>
                        )}
                      </select>
                    </div>

                    {actionType === 'warning' && (
                      <div className="space-y-3 sm:col-span-2">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Severity Rank</label>
                        <div className="flex gap-4 text-xs text-slate-300">
                          {['low', 'medium', 'high'].map(s => (
                            <label key={s} className="flex items-center gap-1.5 cursor-pointer">
                              <input 
                                type="radio" 
                                name="severity" 
                                checked={actionSeverity === s}
                                onChange={() => setActionSeverity(s)}
                                className="accent-rose-500"
                              />
                              <span className="capitalize">{s} Severity</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="space-y-3 sm:col-span-2">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Reason & Justification (Why did they get this?)</label>
                      <textarea 
                        rows={3}
                        value={actionExplanation}
                        onChange={(e) => setActionExplanation(e.target.value)}
                        placeholder={actionType === 'star' ? "Detail why the student is being awarded a star..." : "Detail the misconduct warning trigger. This will be logged on the Super Admin and Kiosk panels."}
                        className="w-full bg-slate-950 border border-slate-850 text-xs rounded-xl p-3 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <button 
                    onClick={() => {
                      if (!actionExplanation.trim()) {
                        alert("Please provide an explanation first.");
                        return;
                      }

                      if (actionType === 'star') {
                        const newStar = {
                          id: `star_${Date.now()}`,
                          category: actionCategory,
                          date: new Date().toISOString().split('T')[0],
                          teacher: "Usthad Ibrahim Kutty",
                          explanation: actionExplanation
                        };
                        setStudents(prev => prev.map(s => {
                          if (s.id === selectedStudentId) {
                            return {
                              ...s,
                              stars: [...s.stars, newStar],
                              overallScore: Math.min(100, s.overallScore + 5)
                            };
                          }
                          return s;
                        }));
                        alert("🌟 Achievement star dispatched! Verified on Student progress card.");
                      } else {
                        const newWarn = {
                          id: `warn_${Date.now()}`,
                          category: actionCategory,
                          severity: actionSeverity,
                          date: new Date().toISOString().split('T')[0],
                          teacher: "Usthad Ibrahim Kutty",
                          explanation: actionExplanation
                        };
                        setStudents(prev => prev.map(s => {
                          if (s.id === selectedStudentId) {
                            return {
                              ...s,
                              warnings: [...s.warnings, newWarn],
                              overallScore: Math.max(0, s.overallScore - 15)
                            };
                          }
                          return s;
                        }));
                        alert("🚨 Disciplinary warning dispatched! Escalated directly to Super Admin ledger.");
                      }

                      setActionExplanation("");
                    }}
                    className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-xs py-2.5 rounded-xl transition shadow-md shadow-indigo-500/15"
                  >
                    Award Performance Mark
                  </button>
                </div>
              )}

              {/* SUBVIEW 2C: WABA OUTBOUND CHAT REPLY DESK */}
              {selectedClassTab === 'whatsapp_chat' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-indigo-400" />
                      Parent Outbound Feed - {students.find(s => s.id === selectedStudentId)?.parentName}
                    </h3>
                    <p className="text-xs text-slate-400">Official, verified Meta API Cloud messages mapped to this parent profile.</p>
                  </div>

                  {chats.some(c => c.isRecognized && sIdMatching(c.studentName, students.find(s => s.id === selectedStudentId)?.name || '')) ? (
                    chats.filter(c => c.isRecognized && sIdMatching(c.studentName, students.find(s => s.id === selectedStudentId)?.name || '')).map(chat => {
                      const replyText = chatReplies[chat.id] || "";
                      return (
                        <div key={chat.id} className="space-y-4">
                          <div className="bg-slate-950 rounded-xl border border-slate-850 h-[220px] overflow-y-auto p-4 flex flex-col gap-3">
                            {chat.messages.map((m, i) => (
                              <div 
                                key={i}
                                className={`max-w-[75%] p-3 rounded-lg text-xs leading-normal ${m.sender === 'parent' ? 'bg-slate-900 text-slate-200 self-start rounded-bl-none border border-slate-800' : 'bg-indigo-600 text-white self-end rounded-br-none'}`}
                              >
                                {m.text}
                                <span className="block text-[8px] text-slate-400 text-right mt-1">{m.time}</span>
                              </div>
                            ))}
                          </div>

                          <div className="flex gap-2">
                            <input 
                              type="text"
                              value={replyText}
                              onChange={(e) => setChatReplies(prev => ({ ...prev, [chat.id]: e.target.value }))}
                              placeholder="Write reply to parent via WhatsApp Cloud API..."
                              className="flex-1 bg-slate-950 border border-slate-850 rounded-xl px-4 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 text-white"
                            />
                            <button 
                              onClick={() => {
                                if (!replyText.trim()) return;
                                setChats(prev => prev.map(c => {
                                  if (c.id === chat.id) {
                                    return {
                                      ...c,
                                      messages: [...c.messages, { sender: 'usthad', text: replyText, time: 'Now' }]
                                    };
                                  }
                                  return c;
                                }));
                                setChatReplies(prev => ({ ...prev, [chat.id]: "" }));
                                alert("📨 Reply dispatched instantly via Meta Cloud API!");
                              }}
                              className="bg-indigo-500 hover:bg-indigo-600 text-white p-2.5 rounded-xl transition shadow"
                            >
                              <Send className="h-4.5 w-4.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-8 text-center text-slate-500 bg-slate-950 rounded-xl border border-slate-850">
                      <MessageSquare className="h-8 w-8 mx-auto text-slate-600 mb-2" />
                      <p className="text-xs">No active WhatsApp communication thread found for this student's registered parent number.</p>
                    </div>
                  )}
                </div>
              )}

              {/* SUBVIEW 2D: ALIM LIBRARY LOCK MECHANISM IN ACTION */}
              {selectedClassTab === 'library' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-indigo-400" />
                      Scholastic Hadith Search Engine
                    </h3>
                    <p className="text-xs text-slate-400">Verifying Sunnah API translations for class references.</p>
                  </div>

                  {!isLibraryEnabled ? (
                    <div className="p-8 text-center bg-slate-950 rounded-2xl border border-indigo-500/10 space-y-4 max-w-md mx-auto">
                      <div className="h-14 w-14 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto text-rose-400">
                        <Lock className="h-7 w-7" />
                      </div>
                      <div className="space-y-1.5">
                        <h4 className="font-bold text-white text-sm">Scholastic Gateway Locked</h4>
                        <p className="text-xs text-slate-400 leading-normal">
                          The central Alim Committee is currently auditing the translation APIs. Once verified as authentic, the Super Admin will release this module globally.
                        </p>
                      </div>
                      <div className="text-[10px] bg-rose-500/5 text-rose-400 p-2.5 rounded-lg border border-rose-500/20 font-mono">
                        Status Code: LOCKED_BY_SUPER_ADMIN
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 animate-fadeIn">
                      <form onSubmit={handleLibrarySearch} className="flex gap-2">
                        <input 
                          type="text"
                          value={libraryQuery}
                          onChange={(e) => setLibraryQuery(e.target.value)}
                          placeholder="Search keyword (e.g. shalat malam, salah, prayer)..."
                          className="flex-1 bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                        />
                        <button 
                          type="submit"
                          className="bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold px-4.5 rounded-xl transition"
                        >
                          Query Sunnah API
                        </button>
                      </form>

                      {isLoadingLibrary ? (
                        <div className="text-center py-6 text-slate-500 text-xs flex items-center justify-center gap-2">
                          <RefreshCw className="h-4.5 w-4.5 animate-spin" /> Fetching authorized cloud resources...
                        </div>
                      ) : (
                        <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
                          {libraryResults.map((item, idx) => (
                            <div key={idx} className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-2">
                              <div className="flex justify-between items-center text-xs">
                                <span className="font-bold text-teal-400">{item.collection} - Hadith {item.hadithNumber}</span>
                                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded font-black uppercase">
                                  {item.grade}
                                </span>
                              </div>
                              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                                &ldquo;{item.text_en}&rdquo;
                              </p>
                              <span className="text-[10px] text-slate-500 block">Source: {item.book}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* SUBVIEW 2E: USTHAD SUBMITTING LEAVE APPLICATION */}
              {selectedClassTab === 'apply_leave' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-indigo-400" />
                      Apply for Staff Leave
                    </h3>
                    <p className="text-xs text-slate-400">Applications route directly to the Super Admin's verification panel.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-slate-400 uppercase block">Start Date</label>
                      <input 
                        type="date"
                        value={usthadLeaveStart}
                        onChange={(e) => setUsthadLeaveStart(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 text-xs rounded-lg p-2.5 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-slate-400 uppercase block">End Date</label>
                      <input 
                        type="date"
                        value={usthadLeaveEnd}
                        onChange={(e) => setUsthadLeaveEnd(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 text-xs rounded-lg p-2.5 text-white"
                      />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <label className="text-[11px] font-bold text-slate-400 uppercase block">Reason for absence</label>
                      <textarea 
                        rows={3}
                        value={usthadLeaveReason}
                        onChange={(e) => setUsthadLeaveReason(e.target.value)}
                        placeholder="Provide details about sick leave or personal emergency leave..."
                        className="w-full bg-slate-950 border border-slate-850 text-xs rounded-lg p-2.5 text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <button 
                    onClick={() => {
                      if (!usthadLeaveReason.trim()) {
                        alert("Please specify a reason.");
                        return;
                      }
                      const newRequest = {
                        id: `tl_${Date.now()}`,
                        startDate: usthadLeaveStart,
                        endDate: usthadLeaveEnd,
                        reason: usthadLeaveReason,
                        status: "PENDING"
                      };
                      setStaff(prev => prev.map(s => s.id === 'staff_1' ? { ...s, leaveRequests: [...s.leaveRequests, newRequest] } : s));
                      setUsthadLeaveReason("");
                      alert("📬 Leave request submitted. Visible in the Super Admin's pending review submenu.");
                    }}
                    className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-xs py-2.5 rounded-xl transition"
                  >
                    Submit Leave Application
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* =============================================================================
          ROLE 3: NAZIM WORKSPACE (LOCAL ADMIN BRANCH INTEGRATIONS)
          ============================================================================= */}
      {activeRole === 'nazim' && (
        <div className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">
          
          {/* Nazim Workspace Header */}
          <div className="bg-emerald-950/20 border border-emerald-500/20 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                <Building className="h-6 w-6 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-lg font-black text-white">Branch Management Console: Nazim Faisal</h2>
                <p className="text-xs text-emerald-300">Operational Head: <strong>Calicut Center (CTR-01)</strong></p>
              </div>
            </div>

            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-850">
              <button 
                onClick={() => setNazimActiveTab('payroll')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${nazimActiveTab === 'payroll' ? 'bg-emerald-500 text-slate-950 font-black shadow-sm' : 'text-slate-400 hover:text-slate-100'}`}
              >
                Payroll Entry
              </button>
              <button 
                onClick={() => setNazimActiveTab('contingency')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${nazimActiveTab === 'contingency' ? 'bg-emerald-500 text-slate-950 font-black shadow-sm' : 'text-slate-400 hover:text-slate-100'}`}
              >
                Cook Leave
              </button>
              <button 
                onClick={() => setNazimActiveTab('unlinked_chats')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${nazimActiveTab === 'unlinked_chats' ? 'bg-emerald-500 text-slate-950 font-black shadow-sm' : 'text-slate-400 hover:text-slate-100'}`}
              >
                Unlinked WhatsApp
              </button>
              <button 
                onClick={() => setNazimActiveTab('store_room')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${nazimActiveTab === 'store_room' ? 'bg-emerald-500 text-slate-950 font-black shadow-sm' : 'text-slate-400 hover:text-slate-100'}`}
              >
                Kitchen Store
              </button>
              <button 
                onClick={() => setNazimActiveTab('checklist')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${nazimActiveTab === 'checklist' ? 'bg-emerald-500 text-slate-950 font-black shadow-sm' : 'text-slate-400 hover:text-slate-100'}`}
              >
                Checklist ({nazimDuties.filter(d => d.isCompleted).length}/{nazimDuties.length})
              </button>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 md:p-6 shadow-xl">
            
            {/* SUB-VIEW 3A: STAFF PAYROLL ENTRY GRID */}
            {nazimActiveTab === 'payroll' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-emerald-400" />
                    Monthly Staff Payroll Sheet
                  </h3>
                  <p className="text-xs text-slate-400">Calculate base salaries, deduct advanced outstanding repayments, and dispatch to Super Admin for verification.</p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                        <th className="py-3 px-2">Staff Details</th>
                        <th className="py-3 px-2">Base Salary</th>
                        <th className="py-3 px-2">Advance Owed</th>
                        <th className="py-3 px-2">Repayment Deduct</th>
                        <th className="py-3 px-2">Net Salary</th>
                        <th className="py-3 px-2">Payment Pathway</th>
                        <th className="py-3 px-2 text-right">Action Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850">
                      {staff.filter(s => s.centerId === 'ctr_1').map(member => {
                        const netPayable = member.baseSalary - member.advanceTaken;
                        return (
                          <tr key={member.id} className="hover:bg-slate-950/40">
                            <td className="py-4 px-2">
                              <span className="font-bold text-slate-200 block">{member.name}</span>
                              <span className="text-[10px] text-slate-500 uppercase">{member.role} ({member.code})</span>
                            </td>
                            <td className="py-4 px-2 font-semibold">₹{member.baseSalary}</td>
                            <td className="py-4 px-2 text-slate-400">₹{member.advanceTaken > 0 ? member.advanceTaken : 0}</td>
                            <td className="py-4 px-2 text-rose-400 font-bold">-₹{member.advanceTaken}</td>
                            <td className="py-4 px-2 text-emerald-400 font-black text-sm">₹{netPayable}</td>
                            <td className="py-4 px-2 text-slate-300 font-medium">{member.paymentMethod}</td>
                            <td className="py-4 px-2 text-right">
                              <span className={`text-[10px] font-extrabold px-2 py-1 rounded inline-block ${member.isPaid ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-950 text-slate-400 border border-slate-800'}`}>
                                {member.isPaid ? 'PAID & RELEASED' : 'PENDING ADMIN APPROVAL'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 flex items-center justify-between">
                  <span className="text-xs text-slate-400">All local parameters matched. Send list to HQ ledger?</span>
                  <button 
                    onClick={() => alert("📤 Payroll parameters dispatched to Super Admin. Pending verification check.")}
                    className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs px-4.5 py-2.5 rounded-lg transition"
                  >
                    Submit Monthly Sheet
                  </button>
                </div>
              </div>
            )}

            {/* SUB-VIEW 3B: COOK LEAVE CONGRUENCY WORKFLOW */}
            {nazimActiveTab === 'contingency' && (
              <div className="space-y-6 max-w-2xl">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <ChefHat className="h-5 w-5 text-emerald-400" />
                    Record Cook Leave Request
                  </h3>
                  <p className="text-xs text-slate-400">Manual entry for kitchen staff. A robust contingency feeding plan is required before registration can complete.</p>
                </div>

                {cookLeave.isOnLeave ? (
                  <div className="bg-amber-500/5 p-5 rounded-xl border border-amber-500/20 space-y-3">
                    <div className="flex justify-between items-center">
                      <strong className="text-amber-400 text-sm flex items-center gap-1.5"><ChefHat className="h-4.5 w-4.5 animate-bounce" /> Kitchen Shift Active on Leave Status</strong>
                      <span className="text-[10px] bg-amber-500/15 text-amber-400 font-bold px-2 py-0.5 rounded">CONGENGY PLAN ACTIVE</span>
                    </div>
                    <p className="text-xs text-slate-300"><strong>Leave Period:</strong> {cookLeave.startDate} to {cookLeave.endDate}</p>
                    <p className="text-xs text-slate-300"><strong>Reason:</strong> {cookLeave.reason}</p>
                    <p className="text-xs text-slate-200 bg-slate-950 p-3 rounded-lg border border-slate-850 leading-relaxed font-semibold">
                      💡 <strong>Contingency Feeding Program:</strong> {cookLeave.contingencyPlan}
                    </p>

                    <button 
                      onClick={() => {
                        setCookLeave({ isOnLeave: false, startDate: "", endDate: "", reason: "", contingencyPlan: "" });
                        alert("✅ Cook marked as returned. Contingency feeding system stood down.");
                      }}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold py-1.5 px-3 rounded-lg transition"
                    >
                      Clear Leave (Cook Returned)
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-slate-400 uppercase">Start Date</label>
                        <input 
                          type="date"
                          value={cookLeave.startDate}
                          onChange={(e) => setCookLeave(prev => ({ ...prev, startDate: e.target.value }))}
                          className="w-full bg-slate-950 border border-slate-850 text-xs rounded-lg p-2.5 text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-slate-400 uppercase">End Date</label>
                        <input 
                          type="date"
                          value={cookLeave.endDate}
                          onChange={(e) => setCookLeave(prev => ({ ...prev, endDate: e.target.value }))}
                          className="w-full bg-slate-950 border border-slate-850 text-xs rounded-lg p-2.5 text-white"
                        />
                      </div>
                      <div className="space-y-2 col-span-2">
                        <label className="text-[11px] font-bold text-slate-400 uppercase">Reason for Absence</label>
                        <input 
                          type="text"
                          value={cookLeave.reason}
                          onChange={(e) => setCookLeave(prev => ({ ...prev, reason: e.target.value }))}
                          placeholder="e.g. Daughter's wedding, illness..."
                          className="w-full bg-slate-950 border border-slate-850 text-xs rounded-lg p-2.5 text-white focus:outline-none"
                        />
                      </div>
                      <div className="space-y-2 col-span-2">
                        <label className="text-[11px] font-bold text-slate-400 uppercase block text-rose-400">
                          Contingency Plan * (How will the students eat?)
                        </label>
                        <textarea 
                          rows={2}
                          value={cookLeave.contingencyPlan}
                          onChange={(e) => setCookLeave(prev => ({ ...prev, contingencyPlan: e.target.value }))}
                          placeholder="e.g. External lunch catering booked from Malabar Caterers, sister branch cook taking over..."
                          className="w-full bg-slate-950 border border-rose-500/30 text-xs rounded-lg p-2.5 text-white focus:outline-none focus:border-rose-500"
                        />
                      </div>
                    </div>

                    <button 
                      onClick={() => {
                        if (!cookLeave.startDate || !cookLeave.endDate || !cookLeave.reason || !cookLeave.contingencyPlan.trim()) {
                          alert("❌ All fields—including a detailed Contingency Plan—are strictly required.");
                          return;
                        }
                        setCookLeave(prev => ({ ...prev, isOnLeave: true }));
                        alert("🚨 Cook Leave registered. Contingency feeding system activated.");
                      }}
                      className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs py-2.5 rounded-xl transition"
                    >
                      Authorize Leave & Activate Contingency Plan
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* SUB-VIEW 3C: UNRECOGNIZED NUMBER RESOLVER & AUTO HANDOFF */}
            {nazimActiveTab === 'unlinked_chats' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-emerald-400" />
                    Unlinked Parent WhatsApp Inbox
                  </h3>
                  <p className="text-xs text-slate-400">Unrecognized phone numbers messaging the center's WABA lines. Chat, verify identity, and route to proper teacher.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 bg-slate-950/60 rounded-xl border border-slate-850 overflow-hidden min-h-[350px]">
                  
                  {/* Left list unrecognized */}
                  <div className="border-r border-slate-850/80 flex flex-col">
                    <div className="p-3 border-b border-slate-850 text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Unverified Numbers
                    </div>
                    <div className="flex-1 overflow-y-auto divide-y divide-slate-850/60">
                      {chats.filter(c => !c.isRecognized).map(chat => (
                        <button
                          key={chat.id}
                          onClick={() => setSelectedUnlinkedChat(chat)}
                          className={`w-full text-left p-3.5 flex justify-between items-center transition ${selectedUnlinkedChat?.id === chat.id ? 'bg-emerald-500/5' : 'hover:bg-slate-900/40'}`}
                        >
                          <div>
                            <span className="font-bold text-slate-200 block text-xs">{chat.parentPhone}</span>
                            <span className="text-[10px] text-rose-400 font-bold flex items-center gap-1 mt-0.5">
                              <AlertCircle className="h-3 w-3" /> Unlinked Sender
                            </span>
                          </div>
                          <ChevronRight className="h-4 w-4 text-slate-600" />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Right Chat console & Linking Action */}
                  <div className="lg:col-span-2 flex flex-col justify-between bg-slate-950/20">
                    {selectedUnlinkedChat ? (
                      <>
                        <div className="p-3 border-b border-slate-850 bg-slate-950 flex items-center justify-between">
                          <div>
                            <span className="font-bold text-xs text-white block">{selectedUnlinkedChat.parentPhone}</span>
                            <span className="text-[10px] text-slate-400">Direct WABA Inbox</span>
                          </div>
                          <button 
                            onClick={() => {
                              // Auto link to Nabeel Sajid STUD-102
                              const targetStudent = students.find(s => s.code === "STUD-102");
                              if (!targetStudent) return;

                              // 1. Permanently update student contact
                              setStudents(prev => prev.map(s => s.code === "STUD-102" ? { ...s, parentPhone: selectedUnlinkedChat.parentPhone } : s));

                              // 2. Link chat thread and assign to Usthad Ibrahim
                              setChats(prev => prev.map(c => {
                                if (c.id === selectedUnlinkedChat.id) {
                                  return {
                                    ...c,
                                    parentName: targetStudent.parentName,
                                    studentName: targetStudent.name,
                                    usthadId: "staff_1",
                                    isRecognized: true
                                  };
                                }
                                return c;
                              }));

                              setSelectedUnlinkedChat(null);
                              alert(`✅ Sender successfully verified as ${targetStudent.parentName}. Conversation permanently linked to ${targetStudent.name} and routed to Usthad Ibrahim's portal!`);
                            }}
                            className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-[11px] font-black px-3 py-1.5 rounded-lg flex items-center gap-1 transition"
                          >
                            <UserPlus className="h-3.5 w-3.5" /> Verify & Link Student (STUD-102)
                          </button>
                        </div>

                        {/* Message log */}
                        <div className="p-4 flex-1 overflow-y-auto flex flex-col gap-3">
                          {selectedUnlinkedChat.messages.map((m: any, i: number) => (
                            <div 
                              key={i}
                              className={`max-w-[80%] p-2.5 rounded-lg text-xs leading-normal ${m.sender === 'parent' ? 'bg-slate-900 border border-slate-800 self-start text-slate-200' : 'bg-emerald-600 text-slate-950 font-medium self-end'}`}
                            >
                              {m.text}
                            </div>
                          ))}
                        </div>

                        {/* Send box */}
                        <div className="p-3 border-t border-slate-850 bg-slate-950 flex items-center gap-2">
                          <input 
                            type="text"
                            placeholder="Type a query reply to unlinked parent..."
                            className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
                          />
                          <button 
                            onClick={() => alert("📨 Verification query dispatched over WhatsApp!")}
                            className="bg-emerald-500 text-slate-950 p-2 rounded-lg"
                          >
                            <Send className="h-4 w-4" />
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="p-8 text-center text-slate-600 space-y-2 flex flex-col items-center justify-center h-full">
                        <MessageSquare className="h-8 w-8 text-slate-700" />
                        <p className="text-xs">Select an unlinked parent thread to chat and resolve identity alignment.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* SUB-VIEW 3D: KITCHEN STORE STOCK PREVIEW BOARD */}
            {nazimActiveTab === 'store_room' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <ChefHat className="h-5 w-5 text-emerald-400" />
                    Kitchen Storeroom Stock Board
                  </h3>
                  <p className="text-xs text-slate-400">Real-time alerts sent by cook over WhatsApp regarding kitchen inventory supplies.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {kitchenStock.map((item, idx) => (
                    <div key={idx} className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-3">
                      <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                        <strong className="text-white text-sm">{item.item}</strong>
                        <span className="text-[10px] text-slate-500">{item.lastUpdated}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-slate-500 block">Available Stock:</span>
                          <span className="font-bold text-rose-400">{item.currentStock}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Required Order:</span>
                          <span className="font-bold text-teal-400">{item.neededQuantity}</span>
                        </div>
                      </div>

                      <button 
                        onClick={() => alert(`🛒 Purchase Order of ${item.neededQuantity} generated for ${item.item}!`)}
                        className="w-full bg-slate-900 hover:bg-slate-850 border border-slate-800 text-[11px] font-bold py-1.5 rounded transition text-slate-300"
                      >
                        Generate Purchase Order
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SUB-VIEW 3E: OPERATIONAL CHECKLIST */}
            {nazimActiveTab === 'checklist' && (
              <div className="space-y-6 max-w-xl">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <ClipboardList className="h-5 w-5 text-emerald-400" />
                    Nazim Daily Administrative Tasks
                  </h3>
                  <p className="text-xs text-slate-400">Accomplishing duties directly maintains your operational rating. Your rating makes up 25% of the global center ranking.</p>
                </div>

                <div className="space-y-3">
                  {nazimDuties.map(duty => (
                    <div key={duty.id} className="bg-slate-950 p-4 rounded-xl border border-slate-850 flex items-center justify-between">
                      <span className={`text-xs font-bold ${duty.isCompleted ? 'text-slate-300 line-through' : 'text-slate-200'}`}>
                        {duty.title}
                      </span>
                      <input 
                        type="checkbox"
                        checked={duty.isCompleted}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setNazimDuties(prev => prev.map(d => d.id === duty.id ? { ...d, isCompleted: checked } : d));
                        }}
                        className="h-5 w-5 accent-emerald-500 cursor-pointer"
                      />
                    </div>
                  ))}
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 flex justify-between items-center text-xs">
                  <span className="text-slate-400">Dynamic Duty Accomplishment Grade:</span>
                  <strong className="text-sm text-emerald-400">{staff.find(s => s.role === 'nazim')?.rating}% Rating</strong>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* =============================================================================
          ROLE 4: SECURE HOSTEL KIOSK (SHARED STUDENT DEVICE PORTAL)
          ============================================================================= */}
      {activeRole === 'kiosk' && (
        <div className="flex-1 max-w-lg w-full mx-auto p-4 md:p-6 flex flex-col justify-center">
          
          {!loggedInKioskStudent ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5 animate-scaleIn">
              <div className="text-center space-y-2">
                <div className="h-14 w-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto text-rose-400">
                  <Key className="h-7 w-7" />
                </div>
                <h2 className="text-lg font-black text-white">Student Hostel Terminal</h2>
                <p className="text-xs text-slate-400">Log in securely using your Student Card ID and 4-digit PIN.</p>
              </div>

              <form onSubmit={handleKioskLogin} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Student Card ID</label>
                  <input 
                    type="text"
                    value={kioskCardId}
                    onChange={(e) => setKioskCardId(e.target.value)}
                    placeholder="e.g. STUD-101"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white text-center font-mono focus:outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Private Security PIN</label>
                  <input 
                    type="password"
                    maxLength={4}
                    value={kioskPin}
                    onChange={(e) => setKioskPin(e.target.value)}
                    placeholder="••••"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white text-center font-mono focus:outline-none tracking-widest text-lg"
                  />
                </div>

                {kioskError && (
                  <p className="text-xs text-rose-400 font-bold text-center flex items-center gap-1 justify-center">
                    <AlertCircle className="h-4.5 w-4.5" /> {kioskError}
                  </p>
                )}

                <div className="text-[10px] text-slate-500 leading-normal text-center">
                  ⚠️ <strong>Demo Pin Guides:</strong> Zaid PIN is <code className="text-slate-300">1111</code>, Yahiya PIN is <code className="text-slate-300">4444</code>.
                </div>

                <button 
                  type="submit"
                  className="w-full bg-rose-500 hover:bg-rose-600 text-white font-black py-3 rounded-xl transition"
                >
                  Verify Access Card
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 md:p-6 shadow-2xl space-y-6 animate-scaleIn">
              
              {/* Card Header */}
              <div className="flex justify-between items-start border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-base font-black text-white">{loggedInKioskStudent.name}</h3>
                  <span className="text-xs text-rose-400 font-bold">{loggedInKioskStudent.code} | {loggedInKioskStudent.centerName}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded font-black block animate-pulse">
                    Auto-Lock: {kioskInactivityTimer}s
                  </span>
                  <button 
                    onClick={() => {
                      setLoggedInKioskStudent(null);
                      setKioskCardId("");
                      setKioskPin("");
                    }}
                    className="text-[10px] text-slate-500 underline hover:text-slate-300 mt-1 block"
                  >
                    Logout Card
                  </button>
                </div>
              </div>

              {/* Progress Radar Chart Visual */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-850">
                <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider mb-2">Tarbiyyah Performance Chart</span>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" radius="75%" data={[
                      { category: "Namaz", score: loggedInKioskStudent.overallScore },
                      { category: "Hygiene", score: loggedInKioskStudent.overallScore + 5 },
                      { category: "Study", score: loggedInKioskStudent.overallScore - 10 },
                      { category: "Chores", score: loggedInKioskStudent.overallScore + 10 }
                    ]}>
                      <PolarGrid stroke="#334155" />
                      <PolarAngleAxis dataKey="category" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#334155" tick={{ fontSize: 8 }} />
                      <Radar name={loggedInKioskStudent.name} dataKey="score" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.15} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Kiosk Stars and Warnings list */}
              <div className="space-y-3.5">
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-400 block uppercase">Behavioral Merits Log</span>
                  {loggedInKioskStudent.stars.length > 0 ? (
                    loggedInKioskStudent.stars.map((s: any) => (
                      <div key={s.id} className="bg-slate-950 p-3 rounded-lg border border-slate-850 space-y-1 text-xs">
                        <strong className="text-amber-400 flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-amber-400" /> {s.category}</strong>
                        <p className="text-slate-300 leading-normal">{s.explanation}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500">No achievements recorded yet.</p>
                  )}
                </div>
              </div>

              {/* Direct secure complaint box */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-3">
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-1">
                    <ShieldAlert className="h-4 w-4 text-rose-500" /> Secure Direct-to-HQ Complaint Box
                  </h4>
                  <p className="text-[10px] text-slate-500">This submission bypasses all local teachers. Goes straight to the super admin.</p>
                </div>

                <div className="space-y-2.5">
                  <select 
                    value={kioskComplaintCategory}
                    onChange={(e) => setKioskComplaintCategory(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-[11px] rounded p-1.5 text-white"
                  >
                    <option value="Hostel & Hygiene">Hostel Facility & Hygiene</option>
                    <option value="Nazim Mismanagement">Nazim Mismanagement Concerns</option>
                    <option value="General food issues">Food Quality issues</option>
                    <option value="Other issues">Other private concerns</option>
                  </select>

                  <textarea 
                    rows={2}
                    value={kioskComplaintText}
                    onChange={(e) => setKioskComplaintText(e.target.value)}
                    placeholder="Write your concerns safely here..."
                    className="w-full bg-slate-900 border border-slate-800 text-xs rounded p-2 text-white focus:outline-none"
                  />

                  <button 
                    onClick={handleKioskComplaintSubmit}
                    className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs py-1.5 rounded transition"
                  >
                    Submit Secure Ticket
                  </button>
                </div>
              </div>

            </div>
          )}
        </div>
      )}

      {/* =============================================================================
          ROLE 5: PARENT WHATSAPP SIMULATOR
          ============================================================================= */}
      {activeRole === 'parent_sim' && (
        <div className="flex-1 max-w-lg w-full mx-auto p-4 md:p-6 flex flex-col justify-center">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 md:p-6 shadow-2xl space-y-6">
            
            <div className="text-center space-y-1">
              <div className="h-12 w-12 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto text-amber-400">
                <MessageSquare className="h-6 w-6" />
              </div>
              <h2 className="text-base font-black text-white">Parent WhatsApp Device Simulator</h2>
              <p className="text-xs text-slate-400">Test how incoming WhatsApp texts are parsed and routed by the Meta API Cloud webhook.</p>
            </div>

            <div className="space-y-4">
              
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase block">Simulated Phone Number</label>
                <select 
                  value={simPhoneNumber}
                  onChange={(e) => setSimPhoneNumber(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-xs rounded-lg p-2.5 text-white"
                >
                  <option value="+919876543210">+919876543210 (Registered: Zaid's Father)</option>
                  <option value="+919000000000">+919000000000 (Unlinked: Nabeel's Father)</option>
                  <option value="+918888888888">+918888888888 (Random Unregistered Number)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase block">Message Body Content</label>
                <textarea 
                  rows={3}
                  value={simMessageText}
                  onChange={(e) => setSimMessageText(e.target.value)}
                  placeholder="e.g. Is he eating properly? Or type a complaint message..."
                  className="w-full bg-slate-950 border border-slate-800 text-xs rounded-xl p-3 text-white focus:outline-none font-mono"
                />
              </div>

              <div className="bg-slate-950/60 p-3.5 rounded-lg border border-slate-850 space-y-2 text-xs text-slate-400 leading-relaxed">
                📢 <strong>How to test features:</strong>
                <ul className="list-disc pl-4 space-y-1 text-[11px]">
                  <li>Send a normal message from the <strong className="text-amber-400">Registered</strong> number, then switch to the <strong className="text-indigo-400">Usthad Portal</strong> (WhatsApp tab) to view the message auto-mapped to Ibrahim Kutty's inbox.</li>
                  <li>Send a message containing the word <strong className="text-rose-400">&ldquo;complaint&rdquo;</strong> to watch it bypass the local branch and route directly to the <strong className="text-rose-400">Super Admin</strong> dashboard.</li>
                  <li>Send a message from the <strong className="text-emerald-400">Unlinked</strong> number, then switch to the <strong className="text-emerald-400">Nazim Workspace</strong> (Unlinked Chats tab) to verify identity, search student profiles, and link the number permanently.</li>
                </ul>
              </div>

              <button 
                onClick={handleSimulateWhatsAppMessage}
                className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-black py-2.5 rounded-xl text-xs transition"
              >
                Send WABA Message
              </button>

            </div>

          </div>
        </div>
      )}

      {/* Footer copyright */}
      <footer className="bg-slate-950 border-t border-slate-900 py-4 text-center text-[11px] text-slate-600">
        © 2026 Digi Dars CRM Multi-tenant Core Hub. All Rights Reserved.
      </footer>

    </div>
  );
}

// Simple helper functions for rendering & documentation matching
function sIdMatching(nameA: string, nameB: string): boolean {
  if (!nameA || !nameB) return false;
  return nameA.toLowerCase().trim() === nameB.toLowerCase().trim();
}
