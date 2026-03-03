import { StateType } from '@app/store/reducer';
import CloseIcon from '@mui/icons-material/ExitToApp';
import { Avatar, Box, Card, CardContent, CardHeader, Grid, IconButton, LinearProgress } from '@mui/material';
import { blue, green } from '@mui/material/colors';
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { IUser } from "../../../../services/models/user";
import { IGameProps } from "../Room";
import UserGameCard from "../UserGameCard";
import PPT_OPTION from "./option";

const PPT = (props: IGameProps) => {
  const user = useSelector((state: StateType) => state.session.user);
  const enableGameLayout = props.enableLayout;
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [rivalOption, setRivalOption] = useState<string | null>(null);
  const [localUser, setLocalUser] = useState<IUser>();
  const [otherUser, setOtherUser] = useState<IUser>();

  function getUsersData() {
    const local: IUser = props.room.users.find((u) => u._id === user._id);
    setLocalUser(local);

    const other: IUser | undefined = props.room.users.find(
      (u) => u._id !== user!._id,
    );
    if (other) {
      setOtherUser(other);
    }
  }

  function play(value: string) {
    if (!props.userPlayed) {
      setSelectedOption(value);
    }
  }

  useEffect(() => {
    if (props.endGame) {
      const rivalOption = props.room?.lastMeetUp?.users?.find((u) => u.user_id === otherUser?._id)?.option;
      setRivalOption(rivalOption || null);

      setTimeout(() => {
        props.onExecuteEndGame();
      }, 2000);
    }
  }, [props.endGame]);

  useEffect(() => {
    if (props.newGame) {
      setSelectedOption(null);
      setRivalOption(null);
    }
  }, [props.newGame]);

  useEffect(() => {
    if (selectedOption) {
      (async () => {
        await props.onPlay(selectedOption);
      })();
    }
  }, [selectedOption]);

  useEffect(() => {
    getUsersData();
  }, [props.room]);

  return (
    <Card style={{ width: '100%' }}>
      <CardHeader xs={{ height: '10%' }}
        avatar={
          <Avatar sx={{ bgcolor: blue[600], color: 'white' }} aria-label="recipe">
            PPT
          </Avatar>
        }
        action={
          <IconButton aria-label="settings" title='Abandonar' onClick={() => props.onPressLeave()}>
            <CloseIcon />
          </IconButton>
        }
        title={`${props.room.game.name} $ ${props.room.game.bet}`}
      />
      <CardContent style={{ width: '100%', height: '90%', backgroundColor: green['900'], padding: 10 }}>
        <Grid container style={{ height: '90%' }} direction="column" justifyContent="space-between">

          <Grid container item>
            <Grid item xs={12} md={4}>
              <UserGameCard user={otherUser} />
            </Grid>
            <Grid item xs={12} md={8} container direction="row" justifyContent="space-around" alignContent="center">
              <Grid item xs="auto"><PPT_OPTION option={rivalOption === 'PIEDRA' ? 'PIEDRA' : 'DOWN'}></PPT_OPTION></Grid>
              <Grid item xs="auto"><PPT_OPTION option={rivalOption === 'PAPEL' ? 'PAPEL' : 'DOWN'}></PPT_OPTION></Grid>
              <Grid item xs="auto"><PPT_OPTION option={rivalOption === 'TIJERA' ? 'TIJERA' : 'DOWN'}></PPT_OPTION></Grid>
            </Grid>
          </Grid>

          <Grid container item direction="row" justifyContent="center" alignItems="center">
            <Grid item container xs="auto" direction="column" justifyContent="center" alignItems="center">
              <Card>
                <CardContent>
                  {
                    props.isWaitingOtherUser ? (
                      <Box>
                        <span>Esperando contrincante.</span>
                        <LinearProgress />
                      </Box>
                    ) : props.roomMessageList.slice(-1)
                  }
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Grid container item>
            <Grid item xs={12} sm={8} container direction="row" justifyContent="space-around" alignContent="center">
              <Grid item xs="auto"><PPT_OPTION onSelectedOption={play} option={selectedOption === 'PIEDRA' || enableGameLayout ? 'PIEDRA' : 'DOWN'}></PPT_OPTION></Grid>
              <Grid item xs="auto"><PPT_OPTION onSelectedOption={play} option={selectedOption === 'PAPEL' || enableGameLayout ? 'PAPEL' : 'DOWN'}></PPT_OPTION></Grid>
              <Grid item xs="auto"><PPT_OPTION onSelectedOption={play} option={selectedOption === 'TIJERA' || enableGameLayout ? 'TIJERA' : 'DOWN'}></PPT_OPTION></Grid>
            </Grid>
            <Grid item xs={4} justifyContent="flex-end">
              <UserGameCard user={localUser} />
            </Grid>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};


export default PPT;
