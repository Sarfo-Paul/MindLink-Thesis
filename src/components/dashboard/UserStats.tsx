/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { type User } from "../../redux/slices/auth-slice/authSlice";
import { formatSmartDate } from "../../utils/helpers";
import AverageMmseByGameType from "../games/sharedComponents/AverageMmseByGameType";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Brush,
} from "recharts";

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

interface HomeProps {
  user: User;
  stats: IStats;
}

const UserStats: React.FC<HomeProps> = ({ user, stats }) => {
  const isProfileComplete = user.age && user.educationLevel;

  // Prepare data for MMSE trend chart
  const mmseTrendData = stats.trendData?.map((session) => ({
    date: formatSmartDate(new Date(session.updatedAt)),
    mmse: session.mmseScore,
  }));

  return (
    <div className="p-5 pt-10 flex flex-col">
      {!isProfileComplete && (
        <div className="bg-yellow-100 text-yellow-800 p-3 rounded-lg mb-10 border border-yellow-300">
          <p className="flex flex-col text-md p-3 font-medium">
            ⚠️ Your profile is incomplete. Please complete your profile to improve the accuracy of your MMSE scores.
            <a
              href="/dashboard/settings"
              className="underline text-yellow-900 hover:text-yellow-700"
            >
              Click here to complete it.
            </a>
          </p>
        </div>
      )}

      {/* Welcome */}
      <div className="mb-6">
        <h1 className="text-3xl text-green-800 font-bold">Stats</h1>
        <p className="text-gray-500 mt-2">Here's a quick overview of your progress.</p>
      </div>

      {/* Main grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 columns */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Row 1: Stat cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-base-100 p-6 rounded-lg shadow-md">
              <h2 className="text-sm text-gray-500 font-semibold mb-2">Total Sessions</h2>
              <p className="text-4xl font-bold">{stats.totalSessions || 0}</p>
            </div>
            <div className="bg-base-100 p-6 rounded-lg shadow-md">
              <h2 className="text-sm text-gray-500 font-semibold mb-2">Best MMSE Score</h2>
              <p className="text-4xl font-bold">{stats.bestMMSEScore.toFixed(0) || 0}</p>
            </div>
          </div>

          {/* Row 2: MMSE trend chart */}
          <div className="bg-base-100 p-5 rounded-md shadow-md">
            <h2 className="text-lg text-gray-500 font-bold mb-4">MMSE Score Trend</h2>
            {mmseTrendData && mmseTrendData.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={mmseTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis domain={[15, 30]} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="mmse"
                    stroke="#16a34a"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                  <Brush dataKey="date" height={20} stroke="#16a34a" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500">No MMSE data available.</p>
            )}
          </div>
        </div>

        {/* Right column: Average MMSE by game type spanning rows */}
        <AverageMmseByGameType gameSessions={stats.trendData} />

      </div>
    </div>
  );
};

export default UserStats;
