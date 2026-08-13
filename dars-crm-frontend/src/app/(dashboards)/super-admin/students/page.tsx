"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Users, UserPlus, Search, Loader2, Mail, Phone, HeartHandshake } from "lucide-react";
import toast from "react-hot-toast";

interface StudentUser {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  center_id?: string;
  is_active: boolean;
  student_profile?: {
    is_zakat_eligible: boolean;
  };
  created_at?: string;
}

export default function SuperAdminManageStudentsPage() {
  const [students, setStudents] = useState<StudentUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    phone: "",
    is_zakat_eligible: false,
  });

  const fetchData = async () => {
    try {
      const res = await api.get("/users/students");
      setStudents(res.data || []);
    } catch (err) {
      toast.error("Failed to load students list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRegisterStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/auth/register", {
        ...form,
        role: "STUDENT",
      });
      toast.success("Student registered successfully!");
      setShowModal(false);
      setForm({ full_name: "", email: "", password: "", phone: "", is_zakat_eligible: false });
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to register student");
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = students.filter(s =>
    s.full_name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 space-y-6 bg-slate-50 min-h-screen">
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Global Enrolled Students</h1>
          <p className="text-sm text-slate-500 mt-1">
            Audit enrolled student profiles, Zakat eligibility statuses, and rosters.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2.5 rounded-lg text-sm shadow-sm transition"
        >
          <UserPlus className="h-4 w-4" /> Add New Student
        </button>
      </div>

      {/* --- SEARCH BAR --- */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search student by name or email..."
          className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* --- TABLE --- */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500 space-y-3">
          <Users className="h-12 w-12 text-slate-300 mx-auto" />
          <p className="font-semibold text-lg">No student accounts found</p>
          <p className="text-xs">Click "Add New Student" to enroll a new student.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 uppercase text-xs font-semibold">
              <tr>
                <th className="px-6 py-4">Student Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Zakat Eligibility</th>
                <th className="px-6 py-4">Parent Phone</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((student) => {
                const isZakat = student.student_profile?.is_zakat_eligible;
                return (
                  <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900 flex items-center gap-2">
                      <div className="p-2 bg-blue-50 text-blue-700 rounded-full font-black text-xs">
                        {student.full_name.charAt(0)}
                      </div>
                      {student.full_name}
                    </td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1.5 text-slate-700">
                        <Mail className="h-3.5 w-3.5 text-slate-400" /> {student.email}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium">
                      {isZakat ? (
                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 font-bold px-2.5 py-1 rounded text-xs">
                          <HeartHandshake className="h-3.5 w-3.5 text-emerald-600" /> ZAKAT ELIGIBLE
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 px-2.5 py-1 rounded text-xs">
                          SELF-PAYING
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {student.phone ? (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3.5 w-3.5 text-slate-400" /> {student.phone}
                        </span>
                      ) : "N/A"}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700">
                        ● Active Student
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* --- MODAL: REGISTER STUDENT --- */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <h2 className="text-xl font-bold text-slate-900">Add New Student</h2>
            <form onSubmit={handleRegisterStudent} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Student Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hamza Ahmad"
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="student@dars.org"
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Parent Phone (Optional)</label>
                <input
                  type="tel"
                  placeholder="+91 9876543210"
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>

              <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                <input
                  type="checkbox"
                  id="zakat_check_modal"
                  className="h-4 w-4 text-emerald-600 rounded"
                  checked={form.is_zakat_eligible}
                  onChange={(e) => setForm({ ...form, is_zakat_eligible: e.target.checked })}
                />
                <label htmlFor="zakat_check_modal" className="text-xs font-semibold text-emerald-900 cursor-pointer">
                  Zakat Eligible (Entitled to financial aid / stipend)
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-semibold rounded-lg text-sm"
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
    </div>
  );
}
