"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { 
  MessageSquare, Send, RefreshCw, Loader2, UserCheck, ShieldCheck, 
  CheckCircle2, AlertCircle, Lock, Phone 
} from "lucide-react";
import toast from "react-hot-toast";

interface WhatsAppMsg {
  id: string;
  sender_phone: string;
  recipient_phone: string;
  direction: "INBOUND" | "OUTBOUND";
  message_text: string;
  student_name?: string;
  is_complaint: boolean;
  created_at: string;
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

export default function UsthadWhatsAppChatPage() {
  const [messages, setMessages] = useState<WhatsAppMsg[]>([]);
  const [loading, setLoading] = useState(true);
  const [activePhone, setActivePhone] = useState<string>("");
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);

  const fetchMessages = async () => {
    try {
      const res = await api.get("/whatsapp/messages");
      const list = Array.isArray(res.data) ? res.data : [];
      setMessages(list);

      if (list.length > 0 && !activePhone) {
        setActivePhone(list[0].sender_phone);
      }
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to load WhatsApp messages"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePhone || !replyText.trim()) return;

    setSending(true);
    try {
      await api.post("/whatsapp/reply", {
        recipient_phone: activePhone,
        message_text: replyText.trim(),
      });
      toast.success("Reply dispatched to Parent's WhatsApp chat!");
      setReplyText("");
      fetchMessages();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to send WhatsApp reply"));
    } finally {
      setSending(false);
    }
  };

  // Group threads by phone number
  const threadPhones = Array.from(new Set(messages.map((m) => m.sender_phone))).filter((p) => p !== "USTHAD_CRM");
  const activeThread = messages.filter((m) => m.sender_phone === activePhone || m.recipient_phone === activePhone);

  return (
    <div className="p-8 space-y-8 bg-slate-50 min-h-screen">
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <MessageSquare className="h-8 w-8 text-emerald-600" /> Usthad WhatsApp Parent Communication Console
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Automatic WABA phone mapping routes incoming parent messages directly to your CRM inbox. Reply seamlessly to WhatsApp.
          </p>
        </div>

        <button
          onClick={fetchMessages}
          className="flex items-center gap-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold px-4 py-2.5 rounded-lg text-xs shadow-sm transition"
        >
          <RefreshCw className="h-4 w-4" /> Refresh Conversations
        </button>
      </div>

      {/* --- CHAT CONSOLE INTERFACE --- */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-3 min-h-[500px]">
        {/* THREADS LIST (LEFT) */}
        <div className="border-r border-slate-100 bg-slate-50 p-4 space-y-3">
          <h2 className="text-xs font-black uppercase text-slate-400 tracking-wider">Parent WhatsApp Threads</h2>

          {loading ? (
            <div className="flex h-32 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
            </div>
          ) : threadPhones.length === 0 ? (
            <div className="p-6 text-center text-slate-400 text-xs">
              No active parent WhatsApp messages yet.
            </div>
          ) : (
            <div className="space-y-2">
              {threadPhones.map((phone) => {
                const isSelected = phone === activePhone;
                const lastMsg = messages.filter((m) => m.sender_phone === phone || m.recipient_phone === phone).pop();

                return (
                  <button
                    key={phone}
                    onClick={() => setActivePhone(phone)}
                    className={`w-full text-left p-3.5 rounded-xl transition border ${
                      isSelected
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-900/20"
                        : "bg-white border-slate-200 hover:bg-slate-100 text-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs flex items-center gap-1">
                        <Phone className="h-3.5 w-3.5" /> {phone}
                      </span>
                      {lastMsg?.is_complaint && (
                        <span className="text-[10px] font-mono font-bold bg-rose-500 text-white px-2 py-0.5 rounded-full">
                          HQ Complaint
                        </span>
                      )}
                    </div>
                    {lastMsg && (
                      <p className={`text-xs mt-1 truncate ${isSelected ? "text-emerald-100" : "text-slate-500"}`}>
                        {lastMsg.message_text}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ACTIVE CONVERSATION & REPLY (RIGHT 2 COLS) */}
        <div className="md:col-span-2 flex flex-col justify-between p-6 space-y-4 bg-white">
          {activePhone ? (
            <>
              {/* THREAD HEADER */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <Phone className="h-4 w-4 text-emerald-600" /> Parent Chat: {activePhone}
                  </h3>
                  <p className="text-xs text-slate-400">Connected via Meta WABA Cloud API</p>
                </div>
                <span className="text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full uppercase">
                  WABA Auto-Mapped
                </span>
              </div>

              {/* MESSAGES FEED */}
              <div className="flex-1 overflow-y-auto space-y-3 p-2 max-h-[350px]">
                {activeThread.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.direction === "OUTBOUND" ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={`max-w-md p-3.5 rounded-2xl text-xs space-y-1 ${
                        msg.direction === "OUTBOUND"
                          ? "bg-indigo-600 text-white rounded-br-none"
                          : msg.is_complaint
                          ? "bg-rose-50 text-rose-900 border border-rose-200 rounded-bl-none font-medium"
                          : "bg-slate-100 text-slate-800 rounded-bl-none"
                      }`}
                    >
                      {msg.is_complaint && (
                        <div className="flex items-center gap-1 font-bold text-[10px] text-rose-700 uppercase mb-1">
                          <Lock className="h-3 w-3" /> Direct HQ Complaint (#complaint)
                        </div>
                      )}
                      <p className="leading-relaxed">{msg.message_text}</p>
                      <span className={`text-[9px] block text-right font-mono ${
                        msg.direction === "OUTBOUND" ? "text-indigo-200" : "text-slate-400"
                      }`}>
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* REPLY FORM */}
              <form onSubmit={handleSendReply} className="flex gap-2 pt-3 border-t border-slate-100">
                <input
                  type="text"
                  required
                  placeholder="Type WhatsApp reply to parent..."
                  className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                />
                <button
                  type="submit"
                  disabled={sending}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-5 py-3 rounded-xl shadow-sm transition flex items-center gap-1.5"
                >
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Send Reply
                </button>
              </form>
            </>
          ) : (
            <div className="flex h-full items-center justify-center text-slate-400 text-xs">
              Select a conversation from the left to start chatting with a parent.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
