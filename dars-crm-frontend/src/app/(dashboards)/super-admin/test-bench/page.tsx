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
import { useTheme } from '@/context/ThemeContext';
import ThemeToggle from '@/components/ThemeToggle';

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

export interface LeaveRequest {
  id: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: string;
}

export interface StarItem {
  id: string;
  category: string;
  date: string;
  teacher: string;
  explanation: string;
}

export interface WarningItem {
  id: string;
  category: string;
  severity: string;
  date: string;
  teacher: string;
  explanation: string;
}

export interface Student {
  id: string;
  code: string;
  name: string;
  centerId: string;
  centerName: string;
  centerCode: string;
  batchName: string;
  parentName: string;
  parentPhone: string;
  overallScore: number;
  attendanceRate: number;
  memorizedJuz: string;
  sabakScore: number;
  stars: StarItem[];
  warnings: WarningItem[];
  leaveRequests: LeaveRequest[];
}

export interface Staff {
  id: string;
  code: string;
  name: string;
  role: string;
  centerId: string;
  centerName: string;
  baseSalary: number;
  advanceTaken: number;
  paymentMethod: string;
  rating: number;
  batchManaged?: string;
  isPaid: boolean;
  leaveRequests: LeaveRequest[];
}

export interface Complaint {
  id: string;
  centerId: string;
  centerName: string;
  studentName: string;
  parentPhone: string;
  description: string;
  category: string;
  status: string;
  createdAt: string;
}

export interface ChatMessage {
  sender: string;
  text: string;
  time: string;
}

export interface Chat {
  id: string;
  parentPhone: string;
  parentName: string;
  studentName: string;
  usthadId: string | null;
  isRecognized: boolean;
  messages: ChatMessage[];
}

export interface KitchenStockItem {
  item: string;
  currentStock: string;
  neededQuantity: string;
  lastUpdated: string;
}

// =============================================================================
// INITIAL UNIFIED DATA STATE (SHARED SEAMLESSLY BETWEEN PORTALS)
// =============================================================================

const INITIAL_STUDENTS: Student[] = [
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
    parentPhone: "+919000000000",
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
    overallScore: 50,
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
    overallScore: 40,
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

const INITIAL_STAFF: Staff[] = [
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
    rating: 70,
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

const INITIAL_COMPLAINTS: Complaint[] = [
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

const INITIAL_CHATS: Chat[] = [
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
    parentPhone: "+919000000000",
    parentName: "Unknown Parent",
    studentName: "Unlinked Roster",
    usthadId: null,
    isRecognized: false,
    messages: [
      { sender: "parent", text: "Hello, is this the Al-Noor Madrasa? I want to ask about my son Nabeel's progress.", time: "10:15 AM" }
    ]
  }
];

const INITIAL_KITCHEN_STOCK: KitchenStockItem[] = [
  { item: "Basmati Rice", currentStock: "45 kg", neededQuantity: "50 kg", lastUpdated: "Today 07:00 AM" },
  { item: "Coconut Oil", currentStock: "8 Liters", neededQuantity: "15 Liters", lastUpdated: "Yesterday" },
  { item: "Onions & Potatoes", currentStock: "5 kg", neededQuantity: "25 kg", lastUpdated: "Today 07:00 AM" }
];

// =============================================================================
// MAIN APP COMPONENT
// =============================================================================

export default function UnifiedDarsCrmApp() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Theme Utility Classes (Dark mode = Pure Black #000000, Light mode = Pure White #ffffff)
  const mainBgClass = isDark ? 'bg-black text-white' : 'bg-white text-slate-900';
  const navBgClass = isDark ? 'bg-neutral-950 border-neutral-800' : 'bg-slate-100 border-slate-200';
  const cardBgClass = isDark ? 'bg-neutral-950 border-neutral-800' : 'bg-slate-50 border-slate-200 shadow-sm';
  const innerCardClass = isDark ? 'bg-black border-neutral-850' : 'bg-white border-slate-200 shadow-sm';
  const inputBgClass = isDark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-white border-slate-300 text-slate-900';
  const subMenuBgClass = isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-slate-200 border-slate-300';
  const textMutedClass = isDark ? 'text-neutral-400' : 'text-slate-600';
  const textTitleClass = isDark ? 'text-white' : 'text-slate-900';

  // Shared Live Application States
  const [activeRole, setActiveRole] = useState<'super_admin' | 'usthad' | 'nazim' | 'kiosk' | 'parent_sim'>('super_admin');
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [staff, setStaff] = useState<Staff[]>(INITIAL_STAFF);
  const [complaints, setComplaints] = useState<Complaint[]>(INITIAL_COMPLAINTS);
  const [chats, setChats] = useState<Chat[]>(INITIAL_CHATS);
  const [isLibraryEnabled, setIsLibraryEnabled] = useState(false);
  const [kitchenStock, setKitchenStock] = useState<KitchenStockItem[]>(INITIAL_KITCHEN_STOCK);
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
  const [selectedUnlinkedChat, setSelectedUnlinkedChat] = useState<Chat | null>(null);

  // Student Kiosk States
  const [kioskCardId, setKioskCardId] = useState("");
  const [kioskPin, setKioskPin] = useState("");
  const [loggedInKioskStudent, setLoggedInKioskStudent] = useState<Student | null>(null);
  const [kioskError, setKioskError] = useState("");
  const [kioskComplaintCategory, setKioskComplaintCategory] = useState("Hostel & Hygiene");
  const [kioskComplaintText, setKioskComplaintText] = useState("");
  const [kioskInactivityTimer, setKioskInactivityTimer] = useState(60);

  // Parent WhatsApp Simulator States
  const [simPhoneNumber, setSimPhoneNumber] = useState("+919876543210");
  const [simMessageText, setSimMessageText] = useState("");

  // Calculate Nazim Rating based on duty checkboxes
  useEffect(() => {
    const completed = nazimDuties.filter(d => d.isCompleted).length;
    const rate = Math.round((completed / nazimDuties.length) * 100);
    setStaff(prev => prev.map(s => s.role === 'nazim' ? { ...s, rating: rate } : s));
  }, [nazimDuties]);

  // Recalculate Usthad Ibrahim's rating based on batch failure rates
  useEffect(() => {
    const ibrahimStudents = students.filter(s => s.centerId === 'ctr_1' && s.batchName === 'Hifz Batch A');
    const underperforming = ibrahimStudents.filter(s => s.overallScore < 70).length;
    const failureRate = ibrahimStudents.length > 0 ? underperforming / ibrahimStudents.length : 0;

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

    const matchedStudent = students.find(s => s.parentPhone === simPhoneNumber);
    
    if (matchedStudent) {
      const isComplaint = simMessageText.toLowerCase().includes("complaint") || simMessageText.startsWith("#complaint");
      
      if (isComplaint) {
        const newComplaint: Complaint = {
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
        const newChat: Chat = {
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

    const newComp: Complaint = {
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

  const selectedStudentProfile = adminSubmenu === 'students' ? students.find(s => s.id === selectedProfileId) : undefined;
  const selectedStaffProfile = adminSubmenu === 'staff' ? staff.find(st => st.id === selectedProfileId) : undefined;

  const avgStudentScore = Math.round(students.reduce((acc, s) => acc + s.overallScore, 0) / students.length);

  return (
    <div className={`min-h-screen font-sans flex flex-col transition-colors ${mainBgClass}`}>
      
      {/* =============================================================================
          MASTER GLOBAL ROLE NAV & THEME TOGGLE (CONNECTS ALL PORTALS)
          ============================================================================= */}
      <div className={`p-3 sticky top-0 z-50 border-b shadow-md transition-colors ${navBgClass}`}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-teal-500 flex items-center justify-center font-black text-slate-950 shadow-md shadow-teal-500/20">
              D
            </div>
            <div>
              <span className={`font-bold tracking-tight text-sm ${textTitleClass}`}>DIGI DARS PLATFORM COCKPIT</span>
              <p className="text-[10px] text-teal-500 font-semibold tracking-wider uppercase">Active Integration Workspace</p>
            </div>
          </div>
          
          <div className="flex items-center flex-wrap gap-2 self-start md:self-auto">
            <div className={`flex items-center flex-wrap gap-1 p-1 rounded-xl border ${
              isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-slate-200 border-slate-300'
            }`}>
              <span className={`text-[10px] font-bold px-2 ${textMutedClass}`}>PORTAL:</span>
              <button 
                onClick={() => { setActiveRole('super_admin'); setSelectedProfileId(null); }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${activeRole === 'super_admin' ? 'bg-teal-500 text-slate-950 shadow-md' : `${textMutedClass} hover:text-teal-500`}`}
              >
                <Key className="h-3 w-3" /> Super Admin
              </button>
              <button 
                onClick={() => setActiveRole('usthad')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${activeRole === 'usthad' ? 'bg-indigo-500 text-white shadow-md' : `${textMutedClass} hover:text-indigo-400`}`}
              >
                <Award className="h-3 w-3" /> Usthad Portal
              </button>
              <button 
                onClick={() => setActiveRole('nazim')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${activeRole === 'nazim' ? 'bg-emerald-500 text-slate-950 shadow-md' : `${textMutedClass} hover:text-emerald-500`}`}
              >
                <Building className="h-3 w-3" /> Nazim Workspace
              </button>
              <button 
                onClick={() => setActiveRole('kiosk')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${activeRole === 'kiosk' ? 'bg-rose-500 text-white shadow-md' : `${textMutedClass} hover:text-rose-400`}`}
              >
                <ChefHat className="h-3 w-3" /> Hostel Kiosk
              </button>
              <button 
                onClick={() => setActiveRole('parent_sim')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${activeRole === 'parent_sim' ? 'bg-amber-500 text-slate-950 shadow-md' : `${textMutedClass} hover:text-amber-500`}`}
              >
                <MessageSquare className="h-3 w-3" /> WhatsApp Sim
              </button>
            </div>

            {/* Global Theme Toggle Button */}
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* =============================================================================
          ROLE 1: SUPER ADMIN CONTROL PANEL ("HOME" OVERVIEW WITH FULL DRILL-DOWN)
          ============================================================================= */}
      {activeRole === 'super_admin' && (() => {
        const ctr1Students = students.filter(s => s.centerId === 'ctr_1');
        const ctr1AvgStudent = ctr1Students.length > 0 ? Math.round(ctr1Students.reduce((acc, s) => acc + s.overallScore, 0) / ctr1Students.length) : 0;
        const ctr1StaffUsthads = staff.filter(s => s.centerId === 'ctr_1' && s.role === 'usthad');
        const ctr1AvgUsthad = ctr1StaffUsthads.length > 0 ? Math.round(ctr1StaffUsthads.reduce((acc, s) => acc + s.rating, 0) / ctr1StaffUsthads.length) : 0;
        const ctr1NazimRating = staff.find(s => s.centerId === 'ctr_1' && s.role === 'nazim')?.rating || 0;
        const ctr1OverallScore = Math.round((ctr1AvgStudent * 0.4) + (ctr1AvgUsthad * 0.35) + (ctr1NazimRating * 0.25));

        const ctr2Students = students.filter(s => s.centerId === 'ctr_2');
        const ctr2AvgStudent = ctr2Students.length > 0 ? Math.round(ctr2Students.reduce((acc, s) => acc + s.overallScore, 0) / ctr2Students.length) : 100;
        const ctr2StaffUsthads = staff.filter(s => s.centerId === 'ctr_2' && s.role === 'usthad');
        const ctr2AvgUsthad = ctr2StaffUsthads.length > 0 ? Math.round(ctr2StaffUsthads.reduce((acc, s) => acc + s.rating, 0) / ctr2StaffUsthads.length) : 100;
        const ctr2NazimRating = staff.find(s => s.centerId === 'ctr_2' && s.role === 'nazim')?.rating || 100;
        const ctr2OverallScore = Math.round((ctr2AvgStudent * 0.4) + (ctr2AvgUsthad * 0.35) + (ctr2NazimRating * 0.25));

        const avgCentersRanking = Math.round((ctr1OverallScore + ctr2OverallScore) / 2);

        return (
          <div className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">
            
            {/* Dashboard breadcrumb and title banner */}
            <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4 ${
              isDark ? 'border-neutral-800' : 'border-slate-200'
            }`}>
              <div>
                <h2 className={`text-xl font-extrabold flex items-center gap-2 ${textTitleClass}`}>
                  <Settings className="h-6 w-6 text-teal-500 animate-spin-slow" />
                  Super Admin HQ Portal - "Home" Overview
                </h2>
                <p className={`text-xs ${textMutedClass}`}>Centralized governance panel, multi-tenant monitoring, and scholastic auditing</p>
              </div>
              
              {/* Breadcrumb Indicator */}
              <div className={`flex items-center gap-2 p-1.5 px-3 rounded-lg text-xs font-semibold border ${
                isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-slate-100 border-slate-200'
              }`}>
                <span className={`${textMutedClass} cursor-pointer hover:text-teal-500`} onClick={() => setAdminViewMode('home')}>Home</span>
                {adminViewMode !== 'home' && <span className={textMutedClass}>/</span>}
                {adminViewMode === 'centers_list' && <span className="text-teal-500 font-bold">Centers Rankings</span>}
                {adminViewMode === 'center_detail' && (
                  <>
                    <span className={`${textMutedClass} cursor-pointer hover:text-teal-500`} onClick={() => setAdminViewMode('centers_list')}>Centers</span>
                    <span className={textMutedClass}>/</span>
                    <span className="text-teal-500 font-bold">{selectedCenterId === 'ctr_1' ? 'Calicut' : 'Malappuram'}</span>
                  </>
                )}
                {adminViewMode === 'usthad_list' && (
                  <>
                    <span className={`${textMutedClass} cursor-pointer hover:text-teal-500`} onClick={() => setAdminViewMode('center_detail')}>Center Detail</span>
                    <span className={textMutedClass}>/</span>
                    <span className="text-teal-500 font-bold">Usthads List</span>
                  </>
                )}
                {adminViewMode === 'student_list' && (
                  <>
                    <span className={`${textMutedClass} cursor-pointer hover:text-teal-500`} onClick={() => setAdminViewMode('center_detail')}>Center Detail</span>
                    <span className={textMutedClass}>/</span>
                    <span className="text-teal-500 font-bold">Students List</span>
                  </>
                )}
              </div>
            </div>

            {/* OVERVIEW OF ALL FACILITIES */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              
              {/* CARD 1: WHATSAPP MESSAGES PENDING */}
              <div 
                onClick={() => {
                  setActiveRole('nazim');
                  setNazimActiveTab('unlinked_chats');
                  alert("Navigating to Nazim Workspace -> 'Unlinked Chats' to resolve parent queries.");
                }}
                className={`p-4 rounded-xl flex flex-col justify-between border cursor-pointer transition group ${cardBgClass} hover:border-teal-500/50`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] text-teal-500 font-extrabold tracking-wider uppercase">WhatsApp Pending</span>
                  <MessageSquare className="h-4.5 w-4.5 text-teal-500 group-hover:scale-110 transition" />
                </div>
                <div>
                  <span className={`text-2xl font-black block ${textTitleClass}`}>
                    {chats.filter(c => !c.isRecognized || c.messages.some(m => m.sender === 'parent')).length} Thread(s)
                  </span>
                  <span className={`text-[10px] font-medium block mt-1 ${textMutedClass}`}>Pending parent inquiries</span>
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
                className={`p-4 rounded-xl flex flex-col justify-between border cursor-pointer transition group ${cardBgClass} hover:border-rose-500/50`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] text-rose-500 font-extrabold tracking-wider uppercase">Complaints Open</span>
                  <ShieldAlert className="h-4.5 w-4.5 text-rose-500 animate-pulse group-hover:scale-110 transition" />
                </div>
                <div>
                  <span className="text-2xl font-black text-rose-500 block">
                    {complaints.filter(c => c.status === 'pending_super_admin').length} Active
                  </span>
                  <span className={`text-[10px] font-medium block mt-1 ${textMutedClass}`}>Confidential student reports</span>
                </div>
              </div>

              {/* CARD 3: INCOME */}
              <div className={`p-4 rounded-xl flex flex-col justify-between border ${cardBgClass}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] text-emerald-500 font-extrabold tracking-wider uppercase">Monthly Income</span>
                  <DollarSign className="h-4.5 w-4.5 text-emerald-500" />
                </div>
                <div>
                  <span className="text-2xl font-black text-emerald-500 block">₹1,85,000</span>
                  <span className={`text-[10px] font-medium block mt-1 ${textMutedClass}`}>Fee and Zakat collections</span>
                </div>
              </div>

              {/* CARD 4: SPENDING */}
              <div className={`p-4 rounded-xl flex flex-col justify-between border ${cardBgClass}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] text-rose-500 font-extrabold tracking-wider uppercase">Monthly Spending</span>
                  <CreditCard className="h-4.5 w-4.5 text-rose-500" />
                </div>
                <div>
                  <span className="text-2xl font-black text-rose-500 block">₹50,500</span>
                  <span className={`text-[10px] font-medium block mt-1 ${textMutedClass}`}>Payroll & food operations</span>
                </div>
              </div>

              {/* CARD 5: TOTAL GRADING OF STUDENTS */}
              <div className={`p-4 rounded-xl flex flex-col justify-between border ${cardBgClass}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] text-indigo-500 font-extrabold tracking-wider uppercase">Student Grading</span>
                  <Users className="h-4.5 w-4.5 text-indigo-500" />
                </div>
                <div>
                  <span className="text-2xl font-black text-indigo-500 block">{avgStudentScore}% Avg</span>
                  <span className={`text-[10px] font-medium block mt-1 ${textMutedClass}`}>All branches cumulative</span>
                </div>
              </div>

              {/* CARD 6: AVERAGE RANKING OF ALL CENTERS */}
              <div 
                onClick={() => {
                  setAdminViewMode('centers_list');
                }}
                className={`p-4 rounded-xl flex flex-col justify-between border border-dashed cursor-pointer transition group ${cardBgClass} hover:border-amber-500/50`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] text-amber-500 font-extrabold tracking-wider uppercase">Centers Average</span>
                  <Award className="h-4.5 w-4.5 text-amber-500 group-hover:scale-110 transition animate-bounce" />
                </div>
                <div>
                  <span className="text-2xl font-black text-amber-500 block">
                    {avgCentersRanking}% Avg
                  </span>
                  <span className="text-[10px] text-amber-500 font-extrabold block mt-1 underline">Click to view list</span>
                </div>
              </div>

            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* LEFT COLUMN: ACTIVE INTERACTIVE SUBVIEWS OR GENERAL WORKSPACES */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* SUBVIEW 1A: DEFAULT DIRECTORY SEARCH OVERVIEW */}
                {adminViewMode === 'home' && (
                  <div className={`rounded-2xl p-5 space-y-4 border ${cardBgClass}`}>
                    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4 ${
                      isDark ? 'border-neutral-800' : 'border-slate-200'
                    }`}>
                      <div>
                        <h3 className={`font-bold flex items-center gap-2 ${textTitleClass}`}>
                          <ClipboardList className="h-5 w-5 text-teal-500" />
                          Oversight & Leaves Directory
                        </h3>
                        <p className={`text-xs ${textMutedClass}`}>Search and approve profiles across all network branches</p>
                      </div>
                      
                      {/* Leaves sub-menus toggler */}
                      <div className={`flex p-1 rounded-lg border ${subMenuBgClass}`}>
                        <button 
                          onClick={() => { setAdminSubmenu('students'); setSelectedProfileId(null); }}
                          className={`px-3 py-1 rounded-md text-xs font-bold transition ${adminSubmenu === 'students' ? 'bg-teal-500 text-slate-950 shadow-sm' : `${textMutedClass} hover:text-teal-500`}`}
                        >
                          Students Directory
                        </button>
                        <button 
                          onClick={() => { setAdminSubmenu('staff'); setSelectedProfileId(null); }}
                          className={`px-3 py-1 rounded-md text-xs font-bold transition ${adminSubmenu === 'staff' ? 'bg-teal-500 text-slate-950 shadow-sm' : `${textMutedClass} hover:text-teal-500`}`}
                        >
                          Staff Directory
                        </button>
                      </div>
                    </div>

                    {/* Top Search bar */}
                    <div className="relative">
                      <Search className={`absolute left-3 top-3 h-4.5 w-4.5 ${textMutedClass}`} />
                      <input 
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={adminSubmenu === 'students' ? "Search student name, code, center name, or code..." : "Search staff name, code, center..."}
                        className={`w-full rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 border ${inputBgClass}`}
                      />
                    </div>

                    {/* Directory Result List */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[350px] overflow-y-auto pr-1">
                      {adminSubmenu === 'students' ? (
                        filteredStudents.map(student => (
                          <div 
                            key={student.id}
                            onClick={() => setSelectedProfileId(student.id)}
                            className={`p-4 rounded-xl border cursor-pointer transition flex justify-between items-start ${
                              selectedProfileId === student.id ? 'bg-teal-500/10 border-teal-500' : `${innerCardClass} hover:border-teal-500/40`
                            }`}
                          >
                            <div>
                              <div className="flex items-center gap-1.5 mb-1">
                                <span className="text-[10px] bg-slate-200 dark:bg-neutral-800 text-slate-700 dark:text-neutral-300 font-bold px-1.5 py-0.5 rounded uppercase">
                                  {student.code}
                                </span>
                                <span className="text-[10px] bg-teal-500/10 text-teal-500 font-bold px-1.5 py-0.5 rounded">
                                  {student.centerCode}
                                </span>
                              </div>
                              <h4 className={`font-bold text-sm ${textTitleClass}`}>{student.name}</h4>
                              <p className={`text-[11px] ${textMutedClass}`}>{student.centerName} | {student.batchName}</p>
                            </div>
                            
                            <div className="text-right">
                              <span className={`text-xs font-black block ${student.overallScore >= 70 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                {student.overallScore}% Grade
                              </span>
                              {student.leaveRequests.some(l => l.status === 'PENDING') && (
                                <span className="text-[9px] bg-amber-500/20 text-amber-500 font-bold px-1 py-0.5 rounded block mt-1 animate-pulse">
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
                            className={`p-4 rounded-xl border cursor-pointer transition flex justify-between items-start ${
                              selectedProfileId === member.id ? 'bg-teal-500/10 border-teal-500' : `${innerCardClass} hover:border-teal-500/40`
                            }`}
                          >
                            <div>
                              <div className="flex items-center gap-1.5 mb-1">
                                <span className="text-[10px] bg-slate-200 dark:bg-neutral-800 text-slate-700 dark:text-neutral-300 font-bold px-1.5 py-0.5 rounded uppercase">
                                  {member.code}
                                </span>
                                <span className="text-[10px] bg-indigo-500/10 text-indigo-500 font-bold px-1.5 py-0.5 rounded uppercase">
                                  {member.role}
                                </span>
                              </div>
                              <h4 className={`font-bold text-sm ${textTitleClass}`}>{member.name}</h4>
                              <p className={`text-[11px] ${textMutedClass}`}>{member.centerName}</p>
                            </div>
                            
                            <div className="text-right">
                              <span className={`text-xs font-black block ${member.rating >= 80 ? 'text-emerald-500' : member.rating >= 70 ? 'text-amber-500' : 'text-rose-500'}`}>
                                {member.rating}/100 Rating
                              </span>
                              {member.leaveRequests && member.leaveRequests.some(l => l.status === 'PENDING') && (
                                <span className="text-[9px] bg-amber-500/20 text-amber-500 font-bold px-1 py-0.5 rounded block mt-1 animate-pulse">
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
                  <div className={`rounded-2xl p-5 space-y-4 border ${cardBgClass}`}>
                    <div className={`flex items-center justify-between border-b pb-3 ${
                      isDark ? 'border-neutral-800' : 'border-slate-200'
                    }`}>
                      <div>
                        <h3 className={`font-bold flex items-center gap-2 ${textTitleClass}`}>
                          <Award className="h-5 w-5 text-amber-500" />
                          Center-wise Rankings Leaderboard
                        </h3>
                        <p className={`text-xs ${textMutedClass}`}>Relative performance index across all network institutions</p>
                      </div>
                      <button 
                        onClick={() => setAdminViewMode('home')}
                        className={`text-xs font-bold px-3 py-1.5 rounded-lg transition border ${
                          isDark ? 'bg-neutral-800 text-neutral-200 border-neutral-700 hover:bg-neutral-700' : 'bg-slate-200 text-slate-800 border-slate-300 hover:bg-slate-300'
                        }`}
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
                        className={`p-4 rounded-xl border cursor-pointer transition flex items-center justify-between gap-4 group ${innerCardClass} hover:border-teal-500/50`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 font-extrabold text-sm">
                            #1
                          </div>
                          <div>
                            <h4 className={`font-bold text-sm group-hover:text-teal-500 transition ${textTitleClass}`}>Malappuram Hifz Academy</h4>
                            <span className={`text-[11px] font-bold px-2 py-0.5 rounded border uppercase ${
                              isDark ? 'bg-neutral-900 text-neutral-400 border-neutral-800' : 'bg-slate-100 text-slate-600 border-slate-200'
                            }`}>Code: CTR-02</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-black text-emerald-500 block">{ctr2OverallScore}%</span>
                          <span className={`text-[10px] ${textMutedClass}`}>Global Score</span>
                        </div>
                      </div>

                      {/* CENTER CARD 2: CTR-01 (Calicut) */}
                      <div 
                        onClick={() => {
                          setSelectedCenterId('ctr_1');
                          setAdminViewMode('center_detail');
                        }}
                        className={`p-4 rounded-xl border cursor-pointer transition flex items-center justify-between gap-4 group ${innerCardClass} hover:border-teal-500/50`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`h-10 w-10 rounded-lg border flex items-center justify-center font-extrabold text-sm ${
                            isDark ? 'bg-neutral-900 border-neutral-800 text-neutral-400' : 'bg-slate-200 border-slate-300 text-slate-700'
                          }`}>
                            #2
                          </div>
                          <div>
                            <h4 className={`font-bold text-sm group-hover:text-teal-500 transition ${textTitleClass}`}>Al-Noor Central (Calicut)</h4>
                            <span className={`text-[11px] font-bold px-2 py-0.5 rounded border uppercase ${
                              isDark ? 'bg-neutral-900 text-neutral-400 border-neutral-800' : 'bg-slate-100 text-slate-600 border-slate-200'
                            }`}>Code: CTR-01</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-black text-amber-500 block">{ctr1OverallScore}%</span>
                          <span className={`text-[10px] ${textMutedClass}`}>Global Score</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* SUBVIEW 1C: CENTER DETAILS BREAKDOWNS */}
                {adminViewMode === 'center_detail' && (
                  <div className={`rounded-2xl p-5 space-y-4 border ${cardBgClass}`}>
                    <div className={`flex items-center justify-between border-b pb-3 ${
                      isDark ? 'border-neutral-800' : 'border-slate-200'
                    }`}>
                      <div>
                        <h3 className={`font-bold flex items-center gap-2 ${textTitleClass}`}>
                          <Building className="h-5 w-5 text-teal-500" />
                          {selectedCenterId === 'ctr_1' ? 'Al-Noor Central (Calicut)' : 'Malappuram Hifz Academy'} - Component Breakdown
                        </h3>
                        <p className={`text-xs ${textMutedClass}`}>Click on any core score parameter below to drill down into localized reports</p>
                      </div>
                      <button 
                        onClick={() => setAdminViewMode('centers_list')}
                        className={`text-xs font-bold px-3 py-1.5 rounded-lg transition border ${
                          isDark ? 'bg-neutral-800 text-neutral-200 border-neutral-700 hover:bg-neutral-700' : 'bg-slate-200 text-slate-800 border-slate-300 hover:bg-slate-300'
                        }`}
                      >
                        ← Back to List
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      
                      {/* Nazim card */}
                      <div 
                        onClick={() => {
                          if (selectedCenterId === 'ctr_1') {
                            setSelectedProfileId('staff_3');
                            setAdminSubmenu('staff');
                            alert("Loaded Nazim Faisal's detailed profile inside the right-hand panel.");
                          } else {
                            alert("Malappuram local administrator record is not initialized in this session sandbox.");
                          }
                        }}
                        className={`p-4 rounded-xl border cursor-pointer transition flex flex-col justify-between min-h-[140px] group ${innerCardClass} hover:border-emerald-500/50`}
                      >
                        <div>
                          <span className="text-[10px] text-emerald-500 font-extrabold block uppercase tracking-wider mb-1">Nazim Rating (Avg)</span>
                          <h4 className={`font-bold text-sm group-hover:text-emerald-500 transition ${textTitleClass}`}>Administration & Tasks</h4>
                          <p className={`text-[10px] mt-1 ${textMutedClass}`}>Local compliance tracking and duty audit logs</p>
                        </div>
                        <div className={`text-right mt-3 border-t pt-2 flex items-center justify-between ${
                          isDark ? 'border-neutral-800' : 'border-slate-200'
                        }`}>
                          <span className={`text-[10px] underline group-hover:text-emerald-500 transition ${textMutedClass}`}>View Profile</span>
                          <span className="text-lg font-black text-emerald-500">
                            {selectedCenterId === 'ctr_1' ? ctr1NazimRating : 100}%
                          </span>
                        </div>
                      </div>

                      {/* Usthad card */}
                      <div 
                        onClick={() => setAdminViewMode('usthad_list')}
                        className={`p-4 rounded-xl border cursor-pointer transition flex flex-col justify-between min-h-[140px] group ${innerCardClass} hover:border-indigo-500/50`}
                      >
                        <div>
                          <span className="text-[10px] text-indigo-500 font-extrabold block uppercase tracking-wider mb-1">Usthad Rating (Avg)</span>
                          <h4 className={`font-bold text-sm group-hover:text-indigo-500 transition ${textTitleClass}`}>Teaching Staff Ratings</h4>
                          <p className={`text-[10px] mt-1 ${textMutedClass}`}>Classroom grading with dynamic class penalties</p>
                        </div>
                        <div className={`text-right mt-3 border-t pt-2 flex items-center justify-between ${
                          isDark ? 'border-neutral-800' : 'border-slate-200'
                        }`}>
                          <span className="text-[10px] text-indigo-500 font-bold group-hover:underline">Drill Down List →</span>
                          <span className="text-lg font-black text-indigo-500">
                            {selectedCenterId === 'ctr_1' ? ctr1AvgUsthad : ctr2AvgUsthad}%
                          </span>
                        </div>
                      </div>

                      {/* Student card */}
                      <div 
                        onClick={() => setAdminViewMode('student_list')}
                        className={`p-4 rounded-xl border cursor-pointer transition flex flex-col justify-between min-h-[140px] group ${innerCardClass} hover:border-teal-500/50`}
                      >
                        <div>
                          <span className="text-[10px] text-teal-500 font-extrabold block uppercase tracking-wider mb-1">Students Rating (Avg)</span>
                          <h4 className={`font-bold text-sm group-hover:text-teal-500 transition ${textTitleClass}`}>Student Progress Grades</h4>
                          <p className={`text-[10px] mt-1 ${textMutedClass}`}>Average daily chores, hygiene, and namaz parameters</p>
                        </div>
                        <div className={`text-right mt-3 border-t pt-2 flex items-center justify-between ${
                          isDark ? 'border-neutral-800' : 'border-slate-200'
                        }`}>
                          <span className="text-[10px] text-teal-500 font-bold group-hover:underline">Drill Down List →</span>
                          <span className="text-lg font-black text-teal-500">
                            {selectedCenterId === 'ctr_1' ? ctr1AvgStudent : ctr2AvgStudent}%
                          </span>
                        </div>
                      </div>

                    </div>
                  </div>
                )}

                {/* SUBVIEW 1D: DRILL DOWN LIST OF USTHADS */}
                {adminViewMode === 'usthad_list' && (
                  <div className={`rounded-2xl p-5 space-y-4 border ${cardBgClass}`}>
                    <div className={`flex items-center justify-between border-b pb-3 ${
                      isDark ? 'border-neutral-800' : 'border-slate-200'
                    }`}>
                      <div>
                        <h3 className={`font-bold flex items-center gap-2 ${textTitleClass}`}>
                          <Award className="h-5 w-5 text-indigo-500" />
                          Usthads in {selectedCenterId === 'ctr_1' ? 'Al-Noor Central (Calicut)' : 'Malappuram Hifz Academy'}
                        </h3>
                        <p className={`text-xs ${textMutedClass}`}>Click on any teacher's profile to view full records in the right dossier panel</p>
                      </div>
                      <button 
                        onClick={() => setAdminViewMode('center_detail')}
                        className={`text-xs font-bold px-3 py-1.5 rounded-lg transition border ${
                          isDark ? 'bg-neutral-800 text-neutral-200 border-neutral-700 hover:bg-neutral-700' : 'bg-slate-200 text-slate-800 border-slate-300 hover:bg-slate-300'
                        }`}
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
                          className={`p-4 rounded-xl border cursor-pointer transition flex items-center justify-between gap-4 ${
                            selectedProfileId === teacher.id ? 'bg-indigo-500/10 border-indigo-500' : `${innerCardClass} hover:border-indigo-500/40`
                          }`}
                        >
                          <div>
                            <h4 className={`font-bold text-sm ${textTitleClass}`}>{teacher.name}</h4>
                            <p className={`text-xs ${textMutedClass}`}>Managing: <strong>{teacher.batchManaged}</strong> | Code: {teacher.code}</p>
                            {teacher.id === 'staff_1' && teacher.rating < 100 && (
                              <span className="text-[10px] bg-rose-500/15 text-rose-500 px-2 py-0.5 rounded font-bold block mt-1.5 border border-rose-500/20 max-w-max">
                                ⚠️ Class Penalty Triggered (-30 points due to batch underperformance)
                              </span>
                            )}
                          </div>
                          <div className="text-right flex items-center gap-3">
                            <div>
                              <span className="text-sm font-black text-indigo-500 block">{teacher.rating}/100</span>
                              <span className={`text-[9px] block uppercase ${textMutedClass}`}>Rating Score</span>
                            </div>
                            <ChevronRight className={`h-4 w-4 ${textMutedClass}`} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* SUBVIEW 1E: DRILL DOWN LIST OF STUDENTS */}
                {adminViewMode === 'student_list' && (
                  <div className={`rounded-2xl p-5 space-y-4 border ${cardBgClass}`}>
                    <div className={`flex items-center justify-between border-b pb-3 ${
                      isDark ? 'border-neutral-800' : 'border-slate-200'
                    }`}>
                      <div>
                        <h3 className={`font-bold flex items-center gap-2 ${textTitleClass}`}>
                          <Users className="h-5 w-5 text-teal-500" />
                          Students in {selectedCenterId === 'ctr_1' ? 'Al-Noor Central (Calicut)' : 'Malappuram Hifz Academy'}
                        </h3>
                        <p className={`text-xs ${textMutedClass}`}>Click on any profile below to load their achievements dossier and leave applications on the right panel</p>
                      </div>
                      <button 
                        onClick={() => setAdminViewMode('center_detail')}
                        className={`text-xs font-bold px-3 py-1.5 rounded-lg transition border ${
                          isDark ? 'bg-neutral-800 text-neutral-200 border-neutral-700 hover:bg-neutral-700' : 'bg-slate-200 text-slate-800 border-slate-300 hover:bg-slate-300'
                        }`}
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
                          className={`p-4 rounded-xl border cursor-pointer transition flex items-center justify-between gap-4 ${
                            selectedProfileId === student.id ? 'bg-teal-500/10 border-teal-500' : `${innerCardClass} hover:border-teal-500/40`
                          }`}
                        >
                          <div>
                            <h4 className={`font-bold text-sm ${textTitleClass}`}>{student.name}</h4>
                            <p className={`text-xs ${textMutedClass}`}>{student.batchName} | Card: {student.code}</p>
                            <div className="flex gap-1.5 mt-1">
                              <span className={`text-[9px] px-1.5 rounded ${
                                isDark ? 'bg-neutral-900 text-neutral-400' : 'bg-slate-200 text-slate-700'
                              }`}>Juz: {student.memorizedJuz.split(',')[0]}</span>
                              <span className={`text-[9px] px-1.5 rounded ${
                                isDark ? 'bg-neutral-900 text-neutral-400' : 'bg-slate-200 text-slate-700'
                              }`}>Attd: {student.attendanceRate}%</span>
                            </div>
                          </div>
                          <div className="text-right flex items-center gap-2">
                            <div>
                              <span className={`text-xs font-black block ${student.overallScore >= 70 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                {student.overallScore}%
                              </span>
                              <span className={`text-[9px] block uppercase font-medium ${textMutedClass}`}>Grade</span>
                            </div>
                            <ChevronRight className={`h-4 w-4 ${textMutedClass}`} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Direct-to-Super-Admin Triage System */}
                <div id="complaints-section" className={`rounded-2xl p-5 space-y-4 border scroll-mt-20 ${cardBgClass}`}>
                  <div>
                    <h3 className={`font-bold flex items-center gap-2 ${textTitleClass}`}>
                      <ShieldAlert className="h-5 w-5 text-rose-500 animate-pulse" />
                      Student/Parent Complaints Pipeline
                    </h3>
                    <p className={`text-xs ${textMutedClass}`}>Direct reports bypassing local branch logs. Direct action or route assignment.</p>
                  </div>

                  <div className="space-y-3.5">
                    {complaints.map(comp => (
                      <div key={comp.id} className={`p-4 rounded-xl space-y-3 border ${innerCardClass}`}>
                        <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-2 ${
                          isDark ? 'border-neutral-800' : 'border-slate-200'
                        }`}>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${
                              comp.category === 'Nazim Mismanagement' ? 'bg-rose-500/10 text-rose-500' : `${subMenuBgClass} ${textMutedClass}`
                            }`}>
                              {comp.category}
                            </span>
                            <span className={`text-xs font-medium ${textMutedClass}`}>From parent of {comp.studentName} ({comp.centerName})</span>
                          </div>
                          <span className={`text-[10px] ${textMutedClass}`}>{comp.createdAt}</span>
                        </div>

                        <p className={`text-sm p-3 rounded-lg border leading-relaxed italic ${
                          isDark ? 'bg-neutral-900 border-neutral-800 text-neutral-200' : 'bg-slate-100 border-slate-200 text-slate-800'
                        }`}>
                          &ldquo;{comp.description}&rdquo;
                        </p>

                        {/* Complaint Actions Panel */}
                        {comp.status === 'pending_super_admin' ? (
                          <div className="flex items-center flex-wrap gap-2 pt-1">
                            {comp.category === 'Nazim Mismanagement' ? (
                              <div className="flex items-center gap-2 w-full sm:w-auto">
                                <span className="text-rose-500 text-xs font-bold flex items-center gap-1 bg-rose-500/10 px-3 py-1.5 rounded-lg border border-rose-500/20">
                                  <AlertCircle className="h-3.5 w-3.5 animate-bounce" /> Direct Action Required (Locked from Nazim)
                                </span>
                                <button 
                                  onClick={() => {
                                    setComplaints(prev => prev.map(c => c.id === comp.id ? { ...c, status: 'resolved_by_super_admin' } : c));
                                    alert("Action recorded. Branch Trustees notified. Study rooms ordered to remain open till 11 PM.");
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
                                    alert("Complaint routed securely down to Nazim Faisal's active portal desk.");
                                  }}
                                  className="bg-teal-500 hover:bg-teal-600 text-slate-950 text-xs font-bold px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition"
                                >
                                  <ArrowRight className="h-3.5 w-3.5" /> Delegate to Nazim
                                </button>
                                <button 
                                  onClick={() => {
                                    setComplaints(prev => prev.map(c => c.id === comp.id ? { ...c, status: 'resolved_by_super_admin' } : c));
                                    alert("Resolved by Super Admin. Standard service notes recorded.");
                                  }}
                                  className={`text-xs font-bold px-3 py-1.5 rounded-lg transition border ${
                                    isDark ? 'bg-neutral-800 text-neutral-200 border-neutral-700' : 'bg-slate-200 text-slate-800 border-slate-300'
                                  }`}
                                >
                                  Resolve Direct
                                </button>
                              </>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs font-bold inline-flex items-center gap-1 text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                            <Check className="h-3.5 w-3.5" /> Status: {comp.status.replace(/_/g, ' ').toUpperCase()}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Scholastic Library Verification Portal */}
                <div className={`rounded-2xl p-5 space-y-4 border ${cardBgClass}`}>
                  <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4 ${
                    isDark ? 'border-neutral-800' : 'border-slate-200'
                  }`}>
                    <div>
                      <h3 className={`font-bold flex items-center gap-2 ${textTitleClass}`}>
                        <BookOpen className="h-5 w-5 text-indigo-500" />
                        Hadith Library Gateway Verification
                      </h3>
                      <p className={`text-xs ${textMutedClass}`}>Review external API collections before student/teacher release</p>
                    </div>

                    {/* Gatekeeper toggle switch */}
                    <div className={`flex items-center gap-2 p-1.5 px-3 rounded-xl border ${subMenuBgClass}`}>
                      <span className={`text-xs font-bold ${textMutedClass}`}>Released to Public:</span>
                      <button 
                        onClick={() => {
                          setIsLibraryEnabled(!isLibraryEnabled);
                          alert(isLibraryEnabled ? "Library locked globally." : "Library unlocked. Now visible to students and Usthads.");
                        }}
                        className={`h-6 w-11 rounded-full p-0.5 transition-colors duration-200 focus:outline-none ${isLibraryEnabled ? 'bg-teal-500' : 'bg-slate-400 dark:bg-neutral-700'}`}
                      >
                        <div className={`h-5 w-5 rounded-full bg-white transition-transform duration-200 flex items-center justify-center ${isLibraryEnabled ? 'transform translate-x-5' : ''}`}>
                          {isLibraryEnabled ? <Unlock className="h-3 w-3 text-teal-600" /> : <Lock className="h-3 w-3 text-slate-600" />}
                        </div>
                      </button>
                    </div>
                  </div>

                  <div className={`p-4 rounded-xl border space-y-3 ${innerCardClass}`}>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold ${textMutedClass}`}>Sunnah API Endpoint Hooked:</span>
                      <span className="text-[11px] bg-teal-500/10 text-teal-500 font-mono px-2 py-0.5 rounded font-bold">https://sunnah.amanahagent.cloud/api/v1</span>
                    </div>
                    <div className={`text-xs leading-normal ${textMutedClass}`}>
                      <strong className={textTitleClass}>Alim Verification Protocol:</strong> The Super Admin must audit API translations using scholastic benchmarks. Once verified, flip the gateway toggle to grant access to student tablets.
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: INTERACTIVE PROFILE DETAIL DOSSIER & ACTIONS */}
              <div className="lg:col-span-1 space-y-6">
                
                {/* Detailed profile viewer */}
                <div className={`rounded-2xl p-5 space-y-4 border sticky top-24 ${cardBgClass}`}>
                  <h3 className={`font-bold text-sm border-b pb-3 flex items-center gap-2 ${
                    isDark ? 'border-neutral-800 text-white' : 'border-slate-200 text-slate-900'
                  }`}>
                    <Info className="h-4 w-4 text-teal-500" />
                    Dossier Detail Panel
                  </h3>

                  {selectedStudentProfile ? (
                    <div className="space-y-5 animate-fadeIn">
                      <div className={`p-4 rounded-xl border text-center space-y-2 ${innerCardClass}`}>
                        <div className="h-14 w-14 rounded-full bg-teal-500/10 border border-teal-500/30 flex items-center justify-center mx-auto">
                          <Users className="h-7 w-7 text-teal-500" />
                        </div>
                        <div>
                          <h4 className={`font-bold text-base ${textTitleClass}`}>{selectedStudentProfile.name}</h4>
                          <span className="text-xs text-teal-500 font-bold">{selectedStudentProfile.code}</span>
                        </div>
                        <div className={`text-[11px] ${textMutedClass}`}>
                          {selectedStudentProfile.centerName}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className={`grid grid-cols-2 gap-3 text-xs p-3 rounded-lg border ${innerCardClass}`}>
                          <div>
                            <span className={`block font-semibold ${textMutedClass}`}>Attendance</span>
                            <span className={`font-bold text-sm ${textTitleClass}`}>{selectedStudentProfile.attendanceRate}%</span>
                          </div>
                          <div>
                            <span className={`block font-semibold ${textMutedClass}`}>Memorization</span>
                            <span className={`font-bold text-sm ${textTitleClass}`}>{selectedStudentProfile.memorizedJuz}</span>
                          </div>
                        </div>

                        {/* Leave requests section */}
                        {selectedStudentProfile.leaveRequests && selectedStudentProfile.leaveRequests.length > 0 && (
                          <div className="space-y-2">
                            <span className={`text-xs font-bold block uppercase tracking-wider ${textMutedClass}`}>Leave Applications</span>
                            {selectedStudentProfile.leaveRequests.map((l: LeaveRequest) => (
                              <div key={l.id} className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-lg space-y-2">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-amber-500 font-bold flex items-center gap-1">
                                    <Calendar className="h-3 w-3" /> Leave Request
                                  </span>
                                  <span className="text-[10px] bg-amber-500/20 text-amber-600 dark:text-amber-400 font-extrabold px-2 py-0.5 rounded">
                                    {l.status}
                                  </span>
                                </div>
                                <p className={`text-xs ${textTitleClass}`}><strong>Dates:</strong> {l.startDate} to {l.endDate}</p>
                                <p className={`text-xs font-medium ${textTitleClass}`}><strong>Reason:</strong> {l.reason}</p>
                                
                                {l.status === 'PENDING' && (
                                  <div className="flex items-center gap-2 pt-1">
                                    <button 
                                      onClick={() => {
                                        setStudents(prev => prev.map(s => {
                                          if (s.id === selectedStudentProfile.id) {
                                            return {
                                              ...s,
                                              leaveRequests: s.leaveRequests.map(lr => lr.id === l.id ? { ...lr, status: 'APPROVED' } : lr)
                                            };
                                          }
                                          return s;
                                        }));
                                        alert("Leave Approved! Confirmation dispatched to parent via Meta Cloud WhatsApp API.");
                                      }}
                                      className="flex-1 bg-teal-500 hover:bg-teal-600 text-slate-950 text-[11px] font-black py-1 rounded transition"
                                    >
                                      Approve
                                    </button>
                                    <button 
                                      onClick={() => {
                                        setStudents(prev => prev.map(s => {
                                          if (s.id === selectedStudentProfile.id) {
                                            return {
                                              ...s,
                                              leaveRequests: s.leaveRequests.map(lr => lr.id === l.id ? { ...lr, status: 'REJECTED' } : lr)
                                            };
                                          }
                                          return s;
                                        }));
                                        alert("Leave request declined. Status updated.");
                                      }}
                                      className={`flex-1 text-rose-500 text-[11px] font-bold py-1 rounded transition border ${
                                        isDark ? 'bg-neutral-800 border-neutral-700' : 'bg-slate-200 border-slate-300'
                                      }`}
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
                          <span className={`text-xs font-bold block uppercase tracking-wider ${textMutedClass}`}>Academic Stars Earned</span>
                          {selectedStudentProfile.stars && selectedStudentProfile.stars.length > 0 ? (
                            selectedStudentProfile.stars.map((s: StarItem) => (
                              <div key={s.id} className={`p-3 rounded-lg border space-y-1 ${innerCardClass}`}>
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-amber-500 font-bold flex items-center gap-1">
                                    <Star className="h-3 w-3 fill-amber-500" /> {s.category}
                                  </span>
                                  <span className={`text-[10px] ${textMutedClass}`}>{s.date}</span>
                                </div>
                                <p className={`text-xs leading-normal ${textTitleClass}`}>{s.explanation}</p>
                                <span className="text-[10px] text-teal-500 block font-medium">Issued by: {s.teacher}</span>
                              </div>
                            ))
                          ) : (
                            <p className={`text-xs ${textMutedClass}`}>No achievements recorded this month.</p>
                          )}
                        </div>

                        {/* Warnings breakdown */}
                        <div className="space-y-2">
                          <span className={`text-xs font-bold block uppercase tracking-wider ${textMutedClass}`}>Warning Log</span>
                          {selectedStudentProfile.warnings && selectedStudentProfile.warnings.length > 0 ? (
                            selectedStudentProfile.warnings.map((w: WarningItem) => (
                              <div key={w.id} className="bg-rose-500/10 p-3 rounded-lg border border-rose-500/20 space-y-1">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-rose-500 font-bold flex items-center gap-1">
                                    <AlertCircle className="h-3 w-3" /> {w.category}
                                  </span>
                                  <span className="text-rose-500 text-[10px] uppercase font-black">{w.severity}</span>
                                </div>
                                <p className={`text-xs leading-normal ${textTitleClass}`}>{w.explanation}</p>
                                <span className={`text-[10px] block ${textMutedClass}`}>Issued by: {w.teacher}</span>
                              </div>
                            ))
                          ) : (
                            <p className="text-xs text-emerald-500 flex items-center gap-1 text-[11px] font-semibold bg-emerald-500/10 p-2.5 rounded-lg border border-emerald-500/20">
                              <CheckCircle className="h-4 w-4" /> Flawless conduct record this month!
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : selectedStaffProfile ? (
                    <div className="space-y-5 animate-fadeIn">
                      <div className={`p-4 rounded-xl border text-center space-y-2 ${innerCardClass}`}>
                        <div className="h-14 w-14 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center mx-auto">
                          <Award className="h-7 w-7 text-indigo-500" />
                        </div>
                        <div>
                          <h4 className={`font-bold text-base ${textTitleClass}`}>{selectedStaffProfile.name}</h4>
                          <span className="text-xs text-teal-500 font-bold">{selectedStaffProfile.code}</span>
                        </div>
                        <div className={`text-[11px] ${textMutedClass}`}>
                          {selectedStaffProfile.centerName}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className={`p-3 rounded-lg border space-y-2 text-xs ${innerCardClass}`}>
                          <div className="flex justify-between">
                            <span className={textMutedClass}>Position Role:</span>
                            <span className={`font-bold uppercase ${textTitleClass}`}>{selectedStaffProfile.role}</span>
                          </div>
                          {selectedStaffProfile.role === 'usthad' && (
                            <div className="flex justify-between">
                              <span className={textMutedClass}>Batch Assigned:</span>
                              <span className="font-bold text-teal-500">{selectedStaffProfile.batchManaged}</span>
                            </div>
                          )}
                        </div>

                        {/* Leave request approval block */}
                        {selectedStaffProfile.leaveRequests && selectedStaffProfile.leaveRequests.length > 0 && (
                          <div className="space-y-2">
                            <span className={`text-xs font-bold block uppercase tracking-wider ${textMutedClass}`}>Staff Leave Requests</span>
                            {selectedStaffProfile.leaveRequests.map((l: LeaveRequest) => (
                              <div key={l.id} className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-lg space-y-2">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-amber-500 font-bold flex items-center gap-1">
                                    <Calendar className="h-3 w-3" /> Leave Request
                                  </span>
                                  <span className="text-[10px] bg-amber-500/20 text-amber-600 dark:text-amber-400 font-extrabold px-2 py-0.5 rounded">
                                    {l.status}
                                  </span>
                                </div>
                                <p className={`text-xs ${textTitleClass}`}><strong>Dates:</strong> {l.startDate} to {l.endDate}</p>
                                <p className={`text-xs font-medium ${textTitleClass}`}><strong>Reason:</strong> {l.reason}</p>
                                
                                {l.status === 'PENDING' && (
                                  <div className="flex items-center gap-2 pt-1">
                                    <button 
                                      onClick={() => {
                                        setStaff(prev => prev.map(s => {
                                          if (s.id === selectedStaffProfile.id) {
                                            return {
                                              ...s,
                                              leaveRequests: s.leaveRequests.map(lr => lr.id === l.id ? { ...lr, status: 'APPROVED' } : lr)
                                            };
                                          }
                                          return s;
                                        }));
                                        alert("Staff Leave Approved. Work coverage notice dispatched.");
                                      }}
                                      className="flex-1 bg-teal-500 hover:bg-teal-600 text-slate-950 text-[11px] font-black py-1 rounded transition"
                                    >
                                      Approve
                                    </button>
                                    <button 
                                      onClick={() => {
                                        setStaff(prev => prev.map(s => {
                                          if (s.id === selectedStaffProfile.id) {
                                            return {
                                              ...s,
                                              leaveRequests: s.leaveRequests.map(lr => lr.id === l.id ? { ...lr, status: 'REJECTED' } : lr)
                                            };
                                          }
                                          return s;
                                        }));
                                        alert("Leave request declined.");
                                      }}
                                      className={`flex-1 text-rose-500 text-[11px] font-bold py-1 rounded transition border ${
                                        isDark ? 'bg-neutral-800 border-neutral-700' : 'bg-slate-200 border-slate-300'
                                      }`}
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
                    </div>
                  ) : (
                    <div className={`p-8 text-center space-y-2 rounded-xl border ${innerCardClass}`}>
                      <Search className={`h-8 w-8 mx-auto ${textMutedClass}`} />
                      <p className={`text-xs ${textMutedClass}`}>Select a student or staff member from the search results to load their full behavioral, progress, and leave details here.</p>
                    </div>
                  )}
                </div>

                {/* Finance payroll release console */}
                <div className={`rounded-2xl p-5 space-y-4 border ${cardBgClass}`}>
                  <div>
                    <h3 className={`font-bold text-sm flex items-center gap-2 ${textTitleClass}`}>
                      <CreditCard className="h-4 w-4 text-emerald-500" />
                      Payroll Verification Box
                    </h3>
                    <p className={`text-xs ${textMutedClass}`}>Audit salaries and advance repayments submitted by local Nazims</p>
                  </div>

                  <div className="space-y-3">
                    {staff.map(member => {
                      const netSalary = member.baseSalary - member.advanceTaken;
                      return (
                        <div key={member.id} className={`p-3 rounded-lg border flex justify-between items-center ${innerCardClass}`}>
                          <div>
                            <h4 className={`text-xs font-bold ${textTitleClass}`}>{member.name}</h4>
                            <span className={`text-[10px] ${textMutedClass}`}>Base: ₹{member.baseSalary} | Adv Repay: -₹{member.advanceTaken}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-black block text-emerald-500">₹{netSalary}</span>
                            <button 
                              onClick={() => {
                                setStaff(prev => prev.map(s => s.id === member.id ? { ...s, isPaid: true } : s));
                                alert(`Payment of ₹${netSalary} dispatched successfully via ${member.paymentMethod}!`);
                              }}
                              disabled={member.isPaid}
                              className={`text-[9px] font-bold px-2 py-0.5 rounded mt-1 transition ${
                                member.isPaid 
                                  ? `${subMenuBgClass} ${textMutedClass} cursor-not-allowed` 
                                  : 'bg-emerald-500 text-slate-950 hover:bg-emerald-600'
                              }`}
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
          ROLE 2: USTHAD ACTIVE PORTAL PANEL
          ============================================================================= */}
      {activeRole === 'usthad' && (
        <div className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">
          
          {/* Usthad Profile summary bar */}
          <div className={`p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 border ${
            isDark ? 'bg-indigo-950/30 border-indigo-500/30' : 'bg-indigo-50 border-indigo-200'
          }`}>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center">
                <Award className="h-6 w-6 text-indigo-500" />
              </div>
              <div>
                <h2 className={`text-lg font-black ${textTitleClass}`}>Teacher Center Panel: Usthad Ibrahim Kutty</h2>
                <p className={`text-xs ${isDark ? 'text-indigo-300' : 'text-indigo-800'}`}>Managing: <strong>Hifz Batch A (4 Students)</strong> | Al-Noor Central (Calicut)</p>
              </div>
            </div>

            {/* Live progressive penalty notification */}
            <div className="bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl flex items-center gap-3">
              <div className="text-right">
                <span className={`text-xs font-semibold block ${textMutedClass}`}>Your Monthly Performance Rating:</span>
                <span className="text-sm text-rose-500 font-black">
                  {staff.find(s => s.id === 'staff_1')?.rating}/100 Grade
                </span>
              </div>
              <div className={`text-[10px] leading-snug max-w-[240px] ${textMutedClass}`}>
                ⚠️ <strong className="text-rose-500">Class Penalty Triggered!</strong> Since 50% of your batch is underperforming (&lt;70% grade), a progressive score deduction is active.
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            
            {/* SUB-MENU TABS */}
            <div className="lg:col-span-1 space-y-2">
              <button 
                onClick={() => setSelectedClassTab('tarbiyyah_logs')}
                className={`w-full text-left p-3.5 rounded-xl border font-bold text-sm flex items-center justify-between transition ${
                  selectedClassTab === 'tarbiyyah_logs' 
                    ? 'bg-indigo-500/10 border-indigo-500 text-indigo-500' 
                    : `${cardBgClass} hover:border-slate-400 ${textTitleClass}`
                }`}
              >
                <span className="flex items-center gap-2"><ClipboardList className="h-4.5 w-4.5" /> Daily Tarbiyyah Logs</span>
                <ChevronRight className="h-4 w-4" />
              </button>
              
              <button 
                onClick={() => setSelectedClassTab('behavior_star_warn')}
                className={`w-full text-left p-3.5 rounded-xl border font-bold text-sm flex items-center justify-between transition ${
                  selectedClassTab === 'behavior_star_warn' 
                    ? 'bg-indigo-500/10 border-indigo-500 text-indigo-500' 
                    : `${cardBgClass} hover:border-slate-400 ${textTitleClass}`
                }`}
              >
                <span className="flex items-center gap-2"><Star className="h-4.5 w-4.5" /> Issue Stars & Warnings</span>
                <ChevronRight className="h-4 w-4" />
              </button>

              <button 
                onClick={() => setSelectedClassTab('whatsapp_chat')}
                className={`w-full text-left p-3.5 rounded-xl border font-bold text-sm flex items-center justify-between transition ${
                  selectedClassTab === 'whatsapp_chat' 
                    ? 'bg-indigo-500/10 border-indigo-500 text-indigo-500' 
                    : `${cardBgClass} hover:border-slate-400 ${textTitleClass}`
                }`}
              >
                <span className="flex items-center gap-2"><MessageSquare className="h-4.5 w-4.5" /> Parent WhatsApp Chats</span>
                <ChevronRight className="h-4 w-4" />
              </button>

              <button 
                onClick={() => setSelectedClassTab('library')}
                className={`w-full text-left p-3.5 rounded-xl border font-bold text-sm flex items-center justify-between transition ${
                  selectedClassTab === 'library' 
                    ? 'bg-indigo-500/10 border-indigo-500 text-indigo-500' 
                    : `${cardBgClass} hover:border-slate-400 ${textTitleClass}`
                }`}
              >
                <span className="flex items-center gap-2"><BookOpen className="h-4.5 w-4.5" /> Hadith Scholastic Library</span>
                <ChevronRight className="h-4 w-4" />
              </button>

              <button 
                onClick={() => setSelectedClassTab('apply_leave')}
                className={`w-full text-left p-3.5 rounded-xl border font-bold text-sm flex items-center justify-between transition ${
                  selectedClassTab === 'apply_leave' 
                    ? 'bg-indigo-500/10 border-indigo-500 text-indigo-500' 
                    : `${cardBgClass} hover:border-slate-400 ${textTitleClass}`
                }`}
              >
                <span className="flex items-center gap-2"><Calendar className="h-4.5 w-4.5" /> Apply for Leave</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* DYNAMIC SUB-VIEW PANEL */}
            <div className={`lg:col-span-3 rounded-2xl p-5 md:p-6 border space-y-6 ${cardBgClass}`}>
              
              {/* STUDENT PICKER SELECTOR FOR LOGS AND ASSIGNMENTS */}
              {selectedClassTab !== 'apply_leave' && selectedClassTab !== 'library' && (
                <div className={`p-3 rounded-xl border flex items-center flex-wrap gap-2.5 ${innerCardClass}`}>
                  <span className={`text-xs font-bold px-2 ${textMutedClass}`}>SELECT STUDENT:</span>
                  {students.filter(s => s.centerId === 'ctr_1').map(s => (
                    <button
                      key={s.id}
                      onClick={() => setSelectedStudentId(s.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                        selectedStudentId === s.id 
                          ? 'bg-indigo-500 text-white shadow-md' 
                          : `${subMenuBgClass} ${textMutedClass} hover:text-indigo-500`
                      }`}
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
                    <h3 className={`text-lg font-bold flex items-center gap-2 ${textTitleClass}`}>
                      <ClipboardList className="h-5 w-5 text-indigo-500" />
                      Daily Tarbiyyah Checklist - {students.find(s => s.id === selectedStudentId)?.name}
                    </h3>
                    <p className={`text-xs ${textMutedClass}`}>Directly logging chores, studies, hygiene, and namaz. Adjusts overall monthly score in real-time.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className={`p-4 rounded-xl border flex items-center justify-between ${innerCardClass}`}>
                      <div>
                        <strong className={`text-sm block ${textTitleClass}`}>🕌 Namaz Discipline</strong>
                        <span className={`text-xs ${textMutedClass}`}>Performed all 5 prayers in congregation today.</span>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={tarbiyyahLogs.namaz}
                        onChange={(e) => {
                          const val = e.target.checked;
                          setTarbiyyahLogs(prev => ({ ...prev, namaz: val }));
                          setStudents(prev => prev.map(s => s.id === selectedStudentId ? { ...s, overallScore: val ? Math.min(100, s.overallScore + 10) : Math.max(0, s.overallScore - 15) } : s));
                        }}
                        className="h-5 w-5 accent-indigo-500 cursor-pointer"
                      />
                    </div>

                    <div className={`p-4 rounded-xl border flex items-center justify-between ${innerCardClass}`}>
                      <div>
                        <strong className={`text-sm block ${textTitleClass}`}>🧹 Hostel Chores Log</strong>
                        <span className={`text-xs ${textMutedClass}`}>Completed kitchen assistance or sweeping duty on schedule.</span>
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

                    <div className={`p-4 rounded-xl border flex items-center justify-between ${innerCardClass}`}>
                      <div>
                        <strong className={`text-sm block ${textTitleClass}`}>📖 Daily Hifz Study Hours</strong>
                        <span className={`text-xs ${textMutedClass}`}>Completed 4 hours of recitation and revision portions.</span>
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

                    <div className={`p-4 rounded-xl border flex items-center justify-between ${innerCardClass}`}>
                      <div>
                        <strong className={`text-sm block ${textTitleClass}`}>🧼 Personal Hygiene Audit</strong>
                        <span className={`text-xs ${textMutedClass}`}>Clean laundry, tidy bedroom log, and basic sunnah adab.</span>
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

                  <div className={`p-4 rounded-xl border flex justify-between items-center ${innerCardClass}`}>
                    <div>
                      <span className={`text-xs ${textMutedClass}`}>Current Student Monthly Grade:</span>
                      <strong className={`text-base block ${students.find(s => s.id === selectedStudentId)!.overallScore >= 70 ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {students.find(s => s.id === selectedStudentId)?.overallScore}% Grade
                      </strong>
                    </div>
                    <button 
                      onClick={() => alert("Daily Tarbiyyah Logs pushed to the database server successfully!")}
                      className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-xs px-4.5 py-2 rounded-lg transition"
                    >
                      Save Daily Log Entry
                    </button>
                  </div>
                </div>
              )}

              {/* SUBVIEW 2B: STAR & WARNING DISPATCH HUB */}
              {selectedClassTab === 'behavior_star_warn' && (
                <div className="space-y-6">
                  <div>
                    <h3 className={`text-lg font-bold flex items-center gap-2 ${textTitleClass}`}>
                      <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                      Behavior Dispatch Desk: {students.find(s => s.id === selectedStudentId)?.name}
                    </h3>
                    <p className={`text-xs ${textMutedClass}`}>Issue stars for scholastic excellence or warnings for discipline concerns. Records immediate justification logs.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <label className={`text-[11px] font-bold uppercase tracking-wider block ${textMutedClass}`}>Award Action Type</label>
                      <div className={`flex p-1 rounded-lg border ${subMenuBgClass}`}>
                        <button 
                          onClick={() => { setActionType('star'); setActionCategory("Tajweed Fluency"); }}
                          className={`flex-1 py-1.5 rounded-md text-xs font-bold transition flex items-center justify-center gap-1.5 ${actionType === 'star' ? 'bg-indigo-500 text-white' : textMutedClass}`}
                        >
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> Issue Star Achievement
                        </button>
                        <button 
                          onClick={() => { setActionType('warning'); setActionCategory("Class Absenteeism"); }}
                          className={`flex-1 py-1.5 rounded-md text-xs font-bold transition flex items-center justify-center gap-1.5 ${actionType === 'warning' ? 'bg-rose-500/10 text-rose-500' : textMutedClass}`}
                        >
                          <AlertCircle className="h-3.5 w-3.5 text-rose-500" /> Issue Misconduct Warning
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className={`text-[11px] font-bold uppercase tracking-wider block ${textMutedClass}`}>Category Segment</label>
                      <select 
                        value={actionCategory}
                        onChange={(e) => setActionCategory(e.target.value)}
                        className={`w-full text-xs rounded-lg p-2.5 focus:outline-none border ${inputBgClass}`}
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
                        <label className={`text-[11px] font-bold uppercase tracking-wider block ${textMutedClass}`}>Severity Rank</label>
                        <div className={`flex gap-4 text-xs ${textTitleClass}`}>
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
                      <label className={`text-[11px] font-bold uppercase tracking-wider block ${textMutedClass}`}>Reason & Justification (Why did they get this?)</label>
                      <textarea 
                        rows={3}
                        value={actionExplanation}
                        onChange={(e) => setActionExplanation(e.target.value)}
                        placeholder={actionType === 'star' ? "Detail why the student is being awarded a star..." : "Detail the misconduct warning trigger. This will be logged on the Super Admin and Kiosk panels."}
                        className={`w-full text-xs rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-indigo-500 border ${inputBgClass}`}
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
                        const newStar: StarItem = {
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
                        alert("Achievement star dispatched! Verified on Student progress card.");
                      } else {
                        const newWarn: WarningItem = {
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
                        alert("Disciplinary warning dispatched! Escalated directly to Super Admin ledger.");
                      }

                      setActionExplanation("");
                    }}
                    className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-xs py-2.5 rounded-xl transition shadow-md"
                  >
                    Award Performance Mark
                  </button>
                </div>
              )}

              {/* SUBVIEW 2C: WABA OUTBOUND CHAT REPLY DESK */}
              {selectedClassTab === 'whatsapp_chat' && (
                <div className="space-y-6">
                  <div>
                    <h3 className={`text-lg font-bold flex items-center gap-2 ${textTitleClass}`}>
                      <MessageSquare className="h-5 w-5 text-indigo-500" />
                      Parent Outbound Feed - {students.find(s => s.id === selectedStudentId)?.parentName}
                    </h3>
                    <p className={`text-xs ${textMutedClass}`}>Official, verified Meta API Cloud messages mapped to this parent profile.</p>
                  </div>

                  {chats.some(c => c.isRecognized && sIdMatching(c.studentName, students.find(s => s.id === selectedStudentId)?.name || '')) ? (
                    chats.filter(c => c.isRecognized && sIdMatching(c.studentName, students.find(s => s.id === selectedStudentId)?.name || '')).map(chat => {
                      const replyText = chatReplies[chat.id] || "";
                      return (
                        <div key={chat.id} className="space-y-4">
                          <div className={`rounded-xl border h-[220px] overflow-y-auto p-4 flex flex-col gap-3 ${innerCardClass}`}>
                            {chat.messages.map((m, i) => (
                              <div 
                                key={i}
                                className={`max-w-[75%] p-3 rounded-lg text-xs leading-normal ${
                                  m.sender === 'parent' 
                                    ? `${subMenuBgClass} ${textTitleClass} self-start rounded-bl-none border` 
                                    : 'bg-indigo-600 text-white self-end rounded-br-none'
                                }`}
                              >
                                {m.text}
                                <span className={`block text-[8px] text-right mt-1 ${m.sender === 'parent' ? textMutedClass : 'text-indigo-200'}`}>{m.time}</span>
                              </div>
                            ))}
                          </div>

                          <div className="flex gap-2">
                            <input 
                              type="text"
                              value={replyText}
                              onChange={(e) => setChatReplies(prev => ({ ...prev, [chat.id]: e.target.value }))}
                              placeholder="Write reply to parent via WhatsApp Cloud API..."
                              className={`flex-1 rounded-xl px-4 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 border ${inputBgClass}`}
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
                                alert("Reply dispatched instantly via Meta Cloud API!");
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
                    <div className={`p-8 text-center space-y-2 rounded-xl border ${innerCardClass}`}>
                      <MessageSquare className={`h-8 w-8 mx-auto ${textMutedClass}`} />
                      <p className={`text-xs ${textMutedClass}`}>No active WhatsApp communication thread found for this student's registered parent number.</p>
                    </div>
                  )}
                </div>
              )}

              {/* SUBVIEW 2D: ALIM LIBRARY LOCK MECHANISM IN ACTION */}
              {selectedClassTab === 'library' && (
                <div className="space-y-6">
                  <div>
                    <h3 className={`text-lg font-bold flex items-center gap-2 ${textTitleClass}`}>
                      <BookOpen className="h-5 w-5 text-indigo-500" />
                      Scholastic Hadith Search Engine
                    </h3>
                    <p className={`text-xs ${textMutedClass}`}>Verifying Sunnah API translations for class references.</p>
                  </div>

                  {!isLibraryEnabled ? (
                    <div className={`p-8 text-center rounded-2xl border space-y-4 max-w-md mx-auto ${innerCardClass}`}>
                      <div className="h-14 w-14 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto text-rose-500">
                        <Lock className="h-7 w-7" />
                      </div>
                      <div className="space-y-1.5">
                        <h4 className={`font-bold text-sm ${textTitleClass}`}>Scholastic Gateway Locked</h4>
                        <p className={`text-xs leading-normal ${textMutedClass}`}>
                          The central Alim Committee is currently auditing the translation APIs. Once verified as authentic, the Super Admin will release this module globally.
                        </p>
                      </div>
                      <div className="text-[10px] bg-rose-500/10 text-rose-500 p-2.5 rounded-lg border border-rose-500/20 font-mono">
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
                          className={`flex-1 rounded-xl px-4 py-2.5 text-xs focus:outline-none border ${inputBgClass}`}
                        />
                        <button 
                          type="submit"
                          className="bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold px-4.5 rounded-xl transition"
                        >
                          Query Sunnah API
                        </button>
                      </form>

                      {isLoadingLibrary ? (
                        <div className={`text-center py-6 text-xs flex items-center justify-center gap-2 ${textMutedClass}`}>
                          <RefreshCw className="h-4.5 w-4.5 animate-spin" /> Fetching authorized cloud resources...
                        </div>
                      ) : (
                        <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
                          {libraryResults.map((item, idx) => (
                            <div key={idx} className={`p-4 rounded-xl border space-y-2 ${innerCardClass}`}>
                              <div className="flex justify-between items-center text-xs">
                                <span className="font-bold text-teal-500">{item.collection} - Hadith {item.hadithNumber}</span>
                                <span className="text-[10px] text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded font-black uppercase">
                                  {item.grade}
                                </span>
                              </div>
                              <p className={`text-xs leading-relaxed font-medium ${textTitleClass}`}>
                                &ldquo;{item.text_en}&rdquo;
                              </p>
                              <span className={`text-[10px] block ${textMutedClass}`}>Source: {item.book}</span>
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
                    <h3 className={`text-lg font-bold flex items-center gap-2 ${textTitleClass}`}>
                      <Calendar className="h-5 w-5 text-indigo-500" />
                      Apply for Staff Leave
                    </h3>
                    <p className={`text-xs ${textMutedClass}`}>Applications route directly to the Super Admin's verification panel.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className={`text-[11px] font-bold uppercase block ${textMutedClass}`}>Start Date</label>
                      <input 
                        type="date"
                        value={usthadLeaveStart}
                        onChange={(e) => setUsthadLeaveStart(e.target.value)}
                        className={`w-full text-xs rounded-lg p-2.5 border ${inputBgClass}`}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className={`text-[11px] font-bold uppercase block ${textMutedClass}`}>End Date</label>
                      <input 
                        type="date"
                        value={usthadLeaveEnd}
                        onChange={(e) => setUsthadLeaveEnd(e.target.value)}
                        className={`w-full text-xs rounded-lg p-2.5 border ${inputBgClass}`}
                      />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <label className={`text-[11px] font-bold uppercase block ${textMutedClass}`}>Reason for absence</label>
                      <textarea 
                        rows={3}
                        value={usthadLeaveReason}
                        onChange={(e) => setUsthadLeaveReason(e.target.value)}
                        placeholder="Provide details about sick leave or personal emergency leave..."
                        className={`w-full text-xs rounded-lg p-2.5 focus:outline-none border ${inputBgClass}`}
                      />
                    </div>
                  </div>

                  <button 
                    onClick={() => {
                      if (!usthadLeaveReason.trim()) {
                        alert("Please specify a reason.");
                        return;
                      }
                      const newRequest: LeaveRequest = {
                        id: `tl_${Date.now()}`,
                        startDate: usthadLeaveStart,
                        endDate: usthadLeaveEnd,
                        reason: usthadLeaveReason,
                        status: "PENDING"
                      };
                      setStaff(prev => prev.map(s => s.id === 'staff_1' ? { ...s, leaveRequests: [...s.leaveRequests, newRequest] } : s));
                      setUsthadLeaveReason("");
                      alert("Leave request submitted. Visible in the Super Admin's pending review submenu.");
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
          ROLE 3: NAZIM WORKSPACE
          ============================================================================= */}
      {activeRole === 'nazim' && (
        <div className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">
          
          {/* Nazim Workspace Header */}
          <div className={`p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 border ${
            isDark ? 'bg-emerald-950/30 border-emerald-500/30' : 'bg-emerald-50 border-emerald-200'
          }`}>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                <Building className="h-6 w-6 text-emerald-500" />
              </div>
              <div>
                <h2 className={`text-lg font-black ${textTitleClass}`}>Branch Management Console: Nazim Faisal</h2>
                <p className={`text-xs ${isDark ? 'text-emerald-300' : 'text-emerald-800'}`}>Operational Head: <strong>Calicut Center (CTR-01)</strong></p>
              </div>
            </div>

            <div className={`flex p-1 rounded-xl border ${subMenuBgClass}`}>
              <button 
                onClick={() => setNazimActiveTab('payroll')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${nazimActiveTab === 'payroll' ? 'bg-emerald-500 text-slate-950 font-black shadow-sm' : `${textMutedClass} hover:text-emerald-500`}`}
              >
                Payroll Entry
              </button>
              <button 
                onClick={() => setNazimActiveTab('contingency')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${nazimActiveTab === 'contingency' ? 'bg-emerald-500 text-slate-950 font-black shadow-sm' : `${textMutedClass} hover:text-emerald-500`}`}
              >
                Cook Leave
              </button>
              <button 
                onClick={() => setNazimActiveTab('unlinked_chats')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${nazimActiveTab === 'unlinked_chats' ? 'bg-emerald-500 text-slate-950 font-black shadow-sm' : `${textMutedClass} hover:text-emerald-500`}`}
              >
                Unlinked WhatsApp
              </button>
              <button 
                onClick={() => setNazimActiveTab('store_room')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${nazimActiveTab === 'store_room' ? 'bg-emerald-500 text-slate-950 font-black shadow-sm' : `${textMutedClass} hover:text-emerald-500`}`}
              >
                Kitchen Store
              </button>
              <button 
                onClick={() => setNazimActiveTab('checklist')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${nazimActiveTab === 'checklist' ? 'bg-emerald-500 text-slate-950 font-black shadow-sm' : `${textMutedClass} hover:text-emerald-500`}`}
              >
                Checklist ({nazimDuties.filter(d => d.isCompleted).length}/{nazimDuties.length})
              </button>
            </div>
          </div>

          <div className={`rounded-2xl p-5 md:p-6 border space-y-6 ${cardBgClass}`}>
            
            {/* SUB-VIEW 3A: STAFF PAYROLL ENTRY GRID */}
            {nazimActiveTab === 'payroll' && (
              <div className="space-y-6">
                <div>
                  <h3 className={`text-base font-bold flex items-center gap-2 ${textTitleClass}`}>
                    <DollarSign className="h-5 w-5 text-emerald-500" />
                    Monthly Staff Payroll Sheet
                  </h3>
                  <p className={`text-xs ${textMutedClass}`}>Calculate base salaries, deduct advanced outstanding repayments, and dispatch to Super Admin for verification.</p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className={`border-b uppercase tracking-wider font-semibold ${
                        isDark ? 'border-neutral-800 text-neutral-400' : 'border-slate-200 text-slate-600'
                      }`}>
                        <th className="py-3 px-2">Staff Details</th>
                        <th className="py-3 px-2">Base Salary</th>
                        <th className="py-3 px-2">Advance Owed</th>
                        <th className="py-3 px-2">Repayment Deduct</th>
                        <th className="py-3 px-2">Net Salary</th>
                        <th className="py-3 px-2">Payment Pathway</th>
                        <th className="py-3 px-2 text-right">Action Status</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${isDark ? 'divide-neutral-850' : 'divide-slate-200'}`}>
                      {staff.filter(s => s.centerId === 'ctr_1').map(member => {
                        const netPayable = member.baseSalary - member.advanceTaken;
                        return (
                          <tr key={member.id} className={isDark ? 'hover:bg-neutral-900/50' : 'hover:bg-slate-100/60'}>
                            <td className="py-4 px-2">
                              <span className={`font-bold block ${textTitleClass}`}>{member.name}</span>
                              <span className={`text-[10px] uppercase ${textMutedClass}`}>{member.role} ({member.code})</span>
                            </td>
                            <td className="py-4 px-2 font-semibold">₹{member.baseSalary}</td>
                            <td className={`py-4 px-2 ${textMutedClass}`}>₹{member.advanceTaken > 0 ? member.advanceTaken : 0}</td>
                            <td className="py-4 px-2 text-rose-500 font-bold">-₹{member.advanceTaken}</td>
                            <td className="py-4 px-2 text-emerald-500 font-black text-sm">₹{netPayable}</td>
                            <td className={`py-4 px-2 font-medium ${textTitleClass}`}>{member.paymentMethod}</td>
                            <td className="py-4 px-2 text-right">
                              <span className={`text-[10px] font-extrabold px-2 py-1 rounded inline-block ${
                                member.isPaid 
                                  ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                                  : `${subMenuBgClass} ${textMutedClass}`
                              }`}>
                                {member.isPaid ? 'PAID & RELEASED' : 'PENDING ADMIN APPROVAL'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className={`p-4 rounded-xl border flex items-center justify-between ${innerCardClass}`}>
                  <span className={`text-xs ${textMutedClass}`}>All local parameters matched. Send list to HQ ledger?</span>
                  <button 
                    onClick={() => alert("Payroll parameters dispatched to Super Admin. Pending verification check.")}
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
                  <h3 className={`text-base font-bold flex items-center gap-2 ${textTitleClass}`}>
                    <ChefHat className="h-5 w-5 text-emerald-500" />
                    Record Cook Leave Request
                  </h3>
                  <p className={`text-xs ${textMutedClass}`}>Manual entry for kitchen staff. A robust contingency feeding plan is required before registration can complete.</p>
                </div>

                {cookLeave.isOnLeave ? (
                  <div className="bg-amber-500/10 p-5 rounded-xl border border-amber-500/20 space-y-3">
                    <div className="flex justify-between items-center">
                      <strong className="text-amber-500 text-sm flex items-center gap-1.5"><ChefHat className="h-4.5 w-4.5 animate-bounce" /> Kitchen Shift Active on Leave Status</strong>
                      <span className="text-[10px] bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold px-2 py-0.5 rounded">CONTINGENCY PLAN ACTIVE</span>
                    </div>
                    <p className={`text-xs ${textTitleClass}`}><strong>Leave Period:</strong> {cookLeave.startDate} to {cookLeave.endDate}</p>
                    <p className={`text-xs ${textTitleClass}`}><strong>Reason:</strong> {cookLeave.reason}</p>
                    <p className={`text-xs p-3 rounded-lg border leading-relaxed font-semibold ${innerCardClass}`}>
                      💡 <strong>Contingency Feeding Program:</strong> {cookLeave.contingencyPlan}
                    </p>

                    <button 
                      onClick={() => {
                        setCookLeave({ isOnLeave: false, startDate: "", endDate: "", reason: "", contingencyPlan: "" });
                        alert("Cook marked as returned. Contingency feeding system stood down.");
                      }}
                      className={`text-xs font-bold py-1.5 px-3 rounded-lg transition border ${
                        isDark ? 'bg-neutral-800 text-neutral-200 border-neutral-700' : 'bg-slate-200 text-slate-800 border-slate-300'
                      }`}
                    >
                      Clear Leave (Cook Returned)
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className={`text-[11px] font-bold uppercase ${textMutedClass}`}>Start Date</label>
                        <input 
                          type="date"
                          value={cookLeave.startDate}
                          onChange={(e) => setCookLeave(prev => ({ ...prev, startDate: e.target.value }))}
                          className={`w-full text-xs rounded-lg p-2.5 border ${inputBgClass}`}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className={`text-[11px] font-bold uppercase ${textMutedClass}`}>End Date</label>
                        <input 
                          type="date"
                          value={cookLeave.endDate}
                          onChange={(e) => setCookLeave(prev => ({ ...prev, endDate: e.target.value }))}
                          className={`w-full text-xs rounded-lg p-2.5 border ${inputBgClass}`}
                        />
                      </div>
                      <div className="space-y-2 col-span-2">
                        <label className={`text-[11px] font-bold uppercase ${textMutedClass}`}>Reason for Absence</label>
                        <input 
                          type="text"
                          value={cookLeave.reason}
                          onChange={(e) => setCookLeave(prev => ({ ...prev, reason: e.target.value }))}
                          placeholder="e.g. Daughter's wedding, illness..."
                          className={`w-full text-xs rounded-lg p-2.5 focus:outline-none border ${inputBgClass}`}
                        />
                      </div>
                      <div className="space-y-2 col-span-2">
                        <label className="text-[11px] font-bold uppercase block text-rose-500">
                          Contingency Plan * (How will the students eat?)
                        </label>
                        <textarea 
                          rows={2}
                          value={cookLeave.contingencyPlan}
                          onChange={(e) => setCookLeave(prev => ({ ...prev, contingencyPlan: e.target.value }))}
                          placeholder="e.g. External lunch catering booked from Malabar Caterers, sister branch cook taking over..."
                          className={`w-full text-xs rounded-lg p-2.5 focus:outline-none border border-rose-500/40 focus:border-rose-500 ${inputBgClass}`}
                        />
                      </div>
                    </div>

                    <button 
                      onClick={() => {
                        if (!cookLeave.startDate || !cookLeave.endDate || !cookLeave.reason || !cookLeave.contingencyPlan.trim()) {
                          alert("All fields—including a detailed Contingency Plan—are strictly required.");
                          return;
                        }
                        setCookLeave(prev => ({ ...prev, isOnLeave: true }));
                        alert("Cook Leave registered. Contingency feeding system activated.");
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
                  <h3 className={`text-base font-bold flex items-center gap-2 ${textTitleClass}`}>
                    <MessageSquare className="h-5 w-5 text-emerald-500" />
                    Unlinked Parent WhatsApp Inbox
                  </h3>
                  <p className={`text-xs ${textMutedClass}`}>Unrecognized phone numbers messaging the center's WABA lines. Chat, verify identity, and route to proper teacher.</p>
                </div>

                <div className={`grid grid-cols-1 lg:grid-cols-3 gap-6 rounded-xl border overflow-hidden min-h-[350px] ${innerCardClass}`}>
                  
                  {/* Left list unrecognized */}
                  <div className={`border-r flex flex-col ${isDark ? 'border-neutral-800' : 'border-slate-200'}`}>
                    <div className={`p-3 border-b text-xs font-bold uppercase tracking-wider ${
                      isDark ? 'border-neutral-800 text-neutral-400' : 'border-slate-200 text-slate-600'
                    }`}>
                      Unverified Numbers
                    </div>
                    <div className={`flex-1 overflow-y-auto divide-y ${isDark ? 'divide-neutral-850' : 'divide-slate-200'}`}>
                      {chats.filter(c => !c.isRecognized).map(chat => (
                        <button
                          key={chat.id}
                          onClick={() => setSelectedUnlinkedChat(chat)}
                          className={`w-full text-left p-3.5 flex justify-between items-center transition ${
                            selectedUnlinkedChat?.id === chat.id ? 'bg-emerald-500/10' : 'hover:bg-slate-100 dark:hover:bg-neutral-900/60'
                          }`}
                        >
                          <div>
                            <span className={`font-bold block text-xs ${textTitleClass}`}>{chat.parentPhone}</span>
                            <span className="text-[10px] text-rose-500 font-bold flex items-center gap-1 mt-0.5">
                              <AlertCircle className="h-3 w-3" /> Unlinked Sender
                            </span>
                          </div>
                          <ChevronRight className={`h-4 w-4 ${textMutedClass}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Right Chat console & Linking Action */}
                  <div className="lg:col-span-2 flex flex-col justify-between">
                    {selectedUnlinkedChat ? (
                      <>
                        <div className={`p-3 border-b flex items-center justify-between ${
                          isDark ? 'bg-neutral-950 border-neutral-800' : 'bg-slate-100 border-slate-200'
                        }`}>
                          <div>
                            <span className={`font-bold text-xs block ${textTitleClass}`}>{selectedUnlinkedChat.parentPhone}</span>
                            <span className={`text-[10px] ${textMutedClass}`}>Direct WABA Inbox</span>
                          </div>
                          <button 
                            onClick={() => {
                              const targetStudent = students.find(s => s.code === "STUD-102");
                              if (!targetStudent) return;

                              setStudents(prev => prev.map(s => s.code === "STUD-102" ? { ...s, parentPhone: selectedUnlinkedChat.parentPhone } : s));

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
                              alert(`Sender successfully verified as ${targetStudent.parentName}. Conversation permanently linked to ${targetStudent.name} and routed to Usthad Ibrahim's portal!`);
                            }}
                            className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-[11px] font-black px-3 py-1.5 rounded-lg flex items-center gap-1 transition"
                          >
                            <UserPlus className="h-3.5 w-3.5" /> Verify & Link Student (STUD-102)
                          </button>
                        </div>

                        {/* Message log */}
                        <div className="p-4 flex-1 overflow-y-auto flex flex-col gap-3">
                          {selectedUnlinkedChat.messages.map((m, i) => (
                            <div 
                              key={i}
                              className={`max-w-[80%] p-2.5 rounded-lg text-xs leading-normal ${
                                m.sender === 'parent' 
                                  ? `${subMenuBgClass} border ${textTitleClass} self-start` 
                                  : 'bg-emerald-500 text-slate-950 font-bold self-end'
                              }`}
                            >
                              {m.text}
                            </div>
                          ))}
                        </div>

                        {/* Send box */}
                        <div className={`p-3 border-t flex items-center gap-2 ${
                          isDark ? 'bg-neutral-950 border-neutral-800' : 'bg-slate-100 border-slate-200'
                        }`}>
                          <input 
                            type="text"
                            placeholder="Type a query reply to unlinked parent..."
                            className={`flex-1 rounded-lg px-3 py-1.5 text-xs focus:outline-none border ${inputBgClass}`}
                          />
                          <button 
                            onClick={() => alert("Verification query dispatched over WhatsApp!")}
                            className="bg-emerald-500 text-slate-950 p-2 rounded-lg"
                          >
                            <Send className="h-4 w-4" />
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="p-8 text-center space-y-2 flex flex-col items-center justify-center h-full">
                        <MessageSquare className={`h-8 w-8 ${textMutedClass}`} />
                        <p className={`text-xs ${textMutedClass}`}>Select an unlinked parent thread to chat and resolve identity alignment.</p>
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
                  <h3 className={`text-base font-bold flex items-center gap-2 ${textTitleClass}`}>
                    <ChefHat className="h-5 w-5 text-emerald-500" />
                    Kitchen Storeroom Stock Board
                  </h3>
                  <p className={`text-xs ${textMutedClass}`}>Real-time alerts sent by cook over WhatsApp regarding kitchen inventory supplies.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {kitchenStock.map((item, idx) => (
                    <div key={idx} className={`p-4 rounded-xl border space-y-3 ${innerCardClass}`}>
                      <div className={`flex justify-between items-center border-b pb-2 ${
                        isDark ? 'border-neutral-800' : 'border-slate-200'
                      }`}>
                        <strong className={`text-sm ${textTitleClass}`}>{item.item}</strong>
                        <span className={`text-[10px] ${textMutedClass}`}>{item.lastUpdated}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className={`block ${textMutedClass}`}>Available Stock:</span>
                          <span className="font-bold text-rose-500">{item.currentStock}</span>
                        </div>
                        <div>
                          <span className={`block ${textMutedClass}`}>Required Order:</span>
                          <span className="font-bold text-teal-500">{item.neededQuantity}</span>
                        </div>
                      </div>

                      <button 
                        onClick={() => alert(`Purchase Order of ${item.neededQuantity} generated for ${item.item}!`)}
                        className={`w-full text-[11px] font-bold py-1.5 rounded transition border ${
                          isDark ? 'bg-neutral-900 border-neutral-800 text-neutral-200 hover:bg-neutral-800' : 'bg-slate-100 border-slate-200 text-slate-800 hover:bg-slate-200'
                        }`}
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
                  <h3 className={`text-base font-bold flex items-center gap-2 ${textTitleClass}`}>
                    <ClipboardList className="h-5 w-5 text-emerald-500" />
                    Nazim Daily Administrative Tasks
                  </h3>
                  <p className={`text-xs ${textMutedClass}`}>Accomplishing duties directly maintains your operational rating. Your rating makes up 25% of the global center ranking.</p>
                </div>

                <div className="space-y-3">
                  {nazimDuties.map(duty => (
                    <div key={duty.id} className={`p-4 rounded-xl border flex items-center justify-between ${innerCardClass}`}>
                      <span className={`text-xs font-bold ${
                        duty.isCompleted ? `${textMutedClass} line-through` : textTitleClass
                      }`}>
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

                <div className={`p-4 rounded-xl border flex justify-between items-center text-xs ${innerCardClass}`}>
                  <span className={textMutedClass}>Dynamic Duty Accomplishment Grade:</span>
                  <strong className="text-sm text-emerald-500">{staff.find(s => s.role === 'nazim')?.rating}% Rating</strong>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* =============================================================================
          ROLE 4: SECURE HOSTEL KIOSK
          ============================================================================= */}
      {activeRole === 'kiosk' && (
        <div className="flex-1 max-w-lg w-full mx-auto p-4 md:p-6 flex flex-col justify-center">
          
          {!loggedInKioskStudent ? (
            <div className={`rounded-2xl p-6 border shadow-2xl space-y-5 animate-scaleIn ${cardBgClass}`}>
              <div className="text-center space-y-2">
                <div className="h-14 w-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto text-rose-500">
                  <Key className="h-7 w-7" />
                </div>
                <h2 className={`text-lg font-black ${textTitleClass}`}>Student Hostel Terminal</h2>
                <p className={`text-xs ${textMutedClass}`}>Log in securely using your Student Card ID and 4-digit PIN.</p>
              </div>

              <form onSubmit={handleKioskLogin} className="space-y-4">
                <div className="space-y-2">
                  <label className={`text-[10px] font-bold uppercase tracking-wider block ${textMutedClass}`}>Student Card ID</label>
                  <input 
                    type="text"
                    value={kioskCardId}
                    onChange={(e) => setKioskCardId(e.target.value)}
                    placeholder="e.g. STUD-101"
                    className={`w-full rounded-xl px-4 py-3 text-sm text-center font-mono focus:outline-none border ${inputBgClass}`}
                  />
                </div>
                <div className="space-y-2">
                  <label className={`text-[10px] font-bold uppercase tracking-wider block ${textMutedClass}`}>Private Security PIN</label>
                  <input 
                    type="password"
                    maxLength={4}
                    value={kioskPin}
                    onChange={(e) => setKioskPin(e.target.value)}
                    placeholder="••••"
                    className={`w-full rounded-xl px-4 py-3 text-sm text-center font-mono focus:outline-none tracking-widest text-lg border ${inputBgClass}`}
                  />
                </div>

                {kioskError && (
                  <p className="text-xs text-rose-500 font-bold text-center flex items-center gap-1 justify-center">
                    <AlertCircle className="h-4.5 w-4.5" /> {kioskError}
                  </p>
                )}

                <div className={`text-[10px] leading-normal text-center ${textMutedClass}`}>
                  ⚠️ <strong>Demo Pin Guides:</strong> Zaid PIN is <code className="font-bold">1111</code>, Yahiya PIN is <code className="font-bold">4444</code>.
                </div>

                <button 
                  type="submit"
                  className="w-full bg-rose-500 hover:bg-rose-600 text-white font-black py-3 rounded-xl transition shadow-md"
                >
                  Verify Access Card
                </button>
              </form>
            </div>
          ) : (
            <div className={`rounded-2xl p-5 md:p-6 border shadow-2xl space-y-6 animate-scaleIn ${cardBgClass}`}>
              
              {/* Card Header */}
              <div className={`flex justify-between items-start border-b pb-4 ${
                isDark ? 'border-neutral-800' : 'border-slate-200'
              }`}>
                <div>
                  <h3 className={`text-base font-black ${textTitleClass}`}>{loggedInKioskStudent.name}</h3>
                  <span className="text-xs text-rose-500 font-bold">{loggedInKioskStudent.code} | {loggedInKioskStudent.centerName}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] bg-rose-500/10 text-rose-500 border border-rose-500/20 px-2 py-0.5 rounded font-black block animate-pulse">
                    Auto-Lock: {kioskInactivityTimer}s
                  </span>
                  <button 
                    onClick={() => {
                      setLoggedInKioskStudent(null);
                      setKioskCardId("");
                      setKioskPin("");
                    }}
                    className={`text-[10px] underline hover:text-rose-500 mt-1 block ${textMutedClass}`}
                  >
                    Logout Card
                  </button>
                </div>
              </div>

              {/* Progress Radar Chart Visual */}
              <div className={`p-4 rounded-xl border ${innerCardClass}`}>
                <span className={`text-[10px] font-bold block uppercase tracking-wider mb-2 ${textMutedClass}`}>Tarbiyyah Performance Chart</span>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="75%" data={[
                      { category: "Namaz", score: loggedInKioskStudent.overallScore },
                      { category: "Hygiene", score: loggedInKioskStudent.overallScore + 5 },
                      { category: "Study", score: loggedInKioskStudent.overallScore - 10 },
                      { category: "Chores", score: loggedInKioskStudent.overallScore + 10 }
                    ]}>
                      <PolarGrid stroke={isDark ? "#333333" : "#cbd5e1"} />
                      <PolarAngleAxis dataKey="category" stroke={isDark ? "#a1a1aa" : "#475569"} tick={{ fontSize: 10 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} stroke={isDark ? "#333333" : "#cbd5e1"} tick={{ fontSize: 8 }} />
                      <Radar name={loggedInKioskStudent.name} dataKey="score" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.2} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Kiosk Stars and Warnings list */}
              <div className="space-y-3.5">
                <div className="space-y-2">
                  <span className={`text-xs font-bold block uppercase ${textMutedClass}`}>Behavioral Merits Log</span>
                  {loggedInKioskStudent.stars.length > 0 ? (
                    loggedInKioskStudent.stars.map((s: StarItem) => (
                      <div key={s.id} className={`p-3 rounded-lg border space-y-1 text-xs ${innerCardClass}`}>
                        <strong className="text-amber-500 flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-amber-500" /> {s.category}</strong>
                        <p className={`leading-normal ${textTitleClass}`}>{s.explanation}</p>
                      </div>
                    ))
                  ) : (
                    <p className={`text-xs ${textMutedClass}`}>No achievements recorded yet.</p>
                  )}
                </div>
              </div>

              {/* Direct secure complaint box */}
              <div className={`p-4 rounded-xl border space-y-3 ${innerCardClass}`}>
                <div>
                  <h4 className={`text-xs font-bold flex items-center gap-1 ${textTitleClass}`}>
                    <ShieldAlert className="h-4 w-4 text-rose-500" /> Secure Direct-to-HQ Complaint Box
                  </h4>
                  <p className={`text-[10px] ${textMutedClass}`}>This submission bypasses all local teachers. Goes straight to the super admin.</p>
                </div>

                <div className="space-y-2.5">
                  <select 
                    value={kioskComplaintCategory}
                    onChange={(e) => setKioskComplaintCategory(e.target.value)}
                    className={`w-full text-[11px] rounded p-1.5 border ${inputBgClass}`}
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
                    className={`w-full text-xs rounded p-2 focus:outline-none border ${inputBgClass}`}
                  />

                  <button 
                    onClick={handleKioskComplaintSubmit}
                    className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs py-1.5 rounded transition shadow-sm"
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
          <div className={`rounded-2xl p-5 md:p-6 border shadow-2xl space-y-6 ${cardBgClass}`}>
            
            <div className="text-center space-y-1">
              <div className="h-12 w-12 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto text-amber-500">
                <MessageSquare className="h-6 w-6" />
              </div>
              <h2 className={`text-base font-black ${textTitleClass}`}>Parent WhatsApp Device Simulator</h2>
              <p className={`text-xs ${textMutedClass}`}>Test how incoming WhatsApp texts are parsed and routed by the Meta API Cloud webhook.</p>
            </div>

            <div className="space-y-4">
              
              <div className="space-y-1.5">
                <label className={`text-[11px] font-bold uppercase block ${textMutedClass}`}>Simulated Phone Number</label>
                <select 
                  value={simPhoneNumber}
                  onChange={(e) => setSimPhoneNumber(e.target.value)}
                  className={`w-full text-xs rounded-lg p-2.5 border ${inputBgClass}`}
                >
                  <option value="+919876543210">+919876543210 (Registered: Zaid's Father)</option>
                  <option value="+919000000000">+919000000000 (Unlinked: Nabeel's Father)</option>
                  <option value="+918888888888">+918888888888 (Random Unregistered Number)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className={`text-[11px] font-bold uppercase block ${textMutedClass}`}>Message Body Content</label>
                <textarea 
                  rows={3}
                  value={simMessageText}
                  onChange={(e) => setSimMessageText(e.target.value)}
                  placeholder="e.g. Is he eating properly? Or type a complaint message..."
                  className={`w-full text-xs rounded-xl p-3 focus:outline-none font-mono border ${inputBgClass}`}
                />
              </div>

              <div className={`p-3.5 rounded-lg border space-y-2 text-xs leading-relaxed ${innerCardClass}`}>
                📢 <strong className={textTitleClass}>How to test features:</strong>
                <ul className={`list-disc pl-4 space-y-1 text-[11px] ${textMutedClass}`}>
                  <li>Send a normal message from the <strong className="text-amber-500">Registered</strong> number, then switch to the <strong className="text-indigo-500">Usthad Portal</strong> (WhatsApp tab) to view the message auto-mapped to Ibrahim Kutty's inbox.</li>
                  <li>Send a message containing the word <strong className="text-rose-500">&ldquo;complaint&rdquo;</strong> to watch it bypass the local branch and route directly to the <strong className="text-rose-500">Super Admin</strong> dashboard.</li>
                  <li>Send a message from the <strong className="text-emerald-500">Unlinked</strong> number, then switch to the <strong className="text-emerald-500">Nazim Workspace</strong> (Unlinked Chats tab) to verify identity, search student profiles, and link the number permanently.</li>
                </ul>
              </div>

              <button 
                onClick={handleSimulateWhatsAppMessage}
                className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-black py-2.5 rounded-xl text-xs transition shadow-md"
              >
                Send WABA Message
              </button>

            </div>

          </div>
        </div>
      )}

      {/* Footer copyright */}
      <footer className={`border-t py-4 text-center text-[11px] transition-colors ${
        isDark ? 'bg-black border-neutral-900 text-neutral-500' : 'bg-slate-100 border-slate-200 text-slate-500'
      }`}>
        © 2026 Digi Dars CRM Multi-tenant Core Hub. All Rights Reserved.
      </footer>

    </div>
  );
}

function sIdMatching(nameA: string, nameB: string): boolean {
  if (!nameA || !nameB) return false;
  return nameA.toLowerCase().trim() === nameB.toLowerCase().trim();
}
