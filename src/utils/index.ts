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

// Uses both material and mobility to determine the score of the board
export function getBoardScore(chess: Chess, color: string) {
  // console.log(chess.board());
  const pCounts = getPieceCounts(chess, color);
  const oCounts = getPieceCounts(chess, color === 'w' ? 'b' : 'w');

  let score = 0;

  for (let type in pCounts) {
    score += PieceScores[type] * (pCounts[type] - oCounts[type]);
  }

  // 0.5 *
  // (pCounts.d - oCounts.d + pCounts.s - oCounts.s + pCounts.i - oCounts.i) +
  // 0.1 * (pCounts.m - oCounts.m);

  return score;

  // 200(K-K')
  //      + 9(Q-Q')
  //      + 5(R-R')
  //      + 3(B-B' + N-N')
  //      + 1(P-P')
  //      - 0.5(D-D' + S-S' + I-I')
  //      + 0.1(M-M') +
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
  let bestMove = undefined;
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
  if (chess.isGameOver() || chess.isDraw() || possibleMoves.length === 0) {
    return undefined; // exit if the game is over
  }
  const randomIndex = Math.floor(Math.random() * possibleMoves.length);
  return possibleMoves[randomIndex];
}
