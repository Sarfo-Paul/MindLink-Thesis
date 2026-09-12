import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { type RootState } from "../../redux/store";
import axios from "axios";
import { apiUrl } from "../../config/api";

interface StreakItem {
  label: string;
  days: number;
  icon: JSX.Element;
  color: string;
  dotColor: string;
}

function FlameIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
    </svg>
  );
}

function calcStreak(dates: string[]): number {
  if (!dates.length) return 0;
  const sorted = [...new Set(dates.map(d => d.split("T")[0]))].sort((a, b) => b.localeCompare(a));
  let streak = 0;
  const today = new Date().toISOString().split("T")[0];
  let expected = today;
  for (const d of sorted) {
    if (d === expected) {
      streak++;
      const dt = new Date(expected);
      dt.setDate(dt.getDate() - 1);
      expected = dt.toISOString().split("T")[0];
    } else if (d < expected) {
      break;
    }
  }
  return streak;
}

export function StreakTracker() {
  const { user } = useSelector((state: RootState) => state.auth!);
  const [streaks, setStreaks] = useState<{ checkin: number; game: number }>({ checkin: 0, game: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!user?.userId) { setLoading(false); return; }
      try {
        const [histRes, gameRes] = await Promise.allSettled([
          axios.get(apiUrl(`/api/history/${user.userId}`)),
          axios.get(apiUrl(`/api/games/${user.userId}`)),
        ]);
        const checkinDates = histRes.status === "fulfilled"
          ? (histRes.value.data.history || []).map((h: any) => h.createdAt as string)
          : [];
        const gameDates = gameRes.status === "fulfilled"
          ? (gameRes.value.data.sessions || []).map((g: any) => g.createdAt as string)
          : [];
        setStreaks({ checkin: calcStreak(checkinDates), game: calcStreak(gameDates) });
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  const items: StreakItem[] = [
    {
      label: "Daily Check-in",
      days: streaks.checkin,
      color: "text-orange-600",
      dotColor: "bg-orange-100",
      icon: <FlameIcon className="w-4 h-4 text-orange-500" />,
    },
    {
      label: "Cognitive Games",
      days: streaks.game,
      color: "text-purple-600",
      dotColor: "bg-purple-100",
      icon: (
        <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-center gap-2 mb-4">
        <FlameIcon className="w-5 h-5 text-orange-500" />
        <h3 className="font-semibold text-gray-900 text-sm">Your Streaks</h3>
      </div>

      {loading ? (
        <div className="space-y-2.5 animate-pulse">
          {[1, 2].map(i => <div key={i} className="h-10 bg-gray-100 rounded-xl" />)}
        </div>
      ) : (
        <div className="space-y-2.5">
          {items.map(item => (
            <div key={item.label} className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2.5">
              <div className="flex items-center gap-2.5">
                <div className={`w-7 h-7 ${item.dotColor} rounded-full flex items-center justify-center`}>
                  {item.icon}
                </div>
                <span className="text-sm text-gray-600">{item.label}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className={`text-lg font-bold ${item.color}`}>{item.days}</span>
                <span className="text-xs text-gray-400">day{item.days !== 1 ? "s" : ""}</span>
              </div>
            </div>
          ))}

          {/* Motivational nudge */}
          {streaks.checkin === 0 && (
            <p className="text-xs text-gray-400 text-center pt-1">
              Complete a check-in today to start your streak!
            </p>
          )}
          {streaks.checkin >= 7 && (
            <div className="bg-orange-50 border border-orange-100 rounded-xl px-3 py-2 text-center">
              <p className="text-xs text-orange-600 font-semibold">🔥 {streaks.checkin}-day streak! Keep it going.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
