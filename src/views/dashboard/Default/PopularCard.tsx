import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';

// material-ui
import { Avatar, CardContent, Divider, Grid, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';

// project imports
import { gridSpacing } from '@app/store/constant';
import MainCard from '@app/ui-component/cards/MainCard';
import SkeletonPopularCard from '@app/ui-component/cards/Skeleton/PopularCard';

// assets
import { DashboardService } from '@app/services/dashboard.service';
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined';
import KeyboardArrowUpOutlinedIcon from '@mui/icons-material/KeyboardArrowUpOutlined';
import KeyboardDoubleArrowRight from '@mui/icons-material/KeyboardDoubleArrowRight';
import { Theme } from '@mui/system/createTheme';
// ==============================|| DASHBOARD DEFAULT - POPULAR CARD ||============================== //

export enum LastTenGamesWinType {
    EQUAL = 'EQUAL',
    WIN = 'WIN',
    LOSE = 'LOSE',
}

export interface LastTenGamesType {
    id: number;
    name: string;
    bet: number;
    win: LastTenGamesWinType;
}


const PopularCard = ({ isLoading }) => {
    const theme: Theme = useTheme();
    const [lastTenGames, setLastTenGames] = useState<LastTenGamesType[]>([]);

    const getLastTenGames = async () => {
        const lastTenGames = await DashboardService.getLastTenGames();
        console.log(lastTenGames);
        setLastTenGames(lastTenGames);
    };

    const losseRIcon = () => {
        return <Avatar
            variant="rounded"
            sx={{
                width: 16,
                height: 16,
                borderRadius: '5px',
                backgroundColor: theme.palette.orange.light,
                color: theme.palette.orange.dark,
                marginLeft: 1.875
            }}
        >
            <KeyboardArrowDownOutlinedIcon fontSize="small" color="inherit" />
        </Avatar>
    }

    const winnerIcon = () => {
        return <Avatar
            variant="rounded"
            sx={{
                width: 16,
                height: 16,
                borderRadius: '5px',
                backgroundColor: theme.palette.success.light,
                color: theme.palette.success.dark,
                marginLeft: 1.875
            }}
        >
            <KeyboardArrowUpOutlinedIcon fontSize="small" color="inherit" />
        </Avatar>
    }

    const equalIcon = () => {
        return <Avatar
            variant="rounded"
            sx={{
                width: 16,
                height: 16,
                borderRadius: '5px',
                backgroundColor: theme.palette.grey[500],
                color: '#fff',
                marginLeft: 1.875
            }}
        >
            <KeyboardDoubleArrowRight fontSize="small" color="inherit" />
        </Avatar>
    }




    const getIcon = (win: LastTenGamesWinType) => {
        switch (win) {
            case LastTenGamesWinType.EQUAL:
                return equalIcon();
            case LastTenGamesWinType.WIN:
                return winnerIcon();
            case LastTenGamesWinType.LOSE:
                return losseRIcon();
            default:
                return null;
        }
    }

    useEffect(() => {
        getLastTenGames();
    }, []);

    return (
        <>
            {isLoading ? (
                <SkeletonPopularCard />
            ) : (
                <MainCard content={false}>
                    <CardContent>
                        <Grid container spacing={gridSpacing}>
                            <Grid item xs={12}>
                                <Grid container alignContent="center" justifyContent="space-between">
                                    <Grid item>
                                        <Typography variant="h4">Ultimos 10 juegos!</Typography>
                                    </Grid>

                                </Grid>
                            </Grid>

                            <Grid item xs={12}>

                                {lastTenGames.map((game: LastTenGamesType) => (
                                    <>
                                        <Grid container direction="column">
                                            <Grid item>
                                                <Grid container alignItems="center" justifyContent="space-between">
                                                    <Grid item>
                                                        <Typography variant="subtitle1" color="inherit">
                                                            {game.name}
                                                        </Typography>
                                                    </Grid>
                                                    <Grid item>
                                                        <Grid container alignItems="center" justifyContent="space-between">
                                                            <Grid item>
                                                                <Typography variant="subtitle1" color="inherit">
                                                                    ${game.bet}
                                                                </Typography>
                                                            </Grid>
                                                            <Grid item>
                                                                {getIcon(game.win)}
                                                            </Grid>
                                                        </Grid>
                                                    </Grid>
                                                </Grid>
                                            </Grid>

                                        </Grid>
                                        <Divider sx={{ my: 1.5 }} />
                                    </>
                                ))}
                            </Grid>
                        </Grid>
                    </CardContent>

                </MainCard>
            )}
        </>
    );
};

PopularCard.propTypes = {
    isLoading: PropTypes.bool
};

export default PopularCard;
