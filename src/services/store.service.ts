import store from "@app/store";
import { IRoom } from "./models/room";
import { IUser } from "./models/user";

export class StoreService {

  static getUser(): IUser|null {
    const state = store.getState();
    return state.session.user;
  }


  static getActiveRoom():IRoom|null {
    const roomString = localStorage.getItem('ACTIVE_ROOM');
    return roomString ? JSON.parse(roomString) : null;
  }
}
