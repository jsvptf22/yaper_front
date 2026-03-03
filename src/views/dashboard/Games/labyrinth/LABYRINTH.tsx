import tiles from '@app/assets/images/games/labyrinth/wall.png';
import { LabyrinthService } from "@app/services/labyrinth/labyrinth.service";
import { RoomState } from '@app/services/models/room';
import { StateType } from "@app/store/reducer";
import { Card, CardContent, Grid } from "@mui/material";
import Phaser, { Cameras } from "phaser";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { IGameProps } from '../Room';
import gameConfigJson from './tile_properties.json';

const LABYRINTH = (props: IGameProps) => {
  const TILE_HEIGHT = 32;
  const screenWidthBlocks = window.innerWidth*0.9 / TILE_HEIGHT;
  const screenHeightBlocks = window.innerHeight*0.8 / TILE_HEIGHT;
 
  const user = useSelector((state:StateType) => state.session.user);
  const [phaserGame, setPhaserGame] = useState<Phaser.Game|null>(null);
  const [players, setPlayers] = useState<Record<string,Phaser.GameObjects.Image>>({});

  let mapConfig:any = null;
  let sessionPlayer:Phaser.GameObjects.Image | null = null;

  async function startGame(){
    mapConfig = await LabyrinthService.generate(props.room.lastMeetUp._id);
    
    const config: Phaser.Types.Core.GameConfig = {
      callbacks: {
        preBoot: (game:any) => {
          // A good way to get data state into the game.
          game.registry.merge(user)
          // This is a good way to catch when that data changes.
          game.registry.events.on("changedata", (par, key, val, prevVal) => {
            // Simply call whatever functions you want outside.
            console.log({ [key]: val })
          })
        },
      },
      type: Phaser.AUTO,
      width: screenWidthBlocks * TILE_HEIGHT,
      height: screenHeightBlocks * TILE_HEIGHT,
      parent: 'phaser-labyrinth',
      pixelArt: true,
      backgroundColor: '#1a1a2d',
      //scene: Scene,
      scene: {
        preload: function (){
          gameConfigJson.layers[0].data = mapConfig.map;
          gameConfigJson.layers[0].height = mapConfig.height;
          gameConfigJson.layers[0].width = mapConfig.width;
          
          this.load.tilemapTiledJSON('map', gameConfigJson);
          this.load.image('tiles', tiles);
          this.load.image('active_car', '/games/labyrinth/new_car.png');
          this.load.image('inactive_car', '/games/labyrinth/new_car_grey.png');
          this.load.image('up_arrow', '/games/generic/up_arrow.png');
          this.load.image('down_arrow', '/games/generic/down_arrow.png');
          this.load.image('left_arrow', '/games/generic/left_arrow.png');
          this.load.image('right_arrow', '/games/generic/right_arrow.png');
        },
        create: function (){
          var map = this.make.tilemap({ key: 'map', tileWidth: TILE_HEIGHT, tileHeight: TILE_HEIGHT });
          var tileset = map.addTilesetImage('tiles', undefined, TILE_HEIGHT, TILE_HEIGHT, 1, 2);
          var layer = map.createLayer(0, tileset, 0, 0);

          const leftArrowButton = this.add.image(1 * TILE_HEIGHT, (screenHeightBlocks -1) * TILE_HEIGHT, 'left_arrow').setInteractive().setScrollFactor(0);
          const rightArrowButton = this.add.image(3 * TILE_HEIGHT, (screenHeightBlocks -1) * TILE_HEIGHT,  'right_arrow').setInteractive().setScrollFactor(0);
          const upArrowButton = this.add.image(7 * TILE_HEIGHT, (screenHeightBlocks -1) * TILE_HEIGHT, 'up_arrow').setInteractive().setScrollFactor(0);
          const downArrowButton = this.add.image(9 * TILE_HEIGHT, (screenHeightBlocks -1) * TILE_HEIGHT, 'down_arrow').setInteractive().setScrollFactor(0);

          mapConfig.user_locations.forEach((userLocation:any) => {
            const x = (userLocation.location.x * TILE_HEIGHT) + (TILE_HEIGHT/2)
            const y = (userLocation.location.y * TILE_HEIGHT) + (TILE_HEIGHT/2)
            const player = this.add.image(x, y, userLocation._id === user!._id ? 'active_car' : 'inactive_car');
            players[userLocation._id] = player;
          });
      
          setPlayers(players);
          sessionPlayer = players[user!._id]
          this.cameras.main.startFollow(sessionPlayer, true, 0.05, 0.05);
          
          leftArrowButton.on('pointerdown', () => {            
          //this.input.keyboard.on('keydown-A', function () {
            const tile = layer.getTileAtWorldXY(sessionPlayer!.x - TILE_HEIGHT, sessionPlayer!.y, true);
            if (tile.index !== 2){
              props.socket!.emit('player_move', {
                meetupId: props.room.lastMeetUp._id,
                userId: user!._id,
                direction: "LEFT"
              });
            }
          });
            
          rightArrowButton.on('pointerdown', () => {
          //this.input.keyboard.on('keydown-D', function () {
            const tile = layer.getTileAtWorldXY(sessionPlayer!.x + TILE_HEIGHT, sessionPlayer!.y, true);
            if (tile.index !== 2){
              props.socket!.emit('player_move', {
                meetupId: props.room.lastMeetUp._id,
                userId: user!._id,
                direction: "RIGHT"
              });
            }
          });
      
          upArrowButton.on('pointerdown', () => {
          //this.input.keyboard.on('keydown-W', function () {
            const tile = layer.getTileAtWorldXY(sessionPlayer!.x, sessionPlayer!.y - TILE_HEIGHT, true);
            if (tile.index !== 2){
              props.socket!.emit('player_move', {
                meetupId: props.room.lastMeetUp._id,
                userId: user!._id,
                direction: "UP"
              });
            }
          });
      
          downArrowButton.on('pointerdown', () => {
          //this.input.keyboard.on('keydown-S', function () {
            const tile = layer.getTileAtWorldXY(sessionPlayer!.x, sessionPlayer!.y + TILE_HEIGHT, true);
            if (tile.index !== 2){
              props.socket!.emit('player_move', {
                meetupId: props.room.lastMeetUp._id,
                userId: user!._id,
                direction: "DOWN"
              });
            }
          });

          if(props.room.state === RoomState.PLAYING){
            props.socket.emit('new_meetup', props.room.lastMeetUp._id)
            
            props.socket.on('update_player', function(data) {
              const updatePlayer = players[data._id];
              updatePlayer.x = (data.location.x * TILE_HEIGHT) + (TILE_HEIGHT/2);
              updatePlayer.y = (data.location.y * TILE_HEIGHT) + (TILE_HEIGHT/2)
            });
          }
        },
      }
    }
    let pgame = new Phaser.Game(config)
    setPhaserGame(pgame)
    console.log(pgame)
  }

  useEffect(() => {
    if (props.newGame) {
      if(phaserGame){
        phaserGame.destroy(true);
      }
      props.openSocket('labyrinth');
    }
  }, [props.newGame]);

  useEffect(() => {
    if (props.endGame) {
      const mainCamera:Cameras.Scene2D.Camera = phaserGame?.scene?.scenes[0]?.cameras?.main;
      if(mainCamera){
        const winnerPlayer = players[props.room.lastMeetUp.winner!._id];
        mainCamera.stopFollow();
        mainCamera.pan(winnerPlayer.x, winnerPlayer.y, 2000, 'Power2');
        mainCamera.zoomTo(0.5, 3000);
      }
      setTimeout(() => {
        props.socket?.emit('end_meetup', props.room.lastMeetUp._id);
        props.onExecuteEndGame();
      }, 2000);
    }
  
  }, [props.endGame, players]);

  useEffect(() => {
    if(props.socket){
      startGame();
    }
  }, [props.socket]);
 
  useEffect(() => {
    // If you don't do this, you get duplicates of the canvas piling up.
    return () => {
      if(phaserGame){
        phaserGame.destroy(true)
      }
      
      props.socket?.off('update_player');
    }
  }, [])

  return (
    <>      
      <Card>
        <CardContent style={{width: '100%', padding:0, margin:0}}>
          <Grid item id="phaser-labyrinth"></Grid>
        </CardContent>
      </Card>
    </>
  );
};


export default LABYRINTH;
