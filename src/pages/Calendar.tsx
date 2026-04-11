import { useState, useEffect, useMemo } from "react";
import { Card } from "../components/shared/Card";
import { SessionCard } from "../components/dashboard/SessionCard";
import type { Session } from "../types";

type ViewMode = "month" | "list";
type SessionFilter = "all" | "upcoming" | "past" | "confirmed" | "pending" | "cancelled";

// Helper functions
const getDaysInMonth = (date: Date) => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
};

const getFirstDayOfMonth = (date: Date) => {
  return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
};

const isSameDay = (date1: Date, date2: Date) => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

const isToday = (date: Date) => {
  return isSameDay(date, new Date());
};

const formatMonthYear = (date: Date) => {
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
};

export function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [sessionFilter, setSessionFilter] = useState<SessionFilter>("all");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);

  // Load sessions from localStorage
  useEffect(() => {
    const loadSessions = () => {
      const stored = localStorage.getItem("sessions");
      if (stored) {
        const parsed = JSON.parse(stored) as Array<Omit<Session, 'dateTime'> & { dateTime: string }>;
        // Convert dateTime strings back to Date objects
        const sessionsWithDates = parsed.map(s => ({
          ...s,
          dateTime: new Date(s.dateTime),
        }));
        setSessions(sessionsWithDates);
      } else {
        // Load mock sessions from Dashboard as initial data
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
        // Save to localStorage
        localStorage.setItem("sessions", JSON.stringify(mockSessions));
      }
    };
    loadSessions();
    
    // Listen for storage changes
    window.addEventListener("storage", loadSessions);
    const interval = setInterval(loadSessions, 1000);
    
    return () => {
      window.removeEventListener("storage", loadSessions);
      clearInterval(interval);
    };
  }, []);

  // Filter sessions based on selected filter
  const filteredSessions = useMemo(() => {
    const now = new Date();
    
    return sessions.filter(session => {
      const isUpcoming = session.dateTime > now;
      const isPast = session.dateTime <= now;
      
      switch (sessionFilter) {
        case "upcoming":
          return isUpcoming;
        case "past":
          return isPast;
        case "confirmed":
          return session.status === "confirmed";
        case "pending":
          return session.status === "pending";
        case "cancelled":
          return session.status === "cancelled";
        default:
          return true;
      }
    }).sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime());
  }, [sessions, sessionFilter]);

  // Get sessions for a specific date
  const getSessionsForDate = (date: Date) => {
    return sessions.filter(session => isSameDay(session.dateTime, date));
  };

  // Calendar grid generation
  const calendarDays = useMemo(() => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days: (Date | null)[] = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
    }

    return days;
  }, [currentDate]);

  // Navigation functions
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(null);
  };

  // Get sessions for selected date
  const selectedDateSessions = selectedDate ? getSessionsForDate(selectedDate) : [];

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Calendar</h1>
          <p className="text-gray-600">View and manage your appointments and sessions</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={goToToday}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors text-sm"
          >
            Today
          </button>
          <button
            onClick={() => setViewMode(viewMode === "month" ? "list" : "month")}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors text-sm"
          >
            {viewMode === "month" ? "List View" : "Month View"}
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs sm:text-sm font-medium text-gray-700">Filter:</span>
        {(["all", "upcoming", "past", "confirmed", "pending", "cancelled"] as SessionFilter[]).map((filter) => (
          <button
            key={filter}
            onClick={() => setSessionFilter(filter)}
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
              sessionFilter === filter
                ? "bg-purple-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
            }`}
          >
            {filter.charAt(0).toUpperCase() + filter.slice(1)}
          </button>
        ))}
      </div>

      {viewMode === "month" ? (
        <>
          {/* Month View */}
          <Card className="p-4 sm:p-6">
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={goToPreviousMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Previous month"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h2 className="text-xl font-semibold text-gray-900">{formatMonthYear(currentDate)}</h2>
              <button
                onClick={goToNextMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Next month"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-0.5 sm:gap-1 md:gap-2">
              {/* Week day headers */}
              {weekDays.map((day) => (
                <div key={day} className="text-center text-xs sm:text-sm font-medium text-gray-600 py-1 sm:py-2">
                  {day}
                </div>
              ))}

              {/* Calendar days */}
              {calendarDays.map((date, index) => {
                if (!date) {
                  return <div key={`empty-${index}`} className="aspect-square" />;
                }

                const daySessions = getSessionsForDate(date);
                const isSelected = selectedDate && isSameDay(date, selectedDate);
                const isTodayDate = isToday(date);

                return (
                  <button
                    key={date.toISOString()}
                    onClick={() => setSelectedDate(date)}
                    className={`aspect-square p-0.5 sm:p-1 md:p-2 rounded-md sm:rounded-lg border-2 transition-all hover:bg-gray-50 ${
                      isSelected
                        ? "border-purple-600 bg-purple-50"
                        : isTodayDate
                        ? "border-purple-300 bg-purple-50/50"
                        : "border-transparent"
                    }`}
                  >
                    <div className="flex flex-col h-full">
                      <span
                        className={`text-xs sm:text-sm md:text-base font-medium mb-0.5 sm:mb-1 ${
                          isTodayDate ? "text-purple-600" : "text-gray-900"
                        }`}
                      >
                        {date.getDate()}
                      </span>
                      {daySessions.length > 0 && (
                        <div className="flex flex-wrap gap-0.5 mt-auto">
                          {daySessions.slice(0, 2).map((session) => (
                            <div
                              key={session.id}
                              className={`h-1 sm:h-1.5 w-full rounded ${
                                session.status === "confirmed"
                                  ? "bg-green-500"
                                  : session.status === "pending"
                                  ? "bg-yellow-500"
                                  : "bg-red-500"
                              }`}
                              title={session.title}
                            />
                          ))}
                          {daySessions.length > 2 && (
                            <div className="text-[10px] sm:text-xs text-gray-500">+{daySessions.length - 2}</div>
                          )}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Selected Date Sessions */}
          {selectedDate && selectedDateSessions.length > 0 && (
            <Card className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Sessions on {selectedDate.toLocaleDateString("en-US", { 
                    weekday: "long", 
                    year: "numeric", 
                    month: "long", 
                    day: "numeric" 
                  })}
                </h3>
                <button
                  onClick={() => setSelectedDate(null)}
                  className="text-gray-400 hover:text-gray-600"
                  aria-label="Close"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedDateSessions.map((session) => (
                  <SessionCard key={session.id} {...session} />
                ))}
              </div>
            </Card>
          )}
        </>
      ) : (
        <>
          {/* List View */}
          {filteredSessions.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="text-6xl mb-4">📅</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No sessions found</h3>
              <p className="text-gray-600">
                {sessionFilter === "all"
                  ? "You don't have any sessions scheduled yet."
                  : `You don't have any ${sessionFilter} sessions.`}
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {/* Group sessions by date */}
              {Object.entries(
                filteredSessions.reduce((groups, session) => {
                  const dateKey = session.dateTime.toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  });
                  if (!groups[dateKey]) {
                    groups[dateKey] = [];
                  }
                  groups[dateKey].push(session);
                  return groups;
                }, {} as Record<string, Session[]>)
              )
                .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
                .map(([date, dateSessions]) => (
                  <Card key={date} className="p-4 sm:p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">{date}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {dateSessions.map((session) => (
                        <SessionCard key={session.id} {...session} />
                      ))}
                    </div>
                  </Card>
                ))}
            </div>
          )}
        </>
      )}

      {/* Statistics Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-4">
          <div className="text-sm text-gray-600 mb-1">Total Sessions</div>
          <div className="text-2xl font-bold text-gray-900">{sessions.length}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600 mb-1">Upcoming</div>
          <div className="text-2xl font-bold text-green-600">
            {sessions.filter(s => s.dateTime > new Date()).length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600 mb-1">Confirmed</div>
          <div className="text-2xl font-bold text-blue-600">
            {sessions.filter(s => s.status === "confirmed").length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600 mb-1">This Month</div>
          <div className="text-2xl font-bold text-purple-600">
            {sessions.filter(s => {
              const now = new Date();
              return s.dateTime.getMonth() === now.getMonth() && 
                     s.dateTime.getFullYear() === now.getFullYear();
            }).length}
          </div>
        </Card>
      </div>
    </div>
  );
}
