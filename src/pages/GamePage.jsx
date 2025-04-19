import React from "react";
import { useNavigate } from "react-router-dom";

const GamePage = () => {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>🎮 Choose a Game</h1>
      <div style={styles.buttonContainer}>
        <button style={styles.button} onClick={() => navigate("/games/tictactoe")}>Tic-Tac-Toe</button>
        <button style={styles.button} onClick={() => navigate("/games/snake")}>Snake</button>
        <button style={styles.button} onClick={() => navigate("/games/rps")}>Rock Paper Scissors</button>
        <button style={styles.button} onClick={() => navigate("/games/memory")}>Memory Game</button>
        <button style={styles.button} onClick={() => navigate("/games/pong")}>Pong</button>
      </div>
    </div>
  );
};

// Built-in CSS
const styles = {
  container: {
    textAlign: "center",
    padding: "30px",
    fontFamily: "'Poppins', sans-serif",
    backgroundColor: "#1e1e2e",
    color: "#fff",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  heading: {
    fontSize: "2.5rem",
    marginBottom: "20px",
    color: "#ffcc00",
  },
  buttonContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "15px",
    maxWidth: "400px",
  },
  button: {
    padding: "15px",
    fontSize: "1.2rem",
    borderRadius: "10px",
    border: "none",
    cursor: "pointer",
    background: "linear-gradient(135deg, #6a11cb, #2575fc)",
    color: "#fff",
    transition: "0.3s ease-in-out",
  },
  buttonHover: {
    transform: "scale(1.1)",
  },
};

export default GamePage;
