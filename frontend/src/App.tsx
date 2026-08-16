import React, { useState } from 'react';
import { SocketProvider, SocketMessage } from './context/SocketContext';
import { BatchReportTrigger } from './components/BatchReportTrigger';
import { AIReportReviewer } from './components/AIReportReviewer';
import { DeadLetterQueueDashboard } from './components/DeadLetterQueueDashboard';

export const AppContent: React.FC = () => {
  const [notification, setNotification] = useState<string | null>(null);

  const handleSocketNotification = (msg: SocketMessage) => {
    if (msg.type === 'BATCH_REPORT_COMPLETE') {
      setNotification(`Alhamdulillah! ${msg.count || 'All'} AI reports are ready for review!`);
      setTimeout(() => setNotification(null), 5000);
    } else if (msg.type === 'TICKET_ESCALATED') {
      setNotification(`🚨 Urgent: New Super Admin escalation from ${msg.center_name || 'Masjid HQ'}`);
      setTimeout(() => setNotification(null), 5000);
    }
  };

  return (
    <SocketProvider userToken="demo_jwt_token" onNotification={handleSocketNotification}>
      <div className="min-h-screen bg-slate-100 text-slate-900 font-sans">
        {/* Top Navbar */}
        <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl font-black tracking-tight text-emerald-400" style={{ fontFamily: '"Arial Black", Gadget, sans-serif' }}>Suffathul Huffaaz</span>
              <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-1 rounded-md border border-slate-700 font-mono">
                Academic & Tarbiyyah Platform
              </span>
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>WebSocket Connected</span>
              </div>
              <span className="text-slate-600">|</span>
              <span className="font-semibold text-white">Hafiz Ahmad (Ustad / Nazim)</span>
            </div>
          </div>
        </header>

        {/* Global Toast Alert Banner */}
        {notification && (
          <div className="bg-emerald-600 text-white px-4 py-2.5 text-center text-xs font-semibold shadow-md flex items-center justify-center gap-2">
            <span>✨</span> {notification}
          </div>
        )}

        {/* Main Content Area */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
          {/* Fire and Forget Batch Report Generator Trigger */}
          <BatchReportTrigger halqaId="halqa-001" halqaName="Hifz Batch A - Morning" />

          {/* Split-Pane Human-in-the-Loop AI Reviewer Workspace */}
          <AIReportReviewer />

          {/* Dead Letter Queue Dashboard */}
          <DeadLetterQueueDashboard />
        </main>
      </div>
    </SocketProvider>
  );
};

export default AppContent;
