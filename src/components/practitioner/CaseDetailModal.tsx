import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { apiUrl } from "../../config/api";

interface CaseDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  username: string;
  latestRisk: string;
  dailyScore: number;
  explanation: string;
  openRequests: number;
  checkinCount: number;
  hasEmergencyContact: boolean;
  emergencyContact: string | null;
}

const riskColor = {
  RED: { badge: "bg-red-100 text-red-700 border-red-200", bar: "bg-red-500", dot: "bg-red-500 animate-pulse" },
  YELLOW: { badge: "bg-yellow-100 text-yellow-700 border-yellow-200", bar: "bg-yellow-400", dot: "bg-yellow-400" },
  GREEN: { badge: "bg-green-100 text-green-700 border-green-200", bar: "bg-green-500", dot: "bg-green-500" },
};

const MoodIcon = ({ score }: { score: number }) => {
  if (score >= 4)
    return (
      <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" strokeWidth={1.5} />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01" />
      </svg>
    );
  if (score === 3)
    return (
      <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" strokeWidth={1.5} />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 15h8M9 9h.01M15 9h.01" />
      </svg>
    );
  return (
    <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" strokeWidth={1.5} />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 15c.5-1 2-2 4-2s3.5 1 4 2M9 9h.01M15 9h.01" />
    </svg>
  );
};

export function CaseDetailModal({
  isOpen, onClose, userId, username, latestRisk, dailyScore, explanation,
  openRequests, checkinCount, hasEmergencyContact, emergencyContact
}: CaseDetailModalProps) {
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [assignedTo, setAssignedTo] = useState("");
  const [assigning, setAssigning] = useState(false);
  const [assigned, setAssigned] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setLoadingHistory(true);
    axios.get(apiUrl(`/api/history/${userId}`))
      .then(res => setHistory(res.data.history || []))
      .catch(() => {})
      .finally(() => setLoadingHistory(false));
  }, [isOpen, userId]);

  const handleAssign = async () => {
    if (!assignedTo.trim()) return;
    setAssigning(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(apiUrl("/api/practitioner/assign"), {
        patientId: userId,
        assignedTo
      }, { headers: { Authorization: `Bearer ${token}` } });
      setAssigned(true);
    } catch {
      alert("Failed to assign case.");
    } finally {
      setAssigning(false);
    }
  };

  const handleResolve = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(apiUrl("/api/practitioner/resolve"), {
        patientId: userId
      }, { headers: { Authorization: `Bearer ${token}` } });
      onClose(); // Automatically close it or manually refresh the queue in the parent component
    } catch {
      alert("Failed to resolve requests.");
    }
  };

  const col = riskColor[latestRisk as keyof typeof riskColor] || riskColor.GREEN;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.25 }}
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold">Case Review</p>
              <h2 className="text-lg font-bold text-gray-900">{username}</h2>
              <p className="text-xs text-gray-400 font-mono mt-0.5">ID {userId.slice(0, 8)}…</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Risk Summary */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <span className={`inline-block text-xs font-bold px-2.5 py-1 rounded-full border mb-2 ${col.badge}`}>
                  {latestRisk}
                </span>
                <p className="text-xs text-gray-400">Risk Level</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-gray-900 mb-1">{Math.round(dailyScore)}</p>
                <p className="text-xs text-gray-400">Wellbeing Score</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-gray-900 mb-1">{checkinCount}</p>
                <p className="text-xs text-gray-400">Total Check-ins</p>
              </div>
            </div>

            {/* Score bar */}
            <div>
              <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                <span>Score trend</span>
                <span>{Math.round(dailyScore)} / 100</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className={`h-2 rounded-full transition-all duration-700 ${col.bar}`} style={{ width: `${dailyScore}%` }} />
              </div>
            </div>

            {/* Explanation */}
            {explanation && (
              <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600 leading-relaxed">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Risk Explanation</p>
                {explanation}
              </div>
            )}

            {/* Emergency contact */}
            {hasEmergencyContact && (
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
                <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <div>
                  <p className="text-sm font-semibold text-blue-700">Emergency Contact on File</p>
                  <p className="text-sm text-blue-600 mt-0.5">{emergencyContact || "Number on file"}</p>
                  <p className="text-xs text-blue-400 mt-1">Only contact with user consent or after sustained RED alert.</p>
                </div>
              </div>
            )}

            {/* Check-in history */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-3">Recent Check-ins</p>
              {loadingHistory ? (
                <div className="space-y-2">
                  {[1, 2, 3].map(i => <div key={i} className="h-10 bg-gray-100 rounded-lg animate-pulse" />)}
                </div>
              ) : history.length === 0 ? (
                <p className="text-sm text-gray-400 py-4 text-center">No check-ins recorded yet.</p>
              ) : (
                <div className="space-y-2">
                  {history.slice(0, 7).map((h: any) => (
                    <div key={h.id} className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-2.5">
                      <MoodIcon score={h.mood} />
                      <div className="flex-1 grid grid-cols-4 gap-2 text-xs text-gray-500">
                        <span>Mood <strong className="text-gray-700">{h.mood}/5</strong></span>
                        <span>Sleep <strong className="text-gray-700">{h.sleep}/5</strong></span>
                        <span>Stress <strong className="text-gray-700">{h.stress}/5</strong></span>
                        <span>Energy <strong className="text-gray-700">{h.energy}/5</strong></span>
                      </div>
                      <span className="text-xs text-gray-300 flex-shrink-0">
                        {new Date(h.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Assign to volunteer */}
            <div className="border-t border-gray-100 pt-5">
              <p className="text-sm font-semibold text-gray-700 mb-1">Assign to Volunteer / Counsellor</p>
              <p className="text-xs text-gray-400 mb-3">Enter a team member's ID or name to escalate this case.</p>
              {assigned ? (
                <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-3 rounded-xl text-sm font-medium">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Case assigned to {assignedTo}
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={assignedTo}
                    onChange={e => setAssignedTo(e.target.value)}
                    placeholder="Volunteer name or ID"
                    className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    onClick={handleAssign}
                    disabled={assigning || !assignedTo.trim()}
                    className="px-4 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50"
                  >
                    {assigning ? "Assigning…" : "Assign"}
                  </button>
                </div>
              )}
            </div>

            {/* Actions */}
            {openRequests > 0 && (
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-amber-700">{openRequests} open support request{openRequests > 1 ? "s" : ""}</p>
                  <p className="text-xs text-amber-500 mt-0.5">User has actively requested to speak with someone.</p>
                </div>
                <button onClick={handleResolve} className="text-xs font-semibold text-amber-700 bg-amber-100 px-3 py-1.5 rounded-full hover:bg-amber-200 transition-colors">
                  Mark Responded
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
