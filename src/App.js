import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Error, Login, Register } from "./pages";
import { Dashboard } from "./pages/dashboard";
import GamePage from "./pages/GamePage";
import TicTacToe from "./pages/games/TicTacToe";
import SnakeGame from "./pages/games/SnakeGame";
import RockPaperScissors from "./pages/games/RockPaperScissors";
import MemoryGame from "./pages/games/MemoryGame";
import PongGame from "./pages/games/PongGame";
import StreamPage from "./pages/StreamPage"; // ✅ Added this line
import "./App.css";
import { AlertNotification } from "./components";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Dashboard />} />
          <Route path="*" element={<Error />} />

          {/* Game Routes */}
          <Route path="/game" element={<GamePage />} />
          <Route path="/games/tictactoe" element={<TicTacToe />} />
          <Route path="/games/snake" element={<SnakeGame />} />
          <Route path="/games/rps" element={<RockPaperScissors />} />
          <Route path="/games/memory" element={<MemoryGame />} />
          <Route path="/games/pong" element={<PongGame />} />

          {/* ✅ Streaming Route */}
          <Route path="/server/:serverId/stream" element={<StreamPage />} />
        </Routes>
      </BrowserRouter>
      <AlertNotification />
    </>
  );
}

export default App;
