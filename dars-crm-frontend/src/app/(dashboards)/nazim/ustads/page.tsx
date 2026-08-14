"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { GraduationCap, UserPlus, Search, Loader2, Mail, Phone, MapPin, AlertCircle, Image as ImageIcon } from "lucide-react";
import toast from "react-hot-toast";

interface UstadUser {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  address?: string;
  emergency_contact?: string;
  gov_id_card_url?: string;
  is_active: boolean;
  created_at?: string;
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

const getMediaUrl = (url?: string) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  if (cleanPath.startsWith('/uploads/')) {
    return `/api/v1${cleanPath}`;
  }
  return cleanPath;
};

export default function NazimManageUstadsPage() {
  const [ustads, setUstads] = useState<UstadUser[]>([]);
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
  });

  const fetchData = async () => {
    try {
      const res = await api.get("/users/ustads");
      setUstads(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to load Ustads list"));
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
      toast.success("Gov ID card photo uploaded!");
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to upload ID card photo"));
    } finally {
      setUploadingFile(false);
    }
  };

  const handleRegisterUstad = async (e: React.FormEvent) => {
    e.preventDefault();
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
        role: "USTAD",
      });
      toast.success("Ustad registered successfully!");
      setShowModal(false);
      setForm({
        full_name: "",
        email: "",
        password: "",
        phone: "",
        address: "",
        emergency_contact: "",
        gov_id_card_url: "",
      });
      fetchData();
    } catch (err: any) {
      toast.error(getErrorMessage(err, "Failed to register Ustad"));
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = ustads.filter((u) => {
    const q = (search || "").toLowerCase();
    const nameMatch = (u.full_name || "").toLowerCase().includes(q);
    const emailMatch = (u.email || "").toLowerCase().includes(q);
    const phoneMatch = (u.phone || "").toLowerCase().includes(q);
    return nameMatch || emailMatch || phoneMatch;
  });

  return (
    <div className="p-8 space-y-6 bg-slate-50 min-h-screen">
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Center Ustads & Teachers</h1>
          <p className="text-sm text-slate-500 mt-1">
            Register and manage active teachers assigned to your center with ID proof.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2.5 rounded-lg text-sm shadow-sm transition"
        >
          <UserPlus className="h-4 w-4" /> Register New Ustad
        </button>
      </div>

      {/* --- SEARCH BAR --- */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search Ustad by name, email, or phone..."
          className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* --- TABLE --- */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500 space-y-3">
          <GraduationCap className="h-12 w-12 text-slate-300 mx-auto" />
          <p className="font-semibold text-lg">No Ustad accounts registered yet</p>
          <p className="text-xs">Click "Register New Ustad" to create a teacher profile for your center.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 uppercase text-xs font-semibold">
              <tr>
                <th className="px-6 py-4">Ustad Name</th>
                <th className="px-6 py-4">Contact Phone</th>
                <th className="px-6 py-4">Emergency Contact</th>
                <th className="px-6 py-4">Address</th>
                <th className="px-6 py-4">Govt ID Proof</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((ustad) => {
                const initial = (ustad.full_name || "U").charAt(0).toUpperCase();
                return (
                  <tr key={ustad.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-indigo-50 text-indigo-700 rounded-full font-black text-xs">
                          {initial}
                        </div>
                        <div>
                          <span>{ustad.full_name || "Unnamed Ustad"}</span>
                          <span className="text-xs text-slate-400 block font-normal">{ustad.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs">
                      <span className="flex items-center gap-1 text-slate-700 font-medium">
                        <Phone className="h-3.5 w-3.5 text-slate-400" /> {ustad.phone || "No phone"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-rose-600">
                      {ustad.emergency_contact ? (
                        <span className="flex items-center gap-1">
                          <AlertCircle className="h-3.5 w-3.5 text-rose-500" /> {ustad.emergency_contact}
                        </span>
                      ) : (
                        <span className="text-slate-400 font-normal">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600 max-w-xs truncate">
                      {ustad.address ? (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" /> {ustad.address}
                        </span>
                      ) : (
                        <span className="text-slate-400">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs">
                      {ustad.gov_id_card_url ? (
                        <a
                          href={getMediaUrl(ustad.gov_id_card_url)}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-semibold px-2.5 py-1 rounded transition"
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

      {/* --- MODAL: REGISTER USTAD --- */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-slate-900">Register New Staff Ustad</h2>
            <form onSubmit={handleRegisterUstad} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Maulana Tariq Sahib"
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="ustad@darscrm.com"
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
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
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
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
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Emergency Contact Number</label>
                  <input
                    type="tel"
                    placeholder="+91 9123456789"
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
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
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
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
                    className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                  />
                  {uploadingFile && <Loader2 className="h-4 w-4 animate-spin text-indigo-600 shrink-0" />}
                </div>
                {form.gov_id_card_url && (
                  <p className="text-xs text-indigo-600 mt-1 font-semibold flex items-center gap-1">
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
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-sm flex items-center justify-center"
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Staff Ustad"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
