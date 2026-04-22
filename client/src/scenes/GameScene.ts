import Phaser from 'phaser';
import {
  TILE_SIZE,
  MAP_W,
  MAP_H,
  setGamePhase,
  setBitmask,
  getBitmask,
  buildBitmaskFromImageData,
  findSafeSpawn,
} from '../map/CampusMap';
import { ClassData, DEFAULT_CLASS, CHARACTERS } from '../data/Classes';
import { Player } from '../entities/Player';
import { RemotePlayer } from '../entities/RemotePlayer';
import { sendPosition, sendAttack, sendSwing, sendEndGame, sendFireball, sendFireballLaunched, sendPickupCollect, sendPickupRespawnPos, sendTagCollect, sendBombDropped } from '../network/Network';
import { Room, getStateCallbacks } from '@colyseus/sdk';

interface ActiveProjectile {
  sprite: Phaser.GameObjects.Sprite;
  dirX: number;
  dirY: number;
  traveled: number;
  flickering: boolean;
  flickerTimer: number;
}

interface PickupItem {
  sprite: Phaser.GameObjects.Image;
  active: boolean;
  worldX: number;
  worldY: number;
  tween?: Phaser.Tweens.Tween;
}

export class GameScene extends Phaser.Scene {
  player!: Player;

  private classData!: ClassData;
  private cursors!: {
    up: Phaser.Input.Keyboard.Key;
    down: Phaser.Input.Keyboard.Key;
    left: Phaser.Input.Keyboard.Key;
    right: Phaser.Input.Keyboard.Key;
  };
  private arrowKeys!: Phaser.Types.Input.Keyboard.CursorKeys;
  private spaceKey!: Phaser.Input.Keyboard.Key;
  private attackKey!: Phaser.Input.Keyboard.Key;

  private room?: Room;
  private remotePlayers: Map<string, RemotePlayer> = new Map();
  private lastSendTime = 0;
  private static readonly SEND_INTERVAL = 50; // ~20fps

  private eliminatedText?: Phaser.GameObjects.Text;
  private eliminatedSubtext?: Phaser.GameObjects.Text;
  private eliminatedOverlay?: Phaser.GameObjects.Graphics;
  private mapLayer?: Phaser.GameObjects.Graphics;
  private campusMapGraphics?: Phaser.GameObjects.Graphics | Phaser.GameObjects.Image;
  private buildingImages: Phaser.GameObjects.Image[] = [];
  private gamePhase: 'waiting' | 'playing' = 'waiting';
  private countdownActive = false;
  private pKey!: Phaser.Input.Keyboard.Key;
  private fireballCount = 0;
  private readonly MAX_FIREBALLS = 3;
  private readonly FIREBALL_SPEED = 495;
  private FIREBALL_RANGE_PX = 240;
  private FIREBALL_FLICKER_PX = 208;
  private lastFireballTime = 0;
  private FIREBALL_COOLDOWN = 500;
  private activeProjectiles: ActiveProjectile[] = [];
  private remoteProjectiles: ActiveProjectile[] = [];
  private pickupItems: PickupItem[] = [];
  private healthPickups: PickupItem[] = [];
  private bombPickups: PickupItem[] = [];
  private bombCount = 0;
  private readonly MAX_BOMBS = 1;
  private readonly BOMB_FUSE_MS = 2000;
  private readonly BOMB_RADIUS_PX = 5 * TILE_SIZE; // 5-tile radius = 80px
  private activeBombs = new Map<number, { sprite: Phaser.GameObjects.Sprite; tickTimer: Phaser.Time.TimerEvent; x: number; y: number }>();
  private validPickupTiles: { wx: number; wy: number }[] = [];
  private pickupRng: (() => number) | null = null;
  private activeTags = new Map<number, Phaser.GameObjects.Image>();
  private gameMode: string = 'ffa';
  private pendingTagCollects = new Set<number>();

  constructor() {
    super('GameScene');
  }

  preload(): void {
    // Adventurer — one texture per state+direction; all frames are 96px wide
    for (const state of ['idle', 'run', 'attack']) {
      for (const dir of ['down', 'up', 'left', 'right']) {
        this.load.spritesheet(`adventurer_${state}_${dir}`,
          `/characters/adventurer_${state}_${dir}.png`,
          { frameWidth: 96, frameHeight: 80 });
      }
    }

    // Scout + Lancer — 48×64 frames (8 frames per sheet), spear weapon
    for (const sk of ['scout', 'lancer']) {
      for (const state of ['idle', 'run', 'attack', 'dash', 'death']) {
        for (const dir of ['down', 'up', 'left', 'right']) {
          this.load.spritesheet(`${sk}_${state}_${dir}`,
            `/characters/${sk}_${state}_${dir}.png`,
            { frameWidth: 48, frameHeight: 64 });
        }
      }
    }

    this.load.image('campus-map', '/campus-map.png');
    this.load.image('kill-tag', '/kill-tag.png');
    this.load.spritesheet('fireball', '/fireball-sheet.png', { frameWidth: 64, frameHeight: 32 });
    this.load.image('fireball-pickup', '/fireball-pickup.png');
    this.load.image('health-pickup', '/health-pickup.png');
    this.load.image('bomb-pickup', '/bomb-pickup.png');
    this.load.spritesheet('bomb', '/bomb-sheet.png', { frameWidth: 32, frameHeight: 32 });

    this.load.audio('sfx_attack',    '/audio/attack.mp3');
    this.load.audio('sfx_dash',      '/audio/dash.mp3');
    this.load.audio('sfx_hit',       '/audio/hit.mp3');
    this.load.audio('sfx_dead',      '/audio/dead.mp3');
    this.load.audio('sfx_countdown', '/audio/countdown.mp3');
    this.load.audio('sfx_menu',      '/audio/menu_hover.mp3');
    this.load.audio('sfx_coin1',         '/audio/coin1.wav');
    this.load.audio('sfx_coin2',         '/audio/coin2.wav');
    this.load.audio('sfx_coin3',         '/audio/coin3.wav');
    this.load.audio('sfx_fireball_hit1', '/audio/fireball_hit1.wav');
    this.load.audio('sfx_fireball_hit2', '/audio/fireball_hit2.wav');
    this.load.audio('sfx_fireball_hit3', '/audio/fireball_hit3.wav');
    this.load.audio('sfx_pickup_fireball', '/audio/pickup_fireball.wav');
    this.load.audio('sfx_pickup_health',   '/audio/pickup_health.wav');
  }

  init(data?: { classData?: ClassData }): void {
    this.classData = data?.classData ?? this.registry.get('classData') ?? DEFAULT_CLASS;
    this.FIREBALL_RANGE_PX = this.classData.fireballRange * 16; // tiles → px
    this.FIREBALL_FLICKER_PX = this.FIREBALL_RANGE_PX - 32;
    this.FIREBALL_COOLDOWN = this.classData.fireballRate;
  }

  create(): void {
    this.createCharacterAnimations();

    this.anims.create({
      key: 'fireball_fly',
      frames: this.anims.generateFrameNumbers('fireball', { start: 0, end: 4 }),
      frameRate: 12,
      repeat: -1,
    });

    // Bomb: frames 0-1 = tick (alternating while fuse burns), frames 2-8 = explosion burst (plays once)
    this.anims.create({
      key: 'bomb_tick',
      frames: this.anims.generateFrameNumbers('bomb', { start: 0, end: 1 }),
      frameRate: 4,
      repeat: -1,
    });
    this.anims.create({
      key: 'bomb_explode',
      frames: this.anims.generateFrameNumbers('bomb', { start: 2, end: 8 }),
      frameRate: 15,
      repeat: 0,
    });


    // Build walkability bitmask now — image is guaranteed decoded after preload
    const tex = this.textures.get('campus-map');
    const src = tex.getSourceImage() as HTMLImageElement;
    const offscreen = document.createElement('canvas');
    offscreen.width = src.naturalWidth;
    offscreen.height = src.naturalHeight;
    const ctx = offscreen.getContext('2d')!;
    ctx.drawImage(src, 0, 0);
    setBitmask(buildBitmaskFromImageData(
      ctx.getImageData(0, 0, offscreen.width, offscreen.height),
      offscreen.width, offscreen.height,
    ));
    this.buildValidPickupTiles();

    // Start in waiting room (20×20 tiles)
    const waitW = 20 * TILE_SIZE;
    const waitH = 20 * TILE_SIZE;
    this.drawWaitingRoom();

    // Spawn at center of waiting room; server will update position on first state sync
    const spawnX = waitW / 2;
    const spawnY = waitH / 2;
    this.player = new Player(this, spawnX, spawnY, this.classData);

    // Camera — zoom to show full 30-tile waiting room
    this.cameras.main.setZoom(this.cameras.main.width / (22 * TILE_SIZE));
    this.cameras.main.setBounds(0, 0, waitW, waitH);
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
    this.arrowKeys = kb.createCursorKeys();
    this.spaceKey = kb.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.attackKey = kb.addKey(Phaser.Input.Keyboard.KeyCodes.O);
    this.pKey = kb.addKey(Phaser.Input.Keyboard.KeyCodes.P);

    // HUD
    this.scene.launch('HUDScene', {
      classData: this.classData,
      gameScene: this,
    });

    this.events.emit('playerHpChanged', this.player.hp, this.player.maxHp);
  }

  /** Called by HUDScene once a room is joined/created */
  onRoomConnected(room: Room): void {
    this.room = room;

    // If the lobby already synced state, set up immediately.
    // Otherwise wait for the first patch (handles fresh joins where state isn't ready yet).
    const state = room.state as any;
    if (state && state.players && state.players.size >= 0) {
      this.setupMultiplayer(room, state);
    } else {
      room.onStateChange.once((s: any) => {
        this.setupMultiplayer(room, s);
      });
    }
  }

  private drawWaitingRoom(): void {
    if (this.mapLayer) { this.mapLayer.destroy(); this.mapLayer = undefined; }
    const g = this.add.graphics();
    const size = 20;

    // Interior — walkable ground
    g.fillStyle(0x4a5568, 1);
    g.fillRect(TILE_SIZE, TILE_SIZE, (size - 2) * TILE_SIZE, (size - 2) * TILE_SIZE);

    // Walls (border)
    g.fillStyle(0x2d3748, 1);
    for (let i = 0; i < size; i++) {
      g.fillRect(0, i * TILE_SIZE, TILE_SIZE, TILE_SIZE);                           // left
      g.fillRect((size - 1) * TILE_SIZE, i * TILE_SIZE, TILE_SIZE, TILE_SIZE);     // right
      g.fillRect(i * TILE_SIZE, 0, TILE_SIZE, TILE_SIZE);                           // top
      g.fillRect(i * TILE_SIZE, (size - 1) * TILE_SIZE, TILE_SIZE, TILE_SIZE);     // bottom
    }

    // Subtle grid
    g.lineStyle(1, 0x000000, 0.08);
    for (let y = 0; y <= size; y++) g.lineBetween(0, y * TILE_SIZE, size * TILE_SIZE, y * TILE_SIZE);
    for (let x = 0; x <= size; x++) g.lineBetween(x * TILE_SIZE, 0, x * TILE_SIZE, size * TILE_SIZE);

    g.setDepth(0);
    this.mapLayer = g;
    setGamePhase('waiting');
  }

  startFullGame(): void {
    setGamePhase('playing');
    this.gamePhase = 'playing';

    if (this.mapLayer) { this.mapLayer.destroy(); this.mapLayer = undefined; }
    this.drawMap();

    const worldW = MAP_W * TILE_SIZE;
    const worldH = MAP_H * TILE_SIZE;
    this.cameras.main.setBounds(0, 0, worldW, worldH);
    this.cameras.main.setZoom(this.cameras.main.width / (60 * TILE_SIZE));

    // Sync local player to server-assigned spawn, snapped to nearest walkable tile.
    // Use a delayedCall(0) as backup so position is read after all state patches settle.
    const syncSpawn = () => {
      if (this.room) {
        const myState = (this.room.state as any).players.get(this.room.sessionId);
        if (myState) {
          const safe = findSafeSpawn(myState.x, myState.y);
          this.player.sprite.x = safe.x;
          this.player.sprite.y = safe.y;
        }
      }
    };
    syncSpawn();
    this.time.delayedCall(0, syncSpawn);

    const seed = (this.room?.state as any)?.pickupSeed ?? (Date.now() & 0xFFFFFF);
    this.pickupRng = GameScene.makeSeededRng(seed);
    this.spawnPickupItems();
    this.events.emit('gameModeSet', this.gameMode);
    this.events.emit('gameStarted');
  }

  private setupMultiplayer(room: Room, state: any): void {
    const $ = getStateCallbacks(room) as any;

    // Read game mode from state
    this.gameMode = (state as any).gameMode || 'ffa';
    this.events.emit('gameModeSet', this.gameMode);

    // Move local player to server-assigned spawn position and show name
    const myState = state.players.get(room.sessionId);
    if (myState) {
      this.player.sprite.x = myState.x;
      this.player.sprite.y = myState.y;
      this.player.setNameLabel(myState.name);
    }

    $(state.players).onAdd((playerState: any, sessionId: string) => {
      if (sessionId === room.sessionId) {
        // Local player state listeners
        $(playerState).listen("hp", () => {
          const prevHp = this.player.hp;
          this.player.hp = playerState.hp;
          this.player.maxHp = playerState.maxHp;
          this.events.emit('playerHpChanged', playerState.hp, playerState.maxHp);
          if (playerState.hp < prevHp) {
            this.player.takeDamage(0); // flash only, no additional HP reduction
            this.sound.play('sfx_hit', { volume: 0.4 });
          }
        });

        $(playerState).listen("kills", () => {
          this.events.emit('playerKillsChanged', playerState.kills);
        });

        // Teleport local player when the server assigns a new spawn position.
        // Only applies when the delta is large (>150px) — i.e. a server teleport, not normal movement.
        $(playerState).listen("x", () => {
          if (Math.abs(playerState.x - this.player.sprite.x) > 150) {
            this.player.sprite.x = playerState.x;
          }
        });
        $(playerState).listen("y", () => {
          if (Math.abs(playerState.y - this.player.sprite.y) > 150) {
            this.player.sprite.y = playerState.y;
          }
        });

        $(playerState).listen("alive", () => {
          this.player.alive = playerState.alive;
          if (!playerState.alive) {
            this.player.playDeath();
            // showEliminatedOverlay is called from 'killed' handler with killer name
            this.sound.play('sfx_dead', { volume: 0.4 });
          } else {
            this.player.playRespawn();
            this.hideEliminatedOverlay();
            const safe = findSafeSpawn(playerState.x, playerState.y);
            this.player.sprite.x = safe.x;
            this.player.sprite.y = safe.y;
            // Re-attach camera to local player after respawn (may have been following killer)
            this.cameras.main.startFollow(this.player.sprite, true, 0.1, 0.1);
          }
        });

        $(playerState).listen("confirmedKills", (value: number) => {
          this.events.emit('confirmedKillChanged', value);
        });
        return;
      }

      const resolvedClassData = CHARACTERS.find(c => c.spriteKey === playerState.spriteKey)
        ?? CHARACTERS[0];
      const remote = new RemotePlayer(
        this,
        playerState.x,
        playerState.y,
        playerState.name || sessionId.slice(0, 4),
        playerState.color,
        resolvedClassData,
      );
      remote.updateHp(playerState.hp, playerState.maxHp);
      remote.setAlive(playerState.alive);
      this.remotePlayers.set(sessionId, remote);

      $(playerState).listen("x", () => {
        const rp = this.remotePlayers.get(sessionId);
        if (rp) rp.updatePosition(playerState.x, playerState.y);
      });

      $(playerState).listen("y", () => {
        const rp = this.remotePlayers.get(sessionId);
        if (rp) rp.updatePosition(playerState.x, playerState.y);
      });

      $(playerState).listen("hp", () => {
        const rp = this.remotePlayers.get(sessionId);
        if (rp) {
          const prevHp = rp.hp;
          rp.updateHp(playerState.hp, playerState.maxHp);
          if (playerState.hp < prevHp) {
            rp.takeDamageFlash();
          }
        }
      });

      $(playerState).listen("alive", () => {
        const rp = this.remotePlayers.get(sessionId);
        if (!rp) return;
        rp.setAlive(playerState.alive);
        if (!playerState.alive) {
          rp.playDeath();
        } else {
          rp.playRespawn();
        }
      });
    }, true);

    $(state.players).onRemove((_playerState: any, sessionId: string) => {
      const remote = this.remotePlayers.get(sessionId);
      if (remote) {
        remote.destroy();
        this.remotePlayers.delete(sessionId);
      }
    });

    $(state).listen('phase', (value: string) => {
      if (value === 'playing') this.startFullGame();
      else if (value === 'waiting' && this.gamePhase === 'playing') this.revertToWaitingRoom();
    });

    $(state).listen('hostSessionId', (value: string) => {
      this.events.emit('hostChanged', value);
    });

    $(state).listen('timeRemaining', (value: number) => {
      this.events.emit('timeRemainingUpdated', value);
    });

    $(state).listen('gameOver', () => {
      if (!state.gameOver) return;
      const scores: { name: string; kills: number; deaths: number; confirmedKills: number }[] = [];
      state.players.forEach((p: any) => {
        scores.push({ name: p.name, kills: p.kills, deaths: p.deaths, confirmedKills: p.confirmedKills ?? 0 });
      });
      scores.sort((a, b) => {
        if (this.gameMode === 'killConfirmed') {
          if (b.confirmedKills !== a.confirmedKills) return b.confirmedKills - a.confirmedKills;
          return b.kills - a.kills;
        }
        const kdA = a.kills / Math.max(a.deaths, 1);
        const kdB = b.kills / Math.max(b.deaths, 1);
        if (kdB !== kdA) return kdB - kdA;
        return b.kills - a.kills;
      });
      this.events.emit('gameOver', scores, state.timeLimitReached ?? false);
    });

    room.onMessage('killed', (data: {
      victimId: string; killerId: string;
      victimName: string; killerName: string; weapon: string;
    }) => {
      // Kill feed for everyone (rendered by HUDScene)
      this.events.emit('killFeedEntry', data.killerName, data.victimName, data.weapon);

      if (data.victimId !== room.sessionId) return;
      // Camera follows the killer so the dead player can spectate briefly
      const killer = this.remotePlayers.get(data.killerId);
      if (killer) {
        this.cameras.main.stopFollow();
        this.cameras.main.startFollow(killer.sprite, true, 0.08, 0.08);
      }
      this.showEliminatedOverlay(data.killerName);
    });

    room.onMessage('attackEffect', (data: {
      attackerId: string;
      targetId: string;
      x: number;
      y: number;
      dirX: number;
      dirY: number;
    }) => {
      // Local player draws slash immediately in tryAttack — skip to avoid double-slash
      if (data.attackerId === room.sessionId) return;
      const rp = this.remotePlayers.get(data.attackerId);
      if (rp) rp.showAttackEffect(data.dirX, data.dirY);
    });

    room.onMessage('fireballEffect', (data: {
      shooterId: string;
      x: number;
      y: number;
      dirX: number;
      dirY: number;
    }) => {
      const angle = Math.atan2(data.dirY, data.dirX) * (180 / Math.PI);
      const sprite = this.add.sprite(data.x, data.y, 'fireball');
      sprite.setDisplaySize(104, 52).setDepth(12).setAngle(angle);
      sprite.play('fireball_fly');
      this.remoteProjectiles.push({
        sprite, dirX: data.dirX, dirY: data.dirY,
        traveled: 0, flickering: false, flickerTimer: 0,
      });
    });

    room.onMessage('damageDealt', (data: { x: number; y: number; damage: number; type: string }) => {
      const color = data.type === 'fireball' ? '#ffd700' : '#ffffff';
      if (data.type === 'fireball') {
        const sfx = ['sfx_fireball_hit1', 'sfx_fireball_hit2', 'sfx_fireball_hit3'][Math.floor(Math.random() * 3)];
        this.sound.play(sfx, { volume: 0.4 });
      }
      this.showFloatingDamage(data.x, data.y, data.damage, color);
    });

    room.onMessage('pickupCollected', (data: { type: string; idx: number; collectorId: string }) => {
      const items = data.type === 'fireball' ? this.pickupItems
                  : data.type === 'bomb'     ? this.bombPickups
                  : this.healthPickups;
      const item = items[data.idx];
      if (!item) return;
      item.active = false;
      item.tween?.stop();
      item.sprite.setVisible(false);
      // Only apply the effect to the player who picked it up
      if (data.collectorId === room.sessionId) {
        if (data.type === 'fireball') {
          this.fireballCount = Math.min(this.fireballCount + 1, this.MAX_FIREBALLS);
          this.events.emit('inventoryChanged', this.fireballCount);
          this.sound.play('sfx_pickup_fireball', { volume: 0.4 });
        } else if (data.type === 'bomb') {
          this.bombCount = Math.min(this.bombCount + 1, this.MAX_BOMBS);
          this.events.emit('bombCountChanged', this.bombCount);
          this.sound.play('sfx_pickup_fireball', { volume: 0.4 });
        } else {
          this.sound.play('sfx_pickup_health', { volume: 0.4 });
        }
      }
    });

    room.onMessage('pickupNeedsRespawn', (data: { type: string; idx: number }) => {
      // Only the host handles this message — pick a new position and send it back
      const pos = this.randomWalkableTile();
      sendPickupRespawnPos(data.type, data.idx, pos.wx, pos.wy);
    });

    room.onMessage('pickupRespawned', (data: { type: string; idx: number; wx: number; wy: number }) => {
      const items = data.type === 'fireball' ? this.pickupItems
                  : data.type === 'bomb'     ? this.bombPickups
                  : this.healthPickups;
      const item = items[data.idx];
      if (!item) return;
      // Kill any lingering tweens on this sprite so the new bounce starts cleanly
      this.tweens.killTweensOf(item.sprite);
      item.worldX = data.wx;
      item.worldY = data.wy;
      item.sprite.setPosition(data.wx, data.wy);
      item.sprite.setVisible(true);
      item.active = true;
      item.tween = this.tweens.add({
        targets: item.sprite,
        y: data.wy - 5,
        duration: 900,
        ease: 'Sine.easeInOut',
        yoyo: true,
        repeat: -1,
      });
    });

    room.onMessage('bombPlaced', (data: { bombId: number; x: number; y: number; ownerId: string }) => {
      const sprite = this.add.sprite(data.x, data.y, 'bomb', 0);
      sprite.setDisplaySize(48, 48).setDepth(11);
      sprite.play('bomb_tick');
      // Subtle scale pulse for tension
      const tickTimer = this.tweens.add({
        targets: sprite,
        scale: { from: sprite.scaleX, to: sprite.scaleX * 1.1 },
        duration: 250,
        ease: 'Sine.easeInOut',
        yoyo: true,
        repeat: -1,
      });
      // Store as a lightweight TimerEvent-shaped object (we reuse Phaser tween for pulse instead)
      this.activeBombs.set(data.bombId, {
        sprite,
        tickTimer: { remove: () => tickTimer.stop() } as unknown as Phaser.Time.TimerEvent,
        x: data.x,
        y: data.y,
      });
    });

    room.onMessage('bombExploded', (data: {
      bombId: number; x: number; y: number;
      victims: { id: string; name: string; damage: number; dead: boolean; x: number; y: number }[];
    }) => {
      const entry = this.activeBombs.get(data.bombId);
      if (entry) {
        entry.tickTimer.remove();
        entry.sprite.setScale(1);
      }
      // Play the explosion burst. Reuse the existing sprite if still alive, else create one.
      const burst = entry?.sprite ?? this.add.sprite(data.x, data.y, 'bomb', 2);
      burst.setDepth(12).setDisplaySize(this.BOMB_RADIUS_PX * 2, this.BOMB_RADIUS_PX * 2);
      burst.play('bomb_explode');
      burst.once('animationcomplete', () => burst.destroy());
      this.activeBombs.delete(data.bombId);

      // Play a hit sound reusing the fireball hit variants
      const sfx = ['sfx_fireball_hit1', 'sfx_fireball_hit2', 'sfx_fireball_hit3'][Math.floor(Math.random() * 3)];
      this.sound.play(sfx, { volume: 0.6 });

      data.victims.forEach(v => {
        this.showFloatingDamage(v.x, v.y, v.damage, '#ff6b6b');
      });
    });

    // ── Kill Confirmed tag messages ──
    room.onMessage('tagDropped', (data: { tagId: number; x: number; y: number }) => {
      const sprite = this.add.image(data.x, data.y, 'kill-tag');
      sprite.setDisplaySize(48, 48).setDepth(11);
      this.tweens.add({
        targets: sprite,
        y: data.y - 4,
        duration: 600,
        ease: 'Sine.easeInOut',
        yoyo: true,
        repeat: -1,
      });
      this.activeTags.set(data.tagId, sprite);
    });

    room.onMessage('tagCollected', (data: { tagId: number; collectorId: string; collectorName: string }) => {
      const coinSfx = ['sfx_coin1', 'sfx_coin2', 'sfx_coin3'][Math.floor(Math.random() * 3)];
      this.sound.play(coinSfx, { volume: 0.4 });
      const sprite = this.activeTags.get(data.tagId);
      if (sprite) {
        const text = this.add.text(sprite.x, sprite.y - 10, '+1', {
          fontFamily: 'monospace',
          fontSize: '20px',
          color: '#ffd700',
          fontStyle: 'bold',
          stroke: '#000000',
          strokeThickness: 3,
        }).setOrigin(0.5).setDepth(10000);
        this.tweens.add({
          targets: text,
          y: sprite.y - 40,
          alpha: 0,
          duration: 1200,
          ease: 'Power2',
          onComplete: () => text.destroy(),
        });
        sprite.destroy();
        this.activeTags.delete(data.tagId);
      }
      this.pendingTagCollects.delete(data.tagId);
    });

    room.onMessage('tagExpired', (data: { tagId: number }) => {
      const sprite = this.activeTags.get(data.tagId);
      if (sprite) {
        this.tweens.add({
          targets: sprite,
          alpha: 0,
          duration: 500,
          onComplete: () => sprite.destroy(),
        });
        this.activeTags.delete(data.tagId);
      }
      this.pendingTagCollects.delete(data.tagId);
    });
  }

  setCountdownActive(v: boolean): void {
    this.countdownActive = v;
  }

  revertToWaitingRoom(): void {
    this.activeProjectiles.forEach(p => p.sprite.destroy());
    this.activeProjectiles = [];
    this.remoteProjectiles.forEach(p => p.sprite.destroy());
    this.remoteProjectiles = [];
    this.pickupItems.forEach(p => { p.tween?.stop(); p.sprite.destroy(); });
    this.pickupItems = [];
    this.healthPickups.forEach(p => { p.tween?.stop(); p.sprite.destroy(); });
    this.healthPickups = [];
    this.bombPickups.forEach(p => { p.tween?.stop(); p.sprite.destroy(); });
    this.bombPickups = [];
    this.activeBombs.forEach(b => { b.tickTimer.remove(); b.sprite.destroy(); });
    this.activeBombs.clear();
    this.bombCount = 0;
    this.events.emit('bombCountChanged', 0);
    this.fireballCount = 0;
    this.events.emit('inventoryChanged', 0);
    this.activeTags.forEach(sprite => sprite.destroy());
    this.activeTags.clear();
    this.pendingTagCollects.clear();

    this.gamePhase = 'waiting';
    this.countdownActive = false;

    if (this.campusMapGraphics) {
      this.campusMapGraphics.destroy();
      this.campusMapGraphics = undefined;
    }

    this.buildingImages.forEach(img => img.destroy());
    this.buildingImages = [];

    // Redraw waiting room
    this.drawWaitingRoom();

    // Reset camera to waiting room bounds and zoom
    const waitW = 20 * TILE_SIZE;
    const waitH = 20 * TILE_SIZE;
    this.cameras.main.setBounds(0, 0, waitW, waitH);
    this.cameras.main.setZoom(this.cameras.main.width / (22 * TILE_SIZE));

    // Sync player to server-assigned waiting room spawn
    if (this.room) {
      const myState = (this.room.state as any).players.get(this.room.sessionId);
      if (myState) {
        this.player.sprite.x = myState.x;
        this.player.sprite.y = myState.y;
      }
    }

    this.player.playRespawn();
    this.hideEliminatedOverlay();

    // Re-attach camera to local player (may have been following killer)
    this.cameras.main.centerOn(this.player.sprite.x, this.player.sprite.y);
    this.cameras.main.startFollow(this.player.sprite, true, 0.1, 0.1);

    this.events.emit('revertedToWaiting');
  }

  getRemotePlayers(): Map<string, RemotePlayer> {
    return this.remotePlayers;
  }

  sendEndGame(): void {
    sendEndGame();
  }

  private showEliminatedOverlay(killerName?: string): void {
    if (this.eliminatedText) return;
    const { width, height, centerX, centerY } = this.cameras.main;

    this.eliminatedOverlay = this.add.graphics();
    this.eliminatedOverlay.fillStyle(0x000000, 0.30);
    this.eliminatedOverlay.fillRect(0, 0, width, height);
    this.eliminatedOverlay.setScrollFactor(0).setDepth(20000);

    this.eliminatedText = this.add.text(centerX, centerY - 20, 'ELIMINATED', {
      fontFamily: 'Courier New, monospace',
      fontSize: '48px',
      color: '#ff0000',
      stroke: '#000000',
      strokeThickness: 6,
      fontStyle: 'bold',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(20001);

    if (killerName) {
      this.eliminatedSubtext = this.add.text(centerX, centerY + 30, `Killed by ${killerName}`, {
        fontFamily: 'Courier New, monospace',
        fontSize: '22px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 4,
      }).setOrigin(0.5).setScrollFactor(0).setDepth(20001);
    }
  }

  private hideEliminatedOverlay(): void {
    if (this.eliminatedText) {
      this.eliminatedText.destroy();
      this.eliminatedText = undefined;
    }
    if (this.eliminatedSubtext) {
      this.eliminatedSubtext.destroy();
      this.eliminatedSubtext = undefined;
    }
    if (this.eliminatedOverlay) {
      this.eliminatedOverlay.destroy();
      this.eliminatedOverlay = undefined;
    }
  }

  private createCharacterAnimations(): void {
    const dirs = ['down', 'up', 'left', 'right'];

    // ADVENTURER — separate texture per state+direction
    const advDefs = [
      { state: 'idle',   srcState: 'idle',   fps: 8,  repeat: -1 },
      { state: 'run',    srcState: 'run',    fps: 10, repeat: -1 },
      { state: 'sprint', srcState: 'run',    fps: 14, repeat: -1 },
      { state: 'attack', srcState: 'attack', fps: 12, repeat: 0  },
    ];
    for (const def of advDefs) {
      for (const dir of dirs) {
        const key = `adventurer_${def.state}_${dir}`;
        if (this.anims.exists(key)) this.anims.remove(key);
        this.anims.create({
          key,
          frames: this.anims.generateFrameNumbers(`adventurer_${def.srcState}_${dir}`, { start: 0, end: 7 }),
          frameRate: def.fps,
          repeat: def.repeat,
        });
      }
    }

    // SCOUT + LANCER — 48×64 frames, 8 frames per sheet
    const spearDefs = [
      { state: 'idle',   srcState: 'idle',   fps: 8,  repeat: -1 },
      { state: 'run',    srcState: 'run',    fps: 10, repeat: -1 },
      { state: 'sprint', srcState: 'run',    fps: 16, repeat: -1 },
      { state: 'attack', srcState: 'attack', fps: 14, repeat: 0  },
      { state: 'dash',   srcState: 'dash',   fps: 18, repeat: 0  },
      { state: 'death',  srcState: 'death',  fps: 8,  repeat: 0  },
    ];
    for (const sk of ['scout', 'lancer']) {
      for (const def of spearDefs) {
        for (const dir of dirs) {
          const key = `${sk}_${def.state}_${dir}`;
          if (this.anims.exists(key)) this.anims.remove(key);
          this.anims.create({
            key,
            frames: this.anims.generateFrameNumbers(`${sk}_${def.srcState}_${dir}`, { start: 0, end: 7 }),
            frameRate: def.fps,
            repeat: def.repeat,
          });
        }
      }
    }

  }

  private drawMap(): void {
    const worldW = MAP_W * TILE_SIZE;
    const worldH = MAP_H * TILE_SIZE;

    const img = this.add.image(worldW / 2, worldH / 2, 'campus-map');
    img.setDisplaySize(worldW, worldH);
    img.setDepth(0);
    this.campusMapGraphics = img;
  }

  update(time: number, delta: number): void {
    if (!this.player.alive) return;

    // Block all local input during the pre-game countdown
    if (!this.countdownActive) {
      this.player.update(time, delta, {
        up:    { isDown: this.cursors.up.isDown    || this.arrowKeys.up.isDown    },
        down:  { isDown: this.cursors.down.isDown  || this.arrowKeys.down.isDown  },
        left:  { isDown: this.cursors.left.isDown  || this.arrowKeys.left.isDown  },
        right: { isDown: this.cursors.right.isDown || this.arrowKeys.right.isDown },
      });

      if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
        this.player.dash(time);
      }
      if (this.gamePhase === 'playing' && Phaser.Input.Keyboard.JustDown(this.attackKey)) {
        this.player.tryAttack(time, this.remotePlayers, sendAttack, sendSwing);
      }
      if (this.gamePhase === 'playing' && Phaser.Input.Keyboard.JustDown(this.pKey)) {
        if (this.bombCount > 0) {
          this.tryDropBomb();
        } else {
          this.tryFireProjectile();
        }
      }


      if (this.room && time - this.lastSendTime > GameScene.SEND_INTERVAL) {
        sendPosition(this.player.x, this.player.y);
        this.lastSendTime = time;
      }

      // Player-to-player collision: push local player out of remote player bodies,
      // but validate against tile collision so we never land inside a wall.
      if (this.gamePhase === 'playing') {
        const MIN_DIST = 28; // ~2× the half-size of a player sprite (14px radius each)
        const half = 15;
        this.remotePlayers.forEach(rp => {
          if (!rp.alive) return;
          const dx = this.player.sprite.x - rp.sprite.x;
          const dy = this.player.sprite.y - rp.sprite.y;
          const distSq = dx * dx + dy * dy;
          if (distSq > 0 && distSq < MIN_DIST * MIN_DIST) {
            const dist = Math.sqrt(distSq);
            const push = (MIN_DIST - dist) / dist;
            const pushX = dx * push;
            const pushY = dy * push;
            // Axis-split so we can still slide along a wall when pushed against it.
            if (this.player.canMove(this.player.sprite.x + pushX, this.player.sprite.y, half)) {
              this.player.sprite.x += pushX;
            }
            if (this.player.canMove(this.player.sprite.x, this.player.sprite.y + pushY, half)) {
              this.player.sprite.y += pushY;
            }
          }
        });
      }

      // Unstick safety net — if we somehow ended up inside a blocked tile
      // (dash at a network spike, bitmask desync, etc), snap to the nearest safe tile.
      if (this.gamePhase === 'playing' && this.player.alive && this.player.isStuckInWall()) {
        const safe = findSafeSpawn(this.player.sprite.x, this.player.sprite.y);
        this.player.sprite.x = safe.x;
        this.player.sprite.y = safe.y;
      }
    }

    // Sync state directly from server every frame — bypasses unreliable listen() callbacks
    if (this.room) {
      const st = this.room.state as any;
      if (st) {
        // Phase transition: waiting → playing
        if (st.phase === 'playing' && this.gamePhase !== 'playing') {
          this.startFullGame();
        } else if (st.phase === 'waiting' && this.gamePhase === 'playing') {
          this.revertToWaitingRoom();
        }
        // Remote player positions
        if (st.players) {
          st.players.forEach((ps: any, sid: string) => {
            if (sid === this.room!.sessionId) return;
            const rp = this.remotePlayers.get(sid);
            if (rp) rp.updatePosition(ps.x, ps.y);
          });
        }
      }
    }

    // Update local projectiles
    if (this.activeProjectiles.length > 0) {
      this.updateProjectiles(delta);
    }

    // Update remote projectiles independently
    if (this.remoteProjectiles.length > 0) {
      this.updateRemoteProjectiles(delta);
    }

    // Pickup collision
    if (this.gamePhase === 'playing') {
      this.checkPickupCollisions();
    }

    // Kill Confirmed tag collection
    if (this.gameMode === 'killConfirmed' && this.player?.alive && this.gamePhase === 'playing') {
      for (const [tagId, sprite] of this.activeTags) {
        if (this.pendingTagCollects.has(tagId)) continue;
        const dx = this.player.sprite.x - sprite.x;
        const dy = this.player.sprite.y - sprite.y;
        if (Math.sqrt(dx * dx + dy * dy) < 24) {
          this.pendingTagCollects.add(tagId);
          sendTagCollect(tagId);
          break;
        }
      }
    }

    // Always interpolate remote players (visible during countdown)
    this.remotePlayers.forEach(rp => rp.interpolate(delta));

    // Y-sort: sprites lower on screen render in front of sprites higher up
    this.player.sprite.setDepth(this.player.y);
    this.remotePlayers.forEach(rp => rp.sprite.setDepth(rp.sprite.y));
  }

  private spawnPickupItems(): void {
    this.pickupItems.forEach(p => { p.tween?.stop(); p.sprite.destroy(); });
    this.pickupItems = [];
    this.healthPickups.forEach(p => { p.tween?.stop(); p.sprite.destroy(); });
    this.healthPickups = [];
    this.bombPickups.forEach(p => { p.tween?.stop(); p.sprite.destroy(); });
    this.bombPickups = [];

    const density = Number((this.room?.state as any)?.density) || 1;
    for (let i = 0; i < 10 * density; i++) {
      this.spawnPickupAt(this.randomWalkableTile());
    }
    for (let i = 0; i < 6 * density; i++) {
      this.spawnHealthPickupAt(this.randomWalkableTile());
    }
    for (let i = 0; i < 5 * density; i++) {
      this.spawnBombPickupAt(this.randomWalkableTile());
    }
  }

  private randomWalkableTile(): { wx: number; wy: number } {
    if (this.validPickupTiles.length > 0 && this.pickupRng) {
      // Reject positions that are too close to any existing active pickup so
      // items spread out across the map instead of clustering.
      const MIN_DIST = 320; // px — ~20 tiles of separation
      const MIN_DIST_SQ = MIN_DIST * MIN_DIST;
      for (let attempt = 0; attempt < 40; attempt++) {
        const idx = Math.floor(this.pickupRng() * this.validPickupTiles.length);
        const candidate = this.validPickupTiles[idx];
        let tooClose = false;
        for (const p of this.pickupItems) {
          if (!p.active) continue;
          const dx = p.worldX - candidate.wx;
          const dy = p.worldY - candidate.wy;
          if (dx * dx + dy * dy < MIN_DIST_SQ) { tooClose = true; break; }
        }
        if (!tooClose) {
          for (const p of this.healthPickups) {
            if (!p.active) continue;
            const dx = p.worldX - candidate.wx;
            const dy = p.worldY - candidate.wy;
            if (dx * dx + dy * dy < MIN_DIST_SQ) { tooClose = true; break; }
          }
        }
        if (!tooClose) {
          for (const p of this.bombPickups) {
            if (!p.active) continue;
            const dx = p.worldX - candidate.wx;
            const dy = p.worldY - candidate.wy;
            if (dx * dx + dy * dy < MIN_DIST_SQ) { tooClose = true; break; }
          }
        }
        if (!tooClose) return candidate;
      }
      // Give up after 40 attempts — return the last candidate
      const idx = Math.floor(this.pickupRng() * this.validPickupTiles.length);
      return this.validPickupTiles[idx];
    }
    // Fallback: rough center of map
    return { wx: (MAP_W / 2) * TILE_SIZE, wy: (MAP_H / 2) * TILE_SIZE };
  }

  private buildValidPickupTiles(): void {
    const mask = getBitmask();
    if (!mask) return;
    const clearance = 3;
    const valid: { wx: number; wy: number }[] = [];
    for (let ty = clearance; ty < MAP_H - clearance; ty++) {
      for (let tx = clearance; tx < MAP_W - clearance; tx++) {
        if (!mask[ty]?.[tx]) continue;
        let ok = true;
        outer: for (let dy = -clearance; dy <= clearance; dy++) {
          for (let dx = -clearance; dx <= clearance; dx++) {
            if (!mask[ty + dy]?.[tx + dx]) { ok = false; break outer; }
          }
        }
        if (ok) valid.push({ wx: tx * TILE_SIZE + TILE_SIZE / 2, wy: ty * TILE_SIZE + TILE_SIZE / 2 });
      }
    }
    this.validPickupTiles = valid;
  }

  private static makeSeededRng(seed: number): () => number {
    let s = seed | 0;
    return () => {
      s ^= s << 13; s ^= s >> 17; s ^= s << 5;
      return (s >>> 0) / 4294967296;
    };
  }

  private spawnPickupAt(pos: { wx: number; wy: number }): PickupItem {
    const sprite = this.add.image(pos.wx, pos.wy, 'fireball-pickup');
    sprite.setDisplaySize(28, 28).setDepth(8);

    const tween = this.tweens.add({
      targets: sprite,
      y: pos.wy - 5,
      duration: 900,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
      delay: Math.random() * 900, // stagger so they don't all bounce in sync
    });

    const item: PickupItem = { sprite, active: true, worldX: pos.wx, worldY: pos.wy, tween };
    this.pickupItems.push(item);
    return item;
  }

  private spawnHealthPickupAt(pos: { wx: number; wy: number }): void {
    const sprite = this.add.image(pos.wx, pos.wy, 'health-pickup');
    sprite.setDisplaySize(84, 84).setDepth(8);

    const tween = this.tweens.add({
      targets: sprite,
      y: pos.wy - 5,
      duration: 900,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
      delay: Math.random() * 900,
    });

    this.healthPickups.push({ sprite, active: true, worldX: pos.wx, worldY: pos.wy, tween });
  }

  private spawnBombPickupAt(pos: { wx: number; wy: number }): void {
    const sprite = this.add.image(pos.wx, pos.wy, 'bomb-pickup');
    sprite.setDisplaySize(32, 32).setDepth(8);

    const tween = this.tweens.add({
      targets: sprite,
      y: pos.wy - 5,
      duration: 900,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
      delay: Math.random() * 900,
    });

    this.bombPickups.push({ sprite, active: true, worldX: pos.wx, worldY: pos.wy, tween });
  }

  private tryFireProjectile(): void {
    if (this.fireballCount <= 0) return;
    const now = this.time.now;
    if (now - this.lastFireballTime < this.FIREBALL_COOLDOWN) return;
    this.lastFireballTime = now;
    this.fireballCount--;
    this.events.emit('inventoryChanged', this.fireballCount);

    const dirX = this.player.facingX;
    const dirY = this.player.facingY;
    const len = Math.sqrt(dirX * dirX + dirY * dirY) || 1;
    const nx = dirX / len;
    const ny = dirY / len;

    const angle = Math.atan2(ny, nx) * (180 / Math.PI);
    const sprite = this.add.sprite(this.player.x, this.player.y, 'fireball');
    sprite.setDisplaySize(104, 52).setDepth(12).setAngle(angle);
    sprite.play('fireball_fly');

    sendFireballLaunched(this.player.x, this.player.y, nx, ny);

    this.activeProjectiles.push({
      sprite, dirX: nx, dirY: ny,
      traveled: 0, flickering: false, flickerTimer: 0,
    });
  }

  private tryDropBomb(): void {
    if (this.bombCount <= 0) return;
    this.bombCount--;
    this.events.emit('bombCountChanged', this.bombCount);
    // Drop at the player's feet — server is authoritative for the fuse + damage
    sendBombDropped(this.player.x, this.player.y);
  }

  private updateProjectiles(delta: number): void {
    const step = this.FIREBALL_SPEED * (delta / 1000);
    for (let i = this.activeProjectiles.length - 1; i >= 0; i--) {
      const p = this.activeProjectiles[i];
      p.sprite.x += p.dirX * step;
      p.sprite.y += p.dirY * step;
      p.traveled += step;

      if (p.traveled >= this.FIREBALL_FLICKER_PX) {
        p.flickering = true;
        p.flickerTimer += delta;
        p.sprite.setVisible(Math.floor(p.flickerTimer / 80) % 2 === 0);
      }

      if (p.traveled >= this.FIREBALL_RANGE_PX) {
        p.sprite.destroy();
        this.activeProjectiles.splice(i, 1);
        continue;
      }

      let hit = false;
      this.remotePlayers.forEach((rp, sessionId) => {
        if (hit) return;
        if (!rp.alive) return;
        const dist = Phaser.Math.Distance.Between(
          p.sprite.x, p.sprite.y, rp.sprite.x, rp.sprite.y,
        );
        if (dist < 40) {
          sendFireball(sessionId, p.dirX, p.dirY);
          p.sprite.destroy();
          this.activeProjectiles.splice(i, 1);
          hit = true;
        }
      });
    }
  }

  private updateRemoteProjectiles(delta: number): void {
    const step = this.FIREBALL_SPEED * (delta / 1000);
    for (let i = this.remoteProjectiles.length - 1; i >= 0; i--) {
      const p = this.remoteProjectiles[i];
      p.sprite.x += p.dirX * step;
      p.sprite.y += p.dirY * step;
      p.traveled += step;

      if (p.traveled >= this.FIREBALL_FLICKER_PX) {
        p.flickering = true;
        p.flickerTimer += delta;
        p.sprite.setVisible(Math.floor(p.flickerTimer / 80) % 2 === 0);
      }

      if (p.traveled >= this.FIREBALL_RANGE_PX) {
        p.sprite.destroy();
        this.remoteProjectiles.splice(i, 1);
      }
    }
  }

  private checkPickupCollisions(): void {
    if (this.fireballCount < this.MAX_FIREBALLS) {
      for (let i = 0; i < this.pickupItems.length; i++) {
        const item = this.pickupItems[i];
        if (!item.active) continue;
        const dist = Phaser.Math.Distance.Between(
          this.player.x, this.player.y, item.worldX, item.worldY,
        );
        if (dist < 18) {
          item.active = false; // prevent re-sending while awaiting server echo
          sendPickupCollect('fireball', i);
          break;
        }
      }
    }

    for (let i = 0; i < this.healthPickups.length; i++) {
      const item = this.healthPickups[i];
      if (!item.active) continue;
      if (this.player.hp >= this.player.maxHp) continue;
      const dist = Phaser.Math.Distance.Between(
        this.player.x, this.player.y, item.worldX, item.worldY,
      );
      if (dist < 18) {
        item.active = false;
        sendPickupCollect('health', i);
        break;
      }
    }

    if (this.bombCount < this.MAX_BOMBS) {
      for (let i = 0; i < this.bombPickups.length; i++) {
        const item = this.bombPickups[i];
        if (!item.active) continue;
        const dist = Phaser.Math.Distance.Between(
          this.player.x, this.player.y, item.worldX, item.worldY,
        );
        if (dist < 18) {
          item.active = false;
          sendPickupCollect('bomb', i);
          break;
        }
      }
    }
  }

  private showFloatingDamage(worldX: number, worldY: number, damage: number, color: string): void {
    const text = this.add.text(worldX, worldY - 10, `-${damage}`, {
      fontFamily: 'monospace',
      fontSize: '28px',
      color,
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5).setDepth(10000);

    this.tweens.add({
      targets: text,
      y: worldY - 50,
      alpha: 0,
      duration: 2200,
      ease: 'Power2',
      onComplete: () => text.destroy(),
    });
  }
}
