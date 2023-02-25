import { Chess } from 'chess.js';

export default function randomMove(game: Chess) {
  const moves = game.moves();
  return moves[Math.floor(Math.random() * moves.length)];
}
