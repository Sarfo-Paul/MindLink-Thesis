import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import type { AppDispatch, RootState } from "../../../../redux/store";
import {
    resumeGuessWhatGame,
    restartGame,
    nextLevel,
    forceEndGuessWhatGame
} from "../../../../redux/slices/games-slice/guessWhat";
import { PopUp } from "../../sharedComponents/PopUp";
import { GameHUD } from "../components/GameHUD";
import Screen1 from "./Screen1";
import Screen2 from "./Screen2";
import PauseScreen from "./PauseScreen";
import { useNavigate } from "react-router-dom";

export const MainScreen: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const [showExitConfirm, setShowExitConfirm] = useState(false);
    const { isPaused, gameState, config } = useSelector((state: RootState) => state.guessWhat);
    const score = useSelector((state: RootState) => state.guessWhat.totalScore);

    const handleResume = () => {
        dispatch(resumeGuessWhatGame());
    };

    const handleRestart = () => {
        dispatch(restartGame());
    };

    const handleQuitGame = () => {
        setShowExitConfirm(true)
    }

    const confirmQuit = () => {
        dispatch(forceEndGuessWhatGame())
        navigate("/games")
    }

    useEffect(() => {
        if (!gameState) return;

        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            e.preventDefault();
            e.returnValue = "";
        };

        window.addEventListener("beforeunload", handleBeforeUnload);

        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, [gameState]);


    // Timer and Game State Management
    useEffect(() => {
        if (!gameState) return;

        if (gameState.currentImagesToFind.length === 0 || gameState.attempts >= gameState.maxAttempts) {
            setTimeout(() => {
                dispatch(nextLevel());
            }, 1000);
        }
    }, [gameState, dispatch]);

    if (!gameState) return <p>Loading...</p>;

    return (
        <div className="flex flex-col rounded-md text-[#EADEB8] bg-[#9c6144cc] w-full h-full relative">

            {/* Pause screen overlay */}
            {isPaused && (
                <PauseScreen
                    onResume={handleResume}
                    onRestart={handleRestart}
                    onExit={handleQuitGame} // <- now triggers modal
                />
            )}

            {/* HUD */}
            <div>
                <GameHUD gameTitle={config!.title} score={score} />
            </div>

            {/* Main game area with animation */}
            <div className="relative max-w-full h-[46rem] overflow-hidden flex justify-center items-center">
                <AnimatePresence mode="wait">
                    {gameState.isMemorizationPhase ? (
                        <motion.div
                            key="screen1"
                            initial={{ opacity: 0, x: -100 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 100 }}
                            transition={{ duration: 0.5 }}
                            className="absolute w-full h-full"
                        >
                            <Screen1 imagesToMemorize={gameState.cards} />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="screen2"
                            initial={{ opacity: 0, x: 100 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -100 }}
                            transition={{ duration: 0.5 }}
                            className="absolute w-full h-full"
                        >
                            <Screen2
                                currentImagesToFind={gameState.currentImagesToFind}
                                cards={gameState.cards}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Confirmation PopUp goes here */}
            <PopUp
                isOpen={showExitConfirm}
                type="warning"
                title="Are you sure?"
                message="Quitting now will discard your progress."
                onClose={() => setShowExitConfirm(false)}
                onConfirm={confirmQuit}
                confirmText="Yes, Quit"
                cancelText="Cancel"
                showCancel
            />

        </div>
    );
}
