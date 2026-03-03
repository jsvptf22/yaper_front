import { auth } from '@app/firebase';
import { SigninService } from '@app/services/signin.service';
import { SignupService } from '@app/services/signup.service';
import { SESSION_ACTIONS } from '@app/store/sessionReducer';
import {
    GoogleAuthProvider,
    browserLocalPersistence,
    browserSessionPersistence,
    createUserWithEmailAndPassword,
    setPersistence,
    signInWithEmailAndPassword,
    signInWithPopup,
} from 'firebase/auth';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const FIREBASE_ERROR_MESSAGES: Record<string, string> = {
    'auth/user-not-found': 'El correo electrónico o la contraseña son incorrectos',
    'auth/wrong-password': 'El correo electrónico o la contraseña son incorrectos',
    'auth/invalid-credential': 'El correo electrónico o la contraseña son incorrectos',
    'auth/email-already-in-use': 'El correo ya está en uso',
    'auth/too-many-requests': 'Demasiados intentos fallidos. Intenta más tarde',
    'auth/network-request-failed': 'Error de conexión. Verifica tu internet',
};

const createGoogleProvider = () => {
    const provider = new GoogleAuthProvider();
    provider.addScope('https://www.googleapis.com/auth/userinfo.email');
    return provider;
};

export const useAuth = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const getErrorMessage = (code: string): string =>
        FIREBASE_ERROR_MESSAGES[code] ?? 'Ocurrió un error inesperado';

    const dispatchAndNavigate = (user: any) => {
        dispatch({ type: SESSION_ACTIONS.UPDATE_USER, user });
        navigate('/');
    };

    const loginWithEmail = async (email: string, password: string, remember: boolean) => {
        setIsLoading(true);
        try {
            await setPersistence(auth, remember ? browserLocalPersistence : browserSessionPersistence);
            const { user } = await signInWithEmailAndPassword(auth, email, password);
            if (user) {
                const foundUser = await SigninService.exec({ email, password });
                if (foundUser) dispatchAndNavigate(foundUser);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const loginWithGoogle = async () => {
        setIsLoading(true);
        try {
            const { user } = await signInWithPopup(auth, createGoogleProvider());
            if (user) {
                const foundUser = await SigninService.exec({ email: user.email!, password: user.uid });
                if (foundUser) dispatchAndNavigate(foundUser);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const registerWithEmail = async (name: string, email: string, password: string) => {
        setIsLoading(true);
        try {
            const { user } = await createUserWithEmailAndPassword(auth, email, password);
            if (user) {
                const foundUser = await SignupService.exec({ name, email, password, agreed: true });
                if (foundUser) dispatchAndNavigate(foundUser);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const registerWithGoogle = async () => {
        setIsLoading(true);
        try {
            const { user } = await signInWithPopup(auth, createGoogleProvider());
            if (user) {
                const foundUser = await SignupService.exec({
                    name: user.displayName ?? user.email ?? '',
                    email: user.email!,
                    password: user.uid,
                    agreed: true,
                });
                if (foundUser) dispatchAndNavigate(foundUser);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return { loginWithEmail, loginWithGoogle, registerWithEmail, registerWithGoogle, isLoading, getErrorMessage };
};
