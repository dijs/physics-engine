import { Chess } from 'chess.js';
import { getBoardEvaluation } from './evals';

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
    let best = -Infinity;
    for (let move of chess.moves()) {
      chess.move(move);
      const score = abMinMax(chess, depth - 1, false, alpha, beta);
      chess.undo();
      best = Math.max(best, score);
      if (best > beta) {
        break;
      }
      alpha = Math.max(alpha, best);
    }
    return best;
  } else {
    let best = Infinity;
    for (let move of chess.moves()) {
      chess.move(move);
      const score = abMinMax(chess, depth - 1, true, alpha, beta);
      chess.undo();
      best = Math.min(best, score);
      if (best < alpha) {
        break;
      }
      beta = Math.min(beta, best);
    }
    return best;
  }
}
