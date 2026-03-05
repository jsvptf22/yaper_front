import PropTypes from 'prop-types';

// material-ui
import { Avatar, Box, Grid, Typography } from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';

// project imports
import MainCard from '@app/ui-component/cards/MainCard';
import SkeletonEarningCard from '@app/ui-component/cards/Skeleton/EarningCard';

// assets
import EarningIcon from '@app/assets/images/icons/earning.svg';
import { StateType } from '@app/store/reducer';
import { useSelector } from 'react-redux';

const CardWrapper = styled(MainCard)(({ theme }) => ({
    backgroundColor: theme.palette.grey[500],
    color: '#fff',
    overflow: 'hidden',
    position: 'relative',
    '&:after': {
        content: '""',
        position: 'absolute',
        width: 210,
        height: 210,
        background: theme.palette.success.dark,
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
        background: theme.palette.success.dark,
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

const MoneyCard = ({ isLoading }) => {
    const theme = useTheme();
    const user = useSelector((state: StateType) => state.session.user);


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
                                                backgroundColor: theme.palette.success.dark,
                                                mt: 1
                                            }}
                                        >
                                            <img src={EarningIcon} alt="Notification" />
                                        </Avatar>
                                    </Grid>

                                </Grid>
                            </Grid>
                            <Grid item>
                                <Grid container alignItems="center">
                                    <Grid item>
                                        <Typography sx={{ fontSize: '2.125rem', fontWeight: 500, mr: 1, mt: 1.75, mb: 0.75 }}>
                                            ${user?.coins ?? 0}
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </Grid>
                            <Grid item sx={{ mb: 1.25 }}>
                                <Typography
                                    sx={{
                                        fontSize: '1rem',
                                        fontWeight: 500

                                    }}
                                >
                                    Dinero total
                                </Typography>
                            </Grid>
                        </Grid>
                    </Box>
                </CardWrapper>
            )}
        </>
    );
};

MoneyCard.propTypes = {
    isLoading: PropTypes.bool
};

export default MoneyCard;
