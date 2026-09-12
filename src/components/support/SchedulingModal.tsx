import { useState, useEffect } from "react";
import type { Professional, TimeSlot } from "../../types";

interface SchedulingModalProps {
  isOpen: boolean;
  onClose: () => void;
  professional: Professional | null;
  onConfirm: (professional: Professional, dateTime: Date, meetLink: string) => void;
}

// Generate available time slots for the next 7 days
const generateTimeSlots = (): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  const today = new Date();
  
  // Available hours: 9 AM to 6 PM
  const availableHours = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18];
  
  for (let day = 0; day < 7; day++) {
    const date = new Date(today);
    date.setDate(today.getDate() + day);
    const dateStr = date.toISOString().split('T')[0];
    
    availableHours.forEach((hour) => {
      slots.push({
        date: dateStr,
        time: `${hour.toString().padStart(2, '0')}:00`,
        available: Math.random() > 0.3, // Simulate availability (70% available)
      });
    });
  }
  
  return slots;
};

// Generate Google Meet link (in production, this would call Google Calendar API)
const generateGoogleMeetLink = (): string => {
  // Generate a random meeting code (in production, use Google Calendar API)
  const chars = 'abcdefghijklmnopqrstuvwxyz';
  const code = Array.from({ length: 3 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  const code2 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  const code3 = Array.from({ length: 3 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `https://meet.google.com/${code}-${code2}-${code3}`;
};

export function SchedulingModal({ isOpen, onClose, professional, onConfirm }: SchedulingModalProps) {
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [timezone, setTimezone] = useState<string>("GMT +2");

  useEffect(() => {
    if (isOpen) {
      const slots = generateTimeSlots();
      setAvailableSlots(slots);
      // Set default timezone (in production, get from user settings)
      const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      setTimezone(userTimezone);
    }
  }, [isOpen]);

  if (!isOpen || !professional) return null;

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setSelectedTime(""); // Reset time when date changes
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  const handleConfirm = () => {
    if (selectedDate && selectedTime) {
      const dateTime = new Date(`${selectedDate}T${selectedTime}:00`);
      
      // Generate Google Meet link
      const meetLink = generateGoogleMeetLink();
      
      onConfirm(professional, dateTime, meetLink);
      handleClose();
    }
  };

  const handleClose = () => {
    setSelectedDate("");
    setSelectedTime("");
    onClose();
  };

  // Get available dates (next 7 days)
  const dates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return {
      dateStr: date.toISOString().split('T')[0],
      display: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
    };
  });

  // Filter slots for selected date
  const timeSlotsForDate = selectedDate
    ? availableSlots.filter((slot) => slot.date === selectedDate && slot.available)
    : [];

  return (
    <div className="fixed inset-0 bg-white/10 backdrop-blur-[2px] flex items-center justify-center z-50 p-3 sm:p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-4 sm:p-6 relative border border-gray-200/50 max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Schedule Session</h2>
          <div className="flex items-center gap-3">
            {professional.avatar ? (
              <img
                src={professional.avatar}
                alt={professional.name}
                className="w-12 h-12 rounded-full"
              />
            ) : (
              <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center">
                <span className="text-purple-600 font-semibold">
                  {professional.name.split(" ").map((n) => n[0]).join("")}
                </span>
              </div>
            )}
            <div>
              <p className="font-semibold text-gray-900">{professional.name}</p>
              <p className="text-sm text-gray-600">
                {professional.role === 'counselor' ? 'Counselor' : 
                 professional.role === 'volunteer' ? 'Volunteer Listener' : 
                 'Psychiatric Nurse'}
              </p>
            </div>
          </div>
        </div>

        {/* Date Selection */}
        <div className="mb-4 sm:mb-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">Select Date</h3>
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {dates.map(({ dateStr, display }) => (
              <button
                key={dateStr}
                onClick={() => handleDateSelect(dateStr)}
                className={`p-2 sm:p-3 rounded-lg border-2 transition-all text-xs sm:text-sm ${
                  selectedDate === dateStr
                    ? "border-purple-600 bg-purple-50 text-purple-700 font-semibold"
                    : "border-gray-200 hover:border-purple-300 text-gray-700"
                }`}
              >
                <div className="text-[10px] sm:text-xs text-gray-500 mb-0.5 sm:mb-1">
                  {display.split(' ')[0]}
                </div>
                <div className="text-xs sm:text-sm">{display.split(' ')[1]}</div>
                <div className="text-[10px] sm:text-xs">{display.split(' ')[2]}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Time Selection */}
        {selectedDate && (
          <div className="mb-4 sm:mb-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">Select Time ({timezone})</h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-1.5 sm:gap-2">
              {timeSlotsForDate.map((slot, index) => {
                const [hours, minutes] = slot.time.split(':').map(Number);
                const displayTime = `${hours % 12 || 12}:${minutes.toString().padStart(2, '0')} ${hours >= 12 ? 'PM' : 'AM'}`;
                
                return (
                  <button
                    key={index}
                    onClick={() => handleTimeSelect(slot.time)}
                    disabled={!slot.available}
                    className={`p-2 rounded-lg border-2 transition-all text-sm ${
                      selectedTime === slot.time
                        ? "border-purple-600 bg-purple-50 text-purple-700 font-semibold"
                        : slot.available
                        ? "border-gray-200 hover:border-purple-300 text-gray-700"
                        : "border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    {displayTime}
                  </button>
                );
              })}
            </div>
            {timeSlotsForDate.length === 0 && (
              <p className="text-gray-500 text-sm">No available slots for this date. Please select another date.</p>
            )}
          </div>
        )}

        {/* Confirmation */}
        {selectedDate && selectedTime && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-purple-900 mb-2">
              <strong>Session Details:</strong>
            </p>
            <p className="text-sm text-purple-700">
              {new Date(`${selectedDate}T${selectedTime}`).toLocaleString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
              })} ({timezone})
            </p>
            <p className="text-xs text-purple-600 mt-2">
              A Google Meet link will be automatically created and sent to you.
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleClose}
            className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedDate || !selectedTime}
            className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Confirm & Schedule
          </button>
        </div>
      </div>
    </div>
  );
}

