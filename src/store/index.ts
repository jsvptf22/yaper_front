import { configureStore } from '@reduxjs/toolkit';
import reducer from './reducer';

const loadState = () => {
  try {
    const serializedState = localStorage.getItem('myReduxState');
    if (serializedState === null) {
      return undefined;
    }
    return JSON.parse(serializedState);
  } catch (error) {
    console.log('Failed to load state from localStorage', error);
    return undefined;
  }
};

const saveState = (state) => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem('myReduxState', serializedState);
  } catch (error) {
    console.log('Failed to save state to localStorage', error);
  }
};
  
  
const persistedState = loadState();

const store =  configureStore({
  reducer: reducer,
  preloadedState: persistedState
})

store.subscribe(() => {
  saveState(store.getState());
});

export default store;