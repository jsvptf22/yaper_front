import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';


// material-ui
import {
    Box,
    Button,
    Checkbox,
    Divider,
    FormControl,
    FormControlLabel,
    FormHelperText,
    Grid,
    IconButton,
    InputAdornment,
    InputLabel,
    OutlinedInput,
    TextField,
    Typography,
    useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

// third party
import { Formik } from 'formik';
import * as Yup from 'yup';

// project imports
import Google from '@app/assets/images/icons/social-google.svg';
import useScriptRef from '@app/hooks/useScriptRef';
import AnimateButton from '@app/ui-component/extended/AnimateButton';
import { strengthColor, strengthIndicator } from '@app/utils/password-strength';

// assets
import { auth } from '@app/firebase';
import { SignupService } from '@app/services/signup.service';
import { StateType } from '@app/store/reducer';
import { SESSION_ACTIONS } from '@app/store/sessionReducer';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { Theme } from '@mui/system/createTheme';
import { GoogleAuthProvider, createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth';

// ===========================|| FIREBASE - REGISTER ||=========================== //

const FirebaseRegister = ({ ...others }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const theme: Theme = useTheme();
    const scriptedRef = useScriptRef();
    const matchDownSM = useMediaQuery(theme.breakpoints.down('md'));
    const customization = useSelector((state: StateType) => state.customization);
    const [showPassword, setShowPassword] = useState(false);
    const [checked, setChecked] = useState(true);

    const [strength, setStrength] = useState(0);
    const [level, setLevel] = useState();

    const googleHandler = async () => {
        var provider = new GoogleAuthProvider();
        provider.addScope('https://www.googleapis.com/auth/userinfo.email');

        try {
            const userCredential = await signInWithPopup(auth, provider);
            const user = userCredential.user;
            console.log(user);

            if (user) {
                const findedUser = await SignupService.exec({
                    name: user.displayName,
                    email: user.email,
                    password: user.uid,
                    agreed: true
                })
                dispatch({ type: SESSION_ACTIONS.UPDATE_USER, user: findedUser });
                navigate('/')
            }
        } catch (error) {
            console.log(error);
        }
    };

    const handleClickShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const handleMouseDownPassword = (event) => {
        event.preventDefault();
    };

    const changePassword = (value) => {
        const temp = strengthIndicator(value);
        setStrength(temp);
        setLevel(strengthColor(temp));
    };

    useEffect(() => {
        changePassword('123456');
    }, []);

    return (
        <>
            <Grid container direction="column" justifyContent="center" spacing={2}>
                <Grid item xs={12}>
                    <AnimateButton>
                        <Button
                            variant="outlined"
                            fullWidth
                            onClick={googleHandler}
                            size="large"
                            sx={{
                                color: 'grey.700',
                                backgroundColor: theme.palette.grey[50],
                                borderColor: theme.palette.grey[100]
                            }}
                        >
                            <Box sx={{ mr: { xs: 1, sm: 2, width: 20 } }}>
                                <img src={Google} alt="google" width={16} height={16} style={{ marginRight: matchDownSM ? 8 : 16 }} />
                            </Box>
                            Registrate con Google
                        </Button>
                    </AnimateButton>
                </Grid>
                <Grid item xs={12}>
                    <Box sx={{ alignItems: 'center', display: 'flex' }}>
                        <Divider sx={{ flexGrow: 1 }} orientation="horizontal" />
                        <Button
                            variant="outlined"
                            sx={{
                                cursor: 'unset',
                                m: 2,
                                py: 0.5,
                                px: 7,
                                borderColor: `${theme.palette.grey[100]} !important`,
                                color: `${theme.palette.grey[900]}!important`,
                                fontWeight: 500,
                                borderRadius: `${customization.borderRadius}px`
                            }}
                            disableRipple
                            disabled
                        >
                            OR
                        </Button>
                        <Divider sx={{ flexGrow: 1 }} orientation="horizontal" />
                    </Box>
                </Grid>
                <Grid item xs={12} container alignItems="center" justifyContent="center">
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle1">
                            Registrate con tu correo electronico
                        </Typography>
                    </Box>
                </Grid>
            </Grid>

            <Formik
                initialValues={{
                    name: '',
                    lastname: '',
                    email: '',
                    password: '',
                    agree: true
                }}
                validationSchema={Yup.object().shape({
                    name: Yup.string().max(255).required('Nombre es requerido'),
                    lastname: Yup.string().max(255).required('Apellido es requerido'),
                    email: Yup.string().email('Correo invalido').max(255).required('Correo es requerido'),
                    password: Yup.string().min(5).max(255).required('Contraseña es requerida'),
                    agree: Yup.boolean().required('Debes aceptar los terminos y condiciones')
                })}
                onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
                    try {
                        const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password)

                        const user = userCredential.user;
                        console.log(user);
                        if (user) {
                            const findedUser = await SignupService.exec({
                                name: values.name + ' ' + values.lastname,
                                email: values.email,
                                password: values.password,
                                agreed: values.agree
                            })
                            dispatch({ type: SESSION_ACTIONS.UPDATE_USER, user: findedUser });
                            navigate('/')
                        }

                        if (scriptedRef.current) {
                            setStatus({ success: true });
                            setSubmitting(false);
                        }
                    } catch (err) {
                        if (err.code === 'auth/email-already-in-use') {
                            //@ts-ignore
                            setErrors({ submit: 'El correo ya esta en uso' });
                        }
                        if (scriptedRef.current) {
                            setStatus({ success: false });
                            //@ts-ignore
                            setErrors({ submit: err.message });
                            setSubmitting(false);
                        }
                    }
                }}
            >
                {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
                    <form noValidate onSubmit={handleSubmit} {...others}>
                        <Grid container spacing={matchDownSM ? 0 : 2}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Nombre"
                                    margin="normal"
                                    name="fname"
                                    type="text"
                                    onChange={(e) => values.name = e.target.value}
                                    //@ts-ignore
                                    sx={{ ...theme.typography.customInput }}
                                />
                                {touched.name && errors.name && (
                                    <FormHelperText error id="standard-weight-helper-text--register">
                                        {errors.name}
                                    </FormHelperText>
                                )}
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Apellido"
                                    margin="normal"
                                    name="lname"
                                    type="text"
                                    onChange={(e) => values.lastname = e.target.value}
                                    //@ts-ignore
                                    sx={{ ...theme.typography.customInput }}
                                />
                                {touched.lastname && errors.lastname && (
                                    <FormHelperText error id="standard-weight-helper-text--register">
                                        {errors.lastname}
                                    </FormHelperText>
                                )}
                            </Grid>
                        </Grid>
                        {/*@ts-ignore*/}
                        <FormControl fullWidth error={Boolean(touched.email && errors.email)} sx={{ ...theme.typography.customInput }}>
                            <InputLabel htmlFor="outlined-adornment-email-register">Correo electrónico</InputLabel>
                            <OutlinedInput
                                id="outlined-adornment-email-register"
                                type="email"
                                value={values.email}
                                name="email"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                inputProps={{}}
                            />
                            {touched.email && errors.email && (
                                <FormHelperText error id="standard-weight-helper-text--register">
                                    {errors.email}
                                </FormHelperText>
                            )}
                        </FormControl>

                        <FormControl
                            fullWidth
                            error={Boolean(touched.password && errors.password)}
                            //@ts-ignore
                            sx={{ ...theme.typography.customInput }}
                        >
                            <InputLabel htmlFor="outlined-adornment-password-register">Contraseña</InputLabel>
                            <OutlinedInput
                                id="outlined-adornment-password-register"
                                type={showPassword ? 'text' : 'password'}
                                value={values.password}
                                name="password"
                                label="Password"
                                onBlur={handleBlur}
                                onChange={(e) => {
                                    handleChange(e);
                                    changePassword(e.target.value);
                                }}
                                endAdornment={
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="toggle password visibility"
                                            onClick={handleClickShowPassword}
                                            onMouseDown={handleMouseDownPassword}
                                            edge="end"
                                            size="large"
                                        >
                                            {showPassword ? <Visibility /> : <VisibilityOff />}
                                        </IconButton>
                                    </InputAdornment>
                                }
                                inputProps={{}}
                            />
                            {touched.password && errors.password && (
                                <FormHelperText error id="standard-weight-helper-text-password-register">
                                    {errors.password}
                                </FormHelperText>
                            )}
                        </FormControl>

                        {strength !== 0 && (
                            <FormControl fullWidth>
                                <Box sx={{ mb: 2 }}>
                                    <Grid container spacing={2} alignItems="center">
                                        <Grid item>
                                            <Box
                                                //@ts-ignore
                                                style={{ backgroundColor: level?.color }}
                                                sx={{ width: 85, height: 8, borderRadius: '7px' }}

                                            />

                                        </Grid>
                                        <Grid item>
                                            <Typography variant="subtitle1" fontSize="0.75rem">
                                                {/*@ts-ignore*/}
                                                {level?.label}
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                </Box>
                            </FormControl>
                        )}

                        <Grid container alignItems="center" justifyContent="space-between">
                            <Grid item>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={checked}
                                            onChange={(event) => values.agree = event.target.checked}
                                            name="checked"
                                            color="primary"
                                        />
                                    }
                                    label={
                                        <Typography variant="subtitle1">
                                            Acepto los &nbsp;
                                            <Typography variant="subtitle1" component={Link} to="#">
                                                terminos y condiciones
                                            </Typography>
                                        </Typography>
                                    }
                                />
                                {touched.agree && errors.agree && (
                                    <FormHelperText error id="standard-weight-helper-text--register">
                                        {errors.agree}
                                    </FormHelperText>
                                )}
                            </Grid>
                        </Grid>
                        {/*@ts-ignore*/}
                        {errors.submit && (
                            <Box sx={{ mt: 3 }}>
                                {/*@ts-ignore*/}
                                <FormHelperText error>{errors.submit}</FormHelperText>
                            </Box>
                        )}

                        <Box sx={{ mt: 2 }}>
                            <AnimateButton>
                                <Button
                                    disableElevation
                                    disabled={isSubmitting}
                                    fullWidth
                                    size="large"
                                    type="submit"
                                    variant="contained"
                                    color="secondary"
                                >
                                    Registrarse
                                </Button>
                            </AnimateButton>
                        </Box>
                    </form>
                )}
            </Formik>
        </>
    );
};

export default FirebaseRegister;
