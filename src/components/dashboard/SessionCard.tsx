import type { Session } from "../../types";

function formatSessionDate(dateTime: Date, timezone: string): string {
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
}

function formatRole(role: Session['professional']['role']): string {
  const roleMap = {
    counselor: 'Counselor',
    volunteer: 'Volunteer Listener',
    nurse: 'Psychiatric Nurse',
  };
  return roleMap[role];
}

function formatType(type: Session['type']): string {
  return type === 'individual' ? 'Individual Session' : 'Group Session';
}

function formatStatus(status: Session['status']): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function SessionCard({
  title,
  dateTime,
  timezone,
  professional,
  type,
  status,
  meetLink,
}: Session) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-[0_1px_2px_0_rgba(0,0,0,0.05)]">
      <h4 className="text-lg font-semibold text-gray-900 mb-2">{title}</h4>
      <p className="text-sm text-gray-600 mb-3">{formatSessionDate(dateTime, timezone)}</p>
      <div className="flex items-center gap-3 mb-3">
        {professional.avatar ? (
          <img
            src={professional.avatar}
            alt={professional.name}
            className="w-10 h-10 rounded-full"
          />
        ) : (
          <div className="w-10 h-10 bg-purple-200 rounded-full flex items-center justify-center">
            <span className="text-purple-600 font-semibold text-sm">
              {professional.name.split(" ").map((n) => n[0]).join("")}
            </span>
          </div>
        )}
        <div>
          <span className="text-gray-700 block">{professional.name}</span>
          <span className="text-xs text-gray-500">{formatRole(professional.role)}</span>
        </div>
      </div>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-medium text-gray-600">
          {formatType(type)}
        </span>
        <span className="text-xs font-medium text-gray-600">
          {formatStatus(status)}
        </span>
      </div>
      {meetLink && (
        <a
          href={meetLink}
          target="_blank"
          rel="noopener noreferrer"
          className="block mb-2 text-purple-600 font-medium hover:text-purple-700 text-sm"
        >
          Join meeting →
        </a>
      )}
      <button className="text-purple-600 font-medium hover:text-purple-700 text-sm">
        Open details
      </button>
    </div>
  );
}

