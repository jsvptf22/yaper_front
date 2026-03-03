import { gql } from '@apollo/client';
import axios from 'axios';
import { IResponse, RESPONSE_STATUS } from './Response';
import { GraphqlService } from './graphql.service';
import { IUser } from './models/user';
import { StoreService } from './store.service';

export class UserService {
  static findByEmailGql() {
    return gql`
      query user($email: String!) {
        user(email: $email) {
          _id
          name
          email
          coins
          image
          phone
          username
        }
      }
    `;
  }

  static userUpdateSuscription() {
    return gql`
      subscription UserUpdate($id: String!) {
        userUpdate(id: $id) {
          _id
          name
          email
          coins
          image
          phone
          username
        }
      }
    `;
  }

  static async findByEmail(email: string): Promise<IUser> {
    const graphqlClient = GraphqlService.getClient();
    const result = await graphqlClient.query({
      query: UserService.findByEmailGql(),
      variables: {
        email: email,
      },
    });
    return result.data.user;
  }

  static async update(data) {
    const user = await StoreService.getUser();
    if(!user){
      throw new Error("Error!");
    }
    
    const request = await axios.put<IResponse<IUser>>(
      `${import.meta.env.VITE_HTTP_API}/user/${user._id}`,data,
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
  }
}
