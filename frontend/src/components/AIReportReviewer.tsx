import React, { useState } from 'react';

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
  },
  {
    id: "std-003",
    name: "Usama Ibn Zaid",
    department: "AALIM_COURSE",
    status: "FAILED",
    rawContext: {
      fajrJamaatPct: 60,
      sabaqDetails: "Nahw Mir - Lesson 14",
      tajweedGrade: "NEEDS_WORK",
      ustadNotes: "Struggling with grammatical analysis of verbs."
    },
    draftReport: ""
  }
];

export const AIReportReviewer: React.FC = () => {
  const [students, setStudents] = useState<StudentItem[]>(MOCK_STUDENTS);
  const [selectedStudentId, setSelectedStudentId] = useState<string>("std-001");
  const [editedText, setEditedText] = useState<string>(MOCK_STUDENTS[0].draftReport);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const selectedStudent = students.find((s) => s.id === selectedStudentId) || students[0];

  const handleSelectStudent = (student: StudentItem) => {
    setSelectedStudentId(student.id);
    setEditedText(student.draftReport);
  };

  const handleApproveAndSend = async () => {
    setToastMessage(`Approving report for ${selectedStudent.name}...`);
    try {
      // API Call to approve & dispatch background messaging task
      setStudents((prev) =>
        prev.map((s) =>
          s.id === selectedStudent.id ? { ...s, status: 'SENT', draftReport: editedText } : s
        )
      );
      setToastMessage(`Report approved and sent to parents of ${selectedStudent.name} via SMS/WhatsApp!`);
    } catch (err) {
      console.error(err);
      setToastMessage("Failed to approve report.");
    } finally {
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  const handleDiscard = () => {
    setStudents((prev) =>
      prev.map((s) => (s.id === selectedStudent.id ? { ...s, status: 'DRAFT_READY', draftReport: "" } : s))
    );
    setEditedText("");
    setToastMessage(`Draft discarded for ${selectedStudent.name}.`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleRetrySingle = (studentId: string) => {
    setToastMessage(`Re-queueing AI generation for student ${studentId}...`);
    setTimeout(() => {
      setStudents((prev) =>
        prev.map((s) =>
          s.id === studentId
            ? {
                ...s,
                status: 'DRAFT_READY',
                draftReport: `Assalamu Alaikum,\n\nRe-generated AI draft for ${s.name}. MashaAllah, progress in ${s.rawContext.sabaqDetails} is logged.`
              }
            : s
        )
      );
      setToastMessage("AI Draft successfully regenerated!");
      setTimeout(() => setToastMessage(null), 3000);
    }, 1500);
  };

  const getStatusBadge = (status: StudentItem['status']) => {
    switch (status) {
      case 'DRAFT_READY':
        return <span className="bg-amber-100 text-amber-800 text-xs px-2.5 py-1 rounded-full font-semibold">Draft Ready</span>;
      case 'APPROVED':
        return <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-1 rounded-full font-semibold">Approved</span>;
      case 'SENT':
        return <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-1 rounded-full font-semibold">Sent to Parent</span>;
      case 'FAILED':
        return <span className="bg-rose-100 text-rose-800 text-xs px-2.5 py-1 rounded-full font-semibold">Failed</span>;
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-md overflow-hidden flex flex-col md:flex-row h-[750px]">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="absolute top-4 right-4 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-lg shadow-lg text-xs font-medium animate-bounce">
          {toastMessage}
        </div>
      )}

      {/* Left Pane: Student Queue */}
      <div className="w-full md:w-1/3 border-r border-gray-200 bg-gray-50/50 flex flex-col">
        <div className="p-4 border-b border-gray-200 bg-white">
          <h2 className="font-bold text-gray-800 text-base">Halqa Student Queue</h2>
          <p className="text-xs text-gray-500">Select student to review or edit AI draft</p>
        </div>

        <ul className="divide-y divide-gray-200 overflow-y-auto flex-1">
          {students.map((std) => {
            const isSelected = std.id === selectedStudentId;
            return (
              <li
                key={std.id}
                onClick={() => handleSelectStudent(std)}
                className={`p-4 cursor-pointer transition-all duration-150 flex flex-col gap-2 ${
                  isSelected
                    ? 'bg-white border-l-4 border-l-emerald-600 shadow-sm'
                    : 'hover:bg-gray-100/80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-gray-900">{std.name}</span>
                  {getStatusBadge(std.status)}
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Dept: {std.department}</span>
                  <span>Fajr: {std.rawContext.fajrJamaatPct}%</span>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Right Pane: Human-in-the-Loop Workspace */}
      <div className="w-full md:w-2/3 p-6 flex flex-col gap-5 bg-white overflow-y-auto">
        {/* Context Card: Ground Truth Data */}
        <div className="bg-sky-50/80 border border-sky-200 rounded-xl p-4 text-xs text-sky-900 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-sky-950 text-sm flex items-center gap-1.5">
              <span>📊</span> Raw Monthly Ground Truth Data (Reference)
            </h3>
            <span className="bg-sky-200 text-sky-900 font-medium px-2 py-0.5 rounded">
              Verified Log
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sky-850">
            <div>
              <span className="text-sky-600 block">Fajr Jamaat Attendance:</span>
              <span className="font-semibold text-sm">{selectedStudent.rawContext.fajrJamaatPct}%</span>
            </div>
            <div>
              <span className="text-sky-600 block">Sabaq Progress:</span>
              <span className="font-semibold text-sm">{selectedStudent.rawContext.sabaqDetails}</span>
            </div>
            <div>
              <span className="text-sky-600 block">Tajweed Mastery:</span>
              <span className="font-semibold text-sm">{selectedStudent.rawContext.tajweedGrade}</span>
            </div>
            <div className="col-span-2 md:col-span-3 pt-2 border-t border-sky-200/60">
              <span className="text-sky-600 block">Ustad Remarks & Notes:</span>
              <p className="italic text-sky-900 mt-0.5 font-sans">
                "{selectedStudent.rawContext.ustadNotes}"
              </p>
            </div>
          </div>
        </div>

        {/* AI Draft Editor */}
        <div className="flex-1 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="font-bold text-gray-800 text-sm flex items-center gap-2">
              <span>🤖</span> AI Generated Draft (Human-in-the-Loop Review):
            </label>
            <span className="text-xs text-gray-500">Edit before final approval</span>
          </div>

          {selectedStudent.status === 'FAILED' ? (
            <div className="flex-1 border-2 border-dashed border-rose-200 rounded-xl p-8 flex flex-col items-center justify-center text-center bg-rose-50/30 gap-3">
              <span className="text-3xl">⚠️</span>
              <h4 className="font-bold text-rose-900 text-base">AI Generation Dropped / Failed</h4>
              <p className="text-xs text-rose-700 max-w-md">
                The background task timed out or was rate-limited. Click below to re-queue high priority generation.
              </p>
              <button
                onClick={() => handleRetrySingle(selectedStudent.id)}
                className="mt-2 bg-rose-600 hover:bg-rose-700 text-white font-medium text-xs px-4 py-2 rounded-lg transition-all"
              >
                🔄 Retry AI Generation
              </button>
            </div>
          ) : (
            <textarea
              className="w-full flex-1 min-h-[220px] p-4 border border-gray-300 rounded-xl text-sm font-sans focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none leading-relaxed"
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              placeholder="AI generated report draft will appear here..."
            />
          )}
        </div>

        {/* Action Buttons */}
        {selectedStudent.status !== 'FAILED' && (
          <div className="flex items-center justify-between border-t border-gray-100 pt-4">
            <button
              onClick={handleDiscard}
              className="px-4 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-all"
            >
              Discard Draft
            </button>

            <button
              onClick={handleApproveAndSend}
              className="px-6 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 rounded-lg shadow-sm transition-all flex items-center gap-2"
            >
              <span>✅</span> Approve & Send Report to Parent
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
