import Phaser from 'phaser';
import { ClassData } from '../data/Classes';
import type { GameScene } from './GameScene';

export class HUDScene extends Phaser.Scene {
  private classData!: ClassData;
  private gameScene!: GameScene;
  private hpBarFill!: Phaser.GameObjects.Graphics;
  private hpText!: Phaser.GameObjects.Text;
  private dashText!: Phaser.GameObjects.Text;

  private hpBarW = 300;
  private hpBarH = 24;
  private hpBarX = 0; // set in create
  private hpBarY = 38;

  constructor() {
    super('HUDScene');
  }

  init(data: { classData: ClassData; gameScene: GameScene }): void {
    this.classData = data.classData;
    this.gameScene = data.gameScene;
  }

  create(): void {
    const { width, height } = this.scale;

    // Center the HP bar horizontally
    this.hpBarX = Math.floor((width - this.hpBarW) / 2);

    // Title
    this.add
      .text(width / 2, 14, 'CAMPUS CLASH', {
        fontFamily: 'Courier New, monospace',
        fontSize: '24px',
        color: '#e63946',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 4,
      })
      .setOrigin(0.5);

    // HP bar background
    const hpBg = this.add.graphics();
    hpBg.fillStyle(0x333333, 1);
    hpBg.fillRoundedRect(this.hpBarX, this.hpBarY, this.hpBarW, this.hpBarH, 4);
    hpBg.lineStyle(2, 0x000000, 1);
    hpBg.strokeRoundedRect(this.hpBarX, this.hpBarY, this.hpBarW, this.hpBarH, 4);

    // HP bar fill
    this.hpBarFill = this.add.graphics();
    this.drawHpBar(1);

    // HP text centered on bar
    this.hpText = this.add
      .text(
        width / 2,
        this.hpBarY + this.hpBarH / 2,
        `${this.classData.maxHp} / ${this.classData.maxHp}`,
        {
          fontFamily: 'Courier New, monospace',
          fontSize: '14px',
          color: '#ffffff',
          fontStyle: 'bold',
          stroke: '#000000',
          strokeThickness: 3,
        },
      )
      .setOrigin(0.5);

    // Class name + weapon centered below HP bar
    this.add
      .text(width / 2, this.hpBarY + this.hpBarH + 8, `${this.classData.name} - ${this.classData.weaponName}`, {
        fontFamily: 'Courier New, monospace',
        fontSize: '14px',
        color: '#f1faee',
        stroke: '#000000',
        strokeThickness: 2,
      })
      .setOrigin(0.5);

    // Dash cooldown centered below class name
    this.dashText = this.add
      .text(width / 2, this.hpBarY + this.hpBarH + 28, 'DASH: READY', {
        fontFamily: 'Courier New, monospace',
        fontSize: '13px',
        color: '#2a9d8f',
        stroke: '#000000',
        strokeThickness: 2,
      })
      .setOrigin(0.5);

    // Controls legend at bottom center
    this.add
      .text(width / 2, height - 24, 'WASD: Move  |  E: Attack  |  SPACE: Dash', {
        fontFamily: 'Courier New, monospace',
        fontSize: '14px',
        color: '#a8dadc',
        stroke: '#000000',
        strokeThickness: 3,
      })
      .setOrigin(0.5);

    // Listen for HP changes
    this.gameScene.events.on('playerHpChanged', (hp: number, maxHp: number) => {
      this.drawHpBar(hp / maxHp);
      this.hpText.setText(`${hp} / ${maxHp}`);
    });
  }

  private drawHpBar(ratio: number): void {
    this.hpBarFill.clear();
    const color =
      ratio > 0.5 ? 0x00cc44 : ratio > 0.25 ? 0xcccc00 : 0xcc0000;
    this.hpBarFill.fillStyle(color, 1);
    this.hpBarFill.fillRoundedRect(
      this.hpBarX,
      this.hpBarY,
      Math.floor(this.hpBarW * ratio),
      this.hpBarH,
      4,
    );
  }

  update(): void {
    if (!this.gameScene.player) return;
    const cd = this.gameScene.player.dashCooldown;
    if (cd > 0) {
      this.dashText.setText(`DASH: ${(cd / 1000).toFixed(1)}s`);
      this.dashText.setColor('#cc0000');
    } else {
      this.dashText.setText('DASH: READY');
      this.dashText.setColor('#2a9d8f');
    }
  }
}
