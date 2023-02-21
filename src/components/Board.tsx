import { Square } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { useGame } from './Game';

export default function Board() {
  const { fen, makeMove, makeAiMove } = useGame();

  function onDrop(sourceSquare: Square, targetSquare: Square): boolean {
    const valid = makeMove({
      from: sourceSquare,
      to: targetSquare,
    });
    if (valid) {
      setTimeout(() => makeAiMove(), 10);
    }
    return valid;
  }

  return <Chessboard position={fen} onPieceDrop={onDrop} />;
}
