import { StateType } from '@app/store/reducer';
import CloseIcon from '@mui/icons-material/ExitToApp';
import { Avatar, Box, IconButton, Typography } from '@mui/material';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { IGameProps } from '../Room';
import './engine/App.css';
import Board4 from './engine/components/Board4';
import { useGameSocket } from './engine/hooks/useGameSocket';
import type { DiceRoll } from './engine/types';

const COLOR_HEX: Record<string, string> = {
    red: '#e53935',
    blue: '#1565c0',
    yellow: '#f9a825',
    green: '#2e7d32'
};

function renderDiceFace(value: number): string {
    const faces = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
    return faces[value - 1] || '🎲';
}

const PARQUES = (props: IGameProps) => {
    const user = useSelector((state: StateType) => state.session.user);
    const [isRolling, setIsRolling] = useState(false);
    const prevDiceRoll = useRef<DiceRoll | null>(null);
    const rollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const { gameState, currentPlayer, diceRoll, validMoves, validMovesBySteps, error, isReconnecting, joinGame, rollDice, movePiece } = useGameSocket();
    const [selectedPieceId, setSelectedPieceId] = useState<number | null>(null);

    // Clear rolling state when server responds with a result
    useEffect(() => {
        if (diceRoll !== prevDiceRoll.current) {
            prevDiceRoll.current = diceRoll;
            if (diceRoll) {
                if (rollTimeoutRef.current) clearTimeout(rollTimeoutRef.current);
                setIsRolling(false);
            }
        }
    }, [diceRoll]);

    // Reset rolling state on server error so dice don't spin forever
    useEffect(() => {
        if (error) {
            if (rollTimeoutRef.current) clearTimeout(rollTimeoutRef.current);
            setIsRolling(false);
        }
    }, [error]);

    // Clear step selector when dice are cleared (turn changed or piece moved)
    useEffect(() => {
        if (!diceRoll) setSelectedPieceId(null);
    }, [diceRoll]);

    // Step options available for the current move come directly from validMovesBySteps keys
    const currentStepOptions = Object.keys(validMovesBySteps).map(Number);

    // Called when user taps a highlighted piece
    const handleSelectPiece = useCallback((pieceId: number) => {
        if (!gameState || !diceRoll) return;
        if (selectedPieceId !== null) return; // already selecting

        const currentPlayerData = gameState.players[gameState.currentPlayerIndex];
        const piece = currentPlayerData?.pieces.find(p => p.id === pieceId);

        // Jail release moves are to a fixed position — no step choice needed
        if (piece?.isInJail) {
            movePiece(gameState.id, pieceId, diceRoll.total);
            return;
        }

        console.log('[selectPiece] pieceId:', pieceId, 'validMovesBySteps:', validMovesBySteps);
        setSelectedPieceId(pieceId);
    }, [gameState, diceRoll, selectedPieceId, movePiece, validMovesBySteps]);

    // Only join the socket game after room.state === 'PLAYING' (both players accepted).
    // prepareGameData runs at that moment, so the in-memory game is ready with
    // all players pre-assigned to their correct houses.
    const gameId =
        props.room?.state === 'PLAYING' && props.room?.lastMeetUp?._id
            ? props.room.lastMeetUp._id.toString()
            : '';
    const playerName = user?.username || user?.name || '';
    const userId = user?._id || '';

    useEffect(() => {
        if (gameId && playerName) {
            joinGame(gameId, playerName, userId);
        }
    }, [gameId, playerName, userId, joinGame]);

    if (!props.room || !user) return null;

    const isMyTurn = gameState && currentPlayer && gameState.players[gameState.currentPlayerIndex]?.id === currentPlayer.id;

    // While in jail with pieces to rescue, the player may roll up to 3 times per turn.
    // attemptsRemaining > 0 means the server kept the turn but expects another roll.
    const isJailReattempt = !!(diceRoll && diceRoll.attemptsRemaining !== undefined && diceRoll.attemptsRemaining > 0);
    // After escaping jail with doubles the player earns one extra roll (canRollAgain),
    // but there are no pieces to move yet (validMoves=[]), so the dice must be clickable directly.
    const isJailReleaseBonusRoll = !!(diceRoll?.releasedFromJail && diceRoll?.canRollAgain);
    const canRollDice = isMyTurn && (!diceRoll || isJailReattempt || isJailReleaseBonusRoll) && !gameState?.gameFinished && !isRolling;
    const activePlayer = gameState?.players[gameState.currentPlayerIndex];
    const activeColor = activePlayer ? COLOR_HEX[activePlayer.color] ?? activePlayer.color : '#888';

    const handleRollDice = () => {
        if (gameState && isMyTurn && (!diceRoll || isJailReattempt || isJailReleaseBonusRoll) && !isRolling) {
            setIsRolling(true);
            rollDice(gameState.id);

            // Safety: reset spinner if the server never responds (network error, etc.)
            if (rollTimeoutRef.current) clearTimeout(rollTimeoutRef.current);
            rollTimeoutRef.current = setTimeout(() => setIsRolling(false), 6000);
        }
    };

    const diceCenter = (
        <div className="dice-section-center">
            {/* ── Indicador de turno ── */}
            {activePlayer && (
                <div className="turn-badge" style={{ borderColor: activeColor }}>
                    <span className="turn-dot" style={{ background: activeColor }} />
                    <span className="turn-name" style={{ color: activeColor }}>
                        {isMyTurn ? '¡Tu turno!' : activePlayer.name}
                    </span>
                </div>
            )}

            {/* ── Dados ── */}
            {isRolling ? (
                <div className="rolling-indicator">
                    <div style={{ display: 'flex', gap: 6 }}>
                        <span className="rolling-die">🎲</span>
                        <span className="rolling-die">🎲</span>
                    </div>
                    <span className="rolling-label">Calculando…</span>
                </div>
            ) : (
                <div className="dice-container-double">
                    <div
                        className={`dice dice-sm ${diceRoll ? 'rolled' : ''} ${canRollDice ? 'pulse clickable' : ''}`}
                        onClick={handleRollDice}
                        style={{ cursor: canRollDice ? 'pointer' : 'default' }}
                    >
                        {diceRoll ? renderDiceFace(diceRoll.dice1) : '🎲'}
                    </div>
                    <div
                        className={`dice dice-sm ${diceRoll ? 'rolled' : ''} ${canRollDice ? 'pulse clickable' : ''}`}
                        onClick={handleRollDice}
                        style={{ cursor: canRollDice ? 'pointer' : 'default' }}
                    >
                        {diceRoll ? renderDiceFace(diceRoll.dice2) : '🎲'}
                    </div>
                </div>
            )}

            {/* ── Resultado ── */}
            {diceRoll && !isRolling && <div className="dice-total dice-total-sm">= {diceRoll.total}</div>}

            {/* ── Hint cuando es mi turno ── */}
            {canRollDice && !diceRoll && <div className="tap-to-roll">Toca para tirar</div>}
            {(isJailReattempt || isJailReleaseBonusRoll) && isMyTurn && !isRolling && (
                <div className="tap-to-roll">Toca para volver a tirar</div>
            )}

            {/* ── Mensajes especiales ── */}
            {diceRoll?.threeDoublesReward && <div className="three-doubles-message">¡¡¡TRES PARES!!! 🎆</div>}
            {diceRoll?.releasedFromJail && !diceRoll?.threeDoublesReward && <div className="released-message">¡Liberadas! 🎊</div>}
            {diceRoll?.attemptsRemaining !== undefined && diceRoll.attemptsRemaining > 0 && (
                <div className="attempts-remaining">Intentos: {diceRoll.attemptsRemaining}</div>
            )}
            {diceRoll?.canRollAgain && !diceRoll?.threeDoublesReward && (
                <div className="bonus-roll">¡Tiras de nuevo! 🎉</div>
            )}
        </div>
    );

    return (
        <div className="app game-screen">
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    px: 1,
                    py: 0.5,
                    bgcolor: 'background.paper',
                    borderBottom: '1px solid',
                    borderColor: 'divider'
                }}
            >
                <Avatar sx={{ bgcolor: '#7b3f00', color: 'white', width: 32, height: 32, fontSize: '0.75rem' }}>P</Avatar>
                <Typography variant="body2" fontWeight="bold" sx={{ flexGrow: 1 }}>
                    {props.room.game.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                    Sala: <b>{props.room._id.slice(-6).toUpperCase()}</b>
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                    Apuesta: <b>${props.room.game.bet * props.room.users.length}</b>
                </Typography>
                <IconButton size="small" title="Abandonar" onClick={() => props.onPressLeave()}>
                    <CloseIcon fontSize="small" />
                </IconButton>
            </Box>

            {error && <div className="error-toast">{error}</div>}
            {isReconnecting && <div className="reconnecting-banner">Reconectando a la partida...</div>}

            {gameState?.gameFinished && <div className="winner-banner">🏆 {gameState.winner} ha ganado!</div>}

            <div className="game-content">
                <Board4
                    centerContent={diceCenter}
                    gameState={gameState}
                    validMoves={validMoves}
                    currentPlayerId={currentPlayer?.id}
                    onMovePiece={handleSelectPiece}
                />

                {/* ── Selector de pasos ── */}
                {selectedPieceId !== null && diceRoll && gameState && (
                    <div className="step-selector-overlay" onClick={() => setSelectedPieceId(null)}>
                        <div className="step-selector" onClick={e => e.stopPropagation()}>
                            <div className="step-selector-title">¿Cuánto mover?</div>
                            <div className="step-options">
                                {currentStepOptions.map(steps => {
                                    const canMove = !!(validMovesBySteps[steps]?.some(m => m.pieceId === selectedPieceId));
                                    return (
                                        <button
                                            key={steps}
                                            className={`step-option${canMove ? '' : ' step-option-disabled'}`}
                                            onClick={() => {
                                                if (canMove) {
                                                    movePiece(gameState.id, selectedPieceId, steps);
                                                    setSelectedPieceId(null);
                                                }
                                            }}
                                            disabled={!canMove}
                                        >
                                            <span className="step-icon">{steps <= 6 ? renderDiceFace(steps) : steps}</span>
                                            <span className="step-num">{steps}</span>
                                        </button>
                                    );
                                })}
                            </div>
                            <button className="step-cancel" onClick={() => setSelectedPieceId(null)}>Cancelar</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PARQUES;
