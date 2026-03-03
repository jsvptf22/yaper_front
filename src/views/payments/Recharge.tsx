import { IPackage } from "@app/services/models/package";
import { PaymentService } from "@app/services/payment.service";
import { StateType } from "@app/store/reducer";
import CreditCardIcon from '@mui/icons-material/CreditCard';
import { Avatar, Box, Button, Card, CardActionArea, CardContent, CardHeader, Dialog, Grid, IconButton } from "@mui/material";
import { blue } from "@mui/material/colors";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

export default function Recharge() {
  const user = useSelector((state:StateType ) => state.session.user);
  const [selectedPackage, setSelectedPackage] = useState<IPackage|null>(null);
  const [packages, setPackages] = useState<IPackage[]>([]);
  const [packageCards, setPackageCards] = useState<any[]>([]);

  async function buy(item: IPackage){
    setSelectedPackage(item);

    const preferenceId = await PaymentService.getPreference(item);
      
    //@ts-ignore
    const mp = new MercadoPago(import.meta.env.VITE_MP_PUBLIC_KEY, {
      locale: 'es-CO'
    });
    mp.checkout({
      preference: {
        id: preferenceId
      },
      render: {
        container: '.mp-container',
        label: `$${item?.unit_price}`,
      }
    });
  }

  function addMCLibrary() {
    const script = document.createElement("script");

    script.src = "https://sdk.mercadopago.com/js/v2";
    script.async = true;

    document.body.appendChild(script);
  }

  useEffect(() => {
    const list = packages.map((item) => {
      return <Grid item xs={12} md={6} key={item._id}>
        <Card>
          <CardHeader 
            avatar={
              <Avatar sx={{ bgcolor: blue[600], color:'white' }} aria-label="recipe">
                $
              </Avatar>
            }
            action={
              <IconButton aria-label="settings" title='Comprar' onClick={() => buy(item)}>
                <CreditCardIcon />
              </IconButton>
            }
            title={item.title}
            subheader={`$ ${item.coins}`}
          />
          <CardContent>
            <p>{item.description}</p>
          
            <CardActionArea>
              <Button onClick={() => buy(item)} variant="contained" sx={{width:'100%'}}>
                Lo quiero!
              </Button>
            </CardActionArea>
          </CardContent>
        </Card>
      </Grid>
    })
    setPackageCards(list);
  }, [packages])

  useEffect(() => {
    addMCLibrary();
    
    (async() => {
      const packageList = await PaymentService.findPackages();
      setPackages(packageList);
    })();
  }, []);
 
  return (
    <Grid container spacing={4}>
      {packageCards}
      <Dialog
        open={selectedPackage !== null}
        onClose={() => setSelectedPackage(null)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
         <Card>
          <CardHeader 
            avatar={
              <Avatar sx={{ bgcolor: blue[600], color:'white' }} aria-label="recipe">
                $
              </Avatar>
            }
            action={
              <IconButton>
                <CreditCardIcon />
              </IconButton>
            }
            title="Lo tienes!"
            subheader={`$ ${selectedPackage?.coins}`}
          />
          <CardContent>
            <p>
              Quieres el paquete para {selectedPackage?.title}s<br/>
            </p>
          
            <CardActionArea>
              <Grid container item direction="row" justifyContent="space-around" >
                <Button onClick={() => setSelectedPackage(null)}>
                  Cancelar
                </Button>
                <Box className="mp-container" sx={{display: 'inline'}}></Box>
              </Grid>
            </CardActionArea>
          </CardContent>
        </Card>
      </Dialog>
    </Grid>
  );
}