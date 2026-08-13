"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Building2, Users, DollarSign, ShieldAlert, ArrowRight, Loader2, Sparkles } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

interface Center {
  id: string;
  name: string;
  status: string;
}

export default function SuperAdminPage() {
  const [centersCount, setCentersCount] = useState(0);
  const [activeCentersCount, setActiveCentersCount] = useState(0);
  const [totalZakat, setTotalZakat] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchGlobalStats() {
      try {
        const [cRes, fRes] = await Promise.all([
          api.get("/centers").catch(() => ({ data: [] })),
          api.get("/finance/global-stats/zakat").catch(() => ({ data: { global_collected: 0 } }))
        ]);

        const centers: Center[] = cRes.data || [];
        setCentersCount(centers.length);
        setActiveCentersCount(centers.filter(c => c.status === "ACTIVE").length);
        setTotalZakat(fRes.data?.global_collected || 0);
      } catch (err) {
        toast.error("Failed to load global system statistics");
      } finally {
        setLoading(false);
      }
    }
    fetchGlobalStats();
  }, []);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 bg-slate-50 min-h-screen">
      {/* --- HEADER --- */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Super Admin Global Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Multi-tenant management and cross-Masjid operational control</p>
      </div>

      {/* --- GLOBAL METRIC CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Registered Centers</p>
            <p className="text-3xl font-black text-slate-900 mt-1">{centersCount}</p>
            <p className="text-xs text-emerald-600 font-medium mt-1">{activeCentersCount} Currently Active</p>
          </div>
          <div className="p-3.5 bg-slate-100 rounded-xl text-slate-800">
            <Building2 className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Global Zakat Collected</p>
            <p className="text-3xl font-black text-emerald-600 mt-1">₹{totalZakat.toLocaleString()}</p>
            <p className="text-xs text-slate-400 mt-1">Cross-tenant Zakat ledger</p>
          </div>
          <div className="p-3.5 bg-emerald-50 rounded-xl text-emerald-600">
            <DollarSign className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Security & Compliance</p>
            <p className="text-3xl font-black text-indigo-600 mt-1">RLS Active</p>
            <p className="text-xs text-slate-400 mt-1">Tenant Isolation Guard Enabled</p>
          </div>
          <div className="p-3.5 bg-indigo-50 rounded-xl text-indigo-600">
            <ShieldAlert className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* --- QUICK WORKSPACE MODULE SHORTCUTS --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          href="/super-admin/centers"
          className="group bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-300 transition flex items-center justify-between"
        >
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-emerald-600" />
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition">
                Manage Centers & Nazims
              </h3>
            </div>
            <p className="text-xs text-slate-500 max-w-sm">
              Register new Dars centers, assign center codes, create Nazim credentials, and manage tenant statuses.
            </p>
          </div>
          <ArrowRight className="h-5 w-5 text-slate-400 group-hover:translate-x-1 group-hover:text-emerald-600 transition" />
        </Link>

        <Link
          href="/super-admin/finance"
          className="group bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-300 transition flex items-center justify-between"
        >
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-600" />
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition">
                Global Zakat & AI Assistant
              </h3>
            </div>
            <p className="text-xs text-slate-500 max-w-sm">
              Audit global Zakat allocations, view center-by-center ledger bar charts, and query live data with AI.
            </p>
          </div>
          <ArrowRight className="h-5 w-5 text-slate-400 group-hover:translate-x-1 group-hover:text-indigo-600 transition" />
        </Link>
      </div>
    </div>
  );
}
