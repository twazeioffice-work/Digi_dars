"use client";

import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import {
  MessageSquare,
  Search,
  ShieldCheck,
  Building,
  User,
  Phone,
  RefreshCw,
  Lock,
  AlertCircle,
  CheckCircle2,
  Filter,
  Loader2
} from "lucide-react";

interface OversightMsg {
  id: string;
  center_name: string;
  student_name: string;
  sender_phone: string;
  recipient_phone: string;
  direction: "INBOUND" | "OUTBOUND";
  message_text: string;
  is_complaint: boolean;
  is_unrecognized_sender: boolean;
  created_at: string;
}

export default function SuperAdminWhatsAppOversightPage() {
  const [messages, setMessages] = useState<OversightMsg[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterMode, setFilterMode] = useState<"ALL" | "UNLINKED" | "COMPLAINTS">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const token = Cookies.get("dars_auth_token");

  useEffect(() => {
    fetchOversightMessages();
  }, []);

  const fetchOversightMessages = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/v1/whatsapp/super-admin/oversight", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (e) {
      console.error("Failed to fetch WhatsApp oversight messages", e);
    } finally {
      setLoading(false);
    }
  };

  const filteredMessages = messages.filter((m) => {
    // Mode Filter
    if (filterMode === "UNLINKED" && !m.is_unrecognized_sender) return false;
    if (filterMode === "COMPLAINTS" && !m.is_complaint) return false;

    // Search Query Filter
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      m.center_name.toLowerCase().includes(q) ||
      m.student_name.toLowerCase().includes(q) ||
      m.sender_phone.includes(q) ||
      m.message_text.toLowerCase().includes(q)
    );
  });

  const unlinkedCount = messages.filter((m) => m.is_unrecognized_sender).length;
  const complaintCount = messages.filter((m) => m.is_complaint).length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 rounded-2xl border border-slate-800 text-white shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-xl">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">Global WhatsApp Oversight Feed</h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Real-time audit log of parent-teacher messages, unlinked senders, and confidential #complaint submissions.
            </p>
          </div>
        </div>

        <button
          onClick={fetchOversightMessages}
          className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-2 border border-slate-700 transition"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh Feed
        </button>
      </div>

      {/* Control Bar: Filters & Search */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        {/* Filter Buttons */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl gap-1">
          <button
            onClick={() => setFilterMode("ALL")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
              filterMode === "ALL"
                ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            All Messages ({messages.length})
          </button>

          <button
            onClick={() => setFilterMode("UNLINKED")}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
              filterMode === "UNLINKED"
                ? "bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
            Unlinked Senders ({unlinkedCount})
          </button>

          <button
            onClick={() => setFilterMode("COMPLAINTS")}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
              filterMode === "COMPLAINTS"
                ? "bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            <Lock className="h-3.5 w-3.5 text-rose-500" />
            HQ Complaints ({complaintCount})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by center, student, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-white"
          />
        </div>
      </div>

      {/* Audit Log Table Feed */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
            Fetching real-time communication logs...
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="p-16 text-center text-slate-400 text-xs">
            <MessageSquare className="h-10 w-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
            <p className="font-bold text-slate-700 dark:text-slate-300">No Messages Found</p>
            <p className="text-[11px] text-slate-500 mt-1">Try adjusting your filter or search query.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredMessages.map((m) => (
              <div key={m.id} className="p-4 sm:p-5 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Center Badge */}
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                      <Building className="h-3 w-3 text-slate-500" /> {m.center_name}
                    </span>

                    {/* Student or Unlinked Badge */}
                    {m.is_unrecognized_sender ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-lg border border-amber-200 dark:border-amber-900/50">
                        <AlertCircle className="h-3 w-3 text-amber-500" /> Unlinked Sender
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-900/50">
                        <User className="h-3 w-3 text-emerald-500" /> Student: {m.student_name}
                      </span>
                    )}

                    {/* Complaint Flag */}
                    {m.is_complaint && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-lg border border-rose-200 dark:border-rose-900/50">
                        <Lock className="h-3 w-3 text-rose-500" /> HQ Complaint (#complaint)
                      </span>
                    )}

                    {/* Phone Number */}
                    <span className="text-xs font-mono font-semibold text-slate-500 flex items-center gap-1">
                      <Phone className="h-3 w-3" /> {m.sender_phone}
                    </span>
                  </div>

                  {/* Message Content */}
                  <p className="text-xs text-slate-800 dark:text-slate-200 font-medium bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 leading-relaxed">
                    {m.message_text}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] font-mono text-slate-400 block">
                    {m.created_at ? new Date(m.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : ''}
                  </span>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md inline-block mt-1 ${
                    m.direction === "INBOUND"
                      ? "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                      : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                  }`}>
                    {m.direction}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
