import { useState, useEffect, useMemo } from "react";
import { Card } from "../components/shared/Card";
import { MoodCheckInModal } from "../components/dashboard/MoodCheckInModal";
import { useSelector } from "react-redux";
import { type RootState } from "../redux/store";
import axios from "axios";
import { apiUrl } from "../config/api";

// SVG mood icons — no emojis
const MoodIcon = ({ mood, className = "w-6 h-6" }: { mood: string; className?: string }) => {
  const icons: Record<string, JSX.Element> = {
    happy: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" strokeWidth={1.5} />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01" />
      </svg>
    ),
    stressed: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" strokeWidth={1.5} />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 15s1.5-1.5 4-1.5 4 1.5 4 1.5M9 9h.01M15 9h.01M7 7l3-2M17 7l-3-2" />
      </svg>
    ),
    lonely: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" strokeWidth={1.5} />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 16h6M9 9h.01M15 9h.01" />
      </svg>
    ),
    anxious: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" strokeWidth={1.5} />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 15c.5-1 2-2 4-2s3.5 1 4 2M9 9h.01M15 9h.01M12 6v1" />
      </svg>
    ),
    tired: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" strokeWidth={1.5} />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16s1.5-1 4-1 4 1 4 1M7 11l2-1M15 10l2 1" />
      </svg>
    ),
    good: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" strokeWidth={1.5} />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 13s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01" />
      </svg>
    ),
    neutral: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" strokeWidth={1.5} />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 15h8M9 9h.01M15 9h.01" />
      </svg>
    ),
  };
  return icons[mood] || icons.neutral;
};

const moodConfig: Record<string, { label: string; color: string; bgColor: string; borderColor: string }> = {
  happy:   { label: "Happy",   color: "text-yellow-600", bgColor: "bg-yellow-50",  borderColor: "border-yellow-200" },
  stressed:{ label: "Stressed",color: "text-red-600",    bgColor: "bg-red-50",     borderColor: "border-red-200" },
  lonely:  { label: "Lonely",  color: "text-blue-600",   bgColor: "bg-blue-50",    borderColor: "border-blue-200" },
  anxious: { label: "Anxious", color: "text-orange-600", bgColor: "bg-orange-50",  borderColor: "border-orange-200" },
  tired:   { label: "Tired",   color: "text-gray-500",   bgColor: "bg-gray-50",    borderColor: "border-gray-200" },
  good:    { label: "Good",    color: "text-green-600",  bgColor: "bg-green-50",   borderColor: "border-green-200" },
  neutral: { label: "Okay",    color: "text-purple-600", bgColor: "bg-purple-50",  borderColor: "border-purple-200" },
};

// Map numeric mood score (1-5) to mood label for API data
function scoreToMood(score: number): string {
  if (score >= 5) return "happy";
  if (score === 4) return "good";
  if (score === 3) return "neutral";
  if (score === 2) return "anxious";
  return "stressed";
}

type TimeRange = "week" | "month" | "all";

interface JournalEntry {
  id: string;
  date: string;
  timestamp: string;
  mood: string;
  score: number;
  sleep: number;
  stress: number;
  energy: number;
  social: number;
  source: string;
}

export function Journal() {
  const { user } = useSelector((state: RootState) => state.auth!);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [timeRange, setTimeRange] = useState<TimeRange>("month");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    if (!user?.userId) { setLoading(false); return; }
    setLoading(true);
    try {
      const res = await axios.get(apiUrl(`/api/history/${user.userId}`));
      const raw = res.data.history || [];
      const mapped: JournalEntry[] = raw.map((h: any) => ({
        id: h.id,
        date: new Date(h.createdAt).toISOString().split("T")[0],
        timestamp: h.createdAt,
        mood: scoreToMood(h.mood),
        score: h.mood,
        sleep: h.sleep,
        stress: h.stress,
        energy: h.energy,
        social: h.social,
        source: h.source,
      }));
      setEntries(mapped);
    } catch (err) {
      console.error("Failed to load journal", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHistory(); }, [user]);

  const filtered = useMemo(() => {
    if (timeRange === "all") return entries;
    const cutoff = new Date();
    if (timeRange === "week") cutoff.setDate(cutoff.getDate() - 7);
    else cutoff.setMonth(cutoff.getMonth() - 1);
    return entries.filter(e => new Date(e.timestamp) >= cutoff);
  }, [entries, timeRange]);

  const grouped = useMemo(() => {
    const groups: Record<string, JournalEntry[]> = {};
    filtered.forEach(e => {
      if (!groups[e.date]) groups[e.date] = [];
      groups[e.date].push(e);
    });
    return groups;
  }, [filtered]);

  const mostCommonMood = useMemo(() => {
    if (!filtered.length) return null;
    const counts: Record<string, number> = {};
    filtered.forEach(e => { counts[e.mood] = (counts[e.mood] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
  }, [filtered]);

  const avgScore = useMemo(() => {
    if (!filtered.length) return 0;
    return Math.round(filtered.reduce((s, e) => s + e.score, 0) / filtered.length * 10) / 10;
  }, [filtered]);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === today.toDateString()) return "Today";
    if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
    return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  };

  const formatTime = (ts: string) => new Date(ts).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

  const cfg = (mood: string) => moodConfig[mood] || moodConfig.neutral;

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">Mood Journal</h1>
          <p className="text-gray-500 text-sm">Your emotional history pulled from check-ins</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-purple-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 w-full sm:w-auto"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Record Check-in
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Entries", value: filtered.length },
          { label: "Avg Mood Score", value: `${avgScore}/5` },
          { label: "Most Common", value: mostCommonMood ? cfg(mostCommonMood).label : "—" },
          { label: "Time Range", value: timeRange === "week" ? "7 days" : timeRange === "month" ? "30 days" : "All time" },
        ].map(stat => (
          <Card key={stat.label} className="p-4">
            <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
            <p className="text-xl font-bold text-gray-900">{stat.value}</p>
          </Card>
        ))}
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-600">Show:</span>
        {(["week", "month", "all"] as TimeRange[]).map(r => (
          <button
            key={r}
            onClick={() => setTimeRange(r)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${timeRange === r ? "bg-purple-600 text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`}
          >
            {r === "week" ? "Last Week" : r === "month" ? "Last Month" : "All Time"}
          </button>
        ))}
      </div>

      {/* Timeline */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="h-4 bg-gray-100 rounded w-1/4 mb-4" />
              <div className="h-12 bg-gray-100 rounded" />
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No entries yet</h3>
          <p className="text-gray-500 text-sm mb-6">Complete your first check-in from the dashboard to start your journal.</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-purple-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-purple-700 transition-colors"
          >
            Start First Check-in
          </button>
        </Card>
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped)
            .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
            .map(([date, dayEntries]) => (
              <Card key={date} className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">{formatDate(date)}</h3>
                  <span className="text-xs text-gray-400">{dayEntries.length} {dayEntries.length === 1 ? "entry" : "entries"}</span>
                </div>
                <div className="space-y-3">
                  {dayEntries.map((entry, i) => (
                    <div
                      key={`${entry.id}-${i}`}
                      className={`flex items-center gap-4 p-3 rounded-xl ${cfg(entry.mood).bgColor} border ${cfg(entry.mood).borderColor}`}
                    >
                      <div className={`flex-shrink-0 ${cfg(entry.mood).color}`}>
                        <MoodIcon mood={entry.mood} className="w-8 h-8" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-semibold text-sm ${cfg(entry.mood).color}`}>{cfg(entry.mood).label}</p>
                        <div className="flex gap-3 text-xs text-gray-400 mt-0.5 flex-wrap">
                          <span>Sleep {entry.sleep}/5</span>
                          <span>Stress {entry.stress}/5</span>
                          <span>Energy {entry.energy}/5</span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs text-gray-400">{formatTime(entry.timestamp)}</p>
                        <span className="text-xs text-gray-300">{entry.source}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
        </div>
      )}

      <MoodCheckInModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onMoodRecorded={() => fetchHistory()}
      />
    </div>
  );
}
