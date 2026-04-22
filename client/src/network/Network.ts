import { Client, Room } from '@colyseus/sdk';

const SERVER_URL = import.meta.env.VITE_SERVER_URL ?? `ws://${window.location.hostname}:2567`;
const TOKEN_KEY = 'cc_reconnectionToken';

let client: Client | null = null;
let room: Room;

function initClient(): Client {
  // Always create a fresh Client — reusing a stale one after a failed WebSocket
  // handshake can leave internal state broken, causing repeated connection failures.
  client = new Client(SERVER_URL);
  return client;
}

function setupRoom(r: Room): Room {
  room = r;
  console.log('Connected to room', room.roomId);
  console.log('Session ID:', room.sessionId);

  // Store reconnection token for page refresh recovery
  sessionStorage.setItem(TOKEN_KEY, room.reconnectionToken);

  // Leave the room cleanly when the tab is closed or refreshed
  const leaveOnUnload = () => { try { room.leave(true); } catch {} };
  window.addEventListener('beforeunload', leaveOnUnload);

  room.onLeave((code) => {
    window.removeEventListener('beforeunload', leaveOnUnload);
    console.log('Left room. Code:', code);
    // Code 1000 = normal close (intentional leave)
    if (code === 1000) {
      clearReconnectionData();
    }
  });

  room.onError((code, message) => {
    console.error('Room error:', code, message);
  });

  return room;
}

export async function autoJoin(name: string, spriteKey = 'adventurer'): Promise<Room> {
  const c = initClient();
  const r = await c.joinOrCreate('my_room', { name, spriteKey });
  return setupRoom(r);
}

export async function createRoom(name: string, isPrivate = false, spriteKey = 'adventurer', maxPlayers = 10, clerkId = '', gameMode = 'ffa', duration = 300, density = 1): Promise<Room> {
  const c = initClient();
  const r = await c.create('my_room', { name, isPrivate, spriteKey, maxPlayers, clerkId, gameMode, duration, density });
  return setupRoom(r);
}

export async function joinRoom(roomCode: string, name: string, spriteKey = 'adventurer', clerkId = ''): Promise<Room> {
  const c = initClient();
  const r = await c.joinById(roomCode.trim().toUpperCase(), { name, spriteKey, clerkId });
  return setupRoom(r);
}

export async function reconnect(): Promise<Room> {
  const token = sessionStorage.getItem(TOKEN_KEY);
  if (!token) throw new Error('No reconnection token found');

  const c = initClient();
  try {
    const r = await c.reconnect(token);
    return setupRoom(r);
  } catch (err) {
    clearReconnectionData();
    throw err;
  }
}

export function hasReconnectionToken(): boolean {
  return !!sessionStorage.getItem(TOKEN_KEY);
}

export function clearReconnectionData(): void {
  sessionStorage.removeItem(TOKEN_KEY);
}

export function getRoom(): Room | undefined {
  return room;
}

export async function joinAnyRoom(name: string, spriteKey = 'adventurer', clerkId = ''): Promise<Room> {
  const c = initClient();
  const r = await c.join('my_room', { name, isPrivate: false, spriteKey, clerkId });
  return setupRoom(r);
}

export function sendPosition(x: number, y: number): void {
  if (!room) return;
  room.send('move', { x, y });
}

export function sendAttack(targetId: string, dirX: number, dirY: number): void {
  if (!room) return;
  room.send('attack', { targetId, dirX, dirY });
}

export function sendSwing(dirX: number, dirY: number): void {
  if (!room) return;
  room.send('swing', { dirX, dirY });
}

export function sendFireball(targetId: string, dirX: number, dirY: number): void {
  if (!room) return;
  room.send('fireball', { targetId, dirX, dirY });
}

export function sendFireballLaunched(x: number, y: number, dirX: number, dirY: number): void {
  if (!room) return;
  room.send('fireballLaunched', { x, y, dirX, dirY });
}

export function sendPickupCollect(type: string, idx: number): void {
  if (!room) return;
  room.send('pickupCollect', { type, idx });
}

export function sendPickupRespawnPos(type: string, idx: number, wx: number, wy: number): void {
  if (!room) return;
  room.send('pickupRespawnPos', { type, idx, wx, wy });
}

export function sendBombDropped(x: number, y: number): void {
  if (!room) return;
  room.send('bombDropped', { x, y });
}

export function sendEndGame(): void {
  if (!room) return;
  room.send('endGame');
}

export function sendStartGame(): void {
  if (!room) return;
  room.send('startGame');
}

export async function getAvailableRooms(): Promise<any[]> {
  const httpUrl = SERVER_URL.replace('wss://', 'https://').replace('ws://', 'http://');
  const res = await fetch(`${httpUrl}/api/rooms`);
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export async function getOnlineCount(): Promise<number> {
  const httpUrl = SERVER_URL.replace('wss://', 'https://').replace('ws://', 'http://');
  try {
    const res = await fetch(`${httpUrl}/api/online`);
    const data = await res.json();
    return typeof data?.total === 'number' ? data.total : 0;
  } catch {
    return 0;
  }
}

let lobbyPresenceRoom: Room | undefined;
let lobbyPresencePending = false;
let lobbyShouldLeave = false;

export async function joinLobbyPresence(): Promise<void> {
  if (lobbyPresenceRoom || lobbyPresencePending) return;
  lobbyPresencePending = true;
  lobbyShouldLeave = false;
  try {
    const c = initClient();
    const room = await c.joinOrCreate('lobby_room');
    if (lobbyShouldLeave) {
      // leave() was called while we were connecting — disconnect immediately
      try { room.leave(true); } catch {}
    } else {
      lobbyPresenceRoom = room;
      room.onLeave(() => { lobbyPresenceRoom = undefined; });
    }
  } catch (err) {
    console.warn('lobby presence join failed', err);
  } finally {
    lobbyPresencePending = false;
  }
}

export function leaveLobbyPresence(): void {
  if (lobbyPresencePending) {
    lobbyShouldLeave = true;
    return;
  }
  if (!lobbyPresenceRoom) return;
  try { lobbyPresenceRoom.leave(true); } catch {}
  lobbyPresenceRoom = undefined;
}

export async function joinRoomById(roomId: string, name: string, spriteKey = 'adventurer', clerkId = ''): Promise<Room> {
  const c = initClient();
  const r = await c.joinById(roomId, { name, spriteKey, clerkId });
  return setupRoom(r);
}

export function sendTagCollect(tagId: number): void {
  if (!room) return;
  room.send('collectTag', { tagId });
}

export function leaveRoom(): void {
  if (!room) return;
  clearReconnectionData();
  try { room.leave(true); } catch {} // fire-and-forget; don't await (hangs when socket already closed)
}
