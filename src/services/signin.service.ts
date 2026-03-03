import axios from 'axios';
import { ILogin } from './models/signin.interface';
import { IUser } from './models/user';
import { IResponse, RESPONSE_STATUS } from './Response';


export class SigninService {
  static async exec(data: ILogin) {
    const response = await this.getToken(data);

    if (!response || response.status == RESPONSE_STATUS.ERROR) {
      const message = response ? response.message : 'Error';
      alert(message);
      return false;
    }

    const user: IUser = response.data.user;
    user.token = response.data.token;

    return user;
  }

  private static async getToken(data: ILogin) {
    try {
      const request = await axios.post<IResponse>(
        `${import.meta.env.VITE_HTTP_API}/auth/signin`,
        {
          email: data.email,
          password: data.password,
        },
      );
      return request.data;
    } catch (e) {
      console.log('error on login request', e);
    }
  }
}
