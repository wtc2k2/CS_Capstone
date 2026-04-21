import Phaser from 'phaser';
import { ClassData, CHARACTERS } from '../data/Classes';
import type { GameScene } from './GameScene';
import { joinRoom, reconnect, hasReconnectionToken, clearReconnectionData, leaveRoom, getRoom, sendStartGame } from '../network/Network';
import { MAP_W, MAP_H, TILE_SIZE } from '../map/CampusMap';

export class HUDScene extends Phaser.Scene {
  private classData!: ClassData;
  private gameScene!: GameScene;
  private hpBarFill!: Phaser.GameObjects.Graphics;
  private hpBg!: Phaser.GameObjects.Graphics;
  private hpText!: Phaser.GameObjects.Text;
  private dashText!: Phaser.GameObjects.Text;
  private killText!: Phaser.GameObjects.Text;
  private killLabel!: Phaser.GameObjects.Text;
  private roomCodeText!: Phaser.GameObjects.Text;
  private classInfoText!: Phaser.GameObjects.Text;
  private controlsText!: Phaser.GameObjects.Text;
  private mmContainer!: Phaser.GameObjects.Container;
  private lobbyBtn!: Phaser.GameObjects.Container;

  private hpBarW = 420;
  private hpBarH = 34;
  private hpBarX = 0;
  private hpBarY = 46;

  private isHost = false;
  private endGameBtn?: Phaser.GameObjects.Container;
  private gameOverObjects: Phaser.GameObjects.GameObject[] = [];
  private gamePhase: 'waiting' | 'playing' = 'waiting';
  private currentRoomCode = '';
  private waitingPlayerCount = 0;
  private timerText?: Phaser.GameObjects.Text;
  private timeRemaining = 0;
  private gameDuration = 300; // default — updated from state
  private warningShown = false;

  // Waiting room UI
  private waitingTitle!: Phaser.GameObjects.Text;
  private waitingCountText!: Phaser.GameObjects.Text;
  private waitingStatusText!: Phaser.GameObjects.Text;
  private startGameBtn?: Phaser.GameObjects.Container;

  private inventoryContainer?: Phaser.GameObjects.Container;
  private inventorySlotImages: (Phaser.GameObjects.Sprite | null)[] = [null, null, null];
  private bombSlotImage: Phaser.GameObjects.Image | null = null;

  private readonly MINIMAP_W = 160;
  private readonly MINIMAP_H = 120;
  private readonly MINIMAP_Y = 10;
  private minimapX = 0;
  private minimapDots!: Phaser.GameObjects.Graphics;

  private gameMode: string = 'ffa';
  private confirmedLabel?: Phaser.GameObjects.Text;
  private confirmedText?: Phaser.GameObjects.Text;
  private tagIcon?: Phaser.GameObjects.Image;
  private killFeedEntries: Phaser.GameObjects.Text[] = [];

  constructor() {
    super('HUDScene');
  }

  init(data: { classData: ClassData; gameScene: GameScene }): void {
    this.classData = data.classData;
    this.gameScene = data.gameScene;
  }

  create(): void {
    const { width, height } = this.scale;

    this.hpBarX = Math.floor((width - this.hpBarW) / 2);

    // Title — always visible
    this.add.text(width / 2, 16, 'CAMPUS CLASH', {
      fontFamily: 'Courier New, monospace',
      fontSize: '32px',
      color: '#e63946',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 6,
    }).setOrigin(0.5);

    // HP bar background (hidden until game starts)
    this.hpBg = this.add.graphics();
    this.hpBg.fillStyle(0x333333, 1);
    this.hpBg.fillRoundedRect(this.hpBarX, this.hpBarY, this.hpBarW, this.hpBarH, 4);
    this.hpBg.lineStyle(2, 0x000000, 1);
    this.hpBg.strokeRoundedRect(this.hpBarX, this.hpBarY, this.hpBarW, this.hpBarH, 4);
    this.hpBg.setVisible(false);

    // HP bar fill
    this.hpBarFill = this.add.graphics();
    this.hpBarFill.setVisible(false);
    this.drawHpBar(1);

    // HP text
    this.hpText = this.add.text(
      width / 2,
      this.hpBarY + this.hpBarH / 2,
      `${this.classData.maxHp} / ${this.classData.maxHp}`,
      {
        fontFamily: 'Courier New, monospace',
        fontSize: '18px',
        color: '#ffffff',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 4,
      },
    ).setOrigin(0.5).setVisible(false);

    // Class name + weapon
    this.classInfoText = this.add.text(width / 2, this.hpBarY + this.hpBarH + 12,
      `${this.classData.name} - ${this.classData.weaponName}`, {
        fontFamily: 'Courier New, monospace',
        fontSize: '18px',
        color: '#f1faee',
        stroke: '#000000',
        strokeThickness: 3,
      }).setOrigin(0.5).setVisible(false);

    // Dash status
    this.dashText = this.add.text(width / 2, this.hpBarY + this.hpBarH + 38, 'DASH: ●●●', {
      fontFamily: 'Courier New, monospace',
      fontSize: '17px',
      color: '#2a9d8f',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5).setVisible(false);

    // Controls legend
    this.controlsText = this.add.text(width / 2, height - 28, 'WASD: Move  |  O: Attack  |  SPACE: Dash  |  P: Fireball', {
      fontFamily: 'Courier New, monospace',
      fontSize: '18px',
      color: '#a8dadc',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5).setVisible(false);

    // Kill counter
    this.killLabel = this.add.text(16, 16, 'KILLS', {
      fontFamily: 'Courier New, monospace',
      fontSize: '16px',
      color: '#a8dadc',
      stroke: '#000000',
      strokeThickness: 3,
    }).setVisible(false);
    this.killText = this.add.text(16, 38, '0', {
      fontFamily: 'Courier New, monospace',
      fontSize: '48px',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 6,
    }).setVisible(false);

    // Room status (bottom left) — visible during both phases
    this.roomCodeText = this.add.text(16, height - 60, '', {
      fontFamily: 'Courier New, monospace',
      fontSize: '22px',
      color: '#00ff00',
      stroke: '#000000',
      strokeThickness: 4,
    });

    // Minimap container (hidden until game starts)
    this.minimapX = width - this.MINIMAP_W - 10;
    const mmImg = this.add.image(
      this.minimapX + this.MINIMAP_W / 2,
      this.MINIMAP_Y + this.MINIMAP_H / 2,
      'campus-map',
    );
    mmImg.setDisplaySize(this.MINIMAP_W, this.MINIMAP_H);
    mmImg.setDepth(9);

    const mmBorder = this.add.graphics();
    mmBorder.lineStyle(1, 0xffffff, 0.35);
    mmBorder.strokeRect(this.minimapX, this.MINIMAP_Y, this.MINIMAP_W, this.MINIMAP_H);
    const mmLabel = this.add.text(this.minimapX + this.MINIMAP_W / 2, this.MINIMAP_Y + 3, 'MAP', {
      fontFamily: 'Courier New, monospace',
      fontSize: '10px',
      color: '#aaaaaa',
    }).setOrigin(0.5, 0);
    this.minimapDots = this.add.graphics();
    this.mmContainer = this.add.container(0, 0, [mmImg, mmBorder, mmLabel, this.minimapDots]);
    this.mmContainer.setVisible(false);

    // Return to lobby button (always visible)
    this.lobbyBtn = this.createButton(width - 172, height - 60, '← LOBBY', 0x1a3a7a, () => {
      leaveRoom();
      window.location.reload();
    });

    // ── Waiting room UI ──
    this.waitingTitle = this.add.text(width / 2, height / 2 - 80, 'WAITING ROOM', {
      fontFamily: 'Courier New, monospace',
      fontSize: '32px',
      color: '#f5c518',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 6,
    }).setOrigin(0.5);

    this.waitingCountText = this.add.text(width / 2, height / 2 - 30, '1 / 10 players', {
      fontFamily: 'Courier New, monospace',
      fontSize: '20px',
      color: '#a8dadc',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5);

    this.waitingStatusText = this.add.text(width / 2, height / 2 + 20, '', {
      fontFamily: 'Courier New, monospace',
      fontSize: '16px',
      color: '#7a9abf',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5);

    // Event listeners
    this.gameScene.events.on('playerHpChanged', (hp: number, maxHp: number) => {
      this.drawHpBar(hp / maxHp);
      this.hpText.setText(`${hp} / ${maxHp}`);
    });
    this.gameScene.events.on('playerKillsChanged', (kills: number) => {
      this.killText.setText(`${kills}`);
    });
    this.gameScene.events.on('gameOver', (scores: { name: string; kills: number; deaths: number; confirmedKills: number }[], timeLimitReached: boolean) => {
      this.showGameOverScreen(scores, timeLimitReached);
    });
    this.gameScene.events.on('timeRemainingUpdated', (secs: number) => {
      this.timeRemaining = secs;
      this.updateTimerDisplay();
    });
    this.gameScene.events.on('gameModeSet', (mode: string) => {
      this.gameMode = mode;
    });
    this.gameScene.events.on('confirmedKillChanged', (confirmed: number) => {
      if (this.confirmedText) this.confirmedText.setText(`${confirmed}`);
    });
    this.gameScene.events.on('killFeedEntry', (killerName: string, victimName: string, weapon: string) => {
      this.addKillFeedEntry(killerName, victimName, weapon);
    });
    this.gameScene.events.on('gameStarted', () => {
      this.switchToGameHUD();
    });
    this.gameScene.events.on('revertedToWaiting', () => {
      this.revertToWaiting();
    });
    this.gameScene.events.on('hostChanged', (hostSessionId: string) => {
      this.onHostChanged(hostSessionId);
    });
    this.gameScene.events.on('inventoryChanged', (count: number) => {
      this.updateInventoryDisplay(count);
    });
    this.gameScene.events.on('bombCountChanged', (count: number) => {
      this.updateBombSlotDisplay(count);
    });

    // Auto-connect: lobby already established the room — always prefer that over reconnect token
    const mode = this.registry.get('mode') as 'host' | 'join' | undefined;
    if (getRoom()) {
      // Lobby connected — reuse existing room directly
      this.time.delayedCall(100, () => this.handleConnect(mode ?? 'join'));
    } else if (hasReconnectionToken()) {
      // Page was refreshed mid-game — attempt WebSocket reconnect
      this.attemptReconnect();
    } else if (mode) {
      this.time.delayedCall(100, () => this.handleConnect(mode));
    }
  }

  private async attemptReconnect(): Promise<void> {
    this.roomCodeText.setText('Reconnecting...').setColor('#ffff00');
    try {
      const room = await reconnect();
      this.isHost = false;
      const code = room.state?.roomCode || room.roomId;
      this.onConnected(code);
      room.onStateChange.once(() => {
        if (room.state?.roomCode) this.updateRoomCodeDisplay(room.state.roomCode);
      });
      this.gameScene.onRoomConnected(room);
      this.setupWaitingRoomListeners(room);
    } catch (err) {
      console.warn('Auto-reconnect failed:', err);
      clearReconnectionData();
      this.roomCodeText.setText('Reconnect failed').setColor('#ff0000');
    }
  }

  private async handleConnect(mode: 'host' | 'join'): Promise<void> {
    // Lobby already connected the room — reuse it
    const existing = getRoom();
    if (existing) {
      this.isHost = mode === 'host';
      // Read roomCode from registry (set by lobby) or fall back to state/roomId
      const registryCode = this.registry.get('roomCode') as string ?? '';
      const code = registryCode || existing.state?.roomCode || existing.roomId;
      this.onConnected(code);
      // Update once state syncs (handles random-join case where registry code is empty)
      existing.onStateChange.once(() => {
        if (existing.state?.roomCode) this.updateRoomCodeDisplay(existing.state.roomCode);
      });
      this.gameScene.onRoomConnected(existing);
      this.setupWaitingRoomListeners(existing);
      return;
    }

    // Fallback: lobby connection lost, try rejoining
    const username = this.registry.get('username') as string ?? 'Player';
    const roomCode = this.registry.get('roomCode') as string ?? '';
    const spriteKey = (this.registry.get('classData') as ClassData | undefined)?.spriteKey ?? CHARACTERS[0].spriteKey;
    try {
      this.roomCodeText.setText('Connecting...').setColor('#ffff00');
      let room;
      if (roomCode) {
        room = await joinRoom(roomCode, username, spriteKey);
      } else {
        this.roomCodeText.setText('Connection failed').setColor('#ff0000');
        return;
      }
      this.isHost = mode === 'host';
      this.onConnected(room.state?.roomCode || room.roomId);
      this.gameScene.onRoomConnected(room);
      this.setupWaitingRoomListeners(room);
    } catch (err) {
      console.error('Connection failed:', err);
      this.roomCodeText.setText('Connection failed').setColor('#ff0000');
    }
  }

  private updateRoomCodeDisplay(code: string): void {
    this.currentRoomCode = code;
    this.roomCodeText.setText(`ROOM: ${code}`).setColor('#00ff00');
  }

  private setupWaitingRoomListeners(room: any): void {
    const updateCount = () => {
      const max = room.state?.maxPlayers ?? 10;
      const count = room.state?.players?.size ?? 1;
      this.updateWaitingCount(count, max);
    };
    // onStateChange fires on every patch, which covers players joining/leaving
    room.onStateChange(updateCount);
  }

  private onConnected(roomCode: string): void {
    const { height } = this.scale;
    this.currentRoomCode = roomCode;
    this.roomCodeText.setText(`ROOM: ${roomCode}`).setColor('#00ff00');

    // Copy code button next to room code (all players)
    const copyBtn = this.createButton(164, height - 36, 'COPY CODE', 0x1a4a2a, () => {
      navigator.clipboard.writeText(this.currentRoomCode).then(() => {
        this.roomCodeText.setText('COPIED!').setColor('#f5c518');
        this.time.delayedCall(1500, () => {
          this.roomCodeText.setText(`ROOM: ${this.currentRoomCode}`).setColor('#00ff00');
        });
      }).catch(() => {
        this.roomCodeText.setText(`CODE: ${this.currentRoomCode}`).setColor('#f5c518');
        this.time.delayedCall(3000, () => {
          this.roomCodeText.setText(`ROOM: ${this.currentRoomCode}`).setColor('#00ff00');
        });
      });
    }, 120, 42);
    this.add.existing(copyBtn);

    if (this.isHost) {
      // START GAME button (center bottom of screen) — disabled until 2+ players
      const { width } = this.scale;
      this.startGameBtn = this.createButton(width / 2 - 80, height / 2 + 70, 'START GAME', 0x1a7a3a, () => {
        if (this.waitingPlayerCount < 2) return;
        this.gameScene.setCountdownActive(true); // stop position sends before startGame message
        sendStartGame();
        if (this.startGameBtn) this.startGameBtn.setVisible(false);
      }, 160, 52);
      this.startGameBtn.setAlpha(0.4); // disabled until 2 players
      this.add.existing(this.startGameBtn);
      this.waitingStatusText.setText('Need 2+ players to start').setVisible(true);
    } else {
      this.waitingStatusText.setText('Waiting for host to start...').setVisible(true);
    }
  }

  private updateWaitingCount(count: number, max: number): void {
    this.waitingPlayerCount = count;
    this.waitingCountText.setText(`${count} / ${max} players`);
    if (this.isHost && this.startGameBtn) {
      const canStart = count >= 2;
      this.startGameBtn.setAlpha(canStart ? 1 : 0.4);
      if (this.isHost) {
        this.waitingStatusText.setText('Need 2+ players to start').setVisible(!canStart);
      }
    }
  }

  private switchToGameHUD(): void {
    this.gamePhase = 'playing';

    // Hide waiting UI immediately
    this.waitingTitle.setVisible(false);
    this.waitingCountText.setVisible(false);
    this.waitingStatusText.setVisible(false);
    if (this.startGameBtn) this.startGameBtn.setVisible(false);

    this.createInventoryBox();

    // Run countdown, then reveal game HUD
    this.gameScene.setCountdownActive(true);
    this.showCountdown(() => {
      this.gameScene.setCountdownActive(false);
      this.revealGameHUD();
    });
  }

  private showCountdown(onComplete: () => void): void {
    const { width, height } = this.scale;
    const cx = width / 2;
    const cy = height / 2;

    this.sound.play('sfx_countdown', { volume: 0.4 });

    const overlay = this.add.graphics().setDepth(150);
    overlay.fillStyle(0x000000, 0.45);
    overlay.fillRect(0, 0, width, height);

    const countText = this.add.text(cx, cy, '3', {
      fontFamily: 'Courier New, monospace',
      fontSize: '220px',
      color: '#f5c518',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 14,
    }).setOrigin(0.5).setDepth(151);

    const steps: Array<{ label: string; color: string; hold: number }> = [
      { label: '3',     color: '#f5c518', hold: 900 },
      { label: '2',     color: '#f5c518', hold: 900 },
      { label: '1',     color: '#f5c518', hold: 900 },
      { label: 'START', color: '#00ff88', hold: 550 },
    ];
    let step = 0;

    const showStep = () => {
      const { label, color, hold } = steps[step];
      countText.setText(label).setColor(color).setAlpha(1).setScale(1.6);
      this.tweens.add({
        targets: countText,
        scaleX: 1,
        scaleY: 1,
        duration: 220,
        ease: 'Back.easeOut',
      });

      this.time.delayedCall(hold, () => {
        step++;
        if (step < steps.length) {
          // Quick fade between numbers
          this.tweens.add({
            targets: countText,
            alpha: 0,
            duration: 80,
            onComplete: showStep,
          });
        } else {
          // Fade out overlay and text, then call back
          this.tweens.add({
            targets: [overlay, countText],
            alpha: 0,
            duration: 350,
            onComplete: () => {
              overlay.destroy();
              countText.destroy();
              onComplete();
            },
          });
        }
      });
    };

    showStep();
  }

  private revertToWaiting(): void {
    this.gamePhase = 'waiting';

    if (this.inventoryContainer) {
      this.inventoryContainer.destroy();
      this.inventoryContainer = undefined;
      this.inventorySlotImages = [null, null, null];
      this.bombSlotImage = null;
    }

    // Destroy game over overlay if still showing
    this.gameOverObjects.forEach(o => { try { (o as any).destroy(); } catch {} });
    this.gameOverObjects = [];

    // Hide game HUD
    this.hpBg.setVisible(false);
    this.hpBarFill.setVisible(false);
    this.hpText.setVisible(false);
    this.classInfoText.setVisible(false);
    this.dashText.setVisible(false);
    this.controlsText.setVisible(false);
    this.killLabel.setVisible(false);
    this.killText.setVisible(false);
    this.mmContainer.setVisible(false);
    if (this.endGameBtn) { this.endGameBtn.destroy(); this.endGameBtn = undefined; }
    if (this.timerText) { this.timerText.destroy(); this.timerText = undefined; }
    if (this.confirmedLabel) { this.confirmedLabel.destroy(); this.confirmedLabel = undefined; }
    if (this.confirmedText) { this.confirmedText.destroy(); this.confirmedText = undefined; }
    if (this.tagIcon) { this.tagIcon.destroy(); this.tagIcon = undefined; }
    this.timeRemaining = 0;
    this.warningShown = false;

    // Show waiting room UI
    this.waitingTitle.setVisible(true);
    this.waitingCountText.setVisible(true);

    // Check if this client is now the host
    const room = getRoom();
    const isNowHost = !!(room && room.sessionId === (room.state as any)?.hostSessionId);
    this.isHost = isNowHost;

    if (isNowHost) {
      if (this.startGameBtn) this.startGameBtn.destroy();
      const { width, height } = this.scale;
      this.startGameBtn = this.createButton(width / 2 - 80, height / 2 + 70, 'START GAME', 0x1a7a3a, () => {
        if (this.waitingPlayerCount < 2) return;
        this.gameScene.setCountdownActive(true); // stop position sends before startGame message
        sendStartGame();
        if (this.startGameBtn) this.startGameBtn.setVisible(false);
      }, 160, 52);
      this.startGameBtn.setAlpha(this.waitingPlayerCount >= 2 ? 1 : 0.4);
      this.add.existing(this.startGameBtn);
      this.waitingStatusText.setText('Need 2+ players to start').setVisible(this.waitingPlayerCount < 2);
    } else {
      if (this.startGameBtn) { this.startGameBtn.setVisible(false); }
      this.waitingStatusText.setText('Waiting for host to start...').setVisible(true);
    }
  }

  private onHostChanged(hostSessionId: string): void {
    const room = getRoom();
    if (!room) return;
    const isNowHost = room.sessionId === hostSessionId;
    if (isNowHost && !this.isHost) {
      this.isHost = true;
      if (this.gamePhase === 'waiting') {
        // Promote this client to host in the waiting room
        if (this.startGameBtn) this.startGameBtn.destroy();
        const { width, height } = this.scale;
        this.startGameBtn = this.createButton(width / 2 - 80, height / 2 + 70, 'START GAME', 0x1a7a3a, () => {
          if (this.waitingPlayerCount < 2) return;
          this.gameScene.setCountdownActive(true); // stop position sends before startGame message
          sendStartGame();
          if (this.startGameBtn) this.startGameBtn.setVisible(false);
        }, 160, 52);
        this.startGameBtn.setAlpha(this.waitingPlayerCount >= 2 ? 1 : 0.4);
        this.add.existing(this.startGameBtn);
        this.waitingStatusText.setVisible(false);
      }
    }
  }

  private revealGameHUD(): void {
    const { width } = this.scale;

    this.hpBg.setVisible(true);
    this.hpBarFill.setVisible(true);
    this.hpText.setVisible(true);
    this.classInfoText.setVisible(true);
    this.dashText.setVisible(true);
    this.controlsText.setVisible(true);
    this.killLabel.setVisible(true);
    this.killText.setVisible(true);
    this.mmContainer.setVisible(true);

    if (this.gameMode === 'killConfirmed') {
      this.tagIcon = this.add.image(18, 90, 'kill-tag').setOrigin(0, 0).setDisplaySize(32, 32).setDepth(10);
      this.confirmedLabel = this.add.text(46, 92, 'CONFIRMED', {
        fontFamily: 'Courier New, monospace',
        fontSize: '11px',
        color: '#ffd700',
        letterSpacing: 2,
        stroke: '#000000',
        strokeThickness: 2,
      }).setDepth(10);
      this.confirmedText = this.add.text(18, 116, '0', {
        fontFamily: 'Courier New, monospace',
        fontSize: '52px',
        color: '#ffd700',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 6,
      }).setDepth(10);
    }

    // Timer — to the left of the minimap
    this.timerText = this.add.text(
      this.minimapX - 12,
      this.MINIMAP_Y + this.MINIMAP_H / 2,
      '5:00',
      {
        fontFamily: 'Courier New, monospace',
        fontSize: '26px',
        color: '#ffffff',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 5,
      },
    ).setOrigin(1, 0.5).setDepth(10);

    // If timeRemaining already arrived before the HUD was revealed, display it now
    if (this.timeRemaining > 0) this.updateTimerDisplay();

    if (this.isHost) {
      this.endGameBtn = this.createButton(width - 116, this.MINIMAP_Y + this.MINIMAP_H + 8, 'END GAME', 0x880000, () => {
        this.gameScene.sendEndGame();
        if (this.endGameBtn) this.endGameBtn.setVisible(false);
      });
      this.add.existing(this.endGameBtn);
    }
  }

  private updateTimerDisplay(): void {
    if (!this.timerText) return;
    const mins = Math.floor(this.timeRemaining / 60);
    const secs = this.timeRemaining % 60;
    this.timerText.setText(`${mins}:${secs.toString().padStart(2, '0')}`);
    this.timerText.setColor(this.timeRemaining <= 30 ? '#ff4444' : '#ffffff');

    // Pull game duration from room state the first time we see it so the warning threshold is accurate
    const room = getRoom();
    const stateDur = (room?.state as any)?.gameDuration;
    if (typeof stateDur === 'number' && stateDur > 0) this.gameDuration = stateDur;

    // Warning thresholds by duration: 5min → 2min left, 3min → 1min left, 2min → 30s left
    const warnAt = this.gameDuration >= 300 ? 120
                 : this.gameDuration >= 180 ? 60
                 : 30;
    const label  = warnAt >= 60 ? `${warnAt / 60} MINUTE${warnAt === 60 ? '' : 'S'} REMAINING`
                                 : `${warnAt} SECONDS REMAINING`;
    if (!this.warningShown && this.timeRemaining === warnAt) {
      this.warningShown = true;
      this.showTimerWarning(label);
    }
  }

  private showTimerWarning(message: string): void {
    const { width, height } = this.scale;
    const txt = this.add.text(width / 2, height / 2 - 60, message, {
      fontFamily: 'Courier New, monospace',
      fontSize: '32px',
      color: '#ff4444',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 6,
    }).setOrigin(0.5).setDepth(150).setAlpha(0);

    this.tweens.add({
      targets: txt,
      alpha: 1,
      duration: 200,
      yoyo: true,
      hold: 1800,
      onComplete: () => txt.destroy(),
    });
  }

  private createButton(
    x: number, y: number, label: string, color: number, onClick: () => void,
    btnW = 100, btnH = 36,
  ): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);

    const bg = this.add.graphics();
    bg.fillStyle(color, 1);
    bg.fillRoundedRect(0, 0, btnW, btnH, 4);
    bg.lineStyle(1, 0x000000, 1);
    bg.strokeRoundedRect(0, 0, btnW, btnH, 4);
    container.add(bg);

    const txt = this.add.text(btnW / 2, btnH / 2, label, {
      fontFamily: 'Courier New, monospace',
      fontSize: '16px',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5);
    container.add(txt);

    const zone = this.add.zone(btnW / 2, btnH / 2, btnW, btnH)
      .setInteractive({ useHandCursor: true });
    container.add(zone);

    zone.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(color, 0.7);
      bg.fillRoundedRect(0, 0, btnW, btnH, 4);
      bg.lineStyle(1, 0xffffff, 1);
      bg.strokeRoundedRect(0, 0, btnW, btnH, 4);
    });
    zone.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(color, 1);
      bg.fillRoundedRect(0, 0, btnW, btnH, 4);
      bg.lineStyle(1, 0x000000, 1);
      bg.strokeRoundedRect(0, 0, btnW, btnH, 4);
    });
    zone.on('pointerdown', () => {
      this.sound.play('sfx_menu', { volume: 0.4 });
      onClick();
    });

    return container;
  }

  private showGameOverScreen(scores: { name: string; kills: number; deaths: number; confirmedKills: number }[], timeLimitReached = false): void {
    const { width, height } = this.scale;
    const cx = width / 2; const cy = height / 2;

    // Stats are now saved server-side in MyRoom.triggerEndGame() via Prisma.

    // Remove timer display
    if (this.timerText) { this.timerText.destroy(); this.timerText = undefined; }

    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.75);
    overlay.fillRect(0, 0, width, height);
    overlay.setDepth(200);

    const titleText = this.add.text(cx, cy - 140, 'GAME OVER', {
      fontFamily: 'Courier New, monospace', fontSize: '52px', color: '#e63946',
      fontStyle: 'bold', stroke: '#000000', strokeThickness: 8,
    }).setOrigin(0.5).setDepth(201);

    const extraObjects: Phaser.GameObjects.GameObject[] = [overlay, titleText];

    if (timeLimitReached) {
      extraObjects.push(this.add.text(cx, cy - 100, 'TIME LIMIT REACHED', {
        fontFamily: 'Courier New, monospace', fontSize: '18px', color: '#ff8c00',
        fontStyle: 'bold', stroke: '#000000', strokeThickness: 4,
      }).setOrigin(0.5).setDepth(201));
    }

    // Winner banner
    const winnerY = timeLimitReached ? cy - 72 : cy - 90;
    if (scores.length > 0) {
      extraObjects.push(this.add.text(cx, winnerY, `★  ${scores[0].name}  WINS  ★`, {
        fontFamily: 'Courier New, monospace', fontSize: '22px', color: '#f5c518',
        fontStyle: 'bold', stroke: '#000000', strokeThickness: 4,
      }).setOrigin(0.5).setDepth(201));
    }

    extraObjects.push(this.add.text(cx, cy - 56, '— FINAL SCORES —', {
      fontFamily: 'Courier New, monospace', fontSize: '16px', color: '#a8dadc',
      stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(201));

    const isKC = this.gameMode === 'killConfirmed';
    scores.forEach((entry, i) => {
      const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`;
      const kd = (entry.kills / Math.max(entry.deaths, 1)).toFixed(2);
      const scoreStr = isKC
        ? `${medal}  ${entry.name}  —  ${entry.confirmedKills} Confirmed  (${entry.kills}K / ${entry.deaths}D)`
        : `${medal}  ${entry.name}  —  ${entry.kills}K / ${entry.deaths}D  (${kd} K/D)`;
      extraObjects.push(this.add.text(cx, cy - 22 + i * 34, scoreStr, {
          fontFamily: 'Courier New, monospace', fontSize: '18px',
          color: i === 0 ? '#f4d03f' : '#ffffff',
          fontStyle: i === 0 ? 'bold' : 'normal',
          stroke: '#000000', strokeThickness: 3,
        }).setOrigin(0.5).setDepth(201));
    });

    let countdown = 30;
    const countText = this.add.text(cx, cy + 160, `Closing in ${countdown}s`, {
      fontFamily: 'Courier New, monospace', fontSize: '15px',
      color: '#aaaaaa', stroke: '#000000', strokeThickness: 2,
    }).setOrigin(0.5).setDepth(201);

    // Store all refs so revertToWaiting() can destroy them
    this.gameOverObjects = [...extraObjects, countText];

    this.time.addEvent({
      delay: 1000,
      repeat: 29,
      callback: () => {
        countdown--;
        if (countdown <= 10) countText.setColor('#ff4444');
        if (countdown > 0) {
          countText.setText(`Closing in ${countdown}s`);
        } else {
          // Destroy leaderboard overlay and all game-over objects
          this.gameOverObjects.forEach(o => { try { (o as any).destroy(); } catch {} });
          this.gameOverObjects = [];
          // Show brief return message (server resets in ~5s)
          this.add.text(cx, cy, 'Returning to lobby...', {
            fontFamily: 'Courier New, monospace', fontSize: '20px',
            color: '#aaaaaa', stroke: '#000000', strokeThickness: 3,
          }).setOrigin(0.5).setScrollFactor(0).setDepth(201);
        }
      },
    });
  }

  private createInventoryBox(): void {
    const { width, height } = this.scale;
    const cx = width / 2;
    const cy = height - 72;

    const container = this.add.container(cx, cy);
    container.setDepth(10).setScrollFactor(0);

    const bg = this.add.graphics();
    bg.fillStyle(0x000000, 0.55);
    bg.fillRoundedRect(-76, -22, 198, 44, 6);
    container.add(bg);

    const label = this.add.text(-70, -18, '🔥', {
      fontSize: '12px', color: '#ffaa44',
    }).setOrigin(0, 0);
    container.add(label);

    const SLOT_SIZE = 34;
    const SLOT_GAP  = 6;
    const startX = -44;

    for (let i = 0; i < 3; i++) {
      const sx = startX + i * (SLOT_SIZE + SLOT_GAP);

      const slot = this.add.graphics();
      slot.lineStyle(2, 0xff8800, 0.8);
      slot.strokeRect(sx, -SLOT_SIZE / 2, SLOT_SIZE, SLOT_SIZE);
      slot.fillStyle(0x111111, 0.4);
      slot.fillRect(sx + 1, -SLOT_SIZE / 2 + 1, SLOT_SIZE - 2, SLOT_SIZE - 2);
      container.add(slot);

      const img = this.add.sprite(sx + SLOT_SIZE / 2, 0, 'fireball');
      img.setDisplaySize(SLOT_SIZE - 4, SLOT_SIZE - 4).setVisible(false);
      img.play('fireball_fly');
      container.add(img);
      this.inventorySlotImages[i] = img;
    }

    // Bomb slot — sits to the right of the 3 fireball slots
    const bombX = startX + 3 * (SLOT_SIZE + SLOT_GAP) + 6;
    const bombSlot = this.add.graphics();
    bombSlot.lineStyle(2, 0xcc3333, 0.9);
    bombSlot.strokeRect(bombX, -SLOT_SIZE / 2, SLOT_SIZE, SLOT_SIZE);
    bombSlot.fillStyle(0x111111, 0.4);
    bombSlot.fillRect(bombX + 1, -SLOT_SIZE / 2 + 1, SLOT_SIZE - 2, SLOT_SIZE - 2);
    container.add(bombSlot);

    const bombImg = this.add.image(bombX + SLOT_SIZE / 2, 0, 'bomb-pickup');
    bombImg.setDisplaySize(SLOT_SIZE - 4, SLOT_SIZE - 4).setVisible(false);
    container.add(bombImg);
    this.bombSlotImage = bombImg;

    this.inventoryContainer = container;
    this.updateInventoryDisplay(0);
    this.updateBombSlotDisplay(0);
  }

  private updateInventoryDisplay(count: number): void {
    for (let i = 0; i < 3; i++) {
      const img = this.inventorySlotImages[i];
      if (img) img.setVisible(i < count);
    }
  }

  private updateBombSlotDisplay(count: number): void {
    if (this.bombSlotImage) this.bombSlotImage.setVisible(count > 0);
  }

  private drawHpBar(ratio: number): void {
    this.hpBarFill.clear();
    const color = ratio > 0.5 ? 0x00cc44 : ratio > 0.25 ? 0xcccc00 : 0xcc0000;
    this.hpBarFill.fillStyle(color, 1);
    this.hpBarFill.fillRoundedRect(
      this.hpBarX, this.hpBarY,
      Math.floor(this.hpBarW * ratio), this.hpBarH, 4,
    );
  }

  update(): void {
    if (!this.gameScene.player) return;
    if (this.gamePhase !== 'playing') return;

    const { dashCharges, dashRechargeCooldown } = this.gameScene.player;
    const pips = '●'.repeat(dashCharges) + '○'.repeat(3 - dashCharges);

    if (dashCharges < 3 && dashRechargeCooldown > 0) {
      this.dashText.setText(`DASH: ${pips}  ${(dashRechargeCooldown / 1000).toFixed(1)}s`);
      this.dashText.setColor(dashCharges === 0 ? '#cc0000' : '#ccaa00');
    } else {
      this.dashText.setText(`DASH: ${pips}`);
      this.dashText.setColor('#2a9d8f');
    }

    this.updateMinimap();
  }

  private updateMinimap(): void {
    if (!this.gameScene.player || !this.minimapDots) return;
    const worldW = MAP_W * TILE_SIZE;
    const worldH = MAP_H * TILE_SIZE;

    this.minimapDots.clear();

    // Remote players — white dots
    this.gameScene.getRemotePlayers().forEach((rp) => {
      if (!rp.alive) return;
      const mx = this.minimapX + (rp.sprite.x / worldW) * this.MINIMAP_W;
      const my = this.MINIMAP_Y + (rp.sprite.y / worldH) * this.MINIMAP_H;
      this.minimapDots.fillStyle(0xffffff, 1);
      this.minimapDots.fillCircle(mx, my, 2);
    });

    // Local player — red dot
    const { x, y } = this.gameScene.player;
    const mx = this.minimapX + (x / worldW) * this.MINIMAP_W;
    const my = this.MINIMAP_Y + (y / worldH) * this.MINIMAP_H;
    this.minimapDots.fillStyle(0xff0000, 1);
    this.minimapDots.fillCircle(mx, my, 3);
  }

  private addKillFeedEntry(killerName: string, victimName: string, weapon: string): void {
    const { width, height } = this.cameras.main;
    const weaponLabel = weapon === 'fireball' ? 'Fireball' : 'Melee';
    const msg = `${killerName}  [${weaponLabel}]  ${victimName}`;

    const text = this.add.text(width - 16, height - 70, msg, {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3,
      backgroundColor: '#111111',
      padding: { x: 6, y: 4 },
    }).setOrigin(1, 1).setDepth(200);

    // Push existing entries up
    for (const entry of this.killFeedEntries) {
      entry.y -= 28;
    }
    this.killFeedEntries.push(text);

    // Fade out after 5 seconds
    this.tweens.add({
      targets: text,
      alpha: 0,
      delay: 4000,
      duration: 1000,
      onComplete: () => {
        const idx = this.killFeedEntries.indexOf(text);
        if (idx !== -1) this.killFeedEntries.splice(idx, 1);
        text.destroy();
      },
    });

    // Cap at 5 visible entries
    while (this.killFeedEntries.length > 5) {
      const old = this.killFeedEntries.shift();
      old?.destroy();
    }
  }
}
