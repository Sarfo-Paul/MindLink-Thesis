import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { MemoryMatchGame } from "./MemoryMatchGame";

export function CognitiveGames() {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <>
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900">Cognitive Games</h3>
        </div>
        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
          <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h4 className="font-semibold text-gray-900 mb-1">Memory Challenge</h4>
        <p className="text-sm text-gray-500 mb-4">A short pattern recognition exercise to establish your cognitive baseline.</p>
        <button
          onClick={() => setIsPlaying(true)}
          className="w-fit bg-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-purple-700 transition-colors"
        >
          Play Now
        </button>
      </div>

      <AnimatePresence>
        {isPlaying && <MemoryMatchGame onClose={() => setIsPlaying(false)} />}
      </AnimatePresence>
    </>
  );
}
