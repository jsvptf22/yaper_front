// material-ui
import { Alert, AlertTitle, Avatar, Box, Button, Card, CardContent, CardHeader, Divider, Grid, TextField, Typography } from '@mui/material';

// project imports
import { BankAccountService } from '@app/services/bankAccount.service';
import { BankAccount } from '@app/services/models/user';
import { UserService } from '@app/services/user.service';
import { gridSpacing } from '@app/store/constant';
import { StateType } from '@app/store/reducer';
import { LoadingButton } from '@mui/lab';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import BankAccountForm from './bankAccountForm';

const Profile = () => {
    const [savingProfile, setSavingProfile] = useState(false);
    const [accountList, setAccountList] = useState([]);
    const [showAccountForm, setshowAccountForm] = useState(false);
    const user = useSelector((state: StateType) => state.session.user);
    const [formState, setFormState] = useState({
        id: user._id,
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        username: user.username || '',
    });

    const handleFormChange = (event) => {
        const { name, value } = event.target;
        setFormState((prevState) => ({ ...prevState, [name]: value }));
    };

    const handleFormSubmit = async (event) => {
        event.preventDefault();

        let errorMessage = '';
        if (!formState.name.length) {
            errorMessage = 'Debe indicar el nombre'
        }

        if (!formState.email.length) {
            errorMessage = 'Debe indicar el correo'
        }

        if (!formState.phone.length) {
            errorMessage = 'Debe indicar el teléfono'
        }

        if (!formState.username.length) {
            errorMessage = 'Debe indicar el nombre de usuario'
        }

        if (errorMessage.length) {
            toast.warning(errorMessage, {
                autoClose: 3000
            });
            return;
        }
        setSavingProfile(true);
        await UserService.update(formState);
        toast.success('Datos actualizados', {
            autoClose: 3000
        });
        setSavingProfile(false);
    };

    const findAccounts = async () => {
        const accounts: BankAccount[] = await BankAccountService.getAccounts();
        setAccountList(accounts);
    }

    useEffect(() => {
        findAccounts();
    }, []);

    return (
        <Grid container spacing={gridSpacing}>
            <Grid item xs={12} md={6}>
                <Card>
                    <CardHeader
                        avatar={
                            <Avatar src={user.image || undefined} sx={{ width: 100, height: 100 }}>
                                {user.image ? undefined : user.name?.charAt(0)}
                            </Avatar>
                        }
                        title={user.name}
                        subheader={user.email}
                    />
                    <CardContent>
                        <Alert severity="info" variant='filled'>
                            <AlertTitle>Monedas</AlertTitle>
                            <h2><strong>${user.coins}</strong></h2>
                        </Alert>
                    </CardContent>
                </Card>
            </Grid>
            <Grid item xs={12} md={6}>
                <Card>
                    <CardContent>
                        <h5>Datos personales</h5>
                        <Divider />
                        <form onSubmit={handleFormSubmit}>
                            <TextField
                                label="Nombre"
                                name="name"
                                value={formState.name}
                                onChange={handleFormChange}
                                variant="outlined"
                                fullWidth
                                sx={{ mt: 2 }}
                            />
                            <TextField
                                label="Email"
                                name="email"
                                value={formState.email}
                                onChange={handleFormChange}
                                variant="outlined"
                                fullWidth
                                sx={{ mt: 2 }}
                            />
                            <TextField
                                label="Teléfono"
                                name="phone"
                                value={formState.phone}
                                onChange={handleFormChange}
                                variant="outlined"
                                fullWidth
                                sx={{ mt: 2 }}
                            />
                            <TextField
                                label="Nombre de usuario"
                                name="username"
                                value={formState.username}
                                onChange={handleFormChange}
                                variant="outlined"
                                fullWidth
                                sx={{ mt: 2 }}
                            />
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                                <LoadingButton
                                    type="submit"
                                    loading={savingProfile}
                                    variant="contained"
                                >
                                    Actualizar perfil
                                </LoadingButton>
                            </Box>
                        </form>
                    </CardContent>
                </Card>
            </Grid>
            <Grid item xs={12} md={6}>
                <Card>
                    <CardContent>
                        <h5>Cuentas bancarias</h5>
                        <Divider />
                        {accountList.map((account: BankAccount) => {
                            return <Alert key={account._id} severity="info" variant='outlined' sx={{ my: '5px' }} >
                                <Typography sx={{ display: 'block' }}>Nombre: {account.customName}</Typography>
                                <Typography sx={{ display: 'block' }}>Banco: {account.bankName}</Typography>
                                <Typography sx={{ display: 'block' }}>Nùmero: {account.number}</Typography>
                                <Typography sx={{ display: 'block' }}>Tipo: {account.type}</Typography>
                                <Typography sx={{ display: 'block' }}>Descripción: {account.description}</Typography>
                                <Divider />
                            </Alert>
                        })}
                        {accountList.length === 0 && <Alert severity="warning">No tienes cuentas bancarias registradas</Alert>}

                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', my: 2 }}>
                            {!showAccountForm && <Button variant='contained' size="small" onClick={() => { setshowAccountForm(true) }}>Agregar cuenta</Button>}
                        </Box>

                        {showAccountForm && <>
                            <Divider></Divider>
                            <BankAccountForm onCreateAccount={() => findAccounts()}></BankAccountForm>
                        </>}
                    </CardContent>
                </Card>
            </Grid>

        </Grid>
    )
};

export default Profile;
