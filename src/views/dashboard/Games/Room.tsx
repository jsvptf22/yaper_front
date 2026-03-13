import loseSound from '@app/assets/sounds/lose.mp3';
import winSound from '@app/assets/sounds/win.mp3';
import { GraphqlService } from '@app/services/graphql.service';
import { IGame } from '@app/services/models/card-properties';
import { IRoom, RoomEvents, RoomState, UserInMeetUp } from '@app/services/models/room';
import { RoomService } from '@app/services/room.service';
import { StateType } from '@app/store/reducer';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, LinearProgress } from '@mui/material';
import { Box } from '@mui/system';
import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import io, { Socket } from 'socket.io-client';
import useSound from 'use-sound';
import LABYRINTH from './labyrinth/LABYRINTH';
import PARQUES from './parques/PARQUES';
import PPT from './ppt/PPT';

const existingGames = {
    PPT: PPT,
    LABYRINTH: LABYRINTH,
    PARQUES: PARQUES
};

enum MEETUP_RESULT {
    WIN = 'WIN',
    LOSE = 'LOSE',
    EQUAL = 'EQUAL',
    NONE = 'NONE'
}

export interface IGameProps {
    config: IGame;
    room: IRoom;
    roomMessageList: string[];
    openSocket: (namespace?: string) => void;
    onPlay: (selection: string) => Promise<void>;
    onPressLeave: () => void;
    onExecuteEndGame: () => void;
    enableLayout: boolean;
    userInMeetup: UserInMeetUp | null;
    userPlayed: boolean;
    isWaitingOtherUser: boolean;
    newGame: boolean;
    endGame: boolean;
    socket: Socket | null;
}

export interface IRoomProps {
    room: IRoom;
    setRoom: Function;
}

const Room = ({ room, setRoom }: IRoomProps) => {
    const user = useSelector((state: StateType) => state.session.user);
    const [playWinSound] = useSound(winSound);
    const [playLoseSound] = useSound(loseSound);
    const [roomSubscription, setRoomSubscription] = useState<any | null>(null);
    const lastRoomRef = useRef<IRoom | null>(null);
    const [opponentLeave, setOpponentLeave] = useState<boolean>(false);
    const [lastRoomResult, setLastRoomResult] = useState<MEETUP_RESULT>(MEETUP_RESULT.NONE);
    const [roomMessageList, setRoomMessageList] = useState<string[]>([]);
    const [showAcceptLeave, setShowAcceptLeave] = useState<boolean>(false);
    const [showAcceptNewMeetup, setShowAcceptNewMeetup] = useState<boolean>(false);
    const [socket, setSocket] = useState<Socket | null>(null);

    // Derived directly from room to avoid render race condition with useEffect
    const showIncompleteRoom = [RoomEvents.CREATE, RoomEvents.ADD_USER, RoomEvents.MINIMUM_REACHED].includes(room.lastEvent as RoomEvents);
    const isCreator = room.users?.[0]?._id === user._id;
    const playerCount = room.users?.length ?? 0;
    const hasMinimumPlayers = playerCount >= (room.game.minUsers ?? room.game.maxUsers ?? playerCount);

    // Derived values — computed from room on every render
    const userInMeetup = room?.lastMeetUp?.users?.find((u) => u.user_id === user._id) ?? null;
    const userPlayed = room.state === RoomState.PLAYING && !!userInMeetup && (userInMeetup.option?.length ?? 0) > 0;
    const enableLayout = userInMeetup !== null && !userPlayed && room.state === RoomState.PLAYING;
    const isWaitingOtherUser = (userInMeetup !== null && room.state === RoomState.WAITING_BET_CONFIRMATION) || userPlayed;

    const openSocket = (namespace: string = '') => {
        setSocket(io(`${import.meta.env.VITE_HTTP_API}/${namespace}`));
    };

    const addRoomMessage = (message: string) => {
        setRoomMessageList((prev) => [...prev, message]);
    };

    const executeEndGame = () => {
        socket?.disconnect();

        addRoomMessage('El juego ha terminado!');
        const winner = room!.lastMeetUp!.winner;

        let newResult: MEETUP_RESULT;
        if (!winner) {
            newResult = MEETUP_RESULT.EQUAL;
        } else if (winner._id === user!._id) {
            newResult = MEETUP_RESULT.WIN;
            playWinSound();
        } else {
            newResult = MEETUP_RESULT.LOSE;
            playLoseSound();
        }
        setLastRoomResult(newResult);
        setShowAcceptNewMeetup(true);
    };

    const acceptLeave = () => {
        unSubscribeToRoom();
        setOpponentLeave(false);
        setRoom(null);
    };

    const rejectNewMeetup = async () => {
        await RoomService.leave(room, false);
        setShowAcceptNewMeetup(false);
        setRoom(null);
    };

    const acceptMeetup = async () => {
        await RoomService.acceptMeetup(room);
        setShowAcceptNewMeetup(false);
    };

    const subscribeToRoom = (room: IRoom) => {
        const observer = GraphqlService.getClient().subscribe({
            query: RoomService.roomUpdateSubscription(),
            variables: { id: room._id }
        });

        const subscription = observer.subscribe((res) => {
            setRoom({ ...res.data.roomUpdate });
        });

        setRoomSubscription(subscription);
    };

    const unSubscribeToRoom = () => {
        roomSubscription?.unsubscribe();
        setRoomSubscription(null);
    };

    const saveUserSelection = async (selection: string) => {
        await RoomService.sendSelectedOption(room, selection);
    };

    const validateLeaveRoom = () => {
        setShowAcceptLeave(true);
    };

    const leaveRoom = async (acceptLose: boolean) => {
        await RoomService.leave(room, acceptLose);
        setShowAcceptLeave(false);
    };

    const handleStartGame = async () => {
        await RoomService.startGame(room);
    };

    useEffect(() => {
        console.log('Room update state', room.state, 'lastEvent', room.lastEvent, 'userInMeetup', userInMeetup);
        const shouldShow =
            room.lastEvent === RoomEvents.COMPLETE_ROOM || (room.state === RoomState.WAITING_BET_CONFIRMATION && !userInMeetup);
        setShowAcceptNewMeetup(shouldShow);

        if (!lastRoomRef.current || lastRoomRef.current.lastEvent !== room.lastEvent) {
            setOpponentLeave(room.lastEvent === RoomEvents.USER_LEAVE);

            if (room.lastEvent === RoomEvents.ACCEPT_MEETUP) {
                addRoomMessage('Apuesta aceptada');
            } else if (room.lastEvent === RoomEvents.GAME_START) {
                addRoomMessage('Juega!!');
            } else if (room.lastEvent === RoomEvents.USER_PLAY) {
                addRoomMessage('El usuario ha jugado');
            }

            lastRoomRef.current = room;
        }
    }, [room]);

    useEffect(() => {
        (async () => {
            const updatedRoom = await RoomService.findById(room._id);
            setRoom(updatedRoom);
            subscribeToRoom(room);
        })();
    }, []);

    const SpecificGame = existingGames[room.game.component as keyof typeof existingGames];

    const componentProps: IGameProps = {
        config: room.game,
        room,
        openSocket,
        onPlay: saveUserSelection,
        onPressLeave: validateLeaveRoom,
        onExecuteEndGame: executeEndGame,
        roomMessageList,
        enableLayout,
        userInMeetup,
        userPlayed,
        isWaitingOtherUser,
        newGame: room.lastEvent === RoomEvents.GAME_START,
        endGame: room.lastEvent === RoomEvents.GAME_END,
        socket
    };

    return (
        <>
            {SpecificGame ? <SpecificGame {...componentProps} /> : <Box>Error!</Box>}

            <Dialog
                open={showAcceptNewMeetup && !opponentLeave}
                disableEscapeKeyDown
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    <Box>
                        {lastRoomResult === MEETUP_RESULT.WIN && 'GANASTE!!!'}
                        {lastRoomResult === MEETUP_RESULT.LOSE && 'PERDISTE :('}
                        {lastRoomResult === MEETUP_RESULT.EQUAL && 'EMPATE!'}
                        {lastRoomResult === MEETUP_RESULT.NONE && 'APOSTAMOS ?'}
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        <span>{`Nuevo juego por ${room.game.bet} monedas`}</span>
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button sx={{ width: '50%' }} onClick={rejectNewMeetup} variant="contained" color="error">
                        NO
                    </Button>
                    <Button sx={{ width: '50%' }} color="info" onClick={acceptMeetup} variant="contained">
                        SI
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={opponentLeave}
                onClose={acceptLeave}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">El usuario abandonó el juego!</DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button sx={{ width: '100%' }} variant="contained" onClick={acceptLeave}>
                        Salir
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={showIncompleteRoom || (userInMeetup !== null && room.state === RoomState.WAITING_BET_CONFIRMATION)}
                disableEscapeKeyDown
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        {isCreator && hasMinimumPlayers && !userInMeetup
                            ? `¿Iniciar partida con ${playerCount} jugador${playerCount !== 1 ? 'es' : ''}?`
                            : 'Esperando contrincante.'}
                        {!(isCreator && hasMinimumPlayers && !userInMeetup) && <LinearProgress />}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    {isCreator && hasMinimumPlayers && !userInMeetup ? (
                        <>
                            <Button sx={{ width: '50%' }} variant="contained" color="success" onClick={handleStartGame}>
                                Iniciar
                            </Button>
                            <Button sx={{ width: '50%' }} variant="contained" onClick={validateLeaveRoom}>
                                Esperar más
                            </Button>
                        </>
                    ) : (
                        <Button sx={{ width: '100%' }} variant="contained" onClick={validateLeaveRoom}>
                            Abandonar
                        </Button>
                    )}
                </DialogActions>
            </Dialog>

            <Dialog
                open={showAcceptLeave}
                disableEscapeKeyDown
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    <Box>Abandonando el juego</Box>
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        ¿Estás seguro?
                        {room.state === RoomState.PLAYING && ' Perderás la partida si aceptas salir'}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button sx={{ width: '50%' }} variant="contained" color="info" onClick={() => setShowAcceptLeave(false)}>
                        Cancelar
                    </Button>
                    <Button
                        sx={{ width: '50%' }}
                        variant="contained"
                        color="error"
                        onClick={() => leaveRoom(room.state === RoomState.PLAYING)}
                    >
                        Salir
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default Room;
