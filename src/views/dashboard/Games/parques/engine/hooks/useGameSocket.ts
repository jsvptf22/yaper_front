import { useCallback, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import type { DiceRoll, GameState, Move, Player } from '../types';

const SOCKET_BASE = import.meta.env.VITE_SOCKET_URL || `http://${window.location.hostname}:9000`;
const SOCKET_URL = `${SOCKET_BASE}/parques`;
const STORAGE_KEY = 'parques_game_state';

interface StoredGameData {
  gameId: string;
  playerName: string;
  playerId: string; // actual userId (not socket id)
}

const saveGameData = (data: StoredGameData) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving game data:', error);
  }
};

const loadGameData = (): StoredGameData | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Error loading game data:', error);
    return null;
  }
};

const clearGameData = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing game data:', error);
  }
};

export const useGameSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [diceRoll, setDiceRoll] = useState<DiceRoll | null>(null);
  const [validMoves, setValidMoves] = useState<Move[]>([]);
  const [validMovesBySteps, setValidMovesBySteps] = useState<Record<number, Move[]>>({});
  const [error, setError] = useState<string | null>(null);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [_lastPlayerIndex, setLastPlayerIndex] = useState<number>(-1);

  // Pending timer that clears dice after a turn change — cancelled if new dice arrive first.
  const diceRollClearTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastDiceRollRef = useRef<DiceRoll | null>(null);

  /**
   * Stores the most recent join parameters set by an explicit joinGame() call.
   * Used by the 'connect' handler so that every socket reconnect (e.g. after a
   * temporary network drop) automatically rejoins with the *current* game's data
   * instead of relying on potentially stale localStorage values.
   */
  const joinParamsRef = useRef<StoredGameData | null>(null);

  useEffect(() => {
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to game server, socket id:', newSocket.id);

      // Prefer the params from an explicit joinGame() call (most reliable).
      // Fall back to localStorage so that page refreshes also work before the
      // component has had a chance to call joinGame() explicitly.
      const params = joinParamsRef.current ?? loadGameData();
      if (params?.gameId) {
        console.log('[Parques] (Re)joining game:', params.gameId);
        setIsReconnecting(true);
        newSocket.emit('joinGame', {
          gameId: params.gameId,
          playerName: params.playerName,
          userId: params.playerId,
        });
      }
    });

    newSocket.on('gameCreated', ({ gameId }) => {
      console.log('Game created:', gameId);
    });

    newSocket.on('joinedGame', ({ player, game }: { player: Player; game: GameState }) => {
      setCurrentPlayer(player);
      setGameState(game);
      setIsReconnecting(false);

      // Initialise lastPlayerIndex so the gameState handler doesn't trigger a
      // spurious dice-clear on the very first broadcast after reconnection.
      setLastPlayerIndex(game.currentPlayerIndex);

      // Persist join params with the server-confirmed real userId.
      const stored: StoredGameData = {
        gameId: game.id,
        playerName: player.name,
        playerId: player.userId,
      };
      joinParamsRef.current = stored;
      saveGameData(stored);
    });

    newSocket.on('gameState', (game: GameState) => {
      // Detect turn change and schedule a dice-reset with a short delay so all
      // players can see the previous roll result before it disappears.
      setLastPlayerIndex(prev => {
        if (prev !== -1 && prev !== game.currentPlayerIndex) {
          lastDiceRollRef.current = null;
          if (diceRollClearTimerRef.current) clearTimeout(diceRollClearTimerRef.current);
          diceRollClearTimerRef.current = setTimeout(() => {
            setDiceRoll(null);
            setValidMoves([]);
            diceRollClearTimerRef.current = null;
          }, 2500);
        }
        return game.currentPlayerIndex;
      });
      setGameState(game);
    });

    newSocket.on('gameStarted', (game: GameState) => {
      setGameState(game);
      setLastPlayerIndex(game.currentPlayerIndex);
      // Refresh currentPlayer from the updated game (colours/houses may have changed).
      setCurrentPlayer((prev) => {
        if (!prev) return prev;
        return game.players.find((p) => p.id === prev.id) ?? prev;
      });
    });

    newSocket.on('diceRolled', ({ diceRoll: roll, validMoves: moves, validMovesBySteps: movesBySteps }: { diceRoll: DiceRoll; validMoves: Move[]; validMovesBySteps?: Record<number, Move[]> }) => {
      // Cancel any pending clear from a previous turn so new dice aren't wiped.
      if (diceRollClearTimerRef.current) {
        clearTimeout(diceRollClearTimerRef.current);
        diceRollClearTimerRef.current = null;
      }
      console.log('[diceRolled] validMovesBySteps:', movesBySteps, 'validMoves:', moves);
      lastDiceRollRef.current = roll;
      setDiceRoll(roll);
      setValidMoves(moves);
      setValidMovesBySteps(movesBySteps || {});
    });

    newSocket.on('pieceMoved', ({ move, validMoves: moves, validMovesBySteps: movesBySteps }: { move: { pieceId: number }; validMoves?: Move[]; validMovesBySteps?: Record<number, Move[]> }) => {
      console.log('Piece moved:', move, 'remaining validMoves:', moves);
      if (diceRollClearTimerRef.current) {
        clearTimeout(diceRollClearTimerRef.current);
        diceRollClearTimerRef.current = null;
      }
      if (moves && moves.length > 0) {
        // Still has remaining dice steps — keep dice visible, update valid moves
        setValidMoves(moves);
        setValidMovesBySteps(movesBySteps || {});
      } else {
        // All dice consumed — clear everything
        setDiceRoll(null);
        setValidMoves([]);
        setValidMovesBySteps({});
      }
    });

    newSocket.on('gameFinished', ({ winner }: { winner: string }) => {
      console.log('Game finished! Winner:', winner);
      setTimeout(() => {
        clearGameData();
        joinParamsRef.current = null;
      }, 5000);
    });

    newSocket.on('error', ({ message }: { message: string }) => {
      setError(message);
      setTimeout(() => setError(null), 3000);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    return () => {
      newSocket.close();
    };
  }, []);

  const createGame = useCallback(() => {
    socket?.emit('createGame');
  }, [socket]);

  const joinGame = useCallback((gameId: string, playerName: string, userId?: string) => {
    const params: StoredGameData = { gameId, playerName, playerId: userId || '' };

    // Update the ref immediately so the next 'connect' event uses fresh params.
    joinParamsRef.current = params;
    saveGameData(params);

    socket?.emit('joinGame', { gameId, playerName, userId });
  }, [socket]);

  const startGame = useCallback((gameId: string) => {
    socket?.emit('startGame', { gameId });
  }, [socket]);

  const rollDice = useCallback((gameId: string) => {
    if (!socket?.connected) {
      console.warn('[Parques] rollDice: socket not connected');
      return;
    }
    socket.emit('rollDice', { gameId });
  }, [socket]);

  const movePiece = useCallback((gameId: string, pieceId: number, steps: number) => {
    socket?.emit('movePiece', { gameId, pieceId, steps });
  }, [socket]);

  const skipTurn = useCallback((gameId: string) => {
    socket?.emit('skipTurn', { gameId });
  }, [socket]);

  const leaveGame = useCallback(() => {
    clearGameData();
    joinParamsRef.current = null;
    setGameState(null);
    setCurrentPlayer(null);
    setDiceRoll(null);
    setValidMoves([]);
  }, []);

  return {
    gameState,
    currentPlayer,
    diceRoll,
    validMoves,
    validMovesBySteps,
    error,
    isReconnecting,
    createGame,
    joinGame,
    startGame,
    rollDice,
    movePiece,
    skipTurn,
    leaveGame,
    getStoredGameData: loadGameData,
  };
};
