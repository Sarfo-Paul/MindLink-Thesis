import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { type RootState } from "../../redux/store";
import axios from "axios";
import { apiUrl } from "../../config/api";

import { MoodCheckIn } from "./MoodCheckIn";
import { MoodTrendChart } from "./MoodTrendChart";
import { WellbeingStatus } from "./WellbeingStatus";
import { StreakTracker } from "./StreakTracker";
import { CognitiveGames } from "./CognitiveGames";
import { ChatbotWidget } from "./ChatbotWidget";
import { SupportRequest } from "./SupportRequest";

export function Home() {
  const { user } = useSelector((state: RootState) => state.auth!);
  const [weeklySummary, setWeeklySummary] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const id = user?.userId;
        if (!id) { setWeeklySummary("Ready for a new baseline."); return; }
        const res = await axios.get(apiUrl(`/api/history/${id}`));
        const count = res.data.history?.length || 0;
        if (count === 0) setWeeklySummary("No check-ins yet — start your baseline today.");
        else if (count === 1) setWeeklySummary("1 check-in recorded. Keep going to build your baseline.");
        else setWeeklySummary(`${count} check-ins recorded. Your pattern is building.`);
      } catch {
        setWeeklySummary("Ready for a new baseline.");
      }
    })();
  }, [user]);

  return (
    <div className="space-y-6 pb-10">
      {/*
        Layout (desktop):
        ┌─────────────────────────────┬──────────────────────────┐
        │ Daily Check-in              │ Wellbeing Status         │
        │ Mood Trend Chart            │ Streak Tracker           │
        └─────────────────────────────┴──────────────────────────┘
        ┌──────────────────────────┬───────────────────────────────┐
        │ Cognitive Games          │                               │
        │ Support Request          │   Chatbot                     │
        └──────────────────────────┴───────────────────────────────┘
      */}

      {/* Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Check-in → Trend (same width column) */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          <MoodCheckIn userName={user?.username || "User"} weeklySummary={weeklySummary} />
          <MoodTrendChart />
        </div>

        {/* Right: Wellbeing → Streaks (same width column) */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          <WellbeingStatus />
          <StreakTracker />
        </div>
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Games + Support stacked */}
        <div className="lg:col-span-4 flex flex-col gap-5">
          <CognitiveGames />
          <SupportRequest />
        </div>

        {/* Right: Chatbot — tall */}
        <div className="lg:col-span-8">
          <ChatbotWidget />
        </div>
      </div>
    </div>
  );
}
