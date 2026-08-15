"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { 
  BookOpen, Search, ShieldCheck, Lock, Unlock, CheckCircle2, AlertCircle, 
  Sparkles, Building2, RefreshCw, Loader2, Bookmark, Check, ShieldAlert, KeyRound
} from "lucide-react";
import toast from "react-hot-toast";

interface HadithResult {
  id: string;
  collection: string;
  book_no: string;
  book_name: string;
  hadith_no: string;
  narrator: string;
  text_ar: string;
  text_en: string;
  verification_status: "verified" | "unverified";
  authenticity: string;
}

interface CenterConfig {
  id: string;
  name: string;
  code: string;
  is_enabled_for_all: boolean;
  is_hadith_api_active: boolean;
  updated_at?: string;
}

export default function DigitalLibraryPage() {
  const [activeTab, setActiveTab] = useState<"search" | "access">("search");
  
  // Search Engine State
  const [searchQuery, setSearchQuery] = useState("shalat malam");
  const [searchType, setSearchType] = useState("hadith");
  const [hadithResults, setHadithResults] = useState<HadithResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [verifiedMap, setVerifiedMap] = useState<Record<string, boolean>>({});

  // Center Access Control State
  const [centers, setCenters] = useState<CenterConfig[]>([]);
  const [loadingCenters, setLoadingCenters] = useState(false);
  const [togglingCenterId, setTogglingCenterId] = useState<string | null>(null);

  // Suggested Topics
  const quickTopics = [
    { label: "Tahajjud / Night Prayer", query: "shalat malam" },
    { label: "Fajr Prayer", query: "fajr" },
    { label: "Fast of Ramadan", query: "fasting ramadan" },
    { label: "Charity & Sadaqah", query: "charity sadaqah" },
    { label: "Adab & Good Manners", query: "good manners adab" }
  ];

  // Fetch Hadiths
  const handleSearch = async (queryToUse?: string) => {
    const q = queryToUse !== undefined ? queryToUse : searchQuery;
    if (!q.trim()) return;

    setSearching(true);
    try {
      const res = await api.post("/library/search", {
        q: q,
        limit: 10,
        type: searchType
      }, {
        headers: {
          "X-User-Role": "super_admin"
        }
      });

      if (res.data && res.data.results) {
        setHadithResults(res.data.results);
      } else {
        setHadithResults([]);
      }
    } catch (err: any) {
      toast.error("Failed to search Hadith database: " + (err.response?.data?.detail || err.message));
    } finally {
      setSearching(false);
    }
  };

  // Fetch Centers & Library Configs
  const fetchCenters = async () => {
    setLoadingCenters(true);
    try {
      const res = await api.get("/centers");
      const fetchedCenters = res.data || [];
      
      // Fetch library configs for each center
      const configsPromises = fetchedCenters.map(async (c: any) => {
        try {
          const cfgRes = await api.get(`/library/config/${c.id}`);
          return {
            ...c,
            is_enabled_for_all: cfgRes.data?.is_enabled_for_all ?? false,
            is_hadith_api_active: cfgRes.data?.is_hadith_api_active ?? true,
            updated_at: cfgRes.data?.updated_at
          };
        } catch {
          return {
            ...c,
            is_enabled_for_all: false,
            is_hadith_api_active: true
          };
        }
      });

      const fullCenters = await Promise.all(configsPromises);
      setCenters(fullCenters);
    } catch (err: any) {
      toast.error("Failed to fetch center library configurations");
    } finally {
      setLoadingCenters(false);
    }
  };

  useEffect(() => {
    handleSearch("shalat malam");
    fetchCenters();
  }, []);

  // Toggle Library Access for a Center
  const handleToggleAccess = async (centerId: string, currentStatus: boolean) => {
    setTogglingCenterId(centerId);
    try {
      const newStatus = !currentStatus;
      await api.patch(`/library/config/${centerId}`, {
        is_enabled_for_all: newStatus
      });

      setCenters(prev =>
        prev.map(c => (c.id === centerId ? { ...c, is_enabled_for_all: newStatus } : c))
      );

      toast.success(
        newStatus 
          ? "Unlocked Digital Library for Students & Teachers in center!" 
          : "Locked Library access for Super Admin Alim verification"
      );
    } catch (err: any) {
      toast.error("Failed to update center access lock");
    } finally {
      setTogglingCenterId(null);
    }
  };

  const handleToggleVerifyHadith = (hadithId: string) => {
    setVerifiedMap(prev => ({
      ...prev,
      [hadithId]: !prev[hadithId]
    }));
    toast.success("Hadith verification status updated");
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 bg-slate-50 min-h-screen">
      {/* --- TOP HEADER & TITLE --- */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Digital Hadith Library &amp; Alim Verification Engine
              </h1>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Authentic Sunnah Cloud Proxy &amp; Scholastic Access Control Console
              </p>
            </div>
          </div>
        </div>

        {/* API STATUS BADGE */}
        <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
            <KeyRound className="h-4 w-4" />
          </div>
          <div className="text-xs">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <span>Sunnah Cloud API</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
            <p className="text-[11px] text-slate-500">Server-Side API Key Protected (Hidden from Client)</p>
          </div>
        </div>
      </div>

      {/* --- MAIN TAB NAVIGATION --- */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          onClick={() => setActiveTab("search")}
          className={`pb-3 px-4 text-xs font-extrabold flex items-center gap-2 border-b-2 transition ${
            activeTab === "search"
              ? "border-emerald-600 text-emerald-700 bg-emerald-50/50 rounded-t-xl"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Search className="h-4 w-4" /> Hadith Search &amp; Alim Verification
        </button>

        <button
          onClick={() => setActiveTab("access")}
          className={`pb-3 px-4 text-xs font-extrabold flex items-center gap-2 border-b-2 transition ${
            activeTab === "access"
              ? "border-emerald-600 text-emerald-700 bg-emerald-50/50 rounded-t-xl"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Lock className="h-4 w-4" /> Center Access Control Console ({centers.length})
        </button>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: HADITH SEARCH & VERIFICATION                       */}
      {/* ========================================================= */}
      {activeTab === "search" && (
        <div className="space-y-6">
          {/* SEARCH BAR CARD */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSearch();
              }}
              className="flex flex-col md:flex-row gap-3"
            >
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search Hadith by keyword (e.g. 'shalat malam', 'tahajjud', 'fasting')..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                />
              </div>

              <select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="hadith">Hadith Text</option>
                <option value="book">Book Name</option>
                <option value="author">Narrator / Author</option>
              </select>

              <button
                type="submit"
                disabled={searching}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-6 py-3 rounded-xl text-sm transition shadow-sm flex items-center justify-center gap-2"
              >
                {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />} Search Library
              </button>
            </form>

            {/* QUICK TOPIC SUGGESTIONS */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
              <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Quick Topics:</span>
              {quickTopics.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSearchQuery(item.query);
                    handleSearch(item.query);
                  }}
                  className="px-3 py-1 rounded-full bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 font-semibold border border-slate-200 transition"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* HADITH RESULTS FEED */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-emerald-600" /> Hadith Search Results ({hadithResults.length})
              </h2>
              <span className="text-xs text-slate-500">
                Alim verification mode active
              </span>
            </div>

            {searching ? (
              <div className="bg-white p-12 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center space-y-3">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                <p className="text-xs font-semibold text-slate-500">Querying Sunnah API &amp; authentic Hadith index...</p>
              </div>
            ) : hadithResults.length === 0 ? (
              <div className="bg-white p-12 rounded-2xl border border-slate-200 shadow-sm text-center space-y-3">
                <AlertCircle className="h-8 w-8 text-amber-500 mx-auto" />
                <p className="text-sm font-bold text-slate-800">No Hadiths Found</p>
                <p className="text-xs text-slate-500">Try searching for broader keywords like 'shalat', 'fasting', or 'tahajjud'.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {hadithResults.map((item) => {
                  const isVerified = verifiedMap[item.id] || item.verification_status === "verified";
                  return (
                    <div
                      key={item.id}
                      className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:border-emerald-300 transition space-y-5"
                    >
                      {/* HEADER METADATA & BADGES */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 bg-emerald-50 text-emerald-700 font-extrabold rounded-lg text-xs border border-emerald-200">
                            {item.collection}
                          </span>
                          <span className="text-xs font-semibold text-slate-500">
                            Book {item.book_no}: {item.book_name} • Hadith #{item.hadith_no}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full text-[11px] font-bold border border-amber-200">
                            {item.authenticity}
                          </span>

                          {isVerified ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full text-[11px] font-extrabold">
                              <CheckCircle2 className="h-3.5 w-3.5" /> Verified by Alim
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full text-[11px] font-bold">
                              <ShieldAlert className="h-3.5 w-3.5 text-amber-500" /> Pending Alim Review
                            </span>
                          )}
                        </div>
                      </div>

                      {/* ARABIC TEXT */}
                      <div className="bg-slate-50 p-5 rounded-xl border border-slate-200/80 text-right">
                        <p className="text-xl sm:text-2xl font-serif text-slate-900 leading-relaxed font-bold tracking-wide" style={{ fontFamily: "Traditional Arabic, Scheherazade, serif" }}>
                          {item.text_ar}
                        </p>
                      </div>

                      {/* NARRATOR & ENGLISH TRANSLATION */}
                      <div className="space-y-1.5">
                        <p className="text-xs font-bold text-emerald-700 italic">{item.narrator}</p>
                        <p className="text-sm text-slate-800 leading-relaxed font-medium">"{item.text_en}"</p>
                      </div>

                      {/* ACTION BUTTONS FOR ALIM VERIFICATION */}
                      <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                        <div className="text-xs text-slate-400 font-mono">
                          ID: {item.id}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleVerifyHadith(item.id)}
                            className={`text-xs px-4 py-2 rounded-xl font-extrabold flex items-center gap-1.5 transition ${
                              isVerified
                                ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                                : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
                            }`}
                          >
                            {isVerified ? (
                              <>
                                <Check className="h-4 w-4" /> Alim Verified
                              </>
                            ) : (
                              <>
                                <ShieldCheck className="h-4 w-4" /> Verify Hadith Content
                              </>
                            )}
                          </button>

                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(`${item.collection} - ${item.book_name} (#${item.hadith_no}): ${item.text_en}`);
                              toast.success("Hadith citation copied to clipboard!");
                            }}
                            className="text-xs px-3.5 py-2 rounded-xl font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                          >
                            📋 Copy Citation
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: CENTER ACCESS LOCK MANAGEMENT CONSOLE             */}
      {/* ========================================================= */}
      {activeTab === "access" && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Lock className="h-5 w-5 text-emerald-600" /> Center Library Lock Control Panel
            </h2>
            <p className="text-xs text-slate-500">
              By default, general search access is <strong>locked</strong> until the Super Admin (Alim) verifies Hadith contents. 
              Toggle access to <strong>Unlocked</strong> for specific Dars centers when ready.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {loadingCenters ? (
              <div className="p-12 flex justify-center items-center">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
              </div>
            ) : centers.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">
                No centers found in the system.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold text-[11px] tracking-wider">
                      <th className="py-3.5 px-6">Center Name</th>
                      <th className="py-3.5 px-6">Center Code</th>
                      <th className="py-3.5 px-6">Current Access State</th>
                      <th className="py-3.5 px-6">Sunnah API Status</th>
                      <th className="py-3.5 px-6 text-right">Alim Action Toggle</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {centers.map((center) => (
                      <tr key={center.id} className="hover:bg-slate-50 transition">
                        <td className="py-4 px-6 font-extrabold text-slate-900 flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-emerald-600" />
                          {center.name}
                        </td>
                        <td className="py-4 px-6 font-mono text-xs text-slate-600 font-bold">{center.code}</td>
                        <td className="py-4 px-6">
                          {center.is_enabled_for_all ? (
                            <span className="inline-flex items-center gap-1.5 text-xs font-extrabold bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-200">
                              <Unlock className="h-3.5 w-3.5" /> Unlocked for All Users
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-xs font-extrabold bg-amber-50 text-amber-800 px-3 py-1 rounded-full border border-amber-200">
                              <Lock className="h-3.5 w-3.5" /> Locked (Alim Only)
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6">
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-100">
                            <CheckCircle2 className="h-3 w-3" /> Active Proxy
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() => handleToggleAccess(center.id, center.is_enabled_for_all)}
                            disabled={togglingCenterId === center.id}
                            className={`text-xs px-4 py-2 rounded-xl font-extrabold transition flex items-center gap-1.5 ml-auto ${
                              center.is_enabled_for_all
                                ? "bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200"
                                : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
                            }`}
                          >
                            {togglingCenterId === center.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : center.is_enabled_for_all ? (
                              <>
                                <Lock className="h-3.5 w-3.5" /> Lock for Verification
                              </>
                            ) : (
                              <>
                                <Unlock className="h-3.5 w-3.5" /> Unlock Library
                              </>
                            )}
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
      )}
    </div>
  );
}
