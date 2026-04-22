import { Clerk as ClerkClass } from '@clerk/clerk-js';

// Cast through unknown so TypeScript doesn't complain about the namespace type.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ClerkCtor = ClerkClass as unknown as new (key: string) => any;

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string;

// Convert the WebSocket server URL to HTTP for REST API calls.
// wss://host → https://host  |  ws://host:port → http://host:port
const WS_URL = import.meta.env.VITE_SERVER_URL ?? 'ws://localhost:2567';
export const SERVER_HTTP = WS_URL.replace(/^wss:\/\//, 'https://').replace(/^ws:\/\//, 'http://');

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let clerkInstance: any = null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function loadClerk(): Promise<any> {
  if (clerkInstance) return clerkInstance;
  if (!PUBLISHABLE_KEY) throw new Error('VITE_CLERK_PUBLISHABLE_KEY is not set');
  clerkInstance = new ClerkCtor(PUBLISHABLE_KEY);
  await clerkInstance.load({
    appearance: {
      variables: {
        colorPrimary: '#c41230',
        colorBackground: '#0a0a0a',
        colorInputBackground: '#111111',
        colorInputText: '#ffffff',
        colorText: '#ffffff',
        colorTextSecondary: '#888888',
        colorDanger: '#ff4444',
        borderRadius: '0px',
        fontFamily: "'Press Start 2P', 'Courier New', monospace",
        fontSize: '11px',
      },
      elements: {
        card: {
          backgroundColor: '#0a0a0a',
          border: '3px solid #c41230',
          boxShadow: '6px 6px 0 #000',
          borderRadius: '0',
        },
        headerTitle: {
          color: '#c41230',
          fontFamily: "'Press Start 2P', monospace",
          textTransform: 'uppercase',
          letterSpacing: '2px',
        },
        headerSubtitle: {
          color: '#666676',
          fontFamily: "'Press Start 2P', monospace",
          fontSize: '8px',
        },
        formButtonPrimary: {
          backgroundColor: '#c41230',
          border: '2px solid #8a0a20',
          borderRadius: '0',
          fontFamily: "'Press Start 2P', monospace",
          fontSize: '10px',
          letterSpacing: '1px',
          textTransform: 'uppercase',
          boxShadow: '3px 3px 0 #000',
        },
        formButtonPrimary__hover: {
          backgroundColor: '#a00f28',
        },
        formFieldInput: {
          backgroundColor: '#111111',
          border: '2px solid #2a2a2a',
          borderRadius: '0',
          color: '#ffffff',
          fontFamily: "'Press Start 2P', monospace",
          fontSize: '10px',
        },
        formFieldInput__focused: {
          borderColor: '#c41230',
          boxShadow: '0 0 0 1px #c41230',
        },
        formFieldLabel: {
          color: '#888888',
          fontFamily: "'Press Start 2P', monospace",
          fontSize: '8px',
          letterSpacing: '1px',
          textTransform: 'uppercase',
        },
        footerActionLink: {
          color: '#c41230',
          fontFamily: "'Press Start 2P', monospace",
          fontSize: '8px',
        },
        footerActionText: {
          color: '#666676',
          fontFamily: "'Press Start 2P', monospace",
          fontSize: '8px',
        },
        socialButtonsBlockButton: {
          backgroundColor: '#111111',
          border: '2px solid #2a2a2a',
          borderRadius: '0',
          color: '#ffffff',
          fontFamily: "'Press Start 2P', monospace",
          fontSize: '9px',
        },
        socialButtonsBlockButton__hover: {
          backgroundColor: '#1a1a1a',
          borderColor: '#c41230',
        },
        dividerLine: {
          backgroundColor: '#2a2a2a',
        },
        dividerText: {
          color: '#666676',
          fontFamily: "'Press Start 2P', monospace",
          fontSize: '8px',
        },
        identityPreview: {
          backgroundColor: '#111111',
          border: '2px solid #2a2a2a',
          borderRadius: '0',
        },
        identityPreviewText: {
          color: '#ffffff',
          fontFamily: "'Press Start 2P', monospace",
        },
        userButtonPopoverCard: {
          backgroundColor: '#0a0a0a',
          border: '2px solid #c41230',
          borderRadius: '0',
        },
      },
    },
  });
  return clerkInstance;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getClerk(): any {
  return clerkInstance;
}

/** Returns a fresh Clerk JWT for the active session (tokens expire). */
export async function getClerkToken(): Promise<string | null> {
  if (!clerkInstance?.session) return null;
  try {
    return await clerkInstance.session.getToken();
  } catch {
    return null;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function requireAuth(): Promise<any> {
  const clerk = await loadClerk();
  if (!clerk.user) {
    await clerk.redirectToSignIn({ redirectUrl: window.location.href });
    await new Promise(() => {}); // page navigates away
  }
  return clerk;
}

// ── Server-backed DB helpers ──────────────────────────────────────────────────

/**
 * Sync the authenticated user's record to the database via the game server.
 * Called once on every login. The server upserts the row via Prisma.
 */
export async function saveUserToSupabase(
  clerkId: string,
  username: string,
  email: string,
): Promise<void> {
  try {
    const res = await fetch(`${SERVER_HTTP}/api/users/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clerkId, username, email }),
    });
    if (!res.ok) console.error('[auth] user sync error:', await res.text());
  } catch (err) {
    console.error('[auth] user sync failed:', err);
  }
}

// ── Player stats ──────────────────────────────────────────────────────────────

export interface PlayerStats {
  total_kills: number;
  total_deaths: number;
  total_games: number;
  total_wins: number;
}

/**
 * Fetch a player's cumulative stats from the game server.
 * Returns null if no stats row exists yet.
 */
export async function fetchPlayerStats(clerkId: string): Promise<PlayerStats | null> {
  try {
    const res = await fetch(`${SERVER_HTTP}/api/stats/${encodeURIComponent(clerkId)}`);
    if (!res.ok) return null;
    return await res.json() as PlayerStats | null;
  } catch (err) {
    console.error('[stats] fetch failed:', err);
    return null;
  }
}

export interface LeaderboardEntry {
  username: string;
  total_kills: number;
  total_deaths: number;
  total_wins: number;
  total_games: number;
  ffa_kills?: number;
  ffa_deaths?: number;
  ffa_wins?: number;
  ffa_games?: number;
  kc_confirms?: number;
  kc_kills?: number;
  kc_deaths?: number;
  kc_wins?: number;
  kc_games?: number;
}

export async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  try {
    const res = await fetch(`${SERVER_HTTP}/api/leaderboard`);
    if (!res.ok) return [];
    return await res.json() as LeaderboardEntry[];
  } catch (err) {
    console.error('[leaderboard] fetch failed:', err);
    return [];
  }
}
