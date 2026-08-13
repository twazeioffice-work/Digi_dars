"use client";

import { CheckCircle2, XCircle } from "lucide-react";

export interface StudentListItem {
  id: string | number;
  name: string;
  hifz: string;
  status: "PRESENT" | "ABSENT" | string;
}

const defaultMockStudents: StudentListItem[] = [
  { id: 1, name: "Ahmed Ali", hifz: "Surah Yaseen (Page 4)", status: "PRESENT" },
  { id: 2, name: "Zaid Khan", hifz: "Surah Mulk (Page 2)", status: "ABSENT" },
  { id: 3, name: "Bilal Hussain", hifz: "Juz 30 (Surah Naba)", status: "PRESENT" },
  { id: 4, name: "Umar Farooq", hifz: "Surah Baqarah (Juz 2)", status: "PRESENT" },
];

interface Props {
  students?: StudentListItem[];
}

export default function ResponsiveStudentList({ students = defaultMockStudents }: Props) {
  const displayStudents = students.length > 0 ? students : defaultMockStudents;

  return (
    <div className="w-full max-w-5xl mx-auto mt-6">
      
      {/* --------------------------------------------------- */}
      {/* 1. MOBILE VIEW: Stacked Cards (Hidden on Desktop)   */}
      {/* --------------------------------------------------- */}
      <div className="block md:hidden space-y-3">
        {displayStudents.map((student) => (
          <div 
            key={student.id} 
            className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex justify-between items-center min-h-[72px] active:scale-[0.99] transition-transform"
          >
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                {student.name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                <span>📖</span> {student.hifz}
              </p>
            </div>
            <div>
              {student.status === "PRESENT" ? (
                <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 px-3 py-1.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle2 className="text-emerald-600 dark:text-emerald-400 w-5 h-5" />
                  <span className="text-xs font-bold">Present</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 px-3 py-1.5 rounded-full border border-rose-200 dark:border-rose-800">
                  <XCircle className="text-rose-600 dark:text-rose-400 w-5 h-5" />
                  <span className="text-xs font-bold">Absent</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* --------------------------------------------------- */}
      {/* 2. DESKTOP VIEW: Data Table (Hidden on Mobile)      */}
      {/* --------------------------------------------------- */}
      <div className="hidden md:block overflow-hidden bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <table className="min-w-full text-left text-sm whitespace-nowrap">
          <thead className="uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400">
            <tr>
              <th scope="col" className="px-6 py-4 font-semibold text-xs">Student Name</th>
              <th scope="col" className="px-6 py-4 font-semibold text-xs">Current Sabaq</th>
              <th scope="col" className="px-6 py-4 font-semibold text-xs text-right">Attendance Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-900 dark:text-slate-100">
            {displayStudents.map((student) => (
              <tr key={student.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <td className="px-6 py-4 font-semibold text-base">{student.name}</td>
                <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{student.hifz}</td>
                <td className="px-6 py-4 text-right">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                    student.status === "PRESENT" 
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800" 
                      : "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border border-rose-200 dark:border-rose-800"
                  }`}>
                    {student.status === "PRESENT" ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                    )}
                    {student.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
