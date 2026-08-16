"use client";

import React, { useState, useEffect } from 'react';
import { 
  Building, Users, BookOpen, CreditCard, DollarSign, Wrench as Tool, Award, 
  MessageSquare, ShieldCheck, ChevronRight, Search, Plus, Calendar, 
  Download, Printer, Trash2, Mail, Send, CheckCircle, AlertCircle, 
  UserCheck, ShieldAlert, Award as Medal, Activity, Database, Check,
  Book, Globe, FileText, Share2, Layers, MapPin, ListFilter, Play, Eye
} from 'lucide-react';
import { 
  BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar, 
  ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell 
} from 'recharts';

// =============================================================================
// 1. COMPREHENSIVE INITIAL STATE & MOCK DATA (SUFFATH-UL HUFFAZ AL-HIND)
// =============================================================================

const INITIAL_CENTERS = [
  { id: "cnt_1", code: "CTR-HIND-01", name: "Markaz Suffath-ul Huffaz (Delhi HQ)", branch: "Delhi Central", affiliationStatus: "APPROVED", rating: 98 },
  { id: "cnt_2", code: "CTR-HIND-02", name: "Suffath-ul Huffaz Academy (Calicut Branch)", branch: "Kerala South", affiliationStatus: "APPROVED", rating: 94 },
  { id: "cnt_3", code: "CTR-HIND-03", name: "Darul Qur'an Affiliated Center (Lucknow)", branch: "UP East", affiliationStatus: "PENDING", rating: 85 }
];

const INITIAL_STUDENTS = [
  { id: "stud_1", code: "STUD-HIND-401", name: "Hamza Tariq", centerId: "cnt_1", centerName: "Delhi HQ", parentName: "Tariq Mahmood", parentPhone: "+919876543210", batchName: "Hifz Class A", course: "Advanced Tajweed & Hifz", enrollmentDate: "2026-01-10", attendance: 96, balanceDue: 2500, score: 92, juzCompleted: 24, status: "Active" },
  { id: "stud_2", code: "STUD-HIND-402", name: "Nabeel Al-Hassan", centerId: "cnt_1", centerName: "Delhi HQ", parentName: "Muhammad Al-Hassan", parentPhone: "+919123456780", batchName: "Hifz Class A", course: "Quran Hifz Foundation", enrollmentDate: "2026-02-14", attendance: 92, balanceDue: 0, score: 88, juzCompleted: 15, status: "Active" },
  { id: "stud_3", code: "STUD-HIND-403", name: "Zuhair Siddiqui", centerId: "cnt_2", centerName: "Calicut Branch", parentName: "Siddique Rahman", parentPhone: "+919000000100", batchName: "Tarbiyyah Batch B", course: "Adab & Hifz Prep", enrollmentDate: "2026-03-01", attendance: 98, balanceDue: 5000, score: 95, juzCompleted: 8, status: "Active" }
];

const INITIAL_STAFF = [
  { id: "staff_1", code: "STF-HIND-101", name: "Usthad Mawlavi Anas Qasimi", role: "Chief Usthad", centerId: "cnt_1", department: "Academic Management", designation: "Hifz Director", attendance: 98, baseSalary: 32000, advanceTaken: 4000, isPaid: false, phone: "+919998887770" },
  { id: "staff_2", code: "STF-HIND-102", name: "Nazim Saleem Bukhari", role: "Branch Nazim", centerId: "cnt_1", department: "Administration & Log", designation: "General Administrator", attendance: 95, baseSalary: 28000, advanceTaken: 0, isPaid: false, phone: "+918887776660" }
];

const INITIAL_COURSES = [
  { id: "crs_1", code: "CRS-HIFZ-01", name: "Quran memorization Masterclass (Hifz)", syllabus: "30 Juz Memorization, Tajweed Rules, and Qira'at", duration: "3 Years", modulesCount: 6 },
  { id: "crs_2", code: "CRS-TAJ-02", name: "Advanced Tajweed & Pronunciation", syllabus: "Surah Al-Fatihah to Surah An-Nas articulation mapping", duration: "6 Months", modulesCount: 3 }
];

const INITIAL_LMS_RESOURCES = [
  { id: "res_1", courseId: "crs_1", title: "Tajweed articulation Points (Makharij Al-Huruf)", fileType: "PDF Notes", author: "Usthad Anas Qasimi", downloadCount: 142 },
  { id: "res_2", courseId: "crs_1", title: "Proper Breath Control for Surah Recitation", fileType: "Video Class", author: "Mawlavi Anas Qasimi", downloadCount: 295 }
];

const INITIAL_ASSETS = [
  { id: "ast_1", centerId: "cnt_1", category: "Building", name: "Academic Dormitory Block A", value: "₹45,00,000", condition: "Excellent", trackingId: "AST-BLD-01" },
  { id: "ast_2", centerId: "cnt_1", category: "Vehicle", name: "Institutional Transport Coach Bus", value: "₹18,00,000", condition: "Good", trackingId: "AST-VEH-01" }
];

const INITIAL_ALUMNI = [
  { id: "alm_1", name: "Hafiz Bilal Ahmed", centerName: "Delhi HQ", graduationYear: "2024", currentPosition: "Imam & Mudarris", employmentDetails: "Al-Azhar Masjid Trust", phone: "+917776665551" },
  { id: "alm_2", name: "Hafiz Salman Faris", centerName: "Delhi HQ", graduationYear: "2025", currentPosition: "Senior Reciter", employmentDetails: "Suffath Academy Network", phone: "+916665554442" }
];

const INITIAL_COMPETITIONS = [
  { id: "cmp_1", title: "National Level Quran Recitation Championship (Delhi 2026)", date: "2026-09-12", venue: "Markaz Auditorium, Delhi HQ", prizePool: "₹2,50,000", status: "Upcoming", winnerName: "" },
  { id: "cmp_2", title: "Regional Hifz & Qira'at Competition (Calicut 2026)", date: "2026-08-01", venue: "Calicut Town Hall", prizePool: "₹1,00,000", status: "Conducted", winnerName: "Hamza Tariq (STUD-HIND-401)" }
];

const INITIAL_LEDGERS = [
  { id: "ld_1", type: "INCOME", accountHead: "Student Academic Tuition Fees", voucherNo: "VCH-2026-0901", description: "Consolidated tuition fee collection for August 2026", amount: 152000, date: "2026-08-14" },
  { id: "ld_2", type: "EXPENSE", accountHead: "Kitchen Store Room Groceries", voucherNo: "VCH-2026-0902", description: "Procured Basmati Rice, vegetables and Coconut oil supply", amount: 18500, date: "2026-08-14" },
  { id: "ld_3", type: "EXPENSE", accountHead: "Staff Payroll - Usthad Compensation", voucherNo: "VCH-2026-0903", description: "Paid salaries for teaching and administrative personnel", amount: 50000, date: "2026-08-14" }
];

const INITIAL_AUDITS = [
  { id: "aud_1", action: "AFFILIATION_APPROVED", user: "Super Admin (Alim Committee)", timestamp: "2026-08-14 10:14 AM", details: "Approved Center affiliation for Suffath-ul Huffaz Academy (Calicut Branch)" },
  { id: "aud_2", action: "PAYROLL_VERIFIED", user: "Super Admin Office", timestamp: "2026-08-15 08:30 AM", details: "Authorized and released August 2026 payroll sheets submitted by Branch Nazims" }
];

export default function SuffathHuffazMasterSystem() {
  // Navigation & Categorization State Mapping to PDF
  const [activeModule, setActiveModule] = useState<'erp' | 'lms' | 'billing' | 'accounting' | 'assets' | 'alumni' | 'competitions' | 'affiliation' | 'communication' | 'reports' | 'security'>('erp');
  const [erpSubTab, setErpSubTab] = useState<'institution' | 'student' | 'staff' | 'academics'>('institution');
  const [billingSubTab, setBillingSubTab] = useState<'receipts' | 'multi_fees' | 'dues' | 'ledgers'>('receipts');
  
  // Dynamic Databases
  const [centers, setCenters] = useState(INITIAL_CENTERS);
  const [students, setStudents] = useState(INITIAL_STUDENTS);
  const [staff, setStaff] = useState(INITIAL_STAFF);
  const [courses, setCourses] = useState(INITIAL_COURSES);
  const [lmsResources, setLmsResources] = useState(INITIAL_LMS_RESOURCES);
  const [assets, setAssets] = useState(INITIAL_ASSETS);
  const [alumni, setAlumni] = useState(INITIAL_ALUMNI);
  const [competitions, setCompetitions] = useState(INITIAL_COMPETITIONS);
  const [ledgers, setLedgers] = useState(INITIAL_LEDGERS);
  const [audits, setAudits] = useState(INITIAL_AUDITS);

  // Search & Filter workspace states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudentProfile, setSelectedStudentProfile] = useState<any>(null);
  const [selectedUsthadProfile, setSelectedUsthadProfile] = useState<any>(null);
  const [selectedCenterDetail, setSelectedCenterDetail] = useState<any>(null);
  
  // Interactive Tools state triggers
  const [showIdCard, setShowIdCard] = useState<any>(null);
  const [showReceipt, setShowReceipt] = useState<any>(null);
  const [assessmentScore, setAssessmentScore] = useState<number | null>(null);
  const [broadcastMessageText, setBroadcastMessageText] = useState("");
  const [broadcastTarget, setBroadcastTarget] = useState<'student' | 'staff' | 'affiliation'>('student');

  // New Record Forms states
  const [newStudentForm, setNewStudentForm] = useState({ name: "", parentName: "", parentPhone: "", centerId: "cnt_1", course: "Quran Hifz Foundation", balanceDue: 3000 });
  const [newStaffForm, setNewStaffForm] = useState({ name: "", role: "usthad", centerId: "cnt_1", designation: "Hifz Instructor", baseSalary: 18000 });
  const [newAssetForm, setNewAssetForm] = useState({ name: "", category: "Building", value: "", condition: "Excellent" });
  const [newAlumniForm, setNewAlumniForm] = useState({ name: "", centerName: "Delhi HQ", graduationYear: "2026", currentPosition: "Mudarris", employmentDetails: "", phone: "" });
  const [newCompetitionForm, setNewCompetitionForm] = useState({ title: "", date: "", venue: "", prizePool: "₹50,000" });

  // 1-minute shared inactivity lock simulator
  const [isLibraryVerifiedByAlim, setIsLibraryVerifiedByAlim] = useState(true);

  // Track user actions globally (Audit Trail)
  const addAuditLog = (action: string, details: string) => {
    const log = {
      id: `aud_${Date.now()}`,
      action,
      user: "Super Admin (Alim Board)",
      timestamp: new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      details
    };
    setAudits(prev => [log, ...prev]);
  };

  // Student admission execution handler
  const handleAdmitStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentForm.name || !newStudentForm.parentName) return;

    const studentId = `stud_${Date.now()}`;
    const code = `STUD-HIND-${Math.floor(100 + Math.random() * 900)}`;
    const center = centers.find(c => c.id === newStudentForm.centerId);
    
    const newStudent = {
      id: studentId,
      code,
      name: newStudentForm.name,
      centerId: newStudentForm.centerId,
      centerName: center ? center.branch : "HQ Branch",
      parentName: newStudentForm.parentName,
      parentPhone: newStudentForm.parentPhone,
      batchName: "Hifz Class A",
      course: newStudentForm.course,
      enrollmentDate: new Date().toISOString().split('T')[0],
      attendance: 100,
      balanceDue: Number(newStudentForm.balanceDue),
      score: 100,
      juzCompleted: 0,
      status: "Active"
    };

    setStudents(prev => [newStudent, ...prev]);
    
    // Automatically record fee invoice inside Billing Software module
    const newLedger = {
      id: `ld_${Date.now()}`,
      type: "INCOME" as const,
      accountHead: "Student Academic Tuition Fees",
      voucherNo: `VCH-${Date.now()}`,
      description: `Invoiced admission and tuition dues for new student ${newStudent.name} (${newStudent.code})`,
      amount: Number(newStudentForm.balanceDue),
      date: new Date().toISOString().split('T')[0]
    };
    setLedgers(prev => [newLedger, ...prev]);

    addAuditLog("STUDENT_REGISTERED", `Admitted new student ${newStudent.name} (${newStudent.code}) under branch ${newStudent.centerName}`);
    setNewStudentForm({ name: "", parentName: "", parentPhone: "", centerId: "cnt_1", course: "Quran Hifz Foundation", balanceDue: 3000 });
  };

  // Staff registration execution handler
  const handleRegisterStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffForm.name) return;

    const staffId = `staff_${Date.now()}`;
    const code = `STF-HIND-${Math.floor(100 + Math.random() * 900)}`;
    const center = centers.find(c => c.id === newStaffForm.centerId);

    const newStaff = {
      id: staffId,
      code,
      name: newStaffForm.name,
      role: newStaffForm.role,
      centerId: newStaffForm.centerId,
      centerName: center ? center.name : "Delhi HQ",
      department: newStaffForm.role === 'usthad' ? "Academic Management" : "Administration & Log",
      designation: newStaffForm.designation,
      attendance: 100,
      baseSalary: Number(newStaffForm.baseSalary),
      advanceTaken: 0,
      isPaid: false,
      phone: "+919555444321"
    };

    setStaff(prev => [newStaff, ...prev]);
    addAuditLog("STAFF_REGISTERED", `Registered new staff employee ${newStaff.name} as ${newStaff.designation}`);
    setNewStaffForm({ name: "", role: "usthad", centerId: "cnt_1", designation: "Hifz Instructor", baseSalary: 18000 });
  };

  // Asset logging handler
  const handleRegisterAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssetForm.name || !newAssetForm.value) return;

    const newAsset = {
      id: `ast_${Date.now()}`,
      centerId: "cnt_1",
      category: newAssetForm.category,
      name: newAssetForm.name,
      value: `₹${Number(newAssetForm.value).toLocaleString()}`,
      condition: newAssetForm.condition,
      trackingId: `AST-${newAssetForm.category.substring(0,3).toUpperCase()}-${Math.floor(10 + Math.random() * 90)}`
    };

    setAssets(prev => [newAsset, ...prev]);
    addAuditLog("ASSET_ADDED", `Logged new asset item: ${newAsset.name} tracking ID: ${newAsset.trackingId}`);
    setNewAssetForm({ name: "", category: "Building", value: "", condition: "Excellent" });
  };

  // Alumni registration handler
  const handleRegisterAlumni = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAlumniForm.name) return;

    const newAlum = {
      id: `alm_${Date.now()}`,
      name: newAlumniForm.name,
      centerName: newAlumniForm.centerName,
      graduationYear: newAlumniForm.graduationYear,
      currentPosition: newAlumniForm.currentPosition,
      employmentDetails: newAlumniForm.employmentDetails,
      phone: newAlumniForm.phone || "+919888777666"
    };

    setAlumni(prev => [newAlum, ...prev]);
    addAuditLog("ALUMNI_REGISTERED", `Registered new graduate ${newAlum.name} to the Suffath-ul alumni association directory.`);
    setNewAlumniForm({ name: "", centerName: "Delhi HQ", graduationYear: "2026", currentPosition: "Mudarris", employmentDetails: "", phone: "" });
  };

  // Competition registration handler
  const handleScheduleCompetition = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompetitionForm.title || !newCompetitionForm.date) return;

    const newComp = {
      id: `cmp_${Date.now()}`,
      title: newCompetitionForm.title,
      date: newCompetitionForm.date,
      venue: newCompetitionForm.venue || "Markaz Assembly Grounds",
      prizePool: newCompetitionForm.prizePool,
      status: "Upcoming" as const,
      winnerName: ""
    };

    setCompetitions(prev => [newComp, ...prev]);
    addAuditLog("COMPETITION_SCHEDULED", `Scheduled new competition event: ${newComp.title} for ${newComp.date}`);
    setNewCompetitionForm({ title: "", date: "", venue: "", prizePool: "₹50,000" });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col selection:bg-teal-500/30 selection:text-teal-200">
      
      {/* Top Header Navigation Panel */}
      <header className="bg-slate-900 border-b border-slate-800 p-4 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-teal-500 flex items-center justify-center font-black text-slate-950 shadow-md shadow-teal-500/20">
              SF
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-white tracking-tight flex items-center gap-2" style={{ fontFamily: '"Arial Black", Gadget, sans-serif' }}>
                SUFFATH-UL HUFFAZ : AL-HIND
              </h1>
              <p className="text-[10px] text-teal-400 font-bold tracking-widest uppercase">National Alliance of Qur'anic Academies ERP</p>
            </div>
          </div>

          {/* Module Nav Toggler */}
          <div className="flex flex-wrap gap-1.5 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
            {[
              { id: 'erp', name: 'ERP Software', icon: Layers },
              { id: 'lms', name: 'LMS Program', icon: BookOpen },
              { id: 'billing', name: 'Billing Portal', icon: CreditCard },
              { id: 'accounting', name: 'HQ Accounting', icon: DollarSign },
              { id: 'assets', name: 'Asset Registry', icon: Tool },
              { id: 'alumni', name: 'Alumni Registry', icon: Users },
              { id: 'competitions', name: 'Competition Desk', icon: Award },
              { id: 'affiliation', name: 'Affiliation Hub', icon: ShieldCheck },
              { id: 'communication', name: 'Comm Center', icon: MessageSquare },
              { id: 'reports', name: 'Analytics Reports', icon: FileText },
              { id: 'security', name: 'Admin Security', icon: Database }
            ].map(mod => {
              const Icon = mod.icon;
              return (
                <button
                  key={mod.id}
                  onClick={() => { setActiveModule(mod.id as any); setSearchQuery(""); setSelectedStudentProfile(null); setSelectedUsthadProfile(null); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${activeModule === mod.id ? 'bg-teal-500 text-slate-950 shadow-sm font-black' : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900'}`}
                >
                  <Icon className="h-3.5 w-3.5" /> {mod.name}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main App Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">
        
        {/* =============================================================================
            MODULE 1: INSTITUTION ERP (categorised: Institution, Student, Staff, Academics)
            ============================================================================= */}
        {activeModule === 'erp' && (
          <div className="space-y-6">
            {/* Sub-tab navigation */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-xl font-extrabold text-white">Institution ERP Module</h2>
                <p className="text-xs text-slate-400">Comprehensive management of centers, academic, staff and student registers</p>
              </div>
              
              <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800">
                {[
                  { id: 'institution', name: 'Institution Management' },
                  { id: 'student', name: 'Student Management' },
                  { id: 'staff', name: 'Staff Management' },
                  { id: 'academics', name: 'Academic Management' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => { setErpSubTab(tab.id as any); setSelectedStudentProfile(null); setSelectedUsthadProfile(null); }}
                    className={`px-3.5 py-1 rounded-md text-xs font-bold transition ${erpSubTab === tab.id ? 'bg-teal-500 text-slate-950 font-black' : 'text-slate-400 hover:text-slate-100'}`}
                  >
                    {tab.name}
                  </button>
                ))}
              </div>
            </div>

            {/* ERP SUBTAB 1: INSTITUTION MANAGEMENT */}
            {erpSubTab === 'institution' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
                
                {/* List of centers */}
                <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h3 className="font-bold text-white text-sm">National Qur'anic Academy Network</h3>
                    <span className="text-xs bg-teal-500/10 text-teal-400 px-2 py-0.5 rounded font-black">{centers.length} Centers</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {centers.map(center => (
                      <div 
                        key={center.id}
                        onClick={() => setSelectedCenterDetail(center)}
                        className={`p-4 rounded-xl border cursor-pointer transition flex flex-col justify-between ${selectedCenterDetail?.id === center.id ? 'border-teal-500 bg-teal-500/5' : 'border-slate-850 bg-slate-950/40 hover:border-slate-700'}`}
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono font-bold bg-slate-900 text-slate-300 px-1.5 py-0.5 rounded">{center.code}</span>
                            <span className={`text-[9px] font-bold px-1.5 rounded uppercase ${center.affiliationStatus === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                              {center.affiliationStatus}
                            </span>
                          </div>
                          <h4 className="font-bold text-white text-sm truncate">{center.name}</h4>
                          <p className="text-xs text-slate-400">Regional Zone: {center.branch}</p>
                        </div>
                        
                        <div className="flex items-center justify-between border-t border-slate-900 mt-4 pt-2 text-xs">
                          <span className="text-slate-500 font-bold">Overall Grade:</span>
                          <span className="text-teal-400 font-extrabold">{center.rating}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Branch details & statistics */}
                <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
                  <h3 className="font-bold text-white text-sm border-b border-slate-800 pb-3 flex items-center gap-1.5">
                    <Activity className="h-4 w-4 text-teal-400" /> Center Performance Overview
                  </h3>

                  {selectedCenterDetail ? (
                    <div className="space-y-4 animate-fadeIn">
                      <div className="text-center bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-1">
                        <span className="text-[10px] text-slate-400 font-bold tracking-widest block uppercase">{selectedCenterDetail.code}</span>
                        <strong className="text-white text-base block">{selectedCenterDetail.name}</strong>
                        <span className="text-xs text-teal-400 font-bold">Global Rank Index: #{selectedCenterDetail.id === 'cnt_1' ? '1' : selectedCenterDetail.id === 'cnt_2' ? '2' : '3'}</span>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between p-2.5 bg-slate-950 rounded border border-slate-850">
                          <span className="text-slate-400">Total Students Registered:</span>
                          <span className="font-bold text-slate-200">{students.filter(s => s.centerId === selectedCenterDetail.id).length} Active</span>
                        </div>
                        <div className="flex justify-between p-2.5 bg-slate-950 rounded border border-slate-850">
                          <span className="text-slate-400">Total Staff Employed:</span>
                          <span className="font-bold text-slate-200">{staff.filter(st => st.centerId === selectedCenterDetail.id).length} Active</span>
                        </div>
                        <div className="flex justify-between p-2.5 bg-slate-950 rounded border border-slate-850">
                          <span className="text-slate-400">Operating Base Rating:</span>
                          <span className="font-bold text-teal-400">{selectedCenterDetail.rating}/100</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 text-center bg-slate-950/40 border border-slate-850 rounded-xl text-slate-500 text-xs space-y-2">
                      <Building className="h-8 w-8 text-slate-700 mx-auto" />
                      <p>Select any branch center from the list directory to inspect real-time staff rosters, student registers and performance grading.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ERP SUBTAB 2: STUDENT MANAGEMENT */}
            {erpSubTab === 'student' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
                
                {/* Search & Student registration form */}
                <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5 shadow-xl">
                  <div>
                    <h3 className="font-bold text-white text-sm">Admit New Qur'anic Scholar</h3>
                    <p className="text-xs text-slate-400">Register new student profiles into Suffath Multi-tenant ERP database</p>
                  </div>

                  <form onSubmit={handleAdmitStudent} className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Student Full Name</label>
                      <input 
                        type="text"
                        value={newStudentForm.name}
                        onChange={(e) => setNewStudentForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g. Hafiz Hamza"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500 text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Guardian / Father Name</label>
                      <input 
                        type="text"
                        value={newStudentForm.parentName}
                        onChange={(e) => setNewStudentForm(prev => ({ ...prev, parentName: e.target.value }))}
                        placeholder="e.g. Tariq Mehmood"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500 text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Guardian WhatsApp Number</label>
                      <input 
                        type="text"
                        value={newStudentForm.parentPhone}
                        onChange={(e) => setNewStudentForm(prev => ({ ...prev, parentPhone: e.target.value }))}
                        placeholder="e.g. +919876543210"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500 text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Affiliated Center</label>
                      <select 
                        value={newStudentForm.centerId}
                        onChange={(e) => setNewStudentForm(prev => ({ ...prev, centerId: e.target.value }))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-white focus:outline-none"
                      >
                        {centers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Admission Tuition Fee (INR)</label>
                      <input 
                        type="number"
                        value={newStudentForm.balanceDue}
                        onChange={(e) => setNewStudentForm(prev => ({ ...prev, balanceDue: Number(e.target.value) }))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500 text-white"
                      />
                    </div>

                    <button 
                      type="submit"
                      className="w-full bg-teal-500 hover:bg-teal-600 text-slate-950 font-black py-2.5 rounded-xl text-xs transition shadow-md shadow-teal-500/10"
                    >
                      Authorize Admission Entry
                    </button>
                  </form>
                </div>

                {/* Student Directory Grid */}
                <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                    <h3 className="font-bold text-white text-sm">Active Student Registry</h3>
                    
                    <div className="relative">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                      <input 
                        type="text"
                        placeholder="Search student or code..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[350px] overflow-y-auto pr-1">
                    {students.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.code.toLowerCase().includes(searchQuery.toLowerCase())).map(student => (
                      <div 
                        key={student.id}
                        onClick={() => setSelectedStudentProfile(student)}
                        className={`p-3.5 rounded-xl border cursor-pointer transition flex items-center justify-between ${selectedStudentProfile?.id === student.id ? 'border-teal-500 bg-teal-500/5' : 'border-slate-850 bg-slate-950/40 hover:border-slate-800'}`}
                      >
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] font-bold font-mono bg-slate-800 text-slate-300 px-1 rounded uppercase">{student.code}</span>
                            <span className="text-[9px] font-bold bg-teal-500/10 text-teal-400 px-1 rounded">{student.centerName}</span>
                          </div>
                          <h4 className="font-bold text-white text-sm truncate">{student.name}</h4>
                          <p className="text-[11px] text-slate-400">Course: {student.course}</p>
                        </div>

                        <div className="text-right pl-2 flex flex-col items-end gap-1.5">
                          <span className="text-xs font-black text-emerald-400">Juz {student.juzCompleted}/30</span>
                          <div className="flex gap-1">
                            <button 
                              onClick={(e) => { e.stopPropagation(); setShowIdCard(student); }}
                              className="bg-slate-800 hover:bg-slate-700 p-1.5 rounded text-teal-400" title="Generate ID Card"
                            >
                              <Printer className="h-3 w-3" />
                            </button>
                            <button 
                              onClick={(e) => { e.stopPropagation(); setStudents(prev => prev.filter(s => s.id !== student.id)); addAuditLog("STUDENT_DELETED", `Deleted student record ${student.name} (${student.code})`); }}
                              className="bg-slate-800 hover:bg-slate-700 p-1.5 rounded text-rose-400" title="Issue Transfer Certificate"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ERP SUBTAB 3: STAFF MANAGEMENT */}
            {erpSubTab === 'staff' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
                
                {/* Staff onboarding form */}
                <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5 shadow-xl">
                  <div>
                    <h3 className="font-bold text-white text-sm">Onboard Staff Employee</h3>
                    <p className="text-xs text-slate-400">Record details, department and designations</p>
                  </div>

                  <form onSubmit={handleRegisterStaff} className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase block">Employee Full Name</label>
                      <input 
                        type="text"
                        value={newStaffForm.name}
                        onChange={(e) => setNewStaffForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g. Usthad Anas Qasimi"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500 text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase block">Corporate Role</label>
                      <select 
                        value={newStaffForm.role}
                        onChange={(e) => setNewStaffForm(prev => ({ ...prev, role: e.target.value, designation: e.target.value === 'usthad' ? 'Hifz Instructor' : 'General Administrator' }))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-white focus:outline-none"
                      >
                        <option value="usthad">Usthad (Academic Instructor)</option>
                        <option value="nazim">Nazim (Branch Admin)</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase block">Designation title</label>
                      <input 
                        type="text"
                        value={newStaffForm.designation}
                        onChange={(e) => setNewStaffForm(prev => ({ ...prev, designation: e.target.value }))}
                        placeholder="e.g. Chief Quran Reciter"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500 text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase block">Basic Contract Salary (INR)</label>
                      <input 
                        type="number"
                        value={newStaffForm.baseSalary}
                        onChange={(e) => setNewStaffForm(prev => ({ ...prev, baseSalary: Number(e.target.value) }))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500 text-white"
                      />
                    </div>

                    <button 
                      type="submit"
                      className="w-full bg-teal-500 hover:bg-teal-600 text-slate-950 font-black py-2.5 rounded-xl text-xs transition shadow-md shadow-teal-500/10"
                    >
                      Confirm Onboarding Contract
                    </button>
                  </form>
                </div>

                {/* Staff list view */}
                <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
                  <h3 className="font-bold text-white text-sm border-b border-slate-800 pb-3">Onboarded Personnel Directory</h3>
                  <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
                    {staff.map(member => (
                      <div key={member.id} className="bg-slate-950/40 border border-slate-850 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] font-mono bg-slate-800 text-slate-300 font-bold px-1.5 py-0.5 rounded uppercase">{member.code}</span>
                            <span className="text-[9px] bg-teal-500/10 text-teal-400 font-bold px-1.5 py-0.5 rounded uppercase">{member.role}</span>
                          </div>
                          <h4 className="font-bold text-white text-sm">{member.name}</h4>
                          <p className="text-[11px] text-slate-400">Dept: {member.department} | Post: {member.designation}</p>
                        </div>
                        
                        <div className="text-right flex items-center gap-4">
                          <div>
                            <span className="text-xs text-slate-500 block font-semibold">Monthly Salary</span>
                            <span className="text-xs font-black text-teal-400">₹{member.baseSalary}</span>
                          </div>
                          <button 
                            onClick={() => { setSelectedUsthadProfile(member); alert(`Selected ${member.name} for Duty Assignment`); }}
                            className="bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs px-3 py-1.5 rounded-lg border border-slate-700 transition"
                          >
                            Duty Assign
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ERP SUBTAB 4: ACADEMIC MANAGEMENT */}
            {erpSubTab === 'academics' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
                
                {/* Syllabus and Courses */}
                <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
                  <h3 className="font-bold text-white text-sm border-b border-slate-800 pb-3">Registered Academic Courses</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {courses.map(crs => (
                      <div key={crs.id} className="bg-slate-950/60 border border-slate-850 p-4 rounded-xl space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] bg-indigo-500/15 text-indigo-400 font-mono font-bold px-1.5 py-0.5 rounded">{crs.code}</span>
                          <span className="text-[10px] text-slate-500 font-bold">Duration: {crs.duration}</span>
                        </div>
                        <h4 className="font-black text-white text-sm leading-snug">{crs.name}</h4>
                        <p className="text-xs text-slate-400 border-t border-slate-900 pt-2"><strong>Syllabus Focus:</strong> {crs.syllabus}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Calendar / Events logs */}
                <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
                  <h3 className="font-bold text-white text-sm border-b border-slate-800 pb-3 flex items-center gap-1.5">
                    <Calendar className="h-4.5 w-4.5 text-teal-400" /> Academic Calendar Events
                  </h3>
                  
                  <div className="space-y-3">
                    {[
                      { date: "2026-08-20", title: "Syllabus Revision Auditing Session", desc: "Verification session with the Alim Committee regarding Hifz levels" },
                      { date: "2026-09-01", title: "First Term Internal Assessments", desc: "Comprehensive Tajweed recitation assessments across all centers" }
                    ].map((cal, i) => (
                      <div key={i} className="bg-slate-950 p-3 rounded-lg border border-slate-850 text-xs space-y-1.5">
                        <span className="text-teal-400 font-bold block">{cal.date}</span>
                        <strong className="text-white block font-black">{cal.title}</strong>
                        <p className="text-slate-400 leading-normal">{cal.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* =============================================================================
            MODULE 2: LEARNING MANAGEMENT SYSTEM (LMS)
            ============================================================================= */}
        {activeModule === 'lms' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
            
            {/* Study material and assessment controller */}
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5 shadow-xl">
              <div>
                <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                  <BookOpen className="h-6 w-6 text-teal-400" />
                  Digital LMS Portal & Course Library
                </h2>
                <p className="text-xs text-slate-400">Access video classes, download study materials, and take verified online Assessments</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-800 pt-4">
                {lmsResources.map(res => (
                  <div key={res.id} className="bg-slate-950 border border-slate-850 p-4 rounded-xl flex flex-col justify-between h-[150px]">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[9px] bg-teal-500/10 text-teal-400 font-bold px-1.5 py-0.5 rounded uppercase">{res.fileType}</span>
                        <span className="text-[10px] text-slate-500">By {res.author}</span>
                      </div>
                      <h4 className="font-bold text-white text-sm leading-snug line-clamp-2">{res.title}</h4>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-900 pt-2">
                      <span className="text-[10px] text-slate-500">Downloads: {res.downloadCount}</span>
                      <button 
                        onClick={() => {
                          setLmsResources(prev => prev.map(r => r.id === res.id ? { ...r, downloadCount: r.downloadCount + 1 } : r));
                          alert(`📥 Initiated download for: ${res.title}. Action logged in student audit logs.`);
                        }}
                        className="bg-slate-900 hover:bg-slate-800 text-teal-400 text-xs px-3 py-1 rounded border border-slate-800 flex items-center gap-1 transition"
                      >
                        <Download className="h-3 w-3" /> Download
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quizzes & Assessments */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-850 space-y-4">
                <div>
                  <h3 className="font-bold text-white text-sm flex items-center gap-1.5">
                    <Medal className="h-4 w-4 text-amber-400" /> Daily Hifz Assessment / Quiz Terminal
                  </h3>
                  <p className="text-xs text-slate-400">Test student's comprehension of Tajweed rules and basic articulation definitions.</p>
                </div>

                <div className="space-y-3.5 bg-slate-900/50 p-4 rounded-xl border border-slate-800 text-xs">
                  <strong className="text-slate-200 text-sm block">Q1: What is the correct articulation point (Makhraj) for the letter 'Qaf' (ق)?</strong>
                  <div className="space-y-2 text-slate-300">
                    {[
                      { key: 'A', text: "The tip of the tongue touching the roots of upper front teeth" },
                      { key: 'B', text: "The extreme back of the tongue touching the upper soft palate (Correct Answer)" },
                      { key: 'C', text: "The bottom lips touching the edges of the upper front teeth" }
                    ].map(opt => (
                      <label key={opt.key} className="flex items-center gap-2 bg-slate-950 p-2.5 rounded-lg border border-slate-850 hover:border-teal-500/30 cursor-pointer">
                        <input 
                          type="radio" 
                          name="q1" 
                          onChange={() => setAssessmentScore(opt.key === 'B' ? 100 : 0)}
                          className="accent-teal-500"
                        />
                        <span><strong>{opt.key}:</strong> {opt.text}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {assessmentScore !== null && (
                  <div className={`p-4 rounded-xl text-center border font-bold text-xs animate-fadeIn ${assessmentScore === 100 ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/5 border-rose-500/20 text-rose-400'}`}>
                    {assessmentScore === 100 ? "🎉 CORRECT ANSWER! You scored 100% on the Tajweed assessment terminal." : "❌ INCORRECT ANSWER! Please revise makhraj properties in your Study materials and retry."}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar Certificate module */}
            <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
              <h3 className="font-bold text-white text-sm border-b border-slate-800 pb-3 flex items-center gap-1.5">
                <Award className="h-4.5 w-4.5 text-teal-400" /> Certifications & Progress Tracking
              </h3>

              <div className="space-y-3">
                {students.map(stud => (
                  <div key={stud.id} className="bg-slate-950 p-3.5 rounded-xl border border-slate-850 space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <strong className="text-white font-black truncate max-w-[130px]">{stud.name}</strong>
                      <span className="text-[10px] text-teal-400 font-bold">Juz memorized: {stud.juzCompleted}/30</span>
                    </div>
                    <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-teal-500 h-1.5 rounded-full" style={{ width: `${Math.round((stud.juzCompleted/30)*100)}%` }}></div>
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-slate-500">
                      <span>Progress: {Math.round((stud.juzCompleted/30)*100)}%</span>
                      <button 
                        onClick={() => {
                          if (stud.juzCompleted < 10) {
                            alert("⚠️ Certificate Lock! Students must complete at least 10 Juz before any Hifz milestone certificate can be printed.");
                          } else {
                            alert(`📜 Printing certified Hifz Graduation certificate for ${stud.name}! Verified by Alim Committee.`);
                          }
                        }}
                        className="text-teal-400 hover:underline flex items-center gap-0.5"
                      >
                        <Printer className="h-3 w-3" /> Print Certificate
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* =============================================================================
            MODULE 3: BILLING & FINANCE SOFTWARE (Receipt Generation, Due management)
            ============================================================================= */}
        {activeModule === 'billing' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                  <CreditCard className="h-6 w-6 text-teal-400" />
                  Billing & Finance Management
                </h2>
                <p className="text-xs text-slate-400">Receipt generation, due tracking, cash book registries, and fee collection sheets</p>
              </div>
              
              <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800">
                {[
                  { id: 'receipts', name: 'Receipt Generation' },
                  { id: 'multi_fees', name: 'Fee Categories' },
                  { id: 'dues', name: 'Dues Management' },
                  { id: 'ledgers', name: 'Cash Book Registry' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setBillingSubTab(tab.id as any)}
                    className={`px-3 py-1 rounded-md text-xs font-bold transition ${billingSubTab === tab.id ? 'bg-teal-500 text-slate-950 font-black' : 'text-slate-400 hover:text-slate-100'}`}
                  >
                    {tab.name}
                  </button>
                ))}
              </div>
            </div>

            {/* SUBTAB 3A: RECEIPT GENERATION */}
            {billingSubTab === 'receipts' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
                <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
                  <h3 className="font-bold text-white text-sm border-b border-slate-800 pb-3">Recent Financial Transactions</h3>
                  <div className="space-y-3.5 max-h-[350px] overflow-y-auto pr-1">
                    {students.map(student => (
                      <div key={student.id} className="bg-slate-950/60 p-4 rounded-xl border border-slate-850 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <span className="text-[9px] bg-slate-800 text-slate-300 font-mono font-bold px-1.5 py-0.5 rounded">{student.code}</span>
                          <h4 className="font-bold text-white text-sm">{student.name}</h4>
                          <p className="text-xs text-slate-400">Center: {student.centerName} | Parent: {student.parentName}</p>
                        </div>

                        <div className="text-right flex items-center gap-4">
                          <div>
                            <span className="text-xs text-slate-500 block font-semibold">Dues Balance</span>
                            <span className={`text-xs font-black block ${student.balanceDue > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                              ₹{student.balanceDue}
                            </span>
                          </div>
                          <button 
                            onClick={() => setShowReceipt(student)}
                            className="bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs px-3 py-1.5 rounded border border-slate-700 flex items-center gap-1.5 transition"
                          >
                            <Printer className="h-3.5 w-3.5" /> Print Receipt
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
                  <h3 className="font-bold text-white text-sm border-b border-slate-800 pb-3 flex items-center gap-1.5">
                    <Printer className="h-4.5 w-4.5 text-teal-400" /> Printable Invoice Desk
                  </h3>

                  {showReceipt ? ( 
                    <div className="bg-white text-slate-900 p-5 rounded-xl space-y-4 border border-slate-300 shadow-2xl animate-scaleIn text-xs font-mono">
                      <div className="text-center border-b border-dashed border-slate-400 pb-3 space-y-1">
                        <strong className="text-slate-950 text-sm block" style={{ fontFamily: '"Arial Black", Gadget, sans-serif' }}>SUFFATH-UL HUFFAZ : AL-HIND</strong>
                        <span className="text-[10px] text-slate-600 block">Fee Receipt & receipt Voucher</span>
                        <span className="text-[9px] text-slate-500 block">Date: {new Date().toLocaleDateString()}</span>
                      </div>

                      <div className="space-y-1.5 text-slate-800">
                        <p><strong>Receipt No:</strong> RCP-{Math.floor(100000 + Math.random() * 900000)}</p>
                        <p><strong>Student Name:</strong> {showReceipt.name}</p>
                        <p><strong>Roster ID:</strong> {showReceipt.code}</p>
                        <p><strong>Center Branch:</strong> {showReceipt.centerName}</p>
                      </div>

                      <div className="border-t border-b border-dashed border-slate-400 py-2.5 text-slate-900">
                        <div className="flex justify-between font-bold">
                          <span>Fee category description</span>
                          <span>Amount</span>
                        </div>
                        <div className="flex justify-between text-slate-700 mt-1">
                          <span>Academic Admission and Tuition</span>
                          <span>₹{showReceipt.balanceDue > 0 ? showReceipt.balanceDue : 2500}</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center font-black text-slate-950">
                        <span>NET AMOUNT:</span>
                        <span>₹{showReceipt.balanceDue > 0 ? showReceipt.balanceDue : 2500}</span>
                      </div>

                      <button 
                        onClick={() => {
                          // Process payment mapping
                          setStudents(prev => prev.map(s => s.id === showReceipt.id ? { ...s, balanceDue: 0 } : s));
                          alert(`✅ Receipt Printed! Payment processed successfully for student ${showReceipt.name}. Ledger balances synchronized.`);
                          setShowReceipt(null);
                        }}
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 rounded text-xs transition border border-slate-800"
                      >
                        Print & clear Balance Dues
                      </button>
                    </div>
                  ) : (
                    <div className="p-8 text-center bg-slate-950/40 border border-slate-850 rounded-xl text-slate-500 text-xs space-y-2">
                      <Printer className="h-8 w-8 text-slate-700 mx-auto" />
                      <p>Select any student record and click "Print Receipt" to draft a complete, printer-ready financial voucher.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SUBTAB 3B: MULTIPLE FEE CATEGORIES */}
            {billingSubTab === 'multi_fees' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeIn">
                {[
                  { title: "Admission & Register Fee", amount: "₹2,500", desc: "Mandatory one-time registration dues applied upon academic onboarding." },
                  { title: "Monthly Hostel Tuition", amount: "₹3,000 / mo", desc: "Covers residential facilities, dorm maintenance, and academic courses." },
                  { title: "Kitchen & Dining Fee", amount: "₹1,500 / mo", desc: "Covers meal preps and store room kitchen logistics managed by Nazims." }
                ].map((fee, idx) => (
                  <div key={idx} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3 shadow-xl">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                      <strong className="text-white text-sm">{fee.title}</strong>
                      <span className="text-xs font-black text-teal-400">{fee.amount}</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-normal">{fee.desc}</p>
                  </div>
                ))}
              </div>
            )}

            {/* SUBTAB 3C: DUES MANAGEMENT */}
            {billingSubTab === 'dues' && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl animate-fadeIn">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <h3 className="font-bold text-white text-sm">Outstanding Student Balance Ledger</h3>
                  <span className="text-xs text-rose-400 font-extrabold bg-rose-500/5 border border-rose-500/20 px-2.5 py-0.5 rounded">
                    Consolidated Dues Owed: ₹{students.reduce((acc, s) => acc + s.balanceDue, 0).toLocaleString()}
                  </span>
                </div>

                <div className="space-y-3">
                  {students.filter(s => s.balanceDue > 0).map(student => (
                    <div key={student.id} className="bg-slate-950 p-4 rounded-xl border border-slate-850 flex justify-between items-center">
                      <div>
                        <h4 className="text-xs font-bold text-slate-200">{student.name} ({student.code})</h4>
                        <p className="text-[11px] text-slate-400">Center: {student.centerName} | Parent: {student.parentPhone}</p>
                      </div>
                      <div className="text-right flex items-center gap-4">
                        <div>
                          <span className="text-[10px] text-slate-500 block">Dues Outstanding</span>
                          <span className="text-xs font-black text-rose-400">₹{student.balanceDue}</span>
                        </div>
                        <button 
                          onClick={() => {
                            setStudents(prev => prev.map(s => s.id === student.id ? { ...s, balanceDue: 0 } : s));
                            alert(`✅ Cleared dues for ${student.name}. WhatsApp alert sent to ${student.parentPhone}.`);
                          }}
                          className="bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 text-xs px-3.5 py-1.5 rounded-lg transition"
                        >
                          Clear Balance
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SUBTAB 3D: CASH BOOK REGISTRY */}
            {billingSubTab === 'ledgers' && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl animate-fadeIn">
                <h3 className="font-bold text-white text-sm border-b border-slate-800 pb-3">Consolidated Cash Book Transactions</h3>
                <div className="space-y-3">
                  {ledgers.map(ld => (
                    <div key={ld.id} className="bg-slate-950 p-4 rounded-xl border border-slate-850 flex justify-between items-center">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${ld.type === 'INCOME' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>{ld.type}</span>
                          <span className="text-[10px] text-slate-400">{ld.voucherNo} | {ld.date}</span>
                        </div>
                        <strong className="text-white text-xs block">{ld.accountHead}</strong>
                        <p className="text-[11px] text-slate-500">{ld.description}</p>
                      </div>
                      <span className={`text-sm font-black ${ld.type === 'INCOME' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {ld.type === 'INCOME' ? '+' : '-'}₹{ld.amount}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* =============================================================================
            MODULE 4: ACCOUNTING & FINANCE (Ledgers, vouchers, financial reports)
            ============================================================================= */}
        {activeModule === 'accounting' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
            
            {/* Account ledger and charts */}
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5 shadow-xl">
              <div>
                <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                  <DollarSign className="h-6 w-6 text-emerald-400" />
                  General Ledger Accounting & Vouchers
                </h2>
                <p className="text-xs text-slate-400">Record expenditures, audit bank vouchers, and print monthly financial reports</p>
              </div>

              {/* Ledger chart */}
              <div className="h-64 bg-slate-950 p-4 rounded-xl border border-slate-850">
                <span className="text-xs text-slate-400 font-bold block mb-4">Income vs Expenditure Trends (Delhi HQ)</span>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { month: "Jun", Income: 120000, Expense: 42000 },
                    { month: "Jul", Income: 140000, Expense: 48000 },
                    { month: "Aug", Income: 152000, Expense: 68500 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="month" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff' }} />
                    <Legend />
                    <Bar dataKey="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Quick Ledger creation sidebar */}
            <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
              <h3 className="font-bold text-white text-sm border-b border-slate-800 pb-3 flex items-center gap-1.5">
                <Database className="h-4 w-4 text-emerald-400" /> File Account Voucher
              </h3>

              <button 
                onClick={() => {
                  const newLedger = {
                    id: `ld_${Date.now()}`,
                    type: 'EXPENSE' as const,
                    accountHead: "Facility Electricity Bills",
                    voucherNo: `VCH-${Date.now()}`,
                    description: "Paid electricity bills for Markaz dormitory block A",
                    amount: 6200,
                    date: new Date().toISOString().split('T')[0]
                  };
                  setLedgers(prev => [newLedger, ...prev]);
                  addAuditLog("ACCOUNT_VOUCHER_FILED", "Filed facility electricity bill expense voucher (₹6,200)");
                  alert("✅ Expense Voucher VCH recorded and indexed under General ledger accounts successfully.");
                }}
                className="w-full bg-slate-950 border border-slate-850 hover:border-emerald-500/30 p-4 rounded-xl flex items-center justify-between text-left transition"
              >
                <div>
                  <strong className="text-white text-xs block">Electricity Bill Payment</strong>
                  <span className="text-[10px] text-slate-500">Delhi HQ Block A - ₹6,200</span>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-500" />
              </button>

              <button 
                onClick={() => {
                  const newLedger = {
                    id: `ld_${Date.now()}`,
                    type: 'INCOME' as const,
                    accountHead: "Masjid General Donations",
                    voucherNo: `VCH-${Date.now()}`,
                    description: "Recieved general welfare donations from private trustee",
                    amount: 25000,
                    date: new Date().toISOString().split('T')[0]
                  };
                  setLedgers(prev => [newLedger, ...prev]);
                  addAuditLog("ACCOUNT_VOUCHER_FILED", "Filed Masjid general donations income voucher (₹25,000)");
                  alert("✅ Income Voucher recorded under Masjid welfare ledger fund.");
                }}
                className="w-full bg-slate-950 border border-slate-850 hover:border-emerald-500/30 p-4 rounded-xl flex items-center justify-between text-left transition"
              >
                <div>
                  <strong className="text-white text-xs block">Welfare Donation Voucher</strong>
                  <span className="text-[10px] text-slate-500">Private Trustee Fund - ₹25,000</span>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-500" />
              </button>
            </div>
          </div>
        )}

        {/* =============================================================================
            MODULE 5: ASSET MANAGEMENT (Building, land, vehicle details)
            ============================================================================= */}
        {activeModule === 'assets' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
            
            {/* Asset registry list */}
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
              <h3 className="font-bold text-white text-sm border-b border-slate-800 pb-3">Institutional Assets & Infrastructure Register</h3>
              <div className="space-y-3">
                {assets.map(ast => (
                  <div key={ast.id} className="bg-slate-950 p-4 rounded-xl border border-slate-850 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono font-bold">{ast.trackingId}</span>
                        <span className="text-[9px] bg-teal-500/10 text-teal-400 px-2 py-0.5 rounded font-bold uppercase">{ast.category}</span>
                      </div>
                      <strong className="text-white text-sm block">{ast.name}</strong>
                      <span className="text-xs text-slate-500">Condition Status: <strong className="text-teal-400">{ast.condition}</strong></span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-slate-500 block">Valuation Estimate</span>
                      <span className="text-sm font-black text-teal-400">{ast.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Asset logging form */}
            <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
              <div>
                <h3 className="font-bold text-white text-sm">Log Physical Asset</h3>
                <p className="text-xs text-slate-400">Record building, land or vehicle investments</p>
              </div>

              <form onSubmit={handleRegisterAsset} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Asset Name / title</label>
                  <input 
                    type="text"
                    value={newAssetForm.name}
                    onChange={(e) => setNewAssetForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. Hostel Library Annex"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Category Class</label>
                  <select 
                    value={newAssetForm.category}
                    onChange={(e) => setNewAssetForm(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-white focus:outline-none"
                  >
                    <option value="Building">Building & Structures</option>
                    <option value="Land">Land Property Details</option>
                    <option value="Vehicle">Institutional Vehicle</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Estimated Valuation (INR)</label>
                  <input 
                    type="number"
                    value={newAssetForm.value}
                    onChange={(e) => setNewAssetForm(prev => ({ ...prev, value: e.target.value }))}
                    placeholder="e.g. 1500000"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full bg-teal-500 hover:bg-teal-600 text-slate-950 font-black py-2.5 rounded-xl text-xs transition"
                >
                  Confirm Asset Ledger Log
                </button>
              </form>
            </div>
          </div>
        )}

        {/* =============================================================================
            MODULE 6: ALUMNI MANAGEMENT (Alumni Directory, Institution wise alumni)
            ============================================================================= */}
        {activeModule === 'alumni' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
            
            {/* Alumni directory list */}
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
              <h3 className="font-bold text-white text-sm border-b border-slate-800 pb-3">Qur'anic Graduates Alumni Directory</h3>
              <div className="space-y-3">
                {alumni.map(alm => (
                  <div key={alm.id} className="bg-slate-950 p-4 rounded-xl border border-slate-850 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono font-bold">Grad Year: {alm.graduationYear}</span>
                        <span className="text-[9px] bg-teal-500/10 text-teal-400 px-2 py-0.5 rounded font-bold uppercase">{alm.centerName}</span>
                      </div>
                      <strong className="text-white text-sm block">{alm.name}</strong>
                      <span className="text-xs text-slate-500">Current Engagement: <strong className="text-teal-400">{alm.currentPosition} at {alm.employmentDetails}</strong></span>
                    </div>
                    <span className="text-xs text-slate-400 font-mono">Verify: {alm.phone}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Alumni registration form */}
            <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
              <div>
                <h3 className="font-bold text-white text-sm">Register Graduating Alumnus</h3>
                <p className="text-xs text-slate-400">Enroll past students into the National Directory</p>
              </div>

              <form onSubmit={handleRegisterAlumni} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase block">Graduate Name</label>
                  <input 
                    type="text"
                    value={newAlumniForm.name}
                    onChange={(e) => setNewAlumniForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. Hafiz Sajid"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase block">Graduation Year</label>
                  <input 
                    type="text"
                    value={newAlumniForm.graduationYear}
                    onChange={(e) => setNewAlumniForm(prev => ({ ...prev, graduationYear: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase block">Current Designation Position</label>
                  <input 
                    type="text"
                    value={newAlumniForm.currentPosition}
                    onChange={(e) => setNewAlumniForm(prev => ({ ...prev, currentPosition: e.target.value }))}
                    placeholder="e.g. Chief Reciter / Imam"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase block">Employment Details</label>
                  <input 
                    type="text"
                    value={newAlumniForm.employmentDetails}
                    onChange={(e) => setNewAlumniForm(prev => ({ ...prev, employmentDetails: e.target.value }))}
                    placeholder="e.g. Islamic Center of Delhi"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full bg-teal-500 hover:bg-teal-600 text-slate-950 font-black py-2.5 rounded-xl text-xs transition"
                >
                  Confirm Alumni Registration
                </button>
              </form>
            </div>
          </div>
        )}

        {/* =============================================================================
            MODULE 7: COMPETITION MANAGEMENT (Calendar, judgment details, winner list)
            ============================================================================= */}
        {activeModule === 'competitions' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
            
            {/* Competitions schedules list */}
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
              <h3 className="font-bold text-white text-sm border-b border-slate-800 pb-3">Qur'an Recitation & Qira'at Competitions</h3>
              <div className="space-y-3">
                {competitions.map(cmp => (
                  <div key={cmp.id} className="bg-slate-950 p-4 rounded-xl border border-slate-850 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono font-bold">{cmp.date}</span>
                        <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${cmp.status === 'Upcoming' ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'}`}>{cmp.status}</span>
                      </div>
                      <strong className="text-white text-sm block">{cmp.title}</strong>
                      <p className="text-xs text-slate-400">Venue: {cmp.venue} | Prize Pool: <strong className="text-teal-400">{cmp.prizePool}</strong></p>
                      {cmp.winnerName && (
                        <span className="text-xs text-emerald-400 block font-black">🏆 Winner: {cmp.winnerName}</span>
                      )}
                    </div>

                    {cmp.status === 'Upcoming' && (
                      <button 
                        onClick={() => {
                          setCompetitions(prev => prev.map(c => c.id === cmp.id ? { ...c, status: 'Conducted', winnerName: 'Hamza Tariq (STUD-HIND-401)' } : c));
                          addAuditLog("COMPETITION_COMPLETED", `Recorded winners for event ${cmp.title}`);
                          alert(`✅ Competition results submitted. Winner announced: Hamza Tariq (Delhi HQ). Progress card updated.`);
                        }}
                        className="bg-teal-500 hover:bg-teal-600 text-slate-950 text-xs font-black px-3 py-1.5 rounded-lg transition"
                      >
                        Submit Winners List
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Scheduling portal */}
            <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
              <div>
                <h3 className="font-bold text-white text-sm">Schedule New Event / Competition</h3>
                <p className="text-xs text-slate-400">Configure event venue, date, and prize structures</p>
              </div>

              <form onSubmit={handleScheduleCompetition} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase block">Competition Title</label>
                  <input 
                    type="text"
                    value={newCompetitionForm.title}
                    onChange={(e) => setNewCompetitionForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g. State Level Tajweed Competition"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase block">Date of Event</label>
                  <input 
                    type="date"
                    value={newCompetitionForm.date}
                    onChange={(e) => setNewCompetitionForm(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase block">Venue Hall</label>
                  <input 
                    type="text"
                    value={newCompetitionForm.venue}
                    onChange={(e) => setNewCompetitionForm(prev => ({ ...prev, venue: e.target.value }))}
                    placeholder="e.g. Calicut Central Town Hall"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full bg-teal-500 hover:bg-teal-600 text-slate-950 font-black py-2.5 rounded-xl text-xs transition"
                >
                  Confirm Competition Schedule
                </button>
              </form>
            </div>
          </div>
        )}

        {/* =============================================================================
            MODULE 8: AFFILIATION MANAGEMENT (Verification workflow, approval, status)
            ============================================================================= */}
        {activeModule === 'affiliation' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl animate-fadeIn">
            <div>
              <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                <ShieldCheck className="h-6 w-6 text-teal-400" />
                Center Affiliation & Approval Workflow
              </h2>
              <p className="text-xs text-slate-400">Audit and approve local Masjids or Hifz institutions joining the National Qur'anic Alliance network</p>
            </div>

            <div className="space-y-3 border-t border-slate-800 pt-4">
              {centers.map(center => (
                <div key={center.id} className="bg-slate-950 p-4 rounded-xl border border-slate-850 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-mono bg-slate-800 text-slate-400 px-1.5 rounded">{center.code}</span>
                      <span className={`text-[9px] px-2 py-0.5 rounded font-black uppercase ${center.affiliationStatus === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400 animate-pulse'}`}>
                        {center.affiliationStatus}
                      </span>
                    </div>
                    <strong className="text-white text-sm block">{center.name}</strong>
                    <p className="text-xs text-slate-400">Regional Zone: {center.branch}</p>
                  </div>

                  {center.affiliationStatus === 'PENDING' ? (
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => {
                          setCenters(prev => prev.map(c => c.id === center.id ? { ...c, affiliationStatus: 'APPROVED' } : c));
                          addAuditLog("AFFILIATION_APPROVED", `Verified and approved national affiliation request for center ${center.name}`);
                          alert(`✅ Center ${center.name} has been verified as an official alliance center. Multi-tenant database schema generated.`);
                        }}
                        className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-black px-4 py-1.5 rounded-lg transition"
                      >
                        Approve Affiliation
                      </button>
                      <button 
                        onClick={() => {
                          setCenters(prev => prev.filter(c => c.id !== center.id));
                          alert("❌ Center affiliation request declined and cleared from workspace registries.");
                        }}
                        className="bg-slate-800 hover:bg-slate-700 text-rose-400 text-xs px-3 py-1.5 rounded-lg border border-slate-700 transition"
                      >
                        Reject Request
                      </button>
                    </div>
                  ) : (
                    <div className="text-xs text-emerald-400 flex items-center gap-1 bg-emerald-500/5 px-3 py-1.5 rounded-lg border border-emerald-500/20">
                      <CheckCircle className="h-4 w-4" /> Officially Verified
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =============================================================================
            MODULE 9: COMMUNICATION SYSTEM (SMS, WhatsApp integration, broadcast messages)
            ============================================================================= */}
        {activeModule === 'communication' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
            
            {/* Broadcast message desk */}
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
              <div>
                <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                  <MessageSquare className="h-6 w-6 text-teal-400" />
                  Global Communication System
                </h2>
                <p className="text-xs text-slate-400">Broadcast alerts directly to parents, teachers, and centers over WhatsApp and Email via Meta API integrations</p>
              </div>

              <div className="space-y-4 border-t border-slate-800 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Broadcast Target Group</label>
                    <select 
                      value={broadcastTarget}
                      onChange={(e) => setBroadcastTarget(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-800 text-xs rounded-lg p-2.5 text-white"
                    >
                      <option value="student">All Registered Parents (WhatsApp WABA)</option>
                      <option value="staff">All Staff Employees (SMS & Email Notification)</option>
                      <option value="affiliation">Affiliated Institutions Trustees (Broadcast Mail)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase block">Broadcast Message Text</label>
                  <textarea 
                    rows={4}
                    value={broadcastMessageText}
                    onChange={(e) => setBroadcastMessageText(e.target.value)}
                    placeholder="Type the official circular alert or advisory announcement here..."
                    className="w-full bg-slate-950 border border-slate-850 text-xs rounded-xl p-3 text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>

                <button 
                  onClick={() => {
                    if (!broadcastMessageText.trim()) return;
                    addAuditLog("BROADCAST_MESSAGE_SENT", `Sent broadcast circular notification to: ${broadcastTarget}`);
                    setBroadcastMessageText("");
                    alert(`📨 Broadcast Alert dispatched! Delivering successfully to selected: ${broadcastTarget} directory list via integrated communication nodes.`);
                  }}
                  className="bg-teal-500 hover:bg-teal-600 text-slate-950 text-xs font-black px-5 py-2 rounded-xl transition shadow-md shadow-teal-500/15 flex items-center gap-1.5"
                >
                  <Send className="h-4 w-4" /> Dispatch Broadcast Alert
                </button>
              </div>
            </div>

            {/* Delivery Channels status */} 
            <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
              <h3 className="font-bold text-white text-sm border-b border-slate-800 pb-3">Integrated API Pipelines</h3>
              
              <div className="space-y-3 text-xs">
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-850 flex justify-between items-center">
                  <span className="font-bold text-slate-200 block">WhatsApp Meta WABA Gateway</span>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-black">ACTIVE</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-850 flex justify-between items-center">
                  <span className="font-bold text-slate-200 block">Email Notification Server</span>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-black">ACTIVE</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-850 flex justify-between items-center">
                  <span className="font-bold text-slate-200 block">SMS Gateway Services</span>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-black">ACTIVE</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =============================================================================
            MODULE 10: REPORTS & ANALYTICS (Export dashboards, PDFs, data stats)
            ============================================================================= */}
        {activeModule === 'reports' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
            
            {/* Executive charts */} 
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
              <div>
                <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                  <FileText className="h-6 w-6 text-teal-400" />
                  Global Reports & Dashboard Analytics
                </h2>
                <p className="text-xs text-slate-400">Export institutional growth records, student memorization rates, and ledger balance sheets to PDF/Excel</p>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-slate-800 pt-4">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 text-center space-y-2">
                  <span className="text-xs text-slate-400 font-semibold block">Total Active Institutions</span>
                  <strong className="text-2xl font-black text-white">{centers.length}</strong>
                  <span className="text-[10px] text-teal-400 block font-bold">Approved national branches</span>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 text-center space-y-2">
                  <span className="text-xs text-slate-400 font-semibold block">Total Scholars Enrolled</span>
                  <strong className="text-2xl font-black text-white">{students.length}</strong>
                  <span className="text-[10px] text-teal-400 block font-bold">Quran memorizers</span>
                </div>
              </div>
            </div>

            {/* Exporting Desk sidebar */} 
            <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
              <h3 className="font-bold text-white text-sm border-b border-slate-800 pb-3 flex items-center gap-1.5">
                <Download className="h-4.5 w-4.5 text-teal-400" /> Export center Records
              </h3>

              <div className="space-y-3">
                {[
                  { title: "Consolidated Finance Report", desc: "Detailed cash book, ledger balances and voucher transactions" },
                  { title: "Qur'an Student Progress Audit", desc: "Complete Juz levels, performance metrics and warning lists" },
                  { title: "Alliance Center Rankings", desc: "Relative center performance score arrays and leaderboard grades" }
                ].map((rep, idx) => (
                  <div key={idx} className="bg-slate-950 p-3.5 rounded-xl border border-slate-850 text-xs space-y-3">
                    <div>
                      <strong className="text-white block font-black">{rep.title}</strong>
                      <span className="text-slate-500 text-[10px]">{rep.desc}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => alert(`📥 Exporting ${rep.title} as PDF format...`)}
                        className="flex-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-teal-400 font-bold py-1.5 rounded text-[10px] transition flex items-center justify-center gap-1"
                      >
                        <Download className="h-3 w-3" /> PDF
                      </button>
                      <button 
                        onClick={() => alert(`📥 Exporting ${rep.title} as Excel format...`)}
                        className="flex-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-teal-400 font-bold py-1.5 rounded text-[10px] transition flex items-center justify-center gap-1"
                      >
                        <FileText className="h-3 w-3" /> Excel
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* =============================================================================
            MODULE 11: SECURITY & ADMINISTRATION (Role Permissions, activity logs, backups)
            ============================================================================= */}
        {activeModule === 'security' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
            
            {/* Granular Activity log entries */} 
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
              <div>
                <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                  <Database className="h-6 w-6 text-rose-500 animate-pulse" />
                  Admin Security & System Audit Trail
                </h2>
                <p className="text-xs text-slate-400">Immutable activity records, encryptions logs and dynamic data backup control panel</p>
              </div>

              <div className="space-y-3.5 border-t border-slate-800 pt-4 max-h-[350px] overflow-y-auto pr-1">
                {audits.map(log => (
                  <div key={log.id} className="bg-slate-950 p-4 rounded-xl border border-slate-850 text-xs flex justify-between items-start gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[9px] bg-rose-500/10 text-rose-400 font-mono font-bold px-1.5 py-0.5 rounded">{log.action}</span>
                        <span className="text-[10px] text-slate-500 font-medium">User: {log.user}</span>
                      </div>
                      <strong className="text-slate-200 block">{log.details}</strong>
                    </div>
                    <span className="text-[10px] text-slate-500 shrink-0 font-medium">{log.timestamp}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Backup & System controls */}
            <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
              <h3 className="font-bold text-white text-sm border-b border-slate-800 pb-3 flex items-center gap-1.5">
                <ShieldCheck className="h-4.5 w-4.5 text-rose-500" /> System Backup Workspace
              </h3>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-3.5 text-xs">
                <p className="text-slate-400 leading-normal">
                  To protect the multi-tenant SaaS registry, database snapshots are backed up securely to AWS S3 every midnight at <strong className="text-white">02:00 AM</strong>.
                </p>

                <button 
                  onClick={() => {
                    addAuditLog("MANUAL_BACKUP_TRIGGERED", "Super Admin triggered immediate, encrypted PostgreSQL database snapshot to S3");
                    alert("📦 Encrypted Database Snapshot dispatched to secure Amazon S3 bucket successfully.");
                  }}
                  className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-2 rounded-lg text-xs transition flex items-center justify-center gap-1"
                >
                  <Database className="h-3.5 w-3.5" /> Trigger Manual Backup to S3
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* DYNAMIC CARD POPUP MODEL 1: ID CARD PRINT LAYOUT */}
      {showIdCard && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl max-w-sm w-full space-y-5 animate-scaleIn">
            <div className="text-center">
              <h3 className="font-bold text-white text-base">Qur'anic Scholar Student ID Card</h3>
              <p className="text-xs text-slate-400">Official Suffath-ul Alliance Card Layout</p>
            </div>

            {/* Printed card card */}
            <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-5 rounded-2xl border border-teal-500/30 relative overflow-hidden h-[240px] flex flex-col justify-between font-mono text-xs shadow-2xl">
              <div className="flex justify-between items-start">
                <div className="space-y-0.5">
                  <strong className="text-[11px] text-teal-400 tracking-wider block" style={{ fontFamily: '"Arial Black", Gadget, sans-serif' }}>SUFFATH-UL HUFFAZ</strong>
                  <span className="text-[9px] text-slate-400 block">National Qur'anic Alliance</span>
                </div>
                <div className="h-7 w-7 rounded bg-teal-500 flex items-center justify-center font-black text-slate-950 text-[10px]">S</div>
              </div>

              <div className="my-3 space-y-1.5">
                <h4 className="font-bold text-sm text-slate-100 font-sans">{showIdCard.name}</h4>
                <p className="text-slate-400 text-[10px]">STUDENT CODE: <strong className="text-teal-400">{showIdCard.code}</strong></p>
                <p className="text-slate-400 text-[10px]">CENTER: {showIdCard.centerName}</p>
                <p className="text-slate-400 text-[10px]">PARENT CONTACT: {showIdCard.parentPhone}</p>
              </div>

              <div className="flex justify-between items-center border-t border-slate-800/80 pt-2 text-[8px] text-slate-500">
                <span>WABA verified system card</span>
                <span>Alim Authorized</span>
              </div>
            </div>

            <div className="flex gap-2.5">
              <button 
                onClick={() => { alert("Printed Student ID Card successfully!"); setShowIdCard(null); }}
                className="flex-1 bg-teal-500 hover:bg-teal-600 text-slate-950 font-black py-2 rounded text-xs transition"
              >
                Print ID Card Layout
              </button>
              <button 
                onClick={() => setShowIdCard(null)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2 rounded text-xs transition"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
