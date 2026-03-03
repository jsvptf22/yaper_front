import loader from '@app/assets/giffs/loading.gif';
import userIcon from '@app/assets/images/user.png';
import { IUser } from "@app/services/models/user";
import { Box, Card, CardContent, CardMedia, Grid, Typography } from "@mui/material";

const defaultUserData: IUser = {
  coins: 0,
  email: '',
  _id: '',
  image: loader,
  name: 'Buscando rival...',
  token: '',
  phone: "",
  username: ""
};

const UserGameCard = (props: { user?: IUser }) => {
  const user = props.user || defaultUserData;
  const isDefaultUser = !props.user;
  const icon = !isDefaultUser ? '' : '';

  return (
    <Grid container>
      <Grid item>
        <Card sx={{ display: {xs: 'none', md:'flex'} }}>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flex: '1 0 auto' }}>
              <Box>
                <Typography component="div" variant="h5">
                  {user.username || user.name}
                </Typography>
              </Box>
            </CardContent>
          </Box>
          <CardMedia
            component="img"
            sx={{ width: {xs:50, md:100}}}
            image={user.image || userIcon}
            alt="Live from space album cover"
          />
        </Card>
      </Grid>
    </Grid>
  );
};

export default UserGameCard;