import { Chess, Square } from 'chess.js';

type Dictionary = { [index: string]: number };

const PAWN = 'p';
const KNIGHT = 'n';
const BISHOP = 'b';
const ROOK = 'r';
const QUEEN = 'q';
const KING = 'k';

const WHITE = 'w';
const BLACK = 'b';

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

export const opp = (color: string) => (color === WHITE ? BLACK : WHITE);

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
  if (move.includes('#')) return 1000;
  if (move.includes('+')) return 500;
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

function getMaterialScore(chess: Chess, color: string) {
  let material = 0;
  // raw board access
  for (let i = 0; i <= 119; i++) {
    const p = chess['_board'][i];
    if (p) {
      const score = PieceScores[p.type];
      if (p.color === color) {
        material += score;
      } else {
        material -= score;
      }
    }
    if ((i + 1) & 0x88) {
      i += 8;
    }
  }
  return material;
}

export function getBoardEvaluation(chess: Chess, color: string) {
  let score = getMaterialScore(chess, color);

  // TODO: I should test the mobility of all the pieces

  // if (chess.isCheck()) {
  //   if (chess.isCheckmate()) {
  //     score += 1000;
  //   } else {
  //     score += 500;
  //   }
  // }

  return score;
}
