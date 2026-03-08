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
                <div key={idx} className="corner-subcell">
                    {piece && <Pt piece={piece} player={player!} isValid={isValid} onMovePiece={onMovePiece} />}
                </div>
            );
        });
        const avatarCell = (
            <div className="corner-avatar-cell" style={{ background: COLOR_HEX[color] ?? color }}>
                {player ? player.name.charAt(0).toUpperCase() : '?'}
            </div>
        );
        const nameCell = <div className="corner-name-cell">{player?.name ?? color}</div>;
        return infoAtBottom ? (
            <>
                {slots}
                {avatarCell}
                {nameCell}
            </>
        ) : (
            <>
                {avatarCell}
                {nameCell}
                {slots}
            </>
        );
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
                        {sc(5)}
                        {sc(6)}
                        {sc(7)}
                    </div>
                    {/* Columna Central – pasillo amarillo (66 = homeEntry, 401-406 = home stretch) */}
                    <div className="section vertical yellow-section-intense">
                        {sc(66, 'yellow-cell-intense')}
                        {sc(401, 'yellow-cell-intense')}
                        {sc(402, 'yellow-cell-intense')}
                        {sc(403, 'yellow-cell-intense')}
                        {sc(404, 'yellow-cell-intense')}
                        {sc(405, 'yellow-cell-intense')}
                        {sc(406, 'yellow-cell-intense')}
                    </div>
                    {/* Columna Derecha */}
                    <div className="section vertical">
                        {sc(65)}
                        {sc(64)}
                        {sc(63)}
                        {sc(62)}
                        {sc(61)}
                        {sc(60)}
                        {sc(59)}
                    </div>
                </div>

                {/* Esquina superior derecha – cárcel azul */}
                <div className="cell corner top-right info-bottom">{jailCorner('blue')}</div>

                {/* Centro izquierdo - 3 secciones horizontales */}
                <div className="cell center-left">
                    {/* Fila Superior */}
                    <div className="section horizontal">
                        {sc(15)}
                        {sc(14)}
                        {sc(13)}
                        {sc(12)}
                        {sc(11)}
                        {sc(10)}
                    </div>
                    {/* Fila Central – pasillo rojo (16 = homeEntry, 101-106 = home stretch) */}
                    <div className="section horizontal red-section-intense">
                        {sc(16, 'red-cell-intense')}
                        {sc(101, 'red-cell-intense')}
                        {sc(102, 'red-cell-intense')}
                        {sc(103, 'red-cell-intense')}
                        {sc(104, 'red-cell-intense')}
                        {sc(105, 'red-cell-intense')}
                        {sc(106, 'red-cell-intense')}
                    </div>
                    {/* Fila Inferior */}
                    <div className="section horizontal">
                        {sc(17)}
                        {sc(18)}
                        {sc(19)}
                        {sc(20)}
                        {sc(21)}
                        {sc(22)}
                        {sc(23)}
                    </div>
                </div>

                {/* Centro central */}
                <div className="cell center-middle" style={{ position: 'relative' }}>
                    <div></div>
                    <div className="cell-center br bb diagonal-cell" data-cellid="8">
                        8
                    </div>
                    <div className="cell-center bb subcell yellow-cell-intense"></div>
                    <div className="cell-center bb br subcell yellow-cell-intense"></div>
                    <div className="cell-center bb diagonal-cell" data-cellid="58">
                        58
                    </div>
                    <div className="cell-center"></div>

                    <div className="cell-center br bb diagonal-cell" data-cellid="9">
                        9
                    </div>
                    <div className="cell-center"></div>
                    <div className="cell-center"></div>
                    <div className="cell-center"></div>
                    <div className="cell-center br"></div>
                    <div className="cell-center bb diagonal-cell" data-cellid="57">
                        57
                    </div>

                    <div className="cell-center br subcell red-cell-intense"></div>
                    <div className="cell-center "></div>
                    <div className="cell-center"></div>
                    <div className="cell-center"></div>
                    <div className="cell-center br"></div>
                    <div className="cell-center subcell blue-cell-intense"></div>

                    <div className="cell-center br bb subcell red-cell-intense"></div>
                    <div className="cell-center"></div>
                    <div className="cell-center"></div>
                    <div className="cell-center"></div>
                    <div className="cell-center br"></div>
                    <div className="cell-center bb subcell blue-cell-intense"></div>

                    <div className="cell-center br diagonal-cell" data-cellid="24">
                        24
                    </div>
                    <div className="cell-center bb"></div>
                    <div className="cell-center bb"></div>
                    <div className="cell-center bb"></div>
                    <div className="cell-center bb br"></div>
                    <div className="cell-center diagonal-cell" data-cellid="41">
                        41
                    </div>

                    <div className="cell-center"></div>
                    <div className="cell-center diagonal-cell" data-cellid="25">
                        25
                    </div>
                    <div className="cell-center subcell green-cell-intense"></div>
                    <div className="cell-center subcell green-cell-intense"></div>
                    <div className="cell-center diagonal-cell" data-cellid="40">
                        40
                    </div>
                    <div className="cell-center"></div>

                    {centerContent && <div className="center-dice-overlay">{centerContent}</div>}
                </div>

                {/* Centro derecho - 3 secciones horizontales */}
                <div className="cell center-right">
                    <div className="section horizontal">
                        {sc(56)}
                        {sc(55)}
                        {sc(54)}
                        {sc(53)}
                        {sc(52)}
                        {sc(51)}
                        {sc(50)}
                    </div>
                    {/* Fila Central – pasillo azul (49 = homeEntry, 201-206 = home stretch) */}
                    <div className="section horizontal blue-section-intense">
                        {sc(206, 'blue-cell-intense')}
                        {sc(205, 'blue-cell-intense')}
                        {sc(204, 'blue-cell-intense')}
                        {sc(203, 'blue-cell-intense')}
                        {sc(202, 'blue-cell-intense')}
                        {sc(201, 'blue-cell-intense')}
                        {sc(49, 'blue-cell-intense')}
                    </div>
                    <div className="section horizontal">
                        {sc(42)}
                        {sc(43)}
                        {sc(44)}
                        {sc(45)}
                        {sc(46)}
                        {sc(47)}
                        {sc(48)}
                    </div>
                </div>

                {/* Esquina inferior izquierda – cárcel roja */}
                <div className="cell corner bottom-left info-bottom">{jailCorner('red', true)}</div>

                {/* Centro inferior - 3 secciones verticales */}
                <div className="cell center-bottom">
                    <div className="section vertical">
                        {sc(26)}
                        {sc(27)}
                        {sc(28)}
                        {sc(29)}
                        {sc(30)}
                        {sc(31)}
                    </div>
                    {/* Columna Central – pasillo verde (306→301 top-to-bottom, 32 = homeEntry en bottom) */}
                    <div className="section vertical green-section-intense">
                        {sc(306, 'green-cell-intense')}
                        {sc(305, 'green-cell-intense')}
                        {sc(304, 'green-cell-intense')}
                        {sc(303, 'green-cell-intense')}
                        {sc(302, 'green-cell-intense')}
                        {sc(301, 'green-cell-intense')}
                        {sc(32, 'green-cell-intense')}
                    </div>
                    <div className="section vertical">
                        {sc(39)}
                        {sc(38)}
                        {sc(37)}
                        {sc(36)}
                        {sc(35)}
                        {sc(34)}
                        {sc(33)}
                    </div>
                </div>

                {/* Esquina inferior derecha – cárcel verde */}
                <div className="cell corner bottom-right">{jailCorner('green', true)}</div>
            </div>
        </div>
    );
};

export default Board4;
