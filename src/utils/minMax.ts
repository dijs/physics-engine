import { Chess } from 'chess.js';
import { getBoardEvaluation } from './evals';

export default function minMax(
  chess: Chess,
  depth: number,
  isMaximizing: boolean = true
) {
  if (depth === 0) {
    return getBoardEvaluation(chess);
  }

  let min = Infinity;
  let max = -Infinity;

  for (let move of chess.moves()) {
    chess.move(move);
    const score = minMax(chess, depth - 1, !isMaximizing);

    max = Math.max(max, score);
    min = Math.min(min, score);

    chess.undo();
  }
  return isMaximizing ? max : min;
}
