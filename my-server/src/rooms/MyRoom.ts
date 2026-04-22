import { Room, Client, CloseCode } from "colyseus";
import { MyRoomState, PlayerState } from "./schema/MyRoomState.js";
import prisma from "../db.js";

// Generate a short memorable room code like "FIRE" or "WOLF"
const WORDS = [
  "FIRE","WOLF","BEAR","HAWK","LION","TIGER","STORM","BLADE",
  "IRON","GOLD","MOON","STAR","ROCK","BOLT","FROST","RAGE",
  "CROW","VIPER","DUKE","ACE","NOVA","DUSK","PIKE","ZEAL",
];
function makeRoomCode(): string {
  return WORDS[Math.floor(Math.random() * WORDS.length)] +
         Math.floor(Math.random() * 100).toString().padStart(2, '0');
}

const TILE_SIZE = 16;
const MAP_W = 150;
const MAP_H = 100;
const WORLD_W = MAP_W * TILE_SIZE;
const WORLD_H = MAP_H * TILE_SIZE;

// Dedicated spawn points (world coordinates)
const SPAWN_POINTS = [
  { x: 344,  y: 616  }, // tx:21, ty:38
  { x: 1192, y: 792  }, // tx:74, ty:49
  { x: 2184, y: 504  }, // tx:136, ty:31
  { x: 1288, y: 1288 }, // tx:80, ty:80
  { x: 616,  y: 1224 }, // tx:38, ty:76
];

function gameSpawnPoint(): { x: number; y: number } {
  return SPAWN_POINTS[Math.floor(Math.random() * SPAWN_POINTS.length)];
}

/**
 * Generate spread-out spawn points for game start using a jittered grid.
 * Divides the playable map into a grid of cells and picks one random point
 * per cell, guaranteeing players start far from each other.
 */
function gameStartSpawnPoints(count: number): { x: number; y: number }[] {
  // Shuffle the dedicated spawn points and cycle through them if count exceeds list size
  const shuffled = [...SPAWN_POINTS].sort(() => Math.random() - 0.5);
  const result: { x: number; y: number }[] = [];
  for (let i = 0; i < count; i++) {
    result.push(shuffled[i % shuffled.length]);
  }
  return result;
}

const CLASS_STATS: Record<string, { maxHp: number; attackDamage: number }> = {
  adventurer: { maxHp: 100, attackDamage: 22 },
  scout:      { maxHp: 75,  attackDamage: 15 },
  lancer:     { maxHp: 125, attackDamage: 30 },
};
const DEFAULT_STATS = CLASS_STATS.adventurer;

function getClassStats(spriteKey: string) {
  return CLASS_STATS[spriteKey] ?? DEFAULT_STATS;
}

const ATTACK_RANGE = 54;
const ATTACK_RATE = 450;
const HIT_COOLDOWN = 200; // how often a player can be hit
const RESPAWN_DELAY = 5000;
const FIREBALL_DAMAGE = 40;
const FIREBALL_RANGE  = 600; // generous buffer for network latency — client validates visual hit
const BOMB_DAMAGE = 50;
const BOMB_RADIUS = 5 * TILE_SIZE; // 5-tile AoE radius = 80px
const BOMB_FUSE_MS = 2000;

const HEALTH_PACK_HEAL = 20;

const TAG_EXPIRE_TIME = 15000;  // 15 seconds
const KC_SCORE_LIMIT = 20;
const TAG_COLLECT_RANGE = 64;

const PLAYER_COLORS = [0x3498db, 0xe74c3c, 0x2ecc71, 0xf39c12];

const VALID_MAX_PLAYERS = [5, 10, 20, 30];
const VALID_DURATIONS = [120, 180, 300]; // seconds
const DEFAULT_DURATION = 300;
const VALID_DENSITIES = [1, 2, 4]; // few, normal, many
const DEFAULT_DENSITY = 1;
const WAITING_TILE_SIZE = 16;

function waitingSpawn(): { x: number; y: number } {
  const tx = 2 + Math.floor(Math.random() * 16); // tiles 2..17 inside 20×20 room
  const ty = 2 + Math.floor(Math.random() * 16);
  return { x: tx * WAITING_TILE_SIZE + 8, y: ty * WAITING_TILE_SIZE + 8 };
}

export class MyRoom extends Room {
  state = new MyRoomState();
  private playerIndex = 0;
  private lastAttackTime = new Map<string, number>();
  private lastHitTime = new Map<string, number>();
  private lastSwingTime = new Map<string, number>();
  private hostId = '';
  private joinOrder: string[] = []; // tracks join order for host migration
  private autoEndTimer?: ReturnType<typeof this.clock.setTimeout>;
  private tickInterval?: ReturnType<typeof this.clock.setInterval>;
  private emptyRoomTimer?: ReturnType<typeof this.clock.setTimeout>;
  // Maps sessionId → clerkId (not synced to clients, server-only)
  private playerClerkIds = new Map<string, string>();
  private gameMode = 'ffa';
  private tagCounter = 0;
  private activeTags = new Map<number, { id: number; x: number; y: number; killerId: string; victimId: string; timer: any }>();
  private bombCounter = 0;

  private scheduleEmptyDispose(): void {
    if (this.emptyRoomTimer) { this.emptyRoomTimer.clear(); this.emptyRoomTimer = undefined; }
    this.emptyRoomTimer = this.clock.setTimeout(() => {
      if (this.state.players.size === 0) {
        console.log(`Room ${this.roomId}: empty for 5 minutes, disposing.`);
        this.disconnect();
      }
    }, 5 * 60 * 1000);
  }

  private transferHost(): void {
    const next = this.joinOrder[0];
    if (next) {
      this.hostId = next;
      this.state.hostSessionId = next;
      console.log(`Host transferred to ${next}`);
    }
  }

  private updateMetadata(): void {
    this.setMetadata({
      gameMode: this.gameMode,
      roomCode: this.state.roomCode,
      maxPlayers: this.state.maxPlayers,
      isPrivate: false,
      phase: this.state.phase,
      playerCount: this.state.players.size,
      timeRemaining: this.state.timeRemaining,
      gameDuration: this.state.gameDuration,
      density: this.state.density,
    });
  }

  private dropTag(x: number, y: number, killerId: string, victimId: string): void {
    const tagId = ++this.tagCounter;
    const timer = this.clock.setTimeout(() => {
      this.activeTags.delete(tagId);
      this.broadcast('tagExpired', { tagId });
    }, TAG_EXPIRE_TIME);
    this.activeTags.set(tagId, { id: tagId, x, y, killerId, victimId, timer });
    this.broadcast('tagDropped', { tagId, x, y, killerId, victimId });
  }

  messages = {
    move: (client: Client, message: { x: number; y: number }) => {
      const player = this.state.players.get(client.sessionId);
      if (!player || !player.alive) return;

      const x = Number(message.x);
      const y = Number(message.y);
      if (isNaN(x) || isNaN(y)) return;

      // Clamp to world bounds with border padding (top=15 tiles, others=5 tiles)
      const SIDE_PX   = 5  * TILE_SIZE;
      const TOP_PX    = 15 * TILE_SIZE;
      const BOTTOM_PX = 5  * TILE_SIZE;
      player.x = Math.max(SIDE_PX,  Math.min(WORLD_W - SIDE_PX,   x));
      player.y = Math.max(TOP_PX,   Math.min(WORLD_H - BOTTOM_PX, y));
    },

    attack: (client: Client, message: { targetId: string; dirX?: number; dirY?: number }) => {
      if (this.state.phase !== "playing") return;
      const attacker = this.state.players.get(client.sessionId);
      if (!attacker || !attacker.alive) return;

      const targetId = message.targetId;
      const target = this.state.players.get(targetId);
      if (!target || !target.alive) return;

      // Rate limit attacker
      const now = Date.now();
      const last = this.lastAttackTime.get(client.sessionId) ?? 0;
      if (now - last < ATTACK_RATE) return;

      // Hit cooldown — target can only be hit once every HIT_COOLDOWN ms
      const lastHit = this.lastHitTime.get(targetId) ?? 0;
      if (now - lastHit < HIT_COOLDOWN) return;

      // Distance check
      const dx = target.x - attacker.x;
      const dy = target.y - attacker.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > ATTACK_RANGE) return;

      // Directional check — target must be within ~150° cone in front of attacker
      const dirX = typeof message.dirX === 'number' ? message.dirX : 0;
      const dirY = typeof message.dirY === 'number' ? message.dirY : 1;
      const dirLen = Math.sqrt(dirX * dirX + dirY * dirY);
      if (dist > 0 && dirLen > 0) {
        const dot = (dx / dist) * (dirX / dirLen) + (dy / dist) * (dirY / dirLen);
        if (dot < 0.25) return; // outside ~150° cone (cos 75° ≈ 0.25)
      }

      this.lastAttackTime.set(client.sessionId, now);
      this.lastHitTime.set(targetId, now);

      const meleeDmg = getClassStats(attacker.spriteKey).attackDamage;
      target.hp -= meleeDmg;
      this.broadcast('damageDealt', { x: target.x, y: target.y, damage: meleeDmg, type: 'melee' });
      if (target.hp <= 0) {
        target.hp = 0;
        target.alive = false;
        target.deaths += 1;
        attacker.kills += 1;
        attacker.hp = attacker.maxHp;

        // Notify all clients who killed whom so they can follow the killer camera + kill feed
        this.broadcast('killed', {
          victimId: targetId, killerId: client.sessionId,
          victimName: target.name, killerName: attacker.name, weapon: 'melee',
        });

        if (this.gameMode === 'killConfirmed') {
          this.dropTag(target.x, target.y, client.sessionId, targetId);
        }

        this.clock.setTimeout(() => {
          const spawn = gameSpawnPoint();
          target.x = spawn.x;
          target.y = spawn.y;
          target.hp = target.maxHp;
          target.alive = true;
        }, RESPAWN_DELAY);
      }
    },

    swing: (client: Client, message: { dirX?: number; dirY?: number }) => {
      if (this.state.phase !== "playing") return;
      const attacker = this.state.players.get(client.sessionId);
      if (!attacker || !attacker.alive) return;

      const now = Date.now();
      const last = this.lastSwingTime.get(client.sessionId) ?? 0;
      if (now - last < ATTACK_RATE) return;
      this.lastSwingTime.set(client.sessionId, now);

      const dirX = typeof message.dirX === 'number' ? message.dirX : 0;
      const dirY = typeof message.dirY === 'number' ? message.dirY : 1;

      this.broadcast('attackEffect', {
        attackerId: client.sessionId,
        targetId: '',
        x: attacker.x,
        y: attacker.y,
        dirX,
        dirY,
      });
    },

    fireballLaunched: (client: Client, message: { x: number; y: number; dirX: number; dirY: number }) => {
      if (this.state.phase !== 'playing') return;
      const shooter = this.state.players.get(client.sessionId);
      if (!shooter || !shooter.alive) return;
      this.broadcast('fireballEffect', {
        shooterId: client.sessionId,
        x: message.x,
        y: message.y,
        dirX: message.dirX,
        dirY: message.dirY,
      }, { except: client });
    },

    fireball: (client: Client, message: { targetId: string; dirX?: number; dirY?: number }) => {
      if (this.state.phase !== 'playing') return;
      const attacker = this.state.players.get(client.sessionId);
      if (!attacker || !attacker.alive) return;
      const target = this.state.players.get(message.targetId);
      if (!target || !target.alive) return;

      const dx = target.x - attacker.x;
      const dy = target.y - attacker.y;
      if (Math.sqrt(dx * dx + dy * dy) > FIREBALL_RANGE) return;

      target.hp -= FIREBALL_DAMAGE;
      this.broadcast('damageDealt', { x: target.x, y: target.y, damage: FIREBALL_DAMAGE, type: 'fireball' });
      if (target.hp <= 0) {
        target.hp = 0;
        target.alive = false;
        target.deaths += 1;
        attacker.kills += 1;
        attacker.hp = attacker.maxHp;
        this.broadcast('killed', {
          victimId: message.targetId, killerId: client.sessionId,
          victimName: target.name, killerName: attacker.name, weapon: 'fireball',
        });

        if (this.gameMode === 'killConfirmed') {
          this.dropTag(target.x, target.y, client.sessionId, message.targetId);
        }

        this.clock.setTimeout(() => {
          const spawn = gameSpawnPoint();
          target.x = spawn.x; target.y = spawn.y;
          target.hp = target.maxHp; target.alive = true;
        }, RESPAWN_DELAY);
      }
    },

    pickupCollect: (client: Client, message: { type: string; idx: number }) => {
      if (this.state.phase !== 'playing') return;
      const type = String(message.type);
      const idx  = Number(message.idx);
      if (type !== 'fireball' && type !== 'health' && type !== 'bomb') return;
      if (type === 'health') {
        const player = this.state.players.get(client.sessionId);
        if (player) player.hp = Math.min(player.hp + HEALTH_PACK_HEAL, player.maxHp);
      }
      // Broadcast collection to all clients (including sender)
      this.broadcast('pickupCollected', { type, idx, collectorId: client.sessionId });
      // After respawn delay, ask the host to provide a new position
      this.clock.setTimeout(() => {
        const hostClient = this.clients.find(c => c.sessionId === this.hostId);
        if (hostClient) {
          hostClient.send('pickupNeedsRespawn', { type, idx });
        }
      }, 20000);
    },

    pickupRespawnPos: (client: Client, message: { type: string; idx: number; wx: number; wy: number }) => {
      // Only the host sends respawn positions
      if (client.sessionId !== this.hostId) return;
      const type = String(message.type);
      const idx  = Number(message.idx);
      const wx   = Number(message.wx);
      const wy   = Number(message.wy);
      if (type !== 'fireball' && type !== 'health' && type !== 'bomb') return;
      this.broadcast('pickupRespawned', { type, idx, wx, wy });
    },

    bombDropped: (client: Client, message: { x: number; y: number }) => {
      if (this.state.phase !== 'playing') return;
      const owner = this.state.players.get(client.sessionId);
      if (!owner || !owner.alive) return;
      const x = Number(message.x);
      const y = Number(message.y);
      if (isNaN(x) || isNaN(y)) return;

      const bombId = ++this.bombCounter;
      const ownerId = client.sessionId;
      // Broadcast placement so every client spawns a ticking bomb visual
      this.broadcast('bombPlaced', { bombId, x, y, ownerId });

      // Detonate after fuse
      this.clock.setTimeout(() => {
        if (this.state.phase !== 'playing') return;
        const victims: { id: string; name: string; damage: number; dead: boolean; x: number; y: number }[] = [];
        this.state.players.forEach((p, id) => {
          if (!p.alive) return;
          const dx = p.x - x;
          const dy = p.y - y;
          if (Math.sqrt(dx * dx + dy * dy) > BOMB_RADIUS) return;

          p.hp -= BOMB_DAMAGE;
          let dead = false;
          if (p.hp <= 0) {
            p.hp = 0;
            p.alive = false;
            p.deaths += 1;
            dead = true;
            if (id !== ownerId) {
              const killer = this.state.players.get(ownerId);
              if (killer && killer.alive) {
                killer.kills += 1;
                killer.hp = killer.maxHp;
              }
            }
          }
          victims.push({ id, name: p.name, damage: BOMB_DAMAGE, dead, x: p.x, y: p.y });
        });

        this.broadcast('bombExploded', { bombId, x, y, victims });

        // Emit kill/tag events + respawn timers for anyone who died
        victims.forEach(v => {
          if (!v.dead) return;
          const victim = this.state.players.get(v.id);
          if (!victim) return;
          const killerId = v.id === ownerId ? '' : ownerId;
          const killer = killerId ? this.state.players.get(killerId) : undefined;
          this.broadcast('killed', {
            victimId: v.id,
            killerId,
            victimName: v.name,
            killerName: killer?.name ?? '',
            weapon: 'bomb',
          });
          if (this.gameMode === 'killConfirmed' && killerId) {
            this.dropTag(victim.x, victim.y, killerId, v.id);
          }
          this.clock.setTimeout(() => {
            const spawn = gameSpawnPoint();
            victim.x = spawn.x;
            victim.y = spawn.y;
            victim.hp = victim.maxHp;
            victim.alive = true;
          }, RESPAWN_DELAY);
        });
      }, BOMB_FUSE_MS);
    },

    collectTag: (client: Client, message: { tagId: number }) => {
      if (this.state.phase !== 'playing') return;
      if (this.gameMode !== 'killConfirmed') return;
      const collector = this.state.players.get(client.sessionId);
      if (!collector || !collector.alive) return;

      const tagId = Number(message.tagId);
      const tag = this.activeTags.get(tagId);
      if (!tag) return;

      // Distance check
      const dx = collector.x - tag.x;
      const dy = collector.y - tag.y;
      if (Math.sqrt(dx * dx + dy * dy) > TAG_COLLECT_RANGE) return;

      // Clear expiry timer and remove tag
      tag.timer.clear();
      this.activeTags.delete(tagId);

      // Any player can collect for +1 confirmed kill
      collector.confirmedKills += 1;
      this.broadcast('tagCollected', { tagId, collectorId: client.sessionId, collectorName: collector.name });

      // Check score limit
      if (collector.confirmedKills >= KC_SCORE_LIMIT) {
        if (this.autoEndTimer) { this.autoEndTimer.clear(); this.autoEndTimer = undefined; }
        this.triggerEndGame();
      }
    },

    endGame: (client: Client) => {
      if (client.sessionId !== this.hostId) return;
      if (this.state.phase !== "playing") return;
      if (this.autoEndTimer) { this.autoEndTimer.clear(); this.autoEndTimer = undefined; }
      this.triggerEndGame();
    },

    startGame: (client: Client) => {
      if (client.sessionId !== this.hostId) return;
      if (this.state.phase !== "waiting") return;
      this.state.pickupSeed = (Math.random() * 0xFFFFFF | 0) + 1;
      this.state.phase = "playing";
      this.lock(); // block new joins
      const GAME_DURATION_SECS = this.state.gameDuration;
      const GAME_DURATION = GAME_DURATION_SECS * 1000 + 4000; // +4s countdown buffer
      this.state.gameEndTime = Date.now() + GAME_DURATION;
      this.state.timeRemaining = GAME_DURATION_SECS;
      this.autoEndTimer = this.clock.setTimeout(() => this.triggerEndGame(true), GAME_DURATION);
      // Delay tick by 4s to match client countdown so HUD shows 5:00 on reveal
      this.clock.setTimeout(() => {
        this.tickInterval = this.clock.setInterval(() => {
          if (this.state.timeRemaining > 0) {
            this.state.timeRemaining--;
            if (this.state.timeRemaining % 5 === 0) this.updateMetadata();
          }
        }, 1000);
      }, 4000);
      // Reset KC state
      this.state.players.forEach((player) => {
        player.confirmedKills = 0;
      });
      this.activeTags.forEach(tag => tag.timer.clear());
      this.activeTags.clear();
      this.tagCounter = 0;

      const spawnPoints = gameStartSpawnPoints(this.state.players.size);
      let spawnIdx = 0;
      this.state.players.forEach((player) => {
        const spawn = spawnPoints[spawnIdx++] ?? gameSpawnPoint();
        player.x = spawn.x;
        player.y = spawn.y;
        player.hp = player.maxHp;
        player.alive = true;
      });
      console.log(`Room ${this.roomId}: game started with ${this.state.players.size} players`);
      this.updateMetadata();
    },
  }

  private async triggerEndGame(timeLimitReached = false): Promise<void> {
    if (this.tickInterval) { this.tickInterval.clear(); this.tickInterval = undefined; }
    this.state.timeLimitReached = timeLimitReached;
    this.state.gameOver = true;
    this.state.gameEndTime = 0;
    this.state.timeRemaining = 0;

    // Clear all active tags
    this.activeTags.forEach(tag => tag.timer.clear());
    this.activeTags.clear();

    // Persist stats for every player that has a clerkId
    let topKills = -1;
    if (this.gameMode === 'killConfirmed') {
      this.state.players.forEach((p) => { if (p.confirmedKills > topKills) topKills = p.confirmedKills; });
    } else {
      this.state.players.forEach((p) => { if (p.kills > topKills) topKills = p.kills; });
    }

    const saves: Promise<void>[] = [];
    this.state.players.forEach((player, sessionId) => {
      const clerkId = this.playerClerkIds.get(sessionId);
      if (!clerkId) return;
      const won = this.gameMode === 'killConfirmed'
        ? (player.confirmedKills === topKills && topKills >= 0)
        : (player.kills === topKills && topKills >= 0);
      const isKC     = this.gameMode === 'killConfirmed';
      const kills    = player.kills;
      const confirms = player.confirmedKills;
      const deaths   = player.deaths;
      const winInc   = won ? 1 : 0;

      const modeCreate = isKC
        ? { kcConfirms: confirms, kcKills: kills, kcDeaths: deaths, kcGames: 1, kcWins: winInc }
        : { ffaKills: kills, ffaDeaths: deaths, ffaGames: 1, ffaWins: winInc };

      const modeUpdate = isKC
        ? {
            kcConfirms: { increment: confirms },
            kcKills:    { increment: kills },
            kcDeaths:   { increment: deaths },
            kcGames:    { increment: 1 },
            kcWins:     { increment: winInc },
          }
        : {
            ffaKills:  { increment: kills },
            ffaDeaths: { increment: deaths },
            ffaGames:  { increment: 1 },
            ffaWins:   { increment: winInc },
          };

      saves.push(
        (async () => {
          try {
            // Ensure the user row exists first (FK requirement)
            await prisma.user.upsert({
              where: { clerkId },
              create: { clerkId, username: player.name },
              update: { username: player.name },
            });
            // Atomically increment stats — no read needed
            await prisma.playerStats.upsert({
              where: { clerkId },
              create: {
                clerkId,
                totalKills: kills,
                totalDeaths: deaths,
                totalGames: 1,
                totalWins: winInc,
                ...modeCreate,
              },
              update: {
                totalKills:  { increment: kills },
                totalDeaths: { increment: deaths },
                totalGames:  { increment: 1 },
                totalWins:   { increment: winInc },
                ...modeUpdate,
              },
            });
            console.log(`[stats] saved for ${player.name} — mode:${isKC ? 'KC' : 'FFA'} K:${kills} C:${confirms} D:${deaths} W:${won}`);
          } catch (err) {
            console.error(`[stats] failed for ${player.name}:`, err);
          }
        })()
      );
    });
    await Promise.all(saves);

    // After 5s, reset room to waiting instead of disconnecting
    this.clock.setTimeout(() => {
      this.state.gameOver = false;
      this.state.timeLimitReached = false;
      this.state.phase = "waiting";
      this.unlock(); // allow new players to join again
      this.state.players.forEach((player) => {
        const spawn = waitingSpawn();
        player.x = spawn.x;
        player.y = spawn.y;
        player.hp = player.maxHp;
        player.alive = true;
        player.kills = 0;
        player.deaths = 0;
        player.confirmedKills = 0;
      });
      console.log(`Room ${this.roomId}: reset to waiting room`);
      this.updateMetadata();
    }, 35000);
  }

  async onCreate (options: any) {
    this.roomId = makeRoomCode();       // sets the actual room ID used by joinById
    this.state.roomCode = this.roomId;  // synced to clients for display
    const requestedMax = Number(options?.maxPlayers);
    const validated = VALID_MAX_PLAYERS.includes(requestedMax) ? requestedMax : 10;
    this.maxClients = validated;
    this.state.maxPlayers = validated;

    const requestedDuration = Number(options?.duration);
    this.state.gameDuration = VALID_DURATIONS.includes(requestedDuration) ? requestedDuration : DEFAULT_DURATION;

    const requestedDensity = Number(options?.density);
    this.state.density = VALID_DENSITIES.includes(requestedDensity) ? requestedDensity : DEFAULT_DENSITY;

    // Game mode
    this.gameMode = options?.gameMode === 'killConfirmed' ? 'killConfirmed' : 'ffa';
    this.state.gameMode = this.gameMode;
    if (this.gameMode === 'killConfirmed') {
      this.state.scoreLimit = KC_SCORE_LIMIT;
    }

    await this.setMetadata({
      gameMode: this.gameMode,
      roomCode: this.roomId,
      maxPlayers: validated,
      isPrivate: options?.isPrivate === true,
      phase: 'waiting',
      playerCount: 0,
      timeRemaining: 0,
    });

    console.log(`Room created! ID: ${this.roomId}`, options?.isPrivate ? "(private)" : "(public)", `maxPlayers=${validated}`, `gameMode=${this.gameMode}`);
  }

  onJoin (client: Client, options: any) {
    // Cancel empty-room timer — someone joined
    if (this.emptyRoomTimer) { this.emptyRoomTimer.clear(); this.emptyRoomTimer = undefined; }

    this.joinOrder.push(client.sessionId);
    if (!this.hostId) {
      this.hostId = client.sessionId;
      this.state.hostSessionId = client.sessionId;
    }

    // Store clerkId for stats saving on game end (not broadcast to other clients)
    if (typeof options?.clerkId === "string" && options.clerkId) {
      this.playerClerkIds.set(client.sessionId, options.clerkId);
    }

    const spawn = this.state.phase === "waiting"
      ? waitingSpawn()
      : gameSpawnPoint();
    const color = PLAYER_COLORS[this.playerIndex % PLAYER_COLORS.length];
    this.playerIndex++;

    const spriteKey = (typeof options?.spriteKey === "string" && options.spriteKey.trim())
      ? options.spriteKey.trim()
      : "adventurer";
    const stats = getClassStats(spriteKey);

    const player = new PlayerState();
    player.x = spawn.x;
    player.y = spawn.y;
    player.color = color;
    player.hp = stats.maxHp;
    player.maxHp = stats.maxHp;
    player.alive = true;
    player.name = (typeof options?.name === "string" && options.name.trim())
      ? options.name.trim().slice(0, 16)
      : `Player${this.playerIndex}`;
    player.spriteKey = spriteKey;

    this.state.players.set(client.sessionId, player);
    console.log(client.sessionId, `joined as "${player.name}"! Players:`, this.state.players.size);
    this.updateMetadata();
  }

  async onDrop (client: Client, code: CloseCode) {
    console.log(client.sessionId, "dropped! Allowing reconnection for 30s...");
    try {
      await this.allowReconnection(client, 30);
      console.log(client.sessionId, "reconnected!");
    } catch {
      console.log(client.sessionId, "reconnection timed out, removing player.");
      const wasHost = client.sessionId === this.hostId;
      const idx = this.joinOrder.indexOf(client.sessionId);
      if (idx !== -1) this.joinOrder.splice(idx, 1);
      this.state.players.delete(client.sessionId);
      if (wasHost) this.transferHost();
      console.log("Players remaining:", this.state.players.size);
      if (this.state.players.size === 0) this.scheduleEmptyDispose();
    }
  }

  onLeave (client: Client, code: CloseCode) {
    const wasHost = client.sessionId === this.hostId;
    const idx = this.joinOrder.indexOf(client.sessionId);
    if (idx !== -1) this.joinOrder.splice(idx, 1);

    this.state.players.delete(client.sessionId);
    this.lastAttackTime.delete(client.sessionId);
    this.lastHitTime.delete(client.sessionId);
    this.lastSwingTime.delete(client.sessionId);
    this.playerClerkIds.delete(client.sessionId);

    if (wasHost) this.transferHost();
    console.log(client.sessionId, "left! Players:", this.state.players.size);
    if (this.state.players.size === 0) this.scheduleEmptyDispose();
    this.updateMetadata();
  }

  onDispose() {
    if (this.emptyRoomTimer) { this.emptyRoomTimer.clear(); this.emptyRoomTimer = undefined; }
    console.log("room", this.roomId, "disposing...");
  }
}
