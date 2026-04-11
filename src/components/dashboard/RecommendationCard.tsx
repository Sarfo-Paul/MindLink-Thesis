import type { Recommendation } from "../../types";

function getButtonText(type: Recommendation['type']): string {
  const buttonTextMap = {
    game: "Play Now",
    community: "Join discussion",
    wellness: "Start",
    ai_prompt: "Read More",
  };
  return buttonTextMap[type];
}

export function RecommendationCard({
  title,
  image,
  category,
  description,
  type,
  actionUrl,
}: Recommendation) {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-[0_1px_2px_0_rgba(0,0,0,0.05)]">
      {image && (
        <div className="w-full h-48 bg-gray-200 overflow-hidden">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = "none";
              const parent = target.parentElement;
              if (parent) {
                parent.className += " bg-gradient-to-br from-purple-200 to-blue-200";
              }
            }}
          />
        </div>
      )}
      <div className="p-4">
        <span className="inline-block text-gray-600 text-xs font-medium mb-2">
          {category}
        </span>
        <h4 className="text-lg font-semibold text-gray-900 mb-2">{title}</h4>
        <p className="text-sm text-gray-600 mb-3">{description}</p>
        <a
          href={actionUrl}
          className="text-purple-600 font-medium hover:text-purple-700 text-sm inline-block"
        >
          {getButtonText(type)}
        </a>
      </div>
    </div>
  );
}

