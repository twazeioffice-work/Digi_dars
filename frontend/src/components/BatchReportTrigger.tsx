import React, { useState } from 'react';

interface BatchReportTriggerProps {
  halqaId: string;
  halqaName: string;
  onBatchStarted?: (taskId: string) => void;
}

export const BatchReportTrigger: React.FC<BatchReportTriggerProps> = ({
  halqaId,
  halqaName,
  onBatchStarted,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleGenerateBatch = async () => {
    setIsProcessing(true);
    setStatusMessage("Submitting batch request to q_llm_batch queue...");

    try {
      const response = await fetch('/api/v1/ai/reports/batch-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          halqa_id: halqaId,
          month: "August",
          year: "2026",
        }),
      });

      if (response.status === 202) {
        const data = await response.json();
        setStatusMessage(`Batch Queued! Task ID: ${data.master_task_id}. You can safely navigate away while AI processes reports.`);
        if (onBatchStarted) {
          onBatchStarted(data.master_task_id);
        }
      } else {
        setStatusMessage("Failed to queue batch generation.");
      }
    } catch (err) {
      console.error("Batch report generation error:", err);
      setStatusMessage("Network error submitting batch request.");
    } finally {
      setTimeout(() => {
        setIsProcessing(false);
      }, 3000);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm mb-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">
            Batch AI Progress Report Generator
          </h3>
          <p className="text-sm text-gray-600">
            Target Batch: <span className="font-semibold text-emerald-700">{halqaName}</span> (Queue: <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">q_llm_batch</code> Rate-limited 10/m)
          </p>
        </div>

        <button
          onClick={handleGenerateBatch}
          disabled={isProcessing}
          className={`px-5 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 shadow-sm flex items-center gap-2 ${
            isProcessing
              ? 'bg-amber-100 text-amber-800 cursor-not-allowed border border-amber-300'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white active:scale-95'
          }`}
        >
          {isProcessing ? (
            <>
              <span className="w-4 h-4 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"></span>
              Dispatching Batch...
            </>
          ) : (
            <>
              <span>✨</span>
              Generate Reports for {halqaName}
            </>
          )}
        </button>
      </div>

      {statusMessage && (
        <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-700 flex items-center justify-between">
          <span>{statusMessage}</span>
          <span className="text-emerald-600 font-semibold">202 Accepted</span>
        </div>
      )}
    </div>
  );
};
