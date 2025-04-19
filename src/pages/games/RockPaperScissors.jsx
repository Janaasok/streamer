import React, { useState } from "react";
import rockImg from "../assets/rock.png";
import paperImg from "../assets/paper.png";
import scissorsImg from "../assets/scissors.png";



const choices = [
  { name: "rock", image: rockImg },
  { name: "paper", image: paperImg },
  { name: "scissors", image: scissorsImg },
];

const RockPaperScissors = () => {
  const [playerChoice, setPlayerChoice] = useState(null);
  const [computerChoice, setComputerChoice] = useState(null);
  const [result, setResult] = useState("");
  const [playerScore, setPlayerScore] = useState(0);
  const [computerScore, setComputerScore] = useState(0);

  const playGame = (playerSelection) => {
    const computerSelection = choices[Math.floor(Math.random() * 3)];
    setPlayerChoice(playerSelection);
    setComputerChoice(computerSelection);

    const gameResult = determineWinner(playerSelection.name, computerSelection.name);
    setResult(gameResult);

    if (gameResult === "You Win! 🎉") setPlayerScore((prev) => prev + 1);
    if (gameResult === "You Lose! 😢") setComputerScore((prev) => prev + 1);
  };

  const determineWinner = (player, computer) => {
    if (player === computer) return "It's a Draw! 🤝";
    if (
      (player === "rock" && computer === "scissors") ||
      (player === "paper" && computer === "rock") ||
      (player === "scissors" && computer === "paper")
    ) {
      return "You Win! 🎉";
    }
    return "You Lose! 😢";
  };

  return (
    <div
      style={{
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
      }}
    >
      <h1 style={{ fontSize: "2rem", marginBottom: "10px", color: "#ffcc00" }}>
        ✊ Rock - Paper - Scissors ✋
      </h1>

      {/* Scoreboard */}
      <div
        style={{
          display: "flex",
          gap: "50px",
          fontSize: "1.2rem",
          marginBottom: "20px",
          background: "#333",
          padding: "10px 20px",
          borderRadius: "10px",
        }}
      >
        <p>👤 You: {playerScore}</p>
        <p>🤖 Computer: {computerScore}</p>
      </div>

      {/* Choices */}
      <div style={{ display: "flex", gap: "20px" }}>
        {choices.map((choice) => (
          <button
            key={choice.name}
            onClick={() => playGame(choice)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              transition: "transform 0.2s ease-in-out",
            }}
          >
            <img
              src={choice.image}
              alt={choice.name}
              style={{ width: "100px", height: "100px" }}
            />
          </button>
        ))}
      </div>

      {/* Display Result */}
      <div style={{ marginTop: "20px", fontSize: "1.5rem" }}>
        {playerChoice && (
          <>
            <p>You chose:</p>
            <img
              src={playerChoice.image}
              alt={playerChoice.name}
              style={{ width: "80px", height: "80px" }}
            />
          </>
        )}
        {computerChoice && (
          <>
            <p>Computer chose:</p>
            <img
              src={computerChoice.image}
              alt={computerChoice.name}
              style={{ width: "80px", height: "80px" }}
            />
          </>
        )}
        {result && (
          <h2
            style={{
              fontSize: "1.8rem",
              fontWeight: "bold",
              color: "#ffcc00",
              marginTop: "15px",
            }}
          >
            {result}
          </h2>
        )}
      </div>
    </div>
  );
};

export default RockPaperScissors;
