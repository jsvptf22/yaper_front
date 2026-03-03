import MainLayout from '@app/layout/MainLayout';
import MinimalLayout from '@app/layout/MinimalLayout';
import { StateType } from '@app/store/reducer';
import Loadable from '@app/ui-component/Loadable';
import { ProtectedRoute } from '@app/views/components/ProtectedRoute';
import { lazy } from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useRoutes } from 'react-router-dom';
const DashboardDefault = Loadable(lazy(() => import('@app/views/dashboard/Default')));
const DashboardGames = Loadable(lazy(() => import('@app/views/dashboard/Games')));
const Profile = Loadable(lazy(() => import('@app/views/profile')));
const Recharge = Loadable(lazy(() => import('@app/views/payments/Recharge')));
const Offer = Loadable(lazy(() => import('@app/views/payments/Offer')));
const UtilsColor = Loadable(lazy(() => import('@app/views/utilities/Color')));
const UtilsTablerIcons = Loadable(lazy(() => import('@app/views/utilities/TablerIcons')));
const SamplePage = Loadable(lazy(() => import('@app/views/sample-page')));
const AuthLogin3 = Loadable(lazy(() => import('@app/views/pages/authentication/authentication3/Login3')));
const AuthRegister3 = Loadable(lazy(() => import('@app/views/pages/authentication/authentication3/Register3')));

export default function ThemeRoutes() {
    const user = useSelector((state: StateType) => state.session.user);

    //@ts-ignore
    if (!window.ReactNativeWebView && import.meta.env.VITE_ENV !== 'DEV') {
        return useRoutes([
            {
                path: '/',
                element: <Navigate to={'/error'} replace />
            }
        ]);
    } else {
        return useRoutes([
            {
                element: <ProtectedRoute user={user} />,
                children: [
                    {
                        path: '/dashboard',
                        element: <MainLayout />,
                        children: [
                            {
                                path: 'default',
                                element: <DashboardGames />
                            },
                            {
                                path: 'data',
                                element: <DashboardDefault />
                            },
                            {
                                path: 'utils',
                                children: [
                                    {
                                        path: 'util-color',
                                        element: <UtilsColor />
                                    }
                                ]
                            },
                            {
                                path: 'icons',
                                children: [
                                    {
                                        path: 'tabler-icons',
                                        element: <UtilsTablerIcons />
                                    }
                                ]
                            },
                            {
                                path: 'sample-page',
                                element: <SamplePage />
                            }
                        ]
                    },
                    {
                        path: '/profile',
                        element: <MainLayout />,
                        children: [
                            {
                                path: 'default',
                                element: <Profile />
                            },
                        ]
                    },
                    {
                        path: '/payments',
                        element: <MainLayout />,
                        children: [
                            {
                                path: 'recharge',
                                element: <Recharge />
                            },
                            {
                                path: 'offer',
                                element: <Offer />
                            },
                        ]
                    }
                ]
            },
            {
                path: 'auth',
                element: <MinimalLayout />,
                children: [
                    {
                        path: 'signin',
                        element: <AuthLogin3 />
                    },
                    {
                        path: 'signup',
                        element: <AuthRegister3 />
                    }
                ]
            },
            {
                path: '/',
                element: <Navigate to={user ? '/dashboard/default' : '/auth/signin'} replace />
            }
        ]);
    }
}
