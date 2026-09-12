import { useState, useEffect, useMemo } from "react";
import { Card } from "../components/shared/Card";
import type { Session } from "../types";

type ViewFilter = "all" | "upcoming" | "past";
type StatusFilter = "all" | "confirmed" | "pending" | "cancelled";

// Helper functions
const formatSessionDate = (dateTime: Date, timezone: string): string => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const dayName = days[dateTime.getDay()];
  const month = months[dateTime.getMonth()];
  const day = dateTime.getDate();
  const hours = dateTime.getHours();
  const minutes = dateTime.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  const displayMinutes = minutes.toString().padStart(2, '0');
  
  return `${dayName}, ${month} ${day} at ${displayHours}:${displayMinutes} ${ampm} (${timezone})`;
};

const formatRole = (role: Session['professional']['role']): string => {
  const roleMap = {
    counselor: 'Counselor',
    volunteer: 'Volunteer Listener',
    nurse: 'Psychiatric Nurse',
  };
  return roleMap[role];
};

const formatType = (type: Session['type']): string => {
  return type === 'individual' ? 'Individual Session' : 'Group Session';
};

const getStatusColor = (status: Session['status']) => {
  switch (status) {
    case 'confirmed':
      return 'bg-green-100 text-green-700 border-green-200';
    case 'pending':
      return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    case 'cancelled':
      return 'bg-red-100 text-red-700 border-red-200';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

interface SessionDetailsModalProps {
  session: Session | null;
  isOpen: boolean;
  onClose: () => void;
  onCancel: (sessionId: string) => void;
}

function SessionDetailsModal({ session, isOpen, onClose, onCancel }: SessionDetailsModalProps) {
  if (!isOpen || !session) return null;

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel this session?')) {
      onCancel(session.id);
      onClose();
    }
  };

  const isUpcoming = session.dateTime > new Date();
  const canJoin = isUpcoming && session.status === 'confirmed' && session.meetLink;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 relative max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Session Title */}
        <h2 className="text-2xl font-bold text-gray-900 mb-4 pr-8">{session.title}</h2>

        {/* Status Badge */}
        <div className="mb-6">
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(session.status)}`}>
            {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
          </span>
        </div>

        {/* Session Details */}
        <div className="space-y-4 mb-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Date & Time</h3>
            <p className="text-gray-900">{formatSessionDate(session.dateTime, session.timezone)}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Professional</h3>
            <div className="flex items-center gap-3">
              {session.professional.avatar ? (
                <img
                  src={session.professional.avatar}
                  alt={session.professional.name}
                  className="w-12 h-12 rounded-full"
                />
              ) : (
                <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 font-semibold">
                    {session.professional.name.split(" ").map((n) => n[0]).join("")}
                  </span>
                </div>
              )}
              <div>
                <p className="text-gray-900 font-medium">{session.professional.name}</p>
                <p className="text-sm text-gray-500">{formatRole(session.professional.role)}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Session Type</h3>
            <p className="text-gray-900">{formatType(session.type)}</p>
          </div>

          {session.meetLink && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Meeting Link</h3>
              <a
                href={session.meetLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-600 hover:text-purple-700 font-medium break-all"
              >
                {session.meetLink}
              </a>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
          {canJoin && (
            <a
              href={session.meetLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors text-center"
            >
              Join Meeting
            </a>
          )}
          {isUpcoming && session.status !== 'cancelled' && (
            <button
              onClick={handleCancel}
              className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors"
            >
              Cancel Session
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export function MySession() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [viewFilter, setViewFilter] = useState<ViewFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Load sessions from localStorage
  useEffect(() => {
    const loadSessions = () => {
      const stored = localStorage.getItem("sessions");
      if (stored) {
        const parsed = JSON.parse(stored) as Array<Omit<Session, 'dateTime'> & { dateTime: string }>;
        const sessionsWithDates = parsed.map(s => ({
          ...s,
          dateTime: new Date(s.dateTime),
        }));
        setSessions(sessionsWithDates);
      } else {
        // Load mock sessions as initial data
        const mockSessions: Session[] = [
          {
            id: "1",
            title: "Managing Anxiety in Daily Life",
            type: "individual",
            professional: {
              id: "1",
              name: "Dr. Mette Andersen",
              role: "counselor",
            },
            dateTime: new Date("2024-10-08T08:45:00+02:00"),
            timezone: "GMT +2",
            status: "confirmed",
            meetLink: "https://meet.google.com/abc-defg-hij",
          },
          {
            id: "2",
            title: "Finding Balance Through Shared Experience",
            type: "group",
            professional: {
              id: "2",
              name: "Sarah Johnson",
              role: "volunteer",
            },
            dateTime: new Date("2024-10-10T18:00:00+02:00"),
            timezone: "GMT +2",
            status: "confirmed",
            meetLink: "https://meet.google.com/xyz-uvwx-rst",
          },
        ];
        setSessions(mockSessions);
        localStorage.setItem("sessions", JSON.stringify(mockSessions));
      }
    };
    loadSessions();
    
    window.addEventListener("storage", loadSessions);
    const interval = setInterval(loadSessions, 1000);
    
    return () => {
      window.removeEventListener("storage", loadSessions);
      clearInterval(interval);
    };
  }, []);

  // Filter sessions
  const filteredSessions = useMemo(() => {
    const now = new Date();
    
    return sessions.filter(session => {
      const isUpcoming = session.dateTime > now;
      const isPast = session.dateTime <= now;
      
      // View filter
      let matchesView = true;
      if (viewFilter === "upcoming") {
        matchesView = isUpcoming;
      } else if (viewFilter === "past") {
        matchesView = isPast;
      }
      
      // Status filter
      const matchesStatus = statusFilter === "all" || session.status === statusFilter;
      
      return matchesView && matchesStatus;
    }).sort((a, b) => {
      // Sort upcoming by date ascending, past by date descending
      if (a.dateTime > new Date() && b.dateTime > new Date()) {
        return a.dateTime.getTime() - b.dateTime.getTime();
      } else if (a.dateTime <= new Date() && b.dateTime <= new Date()) {
        return b.dateTime.getTime() - a.dateTime.getTime();
      } else {
        return a.dateTime > new Date() ? -1 : 1;
      }
    });
  }, [sessions, viewFilter, statusFilter]);

  // Calculate statistics
  const stats = useMemo(() => {
    const now = new Date();
    return {
      total: sessions.length,
      upcoming: sessions.filter(s => s.dateTime > now && s.status !== 'cancelled').length,
      past: sessions.filter(s => s.dateTime <= now).length,
      confirmed: sessions.filter(s => s.status === 'confirmed').length,
      pending: sessions.filter(s => s.status === 'pending').length,
      cancelled: sessions.filter(s => s.status === 'cancelled').length,
    };
  }, [sessions]);

  const handleViewDetails = (session: Session) => {
    setSelectedSession(session);
    setIsModalOpen(true);
  };

  const handleCancelSession = (sessionId: string) => {
    const updatedSessions = sessions.map(s => 
      s.id === sessionId ? { ...s, status: 'cancelled' as const } : s
    );
    setSessions(updatedSessions);
    localStorage.setItem("sessions", JSON.stringify(updatedSessions));
  };

  // Group sessions by date
  const groupedSessions = useMemo(() => {
    const groups: Record<string, Session[]> = {};
    filteredSessions.forEach(session => {
      const dateKey = session.dateTime.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(session);
    });
    return groups;
  }, [filteredSessions]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">My Sessions</h1>
          <p className="text-gray-600">View and manage your appointments and session history</p>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <Card className="p-4">
          <div className="text-sm text-gray-600 mb-1">Total</div>
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600 mb-1">Upcoming</div>
          <div className="text-2xl font-bold text-green-600">{stats.upcoming}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600 mb-1">Past</div>
          <div className="text-2xl font-bold text-gray-600">{stats.past}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600 mb-1">Confirmed</div>
          <div className="text-2xl font-bold text-blue-600">{stats.confirmed}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600 mb-1">Pending</div>
          <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600 mb-1">Cancelled</div>
          <div className="text-2xl font-bold text-red-600">{stats.cancelled}</div>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-3 sm:gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs sm:text-sm font-medium text-gray-700">View:</span>
          {(["all", "upcoming", "past"] as ViewFilter[]).map((filter) => (
            <button
              key={filter}
              onClick={() => setViewFilter(filter)}
              className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                viewFilter === filter
                  ? "bg-purple-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
              }`}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs sm:text-sm font-medium text-gray-700">Status:</span>
          {(["all", "confirmed", "pending", "cancelled"] as StatusFilter[]).map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                statusFilter === filter
                  ? "bg-purple-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
              }`}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Sessions List */}
      {filteredSessions.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="text-6xl mb-4">📅</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No sessions found</h3>
          <p className="text-gray-600">
            {viewFilter === "all"
              ? "You don't have any sessions yet."
              : `You don't have any ${viewFilter} sessions.`}
          </p>
        </Card>
      ) : (
        <div className="max-w-4xl space-y-6">
          {Object.entries(groupedSessions)
            .sort((a, b) => {
              // Sort dates: upcoming first (ascending), then past (descending)
              const dateA = new Date(a[0]);
              const dateB = new Date(b[0]);
              const now = new Date();
              
              if (dateA > now && dateB > now) {
                return dateA.getTime() - dateB.getTime();
              } else if (dateA <= now && dateB <= now) {
                return dateB.getTime() - dateA.getTime();
              } else {
                return dateA > now ? -1 : 1;
              }
            })
            .map(([date, dateSessions]) => {
              const isUpcoming = dateSessions.some(s => s.dateTime > new Date());
              
              return (
                <div key={date}>
                  <h2 className={`text-lg font-semibold mb-3 ${
                    isUpcoming ? "text-green-600" : "text-gray-600"
                  }`}>
                    {date} {isUpcoming && <span className="text-sm">(Upcoming)</span>}
                  </h2>
                  <div className="space-y-3">
                    {dateSessions.map((session) => {
                      const isUpcomingSession = session.dateTime > new Date();
                      const canJoin = isUpcomingSession && session.status === 'confirmed' && session.meetLink;
                      
                      return (
                        <div key={session.id} className="bg-white rounded-lg p-3 sm:p-5 border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all duration-200">
                          <div className="flex items-start gap-3 sm:gap-4">
                            {/* Professional Avatar */}
                            {session.professional.avatar ? (
                              <img
                                src={session.professional.avatar}
                                alt={session.professional.name}
                                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover flex-shrink-0"
                              />
                            ) : (
                              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-white font-semibold text-xs sm:text-sm">
                                  {session.professional.name.split(" ").map((n) => n[0]).join("")}
                                </span>
                              </div>
                            )}

                            {/* Main Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4 mb-2">
                                <div className="flex-1 min-w-0">
                                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1">
                                    <h3 className="text-sm sm:text-base font-semibold text-gray-900">{session.title}</h3>
                                    <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium border ${getStatusColor(session.status)}`}>
                                      {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                                    </span>
                                  </div>
                                  <p className="text-xs sm:text-sm text-gray-600 mb-1.5 sm:mb-2">{formatSessionDate(session.dateTime, session.timezone)}</p>
                                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[10px] sm:text-xs text-gray-500">
                                    <span>{session.professional.name}</span>
                                    <span className="hidden sm:inline">•</span>
                                    <span>{formatRole(session.professional.role)}</span>
                                    <span className="hidden sm:inline">•</span>
                                    <span>{formatType(session.type)}</span>
                                  </div>
                                </div>
                                <div className="flex gap-1.5 sm:gap-2 flex-shrink-0">
                                  {canJoin && (
                                    <a
                                      href={session.meetLink}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="px-2.5 sm:px-3 py-1.5 bg-purple-600 text-white rounded-lg text-xs sm:text-sm font-medium hover:bg-purple-700 transition-colors"
                                    >
                                      Join
                                    </a>
                                  )}
                                  <button
                                    onClick={() => handleViewDetails(session)}
                                    className="px-2.5 sm:px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs sm:text-sm font-medium hover:bg-gray-200 transition-colors"
                                  >
                                    Details
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {/* Session Details Modal */}
      <SessionDetailsModal
        session={selectedSession}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedSession(null);
        }}
        onCancel={handleCancelSession}
      />
    </div>
  );
}
