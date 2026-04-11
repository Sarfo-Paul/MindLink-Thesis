import type { User } from "../../redux/slices/auth-slice/authSlice";

export interface BaseGameConfig {
  id: string,
  type: "memory" | "reaction" | "visual" | "executive function";
  title: string;
}

export interface IGame {
  title: string;
  gametype: string;
  coverPhoto: string;
  description: string;
  stars?: number;
}

export interface IGames {
  games: IGame[];
  user?: User;
}

export interface IGameSession {
  _id: string;
  userId: string;
  ssid: string;
  metrics?: [];
  sessionDate: string;
  gameTitle: string;
  initConfig: any;
  totalScore: number;
  mmseScore: number;
  updatedAt: Date;
}

export interface IStats {
  totalSessions: number;
  avgMMSEScore: number;
  bestMMSEScore: number;
  recentSessions: IGameSession[];
  trendData: IGameSession[];
}