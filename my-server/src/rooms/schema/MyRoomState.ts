import { Schema, MapSchema, type } from "@colyseus/schema";

export class PlayerState extends Schema {
  @type("number") x: number = 0;
  @type("number") y: number = 0;
  @type("number") color: number = 0x3498db;
  @type("string") name: string = "";
  @type("number") hp: number = 100;
  @type("number") maxHp: number = 100;
  @type("boolean") alive: boolean = true;
  @type("number") kills: number = 0;
  @type("number") deaths: number = 0;
  @type("number") confirmedKills: number = 0;
  @type("string") spriteKey: string = "archer";
}

export class MyRoomState extends Schema {
  @type({ map: PlayerState }) players = new MapSchema<PlayerState>();
  @type("boolean") gameOver: boolean = false;
  @type("string") phase: string = "waiting";
  @type("number") maxPlayers: number = 10;
  @type("string") roomCode: string = "";
  @type("string") hostSessionId: string = "";
  @type("number") gameEndTime: number = 0;
  @type("number") timeRemaining: number = 0;
  @type("boolean") timeLimitReached: boolean = false;
  @type("number") pickupSeed: number = 0;
  @type("string") gameMode: string = "ffa";
  @type("number") scoreLimit: number = 0;
  @type("number") gameDuration: number = 300; // seconds
  @type("number") density: number = 1; // 1=few, 2=normal, 4=many
}
