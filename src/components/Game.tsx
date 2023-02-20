import { Chess, Square } from 'chess.js';
import { createContext, useContext, useRef, useState } from 'react';
import { findMaxMove, getRandomMove } from 'src/utils';

type Move = string | { from: Square; to: Square };

export enum AiType {
  Random = 'Random',
  D0 = 'D0',
  D1 = 'D1',
  D2 = 'D2',
  D3 = 'D3',
}

type GameContextType = {
  game: Chess;
  fen: string;
  aiType: AiType;
  makeMove: (move: Move) => boolean;
  makeRandomMove: () => boolean;
  makeAiMove: () => boolean;
  setAiType: (aiType: AiType) => void;
};

export const GameContext = createContext<GameContextType>({
  game: new Chess(),
  fen: '',
  aiType: AiType.Random,
  makeMove: () => false,
  makeRandomMove: () => false,
  makeAiMove: () => false,
  setAiType: () => false,
});

export function GameProvider({ children }: { children: JSX.Element }) {
  const game = useRef(new Chess());
  const [fen, setFen] = useState(game.current.fen());
  const [aiType, setAiType] = useState(AiType.Random);

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

  function makeAiMove() {
    let started = Date.now();
    let move: string | undefined = undefined;
    if (aiType === AiType.Random) {
      move = getRandomMove(game.current);
    }
    if (aiType === AiType.D0) {
      move = findMaxMove(game.current, 0);
    }
    if (aiType === AiType.D1) {
      move = findMaxMove(game.current, 1);
    }
    if (aiType === AiType.D2) {
      move = findMaxMove(game.current, 2);
    }
    if (aiType === AiType.D3) {
      move = findMaxMove(game.current, 3);
    }
    let took = Date.now() - started;
    console.log('ai move took', took, 'ms');
    if (!move) {
      throw new Error('AI did not find a move');
    }
    if (move) {
      return makeMove(move);
    } else {
      return false;
    }
  }

  function makeRandomMove() {
    const move = getRandomMove(game.current);
    if (move) {
      return makeMove(move);
    } else {
      return false;
    }
  }

  return (
    <GameContext.Provider
      value={{
        aiType,
        setAiType,
        game: game.current,
        fen,
        makeMove,
        makeRandomMove,
        makeAiMove,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  return useContext(GameContext);
}
