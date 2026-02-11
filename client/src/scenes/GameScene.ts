import Phaser from 'phaser';
import {
  MAP_DATA,
  BUILDINGS,
  TILE_SIZE,
  TILE,
  MAP_W,
  MAP_H,
  isWalkable,
} from '../map/CampusMap';
import { ClassData, DEFAULT_CLASS } from '../data/Classes';
import { Player } from '../entities/Player';
import { Dummy } from '../entities/Dummy';
import { connect } from '../network/Network';

export class GameScene extends Phaser.Scene {
  player!: Player;
  dummies: Dummy[] = [];
  private connectedText?: Phaser.GameObjects.Text;

  private classData!: ClassData;
  private cursors!: {
    up: Phaser.Input.Keyboard.Key;
    down: Phaser.Input.Keyboard.Key;
    left: Phaser.Input.Keyboard.Key;
    right: Phaser.Input.Keyboard.Key;
  };
  private spaceKey!: Phaser.Input.Keyboard.Key;
  private attackKey!: Phaser.Input.Keyboard.Key;

  constructor() {
    super('GameScene');
  }

  init(data?: { classData?: ClassData }): void {
    this.classData = data?.classData ?? DEFAULT_CLASS;
  }

  create(): void {
    const worldW = MAP_W * TILE_SIZE;
    const worldH = MAP_H * TILE_SIZE;

    this.drawMap();
    this.drawBuildingLabels();

    // Spawn on the left spine path near Craton
    const spawnX = 30 * TILE_SIZE + TILE_SIZE / 2;
    const spawnY = 36 * TILE_SIZE + TILE_SIZE / 2;
    this.player = new Player(this, spawnX, spawnY, this.classData);

    // Dummies — only spawn on walkable tiles
    const dummySpots = [
      [44, 15], [91, 35], [30, 50],
      [75, 52], [40, 58], [55, 77],
    ];
    this.dummies = [];
    for (const [tx, ty] of dummySpots) {
      if (isWalkable(tx, ty)) {
        this.dummies.push(
          new Dummy(this, tx * TILE_SIZE + TILE_SIZE / 2, ty * TILE_SIZE + TILE_SIZE / 2),
        );
      }
    }

    // Camera
    this.cameras.main.setBounds(0, 0, worldW, worldH);
    this.cameras.main.startFollow(this.player.sprite, true, 0.1, 0.1);
    this.cameras.main.setBackgroundColor('#1a1a2e');

    // Input
    const kb = this.input.keyboard!;
    this.cursors = {
      up: kb.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down: kb.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      left: kb.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: kb.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };
    this.spaceKey = kb.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.attackKey = kb.addKey(Phaser.Input.Keyboard.KeyCodes.E);

    // HUD
    this.scene.launch('HUDScene', {
      classData: this.classData,
      gameScene: this,
    });

    this.events.emit('playerHpChanged', this.player.hp, this.player.maxHp);

    // Connect to Colyseus server
    connect()
      .then((room) => {
        this.connectedText = this.add
          .text(this.scale.width / 2, 40, 'Player connected', {
            fontFamily: 'Courier New, monospace',
            fontSize: '16px',
            color: '#00ff00',
            stroke: '#000000',
            strokeThickness: 3,
          })
          .setOrigin(0.5)
          .setScrollFactor(0)
          .setDepth(100);

        // Fade out after 3 seconds
        this.time.delayedCall(3000, () => {
          this.tweens.add({
            targets: this.connectedText,
            alpha: 0,
            duration: 500,
            onComplete: () => this.connectedText?.destroy(),
          });
        });
      })
      .catch((err) => {
        console.error('Failed to connect:', err);
        this.add
          .text(this.scale.width / 2, 40, 'Connection failed', {
            fontFamily: 'Courier New, monospace',
            fontSize: '16px',
            color: '#ff0000',
            stroke: '#000000',
            strokeThickness: 3,
          })
          .setOrigin(0.5)
          .setScrollFactor(0)
          .setDepth(100);
      });
  }

  private drawMap(): void {
    const g = this.add.graphics();

    const tileColors: Record<number, number> = {
      [TILE.GRASS]: 0x3a7d44,
      [TILE.PATH]: 0xc2b280,
      [TILE.BUILDING]: 0x555555,
      [TILE.FIELD]: 0x4caf50,
    };

    for (let y = 0; y < MAP_H; y++) {
      for (let x = 0; x < MAP_W; x++) {
        const tile = MAP_DATA[y][x];
        let color = tileColors[tile] ?? 0x3a7d44;

        if (tile === TILE.BUILDING) {
          for (const b of BUILDINGS) {
            if (x >= b.x && x < b.x + b.w && y >= b.y && y < b.y + b.h) {
              color = b.color;
              break;
            }
          }
        }

        g.fillStyle(color, 1);
        g.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
      }
    }

    // Subtle grid
    g.lineStyle(1, 0x000000, 0.06);
    for (let y = 0; y <= MAP_H; y++) {
      g.lineBetween(0, y * TILE_SIZE, MAP_W * TILE_SIZE, y * TILE_SIZE);
    }
    for (let x = 0; x <= MAP_W; x++) {
      g.lineBetween(x * TILE_SIZE, 0, x * TILE_SIZE, MAP_H * TILE_SIZE);
    }

    g.setDepth(0);
  }

  private drawBuildingLabels(): void {
    for (const b of BUILDINGS) {
      const cx = (b.x + b.w / 2) * TILE_SIZE;
      const cy = (b.y + b.h / 2) * TILE_SIZE;

      this.add
        .text(cx, cy, b.name, {
          fontFamily: 'Courier New, monospace',
          fontSize: '14px',
          color: '#ffffff',
          stroke: '#000000',
          strokeThickness: 3,
          fontStyle: 'bold',
        })
        .setOrigin(0.5)
        .setDepth(1);
    }
  }

  update(time: number, delta: number): void {
    this.player.update(time, delta, this.cursors);

    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.player.dash(time);
    }
    if (Phaser.Input.Keyboard.JustDown(this.attackKey)) {
      this.player.tryAttack(time, this.dummies);
    }
  }
}
