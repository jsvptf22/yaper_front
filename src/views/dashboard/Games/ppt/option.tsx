import DOWN_CARD from '@app/assets/images/games/generic/down_card.png';
import EMPTY_CARD from '@app/assets/images/games/generic/empty_card.jpg';
import PAPEL from '@app/assets/images/games/ppt/papel.png';
import PIEDRA from '@app/assets/images/games/ppt/piedra.png';
import TIJERA from '@app/assets/images/games/ppt/tijera.png';
import { Grid } from '@mui/material';

export interface PPT_OPTION_PROPS {
    onSelectedOption?: Function;
    option: string;
}

const PPT_OPTION = (props: PPT_OPTION_PROPS) => {
    function getImage(props:PPT_OPTION_PROPS){
        const images: Record<string,any> = {
            EMPTY:EMPTY_CARD,
            DOWN:DOWN_CARD,
            PIEDRA:PIEDRA,
            PAPEL:PAPEL,
            TIJERA:TIJERA,
        }
        return images[props.option];
    }

    return (
      <Grid container>
        <Grid item>
            <img
                onClick={() => props.onSelectedOption && props.onSelectedOption(props.option)}
                alt=""
                src={getImage(props)}
                style={{
                  cursor: 'pointer'
                }}
            />
        </Grid>
      </Grid>
    );
  }
  
export default PPT_OPTION;