import React from 'react';
import type { GameState, Move, Piece, Player } from '../types';
import './Board4.css';

interface Board4Props {
    centerContent?: React.ReactNode;
    gameState?: GameState | null;
    validMoves?: Move[];
    onMovePiece?: (pieceId: number) => void;
    currentPlayerId?: string | null;
}

const COLOR_HEX: Record<string, string> = {
    red: '#e53935',
    blue: '#1565c0',
    yellow: '#f9a825',
    green: '#2e7d32'
};

function getPiecesAt(players: Player[], position: number) {
    const result: { piece: Piece; player: Player }[] = [];
    for (const player of players) {
        for (const piece of player.pieces) {
            if (piece.position === position && !piece.isFinished) {
                result.push({ piece, player });
            }
        }
    }
    return result;
}

interface PtProps {
    piece: Piece;
    player: Player;
    isValid: boolean;
    onMovePiece?: (id: number) => void;
}
function Pt({ piece, player, isValid, onMovePiece }: PtProps) {
    return (
        <div
            className={`pt${isValid ? ' pt-v' : ''}`}
            style={{ background: COLOR_HEX[player.color] ?? player.color }}
            onClick={isValid ? () => onMovePiece?.(piece.id) : undefined}
            title={`${player.name} – ficha ${piece.id + 1}`}
        />
    );
}

const Board4: React.FC<Board4Props> = ({ centerContent, gameState, validMoves = [], onMovePiece, currentPlayerId }) => {
    const players = gameState?.players ?? [];
    const validPieceIds = new Set(validMoves.map((m) => m.pieceId));

    /** render pieces inside a main-track or home-stretch cell */
    const sc = (id: number, extraClass?: string) => {
        const pcs = getPiecesAt(players, id);
        return (
            <div className={`subcell${extraClass ? ' ' + extraClass : ''}`} data-cellid={id}>
                <span className="cell-num">{id}</span>
                {pcs.map(({ piece, player }) => (
                    <Pt
                        key={`${player.id}-${piece.id}`}
                        piece={piece}
                        player={player}
                        isValid={validPieceIds.has(piece.id) && player.id === currentPlayerId}
                        onMovePiece={onMovePiece}
                    />
                ))}
            </div>
        );
    };

    /** render 4 jail slots for a color (top-left=yellow, top-right=blue, bottom-left=red, bottom-right=green) */
    const jailCorner = (color: string, infoAtBottom = false) => {
        const player = players.find((p) => p.color === color);
        const jailed = player ? player.pieces.filter((p) => p.isInJail) : [];

        const slots = [0, 1, 2, 3].map((idx) => {
            const piece = jailed[idx];
            const isValid = piece != null && validPieceIds.has(piece.id) && player!.id === currentPlayerId;
            return (
                <div key={idx} className="corner-cell corner-slot">
                    {piece && <Pt piece={piece} player={player!} isValid={isValid} onMovePiece={onMovePiece} />}
                </div>
            );
        });

        const avatarCell = (
            <div className="corner-cell corner-avatar" style={{ background: COLOR_HEX[color] ?? color }}>
                {player ? player.name.charAt(0).toUpperCase() : '?'}
            </div>
        );

        const nameCell = (
            <div className="corner-cell corner-name">
                {player?.name ?? color}
            </div>
        );

        return infoAtBottom
            ? <>{slots}{avatarCell}{nameCell}</>
            : <>{avatarCell}{nameCell}{slots}</>;
    };

    return (
        <div className="board4-container">
            <div className="board4-grid">
                {/* Esquina superior izquierda – cárcel amarilla */}
                <div className="cell corner top-left">{jailCorner('yellow')}</div>

                {/* Centro superior - 3 secciones verticales */}
                <div className="cell center-top">
                    {/* Columna Izquierda */}
                    <div className="section vertical">
                        {sc(1)}
                        {sc(2)}
                        {sc(3)}
                        {sc(4)}
                        {sc(5, 'safe-cell exit-cell')}
                        {sc(6)}
                        {sc(7)}
                    </div>
                    {/* Columna Central – pasillo amarillo (68 = homeEntry, 69-75 = home stretch) */}
                    <div className="section vertical yellow-section-intense">
                        {sc(68, 'yellow-cell-intense safe-cell home-entry-cell')}
                        {sc(69, 'yellow-cell-intense')}
                        {sc(70, 'yellow-cell-intense')}
                        {sc(71, 'yellow-cell-intense')}
                        {sc(72, 'yellow-cell-intense')}
                        {sc(73, 'yellow-cell-intense')}
                        {sc(74, 'yellow-cell-intense')}
                        {sc(75, 'yellow-cell-intense')}
                    </div>
                    {/* Columna Derecha */}
                    <div className="section vertical">
                        {sc(67)}
                        {sc(66)}
                        {sc(65)}
                        {sc(64)}
                        {sc(63, 'safe-cell')}
                        {sc(62)}
                        {sc(61)}
                    </div>
                </div>

                {/* Esquina superior derecha – cárcel azul */}
                <div className="cell corner top-right info-bottom">{jailCorner('blue')}</div>

                {/* Centro izquierdo - 3 secciones horizontales */}
                <div className="cell center-left">
                    {/* Fila Superior */}
                    <div className="section horizontal">
                        {sc(16)}
                        {sc(15)}
                        {sc(14)}
                        {sc(13)}
                        {sc(12, 'safe-cell')}
                        {sc(11)}
                        {sc(10)}
                    </div>
                    {/* Fila Central – pasillo rojo (76 = homeEntry, 77-83 = home stretch) */}
                    <div className="section horizontal red-section-intense">
                        {sc(17, 'red-cell-intense safe-cell home-entry-cell')}
                        {sc(77, 'red-cell-intense')}
                        {sc(78, 'red-cell-intense')}
                        {sc(79, 'red-cell-intense')}
                        {sc(80, 'red-cell-intense')}
                        {sc(81, 'red-cell-intense')}
                        {sc(82, 'red-cell-intense')}
                        {sc(83, 'red-cell-intense')}
                    </div>
                    {/* Fila Inferior */}
                    <div className="section horizontal">
                        {sc(18)}
                        {sc(19)}
                        {sc(20)}
                        {sc(21)}
                        {sc(22, 'safe-cell exit-cell')}
                        {sc(23)}
                        {sc(24)}
                    </div>
                </div>

                {/* Centro central */}
                <div className="cell center-middle" style={{ position: 'relative' }}>
                    <div></div>
                    <div className="cell-center br bb corner-cell" data-cellid="8">
                        <span className="cell-num">8</span>
                        {getPiecesAt(players, 8).map(({ piece, player }) => (
                            <Pt key={`${player.id}-${piece.id}`} piece={piece} player={player}
                                isValid={validPieceIds.has(piece.id) && player.id === currentPlayerId}
                                onMovePiece={onMovePiece} />
                        ))}
                    </div>
                    <div className="cell-center bb br subcell yellow-cell-intense" style={{ gridColumn: 'span 2' }} data-cellid="76">
                        <span className="cell-num">76</span>
                        {getPiecesAt(players, 76).map(({ piece, player }) => (
                            <Pt
                                key={`${player.id}-${piece.id}`}
                                piece={piece}
                                player={player}
                                isValid={validPieceIds.has(piece.id) && player.id === currentPlayerId}
                                onMovePiece={onMovePiece}
                            />
                        ))}
                    </div>
                    <div className="cell-center bb corner-cell" data-cellid="60">
                        <span className="cell-num">60</span>
                        {getPiecesAt(players, 60).map(({ piece, player }) => (
                            <Pt key={`${player.id}-${piece.id}`} piece={piece} player={player}
                                isValid={validPieceIds.has(piece.id) && player.id === currentPlayerId}
                                onMovePiece={onMovePiece} />
                        ))}
                    </div>
                    <div className="cell-center"></div>

                    <div className="cell-center br bb corner-cell" data-cellid="9">
                        <span className="cell-num">9</span>
                        {getPiecesAt(players, 9).map(({ piece, player }) => (
                            <Pt key={`${player.id}-${piece.id}`} piece={piece} player={player}
                                isValid={validPieceIds.has(piece.id) && player.id === currentPlayerId}
                                onMovePiece={onMovePiece} />
                        ))}
                    </div>
                    <div className="cell-center"></div>
                    <div className="cell-center"></div>
                    <div className="cell-center"></div>
                    <div className="cell-center br"></div>
                    <div className="cell-center bb corner-cell" data-cellid="59">
                        <span className="cell-num">59</span>
                        {getPiecesAt(players, 59).map(({ piece, player }) => (
                            <Pt key={`${player.id}-${piece.id}`} piece={piece} player={player}
                                isValid={validPieceIds.has(piece.id) && player.id === currentPlayerId}
                                onMovePiece={onMovePiece} />
                        ))}
                    </div>

                    <div className="cell-center br bb subcell red-cell-intense" style={{ gridRow: 'span 2' }} data-cellid="84">
                        <span className="cell-num">84</span>
                        {getPiecesAt(players, 84).map(({ piece, player }) => (
                            <Pt
                                key={`${player.id}-${piece.id}`}
                                piece={piece}
                                player={player}
                                isValid={validPieceIds.has(piece.id) && player.id === currentPlayerId}
                                onMovePiece={onMovePiece}
                            />
                        ))}
                    </div>
                    <div className="cell-center "></div>
                    <div className="cell-center"></div>
                    <div className="cell-center"></div>
                    <div className="cell-center br"></div>
                    <div className="cell-center bb subcell blue-cell-intense" style={{ gridRow: 'span 2' }} data-cellid="100">
                        <span className="cell-num">100</span>
                        {getPiecesAt(players, 100).map(({ piece, player }) => (
                            <Pt
                                key={`${player.id}-${piece.id}`}
                                piece={piece}
                                player={player}
                                isValid={validPieceIds.has(piece.id) && player.id === currentPlayerId}
                                onMovePiece={onMovePiece}
                            />
                        ))}
                    </div>

                    <div className="cell-center"></div>
                    <div className="cell-center"></div>
                    <div className="cell-center"></div>
                    <div className="cell-center br"></div>

                    <div className="cell-center br corner-cell" data-cellid="25">
                        <span className="cell-num">25</span>
                        {getPiecesAt(players, 25).map(({ piece, player }) => (
                            <Pt key={`${player.id}-${piece.id}`} piece={piece} player={player}
                                isValid={validPieceIds.has(piece.id) && player.id === currentPlayerId}
                                onMovePiece={onMovePiece} />
                        ))}
                    </div>
                    <div className="cell-center bb"></div>
                    <div className="cell-center bb"></div>
                    <div className="cell-center bb"></div>
                    <div className="cell-center bb br"></div>
                    <div className="cell-center corner-cell" data-cellid="43">
                        <span className="cell-num">43</span>
                        {getPiecesAt(players, 43).map(({ piece, player }) => (
                            <Pt key={`${player.id}-${piece.id}`} piece={piece} player={player}
                                isValid={validPieceIds.has(piece.id) && player.id === currentPlayerId}
                                onMovePiece={onMovePiece} />
                        ))}
                    </div>

                    <div className="cell-center"></div>
                    <div className="cell-center corner-cell" data-cellid="26">
                        <span className="cell-num">26</span>
                        {getPiecesAt(players, 26).map(({ piece, player }) => (
                            <Pt key={`${player.id}-${piece.id}`} piece={piece} player={player}
                                isValid={validPieceIds.has(piece.id) && player.id === currentPlayerId}
                                onMovePiece={onMovePiece} />
                        ))}
                    </div>
                    <div className="cell-center subcell green-cell-intense" style={{ gridColumn: 'span 2' }} data-cellid="92">
                        <span className="cell-num">92</span>
                        {getPiecesAt(players, 92).map(({ piece, player }) => (
                            <Pt
                                key={`${player.id}-${piece.id}`}
                                piece={piece}
                                player={player}
                                isValid={validPieceIds.has(piece.id) && player.id === currentPlayerId}
                                onMovePiece={onMovePiece}
                            />
                        ))}
                    </div>
                    <div className="cell-center corner-cell" data-cellid="42">
                        <span className="cell-num">42</span>
                        {getPiecesAt(players, 42).map(({ piece, player }) => (
                            <Pt key={`${player.id}-${piece.id}`} piece={piece} player={player}
                                isValid={validPieceIds.has(piece.id) && player.id === currentPlayerId}
                                onMovePiece={onMovePiece} />
                        ))}
                    </div>
                    <div className="cell-center"></div>

                    {centerContent && <div className="center-dice-overlay">{centerContent}</div>}
                </div>

                {/* Centro derecho - 3 secciones horizontales */}
                <div className="cell center-right">
                    <div className="section horizontal">
                        {sc(58)}
                        {sc(57)}
                        {sc(56, 'safe-cell exit-cell')}
                        {sc(55)}
                        {sc(54)}
                        {sc(53)}
                        {sc(52)}
                    </div>
                    {/* Fila Central – pasillo azul (93 = homeEntry derecha, 93-99 = home stretch, 99 = centro) */}
                    <div className="section horizontal blue-section-intense">
                        {sc(99, 'blue-cell-intense')}
                        {sc(98, 'blue-cell-intense')}
                        {sc(97, 'blue-cell-intense')}
                        {sc(96, 'blue-cell-intense')}
                        {sc(95, 'blue-cell-intense')}
                        {sc(94, 'blue-cell-intense')}
                        {sc(93, 'blue-cell-intense')}
                        {sc(51, 'blue-cell-intense safe-cell home-entry-cell')}
                    </div>
                    <div className="section horizontal">
                        {sc(44)}
                        {sc(45)}
                        {sc(46, 'safe-cell')}
                        {sc(47)}
                        {sc(48)}
                        {sc(49)}
                        {sc(50)}
                    </div>
                </div>

                {/* Esquina inferior izquierda – cárcel roja */}
                <div className="cell corner bottom-left info-bottom">{jailCorner('red', true)}</div>

                {/* Centro inferior - 3 secciones verticales */}
                <div className="cell center-bottom">
                    <div className="section vertical">
                        {sc(27)}
                        {sc(28)}
                        {sc(29, 'safe-cell')}
                        {sc(30)}
                        {sc(31)}
                        {sc(32)}
                        {sc(33)}
                    </div>
                    {/* Columna Central – pasillo verde (85 = homeEntry abajo, 85-91 = home stretch, 91 = centro) */}
                    <div className="section vertical green-section-intense">
                        {sc(91, 'green-cell-intense')}
                        {sc(90, 'green-cell-intense')}
                        {sc(89, 'green-cell-intense')}
                        {sc(88, 'green-cell-intense')}
                        {sc(87, 'green-cell-intense')}
                        {sc(86, 'green-cell-intense')}
                        {sc(85, 'green-cell-intense')}
                        {sc(34, 'green-cell-intense safe-cell home-entry-cell')}
                    </div>
                    <div className="section vertical">
                        {sc(41)}
                        {sc(40)}
                        {sc(39, 'safe-cell exit-cell')}
                        {sc(38)}
                        {sc(37)}
                        {sc(36)}
                        {sc(35)}
                    </div>
                </div>

                {/* Esquina inferior derecha – cárcel verde */}
                <div className="cell corner bottom-right">{jailCorner('green', true)}</div>
            </div>
        </div>
    );
};

export default Board4;
