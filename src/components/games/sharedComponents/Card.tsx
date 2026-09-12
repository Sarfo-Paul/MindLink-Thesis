import React from 'react';
import type { IGame } from '../../../types/game/base';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface CardProps {
  game: IGame;
  text: string;
}

const Card: React.FC<CardProps> = ({
  game: { title, gametype, description, coverPhoto }, text
}) => {
  const navigate = useNavigate();

  const formatedTitle = title.trim().replace(/\s+/g, '-');
  const handlePlayGame = () => {
    navigate(`/games/${formatedTitle.toLowerCase()}`);
  };

  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      className="flex flex-col bg-white rounded-md shadow-md hover:shadow-lg overflow-hidden transition-shadow duration-300 h-full"
    >
      <figure className="w-full h-40 sm:h-44">
        <img
          src={`/images/${coverPhoto}`}
          alt={title}
          className="w-full h-[100px] object-cover"
        />
      </figure>

      <div className="flex flex-col flex-grow p-3 text-left">
        <p className="text-xs text-center text-gray-500 font-medium uppercase tracking-wide mb-2">
          {gametype}
        </p>
        <h2 className="text-base text-center sm:text-lg font-semibold text-gray-800 mb-1">
          {title}
        </h2>
        <p className="text-sm text-gray-600 line-clamp-3 flex-grow">
          {description}
        </p>

        <button
          onClick={handlePlayGame}
          className="mt-4 bg-green-500 hover:bg-green-400 text-white font-semibold text-lg py-2 rounded-md h-10 w-full transition-colors"
        >
          {text}
        </button>
      </div>
    </motion.div>
  );
};

export default Card;
