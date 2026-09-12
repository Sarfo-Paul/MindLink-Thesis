import type { Professional } from "../../types";

interface ProfessionalCardProps {
  professional: Professional;
  onSchedule: (professional: Professional) => void;
}

function formatRole(role: Professional['role']): string {
  const roleMap = {
    counselor: 'Counselor',
    volunteer: 'Volunteer Listener',
    nurse: 'Psychiatric Nurse',
  };
  return roleMap[role];
}

function getRoleColor(role: Professional['role']): string {
  const colorMap = {
    counselor: 'bg-purple-100 text-purple-700',
    volunteer: 'bg-green-100 text-green-700',
    nurse: 'bg-blue-100 text-blue-700',
  };
  return colorMap[role];
}

export function ProfessionalCard({ professional, onSchedule }: ProfessionalCardProps) {
  return (
    <div className="bg-white rounded-lg p-3 sm:p-5 border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all duration-200">
      <div className="flex items-start gap-3 sm:gap-4">
        {/* Avatar */}
        {professional.avatar ? (
          <img
            src={professional.avatar}
            alt={professional.name}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white font-semibold text-xs sm:text-sm">
              {professional.name.split(" ").map((n) => n[0]).join("")}
            </span>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4 mb-2">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1">
                <h3 className="text-sm sm:text-base font-semibold text-gray-900">{professional.name}</h3>
                <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium ${getRoleColor(professional.role)}`}>
                  {formatRole(professional.role)}
                </span>
              </div>
              {professional.rating && (
                <div className="flex items-center gap-1.5">
                  <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                  <span className="text-xs sm:text-sm font-medium text-gray-900">
                    {professional.rating.toFixed(1)}
                  </span>
                  {professional.reviewCount && (
                    <span className="text-xs sm:text-sm text-gray-500">
                      ({professional.reviewCount})
                    </span>
                  )}
                </div>
              )}
            </div>
            <button
              onClick={() => onSchedule(professional)}
              className="px-3 sm:px-4 py-1.5 sm:py-2 bg-purple-600 text-white rounded-lg text-xs sm:text-sm font-medium hover:bg-purple-700 transition-colors flex-shrink-0 w-full sm:w-auto"
            >
              Schedule
            </button>
          </div>

          {/* Bio */}
          {professional.bio && (
            <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3 line-clamp-2">{professional.bio}</p>
          )}

          {/* Specialties and Languages */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[10px] sm:text-xs">
            {professional.specialties && professional.specialties.length > 0 && (
              <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
                {professional.specialties.slice(0, 3).map((specialty, index) => (
                  <span
                    key={index}
                    className="px-1.5 sm:px-2 py-0.5 bg-gray-50 text-gray-700 rounded"
                  >
                    {specialty}
                  </span>
                ))}
              </div>
            )}
            {professional.languages && professional.languages.length > 0 && (
              <div className="flex items-center gap-1 text-gray-500">
                <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                </svg>
                <span>{professional.languages.join(", ")}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
