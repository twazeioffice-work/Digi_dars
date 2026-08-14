"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { 
  Utensils, Send, Users, Calendar, Clock, CheckCircle2, AlertTriangle, 
  Building2, Phone, UserCheck, MessageSquare, RefreshCw, Loader2, Eye
} from "lucide-react";
import toast from "react-hot-toast";

interface CookProfile {
  id?: string;
  name: string;
  phone_number: string;
  is_active: boolean;
}

interface HeadcountMetrics {
  expected_students: number;
  expected_staff: number;
  leaves_tomorrow: number;
  afternoon_returns: number;
  raw_metrics: {
    total_students: number;
    total_staff: number;
    students_on_leave: number;
    staff_on_leave: number;
    students_leave_tomorrow: number;
    staff_leave_tomorrow: number;
    student_afternoon: number;
    staff_afternoon: number;
  };
}

interface NotificationLog {
  id: string;
  meal_type: "breakfast" | "lunch" | "dinner";
  target_date: string;
  expected_students: number;
  expected_staff: number;
  leaves_tomorrow: number;
  afternoon_returns: number;
  formatted_message?: string;
  status: "sent" | "pending" | "failed";
  sent_at: string;
}

export default function NazimKitchenPage() {
  const [centerId, setCenterId] = useState<string>("ctr_1");
  const [centerName, setCenterName] = useState<string>("Al-Noor Central Madrasa");

  // Cook Profile State
  const [cookProfile, setCookProfile] = useState<CookProfile>({
    name: "Chef Mammukkoya",
    phone_number: "+919876543210",
    is_active: true
  });
  const [savingCook, setSavingCook] = useState(false);

  // Preview & Trigger State
  const [selectedMeal, setSelectedMeal] = useState<"breakfast" | "lunch" | "dinner">("lunch");
  const [headcountMetrics, setHeadcountMetrics] = useState<HeadcountMetrics | null>(null);
  const [whatsappPreview, setWhatsappPreview] = useState<string>("");
  const [previewLoading, setPreviewLoading] = useState(false);
  const [sendingAlert, setSendingAlert] = useState(false);

  // Notification Logs State
  const [logs, setLogs] = useState<NotificationLog[]>([]);
  const [selectedLogMessage, setSelectedLogMessage] = useState<string | null>(null);

  // Fetch Center Cook Profile & Preview
  const fetchCenterKitchenData = async (cId: string, meal: string) => {
    setPreviewLoading(true);
    try {
      const [cfgRes, prevRes, logsRes] = await Promise.all([
        api.get(`/cooks/config/${cId}`).catch(() => null),
        api.get(`/cooks/preview/${cId}?meal_type=${meal}`).catch(() => null),
        api.get(`/cooks/logs/${cId}`).catch(() => ({ data: [] }))
      ]);

      if (cfgRes?.data?.cook) {
        setCookProfile(cfgRes.data.cook);
      }

      if (prevRes?.data) {
        setHeadcountMetrics(prevRes.data.metrics);
        setWhatsappPreview(prevRes.data.formatted_message);
      }

      if (logsRes?.data) {
        setLogs(logsRes.data);
      }
    } catch {
      toast.error("Error loading kitchen headcount data");
    } finally {
      setPreviewLoading(false);
    }
  };

  useEffect(() => {
    fetchCenterKitchenData(centerId, selectedMeal);
  }, [centerId, selectedMeal]);

  // Save Cook Profile
  const handleSaveCook = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingCook(true);
    try {
      await api.post("/cooks/config", {
        center_id: centerId,
        name: cookProfile.name,
        phone_number: cookProfile.phone_number,
        is_active: cookProfile.is_active
      });
      toast.success(`Registered Cook '${cookProfile.name}' successfully!`);
    } catch {
      toast.error("Failed to save cook profile");
    } finally {
      setSavingCook(false);
    }
  };

  // Trigger WhatsApp Notification
  const handleTriggerNotification = async () => {
    setSendingAlert(true);
    try {
      const res = await api.post(`/cooks/trigger/${centerId}?meal_type=${selectedMeal}`);
      toast.success(res.data.message || "Headcount notification pushed to Cook via WhatsApp!");
      fetchCenterKitchenData(centerId, selectedMeal);
    } catch {
      toast.error("Failed to trigger WhatsApp headcount notification");
    } finally {
      setSendingAlert(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 bg-slate-50 min-h-screen">
      {/* TOP HEADER */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-200">
            <Utensils className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Kitchen &amp; Dining Headcounts
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Center Cook WhatsApp Dispatcher &amp; Portion Calculator • {centerName}
            </p>
          </div>
        </div>
      </div>

      {/* MEAL SELECTION & METRICS */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm gap-1">
            <button
              onClick={() => setSelectedMeal("breakfast")}
              className={`px-4 py-2 text-xs font-extrabold rounded-lg transition ${
                selectedMeal === "breakfast"
                  ? "bg-amber-500 text-slate-950 shadow-sm"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              ☕ Breakfast (രാവിലെ)
            </button>
            <button
              onClick={() => setSelectedMeal("lunch")}
              className={`px-4 py-2 text-xs font-extrabold rounded-lg transition ${
                selectedMeal === "lunch"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              🍛 Lunch (ഉച്ചയ്ക്ക്)
            </button>
            <button
              onClick={() => setSelectedMeal("dinner")}
              className={`px-4 py-2 text-xs font-extrabold rounded-lg transition ${
                selectedMeal === "dinner"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              🍽️ Dinner (രാത്രി)
            </button>
          </div>

          <button
            onClick={() => fetchCenterKitchenData(centerId, selectedMeal)}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl transition"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Refresh Metrics
          </button>
        </div>

        {/* STAT CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Active Diners</p>
            <p className="text-3xl font-black text-slate-900">
              {(headcountMetrics?.expected_students || 0) + (headcountMetrics?.expected_staff || 0)}
            </p>
            <p className="text-[11px] text-emerald-600 font-bold">Exact portions for {selectedMeal}</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Expected Students</p>
            <p className="text-3xl font-black text-emerald-600">
              {headcountMetrics?.expected_students || 0}
            </p>
            <p className="text-[11px] text-slate-400">Total {headcountMetrics?.raw_metrics?.total_students || 120} - {headcountMetrics?.raw_metrics?.students_on_leave || 8} on leave</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Expected Staff / Usthad</p>
            <p className="text-3xl font-black text-indigo-600">
              {headcountMetrics?.expected_staff || 0}
            </p>
            <p className="text-[11px] text-slate-400">Total {headcountMetrics?.raw_metrics?.total_staff || 12} - {headcountMetrics?.raw_metrics?.staff_on_leave || 2} on leave</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Afternoon Returns &amp; Leaves</p>
            <p className="text-3xl font-black text-amber-600">
              +{headcountMetrics?.afternoon_returns || 0} / -{headcountMetrics?.leaves_tomorrow || 0}
            </p>
            <p className="text-[11px] text-slate-400">Returns today / Leaves tomorrow</p>
          </div>
        </div>

        {/* 2-COLUMN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-gradient-to-br from-emerald-950 to-slate-900 text-white p-6 rounded-2xl shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-emerald-400" />
                <h3 className="font-extrabold text-base text-white">Live WhatsApp Message Preview (Cook Receiver)</h3>
              </div>
              <span className="text-[11px] px-2.5 py-1 bg-emerald-500/20 text-emerald-300 rounded-full font-mono font-bold border border-emerald-400/30">
                WABA Cloud API
              </span>
            </div>

            {previewLoading ? (
              <div className="h-56 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
              </div>
            ) : (
              <div className="bg-slate-950/80 p-5 rounded-xl border border-white/10 font-mono text-xs text-emerald-300 leading-relaxed whitespace-pre-wrap overflow-x-auto">
                {whatsappPreview || "Generating WhatsApp message preview..."}
              </div>
            )}

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-xs text-slate-300">
                Dispatches immediately to cook <strong>{cookProfile.name}</strong> ({cookProfile.phone_number}).
              </p>
              <button
                onClick={handleTriggerNotification}
                disabled={sendingAlert}
                className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black px-6 py-3 rounded-xl text-sm transition shadow-md flex items-center justify-center gap-2"
              >
                {sendingAlert ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Send Headcount Alert (WhatsApp)
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-emerald-600" /> Kitchen Cook Receiver Setup
              </h3>
              <p className="text-xs text-slate-500">
                Registered contact for receiving automatic WhatsApp dining reports.
              </p>

              <form onSubmit={handleSaveCook} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Cook Name</label>
                  <input
                    type="text"
                    required
                    value={cookProfile.name}
                    onChange={(e) => setCookProfile({ ...cookProfile, name: e.target.value })}
                    placeholder="e.g. Chef Mammukkoya"
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">WhatsApp Phone Number</label>
                  <input
                    type="text"
                    required
                    value={cookProfile.phone_number}
                    onChange={(e) => setCookProfile({ ...cookProfile, phone_number: e.target.value })}
                    placeholder="+91 9876543210"
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={cookProfile.is_active}
                    onChange={(e) => setCookProfile({ ...cookProfile, is_active: e.target.checked })}
                    className="h-4 w-4 text-emerald-600 rounded border-slate-300"
                  />
                  <label htmlFor="is_active" className="text-xs font-bold text-slate-700 cursor-pointer">
                    Active Kitchen Receiver
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={savingCook}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-xl text-xs transition flex justify-center items-center mt-2 shadow-sm"
                >
                  {savingCook ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Cook Profile"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* HISTORICAL LOGS LEDGER */}
      <div className="space-y-4">
        <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
          <Clock className="h-5 w-5 text-emerald-600" /> Historical Cook Alert Logs ({logs.length})
        </h2>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {logs.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">
              No cook alert logs recorded yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold text-[11px] tracking-wider">
                    <th className="py-3.5 px-6">Target Date</th>
                    <th className="py-3.5 px-6">Meal Type</th>
                    <th className="py-3.5 px-6">Expected Diners</th>
                    <th className="py-3.5 px-6">Tomorrow's Leaves</th>
                    <th className="py-3.5 px-6">Status</th>
                    <th className="py-3.5 px-6">Sent Timestamp</th>
                    <th className="py-3.5 px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50 transition">
                      <td className="py-4 px-6 font-bold text-slate-900">{log.target_date}</td>
                      <td className="py-4 px-6 uppercase font-bold text-xs">
                        <span className={`px-2.5 py-1 rounded-md text-[11px] ${
                          log.meal_type === "breakfast" ? "bg-amber-50 text-amber-800 border border-amber-200" :
                          log.meal_type === "lunch" ? "bg-emerald-50 text-emerald-800 border border-emerald-200" :
                          "bg-indigo-50 text-indigo-800 border border-indigo-200"
                        }`}>
                          {log.meal_type}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-black text-slate-900">
                        {log.expected_students + log.expected_staff} Diners
                      </td>
                      <td className="py-4 px-6 text-slate-600 font-semibold">{log.leaves_tomorrow} Leaves</td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 className="h-3 w-3" /> SENT
                        </span>
                      </td>
                      <td className="py-4 px-6 text-slate-500 text-xs">
                        {log.sent_at ? new Date(log.sent_at).toLocaleString() : "Just now"}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => setSelectedLogMessage(log.formatted_message || "Message log unavailable")}
                          className="text-xs px-3 py-1.5 rounded-lg font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 transition flex items-center gap-1 ml-auto"
                        >
                          <Eye className="h-3.5 w-3.5" /> View Message
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* DRAWER MODAL */}
      {selectedLogMessage && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-emerald-600" /> Dispatched WhatsApp Payload
              </h3>
              <button
                onClick={() => setSelectedLogMessage(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm p-1"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl font-mono text-xs text-emerald-400 whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto">
              {selectedLogMessage}
            </div>

            <button
              onClick={() => setSelectedLogMessage(null)}
              className="w-full py-2.5 bg-slate-900 text-white font-bold rounded-xl text-xs"
            >
              Close Drawer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
