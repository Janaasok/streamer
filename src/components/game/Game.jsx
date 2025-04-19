import React, { useEffect, useState } from "react";
import { joinGame, sendGameEvent, subscribeToGameUpdates } from "./GameSocket"; // Corrected path
import { useDispatch, useSelector } from "react-redux";
import { updateScore } from "../../app/slices/gameSlice"; // Corrected path

function Game() {
  const dispatch = useDispatch();
  const score = useSelector((state) => state.game.score);
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState([]);
  const [result, setResult] = useState("");

  useEffect(() => {
    // Join the game room
    joinGame("trivia-room");

    // Subscribe to game updates
    subscribeToGameUpdates((data) => { 
      if (data.error) {
        alert(data.error); // Handle error from server
        return;
      }

      if (data.type === "question") {
        setQuestion(data.question);
        setOptions(data.options);
        setResult("");
      } else if (data.type === "result") { 
        setResult(data.message);
        dispatch(updateScore(data.score));
      }
    });
  }, [dispatch]);

  const handleAnswer = (answer) => {
    sendGameEvent({ type: "answer", answer });
  };

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h1>Multiplayer Trivia Game</h1>
      <p>{question}</p>

      <div>
        {options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleAnswer(option)}
            style={{ margin: "5px", padding: "10px" }}
          >
            {option}
          </button>
        ))}
      </div>
      {result && <p>{result}</p>}
      <p>Your Score: {score}</p>
    </div>
  );
}

export default Game;