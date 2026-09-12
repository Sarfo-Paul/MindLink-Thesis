// src/components/MetricsTable.tsx
import React from "react";

interface IStroopMetric {
  questions: number;
  attempts: number;
  averageResponseTime: number;
  errors: number;
  accuracy: number;
}

interface StroopMetricsTableProps {
  metrics: IStroopMetric;
  totalScore: number;
  mmseScore: number;
}

export const StroopMetricsTable: React.FC<StroopMetricsTableProps> = ({
  metrics,
  totalScore,
  mmseScore,
}) => {
  if (!metrics)
    return <p className="text-center text-gray-500">No metrics available.</p>;

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
            {isNaN(mmseScore) ? 'N/A' : mmseScore.toFixed()}
            <span className="text-lg text-green-800"> / 30</span>
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg shadow">
        <table className="w-full border border-gray-200 text-sm text-gray-700">
          <thead>
            <tr className="bg-green-200 text-gray-800 text-sm sm:text-base">
              <th className="p-3 text-left">Questions</th>
              <th className="p-3 text-left">Attempts</th>
              <th className="p-3 text-left">Avg Response Time (s)</th>
              <th className="p-3 text-left">Errors</th>
              <th className="p-3 text-left">Accuracy (%)</th>
              <th className="p-3 text-left">Total Score</th>
            </tr>
          </thead>
          <tbody>
            <tr className="bg-white hover:bg-green-50 transition-colors">
              <td className="p-3 font-medium">{metrics.questions || 0}</td>
              <td className="p-3 font-medium">{metrics.attempts || 0}</td>
              <td className="p-3 font-medium">
                {isNaN(metrics.averageResponseTime) ? '0.00' : metrics.averageResponseTime.toFixed(2)}
              </td>
              <td className="p-3 font-medium">{metrics.errors || 0}</td>
              <td className="p-3 font-medium">
                {isNaN(metrics.accuracy) ? '0.0' : metrics.accuracy.toFixed(1)}%
              </td>
              <td className="p-3 font-semibold text-gray-800">{totalScore || 0}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
