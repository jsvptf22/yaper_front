import { IRoom } from '@app/services/models/room';
import { RoomService } from '@app/services/room.service';
import { StateType } from '@app/store/reducer';
import { SESSION_ACTIONS } from '@app/store/sessionReducer';
import { Grid } from '@mui/material';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Room from './Room';
import GameList from './gameList';

const DashboardGames = () => {
    const user = useSelector((state: StateType) => state.session.user);
    const room = useSelector((state: StateType) => state.session.room);
    const dispatch = useDispatch();

    const updateRoom = (room: IRoom) => {
        dispatch({ type: SESSION_ACTIONS.UPDATE_ROOM, room: room });
    }

    const findActiveRoom = async () => {
        if (user) {
            const room = await RoomService.findActive();
            if (room) {
                updateRoom(room);
            }
        }
    }

    useEffect(() => {
        findActiveRoom();
    }, []);

    return (
        <Grid container style={{ height: '100%' }}>
            <Grid item container>
                {
                    user && room ? <Room room={room} setRoom={updateRoom} /> : <GameList />
                }
            </Grid>
        </Grid>
    );
};

export default DashboardGames;
