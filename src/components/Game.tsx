import { Chess, Square } from 'chess.js';
import { createContext, useContext, useRef, useState } from 'react';

type Move = string | { from: Square; to: Square };

type GameContextType = {
  game: Chess;
  fen: string;
  makeMove: (move: Move) => boolean;
  makeRandomMove: () => boolean;
};

export const GameContext = createContext<GameContextType>({
  game: new Chess(),
  fen: '',
  makeMove: () => false,
  makeRandomMove: () => false,
});

export function GameProvider({ children }: { children: JSX.Element }) {
  const game = useRef(new Chess());
  const [fen, setFen] = useState(game.current.fen());

  function makeMove(move: string | { from: Square; to: Square }) {
    let valid = true;

    try {
      game.current.move(move);
    } catch (error) {
      valid = false;
    }

    if (valid) {
      setFen(game.current.fen());
    }

    return valid;
  }

  function makeRandomMove() {
    const possibleMoves = game.current.moves();
    if (
      game.current.isGameOver() ||
      game.current.isDraw() ||
      possibleMoves.length === 0
    ) {
      return false; // exit if the game is over
    }
    const randomIndex = Math.floor(Math.random() * possibleMoves.length);
    return makeMove(possibleMoves[randomIndex]);
  }

  return (
    <GameContext.Provider
      value={{ game: game.current, fen, makeMove, makeRandomMove }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  return useContext(GameContext);
}
