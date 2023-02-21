import { Chess, Square } from 'chess.js';

type Dictionary = { [index: string]: number };

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
  [KING]: 200,
};

function strippedSan(move: string) {
  return move.replace(/=/, '').replace(/[+#]?[?!]*$/, '');
}

function getPieceCounts(chess: Chess, color: string) {
  const board = chess.board();
  const counts: { [index: string]: number } = {
    b: 0,
    k: 0,
    n: 0,
    p: 0,
    q: 0,
    r: 0,
  };
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.color === color) {
        counts[piece.type]++;
      }
    }
  }
  return counts;
}

const opp = (color: string) => (color === 'w' ? 'b' : 'w');

// Source: https://www.chessprogramming.org/Evaluation
// Uses both material and mobility to determine the score of the board
export function getBoardScore(chess: Chess, color: string) {
  const pCounts = getPieceCounts(chess, color);
  const oCounts = getPieceCounts(chess, opp(color));

  let material = 0;

  for (let type in pCounts) {
    material += PieceScores[type] * (pCounts[type] - oCounts[type]);
  }

  const mobility = chess.moves().length * 0.1;

  return material + mobility;
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

// function getMoveScore(chess: Chess, color: string) {
//   return getBoardScore(chess, color);
// if (move.includes('x')) {
//   const cleanMove = strippedSan(move);
//   const squareTaken = cleanMove.split('x')[1] as Square;
//   let type: string | undefined;
//   try {
//     type = inferPieceType(chess.get(squareTaken).type);
//   } catch (err) {
//     return -1;
//   }
//   if (type) {
//     return PieceScores[type];
//   }
// }
// return 0;
// }

function negaMax(chess: Chess, depth: number) {
  if (depth === 0) {
    return getBoardScore(chess, opp(chess.turn()));
  }
  let max = -Infinity;
  for (let move of chess.moves()) {
    chess.move(move);
    const score = -negaMax(chess, depth - 1);
    chess.undo();
    if (score > max) {
      max = score;
    }
  }
  return max;
}

function negaMaxWithAlphaBeta(
  chess: Chess,
  depth: number,
  alpha: number = -Infinity,
  beta: number = Infinity
): number {
  let best = -Infinity;
  // if( depth == 0 ) return quiesce( alpha, beta );
  if (depth === 0) {
    return getBoardScore(chess, opp(chess.turn()));
  }
  for (let move of chess.moves()) {
    chess.move(move);
    const score = -negaMaxWithAlphaBeta(chess, depth - 1, -beta, -alpha);
    chess.undo();
    if (score >= beta) return score; // fail-soft beta-cutoff
    if (score > best) {
      best = score;
      if (score > alpha) alpha = score; // alpha acts like max in MiniMax
    }
  }
  return best;
}

export function minMax(
  chess: Chess,
  value: number,
  depth: number,
  maximizing: boolean,
  alpha = -Infinity,
  beta = Infinity
) {
  if (depth === 0) {
    return value;
  }
  let maxValue = -Infinity;
  let minValue = Infinity;
  for (const move of chess.moves()) {
    chess.move(move);
    const score = getBoardScore(chess, opp(chess.turn()));

    const result = minMax(
      chess,
      maximizing ? score : -score,
      // maximizing ? value + score : value - score,
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

export function findMaxMove(chess: Chess, depth: number) {
  let bestScore = -Infinity;
  let bestMove = undefined;
  for (const move of chess.moves()) {
    // const color = chess.turn();
    chess.move(move);
    const score = negaMaxWithAlphaBeta(chess, depth);
    // const score = negaMax(chess, depth);
    // const initialScore = getBoardScore(chess, chess.turn() === 'b' ? 'w' : 'b');
    // const score = minMax(chess, -Infinity, depth, false);
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
  if (chess.isGameOver() || chess.isDraw() || possibleMoves.length === 0) {
    return undefined; // exit if the game is over
  }
  const randomIndex = Math.floor(Math.random() * possibleMoves.length);
  return possibleMoves[randomIndex];
}
