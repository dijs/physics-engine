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

  // const mobility = chess.moves().length * 0.1;

  return material;
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

function pvs(
  chess: Chess,
  depth: number,
  // color: string,
  isMaximizing: boolean
  // alpha: number = -Infinity,
  // beta: number = Infinity,
) {
  searched++;
  // if (depth === 0 || chess.isGameOver()) {
  if (depth === 0) {
    return getBoardEvaluation(chess);
  }

  let min = Infinity;
  let max = -Infinity;

  for (let move of chess.moves()) {
    chess.move(move);
    const score = pvs(
      chess,
      depth - 1,
      // opp(color),
      !isMaximizing
      // -beta,
      // -alpha,
    );
    max = Math.max(max, score);
    min = Math.min(min, score);
    chess.undo();
  }
  return isMaximizing ? max : min;
}

// function negaMax(chess: Chess, depth: number) {
//   if (depth === 0) {
//     return getBoardScore(chess, opp(chess.turn()));
//   }
//   let max = -Infinity;
//   for (let move of chess.moves()) {
//     chess.move(move);
//     const score = -negaMax(chess, depth - 1);
//     chess.undo();
//     if (score > max) {
//       max = score;
//     }
//   }
//   return max;
// }

// let lastBoard = '';

function getBoardEvaluation(chess: Chess) {
  // const lastBoard = chess.ascii();

  const board = chess.board();
  let material = 0;
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece) {
        const score = PieceScores[piece.type];
        if (piece.color === 'w') {
          material += score;
        } else {
          material -= score;
        }
      }
    }
  }

  // console.log(lastBoard, '\nRelative Score:', material, 'for', color);

  return material;
}

// function negaMaxWithAlphaBeta(
//   chess: Chess,
//   depth: number,
//   currentPlayer: string,
//   ogPlayer: string
//   // alpha: number = -Infinity,
//   // beta: number = Infinity
// ): number {
//   searched++;
//   if (depth === 0) {
//     return getBoardEvaluation(chess, ogPlayer);
//   }
//   let best = -Infinity;
//   for (let move of chess.moves()) {
//     chess.move(move);
//     const score = -negaMaxWithAlphaBeta(
//       chess,
//       depth - 1,
//       opp(currentPlayer),
//       ogPlayer
//     );
//     // const score = -negaMaxWithAlphaBeta(chess, depth - 1, -beta, -alpha);
//     chess.undo();
//     // if (score >= beta) return score; // fail-soft beta-cutoff
//     if (score > best) {
//       best = score;
//       //   if (score > alpha) alpha = score; // alpha acts like max in MiniMax
//     }
//   }
//   return best;
// }

let searched = 0;

export function findMaxMove(chess: Chess, depth: number) {
  let bestScore = -Infinity;
  let bestMove = undefined;
  searched = 0;

  let moves = chess.moves();

  // Sort before searching
  moves.sort((a, b) => getMoveScore(chess, b) - getMoveScore(chess, a));

  // console.log('Moves are', moves);

  const color = chess.turn();

  for (const move of moves) {
    chess.move(move);
    const score = pvs(chess, depth, false);
    chess.undo();
    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
      console.log('New best move is', bestMove, 'with score', bestScore);
    }
  }

  console.log(
    'Best move is',
    bestMove,
    'with score',
    bestScore,
    'after searching',
    searched,
    'nodes'
  );
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
