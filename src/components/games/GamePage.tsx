/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import API from "../../config/axiosConfig";

import { GameRunner } from "./GameRunner";
import { gameConfigs, type GameKey } from "../../config/gameConfigs";
// import { MobileWarning } from "../MobilViewWarning";

interface ParticipantInfo {
  participantName: string;
  mmseScore: string;
  consent: boolean;
  age: number;
  educationLevel: string;
}

export const GamePage: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const { game } = useParams();
  const participantInfo: ParticipantInfo | any = JSON.parse(
    localStorage.getItem("participantInfo") || "{}",
  );

  const gameKey = game as GameKey;
  const gameConfig = gameKey ? gameConfigs[gameKey] : undefined;

  const selector = gameConfig ? gameConfig.getSlice : () => ({});
  const {
    config,
    isPlaying,
    sessionId,
    gameEnded,
    complete,
    metrics,
    totalScore,
  } = useSelector(selector) as any;

  useEffect(() => {
    setTimeout(() => {
      if (gameStarted === false) {
        setGameStarted(false);
      }
    }, 2000);
  });

  useEffect(() => {
    if (gameEnded && !isPlaying && sessionId) {
      // Save complete metrics locally before navigating — ensures PerformancePage
      // always has the full data from Redux even if the game server drops fields.
      try {
        localStorage.setItem(
          `game_metrics_${sessionId}`,
          JSON.stringify({
            metrics,
            totalScore,
            gameTitle: gameConfig?.gameTitle,
          }),
        );
      } catch {
        /* storage full — non-fatal */
      }

      API.put(`/game-session/update/${sessionId}`, {
        updateData: {
          metrics,
          totalScore,
          complete,
        },
        gameKey,
      })
        .then(() => navigate(`/game/performance/${sessionId}`))
        .catch((err) => {
          console.error("Failed to update session", err);
          // Navigate anyway so the user can see local results
          navigate(`/game/performance/${sessionId}`);
        });
    }
  }, [
    gameEnded,
    isPlaying,
    sessionId,
    metrics,
    totalScore,
    complete,
    navigate,
    gameKey,
    gameConfig,
  ]);

  if (!gameConfig) return;

  const handleStartGame = async () => {
    const endpoint = participantInfo?.participantName
      ? "/research-session"
      : "/game-session";

    try {
      const response = await API.post(endpoint, {
        gameTitle: gameConfig.gameTitle,
        ...(participantInfo && { participantInfo }),
      });

      dispatch(
        gameConfig.startGameAction({
          sessionId: response.data.gameSession._id,
          ...(game === "guess-what"
            ? { guessWhatConfig: response.data.gameSession.initConfig }
            : { stroopGameConfig: response.data.gameSession.initConfig }),
        } as any),
      );

      localStorage.removeItem("participantInfo"); // Immediatelyy remove participant info from local storage
    } catch (error: any) {
      console.error("Failed to start game:", error);

      // If API fails (e.g., 403 with mock token), allow game to continue with a mock session ID
      // This prevents the user from being logged out when using mock authentication
      if (error.response?.status === 403 || error.response?.status === 401) {
        console.warn(
          "Game session API failed, continuing with mock session for development",
        );
        const mockSessionId = `mock-session-${Date.now()}`;

        // Use default config if API doesn't provide one
        if (game === "guess-what") {
          const defaultConfig = { levels: 3, imagesPerLevel: 4 };
          dispatch(
            gameConfig.startGameAction({
              sessionId: mockSessionId,
              guessWhatConfig: defaultConfig,
            } as any),
          );
        } else if (game === "stroop") {
          // Default Stroop config with questions
          const defaultStroopConfig = {
            id: "stroop-default",
            type: "executive function" as const,
            title: "Stroop Test",
            duration: 20000, // 20 seconds for demo
            questions: [
              { text: "RED", fontColor: "red", isCorrect: true },
              { text: "BLUE", fontColor: "blue", isCorrect: true },
              { text: "GREEN", fontColor: "green", isCorrect: true },
              { text: "RED", fontColor: "blue", isCorrect: false },
              { text: "BLUE", fontColor: "red", isCorrect: false },
              { text: "GREEN", fontColor: "red", isCorrect: false },
              { text: "RED", fontColor: "red", isCorrect: true },
              { text: "BLUE", fontColor: "green", isCorrect: false },
              { text: "GREEN", fontColor: "green", isCorrect: true },
              { text: "RED", fontColor: "green", isCorrect: false },
            ],
          };
          dispatch(
            gameConfig.startGameAction({
              sessionId: mockSessionId,
              stroopGameConfig: defaultStroopConfig,
            } as any),
          );
        }
      }
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center w-full h-screen bg-green-50 p-4">
      {/* <MobileWarning /> */}

      {/* Overlay Start Panel */}
      {!isPlaying && (
        <div className="absolute z-20 max-w-3xl p-10 bg-white rounded-md shadow-lg text-[#3e3e3e]">
          <h2 className="text-4xl font-bold mb-2 capitalize">
            {gameConfig.gameTitle}
          </h2>
          <p className="text-lg mb-4">{gameConfig.description}</p>

          {gameConfig.testingPhase && (
            <div className="mb-4 p-3 bg-yellow-100 border border-yellow-300 text-yellow-800 rounded">
              ⚠️ This game is still in the testing phase. Your MMSE scores may
              not be fully accurate.
            </div>
          )}

          <p className="text-lg font-semibold "> How to play</p>
          {gameConfig.rules && (
            <ul className="list-disc pl-5 mb-4 text-lg text-gray-700">
              {gameConfig.rules.map((rule, index) => (
                <li className="mb-1" key={index}>
                  {rule}
                </li>
              ))}
            </ul>
          )}

          <button
            onClick={handleStartGame}
            className="p-2 bg-green-700 w-1/2 text-white font-bold hover:bg-green-500 rounded"
          >
            Start Game
          </button>
        </div>
      )}

      {/* Game Content */}
      {isPlaying && config && (
        <div className="flex w-full h-full bg-[#9c6144cc] rounded-md text-[#EADEB8] z-10">
          <GameRunner
            sessionId={sessionId!}
            guessWhatConfig={game === "guess-what" ? config : null}
            stroopGameConfig={game === "stroop" ? config : null}
          />
        </div>
      )}
    </div>
  );
};
