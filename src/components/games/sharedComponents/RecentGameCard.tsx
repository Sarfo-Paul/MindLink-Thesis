import React from "react";
import { type IGame } from "../../../types/game/base";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

interface CardProps {
  game: IGame;
  text: string;
}

export const RecentGameCard: React.FC<CardProps> = ({
  game: { title, gametype, description, coverPhoto },
}) => {
  const navigate = useNavigate();

  const formattedTitle = title.trim().replace(/\s+/g, "-");
  const handlePlayGame = () => {
    navigate(`/lobby/${formattedTitle.toLowerCase()}`);
  };

  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      className="flex flex-col bg-white rounded-md shadow-md hover:shadow-lg overflow-hidden transition-all duration-300 w-full sm:w-full cursor-pointer"
      onClick={handlePlayGame}
    >
      {/* Cover Image */}
      <figure className="w-full h-28 sm:h-20">
        <img
          src={`/images/${coverPhoto}`}
          alt={title}
          className="w-full h-full object-cover"
        />
      </figure>

      {/* Game Info */}
      <div className="flex flex-col flex-grow p-2">
        <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wide text-center">
          {gametype}
        </p>
        <h2 className="text-xs sm:text-sm font-semibold text-gray-800 text-center mt-1">
          {title}
        </h2>
        <p className="text-[11px] sm:text-xs text-gray-600 line-clamp-2 text-center mt-1">
          {description}
        </p>
      </div>
    </motion.div>
  );
};
