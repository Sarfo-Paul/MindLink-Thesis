export interface StreakData {
  dailyCheckIn: number;
  cognitiveGame: number;
  support: number;
  lastUpdated?: Date;
  protectionActive?: boolean;
}

export interface Session {
  id: string;
  title: string;
  type: 'individual' | 'group';
  professional: {
    id: string;
    name: string;
    role: 'counselor' | 'volunteer' | 'nurse';
    avatar?: string;
  };
  dateTime: Date;
  timezone: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  meetLink?: string;
}

export interface Recommendation {
  id: string;
  type: 'game' | 'community' | 'wellness' | 'ai_prompt';
  title: string;
  description: string;
  image?: string;
  category: string;
  actionUrl: string;
}

export interface CommunityPost {
  id: string;
  author: string;
  title: string;
  comments: number;
  timeAgo: string;
}

export type MoodType = "happy" | "stressed" | "lonely" | "anxious" | "tired";

export interface MoodEntry {
  date: string;
  mood: MoodType;
  timestamp: string;
}

export interface Professional {
  id: string;
  name: string;
  role: 'counselor' | 'volunteer' | 'nurse';
  avatar?: string;
  bio?: string;
  specialties?: string[];
  languages?: string[];
  availableSlots?: TimeSlot[];
  rating?: number;
  reviewCount?: number;
}

export interface TimeSlot {
  date: string; // ISO date string
  time: string; // HH:mm format
  available: boolean;
}
