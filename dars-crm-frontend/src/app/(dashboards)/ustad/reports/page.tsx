"use client";
import React, { useState } from 'react';
import toast from 'react-hot-toast';

export interface StudentItem {
  id: string;
  name: string;
  department: string;
  status: 'DRAFT_READY' | 'APPROVED' | 'SENT' | 'FAILED';
  rawContext: {
    fajrJamaatPct: number;
    sabaqDetails: string;
    tajweedGrade: string;
    ustadNotes: string;
  };
  draftReport: string;
}

const MOCK_STUDENTS: StudentItem[] = [
  {
    id: "std-001",
    name: "Abdullah Ibn Zaid",
    department: "HIFZ",
    status: "DRAFT_READY",
    rawContext: {
      fajrJamaatPct: 85,
      sabaqDetails: "Surah Al-Mulk v.1-12",
      tajweedGrade: "EXCELLENT",
      ustadNotes: "Missed Fajr twice. Good Adab in boarding. Tajweed is improving, especially Makharij MashaAllah."
    },
    draftReport: "Assalamu Alaikum wa Rahmatullah,\n\nDear Respectable Parent,\n\nAlhamdulillah, Abdullah Ibn Zaid has shown steady progress in Surah Al-Mulk (v.1-12) with an EXCELLENT Tajweed grade. His Fajr Jamaat attendance stands at 85%. MashaAllah, his Makharij pronunciation is improving consistently.\n\nPlease encourage him to maintain punctual Fajr attendance.\n\nJazakAllah Khair,\nHafiz Ahmad (Ustad)"
  },
  {
    id: "std-002",
    name: "Zaid Ibn Harith",
    department: "HIFZ",
    status: "APPROVED",
    rawContext: {
      fajrJamaatPct: 96,
      sabaqDetails: "Surah Al-Baqarah v.180-200",
      tajweedGrade: "EXCELLENT",
      ustadNotes: "Punctual in all 5 prayers. Excellent memorization retention."
    },
    draftReport: "Assalamu Alaikum wa Rahmatullah,\n\nZaid has memorized Surah Al-Baqarah v.180-200 with precision and 96% Fajr attendance. MashaAllah."
  }
];

export default function UstadReportsPage() {
  const [students, setStudents] = useState<StudentItem[]>(MOCK_STUDENTS);
  const [selectedStudentId, setSelectedStudentId] = useState<string>("std-001");
  const [reportText, setReportText] = useState<string>(MOCK_STUDENTS[0].draftReport);

  const selectedStudent = students.find((s) => s.id === selectedStudentId) || students[0];

  const handleSelectStudent = (student: StudentItem) => {
    setSelectedStudentId(student.id);
    setReportText(student.draftReport);
  };

  const handleApprove = async () => {
    try {
      setStudents((prev) =>
        prev.map((s) =>
          s.id === selectedStudent.id ? { ...s, status: 'SENT', draftReport: reportText } : s
        )
      );
      toast.success(`Alhamdulillah, report approved and sent to parents of ${selectedStudent.name}!`);
    } catch (err) {
      toast.error("Failed to approve report.");
    }
  };

  const handleDiscard = () => {
    setStudents((prev) =>
      prev.map((s) => (s.id === selectedStudent.id ? { ...s, status: 'DRAFT_READY', draftReport: "" } : s))
    );
    setReportText("");
    toast.success(`Draft discarded for ${selectedStudent.name}.`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Ustad AI Report Reviewer</h1>
        <p className="text-sm text-slate-600">Human-in-the-Loop AI Draft Validation before Parent Dispatch</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col md:flex-row h-[700px]">
        {/* Left Sidebar: Student Queue */}
        <div className="w-full md:w-1/3 border-r border-slate-200 bg-slate-50 flex flex-col">
          <div className="p-4 border-b border-slate-200 bg-white">
            <h2 className="font-bold text-slate-800 text-sm">Halqa Student Queue</h2>
          </div>
          <ul className="divide-y divide-slate-200 overflow-y-auto flex-1">
            {students.map((std) => {
              const isSelected = std.id === selectedStudentId;
              return (
                <li
                  key={std.id}
                  onClick={() => handleSelectStudent(std)}
                  className={`p-4 cursor-pointer transition flex flex-col gap-1.5 ${
                    isSelected ? 'bg-white border-l-4 border-l-emerald-600 shadow-xs' : 'hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-slate-900">{std.name}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      std.status === 'SENT' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {std.status}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500">Dept: {std.department} | Fajr: {std.rawContext.fajrJamaatPct}%</span>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Right Content: Human-in-the-Loop Editor */}
        <div className="w-full md:w-2/3 p-6 flex flex-col gap-4 bg-white">
          {/* Ground Truth Data */}
          <div className="bg-emerald-50/70 border border-emerald-200 p-4 rounded-lg text-xs text-emerald-950">
            <h3 className="font-bold text-emerald-900 mb-2">Raw Monthly Ground Truth Data (Reference)</h3>
            <div className="grid grid-cols-2 gap-2 text-emerald-900">
              <p><span className="font-semibold">Fajr Jamaat:</span> {selectedStudent.rawContext.fajrJamaatPct}%</p>
              <p><span className="font-semibold">Sabaq Progress:</span> {selectedStudent.rawContext.sabaqDetails}</p>
              <p className="col-span-2 text-slate-600 italic">
                Ustad Notes: "{selectedStudent.rawContext.ustadNotes}"
              </p>
            </div>
          </div>

          {/* AI Draft Editor */}
          <div className="flex-1 flex flex-col gap-2">
            <label className="font-bold text-slate-700 text-xs">AI Generated Draft (Edit before sending):</label>
            <textarea
              className="w-full flex-1 p-4 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 outline-none leading-relaxed"
              value={reportText}
              onChange={(e) => setReportText(e.target.value)}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
            <button onClick={handleDiscard} className="px-4 py-2 text-xs font-semibold text-rose-600 bg-rose-50 rounded-lg hover:bg-rose-100">
              Discard Draft
            </button>
            <button onClick={handleApprove} className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700">
              Approve & Send Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
