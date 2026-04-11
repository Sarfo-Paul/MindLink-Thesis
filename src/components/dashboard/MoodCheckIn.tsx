import { useState } from "react";
import { MoodCheckInModal } from "./MoodCheckInModal";
import type { MoodType } from "../../types";

interface MoodCheckInProps {
  userName: string;
  weeklySummary: string;
}

export function MoodCheckIn({ userName, weeklySummary }: MoodCheckInProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleMoodRecorded = (mood: MoodType) => {
    console.log(`Mood recorded: ${mood}`);
  };

  return (
    <>
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row gap-6 items-center">
          {/* Icon */}
          <div className="hidden md:flex flex-shrink-0 w-24 h-24 bg-purple-100 rounded-full items-center justify-center">
            <span className="text-4xl">🌿</span>
          </div>
          {/* Content */}
          <div className="flex-1 text-center md:text-left">
            <span className="text-xs text-purple-600 font-semibold uppercase tracking-wider">Daily Check-in</span>
            <h3 className="text-xl md:text-2xl font-bold text-gray-900 mt-1 mb-2">
              How are you today, {userName}?
            </h3>
            <p className="text-sm text-gray-500 mb-5 leading-relaxed">
              {weeklySummary} Taking a moment to check in helps us track your wellbeing over time.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 bg-purple-600 text-white rounded-full px-6 py-2.5 text-sm font-semibold hover:bg-purple-700 transition-colors"
            >
              Begin Check-in
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <MoodCheckInModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onMoodRecorded={handleMoodRecorded}
      />
    </>
  );
}
