"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { UserCheck, UserPlus, Search, Loader2, Mail, Phone, Building2 } from "lucide-react";
import toast from "react-hot-toast";

interface NazimUser {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  center_id?: string;
  is_active: boolean;
  created_at?: string;
}

interface Center {
  id: string;
  name: string;
  code: string;
}

export default function ManageNazimsPage() {
  const [nazims, setNazims] = useState<NazimUser[]>([]);
  const [centers, setCenters] = useState<Center[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    phone: "",
    center_id: "",
  });

  const fetchData = async () => {
    try {
      const [nRes, cRes] = await Promise.all([
        api.get("/users/nazims").catch(() => ({ data: [] })),
        api.get("/centers").catch(() => ({ data: [] }))
      ]);
      setNazims(nRes.data || []);
      setCenters(cRes.data || []);
    } catch (err) {
      toast.error("Failed to load Nazim accounts list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRegisterNazim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.center_id) {
      toast.error("Please select a center for the Nazim");
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/auth/register", {
        ...form,
        role: "NAZIM",
      });
      toast.success("Nazim registered successfully!");
      setShowModal(false);
      setForm({ full_name: "", email: "", password: "", phone: "", center_id: "" });
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to register Nazim");
    } finally {
      setSubmitting(false);
    }
  };

  const getCenterName = (centerId?: string) => {
    if (!centerId) return "Unassigned";
    const found = centers.find(c => c.id === centerId);
    return found ? `${found.name} (${found.code})` : centerId.slice(0, 8);
  };

  const filtered = nazims.filter(n =>
    n.full_name.toLowerCase().includes(search.toLowerCase()) ||
    n.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 space-y-6 bg-slate-50 min-h-screen">
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Manage Masjid Nazims</h1>
          <p className="text-sm text-slate-500 mt-1">
            Audit registered Center Admins (Nazims) across all Dars tenant centers.
          </p>
        </div>
        <button
          onClick={() => {
            if (centers.length > 0) setForm(prev => ({ ...prev, center_id: centers[0].id }));
            setShowModal(true);
          }}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2.5 rounded-lg text-sm shadow-sm transition"
        >
          <UserPlus className="h-4 w-4" /> Register New Nazim
        </button>
      </div>

      {/* --- SEARCH BAR --- */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search Nazim by name or email..."
          className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* --- TABLE / CARDS --- */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500 space-y-3">
          <UserCheck className="h-12 w-12 text-slate-300 mx-auto" />
          <p className="font-semibold text-lg">No Nazim accounts found</p>
          <p className="text-xs">Click "Register New Nazim" to assign a Center Admin.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 uppercase text-xs font-semibold">
              <tr>
                <th className="px-6 py-4">Nazim Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Assigned Center</th>
                <th className="px-6 py-4">Phone</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((nazim) => (
                <tr key={nazim.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-900 flex items-center gap-2">
                    <div className="p-2 bg-emerald-50 text-emerald-700 rounded-full font-black text-xs">
                      {nazim.full_name.charAt(0)}
                    </div>
                    {nazim.full_name}
                  </td>
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-1.5 text-slate-700">
                      <Mail className="h-3.5 w-3.5 text-slate-400" /> {nazim.email}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-800">
                    <span className="inline-flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded text-xs">
                      <Building2 className="h-3.5 w-3.5 text-slate-500" /> {getCenterName(nazim.center_id)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500">
                    {nazim.phone ? (
                      <span className="flex items-center gap-1">
                        <Phone className="h-3.5 w-3.5 text-slate-400" /> {nazim.phone}
                      </span>
                    ) : "N/A"}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700">
                      ● Active Nazim
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* --- MODAL: REGISTER NAZIM --- */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <h2 className="text-xl font-bold text-slate-900">Register New Nazim</h2>
            <form onSubmit={handleRegisterNazim} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Assign Center</label>
                <select
                  required
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-emerald-500"
                  value={form.center_id}
                  onChange={(e) => setForm({ ...form, center_id: e.target.value })}
                >
                  <option value="">Select a Center...</option>
                  {centers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Maulana Ibrahim Sahib"
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
                  placeholder="nazim@masjid.org"
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
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number (Optional)</label>
                <input
                  type="tel"
                  placeholder="+91 9876543210"
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
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
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Nazim"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
