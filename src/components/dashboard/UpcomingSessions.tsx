import { SessionCard } from "./SessionCard";
import type { Session } from "../../types";

interface UpcomingSessionsProps {
  sessions: Session[];
}

export function UpcomingSessions({ sessions }: UpcomingSessionsProps) {
  return (
    <section>
      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">Your Upcoming Sessions</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sessions.map((session) => (
          <SessionCard key={session.id} {...session} />
        ))}
      </div>
    </section>
  );
}

