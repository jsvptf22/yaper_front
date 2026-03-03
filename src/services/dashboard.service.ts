import { LastTenGamesType } from '@app/views/dashboard/Default/PopularCard';
import axios from 'axios';
import { IResponse, RESPONSE_STATUS } from './Response';
import { StoreService } from './store.service';

export class DashboardService {
  static async getEarnings(): Promise<number> {
    const user = await StoreService.getUser();
    if(!user){
      throw new Error("Error!");
    }
    
    const request = await axios.get<IResponse<number>>(
      `${import.meta.env.VITE_HTTP_API}/dashboard/earnings`,
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

    return response.data;
  }

  static async getGames(): Promise<number> {
    const user = await StoreService.getUser();
    if(!user){
      throw new Error("Error!");
    }
    
    const request = await axios.get<IResponse<number>>(
      `${import.meta.env.VITE_HTTP_API}/dashboard/games`,
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

    return response.data;
  }

  
  static async getLastTenGames(): Promise<LastTenGamesType[]> {
    const user = await StoreService.getUser();
    if(!user){
      throw new Error("Error!");
    }
    
    const request = await axios.get<IResponse<LastTenGamesType[]>>(
      `${import.meta.env.VITE_HTTP_API}/dashboard/lastTenGames`,
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

    return response.data;
  }

}
