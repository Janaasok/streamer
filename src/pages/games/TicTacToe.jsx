import React, { useState } from "react";
import { Button } from "@mui/material";

const TicTacToe = () => {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const winner = calculateWinner(board);
  const isDraw = board.every((cell) => cell !== null) && !winner;

  const handleClick = (index) => {
    if (board[index] || winner) return;
    const newBoard = [...board];
    newBoard[index] = isXNext ? "X" : "O";
    setBoard(newBoard);
    setIsXNext(!isXNext);
  };

  const handleRestart = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
  };

  return (
    <div style={styles.gameContainer}>
      <h1 style={styles.heading}>Tic-Tac-Toe</h1>
      <div style={styles.board}>
        {board.map((cell, index) => (
          <button key={index} style={styles.cell} onClick={() => handleClick(index)}>
            {cell}
          </button>
        ))}
      </div>
      {winner && <h2 style={styles.winnerText}>🎉 {winner} Wins!</h2>}
      {isDraw && <h2 style={styles.drawText}>😲 It's a Draw!</h2>}
      
      {/* Restart Button with Better Alignment */}
      <Button 
        variant="contained" 
        color="primary" 
        onClick={handleRestart} 
        style={styles.restartButton}
      >
        Restart
      </Button>
    </div>
  );
};

// Helper function to check winner
const calculateWinner = (squares) => {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let line of lines) {
    const [a, b, c] = line;
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
};

// Styles Object (Built-in CSS)
const styles = {
  gameContainer: {
    textAlign: "center",
    padding: "20px",
    fontFamily: "Poppins, sans-serif",
    backgroundColor: "#1e1e2e",
    color: "#fff",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  heading: {
    fontSize: "2rem",
    marginBottom: "20px",
    color: "#ffcc00",
  },
  board: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 100px)",
    gridGap: "10px",
    justifyContent: "center",
  },
  cell: {
    width: "100px",
    height: "100px",
    fontSize: "2rem",
    fontWeight: "bold",
    background: "linear-gradient(135deg, #6a11cb, #2575fc)",
    color: "white",
    border: "none",
    borderRadius: "10px",
    transition: "transform 0.2s",
    cursor: "pointer",
  },
  winnerText: {
    fontSize: "1.5rem",
    color: "#ff9800",
    marginTop: "15px",
  },
  drawText: {
    fontSize: "1.5rem",
    color: "#00c0ff",
    marginTop: "15px",
  },
  restartButton: {
    marginTop: "20px",
    backgroundColor: "#ff4d4d",
    fontSize: "1rem",
    padding: "10px 20px",
    borderRadius: "8px",
  },
};

export default TicTacToe;
