import React from 'react';
import type { GameState } from '../types/chess';

interface GameStatusProps {
  gameState: GameState;
}

export const GameStatus: React.FC<GameStatusProps> = ({ gameState }) => {
  const getStatusMessage = () => {
    if (gameState.isCheckmate) {
      const winner = gameState.currentPlayer === 'white' ? 'Black' : 'White';
      return `Checkmate! ${winner} wins!`;
    }
    
    if (gameState.isStalemate) {
      return 'Stalemate! The game is a draw.';
    }
    
    if (gameState.isCheck) {
      return `${gameState.currentPlayer === 'white' ? 'White' : 'Black'} is in check!`;
    }
    
    return `${gameState.currentPlayer === 'white' ? 'White' : 'Black'} to move`;
  };
  
  return (
    <div className="bg-gray-100 p-4 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-2">Game Status</h2>
      <p className="text-lg">{getStatusMessage()}</p>
      <div className="mt-2 text-sm text-gray-600">
        <p>Move: {gameState.fullMoveNumber}</p>
        <p>Half-move clock: {gameState.halfMoveClock}</p>
      </div>
    </div>
  );
};