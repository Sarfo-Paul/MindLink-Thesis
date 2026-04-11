import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

interface RiskAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCloseParent?: () => void;
  riskLevel: "RED" | "YELLOW";
  score: number;
}

export function RiskAlertModal({
  isOpen,
  onClose,
  onCloseParent,
  riskLevel,
  score,
}: RiskAlertModalProps) {
  const navigate = useNavigate();

  const isRed = riskLevel === "RED";

  const closeAll = () => {
    onClose();
    onCloseParent?.();
  };

  const handleConnectSupport = () => {
    closeAll();
    navigate("/psychologists");
  };

  const handleChat = () => {
    closeAll();
    navigate("/chat");
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 10 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Top accent bar */}
          <div
            className={`h-2 w-full ${isRed ? "bg-red-500" : "bg-yellow-400"}`}
          />

          <div className="p-8">
            {/* Icon */}
            <div
              className={`w-14 h-14 rounded-full flex items-center justify-center mb-5 ${isRed ? "bg-red-100" : "bg-yellow-100"}`}
            >
              {isRed ? (
                <svg
                  className="w-7 h-7 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                  />
                </svg>
              ) : (
                <svg
                  className="w-7 h-7 text-yellow-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              )}
            </div>

            {/* Heading */}
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {isRed ? "We're concerned about you" : "We noticed something"}
            </h2>

            {/* Body */}
            <p className="text-sm text-gray-500 leading-relaxed mb-2">
              {isRed
                ? "Your wellbeing score suggests you may be going through a difficult period. You don't have to face this alone — reaching out is the right step."
                : "Your check-ins show some signs of stress or low mood. This is worth paying attention to."}
            </p>
            <div
              className={`inline-flex text-xs font-semibold px-3 py-1 rounded-full mb-6 ${isRed ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}
            >
              Wellbeing Score: {Math.round(score)} — {riskLevel}
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={handleConnectSupport}
                className="w-full py-3 bg-purple-600 text-white rounded-xl font-semibold text-sm hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                Connect with a Counsellor
              </button>

              <button
                onClick={handleChat}
                className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-200 transition-colors"
              >
                Talk to the AI Assistant
              </button>

              {isRed && (
                <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-center">
                  <p className="text-xs text-red-600 font-semibold mb-2">
                    🆘 Crisis Helpline
                  </p>
                  <p className="text-sm text-red-700 font-bold">
                    0800-MINDLINK
                  </p>
                  <p className="text-xs text-red-500 mt-1">
                    Available 24/7, free & confidential
                  </p>
                </div>
              )}

              <button
                onClick={closeAll}
                className="w-full py-2 text-gray-400 text-sm hover:text-gray-600 transition-colors"
              >
                I'm okay for now — dismiss
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
