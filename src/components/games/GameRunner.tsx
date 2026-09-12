import { useDispatch } from "react-redux";
import { useEffect } from "react";
import { startGuessWhatGame } from "../../redux/slices/games-slice/guessWhat";
import { startStroopGame } from "../../redux/slices/games-slice/stroop";
import { MainScreen as GuessWhatMainScreen } from "./GuessWhatGame/screens/MainScreen";
import { MainScreen as StroopMainScreen } from "./StroopGame/screens/MainScreen";
import { type GuessWhatInitConfig } from "../../types/game/guessWhatTypes";
import { GameCanvas } from "./GameCanvas";
import { type IStroopGameConfig } from "../../types/game/stroopTypes";

interface GameRunnerProps {
  sessionId: string;
  guessWhatConfig: GuessWhatInitConfig;
  stroopGameConfig: IStroopGameConfig;
}

export const GameRunner: React.FC<GameRunnerProps> = ({ sessionId, guessWhatConfig, stroopGameConfig }) => {
  const dispatch = useDispatch();

  const gameTitle = guessWhatConfig
    ? "guess what"
    : stroopGameConfig
    ? "stroop"
    : null;

  useEffect(() => {
    if (!gameTitle) return;

    switch (gameTitle) {
      case "guess what":
        dispatch(startGuessWhatGame({ sessionId, guessWhatConfig }));
        break;
      case "stroop":
        dispatch(startStroopGame({ sessionId, stroopGameConfig }));
        break;
      default:
        break;
    }
  }, [gameTitle, sessionId, dispatch, guessWhatConfig, stroopGameConfig]);

  const renderGameScreen = () => {
    switch (gameTitle) {
      case "guess what":
        return <GuessWhatMainScreen />;
      case "stroop":
        return <StroopMainScreen />;
      default:
        return <div>Invalid game configuration</div>;
    }
  };

  return (
    <GameCanvas gameTitle={gameTitle || "unknown"}>
      {renderGameScreen()}
    </GameCanvas>
  );
};
