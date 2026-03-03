import PropTypes from 'prop-types';

// material-ui
import { Avatar, Box, Grid, Typography } from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';

// project imports
import MainCard from '@app/ui-component/cards/MainCard';
import SkeletonEarningCard from '@app/ui-component/cards/Skeleton/EarningCard';

// assets
import { DashboardService } from '@app/services/dashboard.service';
import GamesIcon from '@mui/icons-material/GamepadTwoTone';
import { useEffect, useState } from 'react';


const CardWrapper = styled(MainCard)(({ theme }) => ({
    backgroundColor: theme.palette.primary.dark,
    color: '#fff',
    overflow: 'hidden',
    position: 'relative',
    '&:after': {
        content: '""',
        position: 'absolute',
        width: 210,
        height: 210,
        background: theme.palette.primary[800],
        borderRadius: '50%',
        top: -85,
        right: -95,
        [theme.breakpoints.down('sm')]: {
            top: -105,
            right: -140
        }
    },
    '&:before': {
        content: '""',
        position: 'absolute',
        width: 210,
        height: 210,
        background: theme.palette.primary[800],
        borderRadius: '50%',
        top: -125,
        right: -15,
        opacity: 0.5,
        [theme.breakpoints.down('sm')]: {
            top: -155,
            right: -70
        }
    }
}));

// ===========================|| DASHBOARD DEFAULT - EARNING CARD ||=========================== //

const GamesCard = ({ isLoading }) => {
    const theme = useTheme();
    const [games, setGames] = useState<number>(0);

    const getGames = async () => {
        const games = await DashboardService.getGames();
        setGames(games);
    }

    useEffect(() => {
        getGames();
    }, []);

    return (
        <>
            {isLoading ? (
                <SkeletonEarningCard />
            ) : (
                <CardWrapper border={false} content={false}>
                    <Box sx={{ p: 2.25 }}>
                        <Grid container direction="column">
                            <Grid item>
                                <Grid container justifyContent="space-between">
                                    <Grid item>
                                        <Avatar
                                            variant="rounded"
                                            sx={{
                                                //@ts-ignore
                                                ...theme.typography.commonAvatar,
                                                //@ts-ignore
                                                ...theme.typography.largeAvatar,
                                                backgroundColor: theme.palette.primary[800],
                                                mt: 1,
                                                color: '#fff'
                                            }}
                                        >
                                            <GamesIcon fontSize="inherit" />
                                        </Avatar>
                                    </Grid>

                                </Grid>
                            </Grid>
                            <Grid item>
                                <Grid container alignItems="center">
                                    <Grid item>
                                        <Typography sx={{ fontSize: '2.125rem', fontWeight: 500, mr: 1, mt: 1.75, mb: 0.75 }}>
                                            {games}
                                        </Typography>
                                    </Grid>

                                </Grid>
                            </Grid>
                            <Grid item sx={{ mb: 1.25 }}>
                                <Typography
                                    sx={{
                                        fontSize: '1rem',
                                        fontWeight: 500,
                                    }}
                                >
                                    Total Juegos
                                </Typography>
                            </Grid>
                        </Grid>
                    </Box>
                </CardWrapper>
            )}
        </>
    );
};

GamesCard.propTypes = {
    isLoading: PropTypes.bool
};

export default GamesCard;
