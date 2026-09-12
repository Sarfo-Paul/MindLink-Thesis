import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MemoryMatchGame } from "../components/dashboard/MemoryMatchGame";

const games = [
  {
    key: "memory",
    title: "Memory Match",
    description: "Flip cards to find matching pairs. Tests short-term memory and recall speed.",
    category: "Memory",
    difficulty: "Medium",
    icon: (
      <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
    available: true,
  },
  {
    key: "reaction",
    title: "Reaction Time",
    description: "Tap as fast as possible when the target appears. Measures processing speed.",
    category: "Attention",
    difficulty: "Easy",
    icon: (
      <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    available: false,
  },
  {
    key: "pattern",
    title: "Pattern Recall",
    description: "Remember and reproduce a growing sequence of patterns. Assesses working memory.",
    category: "Memory",
    difficulty: "Hard",
    icon: (
      <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
      </svg>
    ),
    available: false,
  },
  {
    key: "stroop",
    title: "Stroop Test",
    description: "Name the colour, not the word. Measures cognitive flexibility and inhibition.",
    category: "Executive Function",
    difficulty: "Medium",
    icon: (
      <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
      </svg>
    ),
    available: false,
  },
];

const difficultyColor: Record<string, string> = {
  Easy: "bg-green-100 text-green-700",
  Medium: "bg-yellow-100 text-yellow-700",
  Hard: "bg-red-100 text-red-700",
};

export function CognitiveGames() {
  const [activeGame, setActiveGame] = useState<string | null>(null);

  return (
    <>
      <div className="space-y-6 pb-10">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">Cognitive Games</h1>
          <p className="text-gray-500 text-sm">Short exercises that passively track your cognitive baseline over time.</p>
        </div>

        {/* Info banner */}
        <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 flex gap-3 items-start">
          <svg className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-purple-700">
            Game performance is recorded alongside your check-ins. <strong>Consistent decline in score</strong> over time is used as a passive signal in your wellbeing assessment.
          </p>
        </div>

        {/* Game grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
          {games.map((game, i) => (
            <motion.div
              key={game.key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className={`bg-white rounded-xl border p-6 flex flex-col gap-4 ${game.available ? "border-gray-100 shadow-sm" : "border-gray-100 opacity-70"}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="w-14 h-14 bg-purple-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  {game.icon}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${difficultyColor[game.difficulty]}`}>
                    {game.difficulty}
                  </span>
                  <span className="text-xs text-gray-400 bg-gray-50 px-2.5 py-1 rounded-full">{game.category}</span>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 text-lg mb-1">{game.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{game.description}</p>
              </div>

              <button
                onClick={() => game.available && setActiveGame(game.key)}
                disabled={!game.available}
                className={`mt-auto w-full py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                  game.available
                    ? "bg-purple-600 text-white hover:bg-purple-700"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
              >
                {game.available ? "Play Now" : "Coming Soon"}
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Memory match modal */}
      <AnimatePresence>
        {activeGame === "memory" && <MemoryMatchGame onClose={() => setActiveGame(null)} />}
      </AnimatePresence>
    </>
  );
}
