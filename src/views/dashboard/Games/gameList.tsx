import { useEffect, useState } from 'react';

// material-ui
import { Button, Card, CardActions, CardContent, CardMedia, Grid, Typography } from '@mui/material';

// project imports
import { GamesService } from '@app/services/games.service';
import { IGame } from '@app/services/models/card-properties';
import { IRoom } from '@app/services/models/room';
import { RoomService } from '@app/services/room.service';
import { gridSpacing } from '@app/store/constant';
import { SESSION_ACTIONS } from '@app/store/sessionReducer';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

const GameList = () => {
    const dispatch = useDispatch();
    const user = useSelector((state: any) => state.session.user);
    const [games, setGames] = useState<IGame[]>([]);
    const [gameList, setGameList] = useState<any[]>([]);

    async function openGame(game: IGame) {
        if (!(await RoomService.hasMoneyForPlay(game))) {
            toast.error('No tienes monedas para jugar');
            return;
        }

        const newRoom: IRoom = await RoomService.joinToRoom(game);
        const completeRoom = await RoomService.findById(newRoom._id);

        if (completeRoom) {
            dispatch({ type: SESSION_ACTIONS.UPDATE_ROOM, room: completeRoom });
        }
    }

    const shareGame = async (game: IGame) => {
        const data = JSON.stringify({
            type: 'share',
            data: {
                content: {
                    title: 'Crees que puedes ganarme?',
                    message: `Te reto a jugar ${game.name} en Yaper!! Bùscame como: ${user.username} https://jsvptf.com`,
                },
                options: {
                    dialogTitle: 'Compartir enlace',
                },
            }

        })
        console.log(data)
        // @ts-ignore
        window.ReactNativeWebView.postMessage(data)
    }

    useEffect(() => {
        if (!games.length) {
            return;
        }
        const list = games.map((game) => {
            return <Grid item lg={4} md={6} sm={6} xs={12} key={'game' + game._id}>
                <Card sx={{ maxWidth: 345 }}>
                    <CardMedia
                        component="img"
                        alt=""
                        height="300"
                        image={game.image}
                    />
                    <CardContent>
                        <Typography gutterBottom variant="h5" component="div">
                            {game.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {game.description}
                        </Typography>
                    </CardContent>
                    <CardActions>
                        <Button sx={{ width: '50%' }} variant='outlined' onClick={() => { shareGame(game) }} size="small">Invitar</Button>
                        <Button
                            sx={{ width: '50%' }}
                            size="small" variant='contained' onClick={() => openGame(game)} >Jugar</Button>
                    </CardActions>
                </Card>
            </Grid>
        })
        setGameList(list);
    }, [games])

    useEffect(() => {
        (async () => {
            const findedGames = await GamesService.find();
            setGames(findedGames);
        })();
    }, [])

    return (
        <Grid container spacing={gridSpacing}>
            <Grid item xs={12}>
                <Grid container spacing={gridSpacing}>
                    {gameList}
                </Grid>
            </Grid>
        </Grid>
    );
};

export default GameList;
