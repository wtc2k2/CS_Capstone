import Phaser from 'phaser';
import { TILE_SIZE, isWalkable } from '../map/CampusMap';
import { ClassData } from '../data/Classes';
import type { Dummy } from './Dummy';

interface CursorKeys {
  up: Phaser.Input.Keyboard.Key;
  down: Phaser.Input.Keyboard.Key;
  left: Phaser.Input.Keyboard.Key;
  right: Phaser.Input.Keyboard.Key;
}

export class Player {
  scene: Phaser.Scene;
  classData: ClassData;
  hp: number;
  maxHp: number;
  speed: number;
  attackDamage: number;
  attackRange: number;
  attackRate: number;

  sprite: Phaser.GameObjects.Container;

  private body: Phaser.GameObjects.Graphics;
  private eyes: Phaser.GameObjects.Graphics;
  private lastAttackTime = 0;
  isDashing = false;
  private dashStartTime = 0;
  dashCooldown = 0;
  private facingX = 0;
  private facingY = 1;

  constructor(scene: Phaser.Scene, x: number, y: number, classData: ClassData) {
    this.scene = scene;
    this.classData = classData;
    this.hp = classData.maxHp;
    this.maxHp = classData.maxHp;
    this.speed = classData.speed;
    this.attackDamage = classData.attackDamage;
    this.attackRange = classData.attackRange;
    this.attackRate = classData.attackRate;

    this.sprite = scene.add.container(x, y);
    this.sprite.setSize(14, 14);

    // Body
    this.body = scene.add.graphics();
    this.drawBodyColor(classData.color);
    this.sprite.add(this.body);

    // Eyes
    this.eyes = scene.add.graphics();
    this.drawEyes();
    this.sprite.add(this.eyes);

    this.sprite.setDepth(10);
  }

  private drawBodyColor(color: number): void {
    this.body.clear();
    this.body.fillStyle(color, 1);
    this.body.fillRect(-7, -7, 14, 14);
    this.body.lineStyle(1, 0x000000, 1);
    this.body.strokeRect(-7, -7, 14, 14);
  }

  private drawEyes(): void {
    this.eyes.clear();
    this.eyes.fillStyle(0xffffff, 1);

    let ex1: number, ey1: number, ex2: number, ey2: number;

    if (this.facingY < 0) {
      ex1 = -3; ey1 = -4; ex2 = 3; ey2 = -4;
    } else if (this.facingY > 0) {
      ex1 = -3; ey1 = 2; ex2 = 3; ey2 = 2;
    } else if (this.facingX < 0) {
      ex1 = -4; ey1 = -2; ex2 = -4; ey2 = 3;
    } else {
      ex1 = 4; ey1 = -2; ex2 = 4; ey2 = 3;
    }

    this.eyes.fillCircle(ex1, ey1, 1.5);
    this.eyes.fillCircle(ex2, ey2, 1.5);
  }

  update(time: number, delta: number, cursors: CursorKeys): void {
    let vx = 0;
    let vy = 0;

    if (cursors.left.isDown) vx = -1;
    else if (cursors.right.isDown) vx = 1;
    if (cursors.up.isDown) vy = -1;
    else if (cursors.down.isDown) vy = 1;

    if (vx !== 0 || vy !== 0) {
      this.facingX = vx;
      this.facingY = vy;
      this.drawEyes();
    }

    // Dash duration check
    if (this.isDashing && time - this.dashStartTime > 150) {
      this.isDashing = false;
    }

    if (this.dashCooldown > 0) {
      this.dashCooldown -= delta;
    }

    const speedMult = this.isDashing ? 3 : 1;
    let moveX = vx;
    let moveY = vy;

    // Normalize diagonal
    if (moveX !== 0 && moveY !== 0) {
      moveX *= 0.707;
      moveY *= 0.707;
    }

    const dist = this.speed * speedMult * (delta / 1000);
    const newX = this.sprite.x + moveX * dist;
    const newY = this.sprite.y + moveY * dist;

    const half = 6;

    if (this.canMove(newX, this.sprite.y, half)) {
      this.sprite.x = newX;
    }
    if (this.canMove(this.sprite.x, newY, half)) {
      this.sprite.y = newY;
    }
  }

  private canMove(px: number, py: number, half: number): boolean {
    const corners = [
      { x: px - half, y: py - half },
      { x: px + half, y: py - half },
      { x: px - half, y: py + half },
      { x: px + half, y: py + half },
    ];
    for (const c of corners) {
      const tx = Math.floor(c.x / TILE_SIZE);
      const ty = Math.floor(c.y / TILE_SIZE);
      if (!isWalkable(tx, ty)) return false;
    }
    return true;
  }

  dash(time: number): void {
    if (this.dashCooldown > 0 || this.isDashing) return;
    this.isDashing = true;
    this.dashStartTime = time;
    this.dashCooldown = 3000;

    // Flash white
    this.drawBodyColor(0xffffff);
    this.scene.time.delayedCall(100, () => {
      this.drawBodyColor(this.classData.color);
    });
  }

  tryAttack(time: number, dummies: Dummy[]): void {
    if (time - this.lastAttackTime < this.attackRate) return;

    let hit = false;
    for (const dummy of dummies) {
      if (!dummy.alive) continue;
      const dist = Phaser.Math.Distance.Between(
        this.sprite.x,
        this.sprite.y,
        dummy.sprite.x,
        dummy.sprite.y,
      );
      if (dist <= this.attackRange) {
        dummy.takeDamage(this.attackDamage);
        hit = true;
      }
    }

    if (hit) {
      this.lastAttackTime = time;
      this.showAttackVisual();
    }
  }

  private showAttackVisual(): void {
    const g = this.scene.add.graphics();
    const sx = this.sprite.x + this.facingX * 14;
    const sy = this.sprite.y + this.facingY * 14;
    g.fillStyle(0xffffff, 0.8);
    g.fillCircle(sx, sy, 6);
    g.setDepth(11);
    this.scene.time.delayedCall(100, () => g.destroy());
  }

  takeDamage(amount: number): void {
    this.hp = Math.max(0, this.hp - amount);
    this.drawBodyColor(0xff0000);
    this.scene.time.delayedCall(100, () => {
      this.drawBodyColor(this.classData.color);
    });
    this.scene.events.emit('playerHpChanged', this.hp, this.maxHp);
  }

  get x(): number { return this.sprite.x; }
  get y(): number { return this.sprite.y; }
}
