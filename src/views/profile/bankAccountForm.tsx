// material-ui
import { Box, FormControl, InputLabel, MenuItem, Select, TextField } from '@mui/material';

// project imports
import { BankAccountService } from '@app/services/bankAccount.service';
import { StateType } from '@app/store/reducer';
import { LoadingButton } from '@mui/lab';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

const BankAccountForm = (props: {onCreateAccount: Function}) => {
    const [savingAccount, setSavingAccount] = useState(false);
    const user = useSelector((state:StateType ) => state.session.user);
    const [formState, setFormState] = useState({
        customName: '',
        bankName: '',
        type: '',
        number: '',
        description: '',
      });

    const handleFormChange = (event) => {
        const { name, value } = event.target;
        setFormState((prevState) => ({ ...prevState, [name]: value }));
    };

    const handleFormSubmit = async (event) => {
        event.preventDefault();
        
        let errorMessage = '';

        if(!formState.description.length){
            errorMessage = 'De indicaciones breves para el momento de realizar el pago'
        }

        if(!formState.number.length){
            errorMessage = 'Debe indicar el número de cuenta'
        }

        if(!formState.type.length){
            errorMessage = 'Debe indicar el tipo de cuenta'
        }

        if(!formState.bankName.length){
            errorMessage = 'Debe indicar el banco'
        }

        if(!formState.customName.length){
            errorMessage = 'Debe indicar un nombre'
        }

        if(errorMessage.length){
            toast.warning(errorMessage, {
                autoClose: 3000
            });
            return;
        }
        setSavingAccount(true);
        await BankAccountService.createBankAccount(formState);
        toast.success('Cuenta vinculada', {
            autoClose: 3000
        });
        setSavingAccount(false);
        props.onCreateAccount();
        setFormState({
            customName: '',
            bankName: '',
            type: '',
            number: '',
            description: '',
        });
    };

    return (
        <Box>
            <form onSubmit={handleFormSubmit}>
            <TextField
                label="Nombre personalizado"
                name="customName"
                value={formState.customName}
                onChange={handleFormChange}
                variant="outlined"
                fullWidth
                sx={{ mt: 2 }}
            />
            <FormControl variant="outlined" fullWidth sx={{ mt: 2 }}>
                <InputLabel id="bank-name-label">Banco</InputLabel>
                <Select
                labelId="bank-name-label"
                id="bank-name"
                name="bankName"
                value={formState.bankName}
                onChange={handleFormChange}
                label="Banco"
                >
                <MenuItem value="Bancolombia">Bancolombia</MenuItem>
                <MenuItem value="Nequi">Nequi</MenuItem>
                <MenuItem value="Ahorro a la mano">Ahorro a la mano</MenuItem>
                </Select>
            </FormControl>
            <TextField
                label="Tipo de cuenta"
                name="type"
                value={formState.type}
                onChange={handleFormChange}
                variant="outlined"
                fullWidth
                sx={{ mt: 2 }}
            />
            <TextField
                label="Número de cuenta"
                name="number"
                value={formState.number}
                onChange={handleFormChange}
                variant="outlined"
                fullWidth
                sx={{ mt: 2 }}
            />
            <TextField
                label="Descripción"
                name="description"
                value={formState.description}
                onChange={handleFormChange}
                variant="outlined"
                fullWidth
                multiline
                rows={4}
                sx={{ mt: 2 }}
            />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                    <LoadingButton
                        type="submit"
                        loading={savingAccount}
                        variant="contained"
                    >
                        Registrar
                    </LoadingButton>
                </Box>
            </form>
        </Box>
    )
};

export default BankAccountForm;
