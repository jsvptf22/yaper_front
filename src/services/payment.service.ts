import axios from 'axios';
import { IResponse, RESPONSE_STATUS } from './Response';
import { IPackage } from './models/package';
import { StoreService } from './store.service';


export class PaymentService {
  static async getPreference(item: IPackage): Promise<Record<string,any>> {
    const user = await StoreService.getUser();
    if(!user){
      throw new Error("Error!");
    }
    
    const request = await axios.post<IResponse>(
      `${import.meta.env.VITE_HTTP_API}/payments/preference/${item._id}`,{},
      {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      },
    );
    const response = request.data;

    if (!response || response.status == RESPONSE_STATUS.ERROR) {
      const message = response ? response.message : 'Error';
      alert(message);
      throw new Error("message");      
    }

    return response.data;
  }

  static async findPackages(): Promise<IPackage[]> {
    const user = await StoreService.getUser();
    if(!user){
      throw new Error("Error!");
    }
    
    const request = await axios.get<IResponse<IPackage[]>>(
      `${import.meta.env.VITE_HTTP_API}/payments`,
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
}
