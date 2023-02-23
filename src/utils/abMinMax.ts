import { Chess } from 'chess.js';
import { getBoardEvaluation } from './evals';

// Fail soft
export default function abMinMax(
  chess: Chess,
  depth: number,
  isMaximizing: boolean = true,
  alpha: number = -Infinity,
  beta: number = Infinity
): number {
  if (depth === 0) {
    return getBoardEvaluation(chess);
  }
  if (isMaximizing) {
    let max = -Infinity;
    for (let move of chess.moves()) {
      chess.move(move);
      const score = abMinMax(chess, depth - 1, false, alpha, beta);
      chess.undo();
      max = Math.max(max, score);
      alpha = Math.max(alpha, max);
      if (max >= beta) {
        break;
      }
    }
    return max;
  } else {
    let min = Infinity;
    for (let move of chess.moves()) {
      chess.move(move);
      const score = abMinMax(chess, depth - 1, true, alpha, beta);
      chess.undo();
      min = Math.min(min, score);
      beta = Math.min(beta, min);
      if (min <= alpha) {
        break;
      }
    }
    return min;
  }
}
