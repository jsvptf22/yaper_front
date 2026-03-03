import axios from 'axios';
import { toast } from 'react-toastify';
import { IResponse, RESPONSE_STATUS } from './Response';
import { IOffer } from './models/offer';
import { StoreService } from './store.service';

export class OfferService {
  static async findOffers(): Promise<IOffer[]> {
    const user = await StoreService.getUser();
    if(!user){
      throw new Error("Error!");
    }
    
    const request = await axios.get<IResponse<IOffer[]>>(
      `${import.meta.env.VITE_HTTP_API}/offer`,
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
      throw new Error("message");      
    }

    return response.data;
  }
  
  static async create(offer: Partial<IOffer>): Promise<IOffer|null> {
    const user = await StoreService.getUser();
    if(!user){
      throw new Error("Error!");
    }
    
    const request = await axios.post<IResponse<IOffer>>(
      `${import.meta.env.VITE_HTTP_API}/offer`,offer,
      {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      },
    );
    const response = request.data;

    if (!response || response.status == RESPONSE_STATUS.ERROR) {
      const message = response ? response.message : 'Error';
      toast.warning(message, {
        autoClose: 3000
      });
      return null;
    }

    return response.data;
  }

  static async delete(id: string): Promise<IOffer> {
    const user = await StoreService.getUser();
    if(!user){
      throw new Error("Error!");
    }
    
    const request = await axios.delete<IResponse<IOffer>>(
      `${import.meta.env.VITE_HTTP_API}/offer/${id}`,
      {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      },
    );
    const response = request.data;

    if (!response || response.status == RESPONSE_STATUS.ERROR) {
      const message = response ? response.message : 'Error';
      toast.warning(message, {
        autoClose: 3000
      });
      return;
    }

    return response.data;
  }

}
