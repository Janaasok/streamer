import React, { useState, useEffect } from "react";

const boardSize = 15; // Increased grid size for better gameplay
const cellSize = 25; // Slightly larger cell size for better visuals

const SnakeGame = () => {
  const [snake, setSnake] = useState([{ x: 2, y: 2 }]);
  const [food, setFood] = useState(getRandomFoodPosition());
  const [direction, setDirection] = useState("RIGHT");
  const [gameOver, setGameOver] = useState(false);
  const [speed, setSpeed] = useState(200); // Adjustable speed
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    // Load high score from localStorage
    const savedHighScore = localStorage.getItem("snakeHighScore");
    return savedHighScore ? parseInt(savedHighScore) : 0;
  });

  useEffect(() => {
    if (gameOver) return;

    const moveSnake = () => {
      setSnake((prevSnake) => {
        let newSnake = [...prevSnake];
        let head = { ...newSnake[0] };

        // Move in the current direction
        if (direction === "UP") head.y -= 1;
        if (direction === "DOWN") head.y += 1;
        if (direction === "LEFT") head.x -= 1;
        if (direction === "RIGHT") head.x += 1;

        // Collision detection (wall or self)
        if (
          head.x < 0 ||
          head.x >= boardSize ||
          head.y < 0 ||
          head.y >= boardSize ||
          newSnake.some((segment) => segment.x === head.x && segment.y === head.y)
        ) {
          setGameOver(true);
          // Update high score if current score is higher
          if (score > highScore) {
            setHighScore(score);
            localStorage.setItem("snakeHighScore", score.toString());
          }
          return prevSnake;
        }

        // Eat food
        if (head.x === food.x && head.y === food.y) {
          setFood(getRandomFoodPosition());
          setScore((prevScore) => prevScore + 1);
        } else {
          newSnake.pop(); // Remove tail if no food eaten
        }

        newSnake.unshift(head); // Add new head to the snake
        return newSnake;
      });
    };

    const interval = setInterval(moveSnake, speed);
    return () => clearInterval(interval);
  }, [direction, food, gameOver, speed, score, highScore]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowUp" && direction !== "DOWN") setDirection("UP");
      if (e.key === "ArrowDown" && direction !== "UP") setDirection("DOWN");
      if (e.key === "ArrowLeft" && direction !== "RIGHT") setDirection("LEFT");
      if (e.key === "ArrowRight" && direction !== "LEFT") setDirection("RIGHT");
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [direction]);

  // Restart Game
  const restartGame = () => {
    setSnake([{ x: 2, y: 2 }]);
    setFood(getRandomFoodPosition());
    setDirection("RIGHT");
    setGameOver(false);
    setScore(0);
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>🐍 Snake Game</h1>
      {gameOver && <h2 style={styles.gameOver}>Game Over!</h2>}

      <div style={styles.scoreBoard}>
        <p>Score: {score}</p>
        <p>High Score: {highScore}</p>
      </div>

      <div style={styles.board}>
        {Array.from({ length: boardSize }).map((_, row) => (
          <div key={row} style={styles.row}>
            {Array.from({ length: boardSize }).map((_, col) => {
              const isSnake = snake.some((segment) => segment.x === col && segment.y === row);
              const isFood = food.x === col && food.y === row;

              return (
                <div
                  key={col}
                  style={{
                    ...styles.cell,
                    ...(isSnake && styles.snakeCell),
                    ...(isFood && styles.foodCell),
                  }}
                ></div>
              );
            })}
          </div>
        ))}
      </div>

      {gameOver && (
        <button style={styles.restartButton} onClick={restartGame}>
          Restart Game 🔄
        </button>
      )}

      {/* Speed Control Slider */}
      <div style={styles.speedControl}>
        <label>Speed: </label>
        <input
          type="range"
          min="50"
          max="500"
          value={speed}
          onChange={(e) => setSpeed(Number(e.target.value))}
        />
      </div>
    </div>
  );
};

// Generate random food position
function getRandomFoodPosition() {
  return {
    x: Math.floor(Math.random() * boardSize),
    y: Math.floor(Math.random() * boardSize),
  };
}

// Built-in CSS
const styles = {
  container: {
    textAlign: "center",
    padding: "20px",
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
    marginBottom: "15px",
    color: "#ffcc00",
    textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)",
  },
  gameOver: {
    fontSize: "2rem",
    color: "#FF5733",
    marginBottom: "10px",
    textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)",
  },
  scoreBoard: {
    display: "flex",
    gap: "20px",
    marginBottom: "20px",
    fontSize: "1.5rem",
    color: "#fff",
    textShadow: "1px 1px 2px rgba(0, 0, 0, 0.5)",
  },
  board: {
    display: "grid",
    gridTemplateRows: `repeat(${boardSize}, ${cellSize}px)`,
    gridGap: "2px",
    backgroundColor: "#222",
    padding: "10px",
    borderRadius: "15px",
    boxShadow: "0 0 20px rgba(0, 0, 0, 0.5)",
  },
  row: {
    display: "grid",
    gridTemplateColumns: `repeat(${boardSize}, ${cellSize}px)`,
  },
  cell: {
    width: `${cellSize}px`,
    height: `${cellSize}px`,
    borderRadius: "5px",
    backgroundColor: "#333",
    transition: "background-color 0.2s ease",
  },
  snakeCell: {
    backgroundColor: "#4CAF50",
    borderRadius: "50%", // Makes snake segments round
    boxShadow: "0 0 5px #4CAF50, 0 0 10px #4CAF50", // Adds a glowing effect
  },
  foodCell: {
    backgroundColor: "#FF5733",
    borderRadius: "50%", // Makes food round
    boxShadow: "0 0 5px #FF5733, 0 0 10px #FF5733", // Adds a glowing effect
  },
  restartButton: {
    marginTop: "20px",
    padding: "10px 20px",
    fontSize: "1.2rem",
    borderRadius: "10px",
    border: "none",
    cursor: "pointer",
    background: "#ffcc00",
    color: "#333",
    transition: "0.3s ease-in-out",
    boxShadow: "0 0 10px rgba(255, 204, 0, 0.5)",
    fontWeight: "bold",
  },
  speedControl: {
    marginTop: "20px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontSize: "1.2rem",
    color: "#fff",
  },
};

export default SnakeGame;