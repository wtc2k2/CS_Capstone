import Phaser from 'phaser';

export class Dummy {
  scene: Phaser.Scene;
  maxHp: number;
  hp: number;
  alive: boolean;
  sprite: Phaser.GameObjects.Container;

  private spawnX: number;
  private spawnY: number;
  private body: Phaser.GameObjects.Graphics;
  private hpBarFill: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.scene = scene;
    this.maxHp = 60;
    this.hp = this.maxHp;
    this.alive = true;
    this.spawnX = x;
    this.spawnY = y;

    this.sprite = scene.add.container(x, y);

    // Body
    this.body = scene.add.graphics();
    this.drawBody(0x888888);
    this.sprite.add(this.body);

    // HP bar background
    const hpBarBg = scene.add.graphics();
    hpBarBg.fillStyle(0x333333, 1);
    hpBarBg.fillRect(-10, -16, 20, 4);
    this.sprite.add(hpBarBg);

    // HP bar fill
    this.hpBarFill = scene.add.graphics();
    this.updateHpBar();
    this.sprite.add(this.hpBarFill);

    this.sprite.setDepth(5);
  }

  private drawBody(color: number): void {
    this.body.clear();
    this.body.fillStyle(color, 1);
    this.body.fillRect(-7, -7, 14, 14);
    this.body.lineStyle(1, 0x000000, 1);
    this.body.strokeRect(-7, -7, 14, 14);
    // X mark
    this.body.lineStyle(2, 0xff0000, 0.6);
    this.body.lineBetween(-4, -4, 4, 4);
    this.body.lineBetween(-4, 4, 4, -4);
  }

  private updateHpBar(): void {
    this.hpBarFill.clear();
    const ratio = this.hp / this.maxHp;
    const color =
      ratio > 0.5 ? 0x00ff00 : ratio > 0.25 ? 0xffff00 : 0xff0000;
    this.hpBarFill.fillStyle(color, 1);
    this.hpBarFill.fillRect(-10, -16, Math.floor(20 * ratio), 4);
  }

  takeDamage(amount: number): void {
    if (!this.alive) return;

    this.hp = Math.max(0, this.hp - amount);
    this.updateHpBar();

    this.drawBody(0xff0000);
    this.scene.time.delayedCall(120, () => {
      if (this.alive) this.drawBody(0x888888);
    });

    if (this.hp <= 0) this.die();
  }

  private die(): void {
    this.alive = false;
    this.sprite.setVisible(false);
    this.scene.time.delayedCall(5000, () => this.respawn());
  }

  private respawn(): void {
    this.hp = this.maxHp;
    this.alive = true;
    this.sprite.setPosition(this.spawnX, this.spawnY);
    this.sprite.setVisible(true);
    this.drawBody(0x888888);
    this.updateHpBar();
  }
}
