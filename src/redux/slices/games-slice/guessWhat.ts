import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { GuessWhatInitConfig } from "../../../types/game/guessWhatTypes";
import { getAccuracyBonus, getDifficultyMultiplier, getPenaltyRate, initializeGameState, } from "../../../utils/game/guessWhatUtils";
import type { Card } from "../../../types/game/guessWhatTypes";

interface GameState {
    sessionId: string | null;
    config: GuessWhatInitConfig | null;
    gameState: {
        level: number;
        cards: Card[];
        currentImagesToFind: string[];
        isMemorizationPhase: boolean;
        memorizationTime: number;
        timeLeft: number;
        attempts: number;
        pauseStartTime: number;
        levelStartTime: number;
        levelEndTime: number;
        maxAttempts: number;
    } | null;
    metrics: {
        level: number,
        attempt: number,
        totalResponseTime: number,
        accuracy: number,
        levelErrors: number,
        levelScore: number,
    }[] | null;
    totalScore: 0 | number;
    isPlaying: boolean;
    isPaused: boolean;
    gameEnded: boolean | null;
    complete: boolean;

}

const initialState: GameState = {
    sessionId: null,
    config: null,
    gameState: null,
    metrics: [],
    isPlaying: false,
    isPaused: false,
    gameEnded: false,
    totalScore: 0,
    complete: false
};

const guessWhatGameSlice = createSlice({
    name: "guessWhat",
    initialState,
    reducers: {
        decrementTimer(state) {
            if (state.isPaused || !state.gameState) return;

            if (state.gameState && state.gameState.timeLeft > 0) {
                state.gameState.timeLeft -= 1;
            } else if (state.gameState?.timeLeft === 0) {
                state.gameState.isMemorizationPhase = false;
            }
        },

        setLevelStartTime(state, action: PayloadAction<number>) {
            state.gameState!.levelStartTime = action.payload;
        },

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        startGuessWhatGame(state, action: PayloadAction<{ sessionId: string; guessWhatConfig: GuessWhatInitConfig | any }>) {
            state.sessionId = action.payload.sessionId;
            state.config = action.payload.guessWhatConfig;
            state.isPlaying = true;
            state.metrics = [];
            state.totalScore = 0;
            state.gameState = initializeGameState(action.payload.guessWhatConfig, 1);
            state.gameEnded = false

        },
        restartGame(state) {
            state.gameState = initializeGameState(state.config!, 1);
            state.gameState.memorizationTime = 20000;
            state.isPaused = false;
            state.isPlaying = true;
            state.metrics = [];
            state.gameEnded = false;
            state.totalScore = 0;
        },

        revealCards(state) {
            if (state.gameState && state.gameState.timeLeft === 0) {
                state.gameState.isMemorizationPhase = false;
            }
        },

        selectCard(state, action: PayloadAction<number>) {
            if (!state.gameState || state.gameState.isMemorizationPhase || state.isPaused) return;

            const card = state.gameState.cards.find(card => card.id === action.payload);
            if (!card || card.matched) return;

            if (state.gameState.currentImagesToFind.includes(card.image)) {
                card.matched = true;
                state.gameState.currentImagesToFind = state.gameState.currentImagesToFind.filter(
                    image => image !== card.image
                );
            } else {
                state.gameState.attempts++;
            }
        },

        nextLevel(state) {
            if (!state.config || !state.gameState) return;
            const { level, levelStartTime, attempts, cards } = state.gameState;
            const levelEndTime = Date.now();
            const totalTime = (levelEndTime - levelStartTime) / 1000;
            const correctMatches = cards.filter(c => c.matched).length;
            const totalAttempts = attempts + correctMatches;

            const accuracy = (totalAttempts && correctMatches >= 0)
                ? (correctMatches / totalAttempts) * 100
                : 0;

            const errors = totalAttempts - correctMatches;
            const errorRate = (errors && correctMatches >= 0) ? (errors / totalAttempts) * 100 : 0;

            // Level Scoring System
            const difficultyMultiplier = getDifficultyMultiplier(level);
            const levelBonus = totalTime > 0 ? (((level / totalTime) * 55) * difficultyMultiplier) : 0;
            const timeBonus = totalTime > 0 ? ((level / totalTime) * 10) : 0;
            const accuracyBonus = getAccuracyBonus(accuracy);
            const penaltyRate = getPenaltyRate(errorRate);
            const compensation = (level * 0.25)


            const weightedLevelScore = (
                3 * levelBonus +
                4 * timeBonus +
                6 * accuracyBonus
            ) - (5 * penaltyRate) + compensation;

            const isFail = accuracy === 0;
            const levelScore = isNaN(weightedLevelScore) || isFail ? 0 : Math.round(weightedLevelScore);
            state.totalScore += Math.round(levelScore);


            state.metrics!.push({
                level,
                attempt: totalAttempts,
                totalResponseTime: totalTime,
                accuracy,
                levelErrors: errors,
                levelScore
            });

            if (level >= state.config.maxLevels) {
                guessWhatGameSlice.caseReducers.endGuessWhatGame(state)
                return;
            }

            state.gameState = initializeGameState(state.config, level + 1);
        },

        pauseGame(state) {
            if (state.isPaused || !state.gameState) return;
            state.isPaused = true;
            state.gameState.pauseStartTime = Date.now();
        },

        setPaused: (state, action: PayloadAction<boolean>) => {
            state.isPaused = action.payload;
        },

        resumeGuessWhatGame(state) {
            if (!state.isPaused || !state.gameState || !state.gameState.pauseStartTime) return;

            const pausedDuration = Date.now() - state.gameState.pauseStartTime;

            // Adjust level start time so the response time stays accurate
            state.gameState.levelStartTime += pausedDuration;

            // Adjust timeLeft if still in memorization phase
            if (state.gameState.isMemorizationPhase) {
                state.gameState.timeLeft -= Math.floor(pausedDuration / 1000);
                if (state.gameState.timeLeft < 0) state.gameState.timeLeft = 0;
            }

            state.isPaused = false;
            state.gameState.pauseStartTime = 0;
        },

        setTimeLeft: (state, action: PayloadAction<number>) => {
            state.gameState!.timeLeft = action.payload;
        },

        forceEndGuessWhatGame(state) {
            state.config = null;
            state.isPaused = false;
            state.sessionId = null;
            state.totalScore = 0;
            state.metrics = null;
            state.isPlaying = false;
            state.gameEnded = true;
            state.gameState = null;
        },

        endGuessWhatGame(state) {
            state.config = null;
            state.isPaused = false;
            state.isPlaying = false;
            state.gameEnded = true;
            state.gameState = null;
            state.complete = true;
        },
    },
});


export const {
    startGuessWhatGame,
    revealCards,
    selectCard,
    nextLevel,
    endGuessWhatGame,
    decrementTimer,
    forceEndGuessWhatGame,
    setLevelStartTime,
    setPaused,
    setTimeLeft,
    pauseGame,
    resumeGuessWhatGame,
    restartGame
} = guessWhatGameSlice.actions;

export const guessWhatGameReducer = guessWhatGameSlice.reducer;
