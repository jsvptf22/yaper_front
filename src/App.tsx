import { CssBaseline, StyledEngineProvider } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import NavigationScroll from './layout/NavigationScroll';
import Router from './routes';
import { GraphqlService } from './services/graphql.service';
import { IUser } from './services/models/user';
import { UserService } from './services/user.service';
import { StateType } from './store/reducer';
import { SESSION_ACTIONS } from './store/sessionReducer';
import themes from './themes';

function App() {
  const dispatch = useDispatch();
  const user = useSelector((state: StateType) => state.session.user);
  const [userSubscription, setUserSubscription] = useState<any | null>(null);

  const suscribeToUser = (user: IUser) => {
    const observer = GraphqlService.getClient().subscribe({
      query: UserService.userUpdateSuscription(),
      variables: {
        id: user._id,
      },
    });

    const subscription = observer.subscribe((res) => {
      const actualUser: IUser = res.data.userUpdate;
      actualUser.token = user.token;
      dispatch({ type: SESSION_ACTIONS.UPDATE_USER, user: actualUser });
    });

    setUserSubscription(subscription);
  };

  const unsuscribeToUser = () => {
    if (userSubscription) {
      userSubscription.unsubscribe();
      setUserSubscription(null);
    }
  };

  useEffect(() => {
    if (!userSubscription && user) {
      console.log('se suscribe al usuario')
      suscribeToUser(user);
    }

    if (userSubscription && !user) {
      console.log('se desuscribe al usuario')
      unsuscribeToUser();
    }
  }, [userSubscription, user]);

  useEffect(() => {
    if (user) {
      (async () => {
        const findedUser = await UserService.findByEmail(user.email)
        const completedUser = {
          ...user,
          ...findedUser,
        }

        dispatch({ type: SESSION_ACTIONS.UPDATE_USER, user: completedUser });
      })();
    } else {
      unsuscribeToUser();
    }
  }, []);

  const customization = useSelector((state: StateType) => state.customization);
  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={themes(customization)}>
        <CssBaseline />
        <NavigationScroll>
          <Router />
        </NavigationScroll>
        <ToastContainer />
      </ThemeProvider>
    </StyledEngineProvider>
  );
}

export default App;