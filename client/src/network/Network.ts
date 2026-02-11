import { Client, Room } from '@colyseus/sdk';

const SERVER_URL = 'ws://localhost:2567';

let client: Client;
let room: Room;

export async function connect(): Promise<Room> {
  client = new Client(SERVER_URL);
  room = await client.joinOrCreate('my_room');

  console.log('Connected to room', room.roomId);
  console.log('Session ID:', room.sessionId);

  room.onStateChange((state) => {
    console.log('Room state:', JSON.stringify(state));
  });

  room.onLeave((code) => {
    console.log('Left room. Code:', code);
  });

  room.onError((code, message) => {
    console.error('Room error:', code, message);
  });

  return room;
}

export function getRoom(): Room | undefined {
  return room;
}
