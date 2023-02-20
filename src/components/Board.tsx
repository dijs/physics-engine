import { useRef, useState } from 'react';
import { Chess, Piece, Square } from 'chess.js';
import { Chessboard } from 'react-chessboard';

export default function Board() {
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
      return; // exit if the game is over
    }
    const randomIndex = Math.floor(Math.random() * possibleMoves.length);
    makeMove(possibleMoves[randomIndex]);
  }

  function onDrop(sourceSquare: Square, targetSquare: Square): boolean {
    const valid = makeMove({
      from: sourceSquare,
      to: targetSquare,
    });

    if (valid) {
      setTimeout(() => makeRandomMove(), 0);
    }

    return valid;
  }

  return <Chessboard position={fen} onPieceDrop={onDrop} />;
}
