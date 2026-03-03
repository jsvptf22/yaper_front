import { useSelector } from 'react-redux';
import { IGameProps } from '../Room';
import ParquesApp from './engine/App';
import { StateType } from '@app/store/reducer';
import './parques.css';
import './engine/App.css';

const PARQUES = (props: IGameProps) => {
  const user = useSelector((state: StateType) => state.session.user);

  return (
    <>
      {props.room && user && (
        <ParquesApp
          isEmbedded={true}
          gameIdFromParent={props.room._id}
          playerNameFromParent={user.username}
        />
      )}
    </>
  );
};

export default PARQUES;
