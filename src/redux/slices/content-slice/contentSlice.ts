import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { type IGame } from "../../../types/game/base";
import { type IStats } from "../../../types/game/base";

export  interface Content {
  games: IGame[];
  stats: IStats;
}

interface ContentState{
  games: IGame[] | null,
  stats: IStats | null
}

const initialState: ContentState = {
  games: null,
  stats: null
}

const appSlice = createSlice({
  name: "content",
  initialState,
  reducers: {
    setGames(state, action: PayloadAction<{games: IGame[]}>){
      state.games = action.payload.games || []
    },
    setStats(state, action: PayloadAction<{stats: IStats}>){
      state.stats = action.payload.stats || []
    }
  }
})

export const {setGames, setStats} = appSlice.actions;
export const contentReducer = appSlice.reducer;