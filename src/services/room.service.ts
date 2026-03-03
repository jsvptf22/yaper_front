import { gql } from '@apollo/client';
import axios from 'axios';
import { IResponse, RESPONSE_STATUS } from './Response';
import { GraphqlService } from './graphql.service';
import { IGame } from './models/card-properties';
import { IRoom } from './models/room';
import { StoreService } from './store.service';

export class RoomService {
  static findIdQuery() {
    return gql`
      query room($id: String!) {
        room(id: $id) {
          _id
          state
          lastEvent
          game {
            _id
            name
            image
            bet
            component
          }
          lastMeetUp {
            _id
            winner {
              _id
              name
            }
            users {
              user_id
              option
            }
          }
          users {
            _id
            name
            image
          }
        }
      }
    `;
  }

  static roomUpdateSubscription() {
    return gql`
      subscription RoomUpdate($id: String!) {
        roomUpdate(id: $id) {
          _id
          state
          lastEvent
          game {
            _id
            name
            image
            bet
            component
          }
          lastMeetUp {
            _id
            winner {
              _id
              name
            }
            users {
              user_id
              option
            }
          }
          users {
            _id
            name
            image
          }
        }
      }
    `;
  }

  static async findById(id: string): Promise<IRoom> {  
    const graphqlClient = GraphqlService.getClient();
    const result = await graphqlClient.query({
      query: RoomService.findIdQuery(),
      variables: {
        id: id,
      },
    });
    return result.data.room;
  }

  static async hasMoneyForPlay(game: IGame): Promise<boolean> {
    const user = await StoreService.getUser();
    if(!user){
      throw new Error("Error!");
    }
    
    const request = await axios.get<IResponse<boolean>>(
      `${import.meta.env.VITE_HTTP_API}/games/${game._id}/canPlay`,
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

  static async joinToRoom(game: IGame): Promise<IRoom> {
    const user = await StoreService.getUser();
    if(!user){
      throw new Error("Error!");
    }
    const request = await axios.post<IResponse<IRoom>>(
      `${import.meta.env.VITE_HTTP_API}/rooms/game/${game._id}`,
      {},
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

  static async sendSelectedOption(room: IRoom, option: string) {
    const user = await StoreService.getUser();
    if(!user){
      throw new Error("Error!");
    }
    const request = await axios.post<IResponse<IRoom>>(
      `${import.meta.env.VITE_HTTP_API}/meetup/${room._id}/play`,
      {
        option,
      },
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

  static async leave(room: IRoom, acceptLose: boolean) {

    const user = await StoreService.getUser();
    if(!user){
      throw new Error("Error!");
    }
    const request = await axios.delete<IResponse<IRoom>>(
      `${import.meta.env.VITE_HTTP_API}/rooms/${room._id}`,
      {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
        data: {
          acceptLose,
        }
      },
    );
    const response = request.data;

    if (!response || response.status === RESPONSE_STATUS.ERROR) {
      const message = response ? response.message : 'Error';
      alert(message);
      throw new Error(message);
    }
  }

  static async acceptMeetup(room: IRoom) {
    const user = await StoreService.getUser();
    if(!user){
      throw new Error("Error!");
    }
    const request = await axios.post<IResponse<IRoom>>(
      `${import.meta.env.VITE_HTTP_API}/meetup/room/${room._id}`,
      {},
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

  static async startGame(room: IRoom) {
    const user = await StoreService.getUser();
    if(!user){
      throw new Error("Error!");
    }
    const request = await axios.post<IResponse<IRoom>>(
      `${import.meta.env.VITE_HTTP_API}/rooms/${room._id}/start`,
      {},
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

  static async findActive(): Promise<IRoom| null> {
    const user = await StoreService.getUser();
    if(!user){
      throw new Error("Error!");
    }
    const request = await axios.get<IResponse<IRoom>>(
      `${import.meta.env.VITE_HTTP_API}/rooms`,
      {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      }
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
