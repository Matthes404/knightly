import { useState } from 'react';
import { ChessBoard } from './components/ChessBoard';
import { GameStatus } from './components/GameStatus';
import { createInitialGameState, isValidMove, makeMove } from './utils/chessLogic';
import type { GameState, Position, Move } from './types/chess';

function App() {
  const [gameState, setGameState] = useState<GameState>(createInitialGameState());

  const handleMove = (from: Position, to: Position) => {
    const piece = gameState.board[from.row][from.col];
    if (!piece) return;

    const move: Move = { from, to, piece };
    
    if (isValidMove(gameState, move)) {
      const newBoard = makeMove(gameState.board, move);
      const nextPlayer = gameState.currentPlayer === 'white' ? 'black' : 'white';
      
      setGameState(prevState => ({
        ...prevState,
        board: newBoard,
        currentPlayer: nextPlayer,
        moveHistory: [...prevState.moveHistory, move],
        fullMoveNumber: nextPlayer === 'white' ? prevState.fullMoveNumber + 1 : prevState.fullMoveNumber,
      }));
    }
  };

  const resetGame = () => {
    setGameState(createInitialGameState());
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          Chess Game
        </h1>
        
        <div className="flex flex-col lg:flex-row items-start justify-center gap-8">
          <div className="flex flex-col items-center">
            <ChessBoard gameState={gameState} onMove={handleMove} />
            <button
              onClick={resetGame}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              New Game
            </button>
          </div>
          
          <div className="w-full lg:w-80">
            <GameStatus gameState={gameState} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
