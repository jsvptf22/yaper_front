import { CssBaseline, StyledEngineProvider } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Router from './routes';
import { GraphqlService } from './services/graphql.service';
import { UserService } from './services/user.service';
import { StateType } from './store/reducer';
import { SESSION_ACTIONS } from './store/sessionReducer';
import themes from './themes';

function App() {
    const dispatch = useDispatch();
    const user = useSelector((state: StateType) => state.session.user);
    const subscriptionRef = useRef<{ unsubscribe: () => void } | null>(null);
    const tokenRef = useRef<string | null>(null);

    // Keep tokenRef in sync so the subscription callback always uses the latest token
    useEffect(() => {
        tokenRef.current = user?.token ?? null;
    }, [user?.token]);

    // Fetch latest user data on mount
    useEffect(() => {
        if (!user) return;
        (async () => {
            const fetchedUser = await UserService.findByEmail(user.email);
            dispatch({
                type: SESSION_ACTIONS.UPDATE_USER,
                user: { ...user, ...fetchedUser }
            });
        })();
    }, []);

    // Manage WebSocket subscription lifecycle based on user identity
    useEffect(() => {
        if (!user) return;

        const observer = GraphqlService.getClient().subscribe({
            query: UserService.userUpdateSuscription(),
            variables: { id: user._id }
        });

        subscriptionRef.current = observer.subscribe((res) => {
            dispatch({
                type: SESSION_ACTIONS.UPDATE_USER,
                user: { ...res.data.userUpdate, token: tokenRef.current }
            });
        });

        return () => {
            subscriptionRef.current?.unsubscribe();
            subscriptionRef.current = null;
        };
    }, [user?._id]);

    const customization = useSelector((state: StateType) => state.customization);
    return (
        <StyledEngineProvider injectFirst>
            <ThemeProvider theme={themes(customization)}>
                <CssBaseline />
                <Router />
                <ToastContainer />
            </ThemeProvider>
        </StyledEngineProvider>
    );
}

export default App;
