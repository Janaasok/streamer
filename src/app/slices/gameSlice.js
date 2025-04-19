import { createSlice } from "@reduxjs/toolkit";

const gameSlice = createSlice({
  name: "game",
  initialState: {
    score: 0,
    isPlaying: false,
  },
  reducers: {
    startGame: (state) => {
      state.isPlaying = true;
    },
    updateScore: (state, action) => {
      state.score += action.payload;
    },
    resetGame: (state) => {
      state.score = 0;
      state.isPlaying = false;
    },
  },
});

export const { startGame, updateScore, resetGame } = gameSlice.actions;
export default gameSlice.reducer;