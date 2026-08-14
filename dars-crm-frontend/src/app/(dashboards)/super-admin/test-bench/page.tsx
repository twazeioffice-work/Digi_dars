"use client";

import React, { useState, useEffect } from 'react';
import { 
  Users, MessageSquare, ShieldAlert, CheckCircle, 
  Search, Star, AlertTriangle, Building2, UserCheck, 
  Send, ChevronRight, HelpCircle, Activity, LayoutGrid, 
  CalendarDays, Trash2, ArrowRight, BookOpen, Shield, 
  Smartphone, Monitor, RefreshCw, KeyRound, AlertCircle, FileSpreadsheet
} from 'lucide-react';

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

export interface StarRecord {
  id: string;
  date: string;
  category: string;
  usthad: string;
  explanation: string;
}

export interface WarningRecord {
  id: string;
  date: string;
  category: string;
  usthad: string;
  severity: string;
  explanation: string;
}

export interface StudentRecord {
  id: string;
  name: string;
  code: string;
  centerId: string;
  batchName: string;
  parentPhone: string;
  pin: string;
  curriculum: {
    hifzJuz: string;
    progress: number;
    sabakScore: string;
    attendance: string;
  };
  stars: StarRecord[];
  warnings: WarningRecord[];
}

// =============================================================================
// 1. COMPREHENSIVE SEEDED INITIAL STATES
// =============================================================================

const INITIAL_CENTERS = [
  { id: "ctr_1", name: "Al-Noor Central Madrasa", code: "CTR-01", score: 79.83, rank: 1 },
  { id: "ctr_2", name: "Ansarul Islam Hifz College", code: "CTR-02", score: 64.20, rank: 2 }
];

const INITIAL_USERS = [
  { id: "naz_1", name: "Nazim Faisal", role: "nazim", centerId: "ctr_1", email: "faisal@alnoor.com" },
  { id: "ust_1", name: "Usthad Ibrahim Kutty", role: "usthad", centerId: "ctr_1", email: "ibrahim@alnoor.com" },
  { id: "ust_2", name: "Usthad Abdul Rahman", role: "usthad", centerId: "ctr_1", email: "arahman@alnoor.com" }
];

const INITIAL_STUDENTS: StudentRecord[] = [
  { 
    id: "stud_1", 
    name: "Zaid Ibrahim", 
    code: "STUD-101", 
    centerId: "ctr_1", 
    batchName: "Hifz Batch A", 
    parentPhone: "919876543210", 
    pin: "1111",
    curriculum: { hifzJuz: "Juz 22", progress: 90, sabakScore: "A+", attendance: "96%" },
    stars: [
      { id: "s1", date: "2026-08-05", category: "Tajweed Fluency", usthad: "Usthad Ibrahim Kutty", explanation: "Excellent pronunciation and rhythm while reciting Surah Ya-Sin." },
      { id: "s2", date: "2026-08-11", category: "Namaz Discipline", usthad: "Usthad Ibrahim Kutty", explanation: "First to arrive in the Masjid and setup rows for Fajr congregational prayer." }
    ],
    warnings: []
  },
  { 
    id: "stud_2", 
    name: "Nabeel Sajid", 
    code: "STUD-102", 
    centerId: "ctr_1", 
    batchName: "Hifz Batch A", 
    parentPhone: "919000000000",
    pin: "2222",
    curriculum: { hifzJuz: "Juz 15", progress: 85, sabakScore: "A-", attendance: "92%" },
    stars: [],
    warnings: [
      { id: "w1", date: "2026-08-12", category: "Class Tardiness", usthad: "Usthad Ibrahim Kutty", severity: "medium", explanation: "Arrived 15 minutes late to morning lesson three days in a row without notification." }
    ]
  },
  { 
    id: "stud_3", 
    name: "Azaan Farooq", 
    code: "STUD-103", 
    centerId: "ctr_1", 
    batchName: "Hifz Batch A", 
    parentPhone: "919876543212", 
    pin: "3333",
    curriculum: { hifzJuz: "Juz 8", progress: 50, sabakScore: "C+", attendance: "84%" },
    stars: [],
    warnings: [
      { id: "w2", date: "2026-08-10", category: "Academic Negligence", usthad: "Usthad Ibrahim Kutty", severity: "high", explanation: "Repeatedly failed to memorize required daily portions of Surah Al-An'am." }
    ]
  },
  { 
    id: "stud_4", 
    name: "Yahiya Khan", 
    code: "STUD-104", 
    centerId: "ctr_1", 
    batchName: "Hifz Batch A", 
    parentPhone: "919876543213", 
    pin: "4444",
    curriculum: { hifzJuz: "Juz 4", progress: 40, sabakScore: "D", attendance: "78%" },
    stars: [],
    warnings: [
      { id: "w3", date: "2026-08-08", category: "Hygiene Protocol Violation", usthad: "Usthad Ibrahim Kutty", severity: "medium", explanation: "Skipped room cleanup rosters and was seen during dinner with unwashed hands." }
    ]
  },
  { 
    id: "stud_5", 
    name: "Ayman Shah", 
    code: "STUD-201", 
    centerId: "ctr_1", 
    batchName: "Tarbiyyah Batch B", 
    parentPhone: "447123456789", 
    pin: "5555",
    curriculum: { hifzJuz: "Juz 30", progress: 100, sabakScore: "A++", attendance: "100%" },
    stars: [
      { id: "s3", date: "2026-08-01", category: "Daily Adab Workbook", usthad: "Usthad Abdul Rahman", explanation: "Fully complete and beautifully presented workbook with outstanding handwriting." }
    ],
    warnings: []
  },
  { 
    id: "stud_6", 
    name: "Zuhair Shah", 
    code: "STUD-202", 
    centerId: "ctr_1", 
    batchName: "Tarbiyyah Batch B", 
    parentPhone: "447123456780", 
    pin: "6666",
    curriculum: { hifzJuz: "Juz 28", progress: 95, sabakScore: "A", attendance: "98%" },
    stars: [
      { id: "s4", date: "2026-08-09", category: "Namaz Compliance", usthad: "Usthad Abdul Rahman", explanation: "Led the younger students in prayers showing high leadership and adab." }
    ],
    warnings: []
  }
];

const INITIAL_WHATSAPP_THREADS = [
  {
    parentPhone: "919876543210",
    studentName: "Zaid Ibrahim",
    parentName: "Ibrahim Kutty (Father)",
    isUnrecognized: false,
    assignedUsthadId: "ust_1",
    messages: [
      { direction: "inbound", text: "Assalamu Alaikum Usthad, how is my son Zaid doing in Tajweed classes?", time: "09:30 AM" },
      { direction: "outbound", text: "Wa Alaikumussalam, Zaid is progressing well in his Hifz! He is extremely active.", time: "09:45 AM" }
    ]
  },
  {
    parentPhone: "919000000000",
    studentName: "Nabeel Sajid",
    parentName: "Sajid Ahmad (Father)",
    isUnrecognized: true,
    assignedUsthadId: null,
    messages: [
      { direction: "inbound", text: "Hello, is this the Al-Noor Madrasa? I want to ask about my son Nabeel's progress.", time: "08:12 AM" },
      { direction: "outbound", text: "Assalamu Alaikum. Please reply with your child's student registration ID or full name to verify your identity.", time: "08:20 AM" },
      { direction: "inbound", text: "His name is Nabeel Sajid, registration code STUD-102.", time: "08:22 AM" }
    ]
  },
  {
    parentPhone: "447123456789",
    studentName: "Ayman Shah",
    parentName: "Shahul Hameed (Father)",
    isUnrecognized: false,
    assignedUsthadId: "ust_2",
    messages: [
      { direction: "inbound", text: "Usthad, did Ayman submit his daily adab workbook on time?", time: "Yesterday" },
      { direction: "outbound", text: "Yes, Ayman completed his tasks on time and with excellent quality yesterday.", time: "Yesterday" }
    ]
  }
];

const INITIAL_COMPLAINTS = [
  {
    id: "comp_1",
    studentId: "stud_4",
    studentName: "Yahiya Khan",
    centerName: "Al-Noor Central Madrasa",
    category: "Nazim Mismanagement",
    description: "The branch Nazim is cutting off power to studying halls early at 9 PM to cut electricity costs. It is very hard to study in the dark.",
    status: "pending_super_admin",
    notes: ""
  },
  {
    id: "comp_2",
    studentId: "stud_2",
    studentName: "Nabeel Sajid",
    centerName: "Al-Noor Central Madrasa",
    category: "Hostel Food & Hygiene",
    description: "The hostel water dispensers have had a bad taste for three days now, and some students are reporting stomach pain.",
    status: "pending_super_admin",
    notes: ""
  }
];

const INITIAL_LEAVES = [
  {
    id: "leave_1",
    applicantType: "student",
    applicantId: "stud_1",
    applicantName: "Zaid Ibrahim",
    centerCode: "CTR-01",
    centerName: "Al-Noor Central Madrasa",
    dates: "Aug 15 - Aug 17",
    reason: "Attending family wedding in Ernakulam",
    status: "pending_approval"
  },
  {
    id: "leave_2",
    applicantType: "staff",
    applicantId: "ust_1",
    applicantName: "Usthad Ibrahim Kutty",
    centerCode: "CTR-01",
    centerName: "Al-Noor Central Madrasa",
    dates: "Aug 20 - Aug 22",
    reason: "Medical checkup for chronic back pain",
    status: "pending_approval"
  }
];

const INITIAL_NAZIM_DUTIES = [
  { id: "d1", title: "Verify Hostel Water Quality Logs", completed: true },
  { id: "d2", title: "Audit Monthly Zakat Ledger Entries", completed: true },
  { id: "d3", title: "Inspect Daily Food Hygiene Protocols", completed: true },
  { id: "d4", title: "Execute Emergency Fire Safety Drill", completed: false }
];

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function UnifiedMasterTestBench() {
  const [activeRole, setActiveRole] = useState<'super_admin' | 'nazim' | 'usthad' | 'student' | 'parent'>('super_admin');
  
  // Master State Pools representing database collections
  const [centers, setCenters] = useState(INITIAL_CENTERS);
  const [students, setStudents] = useState<StudentRecord[]>(INITIAL_STUDENTS);
  const [whatsappThreads, setWhatsappThreads] = useState(INITIAL_WHATSAPP_THREADS);
  const [complaints, setComplaints] = useState(INITIAL_COMPLAINTS);
  const [leaves, setLeaves] = useState(INITIAL_LEAVES);
  const [nazimDuties, setNazimDuties] = useState(INITIAL_NAZIM_DUTIES);

  // Leave Submenus states
  const [leaveSubTab, setLeaveSubTab] = useState<'students' | 'staff'>('students');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudentDetail, setSelectedStudentDetail] = useState<any>(null);
  const [selectedStaffDetail, setSelectedStaffDetail] = useState<any>(null);

  // Usthad workspace states
  const [selectedUsthadStudentId, setSelectedUsthadStudentId] = useState('stud_1');
  const [usthadStarCategory, setUsthadStarCategory] = useState('Tajweed Recitation');
  const [usthadStarDesc, setUsthadStarDesc] = useState('');
  const [usthadWarnCategory, setUsthadWarnCategory] = useState('Behavior Issues');
  const [usthadWarnSeverity, setUsthadWarnSeverity] = useState('medium');
  const [usthadWarnDesc, setUsthadWarnDesc] = useState('');
  const [usthadActiveChatPhone, setUsthadActiveChatPhone] = useState('919876543210');
  const [usthadReplyText, setUsthadReplyText] = useState('');

  // Nazim workspace states
  const [nazimActiveChatPhone, setNazimActiveChatPhone] = useState('919000000000');
  const [nazimReplyText, setNazimReplyText] = useState('');
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [selectedStudentToLink, setSelectedStudentToLink] = useState('');

  // Student Kiosk states
  const [kioskStudentCard, setKioskStudentCard] = useState('');
  const [kioskStudentPin, setKioskStudentPin] = useState('');
  const [kioskLoggedInStudent, setKioskLoggedInStudent] = useState<any>(null);
  const [kioskComplaintCategory, setKioskComplaintCategory] = useState('Facility Issue');
  const [kioskComplaintText, setKioskComplaintText] = useState('');
  const [kioskSecondsLeft, setKioskSecondsLeft] = useState(60);

  // Parent WhatsApp Simulator states
  const [simulatedPhoneType, setSimulatedPhoneType] = useState<'registered' | 'unregistered'>('registered');
  const [simulatedPhone, setSimulatedPhone] = useState('919876543210');
  const [simulatedMessageText, setSimulatedMessageText] = useState('');

  // Super Admin Triage logs states
  const [activeTriageComplaint, setActiveTriageComplaint] = useState<any>(null);
  const [adminResolutionNotes, setAdminResolutionNotes] = useState('');

  // =============================================================================
  // EFFECT FOR KIOSK AUTO-TIMEOUT SIMULATOR
  // =============================================================================
  useEffect(() => {
    let timer: any;
    if (kioskLoggedInStudent) {
      timer = setInterval(() => {
        setKioskSecondsLeft(prev => {
          if (prev <= 1) {
            setKioskLoggedInStudent(null);
            alert("🔒 Shared Kiosk Session Timeout: Checked out automatically to protect privacy.");
            return 60;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [kioskLoggedInStudent]);

  // Reset timer on user input in kiosk
  const resetKioskInactivityTimer = () => {
    setKioskSecondsLeft(60);
  };

  // =============================================================================
  // USTHAD ACTIONS
  // =============================================================================
  const handleAwardStar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!usthadStarDesc.trim()) return;

    setStudents(prev => prev.map(s => {
      if (s.id === selectedUsthadStudentId) {
        return {
          ...s,
          stars: [
            ...s.stars,
            {
              id: `star_${Date.now()}`,
              date: new Date().toISOString().split('T')[0],
              category: usthadStarCategory,
              usthad: "Usthad Ibrahim Kutty",
              explanation: usthadStarDesc
            }
          ]
        };
      }
      return s;
    }));

    alert(`⭐️ Star successfully awarded to ${students.find(s => s.id === selectedUsthadStudentId)?.name}!`);
    setUsthadStarDesc('');
  };

  const handleIssueWarning = (e: React.FormEvent) => {
    e.preventDefault();
    if (!usthadWarnDesc.trim()) return;

    setStudents(prev => prev.map(s => {
      if (s.id === selectedUsthadStudentId) {
        return {
          ...s,
          warnings: [
            ...s.warnings,
            {
              id: `warn_${Date.now()}`,
              date: new Date().toISOString().split('T')[0],
              category: usthadWarnCategory,
              usthad: "Usthad Ibrahim Kutty",
              severity: usthadWarnSeverity,
              explanation: usthadWarnDesc
            }
          ]
        };
      }
      return s;
    }));

    alert(`⚠️ Warning successfully issued to ${students.find(s => s.id === selectedUsthadStudentId)?.name}.`);
    setUsthadWarnDesc('');
  };

  const handleUsthadSendMessage = () => {
    if (!usthadReplyText.trim()) return;

    setWhatsappThreads(prev => prev.map(t => {
      if (t.parentPhone === usthadActiveChatPhone) {
        return {
          ...t,
          messages: [
            ...t.messages,
            { direction: "outbound", text: usthadReplyText, time: "Just Now" }
          ]
        };
      }
      return t;
    }));
    setUsthadReplyText('');
  };

  // =============================================================================
  // NAZIM ACTIONS
  // =============================================================================
  const handleNazimSendMessage = () => {
    if (!nazimReplyText.trim()) return;

    setWhatsappThreads(prev => prev.map(t => {
      if (t.parentPhone === nazimActiveChatPhone) {
        return {
          ...t,
          messages: [
            ...t.messages,
            { direction: "outbound", text: nazimReplyText, time: "Just Now" }
          ]
        };
      }
      return t;
    }));
    setNazimReplyText('');
  };

  const handleLinkAndReRoute = () => {
    if (!selectedStudentToLink) return;

    const matchedStudent = students.find(s => s.id === selectedStudentToLink);
    if (!matchedStudent) return;

    // 1. Update Student's registered parent phone
    setStudents(prev => prev.map(s => {
      if (s.id === selectedStudentToLink) {
        return { ...s, parentPhone: nazimActiveChatPhone };
      }
      return s;
    }));

    const assignedUsthadId = matchedStudent.batchName.includes("Batch A") ? "ust_1" : "ust_2";

    setWhatsappThreads(prev => prev.map(t => {
      if (t.parentPhone === nazimActiveChatPhone) {
        return {
          ...t,
          isUnrecognized: false,
          studentName: matchedStudent.name,
          assignedUsthadId: assignedUsthadId,
          messages: [
            ...t.messages,
            { direction: "outbound", text: `🔒 System Verification Complete: This number is now linked to student ${matchedStudent.name}. Future communications will be routed to their Usthad.`, time: "System" }
          ]
        };
      }
      return t;
    }));

    setLinkModalOpen(false);
    alert(`🔗 Successfully linked thread {${nazimActiveChatPhone}} to student ${matchedStudent.name}. Chat re-routed to Usthad!`);
  };

  // =============================================================================
  // STUDENT KIOSK ACTIONS
  // =============================================================================
  const handleKioskLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const found = students.find(s => s.code.toUpperCase() === kioskStudentCard.toUpperCase() && s.pin === kioskStudentPin);
    if (found) {
      setKioskLoggedInStudent(found);
      setKioskSecondsLeft(60);
      setKioskStudentCard('');
      setKioskStudentPin('');
    } else {
      alert("❌ Invalid Card ID or Private PIN. Please check details and try again.");
    }
  };

  const handleKioskSubmitComplaint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!kioskComplaintText.trim()) return;

    const newComplaint = {
      id: `comp_${Date.now()}`,
      studentId: kioskLoggedInStudent.id,
      studentName: kioskLoggedInStudent.name,
      centerName: "Al-Noor Central Madrasa",
      category: kioskComplaintCategory,
      description: kioskComplaintText,
      status: "pending_super_admin",
      notes: ""
    };

    setComplaints(prev => [newComplaint, ...prev]);
    alert("🛡️ Confidential Complaint Submitted: Sent directly to Super Admin dashboard. Local records bypassed.");
    setKioskComplaintText('');
  };

  // =============================================================================
  // PARENT WHATSAPP SIMULATOR ACTIONS
  // =============================================================================
  const handleParentSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!simulatedMessageText.trim()) return;

    const threadExists = whatsappThreads.find(t => t.parentPhone === simulatedPhone);
    const isComplaint = simulatedMessageText.toLowerCase().includes("complaint") || simulatedMessageText.startsWith("#complaint");

    if (isComplaint) {
      const matchingStudent = students.find(s => s.parentPhone === simulatedPhone);
      const newComp = {
        id: `comp_${Date.now()}`,
        studentId: matchingStudent ? matchingStudent.id : "orphan",
        studentName: matchingStudent ? matchingStudent.name : "Unrecognized Parent",
        centerName: "Al-Noor Central Madrasa",
        category: "Parent WhatsApp Complaint",
        description: simulatedMessageText,
        status: "pending_super_admin",
        notes: ""
      };
      setComplaints(prev => [newComp, ...prev]);
      alert("💬 Parent Complaint Recognized: Auto-extracted and routed directly to the Super Admin's private inbox.");
    }

    if (threadExists) {
      setWhatsappThreads(prev => prev.map(t => {
        if (t.parentPhone === simulatedPhone) {
          return {
            ...t,
            messages: [
              ...t.messages,
              { direction: "inbound", text: simulatedMessageText, time: "Just Now" }
            ]
          };
        }
        return t;
      }));
    } else {
      const newThread = {
        parentPhone: simulatedPhone,
        studentName: simulatedPhoneType === 'registered' ? "Zaid Ibrahim" : "Unknown Student",
        parentName: simulatedPhoneType === 'registered' ? "Ibrahim Kutty" : "New Parent (Unverified)",
        isUnrecognized: simulatedPhoneType === 'unregistered',
        assignedUsthadId: simulatedPhoneType === 'registered' ? "ust_1" : null,
        messages: [{ direction: "inbound", text: simulatedMessageText, time: "Just Now" }]
      };
      setWhatsappThreads(prev => [...prev, newThread]);
    }

    setSimulatedMessageText('');
    alert(`📲 WhatsApp Message Dispatched via WABA webhook to center number.`);
  };

  // =============================================================================
  // SUPER ADMIN ACTIONS
  // =============================================================================
  const handleResolveComplaintConfidential = () => {
    if (!activeTriageComplaint) return;

    setComplaints(prev => prev.map(c => {
      if (c.id === activeTriageComplaint.id) {
        return {
          ...c,
          status: "resolved_by_super_admin",
          notes: adminResolutionNotes
        };
      }
      return c;
    }));

    alert("🛡️ Private Executive Action Executed: Complaint resolved safely by Super Admin and locked away from local branch records.");
    setActiveTriageComplaint(null);
    setAdminResolutionNotes('');
  };

  const handleDelegateComplaintToNazim = () => {
    if (!activeTriageComplaint) return;

    setComplaints(prev => prev.map(c => {
      if (c.id === activeTriageComplaint.id) {
        return {
          ...c,
          status: "assigned_to_nazim",
          notes: "Delegated to Branch Nazim for immediate review."
        };
      }
      return c;
    }));

    alert("📋 Complaint delegated to Branch Nazim.");
    setActiveTriageComplaint(null);
  };

  const handleApproveLeave = (id: string) => {
    setLeaves(prev => prev.map(l => l.id === id ? { ...l, status: "approved" } : l));
    alert("✅ Leave application approved.");
  };

  const handleRejectLeave = (id: string) => {
    setLeaves(prev => prev.map(l => l.id === id ? { ...l, status: "rejected" } : l));
    alert("❌ Leave application rejected.");
  };

  // =============================================================================
  // DYNAMIC SEARCH FILTERS FOR LEAVES PAGE
  // =============================================================================
  const filteredStudentsForLeaves = students.filter(s => {
    const term = searchQuery.toLowerCase();
    return s.name.toLowerCase().includes(term) || s.code.toLowerCase().includes(term) || s.parentPhone.includes(term);
  });

  const filteredStaffForLeaves = INITIAL_USERS.filter(u => {
    const term = searchQuery.toLowerCase();
    return u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term) || u.role.toLowerCase().includes(term);
  });

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      
      {/* GLOBAL SYSTEM BAR */}
      <div className="bg-slate-950 border-b border-slate-800 px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 bg-emerald-500 rounded-full animate-ping"></div>
          <span className="text-xs font-semibold uppercase tracking-widest text-emerald-400">Digi Dars CRM v2.0 - LIVE INTERACTIVE RUNTIME</span>
        </div>

        {/* ROLE COCKPIT TABS */}
        <div className="flex bg-slate-900 border border-slate-800 p-1.5 rounded-xl gap-1">
          <button 
            onClick={() => setActiveRole('super_admin')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${activeRole === 'super_admin' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Shield className="h-3.5 w-3.5" /> Super Admin
          </button>
          <button 
            onClick={() => setActiveRole('nazim')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${activeRole === 'nazim' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Building2 className="h-3.5 w-3.5" /> Nazim
          </button>
          <button 
            onClick={() => setActiveRole('usthad')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${activeRole === 'usthad' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <BookOpen className="h-3.5 w-3.5" /> Usthad
          </button>
          <button 
            onClick={() => setActiveRole('student')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${activeRole === 'student' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Monitor className="h-3.5 w-3.5" /> Student Kiosk
          </button>
          <button 
            onClick={() => setActiveRole('parent')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${activeRole === 'parent' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Smartphone className="h-3.5 w-3.5" /> WhatsApp Phone Sim
          </button>
        </div>
      </div>

      {/* VIEWPORT BODY */}
      <div className="flex-1 p-6 max-w-7xl w-full mx-auto">
        
        {/* ===================================================================
            VIEW 1: SUPER ADMIN COCKPIT
            =================================================================== */}
        {activeRole === 'super_admin' && (
          <div className="space-y-6">
            
            {/* Header section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-950 p-6 rounded-2xl border border-slate-800">
              <div>
                <h1 className="text-2xl font-black text-slate-100 flex items-center gap-2">
                  <Shield className="h-6 w-6 text-emerald-500" />
                  Super Admin Management Suite
                </h1>
                <p className="text-sm text-slate-400 mt-1">Cross-tenant educational leaderboard, leave applications triage, and safety complaint box.</p>
              </div>
              <div className="flex items-center gap-4 bg-slate-900 border border-slate-800 p-3 rounded-xl text-xs">
                <div>
                  <span className="text-slate-500 block">Active Center Namespace</span>
                  <span className="font-bold text-slate-200">Global (All Tenants)</span>
                </div>
                <div className="h-8 w-px bg-slate-800"></div>
                <div>
                  <span className="text-slate-500 block">Stripe Ledger Audit</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1"><CheckCircle className="h-3.5 w-3.5" /> Zakat Secure</span>
                </div>
              </div>
            </div>

            {/* Middle Grid - Leaderboard & Safety Complaints */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Leaderboard panel (40/35/25 calculation) */}
              <div className="lg:col-span-4 bg-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
                <div>
                  <h3 className="text-md font-bold text-slate-200 flex items-center gap-2 mb-1">
                    <Activity className="h-5 w-5 text-emerald-400" />
                    Global Institution Leaderboard
                  </h3>
                  <p className="text-xs text-slate-500 mb-4">Ranked automatically under the 40/35/25 scoring engine</p>
                  
                  <div className="space-y-3">
                    {centers.map((c) => (
                      <div key={c.id} className="bg-slate-900/50 border border-slate-800 p-3.5 rounded-xl flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="bg-slate-800 text-slate-300 text-[10px] px-1.5 py-0.5 rounded font-bold">{c.code}</span>
                            <h4 className="text-sm font-bold text-slate-200">{c.name}</h4>
                          </div>
                          <span className="text-[11px] text-slate-500 block mt-1">Weighting: 40% Students | 35% Usthads | 25% Nazim</span>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-black text-emerald-400 block">{c.score}%</span>
                          <span className="text-[10px] font-semibold text-slate-400 block bg-slate-800 px-2 py-0.5 rounded">Rank #{c.rank}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs text-slate-400 leading-relaxed">
                  💡 <strong>Batch Penalty Rule is active:</strong> Usthad Ibrahim Kutty has been penalized <strong>-30 pts</strong> this month because 50% of his batch is underperforming (&lt;70% score). This dropped the center score to 79.83%.
                </div>
              </div>

              {/* Safety Triage Panel (Bypassing local Nazim) */}
              <div className="lg:col-span-8 bg-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
                <div>
                  <h3 className="text-md font-bold text-slate-200 flex items-center gap-2 mb-1">
                    <ShieldAlert className="h-5 w-5 text-rose-500" />
                    Direct-to-Super-Admin Triage Inbox
                  </h3>
                  <p className="text-xs text-slate-500 mb-4">Confidential complaint box submitted by students on shared kiosks or parents via WhatsApp</p>

                  <div className="space-y-3 max-h-[220px] overflow-y-auto">
                    {complaints.map(comp => (
                      <div 
                        key={comp.id}
                        className={`p-3.5 rounded-xl border transition cursor-pointer flex flex-col justify-between gap-2 ${activeTriageComplaint?.id === comp.id ? 'border-rose-500 bg-rose-500/5' : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'}`}
                        onClick={() => {
                          setActiveTriageComplaint(comp);
                          setAdminResolutionNotes(comp.notes || '');
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="bg-rose-950 text-rose-400 text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">{comp.category}</span>
                            <h4 className="text-xs font-bold text-slate-300">{comp.centerName}</h4>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${comp.status === 'pending_super_admin' ? 'bg-amber-950 text-amber-400 border border-amber-900' : 'bg-emerald-950 text-emerald-400 border border-emerald-900'}`}>
                            {comp.status.replace(/_/g, ' ')}
                          </span>
                        </div>

                        <p className="text-xs text-slate-300 italic font-medium">&ldquo;{comp.description}&rdquo;</p>
                        <span className="text-[10px] text-slate-500">Student: {comp.studentName}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Complaint Action Form */}
                {activeTriageComplaint ? (
                  <div className="mt-4 p-4 bg-slate-900 rounded-xl border border-rose-500/20 animate-fadeIn">
                    <h4 className="text-xs font-bold text-rose-400 mb-2 flex items-center gap-1">
                      <ShieldAlert className="h-3.5 w-3.5" /> Secure Resolution Console: Resolving Complaint for {activeTriageComplaint.studentName}
                    </h4>
                    
                    {activeTriageComplaint.category === "Nazim Mismanagement" && (
                      <div className="p-2.5 bg-rose-950/20 border border-rose-900 text-[11px] text-rose-400 rounded-lg mb-3 leading-normal">
                        ⚠️ <strong>CRITICAL SAFETY RULE:</strong> This complaint is flagged as <em>Nazim Mismanagement</em>. To protect the student, the details of this complaint are hidden from local center logs. The local Nazim has NO access to this record.
                      </div>
                    )}

                    <textarea
                      rows={2}
                      value={adminResolutionNotes}
                      onChange={(e) => setAdminResolutionNotes(e.target.value)}
                      placeholder="Write confidential executive action resolution notes..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-rose-500 mb-3"
                    />

                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => setActiveTriageComplaint(null)}
                        className="bg-slate-800 text-slate-400 text-xs px-3 py-1.5 rounded-lg hover:bg-slate-700"
                      >
                        Cancel
                      </button>

                      {activeTriageComplaint.category !== "Nazim Mismanagement" && (
                        <button 
                          onClick={handleDelegateComplaintToNazim}
                          className="bg-blue-600 text-white text-xs px-3.5 py-1.5 rounded-lg font-bold hover:bg-blue-700 flex items-center gap-1.5"
                        >
                          Delegate to Nazim
                        </button>
                      )}

                      <button 
                        onClick={handleResolveComplaintConfidential}
                        className="bg-rose-600 text-white text-xs px-3.5 py-1.5 rounded-lg font-bold hover:bg-rose-700"
                      >
                        Execute Confidential Resolve
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 text-center py-4 text-xs text-slate-500">
                    Click on any complaint block above to view details, enforce direct triage, or delegate to local administrators.
                  </div>
                )}

              </div>

            </div>

            {/* LEAVE APPLICATIONS SECTION */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6">
              
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-800 mb-6">
                <div>
                  <h3 className="text-md font-bold text-slate-200 flex items-center gap-2">
                    <CalendarDays className="h-5 w-5 text-emerald-400" />
                    Leave Applications Triage Panel
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Manage and audit student and staff leaves with live roster searching</p>
                </div>

                {/* Submenu Tabs */}
                <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-xl">
                  <button 
                    onClick={() => { setLeaveSubTab('students'); setSearchQuery(''); setSelectedStudentDetail(null); }}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${leaveSubTab === 'students' ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}
                  >
                    Student Applications
                  </button>
                  <button 
                    onClick={() => { setLeaveSubTab('staff'); setSearchQuery(''); setSelectedStaffDetail(null); }}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${leaveSubTab === 'staff' ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}
                  >
                    Staff Applications
                  </button>
                </div>
              </div>

              {/* Live Search and Classification list */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left side list */}
                <div className="lg:col-span-5 border-r border-slate-800/80 pr-6 space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                    <input 
                      type="text" 
                      placeholder="Search center code/name, student code/name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-slate-900 pl-9 pr-4 py-2 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-4 max-h-[300px] overflow-y-auto">
                    <div className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
                      <Building2 className="h-3.5 w-3.5" /> Center: CTR-01 (Calicut)
                    </div>

                    {leaveSubTab === 'students' ? (
                      <div className="space-y-2">
                        {filteredStudentsForLeaves.map(s => (
                          <button
                            key={s.id}
                            onClick={() => setSelectedStudentDetail(s)}
                            className={`w-full text-left p-3 rounded-xl border transition flex items-center justify-between ${selectedStudentDetail?.id === s.id ? 'border-emerald-500 bg-emerald-500/5' : 'border-slate-800 bg-slate-900/20 hover:border-slate-700'}`}
                          >
                            <div>
                              <h4 className="text-xs font-bold text-slate-300">{s.name}</h4>
                              <span className="text-[10px] text-slate-500">{s.code} | {s.batchName}</span>
                            </div>
                            <ChevronRight className="h-4 w-4 text-slate-600" />
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {filteredStaffForLeaves.map(u => (
                          <button
                            key={u.id}
                            onClick={() => setSelectedStaffDetail(u)}
                            className={`w-full text-left p-3 rounded-xl border transition flex items-center justify-between ${selectedStaffDetail?.id === u.id ? 'border-emerald-500 bg-emerald-500/5' : 'border-slate-800 bg-slate-900/20 hover:border-slate-700'}`}
                          >
                            <div>
                              <h4 className="text-xs font-bold text-slate-300">{u.name}</h4>
                              <span className="text-[10px] text-slate-500 uppercase tracking-wider">{u.role}</span>
                            </div>
                            <ChevronRight className="h-4 w-4 text-slate-600" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right side detailed Profile Card */}
                <div className="lg:col-span-7 bg-slate-900/20 border border-slate-800 p-5 rounded-2xl">
                  {leaveSubTab === 'students' && selectedStudentDetail ? (
                    <div className="space-y-4">
                      <div className="flex justify-between items-start pb-3 border-b border-slate-800">
                        <div>
                          <h3 className="text-md font-bold text-slate-200">{selectedStudentDetail.name}</h3>
                          <span className="text-xs text-emerald-400 font-medium">Batch: {selectedStudentDetail.batchName} | ID: {selectedStudentDetail.code}</span>
                        </div>
                        <span className="bg-emerald-950 text-emerald-400 text-[11px] px-2.5 py-1 rounded-full font-bold">Parent Connected: {selectedStudentDetail.parentPhone}</span>
                      </div>

                      {/* Curricular detail metrics */}
                      <div className="grid grid-cols-4 gap-3">
                        <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-center">
                          <span className="text-[9px] text-slate-500 uppercase block">Hifz Level</span>
                          <span className="text-xs font-bold text-slate-200">{selectedStudentDetail.curriculum.hifzJuz}</span>
                        </div>
                        <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-center">
                          <span className="text-[9px] text-slate-500 uppercase block">Weekly Progress</span>
                          <span className="text-xs font-bold text-emerald-400">{selectedStudentDetail.curriculum.progress}%</span>
                        </div>
                        <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-center">
                          <span className="text-[9px] text-slate-500 uppercase block">Sabak Score</span>
                          <span className="text-xs font-bold text-slate-200">{selectedStudentDetail.curriculum.sabakScore}</span>
                        </div>
                        <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-center">
                          <span className="text-[9px] text-slate-500 uppercase block">Attendance</span>
                          <span className="text-xs font-bold text-slate-200">{selectedStudentDetail.curriculum.attendance}</span>
                        </div>
                      </div>

                      {/* Stars & Warnings breakdowns */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        
                        {/* Stars awarded */}
                        <div className="space-y-2">
                          <span className="text-xs font-bold text-amber-400 flex items-center gap-1"><Star className="h-4 w-4 fill-amber-400 text-amber-400" /> Stars Awarded</span>
                          {selectedStudentDetail.stars.length === 0 ? (
                            <div className="text-[11px] text-slate-500 italic bg-slate-950/40 p-3 rounded-xl border border-slate-800/60">No achievements recorded this month.</div>
                          ) : (
                            <div className="space-y-1.5 max-h-[120px] overflow-y-auto">
                              {selectedStudentDetail.stars.map((s: any) => (
                                <div key={s.id} className="bg-slate-950/40 p-2.5 rounded-xl border border-amber-500/10 text-xs">
                                  <div className="flex justify-between font-bold text-amber-400 mb-0.5">
                                    <span>{s.category}</span>
                                    <span className="text-[10px] text-slate-500">{s.date}</span>
                                  </div>
                                  <p className="text-[11px] text-slate-400 leading-normal">{s.explanation}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Warnings issued */}
                        <div className="space-y-2">
                          <span className="text-xs font-bold text-rose-400 flex items-center gap-1"><AlertTriangle className="h-4 w-4 text-rose-400" /> Warnings Issued</span>
                          {selectedStudentDetail.warnings.length === 0 ? (
                            <div className="text-[11px] text-slate-500 italic bg-slate-950/40 p-3 rounded-xl border border-slate-800/60">Flawless behavior. No warnings.</div>
                          ) : (
                            <div className="space-y-1.5 max-h-[120px] overflow-y-auto">
                              {selectedStudentDetail.warnings.map((w: any) => (
                                <div key={w.id} className="bg-slate-950/40 p-2.5 rounded-xl border border-rose-500/10 text-xs">
                                  <div className="flex justify-between font-bold text-rose-400 mb-0.5">
                                    <span>{w.category}</span>
                                    <span className="text-[10px] text-slate-500">{w.date}</span>
                                  </div>
                                  <p className="text-[11px] text-slate-400 leading-normal">{w.explanation}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                      </div>

                      {/* Leaves pending for this student */}
                      <div className="pt-3 border-t border-slate-800/60">
                        <span className="text-xs font-bold text-slate-400 block mb-2">Leave Request Review</span>
                        {leaves.filter(l => l.applicantId === selectedStudentDetail.id).map(l => (
                          <div key={l.id} className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                            <div>
                              <span className="font-bold text-slate-200">Dates: {l.dates}</span>
                              <p className="text-[11px] text-slate-400 mt-0.5">Reason: {l.reason}</p>
                            </div>

                            {l.status === 'pending_approval' ? (
                              <div className="flex gap-1.5 self-end sm:self-auto">
                                <button 
                                  onClick={() => handleRejectLeave(l.id)}
                                  className="bg-slate-800 hover:bg-slate-700 text-[10px] px-2.5 py-1 rounded font-bold text-rose-400"
                                >
                                  Reject
                                </button>
                                <button 
                                  onClick={() => handleApproveLeave(l.id)}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-[10px] px-2.5 py-1 rounded font-bold text-white"
                                >
                                  Approve Leave
                                </button>
                              </div>
                            ) : (
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${l.status === 'approved' ? 'bg-emerald-950 text-emerald-400' : 'bg-rose-950 text-rose-400'}`}>
                                Status: {l.status}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>

                    </div>
                  ) : leaveSubTab === 'staff' && selectedStaffDetail ? (
                    <div className="space-y-4">
                      <div className="flex justify-between items-start pb-3 border-b border-slate-800">
                        <div>
                          <h3 className="text-md font-bold text-slate-200">{selectedStaffDetail.name}</h3>
                          <span className="text-xs text-indigo-400 uppercase font-semibold">{selectedStaffDetail.role} | {selectedStaffDetail.email}</span>
                        </div>
                      </div>

                      <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2 text-xs">
                        <span className="text-slate-500 uppercase block tracking-wider text-[9px]">Staff Performance Index</span>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500" style={{ width: selectedStaffDetail.name.includes("Ibrahim") ? "70%" : "100%" }}></div>
                          </div>
                          <span className="font-bold text-slate-200">{selectedStaffDetail.name.includes("Ibrahim") ? "70.0%" : "100.0%"}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 pt-1 leading-relaxed">
                          Staff scores are generated based on operational duty compliance (for Nazims) or student batch success thresholds (for Usthads).
                        </p>
                      </div>

                      {/* Leaves pending for this Staff */}
                      <div className="pt-3">
                        <span className="text-xs font-bold text-slate-400 block mb-2">Leave Request Review</span>
                        {leaves.filter(l => l.applicantId === selectedStaffDetail.id).length === 0 ? (
                          <div className="text-center text-xs text-slate-500 py-4">No leave requests registered for this staff member.</div>
                        ) : (
                          leaves.filter(l => l.applicantId === selectedStaffDetail.id).map(l => (
                            <div key={l.id} className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                              <div>
                                <span className="font-bold text-slate-200">Dates: {l.dates}</span>
                                <p className="text-[11px] text-slate-400 mt-0.5">Reason: {l.reason}</p>
                              </div>

                              {l.status === 'pending_approval' ? (
                                <div className="flex gap-1.5 self-end sm:self-auto">
                                  <button 
                                    onClick={() => handleRejectLeave(l.id)}
                                    className="bg-slate-800 hover:bg-slate-700 text-[10px] px-2.5 py-1 rounded font-bold text-rose-400"
                                  >
                                    Reject
                                  </button>
                                  <button 
                                    onClick={() => handleApproveLeave(l.id)}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-[10px] px-2.5 py-1 rounded font-bold text-white"
                                  >
                                    Approve Leave
                                  </button>
                                </div>
                              ) : (
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${l.status === 'approved' ? 'bg-emerald-950 text-emerald-400' : 'bg-rose-950 text-rose-400'}`}>
                                  Status: {l.status}
                                </span>
                              )}
                            </div>
                          ))
                        )}
                      </div>

                    </div>
                  ) : (
                    <div className="text-center py-24 text-slate-500 text-xs flex flex-col items-center justify-center gap-3">
                      <Users className="h-12 w-12 text-slate-700" />
                      Please select a student or staff member from the left list to review their curricular details, behavior stars, and active leave applications.
                    </div>
                  )}
                </div>

              </div>

            </div>

          </div>
        )}

        {/* ===================================================================
            VIEW 2: NAZIM PORTAL
            =================================================================== */}
        {activeRole === 'nazim' && (
          <div className="space-y-6">
            
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-black text-slate-100 flex items-center gap-2">
                  <Building2 className="h-6 w-6 text-blue-500" />
                  Local Administrator (Nazim) Dashboard
                </h1>
                <p className="text-sm text-slate-400 mt-1">Manage unrecognized parent threads, execute sync checkmarks, and log center-wide operational duties.</p>
              </div>
              <span className="bg-blue-950 text-blue-400 text-xs px-3 py-1 rounded-full border border-blue-900 font-bold">Center Workspace: CTR-01</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Nazim's Duties checklist */}
              <div className="lg:col-span-4 bg-slate-950 border border-slate-800 p-5 rounded-2xl">
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 mb-1">
                  <FileSpreadsheet className="h-5 w-5 text-blue-400" />
                  Operational Duties Checklist
                </h3>
                <p className="text-xs text-slate-500 mb-4">Directly affects the center's monthly ranking score</p>

                <div className="space-y-3">
                  {nazimDuties.map(d => (
                    <div 
                      key={d.id} 
                      onClick={() => setNazimDuties(prev => prev.map(item => item.id === d.id ? { ...item, completed: !item.completed } : item))}
                      className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex items-center gap-3 cursor-pointer select-none hover:border-slate-700 transition"
                    >
                      <div className={`h-4 w-4 rounded flex items-center justify-center border ${d.completed ? 'bg-blue-600 border-blue-500 text-white' : 'border-slate-700'}`}>
                        {d.completed && <CheckCircle className="h-3 w-3" />}
                      </div>
                      <span className={`text-xs font-medium ${d.completed ? 'text-slate-400 line-through' : 'text-slate-200'}`}>{d.title}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Unrecognized Parent Thread workspace */}
              <div className="lg:col-span-8 bg-slate-950 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between min-h-[400px]">
                <div>
                  <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 mb-1">
                    <MessageSquare className="h-5 w-5 text-blue-400" />
                    Unregistered Parent WhatsApp Threads
                  </h3>
                  <p className="text-xs text-slate-500 mb-4">Identify new parent phone numbers, chat to verify identity, and route them to their designated Usthad.</p>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    
                    {/* Unlinked Threads column */}
                    <div className="md:col-span-5 border-r border-slate-850 pr-4 space-y-2">
                      {whatsappThreads.filter(t => t.isUnrecognized).map(t => (
                        <button
                          key={t.parentPhone}
                          onClick={() => setNazimActiveChatPhone(t.parentPhone)}
                          className={`w-full text-left p-3 rounded-xl border transition flex flex-col gap-1 ${nazimActiveChatPhone === t.parentPhone ? 'border-blue-500 bg-blue-500/5' : 'border-slate-800 bg-slate-900/40'}`}
                        >
                          <span className="text-xs font-bold text-rose-400 flex items-center gap-1">⚠️ Unlinked Sender</span>
                          <span className="text-[11px] font-bold text-slate-300">{t.parentPhone}</span>
                          <p className="text-[10px] text-slate-500 truncate">{t.messages[t.messages.length - 1]?.text}</p>
                        </button>
                      ))}

                      {whatsappThreads.filter(t => t.isUnrecognized).length === 0 && (
                        <div className="text-center py-12 text-slate-600 text-xs font-semibold">
                          🎉 No unrecognized parent threads active.
                        </div>
                      )}
                    </div>

                    {/* Chat and Reroute workspace */}
                    <div className="md:col-span-7 flex flex-col justify-between bg-slate-900/40 border border-slate-800/80 rounded-xl p-4 min-h-[300px]">
                      {whatsappThreads.find(t => t.parentPhone === nazimActiveChatPhone) ? (
                        <>
                          <div className="flex justify-between items-center pb-2 border-b border-slate-800/80 mb-3">
                            <div>
                              <span className="text-[10px] font-bold text-slate-400">Active Verification</span>
                              <h4 className="text-xs font-bold text-slate-200">{nazimActiveChatPhone}</h4>
                            </div>
                            <button
                              onClick={() => setLinkModalOpen(true)}
                              className="bg-blue-600 hover:bg-blue-700 text-[10px] px-2.5 py-1.5 rounded font-bold text-white flex items-center gap-1.5"
                            >
                              <UserCheck className="h-3 w-3" /> Verify & Link Student
                            </button>
                          </div>

                          <div className="flex-1 space-y-2 overflow-y-auto max-h-[160px] mb-3 text-xs">
                            {whatsappThreads.find(t => t.parentPhone === nazimActiveChatPhone)?.messages.map((m, i) => (
                              <div key={i} className={`p-2 rounded-lg leading-normal max-w-[85%] ${m.direction === 'inbound' ? 'bg-slate-950 text-slate-300 self-start' : 'bg-blue-600 text-white self-end'}`}>
                                {m.text}
                              </div>
                            ))}
                          </div>

                          <div className="flex gap-2">
                            <input 
                              type="text"
                              placeholder="Message unrecognized parent..."
                              value={nazimReplyText}
                              onChange={(e) => setNazimReplyText(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && handleNazimSendMessage()}
                              className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs focus:outline-none focus:border-blue-500"
                            />
                            <button 
                              onClick={handleNazimSendMessage}
                              className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700"
                            >
                              <Send className="h-4 w-4" />
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-16 text-xs text-slate-500">
                          Please select an unlinked parent thread from the left to start verification.
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ===================================================================
            VIEW 3: USTHAD PORTAL
            =================================================================== */}
        {activeRole === 'usthad' && (
          <div className="space-y-6">
            
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-black text-slate-100 flex items-center gap-2">
                  <BookOpen className="h-6 w-6 text-indigo-500" />
                  Teacher (Usthad) Dashboard Console
                </h1>
                <p className="text-sm text-slate-400 mt-1">Award stars, issue behavior warnings, track daily attendance, and chat with parents.</p>
              </div>
              <span className="bg-indigo-950 text-indigo-400 text-xs px-3 py-1 rounded-full border border-indigo-900 font-bold">Class: Hifz Batch A</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Performance action center */}
              <div className="lg:col-span-5 bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-6">
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Student Behavior Registry</h3>
                  
                  <div className="space-y-2 mb-4">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Select Student</label>
                    <select
                      value={selectedUsthadStudentId}
                      onChange={(e) => setSelectedUsthadStudentId(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 p-2.5 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    >
                      {students.map(s => (
                        <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                      ))}
                    </select>
                  </div>

                  {/* Award star form */}
                  <form onSubmit={handleAwardStar} className="bg-slate-900/50 border border-slate-800 p-3.5 rounded-xl space-y-3">
                    <span className="text-xs font-bold text-amber-400 flex items-center gap-1"><Star className="h-4 w-4 fill-amber-400 text-amber-400" /> Award Behavior Star</span>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={usthadStarCategory}
                        onChange={(e) => setUsthadStarCategory(e.target.value)}
                        className="bg-slate-950 border border-slate-850 p-2 rounded-lg text-[11px] text-slate-300"
                      >
                        <option value="Tajweed Recitation">Tajweed Recitation</option>
                        <option value="Namaz Discipline">Namaz Discipline</option>
                        <option value="Outstanding Adab">Outstanding Adab</option>
                        <option value="Cleanliness Leader">Cleanliness Leader</option>
                      </select>
                      <input 
                        type="text" 
                        placeholder="Detailed explanation..."
                        value={usthadStarDesc}
                        onChange={(e) => setUsthadStarDesc(e.target.value)}
                        className="bg-slate-950 border border-slate-850 p-2 rounded-lg text-[11px] text-slate-300"
                      />
                    </div>
                    <button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold py-1.5 rounded-lg transition">
                      Confirm Award Star
                    </button>
                  </form>

                  {/* Issue warning form */}
                  <form onSubmit={handleIssueWarning} className="bg-slate-900/50 border border-slate-800 p-3.5 rounded-xl space-y-3 mt-4">
                    <span className="text-xs font-bold text-rose-400 flex items-center gap-1"><AlertTriangle className="h-4 w-4 text-rose-400" /> Issue Misconduct Warning</span>
                    
                    <div className="grid grid-cols-3 gap-2">
                      <select
                        value={usthadWarnCategory}
                        onChange={(e) => setUsthadWarnCategory(e.target.value)}
                        className="col-span-1 bg-slate-950 border border-slate-850 p-2 rounded-lg text-[11px] text-slate-300"
                      >
                        <option value="Class Tardiness">Tardiness</option>
                        <option value="Academic Negligence">Academic</option>
                        <option value="Hygiene Violation">Hygiene</option>
                        <option value="Behavior Issues">Behavior</option>
                      </select>
                      <select
                        value={usthadWarnSeverity}
                        onChange={(e) => setUsthadWarnSeverity(e.target.value)}
                        className="col-span-1 bg-slate-950 border border-slate-850 p-2 rounded-lg text-[11px] text-slate-300"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                      <input 
                        type="text" 
                        placeholder="Explanation..."
                        value={usthadWarnDesc}
                        onChange={(e) => setUsthadWarnDesc(e.target.value)}
                        className="col-span-1 bg-slate-950 border border-slate-850 p-2 rounded-lg text-[11px] text-slate-300"
                      />
                    </div>
                    <button type="submit" className="w-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold py-1.5 rounded-lg transition">
                      Confirm Issue Warning
                    </button>
                  </form>

                </div>
              </div>

              {/* Chat section with registered parents */}
              <div className="lg:col-span-7 bg-slate-950 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between min-h-[400px]">
                <div>
                  <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 mb-1">
                    <MessageSquare className="h-5 w-5 text-indigo-400" />
                    WABA Parent Chat Dashboard
                  </h3>
                  <p className="text-xs text-slate-500 mb-4">Chat directly with already linked parent phone numbers auto-allocated to your roster</p>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    
                    {/* Active threads */}
                    <div className="md:col-span-5 border-r border-slate-850 pr-4 space-y-2">
                      {whatsappThreads.filter(t => !t.isUnrecognized && t.assignedUsthadId === "ust_1").map(t => (
                        <button
                          key={t.parentPhone}
                          onClick={() => setUsthadActiveChatPhone(t.parentPhone)}
                          className={`w-full text-left p-3 rounded-xl border transition flex flex-col gap-0.5 ${usthadActiveChatPhone === t.parentPhone ? 'border-indigo-500 bg-indigo-500/5' : 'border-slate-800 bg-slate-900/40'}`}
                        >
                          <span className="text-xs font-bold text-slate-200">{t.parentName}</span>
                          <span className="text-[10px] text-indigo-400 font-semibold">Student: {t.studentName}</span>
                          <p className="text-[10px] text-slate-500 truncate mt-1">{t.messages[t.messages.length - 1]?.text}</p>
                        </button>
                      ))}
                    </div>

                    {/* Chat feed */}
                    <div className="md:col-span-7 flex flex-col justify-between bg-slate-900/40 border border-slate-800/85 rounded-xl p-4 min-h-[250px]">
                      {whatsappThreads.find(t => t.parentPhone === usthadActiveChatPhone) ? (
                        <>
                          <div className="pb-2 border-b border-slate-800 mb-2">
                            <h4 className="text-xs font-bold text-slate-200">{whatsappThreads.find(t => t.parentPhone === usthadActiveChatPhone)?.parentName}</h4>
                            <span className="text-[9px] text-slate-500">Connected Phone ID: {usthadActiveChatPhone}</span>
                          </div>

                          <div className="flex-1 space-y-2 overflow-y-auto max-h-[140px] mb-3 text-xs">
                            {whatsappThreads.find(t => t.parentPhone === usthadActiveChatPhone)?.messages.map((m, i) => (
                              <div key={i} className={`p-2 rounded-lg leading-normal max-w-[85%] ${m.direction === 'inbound' ? 'bg-slate-950 text-slate-300 self-start' : 'bg-indigo-600 text-white self-end'}`}>
                                {m.text}
                              </div>
                            ))}
                          </div>

                          <div className="flex gap-2">
                            <input 
                              type="text"
                              placeholder="Message parent..."
                              value={usthadReplyText}
                              onChange={(e) => setUsthadReplyText(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && handleUsthadSendMessage()}
                              className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs focus:outline-none focus:border-indigo-500"
                            />
                            <button 
                              onClick={handleUsthadSendMessage}
                              className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700"
                            >
                              <Send className="h-4 w-4" />
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-16 text-xs text-slate-500">
                          Please select a parent thread from the left to engage in chat.
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ===================================================================
            VIEW 4: STUDENT KIOSK TERMINAL
            =================================================================== */}
        {activeRole === 'student' && (
          <div className="max-w-2xl mx-auto space-y-6">
            
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 text-center space-y-2">
              <h1 className="text-xl font-black text-slate-200 flex items-center justify-center gap-2">
                <Monitor className="h-6 w-6 text-amber-500" />
                Shared Hostel Student Kiosk Mode
              </h1>
              <p className="text-xs text-slate-400">Quickly check your performance metrics or file secure complaints directly to Super Admin.</p>
            </div>

            {!kioskLoggedInStudent ? (
              <form onSubmit={handleKioskLogin} className="bg-slate-950 border border-slate-800 p-6 rounded-2xl space-y-4">
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-1.5"><KeyRound className="h-4 w-4 text-amber-400" /> Student Login</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Student Card ID</label>
                    <input 
                      type="text" 
                      placeholder="e.g. STUD-104"
                      value={kioskStudentCard}
                      onChange={(e) => setKioskStudentCard(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 p-2.5 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Private 4-Digit PIN</label>
                    <input 
                      type="password" 
                      placeholder="••••"
                      maxLength={4}
                      value={kioskStudentPin}
                      onChange={(e) => setKioskStudentPin(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 p-2.5 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500 text-center tracking-widest font-black"
                      required
                    />
                  </div>
                </div>

                <div className="pt-2 text-xs text-slate-500">
                  💡 Hint: For simulation, try Card ID <strong>STUD-104</strong> and PIN <strong>4444</strong> (Yahiya Khan).
                </div>

                <button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black py-2.5 rounded-xl transition">
                  Secure Sign In
                </button>
              </form>
            ) : (
              <div onMouseMove={resetKioskInactivityTimer} onKeyDown={resetKioskInactivityTimer} className="bg-slate-950 border border-slate-800 p-6 rounded-2xl space-y-6 animate-scaleIn">
                
                {/* Session bar with logout and timeout countdown */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div>
                    <h3 className="text-sm font-bold text-slate-200">Welcome, {kioskLoggedInStudent.name}</h3>
                    <span className="text-[10px] text-amber-400 font-semibold">{kioskLoggedInStudent.code} | {kioskLoggedInStudent.batchName}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] bg-slate-900 px-2 py-1 rounded border border-slate-800 text-slate-400 animate-pulse">
                      Session Auto-locks in {kioskSecondsLeft}s
                    </span>
                    <button 
                      onClick={() => setKioskLoggedInStudent(null)}
                      className="bg-rose-950 hover:bg-rose-900 text-rose-400 text-[10px] font-bold px-2.5 py-1 rounded"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>

                {/* Dashboard grid (Performance + Messages) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Curricular & Score card */}
                  <div className="bg-slate-900 p-4 rounded-xl border border-slate-850 space-y-3">
                    <span className="text-xs font-bold text-slate-300 block">My Monthly Progress</span>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Hifz Progress</span>
                        <span className="font-bold text-slate-200">{kioskLoggedInStudent.curriculum.hifzJuz} ({kioskLoggedInStudent.curriculum.progress}%)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Sabak Grade</span>
                        <span className="font-bold text-slate-200">{kioskLoggedInStudent.curriculum.sabakScore}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Attendance</span>
                        <span className="font-bold text-slate-200">{kioskLoggedInStudent.curriculum.attendance}</span>
                      </div>
                    </div>
                  </div>

                  {/* Kiosk direct complaint box (Confidential) */}
                  <form onSubmit={handleKioskSubmitComplaint} className="bg-slate-900 p-4 rounded-xl border border-rose-500/10 space-y-3">
                    <span className="text-xs font-bold text-rose-400 flex items-center gap-1"><ShieldAlert className="h-4 w-4 text-rose-400 animate-pulse" /> Confidential Complaint Box</span>
                    <p className="text-[10px] text-slate-500 leading-normal">
                      Submissions here go <strong>directly to the Super Admin</strong>. It will be hidden from the local Nazim and teachers to protect your privacy.
                    </p>

                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={kioskComplaintCategory}
                        onChange={(e) => setKioskComplaintCategory(e.target.value)}
                        className="bg-slate-950 border border-slate-850 p-2 rounded-lg text-[10px] text-slate-300"
                      >
                        <option value="Facility Issue">Facility Issue</option>
                        <option value="Hostel Food">Hostel Food</option>
                        <option value="Teacher Conduct">Teacher Conduct</option>
                        <option value="Nazim Mismanagement">Nazim Mismanagement</option>
                      </select>
                      <input 
                        type="text" 
                        placeholder="Write your issue here..."
                        value={kioskComplaintText}
                        onChange={(e) => setKioskComplaintText(e.target.value)}
                        className="bg-slate-950 border border-slate-850 p-2 rounded-lg text-[10px] text-slate-300"
                        required
                      />
                    </div>
                    <button type="submit" className="w-full bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold py-1.5 rounded-lg transition">
                      Submit Securely
                    </button>
                  </form>

                </div>

              </div>
            )}

          </div>
        )}

        {/* ===================================================================
            VIEW 5: PARENT WHATSAPP SIMULATOR (WABA INTERACTION)
            =================================================================== */}
        {activeRole === 'parent' && (
          <div className="max-w-md mx-auto bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
            <div className="bg-slate-900 p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-emerald-500 rounded-full"></div>
                <h3 className="font-bold text-slate-100 text-sm">WhatsApp Chat Simulator</h3>
              </div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">WABA Meta Webhook</span>
            </div>

            <form onSubmit={handleParentSendMessage} className="p-4 space-y-4">
              
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Simulate Parent Profile</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => { setSimulatedPhoneType('registered'); setSimulatedPhone('919876543210'); }}
                    className={`py-1.5 px-3 rounded-lg text-xs font-bold border transition ${simulatedPhoneType === 'registered' ? 'bg-emerald-600 text-white border-emerald-500' : 'bg-slate-900 text-slate-400 border-slate-800'}`}
                  >
                    Registered Parent
                  </button>
                  <button
                    type="button"
                    onClick={() => { setSimulatedPhoneType('unregistered'); setSimulatedPhone('919000000000'); }}
                    className={`py-1.5 px-3 rounded-lg text-xs font-bold border transition ${simulatedPhoneType === 'unregistered' ? 'bg-emerald-600 text-white border-emerald-500' : 'bg-slate-900 text-slate-400 border-slate-800'}`}
                  >
                    Unlinked Parent
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Parent Phone Number ID</label>
                <input 
                  type="text" 
                  value={simulatedPhone}
                  onChange={(e) => setSimulatedPhone(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 p-2 rounded-lg text-xs text-slate-300 focus:outline-none"
                  readOnly
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Write WhatsApp Message Body</label>
                <textarea 
                  rows={3}
                  placeholder="e.g. Assalamu Alaikum, how is my son?"
                  value={simulatedMessageText}
                  onChange={(e) => setSimulatedMessageText(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 p-2.5 rounded-lg text-xs text-slate-200 focus:outline-none"
                  required
                />
              </div>

              <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-[10px] text-slate-500 leading-normal">
                💡 <strong>Try this:</strong> If message body contains the word <strong>"complaint"</strong> or hashtags <strong>"#complaint"</strong>, it will automatically register as a complaint and bypass to Super Admin!
              </div>

              <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 rounded-lg transition shadow-md">
                Send Message via Webhook
              </button>

            </form>
          </div>
        )}

      </div>

      {/* ===================================================================
          MODAL: DELEGATE COMPLAINT / VERIFY STUDENT LINK (NAZIM DIALOG)
          =================================================================== */}
      {linkModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 animate-scaleIn text-slate-100">
            <h3 className="font-bold text-slate-200 text-base flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-blue-500" />
              Link Phone Number to Student Roster
            </h3>
            <p className="text-xs text-slate-400 leading-normal">
              You are linking parent phone number <strong className="text-blue-400">{nazimActiveChatPhone}</strong> to an active student's profile. Please search and select the student.
            </p>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Select Student</label>
              <select
                value={selectedStudentToLink}
                onChange={(e) => setSelectedStudentToLink(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 p-2 rounded-lg text-xs text-slate-200 focus:outline-none"
              >
                <option value="">-- Select Student --</option>
                {students.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.code}) - Batch: {s.batchName}</option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button 
                onClick={() => setLinkModalOpen(false)}
                className="bg-slate-800 text-slate-400 text-xs px-3.5 py-1.5 rounded-lg hover:bg-slate-700"
              >
                Cancel
              </button>
              <button 
                onClick={handleLinkAndReRoute}
                className="bg-blue-600 text-white text-xs px-3.5 py-1.5 rounded-lg font-bold hover:bg-blue-700"
              >
                Execute Link & Re-Route
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
