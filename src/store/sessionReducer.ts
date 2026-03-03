import { IRoom } from "@app/services/models/room";
import { IUser } from "@app/services/models/user";

export enum SESSION_ACTIONS  {
    UPDATE_USER = 'UPDATE_USER',
    UPDATE_ROOM = 'UPDATE_ROOM'
}

export type SessionStateType = {
    user: IUser|null;
    room: IRoom|null;
}

const initialState:SessionStateType = {
    user: null,
    room: null
};

const sessionReducer = (state = initialState, action) => {
    let newState = state;
    
    switch (action.type) {
        case SESSION_ACTIONS.UPDATE_USER:
            newState = {
                ...state,
                user: action.user
            }
            break;
        case SESSION_ACTIONS.UPDATE_ROOM:
            newState = {
                ...state,
                room: action.room
            }
            break;
        default:
            
    }

    return newState;
};

export default sessionReducer;
