
import { Chess, Square } from "chess.js";

type Dictionary = { [index: string]: number }

const PAWN = 'p';
const KNIGHT = 'n';
const BISHOP = 'b';
const ROOK = 'r';
const QUEEN = 'q';
const KING = 'k';

const PieceScores: Dictionary = {
  [PAWN]: 1,
  [KNIGHT]: 3,
  [BISHOP]: 3,
  [ROOK]: 5,
  [QUEEN]: 9,
  [KING]: 0,
};

function strippedSan(move: string) {
  return move.replace(/=/, '').replace(/[+#]?[?!]*$/, '');
}

function inferPieceType(san: string): string | undefined {
  let pieceType = san.charAt(0);
  if (pieceType >= 'a' && pieceType <= 'h') {
    const matches = san.match(/[a-h]\d.*[a-h]\d/);
    if (matches) {
      return undefined;
    }
    return PAWN;
  }
  pieceType = pieceType.toLowerCase();
  if (pieceType === 'o') {
    return KING;
  }
  return pieceType;
}

function getMoveScore(chess: Chess, move: string) {
  if (move.includes('x')) {
    const cleanMove = strippedSan(move);
    const squareTaken = cleanMove.split('x')[1] as Square;
    let type: string | undefined;
    try {
      type = inferPieceType(chess.get(squareTaken).type);
    } catch (err) {
      return -1;
    }
    if (type) {
    return PieceScores[type];
    }
  }
  return 0;
}


export function minMax(chess: Chess, value: number, depth: number, maximizing:boolean, alpha = -Infinity, beta = Infinity) {
  if (depth === 0) {
    return value;
  }
  let maxValue = -Infinity;
  let minValue = Infinity;
  for (const move of chess.moves()) {
    const score = getMoveScore(chess, move);
    chess.move(move);
    const result = minMax(
      chess,
      maximizing ? value + score : value - score,
      depth - 1,
      !maximizing,
      alpha,
      beta
    );
    chess.undo();
    maxValue = Math.max(maxValue, result);
    minValue = Math.min(minValue, result);
    // Add some alpha beta pruning
    if (maximizing) {
      alpha = Math.max(alpha, maxValue);
    } else {
      beta = Math.min(beta, minValue);
    }
    if (beta <= alpha) {
      break;
    }
  }
  return maxValue;
}

export function findMaxMove(chess: Chess, depth = 2) {
  let bestScore = -Infinity;
  let bestMove = null;
  for (const move of chess.moves()) {
    chess.move(move);
    const score = minMax(chess, getMoveScore(chess, move), depth, false);
    chess.undo();
    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }
  console.log('Best move is', bestMove, 'with score', bestScore);
  return bestMove;
}

export function getRandomMove(chess: Chess) {
  const possibleMoves = chess.moves();
  return possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
}

// const MoveFinders = {
//   random: getRandomMove,
//   d0: () => findMaxMove(0),
//   d1: () => findMaxMove(1),
//   d2: () => findMaxMove(2),
//   d3: () => findMaxMove(3),
// };

// const wins = {
//   w: 0,
//   b: 0,
// };

// const times = {
//   w: 0,
//   b: 0,
// };

// function playMatch(depth) {
//   chess.reset();
//   let moveCount = 0;
//   while (!chess.isGameOver()) {
//     let started = Date.now();
//     const player = chess.turn();
//     if (player === 'w') {
//       chess.move(MoveFinders.random());
//     } else {
//       chess.move(findMaxMove(depth));
//     }
//     let took = Date.now() - started;
//     times[player] += took;
//     console.log(player, 'took', took, 'ms');
//     moveCount++;
//     console.log(chess.ascii());
//   }

//   console.log('Average White Move took', times.w / moveCount / 2, 'ms');
//   console.log('Average Black Move took', times.b / moveCount / 2, 'ms');

//   console.log(
//     'Game over in',
//     moveCount,
//     'moves',
//     {
//       winner: chess.turn(),
//       isCheckmate: chess.isCheckmate(),
//       isStalemate: chess.isStalemate(),
//       isDraw: chess.isDraw(),
//     },
//     '\n'
//   );

//   if (chess.isCheckmate()) {
//     wins[chess.turn()]++;
//   }
// }

