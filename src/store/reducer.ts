import { combineReducers } from 'redux';
import customizationReducer, { CustomizationStateType } from './customizationReducer';
import sessionReducer, { SessionStateType } from './sessionReducer';

export interface StateType{
    customization: CustomizationStateType
    session: SessionStateType
}

const reducer = combineReducers({
    customization: customizationReducer,
    session: sessionReducer
});

export default reducer;
