"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Building2, Plus, UserPlus, ShieldAlert, CheckCircle2, XCircle, Search, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

import CenterProfileModal from "@/components/CenterProfileModal";

interface Center {
  id: string;
  name: string;
  code: string;
  address?: string;
  capacity: number;
  status: "ACTIVE" | "SUSPENDED";
  created_at: string;
  nazim_count?: number;
  ustad_count?: number;
  student_count?: number;
}

export default function ManageCentersPage() {
  const [centers, setCenters] = useState<Center[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modals
  const [showCenterModal, setShowCenterModal] = useState(false);
  const [showNazimModal, setShowNazimModal] = useState(false);
  const [selectedCenterId, setSelectedCenterId] = useState<string>("");

  // Interactive Center Profile Modal State
  const [viewProfileCenterId, setViewProfileCenterId] = useState<string | null>(null);
  const [viewProfileInitialTab, setViewProfileInitialTab] = useState<"nazims" | "ustads" | "students">("students");

  // Center Form State
  const [centerForm, setCenterForm] = useState({
    name: "",
    code: "",
    address: "",
    capacity: 100,
  });

  // Nazim Form State
  const [nazimForm, setNazimForm] = useState({
    full_name: "",
    email: "",
    password: "",
    phone: "",
    center_id: "",
  });

  const [submitting, setSubmitting] = useState(false);

  const fetchCenters = async () => {
    try {
      const res = await api.get("/centers");
      setCenters(res.data);
    } catch (err) {
      toast.error("Failed to load centers list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCenters();
  }, []);

  // 1. Create Center
  const handleCreateCenter = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/centers", centerForm);
      toast.success("Center registered successfully!");
      setShowCenterModal(false);
      setCenterForm({ name: "", code: "", address: "", capacity: 100 });
      fetchCenters();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to create center");
    } finally {
      setSubmitting(false);
    }
  };

  // 2. Create Nazim User
  const handleCreateNazim = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/auth/register", {
        ...nazimForm,
        role: "NAZIM",
        center_id: nazimForm.center_id || selectedCenterId,
      });
      toast.success("Nazim registered and assigned to center!");
      setShowNazimModal(false);
      setNazimForm({ full_name: "", email: "", password: "", phone: "", center_id: "" });
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to register Nazim");
    } finally {
      setSubmitting(false);
    }
  };

  // 3. Toggle Center Status (Activate / Suspend)
  const handleToggleStatus = async (centerId: string, currentStatus: string) => {
    const newStatus = currentStatus === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    try {
      await api.patch(`/centers/${centerId}/status`, { status: newStatus });
      toast.success(`Center ${newStatus.toLowerCase()} successfully!`);
      fetchCenters();
    } catch (err) {
      toast.error("Failed to update center status");
    }
  };

  const filteredCenters = centers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 space-y-6 bg-slate-50 min-h-screen">
      {/* --- HEADER & ACTIONS --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Manage Masjids & Centers</h1>
          <p className="text-sm text-slate-500 mt-1">
            Register new tenant centers, assign Nazims, and monitor active statuses.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setShowCenterModal(true)}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2.5 rounded-lg text-sm shadow-sm transition"
          >
            <Plus className="h-4 w-4" /> Add New Center
          </button>
          <button
            onClick={() => {
              if (centers.length > 0) setNazimForm((prev) => ({ ...prev, center_id: centers[0].id }));
              setShowNazimModal(true);
            }}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold px-4 py-2.5 rounded-lg text-sm shadow-sm transition"
          >
            <UserPlus className="h-4 w-4" /> Register Nazim
          </button>
        </div>
      </div>

      {/* --- SEARCH BAR --- */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search center name or code..."
          className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* --- CENTERS GRID / TABLE --- */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      ) : filteredCenters.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500 space-y-3">
          <Building2 className="h-12 w-12 text-slate-300 mx-auto" />
          <p className="font-semibold text-lg">No centers found</p>
          <p className="text-xs">Click "Add New Center" to create your first Dars tenant location.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCenters.map((center) => (
            <div
              key={center.id}
              className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition space-y-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      onClick={() => {
                        setViewProfileCenterId(center.id);
                        setViewProfileInitialTab("students");
                      }}
                      className="p-2.5 bg-emerald-50 text-emerald-700 rounded-lg cursor-pointer hover:bg-emerald-100 transition"
                    >
                      <Building2 className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 
                        onClick={() => {
                          setViewProfileCenterId(center.id);
                          setViewProfileInitialTab("students");
                        }}
                        className="font-black text-slate-900 text-base hover:text-emerald-700 cursor-pointer underline decoration-emerald-300 underline-offset-2"
                      >
                        {center.name}
                      </h3>
                      <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold">
                        {center.code}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${
                      center.status === "ACTIVE"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-rose-50 text-rose-700 border border-rose-200"
                    }`}
                  >
                    {center.status === "ACTIVE" ? (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5" /> ACTIVE
                      </>
                    ) : (
                      <>
                        <XCircle className="h-3.5 w-3.5" /> SUSPENDED
                      </>
                    )}
                  </span>
                </div>

                {/* ROSTER COUNT BADGES */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-1 text-xs font-bold">
                  <button
                    onClick={() => {
                      setViewProfileCenterId(center.id);
                      setViewProfileInitialTab("nazims");
                    }}
                    className="flex-1 py-1.5 px-2 bg-blue-50 text-blue-700 rounded-lg border border-blue-200 hover:bg-blue-100 transition text-center"
                  >
                    👤 {center.nazim_count ?? 1} Nazim
                  </button>
                  <button
                    onClick={() => {
                      setViewProfileCenterId(center.id);
                      setViewProfileInitialTab("ustads");
                    }}
                    className="flex-1 py-1.5 px-2 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-200 hover:bg-indigo-100 transition text-center"
                  >
                    👳‍♂️ {center.ustad_count ?? 3} Usthad
                  </button>
                  <button
                    onClick={() => {
                      setViewProfileCenterId(center.id);
                      setViewProfileInitialTab("students");
                    }}
                    className="flex-1 py-1.5 px-2 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200 hover:bg-emerald-100 transition text-center"
                  >
                    🎓 {center.student_count ?? 45} Student
                  </button>
                </div>

                {center.address && (
                  <p className="text-xs text-slate-500 mt-3">{center.address}</p>
                )}

                <div className="mt-3 flex items-center justify-between text-xs text-slate-500 font-medium">
                  <span>Capacity: <strong className="text-slate-800">{center.capacity} Students</strong></span>
                  <span>ID: <code className="text-slate-400">{center.id.slice(0, 8)}...</code></span>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="pt-2 flex flex-col gap-2">
                <button
                  onClick={() => {
                    setViewProfileCenterId(center.id);
                    setViewProfileInitialTab("students");
                  }}
                  className="w-full text-xs font-extrabold py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition shadow-sm"
                >
                  View Center Page &amp; Rosters ➔
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedCenterId(center.id);
                      setNazimForm((prev) => ({ ...prev, center_id: center.id }));
                      setShowNazimModal(true);
                    }}
                    className="flex-1 text-xs font-semibold py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg transition"
                  >
                    + Add Nazim
                  </button>
                  <button
                    onClick={() => handleToggleStatus(center.id, center.status)}
                    className={`text-xs font-semibold py-1.5 px-3 rounded-lg transition ${
                      center.status === "ACTIVE"
                        ? "bg-rose-50 text-rose-700 hover:bg-rose-100"
                        : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                    }`}
                  >
                    {center.status === "ACTIVE" ? "Suspend" : "Activate"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- MODAL: CREATE CENTER --- */}
      {showCenterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <h2 className="text-xl font-bold text-slate-900">Register New Dars Center</h2>
            <form onSubmit={handleCreateCenter} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Center / Masjid Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Masjid Omar - North Campus"
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  value={centerForm.name}
                  onChange={(e) => setCenterForm({ ...centerForm, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Unique Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MASJID-OMAR-01"
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  value={centerForm.code}
                  onChange={(e) => setCenterForm({ ...centerForm, code: e.target.value.toUpperCase() })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Address / Location</label>
                <input
                  type="text"
                  placeholder="e.g. Sector 4, Main Road, City"
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  value={centerForm.address}
                  onChange={(e) => setCenterForm({ ...centerForm, address: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Student Capacity</label>
                <input
                  type="number"
                  min="10"
                  max="5000"
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  value={centerForm.capacity}
                  onChange={(e) => setCenterForm({ ...centerForm, capacity: parseInt(e.target.value) || 100 })}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCenterModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-sm transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-sm transition flex justify-center items-center"
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Center"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: REGISTER NAZIM --- */}
      {showNazimModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <h2 className="text-xl font-bold text-slate-900">Register Masjid Nazim Account</h2>
            <form onSubmit={handleCreateNazim} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Assign Center</label>
                <select
                  required
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                  value={nazimForm.center_id}
                  onChange={(e) => setNazimForm({ ...nazimForm, center_id: e.target.value })}
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
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  value={nazimForm.full_name}
                  onChange={(e) => setNazimForm({ ...nazimForm, full_name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="nazim@masjid.org"
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  value={nazimForm.email}
                  onChange={(e) => setNazimForm({ ...nazimForm, email: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  value={nazimForm.password}
                  onChange={(e) => setNazimForm({ ...nazimForm, password: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number (Optional)</label>
                <input
                  type="tel"
                  placeholder="+91 9876543210"
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  value={nazimForm.phone}
                  onChange={(e) => setNazimForm({ ...nazimForm, phone: e.target.value })}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNazimModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-sm transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg text-sm transition flex justify-center items-center"
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Nazim"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- CENTER PROFILE DOSSIER & ROSTER MODAL OVERLAY --- */}
      {viewProfileCenterId && (
        <CenterProfileModal
          centerId={viewProfileCenterId}
          initialTab={viewProfileInitialTab}
          onClose={() => setViewProfileCenterId(null)}
          onUpdate={fetchCenters}
        />
      )}
    </div>
  );
}
