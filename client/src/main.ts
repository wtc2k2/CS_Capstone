import Phaser from 'phaser';
import { GameScene } from './scenes/GameScene';
import { HUDScene } from './scenes/HUDScene';
import { initLobby } from './lobby';
import './style.css';

console.log('[CC] main.ts loaded — Clerk key present:', !!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY);

initLobby().catch((err) => console.error('[CC] initLobby failed:', err)).then(({ username, clerkId, mode, isPrivate, roomCode, classData, gameMode }: any) => {
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
      autoCenter: Phaser.Scale.CENTER_HORIZONTALLY,
    },
  };

  const game = new Phaser.Game(config);
  game.registry.set('username', username);
  game.registry.set('clerkId', clerkId);
  game.registry.set('mode', mode);
  game.registry.set('isPrivate', isPrivate);
  game.registry.set('roomCode', roomCode);
  game.registry.set('classData', classData);
  game.registry.set('gameMode', gameMode || 'ffa');
});
