/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo } from "react";
import { ProgressBar } from "./Progress";

interface IGameSession {
  initConfig: any;
  mmseScore: number; // 0–30 range
}

interface Props {
  gameSessions: IGameSession[];
}

const AverageMmseByGameType: React.FC<Props> = ({ gameSessions }) => {
  const { curretAverage, averages } = useMemo(() => {
    if (!gameSessions || !gameSessions.length) {
      return { curretAverage: 0, averages: [] };
    }

    // Group by gameType
    const groups: Record<string, { total: number; count: number }> = {};
    let totalMmse = 0;

    for (const session of gameSessions) {
      totalMmse += session.mmseScore;
      if (!groups[session.initConfig?.type]) {
        groups[session.initConfig?.type] = { total: 0, count: 0 };
      }
      groups[session.initConfig?.type].total += session.mmseScore;
      groups[session.initConfig?.type].count += 1;
    }

    const averages = Object.entries(groups)
      .map(([gameType, { total, count }]) => ({
        gameType,
        average: total / count,
      }))
      .sort((a, b) => a.gameType.localeCompare(b.gameType)); // alphabetical

    const curretAverage = totalMmse / gameSessions.length;

    return { curretAverage, averages };
  }, [gameSessions]);

  return (
    <div className="w-full max-w-2xl mx-auto bg-white p-6 rounded-md shadow">
      {/* <h2 className="text-xl text-gray-400 font-semibold mb-4 text-center">
        Score Breakdown
      </h2> */}

      {/* Overall Average */}
      <div className="mb-6">
        <p className="text-gray-500 font-semibold text-sm mb-2">Overall MMSE Score</p>
        <p className="text-4xl font-bold">{curretAverage.toFixed(0)}</p>
      </div>

      {/* Per Game Type */}
      <div className="space-y-4 mt-14">
        {averages.map(({ gameType, average }) => (
          <div key={gameType}>
            <div className="flex justify-between mb-1">
              <span className="font-medium">{gameType}</span>
              <span className="text-gray-500">{average.toFixed(1)}</span>
            </div>
            <ProgressBar value={(average / 30) * 100} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default AverageMmseByGameType;
