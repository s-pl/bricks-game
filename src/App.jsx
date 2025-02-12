import React, { useEffect } from 'react';
import Phaser from 'phaser';
import MainScene from './game/MainScene';
import './index.css'
const App = () => {
  useEffect(() => {
    const config = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      parent: 'game-container',
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 0 },
          debug: false,
        },
      },
      scene: [MainScene],
    };

    const game = new Phaser.Game(config);

    return () => {
      game.destroy(true);
    };
  }, []);

  return <div id="game-container" style={{ width: '100vw', height: '100vh' }} />;
};

export default App;
