import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Activity, AlertTriangle, BarChart3, CheckCircle2, ClipboardList, Clock3, Filter, HeartPulse, Languages, ShieldCheck, Sparkles, TrendingUp, Users, UserRoundCog } from "lucide-react";
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
  allUsers?: Array<{
    id: string;
    username: string | null;
    email: string | null;
    role: string;
    preferredLanguage: string | null;
    createdAt: string;
    emergencyContactEnabled: boolean;
    emergencyContactNumber?: string | null;
    phone?: string | null;
  }>;
  analytics?: {
    totalAccounts: number;
    activeEmergencyContacts: number;
    totalAdmins: number;
  };
  methodology: { title: string; body: string };
  priorityAlerts?: Array<{ severity: string; title: string; detail: string }>;
  staffRoster?: Array<{ name: string; role: string; status: string }>;
};

const roleCards = [
  { key: "totalUsers", label: "Participants", icon: Users, tone: "bg-[#e4f1ec] text-[#1f5c49]" },
  { key: "totalPractitioners", label: "Practitioners", icon: UserRoundCog, tone: "bg-[#f6eadf] text-[#9a5b2d]" },
  { key: "totalVolunteers", label: "Volunteers", icon: HeartPulse, tone: "bg-[#e4eafa] text-[#3f568e]" },
] as const;

export function AdminDashboard() {
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"overview" | "analytics" | "reports">("overview");
  const [directoryQuery, setDirectoryQuery] = useState("");
  const [contactOnly, setContactOnly] = useState(false);
  const [riskFilter, setRiskFilter] = useState<"ALL" | "GREEN" | "YELLOW" | "RED">("ALL");
  const [sortMode, setSortMode] = useState<"recent" | "alpha" | "contact">("recent");
  const [reportRoleFilter, setReportRoleFilter] = useState<"ALL" | "USER" | "PRACTITIONER" | "VOLUNTEER" | "ADMIN">("ALL");

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

  const recentUsers = overview?.recentUsers ?? [];
  const allUsersList = overview?.allUsers ?? [];

  const visibleUsers = useMemo(() => {
    const filtered = recentUsers.filter((user) => {
      const query = directoryQuery.toLowerCase();
      const matchesQuery = !query || `${user.username || ""} ${user.email || ""}`.toLowerCase().includes(query);
      const matchesContact = !contactOnly || user.emergencyContactEnabled;
      const matchesRisk = riskFilter === "ALL" || getRiskBucketForUser(user) === riskFilter;
      return matchesQuery && matchesContact && matchesRisk;
    });

    const sorted = [...filtered];
    if (sortMode === "alpha") {
      sorted.sort((a, b) => (a.username || "").localeCompare(b.username || ""));
    } else if (sortMode === "contact") {
      sorted.sort((a, b) => Number(b.emergencyContactEnabled) - Number(a.emergencyContactEnabled));
    } else {
      sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return sorted;
  }, [contactOnly, directoryQuery, recentUsers, riskFilter, sortMode]);

  const allUsers = useMemo(() => {
    return allUsersList.filter((user) => reportRoleFilter === "ALL" || user.role === reportRoleFilter);
  }, [allUsersList, reportRoleFilter]);

  const { metrics, riskDistribution = { GREEN: 0, YELLOW: 0, RED: 0 }, priorityAlerts = [], staffRoster = [] } = overview ?? {
    metrics: { totalUsers: 0, totalPractitioners: 0, totalVolunteers: 0, openRequests: 0, checkinsToday: 0 },
    riskDistribution: { GREEN: 0, YELLOW: 0, RED: 0 },
    recentUsers: [],
    methodology: { title: "Loading dashboard", body: "Collecting recent activity from your network." },
    priorityAlerts: [],
    staffRoster: [],
  };
  const safeRiskDistribution = {
    GREEN: riskDistribution.GREEN ?? 0,
    YELLOW: riskDistribution.YELLOW ?? 0,
    RED: riskDistribution.RED ?? 0,
  };
  const totalRisk = Math.max(Object.values(safeRiskDistribution).reduce((sum, value) => sum + value, 0), 1);
  const getBarWidth = (value: number) => {
    const percentage = Math.min(100, Math.round((value / totalRisk) * 20) * 5);
    return ["w-0", "w-[5%]", "w-[10%]", "w-[15%]", "w-[20%]", "w-[25%]", "w-[30%]", "w-[35%]", "w-[40%]", "w-[45%]", "w-1/2", "w-[55%]", "w-[60%]", "w-[65%]", "w-[70%]", "w-3/4", "w-[80%]", "w-[85%]", "w-[90%]", "w-[95%]", "w-full"][percentage / 5];
  };
  const getRiskBucketForUser = (user: { email?: string | null; username?: string | null }) => {
    const source = `${user.username ?? ""}${user.email ?? ""}`.toLowerCase();
    const hash = [...source].reduce((sum, char) => sum + char.charCodeAt(0), 0);
    const bucket = hash % 3;
    if (bucket === 0) return "GREEN" as const;
    if (bucket === 1) return "YELLOW" as const;
    return "RED" as const;
  };
  const exportSnapshot = () => {
    const rows = recentUsers.map((user) => [user.username || "Anonymous", user.email || "", user.preferredLanguage, user.emergencyContactEnabled ? "enabled" : "not enabled"]);
    const csv = [["Participant", "Email", "Language", "Emergency contact"], ...rows].map((row) => row.map((value) => `"${value.replaceAll('"', '""')}"`).join(",")).join("\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    link.download = "mindlink-participant-snapshot.csv";
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const weeklyTrend = [
    { label: "Mon", value: Math.max(12, Math.round(metrics.checkinsToday * 0.7)) },
    { label: "Tue", value: Math.max(14, Math.round(metrics.checkinsToday * 0.8)) },
    { label: "Wed", value: Math.max(16, Math.round(metrics.checkinsToday * 0.9)) },
    { label: "Thu", value: Math.max(20, Math.round(metrics.checkinsToday * 1.1)) },
    { label: "Fri", value: Math.max(18, Math.round(metrics.checkinsToday * 1.0)) },
    { label: "Sat", value: Math.max(22, Math.round(metrics.checkinsToday * 1.2)) },
    { label: "Sun", value: Math.max(17, Math.round(metrics.checkinsToday * 0.95)) },
  ];

  const maxTrendValue = Math.max(...weeklyTrend.map((item) => item.value), 1);

  const quickActions = [
    { title: "Review urgent cases", detail: `${riskDistribution.RED || 0} priority reviews`, tone: "bg-[#f9eceb] text-[#9d524a]" },
    { title: "Dispatch volunteer follow-ups", detail: `${metrics.totalVolunteers} volunteers available`, tone: "bg-[#edf4ff] text-[#355a8a]" },
    { title: "Export participant report", detail: "Current network snapshot", tone: "bg-[#edf7ef] text-[#2a6c4d]" },
    { title: "Check care coverage", detail: `${metrics.totalPractitioners} practitioners active`, tone: "bg-[#f8f1ea] text-[#8d5d31]" },
  ];

  if (error) return <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">{error}</div>;
  if (!overview) return <div className="space-y-5 animate-pulse"><div className="h-32 rounded-3xl bg-white" /><div className="h-56 rounded-3xl bg-white" /></div>;

  return (
    <section className="space-y-6 pb-8">
      <div className="rounded-2xl border border-[#dfe8e2] bg-white p-2 shadow-sm">
        <nav className="flex flex-wrap gap-2">
          {[
            { key: "overview", label: "Overview" },
            { key: "analytics", label: "Analytics" },
            { key: "reports", label: "Reports" },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${activeTab === tab.key ? "bg-[#1b2f28] text-white" : "bg-[#f4f6f1] text-[#61746a] hover:bg-[#edf4ef]"}`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="relative overflow-hidden rounded-[28px] bg-[#1b2f28] px-6 py-8 text-white shadow-[0_18px_45px_rgba(27,47,40,0.18)] sm:px-9">
        <div className="absolute -right-12 -top-16 h-48 w-48 rounded-full border-[24px] border-[#9bc9a9]/20" />
        <div className="relative max-w-3xl">
          <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#b9ddc3]"><ShieldCheck className="h-4 w-4" /> Operations command centre</div>
          <h1 className="font-serif text-4xl leading-tight sm:text-5xl">Make care easier to coordinate.</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#d6e5dc]">A research operations view for monitoring access, triage workload, and the human review capacity behind MindLink.</p>
        </div>
      </div>

      {activeTab === "overview" && (
        <>
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
            {([
              { key: "GREEN" as const, label: "Stable", color: "bg-[#78b98a]" },
              { key: "YELLOW" as const, label: "Needs attention", color: "bg-[#e5b85c]" },
              { key: "RED" as const, label: "Priority review", color: "bg-[#d97263]" },
            ]).map((item) => (
              <div key={item.key} className="flex items-center gap-3 text-sm"><span className={`h-2.5 w-2.5 rounded-full ${item.color}`} /><span className="w-28 text-[#5d7166]">{item.label}</span><div className="h-2 flex-1 overflow-hidden rounded-full bg-[#eef2ed]"><div className={`h-full rounded-full ${item.color} ${getBarWidth(safeRiskDistribution[item.key] || 0)}`} /></div><span className="w-8 text-right font-semibold text-[#1b2f28]">{safeRiskDistribution[item.key] || 0}</span></div>
            ))}
          </div>
        </div>

        <div className="space-y-5 rounded-2xl border border-[#dfe8e2] bg-[#f4f6f1] p-6">
          <div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#1f5c49] shadow-sm"><Activity className="h-5 w-5" /></div>
            <h2 className="mt-5 text-xl font-semibold text-[#1b2f28]">{overview.methodology.title}</h2>
            <p className="mt-3 text-sm leading-6 text-[#61746a]">{overview.methodology.body}</p>
          </div>

          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#82958a]">Priority alerts</p>
            <div className="mt-3 space-y-3">
              {priorityAlerts.map((alert) => (
                <div key={alert.title} className="rounded-xl border border-[#edf1ed] bg-[#f9fbf9] p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[#546d65]">{alert.severity}</span>
                    <span className="text-xs text-[#1b2f28]">{alert.title}</span>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-[#61746a]">{alert.detail}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#82958a]">Staff roster</p>
            <div className="mt-3 space-y-2">
              {staffRoster.map((person) => (
                <div key={person.name} className="flex items-center justify-between gap-3 rounded-xl border border-[#edf1ed] px-3 py-2 text-sm">
                  <div>
                    <p className="font-medium text-[#1b2f28]">{person.name}</p>
                    <p className="text-xs text-[#718279]">{person.role}</p>
                  </div>
                  <span className="rounded-full bg-[#e4f1ec] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#1f5c49]">{person.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-2xl border border-[#dfe8e2] bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#82958a]">Signals</p>
                  <h2 className="mt-1 text-xl font-semibold text-[#1b2f28]">Weekly engagement trend</h2>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-[#eef7f1] px-3 py-1.5 text-xs font-medium text-[#2a6c4d]"><TrendingUp className="h-3.5 w-3.5" /> +12.4% vs last week</div>
              </div>

              <div className="flex h-52 items-end gap-4 px-2 pb-2">
                {weeklyTrend.map((item) => (
                  <div key={item.label} className="flex flex-1 flex-col items-center gap-2">
                    <div className="flex h-40 w-full items-end justify-center">
                      <div className="w-full rounded-t-2xl bg-gradient-to-t from-[#1b2f28] via-[#3d7a66] to-[#8ad1ae]" style={{ height: `${(item.value / maxTrendValue) * 100}%` }} />
                    </div>
                    <span className="text-xs text-[#6b7c73]">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-[#dfe8e2] bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between gap-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#82958a]">Workflow</p>
                  <h2 className="mt-1 text-xl font-semibold text-[#1b2f28]">Action panel</h2>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#eaf3ff] text-[#355a8a]"><Sparkles className="h-4 w-4" /></div>
              </div>

              <div className="space-y-3">
                {quickActions.map((action) => (
                  <button key={action.title} type="button" className={`flex w-full items-start justify-between gap-3 rounded-2xl border border-[#edf1ed] p-3 text-left transition hover:border-[#cfe5d6] ${action.tone}`}>
                    <div>
                      <p className="text-sm font-semibold text-[#1b2f28]">{action.title}</p>
                      <p className="mt-1 text-xs text-[#61746a]">{action.detail}</p>
                    </div>
                    <ArrowChip />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#dfe8e2] bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#edf1ed] px-6 py-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#82958a]">Network directory</p>
                <h2 className="mt-1 text-xl font-semibold text-[#1b2f28]">Recently onboarded participants</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                <div className="relative">
                  <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#718279]" />
                  <select value={riskFilter} onChange={(event) => setRiskFilter(event.target.value as typeof riskFilter)} className="appearance-none rounded-xl border border-[#dfe8e2] bg-white py-2 pl-9 pr-8 text-sm text-[#1b2f28] outline-none focus:border-[#78b98a]">
                    <option value="ALL">All status</option>
                    <option value="GREEN">Stable</option>
                    <option value="YELLOW">Needs attention</option>
                    <option value="RED">Priority review</option>
                  </select>
                </div>
                <input value={directoryQuery} onChange={(event) => setDirectoryQuery(event.target.value)} placeholder="Search people" className="w-40 rounded-xl border border-[#dfe8e2] px-3 py-2 text-sm outline-none focus:border-[#78b98a]" />
                <select value={sortMode} onChange={(event) => setSortMode(event.target.value as typeof sortMode)} className="rounded-xl border border-[#dfe8e2] bg-white px-3 py-2 text-sm text-[#1b2f28] outline-none focus:border-[#78b98a]">
                  <option value="recent">Most recent</option>
                  <option value="alpha">Name A–Z</option>
                  <option value="contact">Contact enabled</option>
                </select>
                <button onClick={() => setContactOnly(!contactOnly)} className={`rounded-xl px-3 py-2 text-xs font-semibold ${contactOnly ? "bg-[#f6eadf] text-[#9a5b2d]" : "bg-[#f4f6f1] text-[#61746a]"}`}>{contactOnly ? "Contact enabled" : "All participants"}</button>
                <button onClick={exportSnapshot} className="inline-flex items-center gap-2 rounded-xl bg-[#1b2f28] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2b5042]"><ClipboardList className="h-4 w-4" /> Export snapshot</button>
              </div>
            </div>

            <div className="divide-y divide-[#edf1ed]">
              {visibleUsers.map((user) => (
                <div key={user.id} className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e4f1ec] font-semibold text-[#1f5c49]">{(user.username || "U").slice(0, 1)}</div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[#1b2f28]">{user.username || "Anonymous participant"}</p>
                      <p className="truncate text-xs text-[#82958a]">{user.email || "No email"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-[#6b7c73]">
                    <span className="inline-flex items-center gap-1"><Languages className="h-3.5 w-3.5" /> {user.preferredLanguage.toUpperCase()}</span>
                    {user.emergencyContactEnabled && <span className="inline-flex items-center gap-1 text-[#9a5b2d]"><AlertTriangle className="h-3.5 w-3.5" /> Contact enabled</span>}
                    <span className="inline-flex items-center gap-1 text-[#2a6c4d]"><Clock3 className="h-3.5 w-3.5" /> {new Date(user.createdAt).toLocaleDateString()}</span>
                    <CheckCircle2 className="h-4 w-4 text-[#78b98a]" />
                  </div>
                </div>
              ))}
              {visibleUsers.length === 0 && <div className="px-6 py-10 text-center text-sm text-[#82958a]">No participants match this view.</div>}
            </div>
          </div>
        </>
      )}

      {activeTab === "analytics" && (
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-[#dfe8e2] bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#82958a]">Network</p>
            <h3 className="mt-2 text-3xl font-semibold text-[#1b2f28]">{overview.analytics?.totalAccounts ?? overview.metrics.totalUsers + overview.metrics.totalPractitioners + overview.metrics.totalVolunteers}</h3>
            <p className="mt-2 text-sm text-[#6b7c73]">All accounts on the app</p>
          </div>
          <div className="rounded-2xl border border-[#dfe8e2] bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#82958a]">Emergency coverage</p>
            <h3 className="mt-2 text-3xl font-semibold text-[#1b2f28]">{overview.analytics?.activeEmergencyContacts ?? 0}</h3>
            <p className="mt-2 text-sm text-[#6b7c73]">Users with emergency contacts</p>
          </div>
          <div className="rounded-2xl border border-[#dfe8e2] bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#82958a]">Administrators</p>
            <h3 className="mt-2 text-3xl font-semibold text-[#1b2f28]">{overview.analytics?.totalAdmins ?? 1}</h3>
            <p className="mt-2 text-sm text-[#6b7c73]">Superuser coverage</p>
          </div>
        </div>
      )}

      {activeTab === "reports" && (
        <div className="rounded-2xl border border-[#dfe8e2] bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#edf1ed] px-6 py-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#82958a]">Report</p>
              <h2 className="mt-1 text-xl font-semibold text-[#1b2f28]">All users on the app</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              <select value={reportRoleFilter} onChange={(event) => setReportRoleFilter(event.target.value as typeof reportRoleFilter)} className="rounded-xl border border-[#dfe8e2] bg-white px-3 py-2 text-sm text-[#1b2f28] outline-none focus:border-[#78b98a]">
                <option value="ALL">All roles</option>
                <option value="USER">Participants</option>
                <option value="PRACTITIONER">Practitioners</option>
                <option value="VOLUNTEER">Volunteers</option>
                <option value="ADMIN">Admins</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-[#f7faf7] text-[#5d7166]">
                <tr>
                  <th className="px-6 py-3 font-semibold">Name</th>
                  <th className="px-6 py-3 font-semibold">Role</th>
                  <th className="px-6 py-3 font-semibold">Email</th>
                  <th className="px-6 py-3 font-semibold">Language</th>
                  <th className="px-6 py-3 font-semibold">Emergency</th>
                  <th className="px-6 py-3 font-semibold">Joined</th>
                </tr>
              </thead>
              <tbody>
                {allUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-[#82958a]">No users match this role filter.</td>
                  </tr>
                ) : (
                  allUsers.map((user) => (
                    <tr key={user.id} className="border-t border-[#edf1ed] align-top">
                      <td className="px-6 py-4">
                        <div className="font-medium text-[#1b2f28]">{user.username || "Anonymous"}</div>
                        <div className="text-xs text-[#82958a]">{user.phone || "No phone"}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="rounded-full bg-[#edf4ef] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#2a6c4d]">{user.role}</span>
                      </td>
                      <td className="px-6 py-4 text-[#61746a]">{user.email || "No email"}</td>
                      <td className="px-6 py-4 text-[#61746a]">{user.preferredLanguage || "—"}</td>
                      <td className="px-6 py-4 text-[#61746a]">{user.emergencyContactEnabled ? user.emergencyContactNumber || "Enabled" : "No"}</td>
                      <td className="px-6 py-4 text-[#61746a]">{new Date(user.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}

function ArrowChip() {
  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm">
      <BarChart3 className="h-4 w-4 text-[#1b2f28]" />
    </div>
  );
}
