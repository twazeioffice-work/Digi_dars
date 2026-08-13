"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { UserCheck, UserPlus, Search, Loader2, Mail, Phone, Building2, MapPin, AlertCircle, FileText, Image as ImageIcon } from "lucide-react";
import toast from "react-hot-toast";

interface NazimUser {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  address?: string;
  emergency_contact?: string;
  gov_id_card_url?: string;
  center_id?: string;
  is_active: boolean;
  created_at?: string;
}

interface Center {
  id: string;
  name: string;
  code: string;
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

export default function ManageNazimsPage() {
  const [nazims, setNazims] = useState<NazimUser[]>([]);
  const [centers, setCenters] = useState<Center[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    emergency_contact: "",
    gov_id_card_url: "",
    center_id: "",
  });

  const fetchData = async () => {
    try {
      const [nRes, cRes] = await Promise.all([
        api.get("/users/nazims").catch(() => ({ data: [] })),
        api.get("/centers").catch(() => ({ data: [] }))
      ]);
      setNazims(Array.isArray(nRes.data) ? nRes.data : []);
      setCenters(Array.isArray(cRes.data) ? cRes.data : []);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to load Nazim accounts list"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingFile(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await api.post("/auth/upload-id-card", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      const url = res.data?.url || "";
      setForm((prev) => ({ ...prev, gov_id_card_url: url }));
      toast.success("Gov ID card uploaded successfully!");
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to upload ID card photo"));
    } finally {
      setUploadingFile(false);
    }
  };

  const handleRegisterNazim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.center_id) {
      toast.error("Please select a center for the Nazim");
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/auth/register", {
        full_name: form.full_name,
        email: form.email,
        password: form.password,
        phone: form.phone.trim() || undefined,
        address: form.address.trim() || undefined,
        emergency_contact: form.emergency_contact.trim() || undefined,
        gov_id_card_url: form.gov_id_card_url || undefined,
        center_id: form.center_id,
        role: "NAZIM",
      });
      toast.success("Nazim registered successfully!");
      setShowModal(false);
      setForm({
        full_name: "",
        email: "",
        password: "",
        phone: "",
        address: "",
        emergency_contact: "",
        gov_id_card_url: "",
        center_id: "",
      });
      fetchData();
    } catch (err: any) {
      toast.error(getErrorMessage(err, "Failed to register Nazim"));
    } finally {
      setSubmitting(false);
    }
  };

  const getCenterName = (centerId?: string) => {
    if (!centerId) return "Unassigned";
    const found = centers.find((c) => c.id === centerId);
    return found ? `${found.name} (${found.code})` : centerId.slice(0, 8);
  };

  const filtered = nazims.filter((n) => {
    const q = (search || "").toLowerCase();
    const nameMatch = (n.full_name || "").toLowerCase().includes(q);
    const emailMatch = (n.email || "").toLowerCase().includes(q);
    const phoneMatch = (n.phone || "").toLowerCase().includes(q);
    return nameMatch || emailMatch || phoneMatch;
  });

  return (
    <div className="p-8 space-y-6 bg-slate-50 min-h-screen">
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Manage Masjid Nazims</h1>
          <p className="text-sm text-slate-500 mt-1">
            Audit registered Center Admins (Nazims) with full contact details & Govt ID proof.
          </p>
        </div>
        <button
          onClick={() => {
            if (centers.length > 0) setForm((prev) => ({ ...prev, center_id: centers[0].id }));
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
          placeholder="Search Nazim by name, email, or phone..."
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
                <th className="px-6 py-4">Contact Info</th>
                <th className="px-6 py-4">Emergency Contact</th>
                <th className="px-6 py-4">Address</th>
                <th className="px-6 py-4">Assigned Center</th>
                <th className="px-6 py-4">Govt ID Proof</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((nazim) => {
                const initial = (nazim.full_name || "N").charAt(0).toUpperCase();
                return (
                  <tr key={nazim.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-emerald-50 text-emerald-700 rounded-full font-black text-xs">
                          {initial}
                        </div>
                        <div>
                          <span>{nazim.full_name || "Unnamed Nazim"}</span>
                          <span className="text-xs text-slate-400 block font-normal">{nazim.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs">
                      <span className="flex items-center gap-1 text-slate-700 font-medium">
                        <Phone className="h-3.5 w-3.5 text-slate-400" /> {nazim.phone || "No phone"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-rose-600">
                      {nazim.emergency_contact ? (
                        <span className="flex items-center gap-1">
                          <AlertCircle className="h-3.5 w-3.5 text-rose-500" /> {nazim.emergency_contact}
                        </span>
                      ) : (
                        <span className="text-slate-400 font-normal">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600 max-w-xs truncate">
                      {nazim.address ? (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" /> {nazim.address}
                        </span>
                      ) : (
                        <span className="text-slate-400">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-800">
                      <span className="inline-flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded text-xs">
                        <Building2 className="h-3.5 w-3.5 text-slate-500" /> {getCenterName(nazim.center_id)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs">
                      {nazim.gov_id_card_url ? (
                        <a
                          href={nazim.gov_id_card_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold px-2.5 py-1 rounded transition"
                        >
                          <ImageIcon className="h-3.5 w-3.5" /> View ID Card
                        </a>
                      ) : (
                        <span className="text-slate-400 italic">Not Uploaded</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* --- MODAL: REGISTER NAZIM --- */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-slate-900">Register New Staff Nazim</h2>
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
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
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
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
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
                <label className="block text-xs font-semibold text-slate-700 mb-1">Password *</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+91 9876543210"
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Emergency Contact Number</label>
                  <input
                    type="tel"
                    placeholder="+91 9123456789"
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                    value={form.emergency_contact}
                    onChange={(e) => setForm({ ...form, emergency_contact: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Complete Residential Address</label>
                <textarea
                  rows={2}
                  placeholder="House No, Street Name, District, Pincode"
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Government Approved ID Card (Aadhaar / Passport / Voter ID Photo)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileUpload}
                    className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                  />
                  {uploadingFile && <Loader2 className="h-4 w-4 animate-spin text-emerald-600 shrink-0" />}
                </div>
                {form.gov_id_card_url && (
                  <p className="text-xs text-emerald-600 mt-1 font-semibold flex items-center gap-1">
                    ✓ ID Card Uploaded: <a href={form.gov_id_card_url} target="_blank" rel="noreferrer" className="underline">{form.gov_id_card_url}</a>
                  </p>
                )}
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
                  disabled={submitting || uploadingFile}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-sm flex items-center justify-center"
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Staff Nazim"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
