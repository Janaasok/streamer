import React, { useEffect, useState } from "react";

const PongGame = () => {
  const [ball, setBall] = useState({ x: 50, y: 50, dx: 2, dy: 2 });
  const [paddle, setPaddle] = useState(150);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true); // Track if the game is active
  const [difficulty, setDifficulty] = useState("medium"); // Easy, Medium, Hard

  const paddleHeight = 10;
  const paddleWidth = 100;
  const boardWidth = 600;
  const boardHeight = 400;
  const ballSize = 15;

  // Adjust ball speed based on difficulty
  const ballSpeed = {
    easy: 1.5,
    medium: 2.5,
    hard: 3.5,
  };

  useEffect(() => {
    const moveBall = () => {
      if (!isPlaying) return; // Stop moving the ball if the game is over

      setBall((prev) => {
        let newX = prev.x + prev.dx * ballSpeed[difficulty] * (1 + score * 0.01); // Gradually increase speed
        let newY = prev.y + prev.dy * ballSpeed[difficulty] * (1 + score * 0.01);

        // Bounce off walls
        if (newX < 0 || newX > boardWidth - ballSize) prev.dx *= -1;
        if (newY < 0) prev.dy *= -1;

        // Paddle collision
        if (
          newY > boardHeight - paddleHeight - ballSize &&
          newX > paddle &&
          newX < paddle + paddleWidth
        ) {
          prev.dy *= -1;
          setScore((prevScore) => prevScore + 1);
          playSound("paddleHit");
        }

        // Game over if the ball hits the bottom
        if (newY > boardHeight) {
          setIsPlaying(false); // Stop the game
          setGameOver(true); // Show game over screen
          playSound("gameOver");
          return { x: 50, y: 50, dx: 2, dy: 2 }; // Reset ball position
        }

        return { ...prev, x: newX, y: newY };
      });
    };

    const interval = setInterval(moveBall, 16); // ~60 FPS
    return () => clearInterval(interval);
  }, [ball, difficulty, score, isPlaying]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isPlaying) return; // Disable paddle movement if the game is over

      if (e.key === "ArrowLeft" && paddle > 0) setPaddle((prev) => prev - 20);
      if (e.key === "ArrowRight" && paddle < boardWidth - paddleWidth)
        setPaddle((prev) => prev + 20);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [paddle, isPlaying]);

  const playSound = (sound) => {
    const audio = new Audio(
      sound === "paddleHit"
        ? "https://assets.mixkit.co/active_storage/sfx/1027/1027-preview.mp3"
        : "https://assets.mixkit.co/active_storage/sfx/2997/2997-preview.mp3"
    );
    audio.play();
  };

  const restartGame = () => {
    setBall({ x: 50, y: 50, dx: 2, dy: 2 });
    setPaddle(150);
    setScore(0);
    setGameOver(false);
    setIsPlaying(true); // Restart the game
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>🏓 Pong Game</h1>
      <div style={styles.score}>Score: {score}</div>
      <div style={styles.difficulty}>
        <label>Difficulty: </label>
        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          style={styles.select}
        >
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </div>
      <div style={styles.board}>
        {/* Ball */}
        <div
          style={{
            ...styles.ball,
            top: ball.y,
            left: ball.x,
          }}
        ></div>

        {/* Paddle */}
        <div
          style={{
            ...styles.paddle,
            left: paddle,
          }}
        ></div>
      </div>

      {gameOver && (
        <div style={styles.gameOver}>
          <h2>Game Over!</h2>
          <p>Your Score: {score}</p>
          <button style={styles.restartButton} onClick={restartGame}>
            Restart Game
          </button>
        </div>
      )}
    </div>
  );
};

// Styles
const styles = {
  container: {
    textAlign: "center",
    fontFamily: "'Poppins', sans-serif",
    backgroundColor: "#FFFFFF", // White background
    color: "#000000", // Black text for contrast
    minHeight: "100vh",
    padding: "20px",
  },
  heading: {
    fontSize: "2.5rem",
    marginBottom: "20px",
    color: "#ffcc00",
  },
  score: {
    fontSize: "1.5rem",
    marginBottom: "10px",
  },
  difficulty: {
    marginBottom: "20px",
  },
  select: {
    padding: "5px",
    fontSize: "1rem",
    borderRadius: "5px",
  },
  board: {
    position: "relative",
    width: "600px",
    height: "400px",
    backgroundColor: "#000",
    margin: "auto",
    border: "2px solid #444",
    borderRadius: "10px",
    overflow: "hidden",
  },
  ball: {
    position: "absolute",
    width: "15px",
    height: "15px",
    backgroundColor: "#ff4757",
    borderRadius: "50%",
    boxShadow: "0 0 10px #ff4757",
  },
  paddle: {
    position: "absolute",
    width: "100px",
    height: "10px",
    backgroundColor: "#00a8ff",
    borderRadius: "5px",
    bottom: "0",
    boxShadow: "0 0 10px #00a8ff",
  },
  gameOver: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    padding: "20px",
    borderRadius: "10px",
    textAlign: "center",
  },
  restartButton: {
    padding: "10px 20px",
    fontSize: "1rem",
    cursor: "pointer",
    border: "none",
    background: "#ff4757",
    color: "white",
    borderRadius: "5px",
    transition: "0.3s",
    "&:hover": {
      background: "#e84118",
    },
  },
};

export default PongGame;