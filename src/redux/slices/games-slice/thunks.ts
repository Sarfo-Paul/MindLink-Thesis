import { createAsyncThunk } from "@reduxjs/toolkit";
import { selectCard, endGuessWhatGame } from "./guessWhat";
import type { RootState } from "../../store";
import type { IGuessWhatMetric } from "../../../types/props";
import API from "../../../config/axiosConfig";


export const selectCardThunk = createAsyncThunk<boolean, number, { state: RootState }>(
    "guessWhat/selectCardThunk",
    async (cardId, { dispatch, getState }): Promise<boolean> => {
        const state = getState().guessWhat;
        const gameState = state.gameState;

        if (!gameState || gameState.isMemorizationPhase) return false;

        const card = gameState.cards.find((card) => card.id === cardId);
        if (!card || card.matched) return false;

        const isMatch = gameState.currentImagesToFind.includes(card.image);

        dispatch(selectCard(cardId));

        return isMatch;
    }
);

export const sendFinalGameMetricsThunk = createAsyncThunk<
  IGuessWhatMetric[],         // Return type (response from the API)
  string,          // Argument type (game session ID or other identifier)
  { state: RootState } // Thunk API (includes access to the state)
>(
  "guessWhat/sendFinalGameMetricsThunk",
  async (sessionId, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const metrics = state.guessWhat.metrics; // Adjust based on your state shape

      const response = await API.put(`/game/game-session/${sessionId}`, {performance: metrics})
      const gameMetrics = response.data!.gamesession!.metrics

      if (response.status !== 200){
        throw new Error("Failed to send session metrics")
      } else {
        console.log('Updated game metrics', gameMetrics)
      }
      return gameMetrics;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Unknown error");
    }
  }
);

export const endGameThunk = createAsyncThunk<
  void,
  void,
  { state: RootState }
>(
  "guessWhat/endGameThunk",
  async (_, { dispatch, getState }) => {
    const state = getState().guessWhat;
    if (!state.sessionId) return; // No session to update

    try {
      await dispatch(sendFinalGameMetricsThunk(state.sessionId)).unwrap(); 
    } catch (error) {
      console.error("Error sending final metrics:", error);
    }

    // Now safely end the game
    dispatch(endGuessWhatGame()); 
  }
);