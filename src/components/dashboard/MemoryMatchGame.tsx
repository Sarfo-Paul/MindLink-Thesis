import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { useSelector } from "react-redux";
import { type RootState } from "../../redux/store";
import { apiUrl } from "../../config/api";

const emojis = ["🌿", "🌙", "🌊", "⛰️", "🌸", "🍂"];
const generateCards = () => {
  const paired = [...emojis, ...emojis];
  return paired
    .sort(() => Math.random() - 0.5)
    .map((emoji, index) => ({
      id: index,
      emoji,
      isFlipped: false,
      isMatched: false,
    }));
};

export function MemoryMatchGame({ onClose }: { onClose: () => void }) {
  const { user } = useSelector((state: RootState) => state.auth!);
  const [cards, setCards] = useState(generateCards);
  const [flippedIds, setFlippedIds] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [startTime] = useState(Date.now());
  const [isWon, setIsWon] = useState(false);

  useEffect(() => {
    if (flippedIds.length === 2) {
      setMoves((m) => m + 1);
      const [first, second] = flippedIds;
      if (cards[first].emoji === cards[second].emoji) {
        setCards((prev) =>
          prev.map((c) =>
            c.id === first || c.id === second ? { ...c, isMatched: true } : c,
          ),
        );
        setFlippedIds([]);
      } else {
        setMistakes((m) => m + 1);
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              c.id === first || c.id === second
                ? { ...c, isFlipped: false }
                : c,
            ),
          );
          setFlippedIds([]);
        }, 900);
      }
    }
  }, [flippedIds, cards]);

  useEffect(() => {
    if (cards.every((c) => c.isMatched) && cards.length > 0) {
      setIsWon(true);
      const timeTaken = Math.round((Date.now() - startTime) / 1000);
      axios
        .post(apiUrl("/api/games"), {
          userId: user?.userId,
          gameType: "Memory Match",
          score: Math.max(0, Math.round(100 - mistakes * 5 - timeTaken / 2)),
          accuracy: Math.round(
            (moves > 0 ? (moves - mistakes) / moves : 0) * 100,
          ),
          duration: timeTaken,
          mistakes,
        })
        .catch(() => {});
    }
  }, [cards, startTime, moves, mistakes, user]);

  const handleCardClick = (id: number) => {
    if (flippedIds.length < 2 && !cards[id].isFlipped && !cards[id].isMatched) {
      setCards((prev) =>
        prev.map((c) => (c.id === id ? { ...c, isFlipped: true } : c)),
      );
      setFlippedIds((prev) => [...prev, id]);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative bg-white rounded-2xl p-8 shadow-2xl max-w-lg w-full"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Memory Challenge
        </h2>
        {isWon ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-3">🎉</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              Complete!
            </h3>
            <p className="text-gray-500 text-sm mb-6">
              {moves} moves · {mistakes} errors
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-purple-600 text-white rounded-full font-medium hover:bg-purple-700 transition-colors text-sm"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="flex justify-between text-xs text-gray-400 mb-4">
              <span>Moves: {moves}</span>
              <span>Errors: {mistakes}</span>
            </div>
            <div className="grid grid-cols-4 gap-2.5">
              {cards.map((card) => (
                <button
                  key={card.id}
                  onClick={() => handleCardClick(card.id)}
                  className={`aspect-square rounded-xl flex items-center justify-center text-2xl transition-all duration-200 ${
                    card.isFlipped || card.isMatched
                      ? "bg-purple-50 border-2 border-purple-200"
                      : "bg-purple-600 hover:bg-purple-700"
                  }`}
                >
                  {card.isFlipped || card.isMatched ? card.emoji : ""}
                </button>
              ))}
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
