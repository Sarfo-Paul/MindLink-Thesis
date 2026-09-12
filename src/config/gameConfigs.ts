import { type RootState } from "../redux/store";
import { startGuessWhatGame } from "../redux/slices/games-slice/guessWhat";
import { startStroopGame } from "../redux/slices/games-slice/stroop";
import { getGuessWhatMMSEScore } from "../utils/game/guessWhatUtils";
import { getStroopMMSEScore } from "../utils/game/stroopUtils";

import { type GuessWhatInitConfig } from "../types/game/guessWhatTypes";
import { type IStroopGameConfig } from "../types/game/stroopTypes";

export const gameConfigs = {
  "guess-what": {
    gameTitle: "guess what",
    description: "A memory recognition game to evaluate visual attention and recall.",
    startGameAction: (payload: { sessionId: string; guessWhatConfig: GuessWhatInitConfig }) =>
      startGuessWhatGame(payload),
    getSlice: (state: RootState) => state.guessWhat,
    computeScore: getGuessWhatMMSEScore,
    rules: [
      "You will be shown images briefly, before the timer ⏲️ goes down.",
      "Try to memorize and recall the imagees and their positions.",
      "A set of images will be displayed for selection.",
      "Select which numbered card represents the position of the images displayed.",
      "You get points for correct selections.",
      "Speed and accuracy matter.",
    ],
    testingPhase: true,
  },

  "stroop": {
    gameTitle: "stroop",
    description: "A test of cognitive control using color-word interference.",
    startGameAction: (payload: { sessionId: string; stroopGameConfig: IStroopGameConfig }) =>
      startStroopGame(payload),
    getSlice: (state: RootState) => state.stroop,
    computeScore: getStroopMMSEScore,
    rules: [
      "Identify the font color of a word, not the word itself.",
      "Make sure the font color of the word and the word itself match.",
      "Select ✅ if there is a match or ❌ if otherwise.",
      "You must respond as quickly and accurately as possible.",
      "You get points for correct choices only."
    ],
    testingPhase: true,
  },
};

export type GameKey = keyof typeof gameConfigs;

