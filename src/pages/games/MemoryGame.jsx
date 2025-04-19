import React, { useState, useEffect } from "react";
import styled, { keyframes } from "styled-components";

// Styled Components for Memory Game UI
const GameContainer = styled.div`
  text-align: center;
  font-family: "Arial", sans-serif;
  padding: 20px;
  background: #1e1e2e;
  color: white;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(${({ size }) => size}, ${({ size }) => (size === 4 ? "100px" : size === 6 ? "70px" : "50px")});
  grid-gap: 10px;
  justify-content: center;
  margin-top: 20px;
`;

const Card = styled.div`
  width: ${({ size }) => (size === 4 ? "100px" : size === 6 ? "70px" : "50px")};
  height: ${({ size }) => (size === 4 ? "100px" : size === 6 ? "70px" : "50px")};
  perspective: 1000px;
  cursor: pointer;
  position: relative;
`;

const CardInner = styled.div`
  width: 100%;
  height: 100%;
  position: absolute;
  transform-style: preserve-3d;
  transition: transform 0.5s;
  ${({ flipped }) => flipped && "transform: rotateY(180deg);"}
`;

const CardFace = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${({ size }) => (size === 4 ? "2rem" : size === 6 ? "1.5rem" : "1rem")};
  background: linear-gradient(145deg, #232323, #1b1b1b);
  box-shadow: 4px 4px 8px #121212, -4px -4px 8px #2a2a2a;
  backface-visibility: hidden;
`;

const CardBack = styled(CardFace)`
  transform: rotateY(180deg);
  ${({ matched }) => matched && "background: #00ff7f; color: white; box-shadow: 0 0 15px #00ff7f;"}
`;

const ResetButton = styled.button`
  margin-top: 20px;
  padding: 10px 20px;
  font-size: 1.2rem;
  cursor: pointer;
  border: none;
  background: #ff4757;
  color: white;
  border-radius: 8px;
  transition: 0.3s;
  &:hover {
    background: #e84118;
  }
`;

const ModeButton = styled.button`
  margin: 10px;
  padding: 10px 20px;
  font-size: 1rem;
  cursor: pointer;
  border: none;
  background: #4CAF50;
  color: white;
  border-radius: 8px;
  transition: 0.3s;
  &:hover {
    background: #45a049;
  }
`;

const ScoreDisplay = styled.div`
  margin-top: 20px;
  font-size: 1.2rem;
  color: #ffcc00;
`;

const MemoryGame = () => {
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [disabled, setDisabled] = useState(false);
  const [gridSize, setGridSize] = useState(4); // Default grid size
  const [tilesTurned, setTilesTurned] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    const savedHighScore = localStorage.getItem(`memoryHighScore_${gridSize}`);
    return savedHighScore ? parseInt(savedHighScore) : Infinity;
  });

  // Generate enough unique emojis for the grid size
  const generateCardImages = (size) => {
    const emojis = [
      "🔥", "🌊", "🌿", "⚡", "🌙", "🎵", "🌟", "❤️", "🍎", "🍕", "🚀", "🌈", "🎸", "🐱", "🐶", "🌍",
      "🍔", "🍟", "🍦", "🍩", "🍪", "🍫", "🍬", "🍭", "🍮", "🍯", "🍰", "🍱", "🍲", "🍳", "🍴", "🍵",
      "🍶", "🍷", "🍸", "🍹", "🍺", "🍻", "🍼", "🎂", "🎃", "🎄", "🎆", "🎇", "🎈", "🎉", "🎊", "🎋",
      "🎌", "🎍", "🎎", "🎏", "🎐", "🎑", "🎒", "🎓", "🎠", "🎡", "🎢", "🎣", "🎤", "🎥", "🎦", "🎧",
    ];
    const requiredPairs = (size * size) / 2;
    return emojis.slice(0, requiredPairs);
  };

  useEffect(() => {
    const savedHighScore = localStorage.getItem(`memoryHighScore_${gridSize}`);
    setHighScore(savedHighScore ? parseInt(savedHighScore) : Infinity);
    resetGame();
  }, [gridSize]);

  useEffect(() => {
    if (matched.length === gridSize * gridSize) {
      if (tilesTurned < highScore) {
        setHighScore(tilesTurned);
        localStorage.setItem(`memoryHighScore_${gridSize}`, tilesTurned.toString());
      }
    }
  }, [matched, tilesTurned, highScore, gridSize]);

  const initializeCards = () => {
    const selectedImages = generateCardImages(gridSize);
    const shuffledCards = [...selectedImages, ...selectedImages]
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({ id: index, emoji, flipped: false }));
    setCards(shuffledCards);
  };

  const handleCardClick = (index) => {
    if (disabled || flipped.includes(index) || matched.includes(index)) return;

    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);
    setTilesTurned((prev) => prev + 1);

    if (newFlipped.length === 2) {
      setDisabled(true);
      const [first, second] = newFlipped;
      if (cards[first].emoji === cards[second].emoji) {
        setMatched([...matched, first, second]);
      }
      setTimeout(() => {
        setFlipped([]);
        setDisabled(false);
      }, 800);
    }
  };

  const resetGame = () => {
    setMatched([]);
    setFlipped([]);
    setDisabled(false);
    setTilesTurned(0);
    initializeCards();
  };

  const changeGridSize = (size) => {
    setGridSize(size);
  };

  return (
    <GameContainer>
      <h1>🧠 Memory Game</h1>
      <div>
        <ModeButton onClick={() => changeGridSize(4)}>4x4</ModeButton>
        <ModeButton onClick={() => changeGridSize(6)}>6x6</ModeButton>
        <ModeButton onClick={() => changeGridSize(8)}>8x8</ModeButton>
      </div>
      <ScoreDisplay>
        <p>Tiles Turned: {tilesTurned}</p>
        <p>High Score: {highScore === Infinity ? "N/A" : highScore}</p>
      </ScoreDisplay>
      <Grid size={gridSize}>
        {cards.map((card, index) => (
          <Card key={card.id} size={gridSize} onClick={() => handleCardClick(index)}>
            <CardInner flipped={flipped.includes(index) || matched.includes(index)}>
              <CardFace size={gridSize}>❓</CardFace>
              <CardBack size={gridSize} matched={matched.includes(index)}>{card.emoji}</CardBack>
            </CardInner>
          </Card>
        ))}
      </Grid>
      <ResetButton onClick={resetGame}>🔄 Restart Game</ResetButton>
    </GameContainer>
  );
};

export default MemoryGame;