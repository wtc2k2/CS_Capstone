import { CHARACTERS, ClassData } from './data/Classes';
import { createRoom, joinAnyRoom, joinRoom, joinLobbyPresence, leaveLobbyPresence, getOnlineCount } from './network/Network';
import { requireAuth, saveUserToSupabase, getClerk, fetchPlayerStats, fetchLeaderboard, PlayerStats, LeaderboardEntry } from './auth';

const delay = (ms: number): Promise<void> => new Promise(r => setTimeout(r, ms));

function playMenuClick(): void {
  const audio = new Audio('/audio/menu_hover.mp3');
  audio.volume = 0.4;
  audio.play().catch(() => {});
}

// ── Chiptune music playlist (shuffled, loops forever) ──
const CHIPTUNE_TRACKS = [
  '/audio/chiptune/Three Red Hearts Box Jump.ogg',
  '/audio/chiptune/Three Red Hearts Candy.ogg',
  '/audio/chiptune/Three Red Hearts Connected.ogg',
  '/audio/chiptune/Three Red Hearts Deep Blue.ogg',
  '/audio/chiptune/Three Red Hearts Go (No Vocal).ogg',
  '/audio/chiptune/Three Red Hearts Modern Bits.ogg',
  '/audio/chiptune/Three Red Hearts Out of Time.ogg',
  '/audio/chiptune/Three Red Hearts Penguin Town.ogg',
  '/audio/chiptune/Three Red Hearts Penguins vs Rabbits.ogg',
  '/audio/chiptune/Three Red Hearts Penultimate.ogg',
  '/audio/chiptune/Three Red Hearts Pixel War 1.ogg',
  '/audio/chiptune/Three Red Hearts Pixel War 2.ogg',
  '/audio/chiptune/Three Red Hearts Princess Quest.ogg',
  '/audio/chiptune/Three Red Hearts Puzzle Pieces.ogg',
  '/audio/chiptune/Three Red Hearts Rabbit Town.ogg',
  '/audio/chiptune/Three Red Hearts Rumble at the Gates.ogg',
  '/audio/chiptune/Three Red Hearts Sanctuary.ogg',
  '/audio/chiptune/Three Red Hearts Save the City.ogg',
  '/audio/chiptune/Three Red Hearts Three Red Hearts.ogg',
];

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

let playlist: string[] = shuffleArray(CHIPTUNE_TRACKS);
let trackIndex = 0;
const bgMusic = new Audio(playlist[0]);
bgMusic.volume = 0.3;

function playNextTrack(): void {
  trackIndex++;
  if (trackIndex >= playlist.length) {
    playlist = shuffleArray(CHIPTUNE_TRACKS);
    trackIndex = 0;
  }
  bgMusic.src = playlist[trackIndex];
  bgMusic.play().catch(() => {});
}

bgMusic.addEventListener('ended', playNextTrack);

function startMusic(): void {
  if (!bgMusic.paused) return;
  bgMusic.play().catch(() => {});
}

export function stopMusic(): void {
  bgMusic.pause();
  bgMusic.currentTime = 0;
}

// Try immediately; if browser blocks it, unlock on first interaction
bgMusic.play().catch(() => {
  const unlock = () => {
    bgMusic.play().catch(() => {});
    document.removeEventListener('click', unlock);
    document.removeEventListener('keydown', unlock);
  };
  document.addEventListener('click', unlock);
  document.addEventListener('keydown', unlock);
});


const USERNAME_KEY = 'cc_username';
const CHARACTER_KEY = 'cc_character';
const LANDING_KEY = 'cc_seen_landing';

interface OnboardingStep {
  title: string;
  image: string;
  caption: string;
}
const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    title: 'SIGN UP OR SIGN IN',
    image: '/getting-started/step1.png',
    caption: 'Create an account or sign in to get started.',
  },
  {
    title: 'CREATE A USERNAME',
    image: '/getting-started/step2.png',
    caption: 'Pick a name your friends will see in the arena.',
  },
  {
    title: 'HOST OR JOIN A GAME',
    image: '/getting-started/step3.png',
    caption: 'Start a new match, or join one with a code.',
  },
  {
    title: 'SELECT YOUR CHARACTER',
    image: '/getting-started/step4.png',
    caption: "Don't forget to pick your fighter from the LOCKER tab.",
  },
  {
    title: 'JUMP IN AND HAVE FUN',
    image: '/getting-started/step5.png',
    caption: 'Wait for the host to start the match. Good luck!',
  },
];

function showLanding(): Promise<void> {
  return new Promise<void>((resolve) => {
    const screen = document.getElementById('landing-screen')!;
    const startBtn = document.getElementById('landing-get-started')!;
    const skipBtn = document.getElementById('landing-skip')!;
    screen.classList.remove('hidden');

    let done = false;
    const cleanup = (skip: boolean) => {
      if (done) return;
      done = true;
      screen.classList.add('hidden');
      startBtn.removeEventListener('click', onStart);
      skipBtn.removeEventListener('click', onSkip);
      resolve();
      if (skip) {
        // Signal to caller via flag — handled in initLobby
        (window as any).__ccLandingSkipped = true;
      }
    };
    const onStart = () => { playMenuClick(); cleanup(false); };
    const onSkip = () => { playMenuClick(); cleanup(true); };
    startBtn.addEventListener('click', onStart);
    skipBtn.addEventListener('click', onSkip);
  });
}

function showOnboarding(): Promise<void> {
  return new Promise<void>((resolve) => {
    const screen = document.getElementById('onboarding-screen')!;
    const badge = document.getElementById('onboarding-step-badge')!;
    const title = document.getElementById('onboarding-title')!;
    const img = document.getElementById('onboarding-image') as HTMLImageElement;
    const caption = document.getElementById('onboarding-caption')!;
    const back = document.getElementById('onboarding-back') as HTMLButtonElement;
    const next = document.getElementById('onboarding-next') as HTMLButtonElement;
    const dots = Array.from(document.querySelectorAll('#onboarding-dots .onboarding-dot')) as HTMLElement[];

    let idx = 0;
    const render = () => {
      const step = ONBOARDING_STEPS[idx];
      badge.textContent = `STEP ${idx + 1} OF ${ONBOARDING_STEPS.length}`;
      title.textContent = step.title;
      img.src = step.image;
      img.alt = step.title;
      caption.textContent = step.caption;
      dots.forEach((d, i) => d.classList.toggle('active', i === idx));
      back.disabled = idx === 0;
      const isLast = idx === ONBOARDING_STEPS.length - 1;
      next.textContent = isLast ? "LET'S PLAY" : 'NEXT ›';
      next.classList.toggle('final', isLast);
    };

    const onBack = () => {
      if (idx === 0) return;
      playMenuClick();
      idx--;
      render();
    };
    const onNext = () => {
      playMenuClick();
      if (idx < ONBOARDING_STEPS.length - 1) {
        idx++;
        render();
      } else {
        cleanup();
      }
    };
    const cleanup = () => {
      screen.classList.add('hidden');
      back.removeEventListener('click', onBack);
      next.removeEventListener('click', onNext);
      resolve();
    };

    back.addEventListener('click', onBack);
    next.addEventListener('click', onNext);
    render();
    screen.classList.remove('hidden');
  });
}

async function showLandingFlow(): Promise<void> {
  (window as any).__ccLandingSkipped = false;
  await showLanding();
  if (!(window as any).__ccLandingSkipped) {
    await showOnboarding();
  }
  localStorage.setItem(LANDING_KEY, '1');
}

export interface LobbyResult {
  username: string;
  clerkId: string;
  mode: 'host' | 'join';
  isPrivate: boolean;
  roomCode: string;
  classData: ClassData;
  gameMode: string;
}

export function initLobby(): Promise<LobbyResult> {
  return new Promise(async (resolve) => {
    if (!localStorage.getItem(LANDING_KEY)) {
      await showLandingFlow();
    }

    const clerk = await requireAuth();
    const clerkUser = clerk.user!;
    const clerkId = clerkUser.id;
    const email = clerkUser.primaryEmailAddress?.emailAddress ?? '';
    const avatarUrl: string = clerkUser.imageUrl ?? '';
    const displayName: string =
      clerkUser.firstName
        ? `${clerkUser.firstName}${clerkUser.lastName ? ' ' + clerkUser.lastName : ''}`
        : (clerkUser.username ?? email.split('@')[0] ?? 'Player');

    const stored = localStorage.getItem(USERNAME_KEY);
    if (stored) {
      void saveUserToSupabase(clerkId, stored, email);
      showLobby(stored, resolve, clerkId, email, avatarUrl, displayName);
    } else {
      showLogin(resolve, clerkId, email, avatarUrl, displayName);
    }
  });
}

function setHeaderProfile(avatarUrl: string, displayName: string): void {
  const img = document.getElementById('user-avatar-img') as HTMLImageElement | null;
  const nameEl = document.getElementById('user-display-name');
  if (img) {
    img.src = avatarUrl;
    img.style.display = avatarUrl ? 'block' : 'none';
  }
  if (nameEl) nameEl.textContent = displayName;
}

function showLogin(resolve: (r: LobbyResult) => void, clerkId: string, email: string, avatarUrl: string, displayName: string): void {
  setHeaderProfile(avatarUrl, displayName);
  const screen = document.getElementById('login-screen')!;
  screen.classList.remove('hidden');

  const input = document.getElementById('username-input') as HTMLInputElement;
  const btn = document.getElementById('login-btn')!;

  const submit = () => {
    const name = input.value.trim().slice(0, 16);
    if (!name) {
      input.classList.add('shake');
      setTimeout(() => input.classList.remove('shake'), 400);
      return;
    }
    localStorage.setItem(USERNAME_KEY, name);
    void saveUserToSupabase(clerkId, name, email);
    screen.classList.add('hidden');
    const lobbyScreen = document.getElementById('lobby-screen')!;
    lobbyScreen.classList.add('fade-in');
    showLobby(name, resolve, clerkId, email, avatarUrl, displayName);
  };

  btn.addEventListener('click', () => { playMenuClick(); submit(); });
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') submit(); });
  setTimeout(() => input.focus(), 50);
}

function drawCenterStage(canvas: HTMLCanvasElement, char: ClassData): void {
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const img = new Image();
  img.onload = () => {
    ctx.imageSmoothingEnabled = false;
    // Draw first frame of defaultTexture, scaled to fill the canvas
    const fw = char.frameWidth;
    const fh = char.frameHeight;
    const aspect = fh / fw;
    const destW = canvas.width;
    const destH = Math.min(canvas.height, Math.round(destW * aspect));
    const destY = Math.round((canvas.height - destH) / 2);
    ctx.drawImage(img, 0, 0, fw, fh, 0, destY, destW, destH);
  };
  img.src = `/characters/${char.defaultTexture}.png`;
}

function buildStatRow(label: string, filled: number, value: string): HTMLDivElement {
  const row = document.createElement('div');
  row.className = 'stat-row';
  const lbl = document.createElement('span');
  lbl.className = 'stat-label';
  lbl.textContent = label;
  row.appendChild(lbl);
  const dots = document.createElement('span');
  dots.className = 'stat-dots';
  for (let i = 0; i < 5; i++) {
    const dot = document.createElement('span');
    dot.className = i < filled ? 'stat-dot filled' : 'stat-dot';
    dots.appendChild(dot);
  }
  row.appendChild(dots);
  const val = document.createElement('span');
  val.className = 'stat-value';
  val.textContent = value;
  row.appendChild(val);
  return row;
}

function buildLockerGrid(
  container: HTMLElement,
  selectedKey: string,
  onSelect: (char: ClassData) => void,
): void {
  // Clean up any running animation intervals from previous grid
  container.querySelectorAll('canvas').forEach(c => {
    const id = (c as any)._animInterval;
    if (id) clearInterval(id);
  });
  container.innerHTML = '';
  const grid = document.createElement('div');
  grid.className = 'locker-grid';

  for (const char of CHARACTERS) {
    const card = document.createElement('div');
    card.className = 'char-card';
    if (char.spriteKey === selectedKey) card.classList.add('selected');
    card.dataset.key = char.spriteKey;

    const canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 320;

    const img = new Image();
    img.onload = () => {
      const ctx = canvas.getContext('2d')!;
      ctx.imageSmoothingEnabled = false;
      const fw = char.frameWidth;
      const fh = char.frameHeight;
      const totalFrames = Math.floor(img.naturalWidth / fw);
      const aspect = fh / fw;
      const destW = canvas.width;
      const destH = Math.min(canvas.height, Math.round(destW * aspect));
      const destY = Math.round((canvas.height - destH) / 2);
      let frame = 0;
      const drawFrame = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, frame * fw, 0, fw, fh, 0, destY, destW, destH);
        frame = (frame + 1) % totalFrames;
      };
      drawFrame();
      const intervalId = setInterval(drawFrame, 180);
      // Store interval so we can clean up if grid is rebuilt
      (canvas as any)._animInterval = intervalId;
    };
    img.src = `/characters/${char.defaultTexture}.png`;

    const nameEl = document.createElement('div');
    nameEl.className = 'char-card-name';
    nameEl.textContent = char.name;

    const statsEl = document.createElement('div');
    statsEl.className = 'char-card-stats';
    statsEl.appendChild(buildStatRow('Speed', char.stars.speed, `${char.speed}`));
    statsEl.appendChild(buildStatRow('Health', char.stars.health, `${char.maxHp}`));
    statsEl.appendChild(buildStatRow('Damage', char.stars.damage, `${char.attackDamage}`));

    card.append(canvas, nameEl, statsEl);

    card.addEventListener('click', () => {
      playMenuClick();
      grid.querySelectorAll('.char-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      onSelect(char);
    });

    grid.appendChild(card);
  }

  container.appendChild(grid);
}

function showLobby(username: string, resolve: (r: LobbyResult) => void, clerkId: string, _email: string, avatarUrl: string, displayName: string): void {
  const screen = document.getElementById('lobby-screen')!;
  const nameEl = document.getElementById('lobby-username')!;
  const avatarEl = document.getElementById('lobby-avatar')!;

  nameEl.textContent = username;
  avatarEl.textContent = username.slice(0, 2).toUpperCase();
  screen.classList.remove('hidden');

  // Show in-game username in the header (not the Clerk account name)
  setHeaderProfile(avatarUrl, username);

  // Fetch stats — populate both the small quick-glance row and the full stats panel
  void fetchPlayerStats(clerkId).then((stats) => {
    // Quick-glance row under character preview
    const statsEl = document.getElementById('lobby-stats');
    if (statsEl) {
      if (stats) {
        const kd = (stats.total_kills / Math.max(stats.total_deaths, 1)).toFixed(2);
        statsEl.innerHTML =
          `<span class="stat-item"><span class="stat-val">${stats.total_kills}</span><span class="stat-lbl">KILLS</span></span>` +
          `<span class="stat-item"><span class="stat-val">${stats.total_deaths}</span><span class="stat-lbl">DEATHS</span></span>` +
          `<span class="stat-item"><span class="stat-val">${kd}</span><span class="stat-lbl">K/D</span></span>` +
          `<span class="stat-item"><span class="stat-val">${stats.total_games}</span><span class="stat-lbl">GAMES</span></span>` +
          `<span class="stat-item"><span class="stat-val">${stats.total_wins}</span><span class="stat-lbl">WINS</span></span>`;
      } else {
        statsEl.innerHTML = '<span class="stat-lbl">Play a game to earn stats!</span>';
      }
    }
    // Full stats panel (populated when tab is clicked)
    renderStatsPanel(stats, username, avatarUrl);
  });

  // Change in-game name — clears stored nickname and reloads to name input
  const changeUserBtn = document.getElementById('change-user-btn')!;
  changeUserBtn.addEventListener('click', () => {
    playMenuClick();
    localStorage.removeItem(USERNAME_KEY);
    window.location.reload();
  });

  // Sign out of Clerk entirely
  const signOutBtn = document.getElementById('sign-out-btn')!;
  signOutBtn.addEventListener('click', () => {
    playMenuClick();
    localStorage.removeItem(USERNAME_KEY);
    const clerk = getClerk();
    if (clerk) {
      clerk.signOut().then(() => window.location.reload()).catch(() => window.location.reload());
    } else {
      window.location.reload();
    }
  });

  // ── Character selection ──
  const savedKey = localStorage.getItem(CHARACTER_KEY) ?? CHARACTERS[0].spriteKey;
  let classData: ClassData = CHARACTERS.find(c => c.spriteKey === savedKey) ?? CHARACTERS[0];

  const charPreview = document.getElementById('char-preview') as HTMLCanvasElement;
  const charNameLabel = document.getElementById('char-name-label')!;
  drawCenterStage(charPreview, classData);
  charNameLabel.textContent = classData.name.toUpperCase();

  // ── Nav tabs ──
  const navLobby = document.getElementById('nav-lobby')!;
  const navLocker = document.getElementById('nav-locker')!;
  const navStats = document.getElementById('nav-stats')!;
  const navLeaderboard = document.getElementById('nav-leaderboard')!;
  const lobbyStage = document.getElementById('lobby-stage')!;
  const lockerPanel = document.getElementById('locker-panel')!;
  const statsPanel = document.getElementById('stats-panel')!;
  const leaderboardPanel = document.getElementById('leaderboard-panel')!;
  let lockerBuilt = false;
  let leaderboardBuilt = false;

  const allTabs = [navLobby, navLocker, navStats, navLeaderboard];
  const allPanels = [lobbyStage, lockerPanel, statsPanel, leaderboardPanel];

  const switchTab = (activeTab: HTMLElement, activePanel: HTMLElement) => {
    allTabs.forEach(t => t.classList.remove('active'));
    allPanels.forEach(p => p.classList.add('hidden'));
    activeTab.classList.add('active');
    activePanel.classList.remove('hidden');
  };

  navLobby.addEventListener('click', () => {
    playMenuClick();
    switchTab(navLobby, lobbyStage);
  });

  navLocker.addEventListener('click', () => {
    playMenuClick();
    switchTab(navLocker, lockerPanel);
    if (!lockerBuilt) {
      buildLockerGrid(lockerPanel, classData.spriteKey, (newChar) => {
        classData = newChar;
        localStorage.setItem(CHARACTER_KEY, classData.spriteKey);
        drawCenterStage(charPreview, classData);
        charNameLabel.textContent = classData.name.toUpperCase();
      });
      lockerBuilt = true;
    }
  });

  navStats.addEventListener('click', () => {
    playMenuClick();
    switchTab(navStats, statsPanel);
  });

  navLeaderboard.addEventListener('click', () => {
    playMenuClick();
    switchTab(navLeaderboard, leaderboardPanel);
    if (!leaderboardBuilt) {
      leaderboardBuilt = true;
      void fetchLeaderboard().then(renderLeaderboardPanel);
    }
  });

  let mode: 'host' | 'join' = 'host';
  let isPrivate = false;
  let roomCode = '';
  let maxPlayers = 10;
  let gameMode = 'ffa';
  let duration = 300; // seconds — 2 min / 3 min / 5 min
  let density = 2; // 1 = few, 2 = normal, 4 = many

  // Mode buttons
  const hostBtn = document.getElementById('host-btn')!;
  const joinBtn = document.getElementById('join-btn')!;
  const playBtn = document.getElementById('play-btn') as HTMLButtonElement;

  // Sub-option panels
  const hostOptions = document.getElementById('host-options')!;
  const joinOptions = document.getElementById('join-options')!;

  // Host sub-buttons
  const publicBtn = document.getElementById('public-btn')!;
  const privateBtn = document.getElementById('private-btn')!;

  // Join sub-buttons + input
  const randomBtn = document.getElementById('random-btn')!;
  const codeBtn = document.getElementById('code-btn')!;
  const roomCodeInput = document.getElementById('room-code-input') as HTMLInputElement;

  // ── Mode switching ──
  hostBtn.addEventListener('click', () => {
    playMenuClick();
    mode = 'host';
    hostBtn.classList.add('active');
    joinBtn.classList.remove('active');
    hostOptions.classList.remove('hidden');
    joinOptions.classList.add('hidden');
    roomCode = '';
  });

  joinBtn.addEventListener('click', () => {
    playMenuClick();
    mode = 'join';
    joinBtn.classList.add('active');
    hostBtn.classList.remove('active');
    joinOptions.classList.remove('hidden');
    hostOptions.classList.add('hidden');
    isPrivate = false;
    roomCode = '';
    randomBtn.classList.add('active');
    codeBtn.classList.remove('active');
    roomCodeInput.classList.add('hidden');
    roomCodeInput.value = '';
  });

  // ── Host: public / private ──
  publicBtn.addEventListener('click', () => {
    playMenuClick();
    isPrivate = false;
    publicBtn.classList.add('active');
    privateBtn.classList.remove('active');
  });

  privateBtn.addEventListener('click', () => {
    playMenuClick();
    isPrivate = true;
    privateBtn.classList.add('active');
    publicBtn.classList.remove('active');
  });

  // ── Host: max players selector ──
  const mpBtns = [5, 10, 20, 30].map(n => document.getElementById(`mp-${n}`)!);
  mpBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      playMenuClick();
      maxPlayers = Number(btn.id.replace('mp-', ''));
      mpBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // ── Host: game duration selector ──
  const durBtns = [120, 180, 300].map(n => document.getElementById(`dur-${n}`)!);
  durBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      playMenuClick();
      duration = Number(btn.id.replace('dur-', ''));
      durBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // ── Host: item density selector ──
  const densBtns = [1, 2, 4].map(n => document.getElementById(`dens-${n}`)!);
  densBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      playMenuClick();
      density = Number(btn.id.replace('dens-', ''));
      densBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // ── Host: game mode selector ──
  const ffaBtn = document.getElementById('ffa-btn');
  const kcBtn = document.getElementById('kc-btn');
  if (ffaBtn && kcBtn) {
    ffaBtn.addEventListener('click', () => {
      playMenuClick();
      gameMode = 'ffa';
      ffaBtn.classList.add('active');
      kcBtn.classList.remove('active');
    });
    kcBtn.addEventListener('click', () => {
      playMenuClick();
      gameMode = 'killConfirmed';
      kcBtn.classList.add('active');
      ffaBtn.classList.remove('active');
    });
  }

  // ── Join status feedback ──
  const joinStatus = document.createElement('span');
  joinStatus.style.cssText = 'font-size:12px;font-weight:bold;letter-spacing:1px;min-width:130px;text-align:left;';
  joinOptions.appendChild(joinStatus);

  // ── Join: random / enter code ──
  randomBtn.addEventListener('click', () => {
    playMenuClick();
    roomCode = '';
    randomBtn.classList.add('active');
    codeBtn.classList.remove('active');
    roomCodeInput.classList.add('hidden');
    roomCodeInput.value = '';
    joinStatus.textContent = '';
    const roomBrowser = document.getElementById('room-browser');
    if (roomBrowser) roomBrowser.classList.add('hidden');
    const browseBtn = document.getElementById('browse-btn');
    if (browseBtn) browseBtn.classList.remove('active');
    if (browserInterval) { clearInterval(browserInterval); browserInterval = undefined; }
  });

  codeBtn.addEventListener('click', () => {
    playMenuClick();
    randomBtn.classList.remove('active');
    codeBtn.classList.add('active');
    roomCodeInput.classList.remove('hidden');
    roomCodeInput.focus();
    const roomBrowser = document.getElementById('room-browser');
    if (roomBrowser) roomBrowser.classList.add('hidden');
    if (browserInterval) { clearInterval(browserInterval); browserInterval = undefined; }
  });

  roomCodeInput.addEventListener('input', () => {
    roomCodeInput.value = roomCodeInput.value.toUpperCase();
    roomCode = roomCodeInput.value.trim();
    joinStatus.textContent = '';
  });

  // ── Live online player count (lobby + in-game) ──
  const onlineCountEl = document.querySelector<HTMLElement>('#online-count .count-value');
  async function refreshOnlineCount() {
    if (!onlineCountEl) return;
    const total = await getOnlineCount();
    onlineCountEl.textContent = String(total);
  }
  // Kick off presence join + an eager first fetch in parallel; when the join
  // resolves, refresh again so the bump from the current user shows immediately.
  void joinLobbyPresence().then(() => { void refreshOnlineCount(); });
  void refreshOnlineCount();
  const onlineCountInterval = window.setInterval(refreshOnlineCount, 2000);

  // ── Browse rooms ──
  const browseBtn = document.getElementById('browse-btn');
  const roomBrowser = document.getElementById('room-browser');
  let browserInterval: number | undefined;

  async function refreshRoomBrowser() {
    const container = document.getElementById('room-browser');
    if (!container) return;
    try {
      const { getAvailableRooms } = await import('./network/Network');
      const rooms = await getAvailableRooms();
      const publicRooms = rooms.filter((r: any) => !r.metadata?.isPrivate);

      container.innerHTML = '';
      if (publicRooms.length === 0) {
        container.innerHTML = '<div class="no-rooms">No open rooms found</div>';
        return;
      }

      for (const rm of publicRooms) {
        const meta = rm.metadata || {};
        const modeLabel = meta.gameMode === 'killConfirmed' ? 'KILL CONFIRMED' : 'FREEPLAY';
        const code = meta.roomCode || rm.roomId;
        const players = `${rm.clients}/${rm.maxClients}`;
        const phase = meta.phase || 'waiting';
        const isPlaying = phase === 'playing';
        const statusLabel = isPlaying ? 'IN GAME' : 'OPEN';
        const statusClass = isPlaying ? 'in-game' : 'open';

        let timeDisplay = '';
        if (isPlaying && meta.timeRemaining != null) {
          const mins = Math.floor(meta.timeRemaining / 60);
          const secs = meta.timeRemaining % 60;
          timeDisplay = `${mins}:${String(secs).padStart(2, '0')}`;
        }

        const card = document.createElement('div');
        card.className = 'room-card';
        card.innerHTML = `
          <span class="room-mode">${modeLabel}</span>
          <span class="room-code">${code}</span>
          <span class="room-players">${players}</span>
          ${timeDisplay ? `<span class="room-time">${timeDisplay}</span>` : ''}
          <span class="room-status ${statusClass}">${statusLabel}</span>
        `;
        card.addEventListener('click', () => {
          (window as any).__browserRoomId = rm.roomId;
          (window as any).__browserRoomCode = code;
          container.querySelectorAll('.room-card').forEach(c => c.classList.remove('selected'));
          card.classList.add('selected');
        });
        container.appendChild(card);
      }
    } catch (_err) {
      container.innerHTML = '<div class="no-rooms">Failed to load rooms</div>';
    }
  }

  if (browseBtn && roomBrowser) {
    browseBtn.addEventListener('click', () => {
      playMenuClick();
      roomCodeInput.classList.add('hidden');
      roomBrowser.classList.remove('hidden');

      document.querySelectorAll('#join-options .sub-btn').forEach(b => b.classList.remove('active'));
      browseBtn.classList.add('active');

      refreshRoomBrowser();
      if (browserInterval) clearInterval(browserInterval);
      browserInterval = window.setInterval(refreshRoomBrowser, 5000);
    });
  }

  // ── Play ──
  playBtn.addEventListener('click', async () => {
    playMenuClick();
    if (mode === 'join' && codeBtn.classList.contains('active') && !roomCode) {
      roomCodeInput.classList.add('shake');
      setTimeout(() => roomCodeInput.classList.remove('shake'), 400);
      roomCodeInput.focus();
      return;
    }

    const originalText = playBtn.textContent ?? '▶  PLAY';
    playBtn.disabled = true;
    playBtn.textContent = '...Searching';
    playBtn.style.color = '';

    const launchGame = async () => {
      if (browserInterval) { clearInterval(browserInterval); browserInterval = undefined; }
      clearInterval(onlineCountInterval);
      leaveLobbyPresence();
      playBtn.textContent = 'Game Found';
      playBtn.style.color = '#2ecc71';
      await delay(1000);
      screen.classList.add('hidden');
      document.getElementById('game-container')!.style.display = 'flex';
    };

    const resetBtn = () => {
      playBtn.disabled = false;
      playBtn.textContent = originalText;
      playBtn.style.color = '';
    };

    if (mode === 'host') {
      try {
        await createRoom(username, isPrivate, classData.spriteKey, maxPlayers, clerkId, gameMode, duration, density);
        await launchGame();
        resolve({ username, clerkId, mode, isPrivate, roomCode, classData, gameMode });
      } catch (err) {
        console.error('[Campus Clash] createRoom failed:', err);
        playBtn.textContent = 'Connection Failed';
        playBtn.style.color = '#e63946';
        setTimeout(resetBtn, 2500);
      }
      return;
    }

    if (mode === 'join' && randomBtn.classList.contains('active')) {
      try {
        await joinAnyRoom(username, classData.spriteKey, clerkId);
        await launchGame();
        resolve({ username, clerkId, mode, isPrivate, roomCode, classData, gameMode });
      } catch (err) {
        console.error('[Campus Clash] joinAnyRoom failed:', err);
        joinStatus.textContent = 'No Rooms Available';
        joinStatus.style.color = '#e63946';
        setTimeout(() => { joinStatus.textContent = ''; }, 3000);
        resetBtn();
      }
      return;
    }

    // Join via room browser
    if ((window as any).__browserRoomId && browseBtn?.classList.contains('active')) {
      try {
        const { joinRoomById } = await import('./network/Network');
        await joinRoomById(
          (window as any).__browserRoomId,
          username,
          classData.spriteKey,
          clerkId,
        );
        if (browserInterval) { clearInterval(browserInterval); browserInterval = undefined; }
        (window as any).__browserRoomId = undefined;
        (window as any).__browserRoomCode = undefined;
        await launchGame();
        resolve({ username, clerkId, mode, isPrivate, roomCode, classData, gameMode });
      } catch (err) {
        console.error('[Campus Clash] joinRoomById failed:', err);
        joinStatus.textContent = 'Failed to Join';
        joinStatus.style.color = '#e63946';
        setTimeout(() => { joinStatus.textContent = ''; }, 3000);
        resetBtn();
      }
      return;
    }

    // Join by code — re-read input to ensure latest value, trimmed and uppercased
    roomCode = roomCodeInput.value.trim().toUpperCase();
    joinStatus.textContent = '';
    try {
      await joinRoom(roomCode, username, classData.spriteKey, clerkId);
      joinStatus.textContent = 'Game Found';
      joinStatus.style.color = '#2ecc71';
      await launchGame();
      resolve({ username, clerkId, mode, isPrivate, roomCode, classData, gameMode });
    } catch (err) {
      console.error('[Campus Clash] joinRoom failed:', err);
      joinStatus.textContent = 'Lobby Not Found';
      joinStatus.style.color = '#e63946';
      setTimeout(() => { joinStatus.textContent = ''; }, 3000);
      resetBtn();
    }
  });
}

function renderStatsPanel(stats: PlayerStats | null, username: string, avatarUrl: string): void {
  const container = document.getElementById('stats-panel-content');
  if (!container) return;

  if (!stats) {
    container.className = 'stats-empty';
    container.innerHTML =
      `<div class="stats-empty-icon">🎮</div>` +
      `<p class="stats-empty-msg">No stats yet.</p>` +
      `<p class="stats-empty-sub">Play your first game to start tracking!</p>`;
    return;
  }

  const kd = (stats.total_kills / Math.max(stats.total_deaths, 1)).toFixed(2);
  const winRate = stats.total_games > 0
    ? ((stats.total_wins / stats.total_games) * 100).toFixed(1)
    : '0.0';
  const avgKills = stats.total_games > 0
    ? (stats.total_kills / stats.total_games).toFixed(1)
    : '0.0';

  container.className = 'stats-grid';
  container.innerHTML = `
    <div class="stats-profile-row">
      ${avatarUrl ? `<img class="stats-avatar" src="${avatarUrl}" alt="avatar" />` : ''}
      <div class="stats-profile-name">${username.toUpperCase()}</div>
    </div>

    <div class="stats-divider"></div>

    <div class="stats-row-label">COMBAT</div>
    <div class="stats-cards">
      <div class="stats-card">
        <div class="stats-card-val">${stats.total_kills}</div>
        <div class="stats-card-lbl">TOTAL KILLS</div>
      </div>
      <div class="stats-card">
        <div class="stats-card-val">${stats.total_deaths}</div>
        <div class="stats-card-lbl">TOTAL DEATHS</div>
      </div>
      <div class="stats-card stats-card-highlight">
        <div class="stats-card-val">${kd}</div>
        <div class="stats-card-lbl">K / D RATIO</div>
      </div>
      <div class="stats-card">
        <div class="stats-card-val">${avgKills}</div>
        <div class="stats-card-lbl">AVG KILLS/GAME</div>
      </div>
    </div>

    <div class="stats-divider"></div>

    <div class="stats-row-label">OVERALL</div>
    <div class="stats-cards">
      <div class="stats-card">
        <div class="stats-card-val">${stats.total_games}</div>
        <div class="stats-card-lbl">GAMES PLAYED</div>
      </div>
      <div class="stats-card">
        <div class="stats-card-val">${stats.total_wins}</div>
        <div class="stats-card-lbl">WINS</div>
      </div>
      <div class="stats-card stats-card-highlight">
        <div class="stats-card-val">${winRate}%</div>
        <div class="stats-card-lbl">WIN RATE</div>
      </div>
    </div>
  `;
}

function renderLeaderboardPanel(entries: LeaderboardEntry[]): void {
  const container = document.getElementById('leaderboard-content');
  if (!container) return;

  if (!entries.length) {
    container.className = 'stats-empty';
    container.innerHTML =
      `<div class="stats-empty-icon">🏆</div>` +
      `<p class="stats-empty-msg">No data yet.</p>` +
      `<p class="stats-empty-sub">Play a game to get on the board!</p>`;
    return;
  }

  container.className = '';
  container.innerHTML = `
    <table class="leaderboard-table">
      <thead>
        <tr>
          <th>#</th>
          <th>PLAYER</th>
          <th>KILLS</th>
          <th>DEATHS</th>
          <th>K/D</th>
          <th>WINS</th>
          <th>GAMES</th>
        </tr>
      </thead>
      <tbody>
        ${entries.map((e, i) => {
          const kd = (e.total_kills / Math.max(e.total_deaths, 1)).toFixed(2);
          const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`;
          return `<tr class="${i < 3 ? 'leaderboard-top' : ''}">
            <td>${medal}</td>
            <td>${e.username}</td>
            <td>${e.total_kills}</td>
            <td>${e.total_deaths}</td>
            <td>${kd}</td>
            <td>${e.total_wins}</td>
            <td>${e.total_games}</td>
          </tr>`;
        }).join('')}
      </tbody>
    </table>
  `;
}
