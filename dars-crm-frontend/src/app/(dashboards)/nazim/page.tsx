"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { 
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer 
} from "recharts";
import { Users, BookOpen, Activity, HeartHandshake, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

// The expected payload from the backend API
interface HalqaStat {
  id: string;
  name: string;
  ustad_name: string;
  student_count: number;
  avg_attendance: number;
  sabaq_completion_rate: number;
}

interface DashboardData {
  center_name: string;
  total_students: number;
  zakat_eligible_count: number;
  active_halqas: number;
  overall_attendance: number;
  attendance_trend: { date: string; percent: number }[];
  halqas: HalqaStat[];
}

export default function NazimDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        // This endpoint will implicitly use the Nazim's center_id from the JWT token
        const response = await api.get("/academic/dashboard/nazim");
        setData(response.data);
      } catch (error) {
        toast.error("Failed to load center statistics.");
      } finally {
        setLoading(false);
      }
    }
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 bg-gray-50 min-h-screen">
      {/* --- HEADER --- */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          {data?.center_name || "Center"} Overview
        </h1>
        <p className="text-gray-500">Local enrollment, Halqa performance, and Tarbiyyah metrics</p>
      </div>

      {/* --- KPI CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Enrollment</p>
            <p className="text-2xl font-bold text-gray-900">{data?.total_students || 0}</p>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg">
            <Users className="h-6 w-6 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Zakat Eligible</p>
            <p className="text-2xl font-bold text-emerald-600">{data?.zakat_eligible_count || 0}</p>
          </div>
          <div className="p-3 bg-emerald-50 rounded-lg">
            <HeartHandshake className="h-6 w-6 text-emerald-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Active Halqas</p>
            <p className="text-2xl font-bold text-indigo-600">{data?.active_halqas || 0}</p>
          </div>
          <div className="p-3 bg-indigo-50 rounded-lg">
            <BookOpen className="h-6 w-6 text-indigo-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Overall Attendance</p>
            <p className="text-2xl font-bold text-amber-600">{data?.overall_attendance || 0}%</p>
          </div>
          <div className="p-3 bg-amber-50 rounded-lg">
            <Activity className="h-6 w-6 text-amber-600" />
          </div>
        </div>
      </div>

      {/* --- TREND CHART & HALQA TABLE SPLIT --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: 30-Day Attendance Trend */}
        <div className="lg:col-span-1 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">30-Day Attendance</h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data?.attendance_trend || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} tickMargin={10} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value: any) => `${value}%`} />
                <Line 
                  type="monotone" 
                  dataKey="percent" 
                  stroke="#2563eb" 
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Col: Halqa Performance Table */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">Halqa Performance Matrix</h2>
            <button className="text-sm text-blue-600 font-medium hover:underline">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-gray-700 uppercase text-xs font-semibold">
                <tr>
                  <th className="px-6 py-4">Halqa / Class</th>
                  <th className="px-6 py-4">Ustad</th>
                  <th className="px-6 py-4">Students</th>
                  <th className="px-6 py-4">Avg Attendance</th>
                  <th className="px-6 py-4">Sabaq Progress</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data?.halqas.map((halqa) => (
                  <tr key={halqa.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{halqa.name}</td>
                    <td className="px-6 py-4">{halqa.ustad_name}</td>
                    <td className="px-6 py-4">{halqa.student_count}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        halqa.avg_attendance >= 90 ? 'bg-green-100 text-green-800' :
                        halqa.avg_attendance >= 75 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {halqa.avg_attendance}%
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${halqa.sabaq_completion_rate}%` }}
                          ></div>
                        </div>
                        <span className="text-xs">{halqa.sabaq_completion_rate}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
                {(!data?.halqas || data.halqas.length === 0) && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      No Halqas found for this center.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
