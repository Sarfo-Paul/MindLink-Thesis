import { RecommendationCard } from "./RecommendationCard";
import type { Recommendation } from "../../types";

interface RecommendationsProps {
  recommendations: Recommendation[];
}

export function Recommendations({ recommendations }: RecommendationsProps) {
  return (
    <section>
      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">Recommendation for You</h3>
      <div className="overflow-x-auto scrollbar-hide -mx-4 sm:-mx-6 px-4 sm:px-6">
        <div className="flex gap-4 pb-2">
          {recommendations.map((rec) => (
            <div key={rec.id} className="flex-shrink-0 w-72 sm:w-80">
              <RecommendationCard {...rec} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

