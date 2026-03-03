import { IGame } from "./card-properties";
import { IUser } from "./user";

export interface UserInMeetUp {
  user_id: string;
  option?: string;
}

export interface IRoom {
  _id: string;
  first_user_id: string;
  second_user_id?: string;
  state: RoomState;
  created_at: Date;
  lastEvent?: RoomEvents;
  users: IUser[];
  stats: Record<number, number>;
  game: IGame;
  lastMeetUp: {
    _id: string;
    winner?: IUser | null;
    users?:UserInMeetUp[];
  };
}

export enum RoomState {
  WAITING = 'WAITING',
  COMPLETED = 'COMPLETED',
  WAITING_BET_CONFIRMATION = 'WAITING_BET_CONFIRMATION',
  PLAYING = 'PLAYING',
  FINISH = 'FINISH',
  ENDED = 'ENDED',
}

export enum RoomEvents {
  CREATE = 'CREATE', // se crea la sala
  ADD_USER = 'ADD_USER', //se une un jugador
  COMPLETE_ROOM = 'COMPLETE_ROOM', //se llena la sala
  CHECKING_MEETUP = 'CHECKING_MEETUP', // se está validando si los usuarios confirman la apuesta
  ACCEPT_MEETUP = 'ACCEPT_MEETUP', // un jugador acepta la apuesta
  GAME_START = 'GAME_START', //el juego inicia
  USER_PLAY = 'USER_PLAY', // un jugador selecciona una opción
  USER_LEAVE = 'USER_LEAVE', // un usuario abandona la sala
  GAME_END = 'GAME_END', // el juego termina
}
