import React, { useState } from 'react';

export interface DeadLetterTask {
  id: string;
  studentId: string;
  studentName: string;
  queue: string;
  retriesFailed: number;
  errorReason: string;
  timestamp: string;
}

const INITIAL_DEAD_LETTERS: DeadLetterTask[] = [
  {
    id: "dlq-8912",
    studentId: "std-003",
    studentName: "Usama Ibn Zaid",
    queue: "q_llm_batch",
    retriesFailed: 3,
    errorReason: "OpenAI RateLimitError: 429 Too Many Requests",
    timestamp: "2026-08-13 13:15:00"
  }
];

export const DeadLetterQueueDashboard: React.FC = () => {
  const [tasks, setTasks] = useState<DeadLetterTask[]>(INITIAL_DEAD_LETTERS);
  const [statusBanner, setStatusBanner] = useState<string | null>(null);

  const handleRetryTask = (task: DeadLetterTask) => {
    setStatusBanner(`Re-dispatching task ${task.id} for ${task.studentName} with high priority on q_urgent...`);
    setTimeout(() => {
      setTasks((prev) => prev.filter((t) => t.id !== task.id));
      setStatusBanner(`Task ${task.id} re-enqueued successfully!`);
      setTimeout(() => setStatusBanner(null), 3000);
    }, 1200);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm mt-6">
      <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
        <div>
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <span>🛡️</span> Nazim System Resilience: Dead Letter Queue (DLQ)
          </h3>
          <p className="text-xs text-gray-500">
            Monitors tasks that failed max Celery retries on <code className="bg-gray-100 px-1 py-0.5 rounded">q_llm_batch</code>
          </p>
        </div>
        <span className="text-xs bg-rose-100 text-rose-800 font-semibold px-2.5 py-1 rounded-full">
          {tasks.length} Dropped Tasks
        </span>
      </div>

      {statusBanner && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-lg text-xs font-medium">
          {statusBanner}
        </div>
      )}

      {tasks.length === 0 ? (
        <div className="text-center py-6 text-xs text-gray-500">
          Alhamdulillah! No failed or dropped background tasks in Dead Letter Queue.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
                <th className="py-2.5 px-3">Task ID</th>
                <th className="py-2.5 px-3">Student Name</th>
                <th className="py-2.5 px-3">Target Queue</th>
                <th className="py-2.5 px-3">Failure Reason</th>
                <th className="py-2.5 px-3">Retries</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tasks.map((task) => (
                <tr key={task.id} className="hover:bg-gray-50/60">
                  <td className="py-3 px-3 font-mono text-gray-700">{task.id}</td>
                  <td className="py-3 px-3 font-medium text-gray-900">{task.studentName}</td>
                  <td className="py-3 px-3">
                    <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded font-mono">
                      {task.queue}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-rose-700 font-sans">{task.errorReason}</td>
                  <td className="py-3 px-3 text-gray-600">{task.retriesFailed} / 3</td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => handleRetryTask(task)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded text-xs font-medium transition-all"
                    >
                      Retry Task
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
