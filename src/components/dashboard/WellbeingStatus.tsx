import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { type RootState } from "../../redux/store";
import axios from "axios";
import { apiUrl } from "../../config/api";

const statusConfig = {
  GREEN: {
    label: "Good Mental Health",
    sublabel: "Your wellbeing indicators are stable.",
    color: "text-green-700",
    bg: "bg-green-50",
    border: "border-green-100",
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
    barColor: "bg-green-500",
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" strokeWidth={1.5} />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01" />
      </svg>
    ),
  },
  YELLOW: {
    label: "Feeling the Pressure",
    sublabel: "Some decline detected. Be kind to yourself today.",
    color: "text-yellow-700",
    bg: "bg-yellow-50",
    border: "border-yellow-100",
    iconBg: "bg-yellow-100",
    iconColor: "text-yellow-600",
    barColor: "bg-yellow-400",
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" strokeWidth={1.5} />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 15h6M9 9h.01M15 9h.01M12 6v1" />
      </svg>
    ),
  },
  RED: {
    label: "Needs Attention",
    sublabel: "Your signals suggest a difficult period. You're not alone.",
    color: "text-red-700",
    bg: "bg-red-50",
    border: "border-red-100",
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
    barColor: "bg-red-500",
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" strokeWidth={1.5} />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 15c.5-1 2-2 4-2s3.5 1 4 2M9 9h.01M15 9h.01M12 6v2" />
      </svg>
    ),
  },
  NONE: {
    label: "No Data Yet",
    sublabel: "Complete your first check-in to see your status.",
    color: "text-gray-500",
    bg: "bg-gray-50",
    border: "border-gray-100",
    iconBg: "bg-gray-100",
    iconColor: "text-gray-400",
    barColor: "bg-gray-300",
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" strokeWidth={1.5} />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 15h8M9 9h.01M15 9h.01" />
      </svg>
    ),
  },
};

export function WellbeingStatus() {
  const { user } = useSelector((state: RootState) => state.auth!);
  const [riskLevel, setRiskLevel] = useState<"GREEN" | "YELLOW" | "RED" | "NONE">("NONE");
  const [score, setScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!user?.userId) { setLoading(false); return; }
      try {
        const res = await axios.get(apiUrl(`/api/history/${user.userId}`));
        const history = res.data.history || [];
        if (history.length > 0) {
          const latest = history[0];
          // Derive a rough score from latest checkin
          const derived = Math.round(((latest.mood + latest.sleep + latest.energy + (6 - latest.stress) + latest.social) / 25) * 100);
          setScore(derived);
          if (derived >= 70) setRiskLevel("GREEN");
          else if (derived >= 45) setRiskLevel("YELLOW");
          else setRiskLevel("RED");
        }
      } catch {
        // silent fail
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  const cfg = statusConfig[riskLevel];
  const scorePercent = score !== null ? score : 0;

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm animate-pulse">
        <div className="h-4 bg-gray-100 rounded w-1/3 mb-3" />
        <div className="h-8 bg-gray-100 rounded w-2/3 mb-4" />
        <div className="h-2 bg-gray-100 rounded" />
      </div>
    );
  }

  return (
    <div className={`rounded-xl p-5 border ${cfg.bg} ${cfg.border} shadow-sm`}>
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.iconBg} ${cfg.iconColor}`}>
          {cfg.icon}
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-0.5">Current Status</p>
          <h3 className={`text-lg font-bold ${cfg.color} leading-tight`}>{cfg.label}</h3>
          <p className="text-xs text-gray-500 mt-1 leading-relaxed">{cfg.sublabel}</p>
        </div>

        {/* Score bubble */}
        {score !== null && (
          <div className={`flex-shrink-0 w-12 h-12 rounded-full flex flex-col items-center justify-center ${cfg.iconBg}`}>
            <span className={`text-lg font-bold ${cfg.color} leading-none`}>{score}</span>
            <span className="text-[9px] text-gray-400 leading-none mt-0.5">/ 100</span>
          </div>
        )}
      </div>

      {/* Score bar */}
      {score !== null && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1.5">
            <span>Wellbeing Score</span>
            <span>{score}%</span>
          </div>
          <div className="w-full bg-white/60 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-1.5 rounded-full transition-all duration-700 ${cfg.barColor}`}
              style={{ width: `${scorePercent}%` }}
            />
          </div>
        </div>
      )}

      {riskLevel === "NONE" && (
        <p className="mt-3 text-xs text-gray-400">
          Your status is calculated from mood, sleep, stress, energy, and social connection.
        </p>
      )}
    </div>
  );
}
