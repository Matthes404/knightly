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
  
  let bgColor = isLight ? 'bg-stone-200' : 'bg-stone-700';
  let textColor = 'text-gray-800';
  
  if (isSelected) {
    bgColor = 'bg-yellow-400';
    textColor = 'text-gray-900';
  } else if (isValidMove) {
    bgColor = isLight ? 'bg-green-300' : 'bg-green-600';
    textColor = isLight ? 'text-gray-900' : 'text-white';
  }
  
  const pieceSymbol = piece ? PIECE_SYMBOLS[`${piece.color}-${piece.type}`] : '';
  
  return (
    <div
      className={`w-20 h-20 flex items-center justify-center cursor-pointer text-5xl select-none transition-colors ${bgColor} ${textColor} hover:opacity-80 border-0`}
      onClick={onClick}
    >
      {isValidMove && !piece && (
        <div className="w-8 h-8 bg-current opacity-50 rounded-full"></div>
      )}
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
  
  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];

  return (
    <div className="inline-block">
      {/* Top file labels */}
      <div className="flex">
        <div className="w-10"></div> {/* Empty corner */}
        {files.map(file => (
          <div key={file} className="w-20 h-10 flex items-center justify-center text-base font-medium text-gray-600">
            {file}
          </div>
        ))}
        <div className="w-10"></div> {/* Empty corner */}
      </div>
      
      <div className="flex">
        {/* Left rank labels */}
        <div className="w-10 flex flex-col">
          {ranks.map(rank => (
            <div key={rank} className="w-10 h-20 flex items-center justify-center text-base font-medium text-gray-600">
              {rank}
            </div>
          ))}
        </div>
        
        {/* Chess board */}
        <div className="border-2 border-gray-800">
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
        
        {/* Right rank labels */}
        <div className="w-10 flex flex-col">
          {ranks.map(rank => (
            <div key={rank} className="w-10 h-20 flex items-center justify-center text-base font-medium text-gray-600">
              {rank}
            </div>
          ))}
        </div>
      </div>
      
      {/* Bottom file labels */}
      <div className="flex">
        <div className="w-10"></div> {/* Empty corner */}
        {files.map(file => (
          <div key={file} className="w-20 h-10 flex items-center justify-center text-base font-medium text-gray-600">
            {file}
          </div>
        ))}
        <div className="w-10"></div> {/* Empty corner */}
      </div>
    </div>
  );
};