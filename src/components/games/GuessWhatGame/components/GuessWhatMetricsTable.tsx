// src/components/MetricsTable.tsx
import React from "react";
import { calculateAverages } from "../../../../utils/game/guessWhatUtils";

export interface IGuessWhatMetric {
  level: number;
  attempt: number;
  accuracy: number;
  levelErrors: number;
  totalResponseTime: number;
  levelScore: number;
}

interface MetricsTableProps {
  metrics: IGuessWhatMetric[];
  mmseScore: number;
  totalScore: number;
}

export const GuessWhatMetricsTable: React.FC<MetricsTableProps> = ({
  metrics,
  totalScore,
  mmseScore,
}) => {
  if (!metrics || metrics.length === 0)
    return <p className="text-center text-gray-500">No metrics available.</p>;

  const averages = calculateAverages(metrics);

  return (
    <div className="mt-10 w-full">
      {/* Header Stats Section */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-green-50 p-4 rounded-lg shadow-sm mb-6">
        <p className="text-xl font-bold text-gray-700">Session Stats</p>
        <div className="flex flex-col sm:flex-row gap-2 items-center">
          <p className="text-lg font-semibold text-gray-600">
            Predicted MMSE Score:
          </p>
          <p className="text-3xl text-green-600 font-bold">
            {mmseScore.toFixed()}
            <span className="text-lg text-green-800"> / 30</span>
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg shadow">
        <table className="w-full border border-gray-200 text-sm text-gray-700">
          <thead>
            <tr className="bg-green-200 text-gray-800 text-sm sm:text-base">
              <th className="p-3 text-left">Level</th>
              <th className="p-3 text-left">Attempts</th>
              <th className="p-3 text-left">Response Time (s)</th>
              <th className="p-3 text-left">Accuracy (%)</th>
              <th className="p-3 text-left">Errors</th>
              <th className="p-3 text-left">Score</th>
            </tr>
          </thead>
          <tbody>
            {metrics.map((metric, index) => (
              <tr
                key={index}
                className={`${
                  index % 2 === 0 ? "bg-white" : "bg-gray-50"
                } hover:bg-green-50 transition-colors`}
              >
                <td className="p-3">{metric.level}</td>
                <td className="p-3">{metric.attempt}</td>
                <td className="p-3">{metric.totalResponseTime.toFixed(2)}</td>
                <td className="p-3">{metric.accuracy.toFixed(1)}%</td>
                <td className="p-3">{metric.levelErrors}</td>
                <td className="p-3 font-semibold text-gray-800">
                  {metric.levelScore}
                </td>
              </tr>
            ))}

            {/* Summary Row */}
            <tr className="bg-green-100 font-semibold text-gray-800">
              <td className="p-3">Levels: {metrics.length}</td>
              <td className="p-3">
                Avg Attempts: {averages.avgAttemps.toFixed()}
              </td>
              <td className="p-3">
                Avg Response Time: {averages.avgResponseTime.toFixed(2)}
              </td>
              <td className="p-3">
                Avg Accuracy: {averages.avgAccuracy.toFixed(1)}%
              </td>
              <td className="p-3">Avg Errors: {averages.avgErrors.toFixed()}</td>
              <td className="p-3">Total: {totalScore}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
