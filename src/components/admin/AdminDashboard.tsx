import { useEffect, useState } from "react";
import axios from "axios";
import { Activity, AlertTriangle, CheckCircle2, ClipboardList, HeartPulse, Languages, ShieldCheck, Users, UserRoundCog } from "lucide-react";
import { apiUrl } from "../../config/api";

type AdminOverview = {
  metrics: {
    totalUsers: number;
    totalPractitioners: number;
    totalVolunteers: number;
    openRequests: number;
    checkinsToday: number;
  };
  riskDistribution: Record<string, number>;
  recentUsers: Array<{
    id: string;
    username: string | null;
    email: string | null;
    preferredLanguage: string;
    createdAt: string;
    emergencyContactEnabled: boolean;
  }>;
  methodology: { title: string; body: string };
};

const roleCards = [
  { key: "totalUsers", label: "Participants", icon: Users, tone: "bg-[#e4f1ec] text-[#1f5c49]" },
  { key: "totalPractitioners", label: "Practitioners", icon: UserRoundCog, tone: "bg-[#f6eadf] text-[#9a5b2d]" },
  { key: "totalVolunteers", label: "Volunteers", icon: HeartPulse, tone: "bg-[#e4eafa] text-[#3f568e]" },
] as const;

export function AdminDashboard() {
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [error, setError] = useState("");
  const [directoryQuery, setDirectoryQuery] = useState("");
  const [contactOnly, setContactOnly] = useState(false);

  useEffect(() => {
    const loadOverview = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get<AdminOverview>(apiUrl("/api/admin/overview"), {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        setOverview(response.data);
      } catch {
        setError("The admin overview could not be loaded. Check that the local API is running.");
      }
    };
    loadOverview();
  }, []);

  if (error) return <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">{error}</div>;
  if (!overview) return <div className="space-y-5 animate-pulse"><div className="h-32 rounded-3xl bg-white" /><div className="h-56 rounded-3xl bg-white" /></div>;

  const { metrics, riskDistribution } = overview;
  const totalRisk = Math.max(Object.values(riskDistribution).reduce((sum, value) => sum + value, 0), 1);
  const getBarWidth = (value: number) => {
    const percentage = Math.min(100, Math.round((value / totalRisk) * 20) * 5);
    return ["w-0", "w-[5%]", "w-[10%]", "w-[15%]", "w-[20%]", "w-[25%]", "w-[30%]", "w-[35%]", "w-[40%]", "w-[45%]", "w-1/2", "w-[55%]", "w-[60%]", "w-[65%]", "w-[70%]", "w-3/4", "w-[80%]", "w-[85%]", "w-[90%]", "w-[95%]", "w-full"][percentage / 5];
  };
  const exportSnapshot = () => {
    const rows = overview.recentUsers.map((user) => [user.username || "Anonymous", user.email || "", user.preferredLanguage, user.emergencyContactEnabled ? "enabled" : "not enabled"]);
    const csv = [["Participant", "Email", "Language", "Emergency contact"], ...rows].map((row) => row.map((value) => `"${value.replaceAll('"', '""')}"`).join(",")).join("\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    link.download = "mindlink-participant-snapshot.csv";
    link.click();
    URL.revokeObjectURL(link.href);
  };
  const visibleUsers = overview.recentUsers.filter((user) => {
    const query = directoryQuery.toLowerCase();
    const matchesQuery = !query || `${user.username || ""} ${user.email || ""}`.toLowerCase().includes(query);
    return matchesQuery && (!contactOnly || user.emergencyContactEnabled);
  });

  return (
    <section className="space-y-6 pb-8">
      <div className="relative overflow-hidden rounded-[28px] bg-[#1b2f28] px-6 py-8 text-white shadow-[0_18px_45px_rgba(27,47,40,0.18)] sm:px-9">
        <div className="absolute -right-12 -top-16 h-48 w-48 rounded-full border-[24px] border-[#9bc9a9]/20" />
        <div className="relative max-w-3xl">
          <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#b9ddc3]"><ShieldCheck className="h-4 w-4" /> Operations command centre</div>
          <h1 className="font-serif text-4xl leading-tight sm:text-5xl">Make care easier to coordinate.</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#d6e5dc]">A research operations view for monitoring access, triage workload, and the human review capacity behind MindLink.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {roleCards.map(({ key, label, icon: Icon, tone }) => (
          <div key={key} className="rounded-2xl border border-[#dfe8e2] bg-white p-5 shadow-sm">
            <div className={`mb-6 flex h-10 w-10 items-center justify-center rounded-xl ${tone}`}><Icon className="h-5 w-5" /></div>
            <p className="text-3xl font-semibold tracking-tight text-[#1b2f28]">{metrics[key]}</p>
            <p className="mt-1 text-sm text-[#6b7c73]">{label} in the demo network</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="rounded-2xl border border-[#dfe8e2] bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#82958a]">System pulse</p><h2 className="mt-1 text-xl font-semibold text-[#1b2f28]">Triage coverage today</h2></div>
            <div className="rounded-full bg-[#f4f6f1] px-3 py-1.5 text-xs font-medium text-[#5d7166]">Human-in-the-loop</div>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            <div><p className="text-3xl font-semibold text-[#1b2f28]">{metrics.checkinsToday}</p><p className="mt-1 text-sm text-[#6b7c73]">Check-ins today</p></div>
            <div><p className="text-3xl font-semibold text-[#1b2f28]">{metrics.openRequests}</p><p className="mt-1 text-sm text-[#6b7c73]">Open support cases</p></div>
            <div><p className="text-3xl font-semibold text-[#1b2f28]">{metrics.totalUsers ? Math.round((metrics.checkinsToday / metrics.totalUsers) * 100) : 0}%</p><p className="mt-1 text-sm text-[#6b7c73]">Daily participation</p></div>
          </div>
          <div className="mt-8 space-y-4">
            {[{ key: "GREEN", label: "Stable", color: "bg-[#78b98a]" }, { key: "YELLOW", label: "Needs attention", color: "bg-[#e5b85c]" }, { key: "RED", label: "Priority review", color: "bg-[#d97263]" }].map((item) => (
              <div key={item.key} className="flex items-center gap-3 text-sm"><span className={`h-2.5 w-2.5 rounded-full ${item.color}`} /><span className="w-28 text-[#5d7166]">{item.label}</span><div className="h-2 flex-1 overflow-hidden rounded-full bg-[#eef2ed]"><div className={`h-full rounded-full ${item.color} ${getBarWidth(riskDistribution[item.key] || 0)}`} /></div><span className="w-8 text-right font-semibold text-[#1b2f28]">{riskDistribution[item.key] || 0}</span></div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-[#dfe8e2] bg-[#f4f6f1] p-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#1f5c49] shadow-sm"><Activity className="h-5 w-5" /></div>
          <h2 className="mt-5 text-xl font-semibold text-[#1b2f28]">{overview.methodology.title}</h2>
          <p className="mt-3 text-sm leading-6 text-[#61746a]">{overview.methodology.body}</p>
          <div className="mt-6 border-t border-[#dbe5dc] pt-5 text-xs leading-5 text-[#718279]">Research principle: transparency helps practitioners calibrate the signal and keeps participants in control of their care journey.</div>
        </div>
      </div>

      <div className="rounded-2xl border border-[#dfe8e2] bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#edf1ed] px-6 py-5"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#82958a]">Network directory</p><h2 className="mt-1 text-xl font-semibold text-[#1b2f28]">Recently onboarded participants</h2></div><div className="flex flex-wrap gap-2"><input value={directoryQuery} onChange={(event) => setDirectoryQuery(event.target.value)} placeholder="Search people" className="w-40 rounded-xl border border-[#dfe8e2] px-3 py-2 text-sm outline-none focus:border-[#78b98a]" /><button onClick={() => setContactOnly(!contactOnly)} className={`rounded-xl px-3 py-2 text-xs font-semibold ${contactOnly ? "bg-[#f6eadf] text-[#9a5b2d]" : "bg-[#f4f6f1] text-[#61746a]"}`}>{contactOnly ? "Contact enabled" : "All participants"}</button><button onClick={exportSnapshot} className="inline-flex items-center gap-2 rounded-xl bg-[#1b2f28] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2b5042]"><ClipboardList className="h-4 w-4" /> Export snapshot</button></div></div>
        <div className="divide-y divide-[#edf1ed]">
          {visibleUsers.map((user) => <div key={user.id} className="flex flex-wrap items-center justify-between gap-3 px-6 py-4"><div className="flex min-w-0 items-center gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e4f1ec] font-semibold text-[#1f5c49]">{(user.username || "U").slice(0, 1)}</div><div className="min-w-0"><p className="truncate text-sm font-semibold text-[#1b2f28]">{user.username || "Anonymous participant"}</p><p className="truncate text-xs text-[#82958a]">{user.email || "No email"}</p></div></div><div className="flex items-center gap-4 text-xs text-[#6b7c73]"><span className="inline-flex items-center gap-1"><Languages className="h-3.5 w-3.5" /> {user.preferredLanguage.toUpperCase()}</span>{user.emergencyContactEnabled && <span className="inline-flex items-center gap-1 text-[#9a5b2d]"><AlertTriangle className="h-3.5 w-3.5" /> Contact enabled</span>}<CheckCircle2 className="h-4 w-4 text-[#78b98a]" /></div></div>)}
          {visibleUsers.length === 0 && <div className="px-6 py-10 text-center text-sm text-[#82958a]">No participants match this view.</div>}
        </div>
      </div>
    </section>
  );
}
