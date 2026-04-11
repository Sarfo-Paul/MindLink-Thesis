import { useState, useMemo, useEffect } from "react";
import axios from "axios";
import { apiUrl } from "../config/api";
import { ProfessionalCard } from "../components/support/ProfessionalCard";
import { SchedulingModal } from "../components/support/SchedulingModal";
import { useNotification } from "../components/shared/NotificationProvider";
import type { Professional, Session } from "../types";

// Mock data - in production, this would come from an API
const mockProfessionals: Professional[] = [
  {
    id: "1",
    name: "Dr. Mette Andersen",
    role: "counselor",
    bio: "Licensed counselor with 10+ years of experience in anxiety and depression management. Specializes in cognitive behavioral therapy.",
    specialties: ["Anxiety", "Depression", "CBT"],
    languages: ["English", "Danish"],
    rating: 4.8,
    reviewCount: 127,
  },
  {
    id: "2",
    name: "Sarah Johnson",
    role: "volunteer",
    bio: "Compassionate volunteer listener with training in active listening and emotional support. Available for those who need someone to talk to.",
    specialties: ["Active Listening", "Emotional Support"],
    languages: ["English", "Spanish"],
    rating: 4.9,
    reviewCount: 89,
  },
  {
    id: "3",
    name: "Dr. James Wilson",
    role: "counselor",
    bio: "Experienced counselor specializing in trauma recovery and PTSD treatment. Uses evidence-based therapeutic approaches.",
    specialties: ["Trauma", "PTSD", "EMDR"],
    languages: ["English"],
    rating: 4.7,
    reviewCount: 156,
  },
  {
    id: "4",
    name: "Maria Garcia",
    role: "volunteer",
    bio: "Dedicated volunteer listener providing support for stress management and daily life challenges. Warm and understanding approach.",
    specialties: ["Stress Management", "Life Coaching"],
    languages: ["English", "Spanish", "Portuguese"],
    rating: 4.8,
    reviewCount: 94,
  },
  {
    id: "5",
    name: "Dr. Emily Chen",
    role: "nurse",
    bio: "Psychiatric nurse with expertise in medication management and mental health assessment. Available for consultations and support.",
    specialties: ["Medication Management", "Mental Health Assessment"],
    languages: ["English", "Mandarin"],
    rating: 4.6,
    reviewCount: 73,
  },
  {
    id: "6",
    name: "Michael Thompson",
    role: "volunteer",
    bio: "Trained volunteer listener focusing on supporting individuals through difficult times. Empathetic and non-judgmental approach.",
    specialties: ["Crisis Support", "Peer Support"],
    languages: ["English"],
    rating: 4.9,
    reviewCount: 112,
  },
  {
    id: "7",
    name: "Dr. Lisa Park",
    role: "counselor",
    bio: "Licensed therapist specializing in relationship counseling and family therapy. Helps individuals and couples navigate challenges.",
    specialties: ["Relationships", "Family Therapy", "Couples Counseling"],
    languages: ["English", "Korean"],
    rating: 4.8,
    reviewCount: 201,
  },
  {
    id: "8",
    name: "Dr. Robert Martinez",
    role: "nurse",
    bio: "Psychiatric nurse practitioner with focus on holistic mental health care. Combines medical knowledge with compassionate support.",
    specialties: ["Holistic Care", "Wellness Planning"],
    languages: ["English", "Spanish"],
    rating: 4.7,
    reviewCount: 65,
  },
];

export function Psychologists() {
  const { success } = useNotification();
  const [selectedRole, setSelectedRole] = useState<
    Professional["role"] | "all"
  >("all");
  const [selectedProfessional, setSelectedProfessional] =
    useState<Professional | null>(null);
  const [isSchedulingModalOpen, setIsSchedulingModalOpen] = useState(false);
  const [dbProfessionals, setDbProfessionals] = useState<Professional[]>([]);

  useEffect(() => {
    axios
      .get(apiUrl("/api/professionals"))
      .then((res) => {
        const fetched: Professional[] = (res.data.professionals || []).map(
          (p: any) => ({
            ...p,
            // Avoid duplicating mock entries by checking name overlap
          }),
        );
        setDbProfessionals(fetched);
      })
      .catch(() => {
        /* server offline — fall back to mock only */
      });
  }, []);

  // Merge: DB professionals come first (real, verified), mock fills out the grid
  const allProfessionals = useMemo(() => {
    const dbIds = new Set(dbProfessionals.map((p) => p.id));
    const uniqueMock = mockProfessionals.filter((p) => !dbIds.has(p.id));
    return [...dbProfessionals, ...uniqueMock];
  }, [dbProfessionals]);

  // Filter professionals based on role
  const filteredProfessionals = useMemo(() => {
    return allProfessionals.filter((prof) => {
      const matchesRole = selectedRole === "all" || prof.role === selectedRole;
      return matchesRole;
    });
  }, [selectedRole]);

  const handleSchedule = (professional: Professional) => {
    setSelectedProfessional(professional);
    setIsSchedulingModalOpen(true);
  };

  const handleConfirmSchedule = (
    professional: Professional,
    dateTime: Date,
    meetLink: string,
  ) => {
    // Create session object
    const newSession: Session = {
      id: Date.now().toString(),
      title: `Session with ${professional.name}`,
      type: "individual",
      professional: {
        id: professional.id,
        name: professional.name,
        role: professional.role,
        avatar: professional.avatar,
      },
      dateTime: dateTime,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      status: "confirmed",
      meetLink: meetLink,
    };

    // Save to localStorage
    const existingSessions = JSON.parse(
      localStorage.getItem("sessions") || "[]",
    );
    existingSessions.push(newSession);
    localStorage.setItem("sessions", JSON.stringify(existingSessions));
    setIsSchedulingModalOpen(false);
    success(
      "Session Scheduled",
      `${professional.name} · ${dateTime.toLocaleString()} · Meet link sent to your email.`,
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Support Network
        </h1>
        <p className="text-gray-600">
          Connect with experienced professionals ready to support your mental
          wellbeing journey.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="flex gap-2 flex-wrap">
        {(["all", "counselor", "volunteer", "nurse"] as const).map((role) => (
          <button
            key={role}
            onClick={() => setSelectedRole(role)}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              selectedRole === role
                ? "bg-purple-600 text-white shadow-sm"
                : "bg-white text-gray-700 border border-gray-200 hover:border-gray-300 hover:bg-gray-50"
            }`}
          >
            {role === "all"
              ? "All"
              : role === "counselor"
                ? "Counselors"
                : role === "volunteer"
                  ? "Volunteers"
                  : "Nurses"}
          </button>
        ))}
      </div>

      {/* Results Count */}
      {filteredProfessionals.length > 0 && (
        <div className="flex items-center gap-3">
          <p className="text-sm text-gray-500">
            {filteredProfessionals.length}{" "}
            {filteredProfessionals.length === 1
              ? "professional"
              : "professionals"}{" "}
            available
          </p>
          {dbProfessionals.length > 0 && (
            <span className="inline-flex items-center gap-1 text-xs bg-green-50 text-green-700 border border-green-100 rounded-full px-2 py-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
              {dbProfessionals.length} verified from network
            </span>
          )}
        </div>
      )}

      {/* Professionals List */}
      {filteredProfessionals.length > 0 ? (
        <div className="max-w-4xl space-y-3">
          {filteredProfessionals.map((professional) => (
            <ProfessionalCard
              key={professional.id}
              professional={professional}
              onSchedule={handleSchedule}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-7 h-7 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No professionals found
          </h3>
          <p className="text-sm text-gray-500">
            Try adjusting your search or filters
          </p>
        </div>
      )}

      {/* Scheduling Modal */}
      <SchedulingModal
        isOpen={isSchedulingModalOpen}
        onClose={() => {
          setIsSchedulingModalOpen(false);
          setSelectedProfessional(null);
        }}
        professional={selectedProfessional}
        onConfirm={handleConfirmSchedule}
      />
    </div>
  );
}
