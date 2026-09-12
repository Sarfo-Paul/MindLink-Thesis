import React, { useEffect, useRef } from 'react';
import {
  FiPlay,
  // FiRotateCcw,
} from 'react-icons/fi';
import { MdOutlineExitToApp } from "react-icons/md";

interface PauseScreenProps {
  onResume: () => void;
  onRestart: () => void;
  onExit: () => void;
}

const PauseScreen: React.FC<PauseScreenProps> = ({
  onResume,
  // onRestart,
  onExit
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle click outside the modal
  const handleClickOutside = React.useCallback((e: MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onResume();
    }
  }, [onResume]);

  // Handle Escape key
  const handleKeyDown = React.useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onResume();
    }
  }, [onResume]);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleClickOutside, handleKeyDown]);

  return (
    <div className="absolute inset-0 z-50 bg-black/40 backdrop-blur-2xl flex flex-col items-center justify-center text-white">
      <div
        ref={modalRef}
        className="text-gray-800 w-[90%] max-w-md p-6 text-center space-y-5 animate-fadeIn"
      >
        <h2 className="text-3xl text-[#EADEB8] font-extrabold ">Game Paused</h2>

        <div className="flex flex-col gap-4">
          <button
            onClick={onResume}
            className="grid grid-cols-[auto_1fr] items-center gap-1 bg-black/70 hover:bg-black/40 text-[#EADEB8] px-32 py-5 transition-transform duration-200 hover:scale-105 font-bold text-2xl"
          >
            <FiPlay size={35} />
            <span>Resume</span>
          </button>

          {/* <button
            onClick={onRestart}
            className="grid grid-cols-[auto_1fr] items-center gap-1 bg-black/70 hover:bg-black/40 text-[#EADEB8] px-32 py-5 transition-transform duration-200 hover:scale-105 font-bold text-2xl"
          >
            <FiRotateCcw size={35} />
            <span>Restart</span>
          </button> */}

          <button
            onClick={onExit}
            className="grid grid-cols-[auto_1fr] items-center gap-0 bg-black/70 hover:bg-black/40 text-[#EADEB8] px-32 py-5 transition-transform duration-200 hover:scale-105 font-bold text-2xl"
          >
            <MdOutlineExitToApp size={35} />
            <span>Exit</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PauseScreen;
