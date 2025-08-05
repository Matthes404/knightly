import type { Board, Piece, Position, Move, GameState, PieceColor, PieceType } from '../types/chess';

export const createInitialBoard = (): Board => {
  const board: Board = Array(8).fill(null).map(() => Array(8).fill(null));
  
  // Place pawns - white at row 1, black at row 6
  for (let col = 0; col < 8; col++) {
    board[1][col] = { type: 'pawn', color: 'white' };
    board[6][col] = { type: 'pawn', color: 'black' };
  }
  
  // Place other pieces - white at row 0, black at row 7
  const pieceOrder: PieceType[] = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];
  
  for (let col = 0; col < 8; col++) {
    board[0][col] = { type: pieceOrder[col], color: 'white' };
    board[7][col] = { type: pieceOrder[col], color: 'black' };
  }
  
  return board;
};

export const createInitialGameState = (): GameState => ({
  board: createInitialBoard(),
  currentPlayer: 'white',
  moveHistory: [],
  isCheck: false,
  isCheckmate: false,
  isStalemate: false,
  canCastleKingSide: { white: true, black: true },
  canCastleQueenSide: { white: true, black: true },
  enPassantTarget: null,
  halfMoveClock: 0,
  fullMoveNumber: 1,
});

export const isValidPosition = (pos: Position): boolean => {
  return pos.row >= 0 && pos.row < 8 && pos.col >= 0 && pos.col < 8;
};

export const getPieceAt = (board: Board, pos: Position): Piece | null => {
  if (!isValidPosition(pos)) return null;
  return board[pos.row][pos.col];
};

export const setPieceAt = (board: Board, pos: Position, piece: Piece | null): Board => {
  const newBoard = board.map(row => [...row]);
  if (isValidPosition(pos)) {
    newBoard[pos.row][pos.col] = piece;
  }
  return newBoard;
};

export const getKingPosition = (board: Board, color: PieceColor): Position | null => {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.type === 'king' && piece.color === color) {
        return { row, col };
      }
    }
  }
  return null;
};

export const isSquareAttacked = (board: Board, pos: Position, byColor: PieceColor): boolean => {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.color === byColor) {
        const moves = getPossibleMoves(board, { row, col }, piece);
        if (moves.some(move => move.to.row === pos.row && move.to.col === pos.col)) {
          return true;
        }
      }
    }
  }
  return false;
};

export const isInCheck = (board: Board, color: PieceColor): boolean => {
  const kingPos = getKingPosition(board, color);
  if (!kingPos) return false;
  return isSquareAttacked(board, kingPos, color === 'white' ? 'black' : 'white');
};

export const getPossibleMoves = (board: Board, from: Position, piece: Piece): Move[] => {
  const moves: Move[] = [];
  
  switch (piece.type) {
    case 'pawn':
      moves.push(...getPawnMoves(board, from, piece));
      break;
    case 'rook':
      moves.push(...getRookMoves(board, from, piece));
      break;
    case 'knight':
      moves.push(...getKnightMoves(board, from, piece));
      break;
    case 'bishop':
      moves.push(...getBishopMoves(board, from, piece));
      break;
    case 'queen':
      moves.push(...getQueenMoves(board, from, piece));
      break;
    case 'king':
      moves.push(...getKingMoves(board, from, piece));
      break;
  }
  
  return moves;
};

const getPawnMoves = (board: Board, from: Position, piece: Piece): Move[] => {
  const moves: Move[] = [];
  const direction = piece.color === 'white' ? 1 : -1;
  const startRow = piece.color === 'white' ? 1 : 6;
  
  // Forward move
  const oneStep = { row: from.row + direction, col: from.col };
  if (isValidPosition(oneStep) && !getPieceAt(board, oneStep)) {
    moves.push({ from, to: oneStep, piece });
    
    // Two-step move from starting position
    if (from.row === startRow) {
      const twoStep = { row: from.row + 2 * direction, col: from.col };
      if (isValidPosition(twoStep) && !getPieceAt(board, twoStep)) {
        moves.push({ from, to: twoStep, piece });
      }
    }
  }
  
  // Capture moves
  const capturePositions = [
    { row: from.row + direction, col: from.col - 1 },
    { row: from.row + direction, col: from.col + 1 }
  ];
  
  for (const pos of capturePositions) {
    if (isValidPosition(pos)) {
      const targetPiece = getPieceAt(board, pos);
      if (targetPiece && targetPiece.color !== piece.color) {
        moves.push({ from, to: pos, piece, capturedPiece: targetPiece });
      }
    }
  }
  
  return moves;
};

const getRookMoves = (board: Board, from: Position, piece: Piece): Move[] => {
  const moves: Move[] = [];
  const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
  
  for (const [dRow, dCol] of directions) {
    for (let i = 1; i < 8; i++) {
      const to = { row: from.row + i * dRow, col: from.col + i * dCol };
      if (!isValidPosition(to)) break;
      
      const targetPiece = getPieceAt(board, to);
      if (!targetPiece) {
        moves.push({ from, to, piece });
      } else {
        if (targetPiece.color !== piece.color) {
          moves.push({ from, to, piece, capturedPiece: targetPiece || undefined });
        }
        break;
      }
    }
  }
  
  return moves;
};

const getKnightMoves = (board: Board, from: Position, piece: Piece): Move[] => {
  const moves: Move[] = [];
  const knightMoves = [
    [-2, -1], [-2, 1], [-1, -2], [-1, 2],
    [1, -2], [1, 2], [2, -1], [2, 1]
  ];
  
  for (const [dRow, dCol] of knightMoves) {
    const to = { row: from.row + dRow, col: from.col + dCol };
    if (isValidPosition(to)) {
      const targetPiece = getPieceAt(board, to);
      if (!targetPiece || targetPiece.color !== piece.color) {
        moves.push({ from, to, piece, capturedPiece: targetPiece || undefined });
      }
    }
  }
  
  return moves;
};

const getBishopMoves = (board: Board, from: Position, piece: Piece): Move[] => {
  const moves: Move[] = [];
  const directions = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
  
  for (const [dRow, dCol] of directions) {
    for (let i = 1; i < 8; i++) {
      const to = { row: from.row + i * dRow, col: from.col + i * dCol };
      if (!isValidPosition(to)) break;
      
      const targetPiece = getPieceAt(board, to);
      if (!targetPiece) {
        moves.push({ from, to, piece });
      } else {
        if (targetPiece.color !== piece.color) {
          moves.push({ from, to, piece, capturedPiece: targetPiece || undefined });
        }
        break;
      }
    }
  }
  
  return moves;
};

const getQueenMoves = (board: Board, from: Position, piece: Piece): Move[] => {
  return [...getRookMoves(board, from, piece), ...getBishopMoves(board, from, piece)];
};

const getKingMoves = (board: Board, from: Position, piece: Piece): Move[] => {
  const moves: Move[] = [];
  const directions = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1],           [0, 1],
    [1, -1],  [1, 0],  [1, 1]
  ];
  
  for (const [dRow, dCol] of directions) {
    const to = { row: from.row + dRow, col: from.col + dCol };
    if (isValidPosition(to)) {
      const targetPiece = getPieceAt(board, to);
      if (!targetPiece || targetPiece.color !== piece.color) {
        moves.push({ from, to, piece, capturedPiece: targetPiece || undefined });
      }
    }
  }
  
  return moves;
};

export const isValidMove = (gameState: GameState, move: Move): boolean => {
  const { board, currentPlayer } = gameState;
  const piece = getPieceAt(board, move.from);
  
  if (!piece || piece.color !== currentPlayer) return false;
  
  const possibleMoves = getPossibleMoves(board, move.from, piece);
  const moveExists = possibleMoves.some(
    m => m.to.row === move.to.row && m.to.col === move.to.col
  );
  
  if (!moveExists) return false;
  
  // Check if move would leave king in check
  const newBoard = makeMove(board, move);
  return !isInCheck(newBoard, currentPlayer);
};

export const makeMove = (board: Board, move: Move): Board => {
  let newBoard = setPieceAt(board, move.from, null);
  newBoard = setPieceAt(newBoard, move.to, move.piece);
  return newBoard;
};

export const positionToString = (pos: Position): string => {
  return String.fromCharCode(97 + pos.col) + (8 - pos.row);
};

export const stringToPosition = (str: string): Position => {
  return {
    col: str.charCodeAt(0) - 97,
    row: 8 - parseInt(str[1])
  };
};