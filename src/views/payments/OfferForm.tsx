import { IOffer } from '@app/services/models/offer';
import { BankAccount } from '@app/services/models/user';
import { OfferService } from '@app/services/offer.service';
import { StateType } from '@app/store/reducer';
import { LoadingButton } from '@mui/lab';
import { Box, FormControl, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

const OfferForm = (props: {onCreateOffer: Function, bankAccounts: BankAccount[]}) => {
    const [savingOffer, setSavingOffer] = useState(false);
    const user = useSelector((state:StateType ) => state.session.user);
    const [formState, setFormState] = useState<Partial<IOffer>>({
        bank_account_id: '',
        coins: 0,
        money: 0,
    });

    const handleFormChange = (event) => {
        const { name, value } = event.target;
        setFormState((prevState) => ({ ...prevState, [name]: value }));
    };

    const handleFormSubmit = async (event) => {
        event.preventDefault();
        
        let errorMessage = '';

        if(!formState.bank_account_id){
            errorMessage = 'Debe indicar la cuenta bancaria'
        }

        if(!+formState.coins){
            errorMessage = 'Debe indicar las monedas a vender'
        }

        if(+formState.coins < 10000){
            errorMessage = 'La cantidad minima de monedas a vender es 10000'
        }

        if(+formState.coins > user.coins){
            errorMessage = 'No puede vender mas monedas de las que tiene'
        }

        if(!+formState.money || +formState.money < 0){
            errorMessage = 'Debe indicar el dinero a recibir'
        }

        if(errorMessage.length){
            toast.warning(errorMessage, {
                autoClose: 3000
            });
            return;
        }
        
        setSavingOffer(true);
        const offer = await OfferService.create(formState);
        if(offer){
            toast.success('Oferta publicada!', {
                autoClose: 3000
            });
            props.onCreateOffer();
            setFormState({
                bank_account_id: '',
                coins: 0,
                money: 0,
            });
        }
        setSavingOffer(false);
    };

    return (
        <Box>
            <form onSubmit={handleFormSubmit}>
            <TextField
                type='number'
                label="Monedas a vender"
                name="coins"
                value={formState.coins}
                onChange={handleFormChange}
                variant="outlined"
                fullWidth
                sx={{ mt: 2 }}
            />
            <TextField
                type='number'
                label="Oferta en pesos"
                name="money"
                value={formState.money}
                onChange={handleFormChange}
                variant="outlined"
                fullWidth
                sx={{ mt: 2 }}
            />
            <FormControl variant="outlined" fullWidth sx={{ mt: 2 }}>
                <InputLabel id="bank-account-label">Banco</InputLabel>
                <Select
                labelId="bank-account-label"
                id="bank-account"
                name="bank_account_id"
                value={formState.bank_account_id}
                onChange={handleFormChange}
                label="Banco"
                >
                    {props.bankAccounts.map((bankAccount) => (
                        <MenuItem value={bankAccount._id} key={bankAccount._id} >{bankAccount.customName}</MenuItem>
                    ))}
                </Select>
            </FormControl>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <LoadingButton
                    type="submit"
                    loading={savingOffer}
                    variant="contained"
                >
                    Crear oferta
                </LoadingButton>
            </Box>
            </form>
        </Box>
    )
};

export default OfferForm;
