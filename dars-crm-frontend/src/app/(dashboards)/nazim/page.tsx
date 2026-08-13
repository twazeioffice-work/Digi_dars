"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { 
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer 
} from "recharts";
import { Users, BookOpen, Activity, HeartHandshake, Loader2, UserPlus, PlusCircle, GraduationCap } from "lucide-react";
import toast from "react-hot-toast";

interface HalqaStat {
  id: string;
  name: string;
  ustad_name: string;
  student_count: number;
  avg_attendance: number;
  sabaq_completion_rate: number;
}

interface DashboardData {
  center_name: string;
  total_students: number;
  zakat_eligible_count: number;
  active_halqas: number;
  overall_attendance: number;
  attendance_trend: { date: string; percent: number }[];
  halqas: HalqaStat[];
}

interface UserOption {
  id: string;
  full_name: string;
  email: string;
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

export default function NazimDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [ustads, setUstads] = useState<UserOption[]>([]);
  const [students, setStudents] = useState<UserOption[]>([]);

  // Modals state
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showUstadModal, setShowUstadModal] = useState(false);
  const [showHalqaModal, setShowHalqaModal] = useState(false);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Forms state
  const [studentForm, setStudentForm] = useState({
    full_name: "",
    email: "",
    password: "",
    phone: "",
    emergency_contact: "",
    address: "",
    gov_id_card_url: "",
    is_zakat_eligible: false,
  });

  const [ustadForm, setUstadForm] = useState({
    full_name: "",
    email: "",
    password: "",
    phone: "",
    emergency_contact: "",
    address: "",
    gov_id_card_url: "",
  });

  const [halqaForm, setHalqaForm] = useState({
    name: "",
    department: "HIFZ",
    ustad_id: "",
  });

  const [enrollForm, setEnrollForm] = useState({
    student_id: "",
    halqa_id: "",
  });

  const fetchDashboardData = async () => {
    try {
      const response = await api.get("/academic/dashboard/nazim");
      setData(response.data);
    } catch (error) {
      toast.error("Failed to load center statistics.");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserLists = async () => {
    try {
      const [uRes, sRes] = await Promise.all([
        api.get("/users/ustads").catch(() => ({ data: [] })),
        api.get("/users/students").catch(() => ({ data: [] }))
      ]);
      setUstads(uRes.data || []);
      setStudents(sRes.data || []);
    } catch (e) {
      console.warn("Could not fetch user lists", e);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    fetchUserLists();
  }, []);

  // 1. Add Student
  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/auth/register", {
        full_name: studentForm.full_name,
        email: studentForm.email,
        password: studentForm.password,
        phone: studentForm.phone.trim() || undefined,
        emergency_contact: studentForm.emergency_contact.trim() || undefined,
        address: studentForm.address.trim() || undefined,
        gov_id_card_url: studentForm.gov_id_card_url || undefined,
        is_zakat_eligible: studentForm.is_zakat_eligible,
        role: "STUDENT",
      });
      toast.success("Student added successfully!");
      setShowStudentModal(false);
      setStudentForm({
        full_name: "",
        email: "",
        password: "",
        phone: "",
        emergency_contact: "",
        address: "",
        gov_id_card_url: "",
        is_zakat_eligible: false,
      });
      fetchDashboardData();
      fetchUserLists();
    } catch (err: any) {
      toast.error(getErrorMessage(err, "Failed to add student"));
    } finally {
      setSubmitting(false);
    }
  };

  // 2. Register Ustad
  const handleRegisterUstad = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/auth/register", {
        full_name: ustadForm.full_name,
        email: ustadForm.email,
        password: ustadForm.password,
        phone: ustadForm.phone.trim() || undefined,
        emergency_contact: ustadForm.emergency_contact.trim() || undefined,
        address: ustadForm.address.trim() || undefined,
        gov_id_card_url: ustadForm.gov_id_card_url || undefined,
        role: "USTAD",
      });
      toast.success("Ustad registered successfully!");
      setShowUstadModal(false);
      setUstadForm({
        full_name: "",
        email: "",
        password: "",
        phone: "",
        emergency_contact: "",
        address: "",
        gov_id_card_url: "",
      });
      fetchUserLists();
    } catch (err: any) {
      toast.error(getErrorMessage(err, "Failed to register Ustad"));
    } finally {
      setSubmitting(false);
    }
  };

  // 3. Create Halqa
  const handleCreateHalqa = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/academic/halqas", halqaForm);
      toast.success("Halqa created successfully!");
      setShowHalqaModal(false);
      setHalqaForm({ name: "", department: "HIFZ", ustad_id: "" });
      fetchDashboardData();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to create Halqa");
    } finally {
      setSubmitting(false);
    }
  };

  // 4. Enroll Student
  const handleEnrollStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/academic/halqas/enroll", enrollForm);
      toast.success("Student enrolled in Halqa!");
      setShowEnrollModal(false);
      setEnrollForm({ student_id: "", halqa_id: "" });
      fetchDashboardData();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to enroll student");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 bg-gray-50 min-h-screen">
      {/* --- HEADER & QUICK ACTIONS --- */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {data?.center_name || "Center"} Overview
          </h1>
          <p className="text-gray-500">Local enrollment, Halqa performance, and Tarbiyyah metrics</p>
        </div>

        {/* INPUT ACTIONS */}
        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => setShowStudentModal(true)}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-2.5 rounded-lg shadow-sm transition"
          >
            <UserPlus className="h-4 w-4" /> + Add Student
          </button>
          <button
            onClick={() => setShowHalqaModal(true)}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3.5 py-2.5 rounded-lg shadow-sm transition"
          >
            <PlusCircle className="h-4 w-4" /> + Create Halqa
          </button>
          <button
            onClick={() => setShowUstadModal(true)}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3.5 py-2.5 rounded-lg shadow-sm transition"
          >
            <GraduationCap className="h-4 w-4" /> + Register Ustad
          </button>
          <button
            onClick={() => setShowEnrollModal(true)}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-3.5 py-2.5 rounded-lg shadow-sm transition"
          >
            <BookOpen className="h-4 w-4" /> Enroll Student
          </button>
        </div>
      </div>

      {/* --- KPI CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Enrollment</p>
            <p className="text-2xl font-bold text-gray-900">{data?.total_students || 0}</p>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg">
            <Users className="h-6 w-6 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Zakat Eligible</p>
            <p className="text-2xl font-bold text-emerald-600">{data?.zakat_eligible_count || 0}</p>
          </div>
          <div className="p-3 bg-emerald-50 rounded-lg">
            <HeartHandshake className="h-6 w-6 text-emerald-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Active Halqas</p>
            <p className="text-2xl font-bold text-indigo-600">{data?.active_halqas || 0}</p>
          </div>
          <div className="p-3 bg-indigo-50 rounded-lg">
            <BookOpen className="h-6 w-6 text-indigo-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Overall Attendance</p>
            <p className="text-2xl font-bold text-amber-600">{data?.overall_attendance || 0}%</p>
          </div>
          <div className="p-3 bg-amber-50 rounded-lg">
            <Activity className="h-6 w-6 text-amber-600" />
          </div>
        </div>
      </div>

      {/* --- TREND CHART & HALQA TABLE SPLIT --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">30-Day Attendance</h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data?.attendance_trend || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} tickMargin={10} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value: any) => `${value}%`} />
                <Line 
                  type="monotone" 
                  dataKey="percent" 
                  stroke="#2563eb" 
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">Halqa Performance Matrix</h2>
            <button onClick={() => setShowHalqaModal(true)} className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold px-3 py-1.5 rounded-lg transition">
              + New Halqa
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-gray-700 uppercase text-xs font-semibold">
                <tr>
                  <th className="px-6 py-4">Halqa / Class</th>
                  <th className="px-6 py-4">Ustad</th>
                  <th className="px-6 py-4">Students</th>
                  <th className="px-6 py-4">Avg Attendance</th>
                  <th className="px-6 py-4">Sabaq Progress</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data?.halqas.map((halqa) => (
                  <tr key={halqa.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{halqa.name}</td>
                    <td className="px-6 py-4">{halqa.ustad_name}</td>
                    <td className="px-6 py-4">{halqa.student_count}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        halqa.avg_attendance >= 90 ? 'bg-green-100 text-green-800' :
                        halqa.avg_attendance >= 75 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {halqa.avg_attendance}%
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${halqa.sabaq_completion_rate}%` }}
                          ></div>
                        </div>
                        <span className="text-xs">{halqa.sabaq_completion_rate}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* --- MODAL 1: ADD STUDENT --- */}
      {showStudentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Add New Student</h2>
            <form onSubmit={handleAddStudent} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Student Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hamza Ahmad"
                  className="w-full p-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                  value={studentForm.full_name}
                  onChange={(e) => setStudentForm({ ...studentForm, full_name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="student@dars.org"
                  className="w-full p-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                  value={studentForm.email}
                  onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full p-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                  value={studentForm.password}
                  onChange={(e) => setStudentForm({ ...studentForm, password: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Parent Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+91 9876543210"
                    className="w-full p-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                    value={studentForm.phone}
                    onChange={(e) => setStudentForm({ ...studentForm, phone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1 text-rose-600">
                    Emergency Contact Number
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 9123456789"
                    className="w-full p-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-rose-500"
                    value={studentForm.emergency_contact}
                    onChange={(e) => setStudentForm({ ...studentForm, emergency_contact: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Complete Residential Address</label>
                <textarea
                  rows={2}
                  placeholder="House No., Street Name, Landmark, City, Pincode"
                  className="w-full p-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                  value={studentForm.address}
                  onChange={(e) => setStudentForm({ ...studentForm, address: e.target.value })}
                />
              </div>

              <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                <input
                  type="checkbox"
                  id="zakat_check"
                  className="h-4 w-4 text-emerald-600 rounded"
                  checked={studentForm.is_zakat_eligible}
                  onChange={(e) => setStudentForm({ ...studentForm, is_zakat_eligible: e.target.checked })}
                />
                <label htmlFor="zakat_check" className="text-xs font-semibold text-emerald-900 cursor-pointer">
                  Zakat Eligible (Entitled to financial aid / stipend)
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowStudentModal(false)}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-sm flex items-center justify-center"
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Student"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 2: REGISTER USTAD --- */}
      {showUstadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Register New Ustad / Teacher</h2>
            <form onSubmit={handleRegisterUstad} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Maulana Tariq Sahib"
                  className="w-full p-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  value={ustadForm.full_name}
                  onChange={(e) => setUstadForm({ ...ustadForm, full_name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="ustad@darscrm.com"
                  className="w-full p-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  value={ustadForm.email}
                  onChange={(e) => setUstadForm({ ...ustadForm, email: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full p-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  value={ustadForm.password}
                  onChange={(e) => setUstadForm({ ...ustadForm, password: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  placeholder="+91 9876543210"
                  className="w-full p-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  value={ustadForm.phone}
                  onChange={(e) => setUstadForm({ ...ustadForm, phone: e.target.value })}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUstadModal(false)}
                  className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-lg text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-indigo-600 text-white font-semibold rounded-lg text-sm flex items-center justify-center"
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Ustad"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 3: CREATE HALQA --- */}
      {showHalqaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Create New Halqa / Class Batch</h2>
            <form onSubmit={handleCreateHalqa} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Halqa Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Halqa Hifz A"
                  className="w-full p-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  value={halqaForm.name}
                  onChange={(e) => setHalqaForm({ ...halqaForm, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Department / Course Type</label>
                <select
                  required
                  className="w-full p-2.5 border border-gray-300 rounded-lg text-sm outline-none bg-white focus:ring-2 focus:ring-blue-500"
                  value={halqaForm.department}
                  onChange={(e) => setHalqaForm({ ...halqaForm, department: e.target.value })}
                >
                  <option value="HIFZ">Hifz-ul-Quran</option>
                  <option value="NAZIRA">Nazira / Tajweed</option>
                  <option value="AALIM">Aalim Course</option>
                  <option value="MAKTAB">Maktab Primary</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Assigned Ustad</label>
                <select
                  className="w-full p-2.5 border border-gray-300 rounded-lg text-sm outline-none bg-white focus:ring-2 focus:ring-blue-500"
                  value={halqaForm.ustad_id}
                  onChange={(e) => setHalqaForm({ ...halqaForm, ustad_id: e.target.value })}
                >
                  <option value="">Select an Ustad (Optional)...</option>
                  {ustads.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.full_name} ({u.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowHalqaModal(false)}
                  className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-lg text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-blue-600 text-white font-semibold rounded-lg text-sm flex items-center justify-center"
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Halqa"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 4: ENROLL STUDENT --- */}
      {showEnrollModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Enroll Student into Halqa</h2>
            <form onSubmit={handleEnrollStudent} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Select Student</label>
                <select
                  required
                  className="w-full p-2.5 border border-gray-300 rounded-lg text-sm outline-none bg-white focus:ring-2 focus:ring-slate-900"
                  value={enrollForm.student_id}
                  onChange={(e) => setEnrollForm({ ...enrollForm, student_id: e.target.value })}
                >
                  <option value="">Select a Student...</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.full_name} ({s.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Select Target Halqa</label>
                <select
                  required
                  className="w-full p-2.5 border border-gray-300 rounded-lg text-sm outline-none bg-white focus:ring-2 focus:ring-slate-900"
                  value={enrollForm.halqa_id}
                  onChange={(e) => setEnrollForm({ ...enrollForm, halqa_id: e.target.value })}
                >
                  <option value="">Select a Halqa...</option>
                  {data?.halqas.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name} (Ustad: {h.ustad_name})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEnrollModal(false)}
                  className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-lg text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-slate-900 text-white font-semibold rounded-lg text-sm flex items-center justify-center"
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm Enrollment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
