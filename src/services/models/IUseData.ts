import { IGame } from "./card-properties";
import { IRoom } from "./room";
import { IUser } from "./user";


export interface IUseData {
    user: IUser;
    setUser: (data?: IUser|null) => void;
    room: IRoom;
    setRoom: (data?: IRoom|null) => void;
    games: IGame[];
    setGames: (data?: IGame[]) => void;
    walletItems: IGame[];
    setWalletItems: (data?: IGame[]) => void;
  }