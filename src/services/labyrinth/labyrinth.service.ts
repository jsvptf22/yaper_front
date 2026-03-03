import axios from 'axios';
import { IResponse, RESPONSE_STATUS } from '../Response';
import { StoreService } from '../store.service';

export class LabyrinthService {
  static async generate(meetupId: string) {
    const user = await StoreService.getUser();
    if(!user){
      throw new Error("Error!");
    }
    
    const request = await axios.get<IResponse>(
      `${import.meta.env.VITE_HTTP_API}/labyrinth/${meetupId}`,
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

    const configuration = response.data;
    configuration.map = JSON.parse(configuration.map);
    configuration.user_locations = JSON.parse(configuration.user_locations);

    return configuration;
  }

}
