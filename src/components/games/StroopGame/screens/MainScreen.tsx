/* eslint-disable @typescript-eslint/no-unused-vars */
// pages/GameScreen.tsx
import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { type RootState } from "../../../../redux/store";
import { QuestionCard } from "../components/QuestionCard";
import PauseScreen from "./PauseScreen";
import { GameHUD } from "../components/GameHUD";

import {
  restartGame,
  recordAnswer,
  advanceLevel,
  forceEndStroopGame,
  endGame,
  resumeStroopGame,
} from "../../../../redux/slices/games-slice/stroop";
import { PopUp } from "../../sharedComponents/PopUp";
import { playSound } from "../../../../utils/sound";

export const MainScreen: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const {
    config,
    gameState,
    totalScore,
    isPaused,
    totalPausedDuration,
    gameEnded,
  } = useSelector((state: RootState) => state.stroop);

  const questions = React.useMemo(() => config?.questions || [], [config?.questions]);
  const currentIndex = gameState?.currentIndex ?? 0;
  const currentQuestion = questions[currentIndex];
  const level = gameState?.level ?? 1;

  const [levelStartTime, setLevelStartTime] = useState(Date.now());

  useEffect(() => {
    if (!gameState) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [gameState]);

  // Set initial or updated question
  useEffect(() => {
    if (questions.length > 0 && currentIndex < questions.length) {
      setLevelStartTime(Date.now());
    }
  }, [questions, currentIndex]);

  const handleAnswer = useCallback(
    (userSelectedAnswer: boolean) => {
      const actualCorrect = currentQuestion?.isCorrect ?? false;
      const isUserCorrect = userSelectedAnswer === actualCorrect;

      const bonus = level % 10 === 0 ? 10 : 0;
      
      // Calculate response time
      const responseTime = Date.now() - levelStartTime;

      if (isUserCorrect) {
        playSound("/sounds/correct1.wav")
      } else {
        playSound("/sounds/wrong3.wav")
      }

      dispatch(recordAnswer({ correct: isUserCorrect, bonus, responseTime }));
      dispatch(advanceLevel());

      const delay = Math.max(300, 1000 - level * 30);
      setTimeout(() => {
        if (currentIndex + 1 < questions.length) {
          setLevelStartTime(Date.now());
        } else {
          dispatch(endGame());
        }
      }, delay);
    },
    [currentQuestion, level, dispatch, currentIndex, questions.length, levelStartTime]
  );

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!currentQuestion || isPaused || gameEnded) return;

      if (e.key === "ArrowLeft") {
        handleAnswer(true); // user chose 'Correct'
      } else if (e.key === "ArrowRight") {
        handleAnswer(false); // user chose 'Wrong'
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [currentQuestion, isPaused, gameEnded, handleAnswer]);


  const handleResume = () => dispatch(resumeStroopGame());
  const handleRestart = () => dispatch(restartGame());
  const handleQuitGame = () => {
    setShowExitConfirm(true)
  }

  const confirmQuit = () => {
    dispatch(forceEndStroopGame())
    navigate("/games")
  }


  return (
    <div className="relative w-full h-full rounded-md text-center">
      {isPaused && (
        <PauseScreen
          onResume={handleResume}
          onRestart={handleRestart}
          onExit={handleQuitGame}
        />
      )}

      {config && (
        <GameHUD
          gameTitle={config.title ?? "stroop"}
          totalScore={totalScore}
          totalPausedDuration={totalPausedDuration ?? 0}
        />
      )}

      <div className="mt-10">
        <div className="text-3xl text-bold text-[#EADEB8]">Does the text match the color?</div>
        {currentQuestion && (
          <QuestionCard question={currentQuestion} onAnswer={handleAnswer} />
        )}
      </div>
      {/* Confirmation PopUp goes here */}
      <PopUp
        isOpen={showExitConfirm}
        type="warning"
        title="Are you sure?"
        message="Quitting now will discard your progress and unsaved changes."
        onClose={() => setShowExitConfirm(false)}
        onConfirm={confirmQuit}
        confirmText="Yes, Quit"
        cancelText="Cancel"
        showCancel
      />
    </div>
  );
};
