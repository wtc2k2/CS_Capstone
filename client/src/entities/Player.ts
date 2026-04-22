import Phaser from 'phaser';
import { TILE_SIZE, isWalkable } from '../map/CampusMap';
import { ClassData } from '../data/Classes';

/**
 * Draw a directional slash arc at world position (wx, wy) facing (dirX, dirY).
 * Exported so RemotePlayer can use the same visual.
 */
export function drawSlash(
  scene: Phaser.Scene,
  wx: number,
  wy: number,
  dirX: number,
  dirY: number,
): void {
  const g = scene.add.graphics();
  g.setPosition(wx, wy); // origin at player so scale tween stays centered
  g.setDepth(12);

  // Base angle from facing direction
  const baseAngle = Math.atan2(dirY, dirX);
  const sweepHalf = Math.PI / 3; // 120° total sweep
  const radius = 24;
  const steps = 10;

  // Draw a fan arc relative to (0,0) = player position
  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1);
    const angle = baseAngle - sweepHalf + t * sweepHalf * 2;
    const nx = Math.cos(angle) * radius;
    const ny = Math.sin(angle) * radius;
    const alpha = 1 - Math.abs(t - 0.5) * 2; // fade at edges
    g.fillStyle(0xffffff, alpha * 0.85);
    g.fillCircle(nx, ny, 4);
  }

  // Expand slightly and fade out
  scene.tweens.add({
    targets: g,
    alpha: 0,
    scaleX: 1.3,
    scaleY: 1.3,
    duration: 180,
    ease: 'Quad.easeOut',
    onComplete: () => g.destroy(),
  });
}

interface CursorKeys {
  up: { isDown: boolean };
  down: { isDown: boolean };
  left: { isDown: boolean };
  right: { isDown: boolean };
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

  private body: Phaser.GameObjects.Sprite;
  private nameLabel?: Phaser.GameObjects.Text;
  private lastAttackTime = 0;
  isAttacking = false;
  alive = true;
  isDashing = false;
  private dashStartTime = 0;
  dashCharges = 3;
  private readonly MAX_DASH_CHARGES = 3;
  private dashChargeCooldown = 0;
  dashRechargeCooldown = 0;
  facingX = 0;
  facingY = 1; // default facing down
  private currentAnim = '';
  private bounceRemainX = 0;
  private bounceRemainY = 0;
  private static readonly BOUNCE_DIST = TILE_SIZE * 2; // 2 tiles = 32px
  private static readonly BOUNCE_SPEED = 200;          // px/s

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
    this.sprite.setSize(30, 30);

    this.body = scene.add.sprite(0, 0, classData.defaultTexture);
    this.body.setScale(classData.scale);
    this.sprite.add(this.body);

    this.sprite.setDepth(10);

    // Start idle-down animation immediately
    this.playAnim(`${classData.spriteKey}_idle_down`);
  }

  setNameLabel(name: string): void {
    if (this.nameLabel) this.nameLabel.destroy();
    this.nameLabel = this.scene.add.text(0, -22, name, {
      fontFamily: 'Courier New, monospace',
      fontSize: '9px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5);
    this.sprite.add(this.nameLabel);
  }

  getDirection(): string {
    if (this.facingY > 0) return 'down';
    if (this.facingY < 0) return 'up';
    if (this.facingX < 0) return 'left';
    return 'right';
  }

  private playAnim(key: string): void {
    if (this.currentAnim === key) return;
    this.currentAnim = key;
    this.body.play(key);
  }

  update(time: number, delta: number, cursors: CursorKeys): void {
    let vx = 0;
    let vy = 0;

    if (cursors.left.isDown) vx = -1;
    else if (cursors.right.isDown) vx = 1;
    if (cursors.up.isDown) vy = -1;
    else if (cursors.down.isDown) vy = 1;

    const isMoving = vx !== 0 || vy !== 0;
    if (isMoving) {
      this.facingX = vx;
      this.facingY = vy;
    }

    // Dash duration check
    if (this.isDashing && time - this.dashStartTime > 150) {
      this.isDashing = false;
    }

    // Horizontal flip for characters without directional left sprites
    if (this.classData.flipForLeft) {
      this.body.setFlipX(this.facingX < 0);
    } else if (this.classData.flipForRight) {
      this.body.setFlipX(this.facingX > 0);
    }

    // Animation state machine — attack anim blocks others until complete
    const dir = this.getDirection();
    if (!this.isAttacking) {
      let state: string;
      if (this.isDashing && isMoving) {
        const dashKey = `${this.classData.spriteKey}_dash_${dir}`;
        state = this.scene.anims.exists(dashKey) ? 'dash' : 'sprint';
      } else if (isMoving) state = 'run';
      else state = 'idle';
      this.playAnim(`${this.classData.spriteKey}_${state}_${dir}`);
    }

    // Dash charge recharge
    if (this.dashChargeCooldown > 0) {
      this.dashChargeCooldown -= delta;
    }
    if (this.dashCharges < this.MAX_DASH_CHARGES && this.dashRechargeCooldown > 0) {
      this.dashRechargeCooldown -= delta;
      if (this.dashRechargeCooldown <= 0) {
        this.dashCharges++;
        if (this.dashCharges < this.MAX_DASH_CHARGES) {
          this.dashRechargeCooldown = 3000;
        }
      }
    }

    const speedMult = this.isDashing ? 3 : 1;
    let moveX = vx;
    let moveY = vy;

    if (moveX !== 0 && moveY !== 0) {
      moveX *= 0.707;
      moveY *= 0.707;
    }

    const dist = this.speed * speedMult * (delta / 1000);
    const half = 15; // accurate to 32px sprite (±16), 1px inset

    // Sub-step movement so fast moves (dash, frame drops) can't skip past
    // a thin wall tile in one frame. Each sub-step is ≤ 8px (half a tile).
    const MAX_STEP = 8;
    const numSteps = Math.max(1, Math.ceil(dist / MAX_STEP));
    const stepX = (moveX * dist) / numSteps;
    const stepY = (moveY * dist) / numSteps;

    let xMoved = false;
    let yMoved = false;
    let xBlocked = false;
    let yBlocked = false;
    for (let i = 0; i < numSteps; i++) {
      if (!xBlocked) {
        if (this.canMove(this.sprite.x + stepX, this.sprite.y, half)) {
          this.sprite.x += stepX;
          xMoved = true;
        } else {
          xBlocked = true;
        }
      }
      if (!yBlocked) {
        if (this.canMove(this.sprite.x, this.sprite.y + stepY, half)) {
          this.sprite.y += stepY;
          yMoved = true;
        } else {
          yBlocked = true;
        }
      }
      if (xBlocked && yBlocked) break;
    }

    if (xMoved) this.bounceRemainX = 0;
    else if (isMoving && !this.isDashing) this.bounceRemainX = -moveX * Player.BOUNCE_DIST;
    if (yMoved) this.bounceRemainY = 0;
    else if (isMoving && !this.isDashing) this.bounceRemainY = -moveY * Player.BOUNCE_DIST;

    // Step toward remaining bounce distance at fixed speed
    const maxStep = Player.BOUNCE_SPEED * (delta / 1000);
    if (this.bounceRemainX !== 0) {
      const step = Math.sign(this.bounceRemainX) * Math.min(Math.abs(this.bounceRemainX), maxStep);
      if (this.canMove(this.sprite.x + step, this.sprite.y, half)) {
        this.sprite.x += step;
        this.bounceRemainX -= step;
        if (Math.abs(this.bounceRemainX) < 0.5) this.bounceRemainX = 0;
      } else {
        this.bounceRemainX = 0;
      }
    }
    if (this.bounceRemainY !== 0) {
      const step = Math.sign(this.bounceRemainY) * Math.min(Math.abs(this.bounceRemainY), maxStep);
      if (this.canMove(this.sprite.x, this.sprite.y + step, half)) {
        this.sprite.y += step;
        this.bounceRemainY -= step;
        if (Math.abs(this.bounceRemainY) < 0.5) this.bounceRemainY = 0;
      } else {
        this.bounceRemainY = 0;
      }
    }
  }

  canMove(px: number, py: number, half: number): boolean {
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

  isStuckInWall(): boolean {
    return !this.canMove(this.sprite.x, this.sprite.y, 15);
  }

  dash(time: number): void {
    if (this.dashCharges <= 0 || this.dashChargeCooldown > 0 || this.isDashing) return;
    this.isDashing = true;
    this.dashStartTime = time;
    this.dashCharges--;
    this.dashChargeCooldown = 400;

    if (this.dashRechargeCooldown <= 0) {
      this.dashRechargeCooldown = this.dashCharges === 0 ? 7000 : 3000;
    }

    this.scene.sound.play('sfx_dash', { volume: 0.8 });

    // Flash white
    this.body.setTint(0xffffff);
    this.scene.time.delayedCall(100, () => {
      this.body.clearTint();
    });
  }

  tryAttack(
    time: number,
    remotePlayers: Map<string, { sprite: Phaser.GameObjects.Container; alive: boolean }>,
    sendAttackFn: (id: string, dirX: number, dirY: number) => void,
    sendSwingFn: (dirX: number, dirY: number) => void,
  ): void {
    // Only attack (animation + damage) when the cooldown has elapsed
    if (time - this.lastAttackTime < this.attackRate) return;
    this.lastAttackTime = time;

    // Immediate local slash visual (no round-trip needed)
    drawSlash(this.scene, this.sprite.x, this.sprite.y, this.facingX, this.facingY);
    this.scene.sound.play('sfx_attack', { volume: 0.6 });

    // Notify server to broadcast swing visual to others
    sendSwingFn(this.facingX, this.facingY);

    // Play attack animation
    const dir = this.getDirection();
    const animKey = `${this.classData.spriteKey}_attack_${dir}`;
    this.isAttacking = true;
    this.currentAnim = animKey;
    this.body.stop();
    if (this.classData.flipForLeft) this.body.setFlipX(this.facingX < 0);
    else if (this.classData.flipForRight) this.body.setFlipX(this.facingX > 0);
    this.body.play(animKey);
    this.body.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
      this.isAttacking = false;
      this.currentAnim = '';
    });

    // Hit detection
    remotePlayers.forEach((rp, id) => {
      if (!rp.alive) return;
      const dist = Phaser.Math.Distance.Between(
        this.sprite.x, this.sprite.y,
        rp.sprite.x, rp.sprite.y,
      );
      if (dist <= this.attackRange) {
        sendAttackFn(id, this.facingX, this.facingY);
      }
    });
  }

  takeDamage(amount: number): void {
    this.hp = Math.max(0, this.hp - amount);
    this.body.setTint(0xff4444);
    this.scene.time.delayedCall(100, () => { this.body.clearTint(); });
    this.scene.events.emit('playerHpChanged', this.hp, this.maxHp);

    const dmgKey = `${this.classData.spriteKey}_take_damage_${this.getDirection()}`;
    if (this.scene.anims.exists(dmgKey) && !this.isAttacking) {
      this.isAttacking = true;
      this.currentAnim = dmgKey;
      this.body.play(dmgKey);
      this.body.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
        this.isAttacking = false;
        this.currentAnim = '';
      });
    }
  }

  playDeath(): void {
    const dir = this.getDirection();
    this.isAttacking = false;
    this.body.stop();
    const deathKey = `${this.classData.spriteKey}_death_${dir}`;
    if (this.scene.anims.exists(deathKey)) {
      this.body.play(deathKey);
    } else {
      this.sprite.setVisible(false);
    }
  }

  playRespawn(): void {
    this.isAttacking = false;
    this.sprite.setVisible(true);
    this.currentAnim = '';
    this.body.play(`${this.classData.spriteKey}_idle_down`);
  }

  get x(): number { return this.sprite.x; }
  get y(): number { return this.sprite.y; }
}
