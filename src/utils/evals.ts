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

export function getMoveScore(chess: Chess, move: string) {
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

export function getBoardEvaluation(chess: Chess) {
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
