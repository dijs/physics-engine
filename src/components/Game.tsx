import { Chess, Square } from 'chess.js';
import { createContext, useContext, useRef, useState } from 'react';
import { findMaxMove, getRandomMove } from 'src/utils';
import abMinMax from 'src/utils/abMinMax';

type Move = string | { from: Square; to: Square };

type GameContextType = {
  game: Chess;
  fen: string;
  depth: number;
  makeMove: (move: Move) => boolean;
  makeRandomMove: () => boolean;
  findAiMove: () => string | undefined;
  makeAiMove: () => boolean;
  setDepth: (value: number) => void;
};

export const GameContext = createContext<GameContextType>({
  game: new Chess(),
  fen: '',
  depth: 0,
  makeMove: () => false,
  makeRandomMove: () => false,
  findAiMove: () => '',
  makeAiMove: () => false,
  setDepth: () => false,
});

export function GameProvider({ children }: { children: JSX.Element }) {
  // TODO: Answer should be Bg5 - mate in 2
  const [fen, setFen] = useState('8/2R1BB2/8/4k3/8/2K2P2/8/8 w - - 0 1');

  // Bg5 > Kf5 > Rc5#

  const game = useRef(new Chess());
  const [depth, setDepth] = useState(1);

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
    // const move = findMaxMove(game.current, depth);
    const move = abMinMax(game.current, depth);
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
        depth,
        setDepth,
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
