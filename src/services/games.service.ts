import axios from 'axios';
import { IResponse, RESPONSE_STATUS } from './Response';
import { IGame } from './models/card-properties';
import { StoreService } from './store.service';

export class GamesService {
  static async find(): Promise<IGame[]> {
    const user = await StoreService.getUser();
    if(!user){
      throw new Error("Error!");
    }
    
    const request = await axios.get<IResponse<IGame[]>>(
      `${import.meta.env.VITE_HTTP_API}/games`,
      {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      },
    );
    const response = request.data;

    if (!response || response.status === RESPONSE_STATUS.ERROR) {
      const message = response ? response.message : 'Error';
      alert(message);
      throw new Error(message);
    }

    return response.data.map((g: any) => {
      return {
        _id: g._id,
        name: g.name,
        description: g.description,
        image: g.image,
        bet: g.bet,
        component: g.component
      } as IGame;
    });
  }

}
