import { Chess } from 'chess.js';
import { getBoardEvaluation, getMoveScore, opp } from './evals';

export default function abMinMaxRoot(
  game: Chess,
  depth: number,
  isMaximizing: boolean = true
) {
  let bestMove = -Infinity;
  let bestMoveFound;
  let moves = game.moves();

  moves = moves.sort((a, b) => getMoveScore(game, b) - getMoveScore(game, a));

  console.log(moves);

  for (let move of moves) {
    game.move(move);
    const value = abMinMax(game, depth - 1, !isMaximizing);
    game.undo();
    if (value >= bestMove) {
      bestMove = value;
      bestMoveFound = move;
    }
  }
  return bestMoveFound;
}

function abMinMax(
  chess: Chess,
  depth: number,
  isMaximizing: boolean,
  alpha: number = -Infinity,
  beta: number = Infinity
): number {
  if (depth === 0) {
    return getBoardEvaluation(chess, opp(chess.turn()));
  }
  const moves = chess.moves();
  if (isMaximizing) {
    let max = -Infinity;
    for (let move of moves) {
      chess.move(move);
      const score = abMinMax(chess, depth - 1, false, alpha, beta);
      chess.undo();
      max = Math.max(max, score);
      alpha = Math.max(alpha, max);
      if (alpha >= beta) {
        return max;
      }
    }
    return max;
  } else {
    let min = Infinity;
    for (let move of moves) {
      chess.move(move);
      const score = abMinMax(chess, depth - 1, true, alpha, beta);
      chess.undo();
      min = Math.min(min, score);
      beta = Math.min(beta, min);
      if (alpha >= beta) {
        return min;
      }
    }
    return min;
  }
}
