import { Chess, Square } from 'chess.js';
import { createContext, useContext, useRef, useState } from 'react';
import { findMaxMove, getRandomMove } from 'src/utils';

type Move = string | { from: Square; to: Square };

export enum AiType {
  // Random = 'Random',
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
  findAiMove: () => string;
  makeAiMove: () => boolean;
  setAiType: (aiType: AiType) => void;
};

export const GameContext = createContext<GameContextType>({
  game: new Chess(),
  fen: '',
  aiType: AiType.D0,
  makeMove: () => false,
  makeRandomMove: () => false,
  findAiMove: () => '',
  makeAiMove: () => false,
  setAiType: () => false,
});

export function GameProvider({ children }: { children: JSX.Element }) {
  const [fen, setFen] = useState(
    '8/8/6k1/5p2/8/8/K7/5R2 w - - 2 2'
    // 'r5rk/1pp1qpn1/p2p3p/3P4/2PQNP1b/1P3B1P/P6K/5RR1 w - - 0 31'
  );
  const game = useRef(new Chess());
  const [aiType, setAiType] = useState(AiType.D0);

  game.current.load(fen);

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

  function findAiMove() {
    if (!game.current.moves()) return undefined;
    console.log('ai thinking...');
    let started = Date.now();
    let move: string | undefined = undefined;
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
    return move;
  }

  function makeAiMove() {
    const move = findAiMove();
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
        findAiMove,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  return useContext(GameContext);
}
