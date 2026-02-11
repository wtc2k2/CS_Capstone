import Phaser from 'phaser';
import { GameScene } from './scenes/GameScene';
import { HUDScene } from './scenes/HUDScene';
import './style.css';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  title: 'Campus Clash',
  parent: 'game-container',
  width: 1280,
  height: 720,
  backgroundColor: '#1a1a2e',
  pixelArt: true,
  scene: [GameScene, HUDScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
};

new Phaser.Game(config);
