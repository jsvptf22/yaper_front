import { BankAccountService } from "@app/services/bankAccount.service";
import { IOffer } from "@app/services/models/offer";
import { BankAccount } from "@app/services/models/user";
import { OfferService } from "@app/services/offer.service";
import { StateType } from "@app/store/reducer";
import { Alert, AlertTitle, Avatar, Box, Button, Card, CardContent, CardHeader, Divider, Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import OfferForm from "./OfferForm";

export default function Offer() {
  const navigate = useNavigate();
  const user = useSelector((state:StateType ) => state.session.user);
  const [offers, setOffers] = useState<IOffer[]>([]);
  const [accountList, setAccountList] = useState<BankAccount[]>([]);
  const [showOfferForm, setShowOfferForm] = useState(false);
  
  const findOffers = async () => {
    const offerList = await OfferService.findOffers();
    setOffers(offerList);
  }

  const findAccounts = async () => {
    const accounts:BankAccount[] = await BankAccountService.getAccounts();
    setAccountList(accounts);
  }

  const getAccountName = (id) => {
    const account = accountList.find(account => account._id === id);
    return account ? account.customName : '';
  }

  const deleteOffer = async (id) => {
    await OfferService.delete(id);
    findOffers();
  }

  useEffect(() => {
    findOffers();
    findAccounts();
  }, []);

  return (
      <Grid container spacing={4}>
        <Grid item xs={12}>
          <Card>
              <CardHeader
                  avatar={
                    <Avatar >
                        $
                    </Avatar>
                  }
                  title="Vende tus monedas!"
              />
              <CardContent>
                <Alert severity="info">
                    <AlertTitle>Aquí podrás vender tus monedas a otros usuarios.</AlertTitle>
                    <p>
                      Indica la cantidad de monedas que quieres vender pon un precio y un usuario podrá comprarlas con dinero real.
                    </p>
                </Alert>

                {!accountList.length && 
                  <Alert severity="warning" variant="filled" sx={{marginTop: '10px'}} >
                      <p>
                        Recuerda que debes tener una cuenta bancaria vinculada para poder recibir el dinero.
                        <Button variant='contained' size="small" onClick={() => {navigate('/profile/default')}} sx={{marginLeft: '10px'}}>Vincular cuenta</Button>
                      </p>
                  </Alert>
                }
                <Box sx={{ display: 'flex', justifyContent: 'flex-start', mt: 5 }}>
                    {!showOfferForm && <Button variant='contained' size="small" onClick={() => {setShowOfferForm(true)}}>Generar oferta</Button>}
                </Box>

                {showOfferForm && <>
                    <Divider></Divider>
                    <OfferForm onCreateOffer={() => findOffers()} bankAccounts={accountList} ></OfferForm>
                </>}
              </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12}>
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell>Fecha creación</TableCell>
                  <TableCell># monedas</TableCell>
                  <TableCell>Dinero solicitado</TableCell>
                  <TableCell>Cuenta bancaria</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {offers.map((row) => (
                  <TableRow
                    key={row._id}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      {row.created_at}
                    </TableCell>
                    <TableCell>{row.coins}</TableCell>
                    <TableCell>{row.money}</TableCell>
                    <TableCell>{getAccountName(row.bank_account_id)}</TableCell>
                    <TableCell>{row.state}</TableCell>
                    <TableCell>
                      <Button color="error" variant='contained' size="small" onClick={() => {deleteOffer(row._id)}}>Eliminar</Button>
                    </TableCell>
                  </TableRow>
                ))}
                {offers.length === 0 && (
                  <TableRow
                    key='empty_offers'
                  >
                    <TableCell component="td" scope="row" colSpan={4} sx={{ textAlign: 'center'}}>
                      Aùn no has realizado ninguna oferta...
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>
  );
}