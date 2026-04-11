import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { IStroopGameConfig, IStroopQuestion } from "../../../types/game/stroopTypes";
import { initializeGameState } from "../../../utils/game/stroopUtils";

export interface GameState {
  sessionId: string | null;
  config: IStroopGameConfig | null;
  gameState: {
    level: number;
    duration: number;
    questions: IStroopQuestion[];
    currentIndex: number;
  } | null;
  metrics: {
    questions: number;
    attempts: number;
    averageResponseTime: number;
    errors: number;
    accuracy: number;
  } | null;
  pauseStartTime?: number | null,
  totalPausedDuration?: number,
  totalScore: number;
  isPlaying: boolean;
  isPaused: boolean;
  gameEnded: boolean;
  complete:boolean;
}

const initialState: GameState = {
  sessionId: null,
  config: null,
  gameState: null,
  metrics: null,
  totalScore: 0,
  isPlaying: false,
  isPaused: false,
  gameEnded: false,
  pauseStartTime: null,
  totalPausedDuration: 0,
  complete: false
};

const stroopGameSlice = createSlice({
  name: "stroop",
  initialState,
  reducers: {
    startStroopGame(state, action: PayloadAction<{ sessionId: string; stroopGameConfig: IStroopGameConfig }>) {
      state.sessionId = action.payload.sessionId;
      state.config = action.payload.stroopGameConfig;
      state.isPlaying = true;
      state.metrics = {
        questions: 0,
        attempts: 0,
        averageResponseTime: 0,
        errors: 0,
        accuracy: 0,
      };
      state.totalScore = 0;
      state.gameState = {
        ...initializeGameState(action.payload.stroopGameConfig, 1),
        currentIndex: 0,
      };
      state.gameEnded = false;
    },

    recordAnswer(state, action: PayloadAction<{ correct: boolean; bonus: number; responseTime?: number }>) {
      const { correct, bonus, responseTime } = action.payload;
      if (state.metrics && state.gameState) {
        state.metrics.attempts += 1;
        if (!correct) {
          state.metrics.errors += 1;
        }
        state.metrics.questions += 1;
        
        // Calculate average response time properly
        if (responseTime !== undefined && state.metrics.attempts > 0) {
          // Update running average: (oldAverage * (n-1) + newValue) / n
          const oldAverage = state.metrics.averageResponseTime || 0;
          const n = state.metrics.attempts;
          state.metrics.averageResponseTime = ((oldAverage * (n - 1)) + (responseTime / 1000)) / n;
        } else if (state.metrics.attempts === 1) {
          // First attempt, set initial response time
          state.metrics.averageResponseTime = responseTime ? responseTime / 1000 : 0;
        }
        
        // Calculate accuracy, prevent division by zero
        if (state.metrics.attempts > 0) {
          state.metrics.accuracy = Math.round(
            ((state.metrics.attempts - state.metrics.errors) / state.metrics.attempts) * 100
          );
        } else {
          state.metrics.accuracy = 0;
        }
        
        if (correct) {
          state.totalScore += 100 + bonus;
        }
      }
    },
    advanceLevel(state) {
      if (state.gameState) {
        state.gameState.level += 1;
        state.gameState.currentIndex += 1;
      }
    },
    pauseStroopGame(state) {
      if (state.isPaused) return; // <-- Corrected condition
      state.isPaused = true;
      state.pauseStartTime = Date.now();
    },
    setPaused: (state, action: PayloadAction<boolean>) => {
      state.isPaused = action.payload;
    },

    resumeStroopGame(state) {
      if (state.isPaused && !state.gameEnded && state.isPlaying && state.gameState) {
        const pausedTime = Date.now() - (state.pauseStartTime || Date.now());
        state.totalPausedDuration = (state.totalPausedDuration || 0) + pausedTime;
        state.isPaused = false;
        state.pauseStartTime = null;
      }
    },


    restartGame(state){
      state.gameState = {
        ...initializeGameState(state.config!, 1),
        currentIndex: 0,
      };
      state.metrics = {
        questions: 0,
        averageResponseTime: 0,
        attempts: 0,
        errors: 0,
        accuracy: 0,
      };
      state.totalScore = 0;
      state.isPaused = false;
      state.isPlaying = true;
      state.gameEnded = false;
      state.totalScore = 0;
    },

    forceEndStroopGame(state){
      state.config = null;
      state.isPaused = false;
      state.sessionId = null;
      state.totalScore = 0;
      state.isPlaying = false;
      state.gameEnded = true;
      state.gameState = null;
      state.metrics = null;
      state.complete = false;
    },

    endGame(state) {
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
  startStroopGame,
  restartGame,
  pauseStroopGame,
  forceEndStroopGame,
  resumeStroopGame,
  recordAnswer, 
  advanceLevel, 
  endGame 
} = stroopGameSlice.actions;
export const stroopGameReducer = stroopGameSlice.reducer;
