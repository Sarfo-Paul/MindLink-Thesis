import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { type RootState } from "../../../../redux/store";
import { pauseGame, resumeGuessWhatGame } from "../../../../redux/slices/games-slice/guessWhat";
import { FaPause, FaPlay } from "react-icons/fa";
import LevelTimer from "./LevelTimer";

interface GameHUDProps {
  gameTitle: string;
  score: number;
}

export const GameHUD: React.FC<GameHUDProps> = ({ gameTitle, score }) => {
  const dispatch = useDispatch();
  const { isPaused, gameState } = useSelector((state: RootState) => state.guessWhat);

  const state = useSelector((state: RootState) => {
    switch (gameTitle) {
      case "guess-what":
        return state.guessWhat;
      default:
        return null;
    }
  });

  if (!state?.config || !gameState) return null;

  const togglePause = () => {
    dispatch(isPaused ? resumeGuessWhatGame() : pauseGame());
  };

  const totalHearts = gameState.maxAttempts ?? 3;
  const redHearts = "❤️".repeat(totalHearts - gameState.attempts);
  const whiteHearts = "🤍".repeat(gameState.attempts);

  return (
    <div className="w-full px-4 py-3 rounded-t-md bg-black/50 backdrop-blur-sm shadow-md text-[#EADEB8] flex justify-between items-center z-50">
      {/* Info */}
      <div className="flex items-center space-x-4 text-xs sm:text-sm sm:font-semibold">
        <span className="flex flex-col items-center sm:flex-row sm:space-x-1">
          <span>⭐</span>
          <span className="hidden sm:inline">Level:</span>
          <span className="font-bold">{gameState.level}</span>
        </span>

        <span className="flex flex-col items-center sm:flex-row sm:space-x-1">
          <span>🛡️</span>
          <span className="hidden sm:inline">Attempts:</span>
          <span className="font-bold">{redHearts + whiteHearts}</span>
        </span>

        <span className="flex flex-col items-center sm:flex-row sm:space-x-1">
          <span>🏆</span>
          <span className="hidden sm:inline">Score:</span>
          <span className="font-bold">{score}</span>
        </span>
      </div>

      {/* Timer + Pause */}
      <div className="flex items-center space-x-4">
        <LevelTimer
          shouldRun={!isPaused}
          isMemorizationPhase={gameState.isMemorizationPhase}
          onTick={() => {}}
          onReset={() => {}}
        />
        <button
          onClick={togglePause}
          className="p-2 rounded-full bg-[#EADEB8]/10 hover:bg-[#EADEB8]/20 transition duration-200 ease-in-out"
        >
          {isPaused ? <FaPlay size={18} /> : <FaPause size={18} />}
        </button>
      </div>
    </div>
  );
};
