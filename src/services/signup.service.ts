import axios from 'axios';
import { IRegistration } from './models/registration.interface';
import { IUser } from './models/user';
import { IResponse, RESPONSE_STATUS } from './Response';

export class SignupService {
  static async exec(data: IRegistration): Promise<IUser|false> {
    const request = await axios.post<IResponse>(
      `${import.meta.env.VITE_HTTP_API}/auth/signup`,
      {
        email: data.email,
        password: data.password,
        name: data.name,
      },
    );
    const response = request.data;

    if (!response || response.status == RESPONSE_STATUS.ERROR) {
      const message = response ? response.message : 'Error';
      alert(message);
      return false;
    }

    const user: IUser = response.data.user;
    user.token = response.data.token;

    return user;
  }
}
