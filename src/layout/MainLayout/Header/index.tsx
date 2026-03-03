import PropTypes from 'prop-types';
import useSound from 'use-sound';

// material-ui
import { Avatar, Box, Button, ButtonBase } from '@mui/material';
import { useTheme } from '@mui/material/styles';

// project imports
import LogoSection from '../LogoSection';
import NotificationSection from './NotificationSection';
import ProfileSection from './ProfileSection';

// assets
import moneySound from '@app/assets/sounds/money.mp3';
import { IUser } from '@app/services/models/user';
import { StateType } from '@app/store/reducer';
import { IconMenu2 } from '@tabler/icons';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

// ==============================|| MAIN NAVBAR / HEADER ||============================== //

const Header = ({ handleLeftDrawerToggle }) => {
    const theme = useTheme();
    const [playMoneySound] = useSound(moneySound);
    const [oldUser, setOldUser ] = useState<IUser>();
    const user = useSelector((state:StateType) => state.session.user);

    useEffect(() => {
        if (!oldUser || user.coins !== oldUser!.coins) {
            setOldUser(user);
            console.log('money changed');
            playMoneySound();
        }
    }, [user]);


    return (
        <>
            <Box
                sx={{
                    width: 228,
                    display: 'flex',
                    [theme.breakpoints.down('md')]: {
                        width: 'auto'
                    }
                }}
            >
                <Box component="span" sx={{ display: { xs: 'none', md: 'block' }, flexGrow: 1 }}>
                    <LogoSection />
                </Box>
                <ButtonBase sx={{ borderRadius: '12px', overflow: 'hidden' }}>
                    <Avatar
                        variant="rounded"
                        sx={{
                            //@ts-ignore
                            ...theme.typography.commonAvatar,
                            //@ts-ignore
                            ...theme.typography.mediumAvatar,
                            transition: 'all .2s ease-in-out',
                            background: theme.palette.secondary.light,
                            color: theme.palette.secondary.dark,
                            '&:hover': {
                                background: theme.palette.secondary.dark,
                                color: theme.palette.secondary.light
                            }
                        }}
                        onClick={handleLeftDrawerToggle}
                        color="inherit"
                    >
                        <IconMenu2 stroke={1.5} size="1.3rem" />
                    </Avatar>
                </ButtonBase>
            </Box>

            <Box sx={{ flexGrow: 1 }} />
            <Button  variant='contained' size='large'>$ {user.coins}</Button>
            <Box sx={{ flexGrow: 1 }} />

            <NotificationSection />
            <ProfileSection />
        </>
    );
};

Header.propTypes = {
    handleLeftDrawerToggle: PropTypes.func
};

export default Header;
