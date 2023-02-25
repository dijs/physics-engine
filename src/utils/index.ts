import { Chess } from 'chess.js';
import abMinMax from './abMinMax';
import { getMoveScore } from './evals';
import minMax from './minMax';

export function findMaxMove(chess: Chess, depth: number) {
  let bestScore = -Infinity;
  let bestMove = undefined;

  const moves = chess.moves();

  // Sort before searching
  // moves.sort((a, b) => Math.random() - 0.5);
  // moves.sort((a, b) => getMoveScore(chess, b) - getMoveScore(chess, a));

  console.log('Moves are', moves);

  for (const move of moves) {
    chess.move(move);
    const score = abMinMax(chess, depth);
    // const score = minMax(chess, depth);
    chess.undo();
    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
      console.log('New best move is', bestMove, 'with score', bestScore);
    }
  }

  console.log('Best move is', bestMove, 'with score', bestScore);
  return bestMove;
}

export function getRandomMove(chess: Chess) {
  const possibleMoves = chess.moves();
  if (chess.isGameOver() || chess.isDraw() || possibleMoves.length === 0) {
    return undefined; // exit if the game is over
  }
  const randomIndex = Math.floor(Math.random() * possibleMoves.length);
  return possibleMoves[randomIndex];
}
