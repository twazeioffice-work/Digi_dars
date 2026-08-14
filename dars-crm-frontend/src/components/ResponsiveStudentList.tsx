"use client";

import { CheckCircle2, XCircle, Calendar, PhoneCall, Clock } from "lucide-react";

export interface StudentListItem {
  id: string;
  name: string;
  hifz: string;
  status: "PRESENT" | "ABSENT" | "LEAVE" | "UNMARKED" | string;
}

interface Props {
  students?: StudentListItem[];
  onMarkAttendance?: (studentId: string, status: "PRESENT" | "ABSENT") => void;
  onOpenLeaveModal?: (student: StudentListItem) => void;
}

export default function ResponsiveStudentList({
  students = [],
  onMarkAttendance,
  onOpenLeaveModal
}: Props) {
  return (
    <div className="w-full max-w-5xl mx-auto mt-4">
      {/* --------------------------------------------------- */}
      {/* 1. MOBILE VIEW: Stacked Cards with Quick Action Buttons */}
      {/* --------------------------------------------------- */}
      <div className="block md:hidden space-y-3">
        {students.map((student) => (
          <div 
            key={student.id} 
            className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                  {student.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                  <span>📖</span> {student.hifz}
                </p>
              </div>

              {/* Status Pill */}
              <div>
                {student.status === "PRESENT" ? (
                  <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full text-xs font-bold border border-emerald-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Present
                  </span>
                ) : student.status === "ABSENT" ? (
                  <span className="inline-flex items-center gap-1 bg-rose-100 text-rose-800 px-2.5 py-1 rounded-full text-xs font-bold border border-rose-300">
                    <XCircle className="w-3.5 h-3.5 text-rose-600" /> Absent
                  </span>
                ) : student.status === "LEAVE" ? (
                  <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full text-xs font-bold border border-amber-300">
                    <Calendar className="w-3.5 h-3.5 text-amber-600" /> On Leave
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full text-xs font-bold border border-slate-300">
                    <Clock className="w-3.5 h-3.5 text-slate-400" /> Unmarked
                  </span>
                )}
              </div>
            </div>

            {/* Quick Action Buttons */}
            {onMarkAttendance && (
              <div className="flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => onMarkAttendance(student.id, "PRESENT")}
                  className={`flex-1 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition ${
                    student.status === "PRESENT"
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Present
                </button>

                <button
                  onClick={() => onMarkAttendance(student.id, "ABSENT")}
                  className={`flex-1 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition ${
                    student.status === "ABSENT"
                      ? "bg-rose-600 text-white shadow-sm"
                      : "bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200"
                  }`}
                >
                  <XCircle className="w-3.5 h-3.5" /> Absent
                </button>

                {onOpenLeaveModal && (
                  <button
                    onClick={() => onOpenLeaveModal(student)}
                    className={`flex-1 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition ${
                      student.status === "LEAVE"
                        ? "bg-amber-600 text-white shadow-sm"
                        : "bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200"
                    }`}
                  >
                    <PhoneCall className="w-3.5 h-3.5" /> Emergency Leave
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* --------------------------------------------------- */}
      {/* 2. DESKTOP VIEW: Data Table with Interactive Buttons */}
      {/* --------------------------------------------------- */}
      <div className="hidden md:block overflow-hidden bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <table className="min-w-full text-left text-sm whitespace-nowrap">
          <thead className="uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400">
            <tr>
              <th scope="col" className="px-6 py-4 font-semibold text-xs">Student Name</th>
              <th scope="col" className="px-6 py-4 font-semibold text-xs">Current Sabaq</th>
              <th scope="col" className="px-6 py-4 font-semibold text-xs">Current Status</th>
              <th scope="col" className="px-6 py-4 font-semibold text-xs text-right">Attendance / Emergency Leave Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-900 dark:text-slate-100">
            {students.map((student) => (
              <tr key={student.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <td className="px-6 py-4 font-bold text-base">{student.name}</td>
                <td className="px-6 py-4 text-slate-500 dark:text-slate-400 font-medium">{student.hifz}</td>
                <td className="px-6 py-4">
                  {student.status === "PRESENT" ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Present
                    </span>
                  ) : student.status === "ABSENT" ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
                      <XCircle className="w-3.5 h-3.5 text-rose-600" /> Absent
                    </span>
                  ) : student.status === "LEAVE" ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                      <Calendar className="w-3.5 h-3.5 text-amber-600" /> On Leave
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
                      <Clock className="w-3.5 h-3.5 text-slate-400" /> Unmarked
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  {onMarkAttendance && (
                    <div className="inline-flex items-center gap-2">
                      <button
                        onClick={() => onMarkAttendance(student.id, "PRESENT")}
                        className={`px-3 py-1.5 rounded-lg font-bold text-xs inline-flex items-center gap-1 transition ${
                          student.status === "PRESENT"
                            ? "bg-emerald-600 text-white shadow-sm"
                            : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Present
                      </button>

                      <button
                        onClick={() => onMarkAttendance(student.id, "ABSENT")}
                        className={`px-3 py-1.5 rounded-lg font-bold text-xs inline-flex items-center gap-1 transition ${
                          student.status === "ABSENT"
                            ? "bg-rose-600 text-white shadow-sm"
                            : "bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200"
                        }`}
                      >
                        <XCircle className="w-3.5 h-3.5" /> Absent
                      </button>

                      {onOpenLeaveModal && (
                        <button
                          onClick={() => onOpenLeaveModal(student)}
                          className={`px-3 py-1.5 rounded-lg font-bold text-xs inline-flex items-center gap-1 transition ${
                            student.status === "LEAVE"
                              ? "bg-amber-600 text-white shadow-sm"
                              : "bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200"
                          }`}
                        >
                          <PhoneCall className="w-3.5 h-3.5" /> Apply Emergency Leave
                        </button>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
