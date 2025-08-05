import React, { useState } from 'react';
import type { Piece, Position, GameState } from '../types/chess';
import { getPossibleMoves, isValidMove } from '../utils/chessLogic';

interface ChessBoardProps {
  gameState: GameState;
  onMove: (from: Position, to: Position) => void;
}

const PIECE_SYMBOLS: Record<string, string> = {
  'white-king': '♔',
  'white-queen': '♕',
  'white-rook': '♖',
  'white-bishop': '♗',
  'white-knight': '♘',
  'white-pawn': '♙',
  'black-king': '♚',
  'black-queen': '♛',
  'black-rook': '♜',
  'black-bishop': '♝',
  'black-knight': '♞',
  'black-pawn': '♟',
};

const Square: React.FC<{
  piece: Piece | null;
  position: Position;
  isSelected: boolean;
  isValidMove: boolean;
  onClick: () => void;
}> = ({ piece, position, isSelected, isValidMove, onClick }) => {
  const isLight = (position.row + position.col) % 2 === 0;
  
  let bgColor = isLight ? 'bg-amber-100' : 'bg-amber-800';
  if (isSelected) {
    bgColor = 'bg-yellow-400';
  } else if (isValidMove) {
    bgColor = isLight ? 'bg-green-200' : 'bg-green-600';
  }
  
  const pieceSymbol = piece ? PIECE_SYMBOLS[`${piece.color}-${piece.type}`] : '';
  
  return (
    <div
      className={`w-16 h-16 flex items-center justify-center cursor-pointer text-4xl select-none ${bgColor} hover:opacity-80`}
      onClick={onClick}
    >
      {pieceSymbol}
    </div>
  );
};

export const ChessBoard: React.FC<ChessBoardProps> = ({ gameState, onMove }) => {
  const [selectedSquare, setSelectedSquare] = useState<Position | null>(null);
  const [validMoves, setValidMoves] = useState<Position[]>([]);
  
  const handleSquareClick = (position: Position) => {
    if (selectedSquare) {
      // If clicking on the same square, deselect
      if (selectedSquare.row === position.row && selectedSquare.col === position.col) {
        setSelectedSquare(null);
        setValidMoves([]);
        return;
      }
      
      // If clicking on a valid move, make the move
      const isValidMoveTarget = validMoves.some(
        move => move.row === position.row && move.col === position.col
      );
      
      if (isValidMoveTarget) {
        onMove(selectedSquare, position);
        setSelectedSquare(null);
        setValidMoves([]);
        return;
      }
    }
    
    // Select new square if it has a piece of the current player
    const piece = gameState.board[position.row][position.col];
    if (piece && piece.color === gameState.currentPlayer) {
      setSelectedSquare(position);
      
      // Calculate valid moves for this piece
      const possibleMoves = getPossibleMoves(gameState.board, position, piece);
      const validMovePositions = possibleMoves
        .filter(move => isValidMove(gameState, move))
        .map(move => move.to);
      
      setValidMoves(validMovePositions);
    } else {
      setSelectedSquare(null);
      setValidMoves([]);
    }
  };
  
  return (
    <div className="inline-block border-2 border-gray-800">
      {gameState.board.map((row, rowIndex) => (
        <div key={rowIndex} className="flex">
          {row.map((piece, colIndex) => {
            const position = { row: rowIndex, col: colIndex };
            const isSelected = selectedSquare?.row === rowIndex && selectedSquare?.col === colIndex;
            const isValidMoveTarget = validMoves.some(
              move => move.row === rowIndex && move.col === colIndex
            );
            
            return (
              <Square
                key={`${rowIndex}-${colIndex}`}
                piece={piece}
                position={position}
                isSelected={isSelected}
                isValidMove={isValidMoveTarget}
                onClick={() => handleSquareClick(position)}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
};