import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { apiUrl } from "../../config/api";
import { Activity, CheckCircle2, HeartHandshake, Search, Sparkles } from "lucide-react";

export function VolunteerDashboard() {
  const [queue, setQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [riskFilter, setRiskFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function loadQueue() {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(apiUrl("/api/practitioner/queue"), {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        const data = res.data.queue || [];
        setQueue(data.length > 0 ? data : [
          { userId: "vol-demo-001", username: "Maya Akom", latestRisk: "RED", dailyScore: 34, openRequests: 1, checkinCount: 3, explanation: "Has reported sleep disruption and a sharp drop in energy after recent life stress.", hasEmergencyContact: true, emergencyContact: "+234 810 100 0071" },
          { userId: "vol-demo-002", username: "Chinaza Nnaji", latestRisk: "YELLOW", dailyScore: 58, openRequests: 1, checkinCount: 4, explanation: "Low motivation and increased anxiety symptoms have been steadily building over the week.", hasEmergencyContact: false, emergencyContact: null },
          { userId: "vol-demo-003", username: "Kehinde Salami", latestRisk: "GREEN", dailyScore: 84, openRequests: 0, checkinCount: 6, explanation: "Able to maintain routines and reports good social support at home.", hasEmergencyContact: false, emergencyContact: null },
          { userId: "vol-demo-004", username: "Nadia Yusuf", latestRisk: "YELLOW", dailyScore: 61, openRequests: 0, checkinCount: 5, explanation: "Recurring stress and low mood are affecting daytime concentration.", hasEmergencyContact: true, emergencyContact: "+234 813 223 4012" },
        ]);
      } catch {
        console.error("Volunteer queue load failed");
      } finally {
        setLoading(false);
      }
    }

    loadQueue();
  }, []);

  const filteredQueue = useMemo(() => {
    return queue.filter((item) => {
      const matchesRisk = riskFilter === "ALL" || item.latestRisk === riskFilter;
      const matchesSearch = !search || `${item.username || ""} ${item.userId}`.toLowerCase().includes(search.toLowerCase());
      return matchesRisk && matchesSearch;
    });
  }, [queue, riskFilter, search]);

  const riskBadge = (level: string) => {
    if (level === "RED") return "bg-red-100 text-red-700 border border-red-200";
    if (level === "YELLOW") return "bg-yellow-100 text-yellow-700 border border-yellow-200";
    return "bg-green-100 text-green-700 border border-green-200";
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-3xl bg-gradient-to-r from-violet-700 via-purple-700 to-indigo-700 p-6 text-white shadow-lg">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-white/10 p-2"><HeartHandshake className="h-6 w-6" /></div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-violet-100">Volunteer care circle</p>
              <h1 className="mt-2 text-3xl font-bold">Compassion check-ins</h1>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-violet-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">High priority</span>
              <span className="rounded-full bg-red-50 px-2 py-1 text-xs font-semibold text-red-600">{queue.filter((q) => q.latestRisk === "RED").length}</span>
            </div>
            <div className="mt-4 text-3xl font-bold text-slate-900">{queue.filter((q) => q.latestRisk === "RED").length}</div>
          </div>
          <div className="rounded-2xl border border-violet-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">Follow-ups</span>
              <span className="rounded-full bg-yellow-50 px-2 py-1 text-xs font-semibold text-yellow-600">{queue.filter((q) => q.latestRisk === "YELLOW").length}</span>
            </div>
            <div className="mt-4 text-3xl font-bold text-slate-900">{queue.filter((q) => q.latestRisk === "YELLOW").length}</div>
          </div>
          <div className="rounded-2xl border border-violet-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">Stable check-ins</span>
              <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-600">{queue.filter((q) => q.latestRisk === "GREEN").length}</span>
            </div>
            <div className="mt-4 text-3xl font-bold text-slate-900">{queue.filter((q) => q.latestRisk === "GREEN").length}</div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Queue</p>
              <h2 className="text-xl font-semibold text-slate-900">Support tracking board</h2>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {['ALL', 'RED', 'YELLOW', 'GREEN'].map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setRiskFilter(filter)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold ${riskFilter === filter ? "bg-violet-700 text-white" : "bg-slate-100 text-slate-600"}`}
                >
                  {filter === "ALL" ? "All cases" : filter}
                </button>
              ))}
              <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500">
                <Search className="h-4 w-4" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search" 
                  className="w-28 bg-transparent outline-none placeholder:text-slate-400"
                />
              </div>
            </div>
          </div>

          {loading ? (
            <div className="mt-6 space-y-3">
              {[1,2,3].map((item) => (
                <div key={item} className="h-16 animate-pulse rounded-2xl bg-slate-100" />
              ))}
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              {filteredQueue.map((item) => (
                <div key={item.userId} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 text-violet-700">
                        <Activity className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{item.username || "Anonymous"}</p>
                        <p className="text-xs text-slate-500">{item.userId}</p>
                      </div>
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${riskBadge(item.latestRisk)}`}>{item.latestRisk}</span>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-xl bg-white p-3">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Daily score</p>
                      <p className="mt-2 text-2xl font-bold text-slate-900">{Math.round(item.dailyScore)}</p>
                    </div>
                    <div className="rounded-xl bg-white p-3">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Check-ins</p>
                      <p className="mt-2 text-2xl font-bold text-slate-900">{item.checkinCount}</p>
                    </div>
                    <div className="rounded-xl bg-white p-3">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Open requests</p>
                      <p className="mt-2 text-2xl font-bold text-slate-900">{item.openRequests}</p>
                    </div>
                  </div>

                  <div className="mt-4 rounded-xl border border-violet-100 bg-violet-50 p-3 text-sm text-violet-900">
                    {item.explanation || "No extra context has been recorded yet."}
                  </div>
                </div>
              ))}

              {filteredQueue.length === 0 && (
                <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
                  No support cases match this filter.
                </div>
              )}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5" />
            <p className="leading-6">Your volunteer checklist is focused on check-ins, compassionate outreach, and escalation only when a case needs clinical review.</p>
          </div>
        </div>

        <div className="rounded-2xl border border-violet-100 bg-gradient-to-r from-violet-50 to-indigo-50 p-4 text-sm text-violet-900">
          <div className="flex items-center gap-2 font-semibold">
            <Sparkles className="h-4 w-4" />
            Volunteer workflow
          </div>
          <p className="mt-2 leading-6">Review each participant, acknowledge their current mood and routine, and escalate to a practitioner when safety or support needs go beyond peer support.</p>
        </div>
      </div>
    </div>
  );
}
