import axios from 'axios';
import { IResponse, RESPONSE_STATUS } from './Response';
import { BankAccount, IUser } from './models/user';
import { StoreService } from './store.service';

export class BankAccountService {
  static async getAccounts():Promise<BankAccount[]> {
    const user = await StoreService.getUser();
    if(!user){
      throw new Error("Error!");
    }
    
    const request = await axios.get<IResponse<BankAccount[]>>(
      `${import.meta.env.VITE_HTTP_API}/user-bank-account`,
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

  static async createBankAccount(data) {
    const user = await StoreService.getUser();
    if(!user){
      throw new Error("Error!");
    }
    
    const request = await axios.post<IResponse<IUser>>(
      `${import.meta.env.VITE_HTTP_API}/user-bank-account`,data,
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
