import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { apiUrl } from "../../config/api";
import { CaseDetailModal } from "./CaseDetailModal";

export function PractitionerDashboard() {
  const [queue, setQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCase, setSelectedCase] = useState<any | null>(null);

  useEffect(() => {
    async function loadQueue() {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(apiUrl("/api/practitioner/queue"), {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const data = res.data.queue || [];
        setQueue(data.length > 0 ? data : [
          { userId: 'demo-red-001',  latestRisk: 'RED',    dailyScore: 28, openRequests: 1, checkinCount: 4, explanation: 'Low mood, disrupted sleep and high stress over multiple sessions.', hasEmergencyContact: true, emergencyContact: '+233 50 123 4567' },
          { userId: 'demo-yel-002',  latestRisk: 'YELLOW', dailyScore: 54, openRequests: 0, checkinCount: 2, explanation: 'Declining social score and elevated stress.', hasEmergencyContact: false, emergencyContact: null },
          { userId: 'demo-grn-003',  latestRisk: 'GREEN',  dailyScore: 88, openRequests: 0, checkinCount: 7, explanation: 'Stable across all metrics.', hasEmergencyContact: false, emergencyContact: null },
        ]);
      } catch {
        console.error("Queue load failed");
      } finally {
        setLoading(false);
      }
    }
    loadQueue();
  }, []);

  const riskBadge = (level: string) => {
    if (level === 'RED')    return 'bg-red-100 text-red-700 border border-red-200';
    if (level === 'YELLOW') return 'bg-yellow-100 text-yellow-700 border border-yellow-200';
    return 'bg-green-100 text-green-700 border border-green-200';
  };

  const riskDot = (level: string) => {
    if (level === 'RED')    return 'bg-red-500 animate-pulse';
    if (level === 'YELLOW') return 'bg-yellow-400';
    return 'bg-green-500';
  };

  const riskCount = (level: string) => queue.filter(q => q.latestRisk === level).length;

  return (
    <>
      <div className="min-h-screen bg-gray-50 p-6 md:p-10">
        <div className="max-w-5xl mx-auto">

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-1">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h1 className="text-2xl font-bold text-gray-900">Practitioner Triage Queue</h1>
            </div>
            <p className="text-sm text-gray-500 mt-1">Anonymised user risk data, sorted by severity. Click <strong>Review</strong> to open the case detail.</p>
          </div>

          {/* Summary stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: "Critical (RED)", count: riskCount("RED"), color: "text-red-600", bg: "bg-red-50 border-red-100" },
              { label: "At Risk (YELLOW)", count: riskCount("YELLOW"), color: "text-yellow-600", bg: "bg-yellow-50 border-yellow-100" },
              { label: "Stable (GREEN)", count: riskCount("GREEN"), color: "text-green-600", bg: "bg-green-50 border-green-100" },
            ].map(s => (
              <div key={s.label} className={`rounded-xl p-4 border ${s.bg}`}>
                <p className={`text-3xl font-bold ${s.color}`}>{s.count}</p>
                <p className="text-xs text-gray-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Queue table */}
          {loading ? (
            <div className="bg-white rounded-xl p-6 animate-pulse space-y-3 border border-gray-100">
              {[1, 2, 3].map(i => <div key={i} className="h-12 bg-gray-100 rounded-lg" />)}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                <div className="col-span-4">User</div>
                <div className="col-span-2">Risk</div>
                <div className="col-span-2">Score</div>
                <div className="col-span-2">Check-ins</div>
                <div className="col-span-2 text-right">Action</div>
              </div>

              {queue.map((item, i) => (
                <motion.div
                  key={item.userId}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="grid grid-cols-12 gap-4 items-center px-6 py-4 border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                >
                  {/* User col */}
                  <div className="col-span-4 flex items-center gap-2 flex-wrap">
                    <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${riskDot(item.latestRisk)}`} />
                    <span className="font-mono text-sm text-gray-700 truncate">{item.userId.slice(0, 14)}…</span>
                    {item.openRequests > 0 && (
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium whitespace-nowrap">Support req</span>
                    )}
                    {item.hasEmergencyContact && (
                      <span className="text-xs bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded-full font-medium whitespace-nowrap" title={item.emergencyContact || ""}>
                        EC on file
                      </span>
                    )}
                  </div>

                  {/* Risk badge */}
                  <div className="col-span-2">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${riskBadge(item.latestRisk)}`}>
                      {item.latestRisk}
                    </span>
                  </div>

                  {/* Score */}
                  <div className="col-span-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-gray-700">{Math.round(item.dailyScore)}</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-1.5 max-w-[40px]">
                        <div
                          className={`h-1.5 rounded-full ${item.latestRisk === 'RED' ? 'bg-red-400' : item.latestRisk === 'YELLOW' ? 'bg-yellow-400' : 'bg-green-400'}`}
                          style={{ width: `${Math.min(item.dailyScore, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Check-in count */}
                  <div className="col-span-2 text-sm text-gray-500">{item.checkinCount}</div>

                  {/* Action */}
                  <div className="col-span-2 text-right">
                    <button
                      onClick={() => setSelectedCase(item)}
                      className="text-xs font-semibold text-purple-600 hover:text-purple-800 border border-purple-200 px-3 py-1.5 rounded-full hover:bg-purple-50 transition-colors"
                    >
                      Review
                    </button>
                  </div>
                </motion.div>
              ))}

              {queue.length === 0 && (
                <div className="px-6 py-12 text-center text-gray-400 text-sm">
                  No users in the queue yet.
                </div>
              )}
            </div>
          )}

          {/* Flow note */}
          <div className="mt-6 bg-purple-50 border border-purple-100 rounded-xl p-4 flex gap-3 items-start">
            <svg className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-xs text-purple-600 leading-relaxed">
              <strong>Flow:</strong> Review case → view check-in history + risk signals → assign to a volunteer or counsellor → mark support request as responded. Emergency contact can be used for sustained RED cases with user's prior consent.
            </div>
          </div>
        </div>
      </div>

      {/* Case detail modal */}
      {selectedCase && (
        <CaseDetailModal
          isOpen={!!selectedCase}
          onClose={() => setSelectedCase(null)}
          userId={selectedCase.userId}
          username={selectedCase.username || "Anonymous"}
          latestRisk={selectedCase.latestRisk}
          dailyScore={selectedCase.dailyScore}
          explanation={selectedCase.explanation || ""}
          openRequests={selectedCase.openRequests}
          checkinCount={selectedCase.checkinCount}
          hasEmergencyContact={selectedCase.hasEmergencyContact}
          emergencyContact={selectedCase.emergencyContact}
        />
      )}
    </>
  );
}
