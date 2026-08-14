"use client";

import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import {
  MessageSquare,
  Search,
  UserCheck,
  Send,
  AlertCircle,
  CheckCircle2,
  Phone,
  User,
  Building,
  RefreshCw,
  X,
  Link as LinkIcon,
  ShieldAlert,
  Loader2
} from "lucide-react";

interface UnlinkedMessage {
  id: string;
  direction: "INBOUND" | "OUTBOUND";
  sender_phone: string;
  recipient_phone: string;
  message_text: string;
  created_at: string;
}

interface UnlinkedThread {
  sender_phone: string;
  message_count: number;
  last_message: string;
  last_message_at: string;
  messages: UnlinkedMessage[];
}

interface StudentOption {
  id: string;
  full_name: string;
  username: string;
  center_name?: string;
}

export default function NazimWhatsAppTriagingPage() {
  const [threads, setThreads] = useState<UnlinkedThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhone, setSelectedPhone] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal State for Rerouting
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [studentSearch, setStudentSearch] = useState("");
  const [rerouting, setRerouting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const token = Cookies.get("dars_auth_token");

  useEffect(() => {
    fetchUnlinkedThreads();
    fetchStudentRoster();
  }, []);

  const fetchUnlinkedThreads = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/v1/whatsapp/nazim/unlinked", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setThreads(data);
        if (data.length > 0 && !selectedPhone) {
          setSelectedPhone(data[0].sender_phone);
        }
      }
    } catch (e) {
      console.error("Failed to fetch unlinked threads", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentRoster = async () => {
    try {
      const res = await fetch("/api/v1/users?role=STUDENT", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setStudents(data);
      }
    } catch (e) {
      console.error("Failed to fetch student roster", e);
    }
  };

  const handleSendNazimReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPhone || !replyText.trim()) return;

    try {
      setSending(true);
      const res = await fetch("/api/v1/whatsapp/nazim/reply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          sender_phone: selectedPhone,
          message_text: replyText.trim(),
        }),
      });

      if (res.ok) {
        setReplyText("");
        await fetchUnlinkedThreads();
      }
    } catch (e) {
      console.error("Failed to send reply", e);
    } finally {
      setSending(false);
    }
  };

  const handleRerouteStudent = async (studentId: string) => {
    if (!selectedPhone) return;

    try {
      setRerouting(true);
      const res = await fetch("/api/v1/whatsapp/nazim/re-route", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          sender_phone: selectedPhone,
          student_id: studentId,
        }),
      });

      if (res.ok) {
        const result = await res.json();
        setToastMessage(`Success! Thread linked to student ${result.student_name} and transferred to Usthad's workspace.`);
        setIsModalOpen(false);
        setSelectedPhone(null);
        await fetchUnlinkedThreads();
        setTimeout(() => setToastMessage(null), 5000);
      } else {
        const err = await res.json();
        alert(`Error: ${err.detail || "Failed to re-route thread"}`);
      }
    } catch (e) {
      console.error("Failed to re-route thread", e);
    } finally {
      setRerouting(false);
    }
  };

  const activeThread = threads.find((t) => t.sender_phone === selectedPhone);

  const filteredThreads = threads.filter(
    (t) =>
      t.sender_phone.includes(searchTerm) ||
      t.last_message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredStudents = students.filter(
    (s) =>
      s.full_name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.username.toLowerCase().includes(studentSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 rounded-2xl border border-slate-800 text-white shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500/20 border border-amber-500/30 text-amber-400 rounded-xl">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight">Unlinked WhatsApp Triaging</h1>
              <span className="bg-amber-500/20 text-amber-400 text-xs font-bold px-2.5 py-0.5 rounded-full border border-amber-500/30">
                v2 Verification Engine
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Verify unregistered parent messages, chat directly as Nazim, and re-route threads to assigned Usthad.
            </p>
          </div>
        </div>

        <button
          onClick={fetchUnlinkedThreads}
          className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-2 border border-slate-700 transition"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh Feed
        </button>
      </div>

      {/* Success Notification Banner */}
      {toastMessage && (
        <div className="p-4 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl flex items-center gap-3 text-emerald-700 dark:text-emerald-300 animate-fadeIn">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
          <p className="text-sm font-semibold">{toastMessage}</p>
        </div>
      )}

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Unlinked Sender Threads (4 cols) */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col h-[700px]">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-500" />
                Unlinked Senders ({threads.length})
              </h2>
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-md">
                Locked from Usthad
              </span>
            </div>

            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search phone or text..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
            {loading ? (
              <div className="p-8 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
                Loading unlinked messages...
              </div>
            ) : filteredThreads.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-xs">
                <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-2 opacity-60" />
                <p className="font-bold text-slate-700 dark:text-slate-300">All Parents Verified!</p>
                <p className="text-[11px] text-slate-500 mt-1">No unlinked sender messages pending triage.</p>
              </div>
            ) : (
              filteredThreads.map((thread) => {
                const isSelected = thread.sender_phone === selectedPhone;
                return (
                  <button
                    key={thread.sender_phone}
                    onClick={() => setSelectedPhone(thread.sender_phone)}
                    className={`w-full text-left p-4 transition-all flex flex-col gap-2 ${
                      isSelected
                        ? "bg-amber-50/70 dark:bg-amber-950/20 border-l-4 border-amber-500"
                        : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white text-xs">
                        <Phone className="h-3.5 w-3.5 text-amber-500" />
                        {thread.sender_phone}
                      </div>
                      <span className="text-[10px] font-semibold text-slate-400">
                        {thread.last_message_at ? new Date(thread.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {thread.last_message}
                    </p>

                    <div className="flex items-center justify-between pt-1">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 px-2 py-0.5 rounded-full">
                        Unlinked Sender
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {thread.message_count} message(s)
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Nazim Chat Verification & Re-Route Console (8 cols) */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col h-[700px]">
          {activeThread ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/40">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-amber-100 dark:bg-amber-900/40 text-amber-600 rounded-xl">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                      {activeThread.sender_phone}
                      <span className="text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-md font-semibold border border-amber-500/20">
                        Pending Verification
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      Nazim Workspace • Verify parent identity & link to student roster
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsModalOpen(true)}
                  className="w-full sm:w-auto px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition active:scale-95"
                >
                  <LinkIcon className="h-4 w-4" /> Link & Re-Route Thread
                </button>
              </div>

              {/* Chat Message History Window */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/30 dark:bg-slate-950/20">
                <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-xl text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
                  <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5 text-amber-600" />
                  <div>
                    <span className="font-bold">Security Notice:</span> This phone number is not yet registered in the student roster. Standard Usthads cannot view this thread. As Nazim, ask the parent for their child's full name to verify their identity.
                  </div>
                </div>

                {activeThread.messages.map((m) => {
                  const isInbound = m.direction === "INBOUND";
                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isInbound ? "items-start" : "items-end"}`}
                    >
                      <div
                        className={`max-w-[80%] sm:max-w-[70%] p-3.5 rounded-2xl text-xs font-medium shadow-sm leading-relaxed ${
                          isInbound
                            ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-tl-none"
                            : "bg-emerald-600 text-white rounded-tr-none"
                        }`}
                      >
                        <p>{m.message_text}</p>
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 px-1">
                        {isInbound ? "Parent" : "Nazim Verification"} •{" "}
                        {m.created_at ? new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Chat Input Bar */}
              <form onSubmit={handleSendNazimReply} className="p-3 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Type message to parent as Nazim (e.g. 'Wa Alaikumussalam, please specify student name')..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-white"
                />
                <button
                  type="submit"
                  disabled={sending || !replyText.trim()}
                  className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-emerald-600/20 transition"
                >
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Send Message
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
              <MessageSquare className="h-12 w-12 text-slate-300 dark:text-slate-700 mb-3" />
              <h3 className="font-bold text-slate-700 dark:text-slate-300 text-base">Select an Unlinked Thread</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                Choose an unlinked WhatsApp thread from the left column to verify sender identity or re-route to an Usthad.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ACTIVE STUDENT ROSTER SEARCH & LINK MODAL */}
      {isModalOpen && selectedPhone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 rounded-xl">
                  <UserCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">Verify & Link Student Profile</h3>
                  <p className="text-xs text-slate-500">
                    Re-routing thread from <span className="font-bold text-slate-700 dark:text-slate-300">{selectedPhone}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search student by name or code (e.g. Azaan, STUD-401)..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-white"
              />
            </div>

            <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl">
              {filteredStudents.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  No matching student profiles found.
                </div>
              ) : (
                filteredStudents.map((st) => (
                  <div
                    key={st.id}
                    className="p-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-xs">
                        {st.full_name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white">{st.full_name}</h4>
                        <p className="text-[10px] text-slate-400 font-mono">@{st.username}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRerouteStudent(st.id)}
                      disabled={rerouting}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition active:scale-95 shadow-sm"
                    >
                      {rerouting ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <LinkIcon className="h-3.5 w-3.5" />
                      )}
                      Link & Re-Route
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 text-[11px] text-slate-500 flex items-start gap-1.5 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>
                Linking will permanently associate phone <span className="font-bold text-slate-700 dark:text-slate-300">{selectedPhone}</span> to the selected student profile, update all historical messages, and hand the thread off to their assigned Usthad.
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
