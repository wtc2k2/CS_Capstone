import { Room } from "colyseus";

/**
 * Lightweight presence room. Every client that lands on the lobby screen
 * joins this room so the total online count includes lobby visitors, not
 * just players already in a game. No state, no messages — purely presence.
 */
export class LobbyRoom extends Room {
  maxClients = 200;

  onCreate(): void {
    this.autoDispose = true;
  }

  onJoin(): void {}

  onLeave(): void {}
}
