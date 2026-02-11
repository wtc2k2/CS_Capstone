var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __typeError = (msg) => {
  throw TypeError(msg);
};
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target2) => (target2 = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target2, "default", { value: mod, enumerable: true }) : target2,
  mod
));
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateAdd = (obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
var __privateSet = (obj, member, value, setter) => (__accessCheck(obj, member, "write to private field"), setter ? setter.call(obj, value) : member.set(obj, value), value);

// node_modules/ws/browser.js
var require_browser = __commonJS({
  "node_modules/ws/browser.js"(exports, module) {
    "use strict";
    module.exports = function() {
      throw new Error(
        "ws does not work in the browser. Browser clients must use the native WebSocket object"
      );
    };
  }
});

// phaser-global:phaser
var phaser_default = globalThis.Phaser;

// src/map/CampusMap.ts
var TILE = {
  GRASS: 0,
  PATH: 1,
  BUILDING: 2,
  FIELD: 3
};
var TILE_SIZE = 16;
var MAP_W = 150;
var MAP_H = 105;
var BUILDINGS = [
  { name: "Field", x: 4, y: 5, w: 15, h: 38, color: 2984526 },
  { name: "Stadium", x: 26, y: 8, w: 7, h: 13, color: 8019002 },
  { name: "Arena", x: 55, y: 2, w: 40, h: 22, color: 9127187 },
  { name: "Craton", x: 38, y: 30, w: 13, h: 10, color: 5597999 },
  { name: "Robey", x: 26, y: 43, w: 8, h: 14, color: 7029286 },
  { name: "Round Table", x: 60, y: 47, w: 10, h: 8, color: 9136404 },
  { name: "Library", x: 4, y: 76, w: 15, h: 12, color: 4878475 },
  { name: "Academic", x: 33, y: 72, w: 17, h: 12, color: 6253390 },
  { name: "Main Hall", x: 62, y: 70, w: 32, h: 24, color: 9109504 },
  { name: "PAC", x: 100, y: 55, w: 9, h: 16, color: 4915330 }
];
function hPath(grid, y, x1, x2, width = 3) {
  const startX = Math.min(x1, x2);
  const endX = Math.max(x1, x2);
  for (let x = startX; x <= endX; x++) {
    for (let w = 0; w < width; w++) {
      const py = y + w;
      if (py < MAP_H && x < MAP_W && grid[py][x] === TILE.GRASS) {
        grid[py][x] = TILE.PATH;
      }
    }
  }
}
function vPath(grid, x, y1, y2, width = 3) {
  const startY = Math.min(y1, y2);
  const endY = Math.max(y1, y2);
  for (let y = startY; y <= endY; y++) {
    for (let w = 0; w < width; w++) {
      const px = x + w;
      if (y < MAP_H && px < MAP_W && grid[y][px] === TILE.GRASS) {
        grid[y][px] = TILE.PATH;
      }
    }
  }
}
function generateMap() {
  const grid = [];
  for (let y = 0; y < MAP_H; y++) {
    grid[y] = [];
    for (let x = 0; x < MAP_W; x++) {
      grid[y][x] = TILE.GRASS;
    }
  }
  for (const b of BUILDINGS) {
    for (let dy = 0; dy < b.h; dy++) {
      for (let dx = 0; dx < b.w; dx++) {
        const tx = b.x + dx;
        const ty = b.y + dy;
        if (tx < MAP_W && ty < MAP_H) {
          grid[ty][tx] = b.name === "Field" ? TILE.FIELD : TILE.BUILDING;
        }
      }
    }
  }
  hPath(grid, 14, 33, 55, 3);
  vPath(grid, 29, 21, 30, 3);
  hPath(grid, 34, 51, 90, 3);
  vPath(grid, 90, 24, 50, 3);
  vPath(grid, 29, 40, 72, 3);
  hPath(grid, 43, 34, 38, 3);
  hPath(grid, 57, 31, 50, 3);
  vPath(grid, 50, 57, 72, 3);
  hPath(grid, 80, 19, 29, 3);
  hPath(grid, 72, 29, 33, 3);
  hPath(grid, 76, 50, 62, 3);
  vPath(grid, 65, 55, 70, 3);
  hPath(grid, 51, 70, 100, 3);
  vPath(grid, 104, 71, 80, 3);
  hPath(grid, 80, 94, 104, 3);
  hPath(grid, 85, 94, 109, 3);
  return grid;
}
var MAP_DATA = generateMap();
function isWalkable(tileX, tileY) {
  if (tileX < 0 || tileX >= MAP_W || tileY < 0 || tileY >= MAP_H) {
    return false;
  }
  const tile = MAP_DATA[tileY][tileX];
  return tile === TILE.GRASS || tile === TILE.PATH || tile === TILE.FIELD;
}

// src/data/Classes.ts
var DEFAULT_CLASS = {
  name: "Fighter",
  color: 15087942,
  maxHp: 100,
  speed: 110,
  attackDamage: 20,
  attackRange: 30,
  attackRate: 500,
  weaponName: "Sword"
};

// src/entities/Player.ts
var Player = class {
  constructor(scene, x, y, classData) {
    this.lastAttackTime = 0;
    this.isDashing = false;
    this.dashStartTime = 0;
    this.dashCooldown = 0;
    this.facingX = 0;
    this.facingY = 1;
    this.scene = scene;
    this.classData = classData;
    this.hp = classData.maxHp;
    this.maxHp = classData.maxHp;
    this.speed = classData.speed;
    this.attackDamage = classData.attackDamage;
    this.attackRange = classData.attackRange;
    this.attackRate = classData.attackRate;
    this.sprite = scene.add.container(x, y);
    this.sprite.setSize(14, 14);
    this.body = scene.add.graphics();
    this.drawBodyColor(classData.color);
    this.sprite.add(this.body);
    this.eyes = scene.add.graphics();
    this.drawEyes();
    this.sprite.add(this.eyes);
    this.sprite.setDepth(10);
  }
  drawBodyColor(color) {
    this.body.clear();
    this.body.fillStyle(color, 1);
    this.body.fillRect(-7, -7, 14, 14);
    this.body.lineStyle(1, 0, 1);
    this.body.strokeRect(-7, -7, 14, 14);
  }
  drawEyes() {
    this.eyes.clear();
    this.eyes.fillStyle(16777215, 1);
    let ex1, ey1, ex2, ey2;
    if (this.facingY < 0) {
      ex1 = -3;
      ey1 = -4;
      ex2 = 3;
      ey2 = -4;
    } else if (this.facingY > 0) {
      ex1 = -3;
      ey1 = 2;
      ex2 = 3;
      ey2 = 2;
    } else if (this.facingX < 0) {
      ex1 = -4;
      ey1 = -2;
      ex2 = -4;
      ey2 = 3;
    } else {
      ex1 = 4;
      ey1 = -2;
      ex2 = 4;
      ey2 = 3;
    }
    this.eyes.fillCircle(ex1, ey1, 1.5);
    this.eyes.fillCircle(ex2, ey2, 1.5);
  }
  update(time, delta, cursors) {
    let vx = 0;
    let vy = 0;
    if (cursors.left.isDown) vx = -1;
    else if (cursors.right.isDown) vx = 1;
    if (cursors.up.isDown) vy = -1;
    else if (cursors.down.isDown) vy = 1;
    if (vx !== 0 || vy !== 0) {
      this.facingX = vx;
      this.facingY = vy;
      this.drawEyes();
    }
    if (this.isDashing && time - this.dashStartTime > 150) {
      this.isDashing = false;
    }
    if (this.dashCooldown > 0) {
      this.dashCooldown -= delta;
    }
    const speedMult = this.isDashing ? 3 : 1;
    let moveX = vx;
    let moveY = vy;
    if (moveX !== 0 && moveY !== 0) {
      moveX *= 0.707;
      moveY *= 0.707;
    }
    const dist = this.speed * speedMult * (delta / 1e3);
    const newX = this.sprite.x + moveX * dist;
    const newY = this.sprite.y + moveY * dist;
    const half = 6;
    if (this.canMove(newX, this.sprite.y, half)) {
      this.sprite.x = newX;
    }
    if (this.canMove(this.sprite.x, newY, half)) {
      this.sprite.y = newY;
    }
  }
  canMove(px, py, half) {
    const corners = [
      { x: px - half, y: py - half },
      { x: px + half, y: py - half },
      { x: px - half, y: py + half },
      { x: px + half, y: py + half }
    ];
    for (const c of corners) {
      const tx = Math.floor(c.x / TILE_SIZE);
      const ty = Math.floor(c.y / TILE_SIZE);
      if (!isWalkable(tx, ty)) return false;
    }
    return true;
  }
  dash(time) {
    if (this.dashCooldown > 0 || this.isDashing) return;
    this.isDashing = true;
    this.dashStartTime = time;
    this.dashCooldown = 3e3;
    this.drawBodyColor(16777215);
    this.scene.time.delayedCall(100, () => {
      this.drawBodyColor(this.classData.color);
    });
  }
  tryAttack(time, dummies) {
    if (time - this.lastAttackTime < this.attackRate) return;
    let hit = false;
    for (const dummy of dummies) {
      if (!dummy.alive) continue;
      const dist = phaser_default.Math.Distance.Between(
        this.sprite.x,
        this.sprite.y,
        dummy.sprite.x,
        dummy.sprite.y
      );
      if (dist <= this.attackRange) {
        dummy.takeDamage(this.attackDamage);
        hit = true;
      }
    }
    if (hit) {
      this.lastAttackTime = time;
      this.showAttackVisual();
    }
  }
  showAttackVisual() {
    const g = this.scene.add.graphics();
    const sx = this.sprite.x + this.facingX * 14;
    const sy = this.sprite.y + this.facingY * 14;
    g.fillStyle(16777215, 0.8);
    g.fillCircle(sx, sy, 6);
    g.setDepth(11);
    this.scene.time.delayedCall(100, () => g.destroy());
  }
  takeDamage(amount) {
    this.hp = Math.max(0, this.hp - amount);
    this.drawBodyColor(16711680);
    this.scene.time.delayedCall(100, () => {
      this.drawBodyColor(this.classData.color);
    });
    this.scene.events.emit("playerHpChanged", this.hp, this.maxHp);
  }
  get x() {
    return this.sprite.x;
  }
  get y() {
    return this.sprite.y;
  }
};

// src/entities/Dummy.ts
var Dummy = class {
  constructor(scene, x, y) {
    this.scene = scene;
    this.maxHp = 60;
    this.hp = this.maxHp;
    this.alive = true;
    this.spawnX = x;
    this.spawnY = y;
    this.sprite = scene.add.container(x, y);
    this.body = scene.add.graphics();
    this.drawBody(8947848);
    this.sprite.add(this.body);
    const hpBarBg = scene.add.graphics();
    hpBarBg.fillStyle(3355443, 1);
    hpBarBg.fillRect(-10, -16, 20, 4);
    this.sprite.add(hpBarBg);
    this.hpBarFill = scene.add.graphics();
    this.updateHpBar();
    this.sprite.add(this.hpBarFill);
    this.sprite.setDepth(5);
  }
  drawBody(color) {
    this.body.clear();
    this.body.fillStyle(color, 1);
    this.body.fillRect(-7, -7, 14, 14);
    this.body.lineStyle(1, 0, 1);
    this.body.strokeRect(-7, -7, 14, 14);
    this.body.lineStyle(2, 16711680, 0.6);
    this.body.lineBetween(-4, -4, 4, 4);
    this.body.lineBetween(-4, 4, 4, -4);
  }
  updateHpBar() {
    this.hpBarFill.clear();
    const ratio = this.hp / this.maxHp;
    const color = ratio > 0.5 ? 65280 : ratio > 0.25 ? 16776960 : 16711680;
    this.hpBarFill.fillStyle(color, 1);
    this.hpBarFill.fillRect(-10, -16, Math.floor(20 * ratio), 4);
  }
  takeDamage(amount) {
    if (!this.alive) return;
    this.hp = Math.max(0, this.hp - amount);
    this.updateHpBar();
    this.drawBody(16711680);
    this.scene.time.delayedCall(120, () => {
      if (this.alive) this.drawBody(8947848);
    });
    if (this.hp <= 0) this.die();
  }
  die() {
    this.alive = false;
    this.sprite.setVisible(false);
    this.scene.time.delayedCall(5e3, () => this.respawn());
  }
  respawn() {
    this.hp = this.maxHp;
    this.alive = true;
    this.sprite.setPosition(this.spawnX, this.spawnY);
    this.sprite.setVisible(true);
    this.drawBody(8947848);
    this.updateHpBar();
  }
};

// node_modules/@colyseus/sdk/build/legacy.mjs
if (!ArrayBuffer.isView) {
  ArrayBuffer.isView = (a) => {
    return a !== null && typeof a === "object" && a.buffer instanceof ArrayBuffer;
  };
}
if (typeof globalThis === "undefined" && typeof window !== "undefined") {
  window["globalThis"] = window;
}
if (typeof FormData === "undefined") {
  globalThis["FormData"] = class {
  };
}

// node_modules/@colyseus/shared-types/build/Protocol.mjs
var Protocol = {
  // Room-related (10~19)
  JOIN_ROOM: 10,
  ERROR: 11,
  LEAVE_ROOM: 12,
  ROOM_DATA: 13,
  ROOM_STATE: 14,
  ROOM_STATE_PATCH: 15,
  ROOM_DATA_SCHEMA: 16,
  // DEPRECATED: used to send schema instances via room.send()
  ROOM_DATA_BYTES: 17,
  PING: 18
};
var CloseCode = {
  NORMAL_CLOSURE: 1e3,
  GOING_AWAY: 1001,
  NO_STATUS_RECEIVED: 1005,
  ABNORMAL_CLOSURE: 1006,
  CONSENTED: 4e3,
  SERVER_SHUTDOWN: 4001,
  WITH_ERROR: 4002,
  FAILED_TO_RECONNECT: 4003,
  MAY_TRY_RECONNECT: 4010
};

// node_modules/@colyseus/sdk/build/errors/Errors.mjs
var ServerError = class extends Error {
  constructor(code, message, opts) {
    super(message);
    __publicField(this, "code");
    __publicField(this, "headers");
    __publicField(this, "status");
    __publicField(this, "response");
    __publicField(this, "data");
    this.name = "ServerError";
    this.code = code;
    if (opts) {
      this.headers = opts.headers;
      this.status = opts.status;
      this.response = opts.response;
      this.data = opts.data;
    }
  }
};
var MatchMakeError = class _MatchMakeError extends Error {
  constructor(message, code) {
    super(message);
    __publicField(this, "code");
    this.code = code;
    this.name = "MatchMakeError";
    Object.setPrototypeOf(this, _MatchMakeError.prototype);
  }
};

// node_modules/@colyseus/schema/build/index.mjs
var SWITCH_TO_STRUCTURE = 255;
var TYPE_ID = 213;
var OPERATION;
(function(OPERATION2) {
  OPERATION2[OPERATION2["ADD"] = 128] = "ADD";
  OPERATION2[OPERATION2["REPLACE"] = 0] = "REPLACE";
  OPERATION2[OPERATION2["DELETE"] = 64] = "DELETE";
  OPERATION2[OPERATION2["DELETE_AND_MOVE"] = 96] = "DELETE_AND_MOVE";
  OPERATION2[OPERATION2["MOVE_AND_ADD"] = 160] = "MOVE_AND_ADD";
  OPERATION2[OPERATION2["DELETE_AND_ADD"] = 192] = "DELETE_AND_ADD";
  OPERATION2[OPERATION2["CLEAR"] = 10] = "CLEAR";
  OPERATION2[OPERATION2["REVERSE"] = 15] = "REVERSE";
  OPERATION2[OPERATION2["MOVE"] = 32] = "MOVE";
  OPERATION2[OPERATION2["DELETE_BY_REFID"] = 33] = "DELETE_BY_REFID";
  OPERATION2[OPERATION2["ADD_BY_REFID"] = 129] = "ADD_BY_REFID";
})(OPERATION || (OPERATION = {}));
Symbol.metadata ?? (Symbol.metadata = Symbol.for("Symbol.metadata"));
var $refId = "~refId";
var $track = "~track";
var $encoder = "~encoder";
var $decoder = "~decoder";
var $filter = "~filter";
var $getByIndex = "~getByIndex";
var $deleteByIndex = "~deleteByIndex";
var $changes = "~changes";
var $childType = "~childType";
var $onEncodeEnd = "~onEncodeEnd";
var $onDecodeEnd = "~onDecodeEnd";
var $descriptors = "~descriptors";
var $numFields = "~__numFields";
var $refTypeFieldIndexes = "~__refTypeFieldIndexes";
var $viewFieldIndexes = "~__viewFieldIndexes";
var $fieldIndexesByViewTag = "$__fieldIndexesByViewTag";
var textEncoder;
try {
  textEncoder = new TextEncoder();
} catch (e) {
}
var _convoBuffer$1 = new ArrayBuffer(8);
var _int32$1 = new Int32Array(_convoBuffer$1);
var _float32$1 = new Float32Array(_convoBuffer$1);
var _float64$1 = new Float64Array(_convoBuffer$1);
var _int64$1 = new BigInt64Array(_convoBuffer$1);
var hasBufferByteLength = typeof Buffer !== "undefined" && Buffer.byteLength;
var utf8Length = hasBufferByteLength ? Buffer.byteLength : function(str, _) {
  var c = 0, length = 0;
  for (var i = 0, l = str.length; i < l; i++) {
    c = str.charCodeAt(i);
    if (c < 128) {
      length += 1;
    } else if (c < 2048) {
      length += 2;
    } else if (c < 55296 || c >= 57344) {
      length += 3;
    } else {
      i++;
      length += 4;
    }
  }
  return length;
};
function utf8Write(view2, str, it) {
  var c = 0;
  for (var i = 0, l = str.length; i < l; i++) {
    c = str.charCodeAt(i);
    if (c < 128) {
      view2[it.offset++] = c;
    } else if (c < 2048) {
      view2[it.offset] = 192 | c >> 6;
      view2[it.offset + 1] = 128 | c & 63;
      it.offset += 2;
    } else if (c < 55296 || c >= 57344) {
      view2[it.offset] = 224 | c >> 12;
      view2[it.offset + 1] = 128 | c >> 6 & 63;
      view2[it.offset + 2] = 128 | c & 63;
      it.offset += 3;
    } else {
      i++;
      c = 65536 + ((c & 1023) << 10 | str.charCodeAt(i) & 1023);
      view2[it.offset] = 240 | c >> 18;
      view2[it.offset + 1] = 128 | c >> 12 & 63;
      view2[it.offset + 2] = 128 | c >> 6 & 63;
      view2[it.offset + 3] = 128 | c & 63;
      it.offset += 4;
    }
  }
}
function int8$1(bytes, value, it) {
  bytes[it.offset++] = value & 255;
}
function uint8$1(bytes, value, it) {
  bytes[it.offset++] = value & 255;
}
function int16$1(bytes, value, it) {
  bytes[it.offset++] = value & 255;
  bytes[it.offset++] = value >> 8 & 255;
}
function uint16$1(bytes, value, it) {
  bytes[it.offset++] = value & 255;
  bytes[it.offset++] = value >> 8 & 255;
}
function int32$1(bytes, value, it) {
  bytes[it.offset++] = value & 255;
  bytes[it.offset++] = value >> 8 & 255;
  bytes[it.offset++] = value >> 16 & 255;
  bytes[it.offset++] = value >> 24 & 255;
}
function uint32$1(bytes, value, it) {
  const b4 = value >> 24;
  const b3 = value >> 16;
  const b2 = value >> 8;
  const b1 = value;
  bytes[it.offset++] = b1 & 255;
  bytes[it.offset++] = b2 & 255;
  bytes[it.offset++] = b3 & 255;
  bytes[it.offset++] = b4 & 255;
}
function int64$1(bytes, value, it) {
  const high = Math.floor(value / Math.pow(2, 32));
  const low = value >>> 0;
  uint32$1(bytes, low, it);
  uint32$1(bytes, high, it);
}
function uint64$1(bytes, value, it) {
  const high = value / Math.pow(2, 32) >> 0;
  const low = value >>> 0;
  uint32$1(bytes, low, it);
  uint32$1(bytes, high, it);
}
function bigint64$1(bytes, value, it) {
  _int64$1[0] = BigInt.asIntN(64, value);
  int32$1(bytes, _int32$1[0], it);
  int32$1(bytes, _int32$1[1], it);
}
function biguint64$1(bytes, value, it) {
  _int64$1[0] = BigInt.asIntN(64, value);
  int32$1(bytes, _int32$1[0], it);
  int32$1(bytes, _int32$1[1], it);
}
function float32$1(bytes, value, it) {
  _float32$1[0] = value;
  int32$1(bytes, _int32$1[0], it);
}
function float64$1(bytes, value, it) {
  _float64$1[0] = value;
  int32$1(bytes, _int32$1[0], it);
  int32$1(bytes, _int32$1[1], it);
}
function boolean$1(bytes, value, it) {
  bytes[it.offset++] = value ? 1 : 0;
}
function string$1(bytes, value, it) {
  if (!value) {
    value = "";
  }
  let length = utf8Length(value, "utf8");
  let size = 0;
  if (length < 32) {
    bytes[it.offset++] = length | 160;
    size = 1;
  } else if (length < 256) {
    bytes[it.offset++] = 217;
    bytes[it.offset++] = length;
    size = 2;
  } else if (length < 65536) {
    bytes[it.offset++] = 218;
    uint16$1(bytes, length, it);
    size = 3;
  } else if (length < 4294967296) {
    bytes[it.offset++] = 219;
    uint32$1(bytes, length, it);
    size = 5;
  } else {
    throw new Error("String too long");
  }
  utf8Write(bytes, value, it);
  return size + length;
}
function number$1(bytes, value, it) {
  if (isNaN(value)) {
    return number$1(bytes, 0, it);
  } else if (!isFinite(value)) {
    return number$1(bytes, value > 0 ? Number.MAX_SAFE_INTEGER : -Number.MAX_SAFE_INTEGER, it);
  } else if (value !== (value | 0)) {
    if (Math.abs(value) <= 34028235e31) {
      _float32$1[0] = value;
      if (Math.abs(Math.abs(_float32$1[0]) - Math.abs(value)) < 1e-4) {
        bytes[it.offset++] = 202;
        float32$1(bytes, value, it);
        return 5;
      }
    }
    bytes[it.offset++] = 203;
    float64$1(bytes, value, it);
    return 9;
  }
  if (value >= 0) {
    if (value < 128) {
      bytes[it.offset++] = value & 255;
      return 1;
    }
    if (value < 256) {
      bytes[it.offset++] = 204;
      bytes[it.offset++] = value & 255;
      return 2;
    }
    if (value < 65536) {
      bytes[it.offset++] = 205;
      uint16$1(bytes, value, it);
      return 3;
    }
    if (value < 4294967296) {
      bytes[it.offset++] = 206;
      uint32$1(bytes, value, it);
      return 5;
    }
    bytes[it.offset++] = 207;
    uint64$1(bytes, value, it);
    return 9;
  } else {
    if (value >= -32) {
      bytes[it.offset++] = 224 | value + 32;
      return 1;
    }
    if (value >= -128) {
      bytes[it.offset++] = 208;
      int8$1(bytes, value, it);
      return 2;
    }
    if (value >= -32768) {
      bytes[it.offset++] = 209;
      int16$1(bytes, value, it);
      return 3;
    }
    if (value >= -2147483648) {
      bytes[it.offset++] = 210;
      int32$1(bytes, value, it);
      return 5;
    }
    bytes[it.offset++] = 211;
    int64$1(bytes, value, it);
    return 9;
  }
}
var encode = {
  int8: int8$1,
  uint8: uint8$1,
  int16: int16$1,
  uint16: uint16$1,
  int32: int32$1,
  uint32: uint32$1,
  int64: int64$1,
  uint64: uint64$1,
  bigint64: bigint64$1,
  biguint64: biguint64$1,
  float32: float32$1,
  float64: float64$1,
  boolean: boolean$1,
  string: string$1,
  number: number$1,
  utf8Write,
  utf8Length
};
var _convoBuffer = new ArrayBuffer(8);
var _int32 = new Int32Array(_convoBuffer);
var _float32 = new Float32Array(_convoBuffer);
var _float64 = new Float64Array(_convoBuffer);
var _uint64 = new BigUint64Array(_convoBuffer);
var _int64 = new BigInt64Array(_convoBuffer);
function utf8Read(bytes, it, length) {
  if (length > bytes.length - it.offset) {
    length = bytes.length - it.offset;
  }
  var string2 = "", chr = 0;
  for (var i = it.offset, end = it.offset + length; i < end; i++) {
    var byte = bytes[i];
    if ((byte & 128) === 0) {
      string2 += String.fromCharCode(byte);
      continue;
    }
    if ((byte & 224) === 192) {
      string2 += String.fromCharCode((byte & 31) << 6 | bytes[++i] & 63);
      continue;
    }
    if ((byte & 240) === 224) {
      string2 += String.fromCharCode((byte & 15) << 12 | (bytes[++i] & 63) << 6 | (bytes[++i] & 63) << 0);
      continue;
    }
    if ((byte & 248) === 240) {
      chr = (byte & 7) << 18 | (bytes[++i] & 63) << 12 | (bytes[++i] & 63) << 6 | (bytes[++i] & 63) << 0;
      if (chr >= 65536) {
        chr -= 65536;
        string2 += String.fromCharCode((chr >>> 10) + 55296, (chr & 1023) + 56320);
      } else {
        string2 += String.fromCharCode(chr);
      }
      continue;
    }
    console.error("decode.utf8Read(): Invalid byte " + byte + " at offset " + i + ". Skip to end of string: " + (it.offset + length));
    break;
  }
  it.offset += length;
  return string2;
}
function int8(bytes, it) {
  return uint8(bytes, it) << 24 >> 24;
}
function uint8(bytes, it) {
  return bytes[it.offset++];
}
function int16(bytes, it) {
  return uint16(bytes, it) << 16 >> 16;
}
function uint16(bytes, it) {
  return bytes[it.offset++] | bytes[it.offset++] << 8;
}
function int32(bytes, it) {
  return bytes[it.offset++] | bytes[it.offset++] << 8 | bytes[it.offset++] << 16 | bytes[it.offset++] << 24;
}
function uint32(bytes, it) {
  return int32(bytes, it) >>> 0;
}
function float32(bytes, it) {
  _int32[0] = int32(bytes, it);
  return _float32[0];
}
function float64(bytes, it) {
  _int32[0] = int32(bytes, it);
  _int32[1] = int32(bytes, it);
  return _float64[0];
}
function int64(bytes, it) {
  const low = uint32(bytes, it);
  const high = int32(bytes, it) * Math.pow(2, 32);
  return high + low;
}
function uint64(bytes, it) {
  const low = uint32(bytes, it);
  const high = uint32(bytes, it) * Math.pow(2, 32);
  return high + low;
}
function bigint64(bytes, it) {
  _int32[0] = int32(bytes, it);
  _int32[1] = int32(bytes, it);
  return _int64[0];
}
function biguint64(bytes, it) {
  _int32[0] = int32(bytes, it);
  _int32[1] = int32(bytes, it);
  return _uint64[0];
}
function boolean(bytes, it) {
  return uint8(bytes, it) > 0;
}
function string(bytes, it) {
  const prefix = bytes[it.offset++];
  let length;
  if (prefix < 192) {
    length = prefix & 31;
  } else if (prefix === 217) {
    length = uint8(bytes, it);
  } else if (prefix === 218) {
    length = uint16(bytes, it);
  } else if (prefix === 219) {
    length = uint32(bytes, it);
  }
  return utf8Read(bytes, it, length);
}
function number(bytes, it) {
  const prefix = bytes[it.offset++];
  if (prefix < 128) {
    return prefix;
  } else if (prefix === 202) {
    return float32(bytes, it);
  } else if (prefix === 203) {
    return float64(bytes, it);
  } else if (prefix === 204) {
    return uint8(bytes, it);
  } else if (prefix === 205) {
    return uint16(bytes, it);
  } else if (prefix === 206) {
    return uint32(bytes, it);
  } else if (prefix === 207) {
    return uint64(bytes, it);
  } else if (prefix === 208) {
    return int8(bytes, it);
  } else if (prefix === 209) {
    return int16(bytes, it);
  } else if (prefix === 210) {
    return int32(bytes, it);
  } else if (prefix === 211) {
    return int64(bytes, it);
  } else if (prefix > 223) {
    return (255 - prefix + 1) * -1;
  }
}
function stringCheck(bytes, it) {
  const prefix = bytes[it.offset];
  return (
    // fixstr
    prefix < 192 && prefix > 160 || // str 8
    prefix === 217 || // str 16
    prefix === 218 || // str 32
    prefix === 219
  );
}
var decode = {
  utf8Read,
  int8,
  uint8,
  int16,
  uint16,
  int32,
  uint32,
  float32,
  float64,
  int64,
  uint64,
  bigint64,
  biguint64,
  boolean,
  string,
  number,
  stringCheck
};
var registeredTypes = {};
var identifiers = /* @__PURE__ */ new Map();
function registerType(identifier, definition) {
  if (definition.constructor) {
    identifiers.set(definition.constructor, identifier);
    registeredTypes[identifier] = definition;
  }
  if (definition.encode) {
    encode[identifier] = definition.encode;
  }
  if (definition.decode) {
    decode[identifier] = definition.decode;
  }
}
function getType(identifier) {
  return registeredTypes[identifier];
}
var _TypeContext = class _TypeContext {
  constructor(rootClass) {
    __publicField(this, "types", {});
    __publicField(this, "schemas", /* @__PURE__ */ new Map());
    __publicField(this, "hasFilters", false);
    __publicField(this, "parentFiltered", {});
    if (rootClass) {
      this.discoverTypes(rootClass);
    }
  }
  static register(target2) {
    const parent = Object.getPrototypeOf(target2);
    if (parent !== Schema) {
      let inherits = _TypeContext.inheritedTypes.get(parent);
      if (!inherits) {
        inherits = /* @__PURE__ */ new Set();
        _TypeContext.inheritedTypes.set(parent, inherits);
      }
      inherits.add(target2);
    }
  }
  static cache(rootClass) {
    let context = _TypeContext.cachedContexts.get(rootClass);
    if (!context) {
      context = new _TypeContext(rootClass);
      _TypeContext.cachedContexts.set(rootClass, context);
    }
    return context;
  }
  has(schema2) {
    return this.schemas.has(schema2);
  }
  get(typeid) {
    return this.types[typeid];
  }
  add(schema2, typeid = this.schemas.size) {
    if (this.schemas.has(schema2)) {
      return false;
    }
    this.types[typeid] = schema2;
    if (schema2[Symbol.metadata] === void 0) {
      Metadata.initialize(schema2);
    }
    this.schemas.set(schema2, typeid);
    return true;
  }
  getTypeId(klass) {
    return this.schemas.get(klass);
  }
  discoverTypes(klass, parentType, parentIndex, parentHasViewTag) {
    var _a6;
    if (parentHasViewTag) {
      this.registerFilteredByParent(klass, parentType, parentIndex);
    }
    if (!this.add(klass)) {
      return;
    }
    _TypeContext.inheritedTypes.get(klass)?.forEach((child) => {
      this.discoverTypes(child, parentType, parentIndex, parentHasViewTag);
    });
    let parent = klass;
    while ((parent = Object.getPrototypeOf(parent)) && parent !== Schema && // stop at root (Schema)
    parent !== Function.prototype) {
      this.discoverTypes(parent);
    }
    const metadata = klass[_a6 = Symbol.metadata] ?? (klass[_a6] = {});
    if (metadata[$viewFieldIndexes]) {
      this.hasFilters = true;
    }
    for (const fieldIndex in metadata) {
      const index = fieldIndex;
      const fieldType = metadata[index].type;
      const fieldHasViewTag = metadata[index].tag !== void 0;
      if (typeof fieldType === "string") {
        continue;
      }
      if (typeof fieldType === "function") {
        this.discoverTypes(fieldType, klass, index, parentHasViewTag || fieldHasViewTag);
      } else {
        const type = Object.values(fieldType)[0];
        if (typeof type === "string") {
          continue;
        }
        this.discoverTypes(type, klass, index, parentHasViewTag || fieldHasViewTag);
      }
    }
  }
  /**
   * Keep track of which classes have filters applied.
   * Format: `${typeid}-${parentTypeid}-${parentIndex}`
   */
  registerFilteredByParent(schema2, parentType, parentIndex) {
    const typeid = this.schemas.get(schema2) ?? this.schemas.size;
    let key = `${typeid}`;
    if (parentType) {
      key += `-${this.schemas.get(parentType)}`;
    }
    key += `-${parentIndex}`;
    this.parentFiltered[key] = true;
  }
  debug() {
    let parentFiltered = "";
    for (const key in this.parentFiltered) {
      const keys = key.split("-").map(Number);
      const fieldIndex = keys.pop();
      parentFiltered += `
		`;
      parentFiltered += `${key}: ${keys.reverse().map((id, i) => {
        const klass = this.types[id];
        const metadata = klass[Symbol.metadata];
        let txt = klass.name;
        if (i === 0) {
          txt += `[${metadata[fieldIndex].name}]`;
        }
        return `${txt}`;
      }).join(" -> ")}`;
    }
    return `TypeContext ->
	Schema types: ${this.schemas.size}
	hasFilters: ${this.hasFilters}
	parentFiltered:${parentFiltered}`;
  }
};
/**
 * For inheritance support
 * Keeps track of which classes extends which. (parent -> children)
 */
__publicField(_TypeContext, "inheritedTypes", /* @__PURE__ */ new Map());
__publicField(_TypeContext, "cachedContexts", /* @__PURE__ */ new Map());
var TypeContext = _TypeContext;
function getNormalizedType(type) {
  if (Array.isArray(type)) {
    return { array: getNormalizedType(type[0]) };
  } else if (typeof type["type"] !== "undefined") {
    return type["type"];
  } else if (isTSEnum(type)) {
    return Object.keys(type).every((key) => typeof type[key] === "string") ? "string" : "number";
  } else if (typeof type === "object" && type !== null) {
    const collectionType = Object.keys(type).find((k) => registeredTypes[k] !== void 0);
    if (collectionType) {
      type[collectionType] = getNormalizedType(type[collectionType]);
      return type;
    }
  }
  return type;
}
function isTSEnum(_enum) {
  if (typeof _enum === "function" && _enum[Symbol.metadata]) {
    return false;
  }
  const keys = Object.keys(_enum);
  const numericFields = keys.filter((k) => /\d+/.test(k));
  if (numericFields.length > 0 && numericFields.length === keys.length / 2 && _enum[_enum[numericFields[0]]] == numericFields[0]) {
    return true;
  }
  if (keys.length > 0 && keys.every((key) => typeof _enum[key] === "string" && _enum[key] === key)) {
    return true;
  }
  return false;
}
var Metadata = {
  addField(metadata, index, name, type, descriptor) {
    if (index > 64) {
      throw new Error(`Can't define field '${name}'.
Schema instances may only have up to 64 fields.`);
    }
    metadata[index] = Object.assign(
      metadata[index] || {},
      // avoid overwriting previous field metadata (@owned / @deprecated)
      {
        type: getNormalizedType(type),
        index,
        name
      }
    );
    Object.defineProperty(metadata, $descriptors, {
      value: metadata[$descriptors] || {},
      enumerable: false,
      configurable: true
    });
    if (descriptor) {
      metadata[$descriptors][name] = descriptor;
      metadata[$descriptors][`_${name}`] = {
        value: void 0,
        writable: true,
        enumerable: false,
        configurable: true
      };
    } else {
      metadata[$descriptors][name] = {
        value: void 0,
        writable: true,
        enumerable: true,
        configurable: true
      };
    }
    Object.defineProperty(metadata, $numFields, {
      value: index,
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(metadata, name, {
      value: index,
      enumerable: false,
      configurable: true
    });
    if (typeof metadata[index].type !== "string") {
      if (metadata[$refTypeFieldIndexes] === void 0) {
        Object.defineProperty(metadata, $refTypeFieldIndexes, {
          value: [],
          enumerable: false,
          configurable: true
        });
      }
      metadata[$refTypeFieldIndexes].push(index);
    }
  },
  setTag(metadata, fieldName, tag) {
    const index = metadata[fieldName];
    const field = metadata[index];
    field.tag = tag;
    if (!metadata[$viewFieldIndexes]) {
      Object.defineProperty(metadata, $viewFieldIndexes, {
        value: [],
        enumerable: false,
        configurable: true
      });
      Object.defineProperty(metadata, $fieldIndexesByViewTag, {
        value: {},
        enumerable: false,
        configurable: true
      });
    }
    metadata[$viewFieldIndexes].push(index);
    if (!metadata[$fieldIndexesByViewTag][tag]) {
      metadata[$fieldIndexesByViewTag][tag] = [];
    }
    metadata[$fieldIndexesByViewTag][tag].push(index);
  },
  setFields(target2, fields) {
    const constructor = target2.prototype.constructor;
    TypeContext.register(constructor);
    const parentClass = Object.getPrototypeOf(constructor);
    const parentMetadata = parentClass && parentClass[Symbol.metadata];
    const metadata = Metadata.initialize(constructor);
    if (!constructor[$track]) {
      constructor[$track] = Schema[$track];
    }
    if (!constructor[$encoder]) {
      constructor[$encoder] = Schema[$encoder];
    }
    if (!constructor[$decoder]) {
      constructor[$decoder] = Schema[$decoder];
    }
    if (!constructor.prototype.toJSON) {
      constructor.prototype.toJSON = Schema.prototype.toJSON;
    }
    let fieldIndex = metadata[$numFields] ?? (parentMetadata && parentMetadata[$numFields]) ?? -1;
    fieldIndex++;
    for (const field in fields) {
      const type = getNormalizedType(fields[field]);
      const complexTypeKlass = typeof Object.keys(type)[0] === "string" && getType(Object.keys(type)[0]);
      const childType = complexTypeKlass ? Object.values(type)[0] : type;
      Metadata.addField(metadata, fieldIndex, field, type, getPropertyDescriptor(`_${field}`, fieldIndex, childType, complexTypeKlass));
      fieldIndex++;
    }
    return target2;
  },
  isDeprecated(metadata, field) {
    return metadata[field].deprecated === true;
  },
  init(klass) {
    const metadata = {};
    klass[Symbol.metadata] = metadata;
    Object.defineProperty(metadata, $numFields, {
      value: 0,
      enumerable: false,
      configurable: true
    });
  },
  initialize(constructor) {
    const parentClass = Object.getPrototypeOf(constructor);
    const parentMetadata = parentClass[Symbol.metadata];
    let metadata = constructor[Symbol.metadata] ?? /* @__PURE__ */ Object.create(null);
    if (parentClass !== Schema && metadata === parentMetadata) {
      metadata = /* @__PURE__ */ Object.create(null);
      if (parentMetadata) {
        Object.setPrototypeOf(metadata, parentMetadata);
        Object.defineProperty(metadata, $numFields, {
          value: parentMetadata[$numFields],
          enumerable: false,
          configurable: true,
          writable: true
        });
        if (parentMetadata[$viewFieldIndexes] !== void 0) {
          Object.defineProperty(metadata, $viewFieldIndexes, {
            value: [...parentMetadata[$viewFieldIndexes]],
            enumerable: false,
            configurable: true,
            writable: true
          });
          Object.defineProperty(metadata, $fieldIndexesByViewTag, {
            value: { ...parentMetadata[$fieldIndexesByViewTag] },
            enumerable: false,
            configurable: true,
            writable: true
          });
        }
        if (parentMetadata[$refTypeFieldIndexes] !== void 0) {
          Object.defineProperty(metadata, $refTypeFieldIndexes, {
            value: [...parentMetadata[$refTypeFieldIndexes]],
            enumerable: false,
            configurable: true,
            writable: true
          });
        }
        Object.defineProperty(metadata, $descriptors, {
          value: { ...parentMetadata[$descriptors] },
          enumerable: false,
          configurable: true,
          writable: true
        });
      }
    }
    Object.defineProperty(constructor, Symbol.metadata, {
      value: metadata,
      writable: false,
      configurable: true
    });
    return metadata;
  },
  isValidInstance(klass) {
    return klass.constructor[Symbol.metadata] && Object.prototype.hasOwnProperty.call(klass.constructor[Symbol.metadata], $numFields);
  },
  getFields(klass) {
    const metadata = klass[Symbol.metadata];
    const fields = {};
    for (let i = 0; i <= metadata[$numFields]; i++) {
      fields[metadata[i].name] = metadata[i].type;
    }
    return fields;
  },
  hasViewTagAtIndex(metadata, index) {
    return metadata?.[$viewFieldIndexes]?.includes(index);
  }
};
function createChangeSet(queueRootNode) {
  return { indexes: {}, operations: [], queueRootNode };
}
function createChangeTreeList() {
  return { next: void 0, tail: void 0 };
}
function setOperationAtIndex(changeSet, index) {
  const operationsIndex = changeSet.indexes[index];
  if (operationsIndex === void 0) {
    changeSet.indexes[index] = changeSet.operations.push(index) - 1;
  } else {
    changeSet.operations[operationsIndex] = index;
  }
}
function deleteOperationAtIndex(changeSet, index) {
  let operationsIndex = changeSet.indexes[index];
  if (operationsIndex === void 0) {
    operationsIndex = Object.values(changeSet.indexes).at(-1);
    index = Object.entries(changeSet.indexes).find(([_, value]) => value === operationsIndex)?.[0];
  }
  changeSet.operations[operationsIndex] = void 0;
  delete changeSet.indexes[index];
}
var ChangeTree = class {
  constructor(ref) {
    __publicField(this, "ref");
    __publicField(this, "metadata");
    __publicField(this, "root");
    __publicField(this, "parentChain");
    // Linked list for tracking parents
    /**
     * Whether this structure is parent of a filtered structure.
     */
    __publicField(this, "isFiltered", false);
    __publicField(this, "isVisibilitySharedWithParent");
    // See test case: 'should not be required to manually call view.add() items to child arrays without @view() tag'
    __publicField(this, "indexedOperations", {});
    //
    // TODO:
    //   try storing the index + operation per item.
    //   example: 1024 & 1025 => ADD, 1026 => DELETE
    //
    // => https://chatgpt.com/share/67107d0c-bc20-8004-8583-83b17dd7c196
    //
    __publicField(this, "changes", { indexes: {}, operations: [] });
    __publicField(this, "allChanges", { indexes: {}, operations: [] });
    __publicField(this, "filteredChanges");
    __publicField(this, "allFilteredChanges");
    __publicField(this, "indexes");
    // TODO: remove this, only used by MapSchema/SetSchema/CollectionSchema (`encodeKeyValueOperation`)
    /**
     * Is this a new instance? Used on ArraySchema to determine OPERATION.MOVE_AND_ADD operation.
     */
    __publicField(this, "isNew", true);
    this.ref = ref;
    this.metadata = ref.constructor[Symbol.metadata];
    if (this.metadata?.[$viewFieldIndexes]) {
      this.allFilteredChanges = { indexes: {}, operations: [] };
      this.filteredChanges = { indexes: {}, operations: [] };
    }
  }
  setRoot(root) {
    this.root = root;
    const isNewChangeTree = this.root.add(this);
    this.checkIsFiltered(this.parent, this.parentIndex, isNewChangeTree);
    if (isNewChangeTree) {
      this.forEachChild((child, _) => {
        if (child.root !== root) {
          child.setRoot(root);
        } else {
          root.add(child);
        }
      });
    }
  }
  setParent(parent, root, parentIndex) {
    this.addParent(parent, parentIndex);
    if (!root) {
      return;
    }
    const isNewChangeTree = root.add(this);
    if (root !== this.root) {
      this.root = root;
      this.checkIsFiltered(parent, parentIndex, isNewChangeTree);
    }
    if (isNewChangeTree) {
      this.forEachChild((child, index) => {
        if (child.root === root) {
          root.add(child);
          root.moveNextToParent(child);
          return;
        }
        child.setParent(this.ref, root, index);
      });
    }
  }
  forEachChild(callback) {
    if (this.ref[$childType]) {
      if (typeof this.ref[$childType] !== "string") {
        for (const [key, value] of this.ref.entries()) {
          if (!value) {
            continue;
          }
          callback(value[$changes], this.indexes?.[key] ?? key);
        }
      }
    } else {
      for (const index of this.metadata?.[$refTypeFieldIndexes] ?? []) {
        const field = this.metadata[index];
        const value = this.ref[field.name];
        if (!value) {
          continue;
        }
        callback(value[$changes], index);
      }
    }
  }
  operation(op) {
    if (this.filteredChanges !== void 0) {
      this.filteredChanges.operations.push(-op);
      this.root?.enqueueChangeTree(this, "filteredChanges");
    } else {
      this.changes.operations.push(-op);
      this.root?.enqueueChangeTree(this, "changes");
    }
  }
  change(index, operation = OPERATION.ADD) {
    const isFiltered = this.isFiltered || this.metadata?.[index]?.tag !== void 0;
    const changeSet = isFiltered ? this.filteredChanges : this.changes;
    const previousOperation = this.indexedOperations[index];
    if (!previousOperation || previousOperation === OPERATION.DELETE) {
      const op = !previousOperation ? operation : previousOperation === OPERATION.DELETE ? OPERATION.DELETE_AND_ADD : operation;
      this.indexedOperations[index] = op;
    }
    setOperationAtIndex(changeSet, index);
    if (isFiltered) {
      setOperationAtIndex(this.allFilteredChanges, index);
      if (this.root) {
        this.root.enqueueChangeTree(this, "filteredChanges");
        this.root.enqueueChangeTree(this, "allFilteredChanges");
      }
    } else {
      setOperationAtIndex(this.allChanges, index);
      this.root?.enqueueChangeTree(this, "changes");
    }
  }
  shiftChangeIndexes(shiftIndex) {
    const changeSet = this.isFiltered ? this.filteredChanges : this.changes;
    const newIndexedOperations = {};
    const newIndexes = {};
    for (const index in this.indexedOperations) {
      newIndexedOperations[Number(index) + shiftIndex] = this.indexedOperations[index];
      newIndexes[Number(index) + shiftIndex] = changeSet.indexes[index];
    }
    this.indexedOperations = newIndexedOperations;
    changeSet.indexes = newIndexes;
    changeSet.operations = changeSet.operations.map((index) => index + shiftIndex);
  }
  shiftAllChangeIndexes(shiftIndex, startIndex = 0) {
    if (this.filteredChanges !== void 0) {
      this._shiftAllChangeIndexes(shiftIndex, startIndex, this.allFilteredChanges);
      this._shiftAllChangeIndexes(shiftIndex, startIndex, this.allChanges);
    } else {
      this._shiftAllChangeIndexes(shiftIndex, startIndex, this.allChanges);
    }
  }
  _shiftAllChangeIndexes(shiftIndex, startIndex = 0, changeSet) {
    const newIndexes = {};
    let newKey = 0;
    for (const key in changeSet.indexes) {
      newIndexes[newKey++] = changeSet.indexes[key];
    }
    changeSet.indexes = newIndexes;
    for (let i = 0; i < changeSet.operations.length; i++) {
      const index = changeSet.operations[i];
      if (index > startIndex) {
        changeSet.operations[i] = index + shiftIndex;
      }
    }
  }
  indexedOperation(index, operation, allChangesIndex = index) {
    this.indexedOperations[index] = operation;
    if (this.filteredChanges !== void 0) {
      setOperationAtIndex(this.allFilteredChanges, allChangesIndex);
      setOperationAtIndex(this.filteredChanges, index);
      this.root?.enqueueChangeTree(this, "filteredChanges");
    } else {
      setOperationAtIndex(this.allChanges, allChangesIndex);
      setOperationAtIndex(this.changes, index);
      this.root?.enqueueChangeTree(this, "changes");
    }
  }
  getType(index) {
    return (
      //
      // Get the child type from parent structure.
      // - ["string"] => "string"
      // - { map: "string" } => "string"
      // - { set: "string" } => "string"
      //
      this.ref[$childType] || // ArraySchema | MapSchema | SetSchema | CollectionSchema
      this.metadata[index].type
    );
  }
  getChange(index) {
    return this.indexedOperations[index];
  }
  //
  // used during `.encode()`
  //
  getValue(index, isEncodeAll = false) {
    return this.ref[$getByIndex](index, isEncodeAll);
  }
  delete(index, operation, allChangesIndex = index) {
    if (index === void 0) {
      try {
        throw new Error(`@colyseus/schema ${this.ref.constructor.name}: trying to delete non-existing index '${index}'`);
      } catch (e) {
        console.warn(e);
      }
      return;
    }
    const changeSet = this.filteredChanges !== void 0 ? this.filteredChanges : this.changes;
    this.indexedOperations[index] = operation ?? OPERATION.DELETE;
    setOperationAtIndex(changeSet, index);
    deleteOperationAtIndex(this.allChanges, allChangesIndex);
    const previousValue = this.getValue(index);
    if (previousValue && previousValue[$changes]) {
      this.root?.remove(previousValue[$changes]);
    }
    if (this.filteredChanges !== void 0) {
      deleteOperationAtIndex(this.allFilteredChanges, allChangesIndex);
      this.root?.enqueueChangeTree(this, "filteredChanges");
    } else {
      this.root?.enqueueChangeTree(this, "changes");
    }
    return previousValue;
  }
  endEncode(changeSetName) {
    this.indexedOperations = {};
    this[changeSetName] = createChangeSet();
    this.ref[$onEncodeEnd]?.();
    this.isNew = false;
  }
  discard(discardAll = false) {
    this.ref[$onEncodeEnd]?.();
    this.indexedOperations = {};
    this.changes = createChangeSet(this.changes.queueRootNode);
    if (this.filteredChanges !== void 0) {
      this.filteredChanges = createChangeSet(this.filteredChanges.queueRootNode);
    }
    if (discardAll) {
      this.allChanges = createChangeSet(this.allChanges.queueRootNode);
      if (this.allFilteredChanges !== void 0) {
        this.allFilteredChanges = createChangeSet(this.allFilteredChanges.queueRootNode);
      }
    }
  }
  /**
   * Recursively discard all changes from this, and child structures.
   * (Used in tests only)
   */
  discardAll() {
    const keys = Object.keys(this.indexedOperations);
    for (let i = 0, len = keys.length; i < len; i++) {
      const value = this.getValue(Number(keys[i]));
      if (value && value[$changes]) {
        value[$changes].discardAll();
      }
    }
    this.discard();
  }
  get changed() {
    return Object.entries(this.indexedOperations).length > 0;
  }
  checkIsFiltered(parent, parentIndex, isNewChangeTree) {
    if (this.root.types.hasFilters) {
      this._checkFilteredByParent(parent, parentIndex);
      if (this.filteredChanges !== void 0) {
        this.root?.enqueueChangeTree(this, "filteredChanges");
        if (isNewChangeTree) {
          this.root?.enqueueChangeTree(this, "allFilteredChanges");
        }
      }
    }
    if (!this.isFiltered) {
      this.root?.enqueueChangeTree(this, "changes");
      if (isNewChangeTree) {
        this.root?.enqueueChangeTree(this, "allChanges");
      }
    }
  }
  _checkFilteredByParent(parent, parentIndex) {
    if (!parent) {
      return;
    }
    const refType = Metadata.isValidInstance(this.ref) ? this.ref.constructor : this.ref[$childType];
    let parentChangeTree;
    let parentIsCollection = !Metadata.isValidInstance(parent);
    if (parentIsCollection) {
      parentChangeTree = parent[$changes];
      parent = parentChangeTree.parent;
      parentIndex = parentChangeTree.parentIndex;
    } else {
      parentChangeTree = parent[$changes];
    }
    const parentConstructor = parent.constructor;
    let key = `${this.root.types.getTypeId(refType)}`;
    if (parentConstructor) {
      key += `-${this.root.types.schemas.get(parentConstructor)}`;
    }
    key += `-${parentIndex}`;
    const fieldHasViewTag = Metadata.hasViewTagAtIndex(parentConstructor?.[Symbol.metadata], parentIndex);
    this.isFiltered = parent[$changes].isFiltered || this.root.types.parentFiltered[key] || fieldHasViewTag;
    if (this.isFiltered) {
      this.isVisibilitySharedWithParent = parentChangeTree.isFiltered && typeof refType !== "string" && !fieldHasViewTag && parentIsCollection;
      if (!this.filteredChanges) {
        this.filteredChanges = createChangeSet();
        this.allFilteredChanges = createChangeSet();
      }
      if (this.changes.operations.length > 0) {
        this.changes.operations.forEach((index) => setOperationAtIndex(this.filteredChanges, index));
        this.allChanges.operations.forEach((index) => setOperationAtIndex(this.allFilteredChanges, index));
        this.changes = createChangeSet();
        this.allChanges = createChangeSet();
      }
    }
  }
  /**
   * Get the immediate parent
   */
  get parent() {
    return this.parentChain?.ref;
  }
  /**
   * Get the immediate parent index
   */
  get parentIndex() {
    return this.parentChain?.index;
  }
  /**
   * Add a parent to the chain
   */
  addParent(parent, index) {
    if (this.hasParent((p, _) => p[$changes] === parent[$changes])) {
      this.parentChain.index = index;
      return;
    }
    this.parentChain = {
      ref: parent,
      index,
      next: this.parentChain
    };
  }
  /**
   * Remove a parent from the chain
   * @param parent - The parent to remove
   * @returns true if parent was removed
   */
  removeParent(parent = this.parent) {
    let current = this.parentChain;
    let previous = null;
    while (current) {
      if (current.ref[$changes] === parent[$changes]) {
        if (previous) {
          previous.next = current.next;
        } else {
          this.parentChain = current.next;
        }
        return true;
      }
      previous = current;
      current = current.next;
    }
    return this.parentChain === void 0;
  }
  /**
   * Find a specific parent in the chain
   */
  findParent(predicate) {
    let current = this.parentChain;
    while (current) {
      if (predicate(current.ref, current.index)) {
        return current;
      }
      current = current.next;
    }
    return void 0;
  }
  /**
   * Check if this ChangeTree has a specific parent
   */
  hasParent(predicate) {
    return this.findParent(predicate) !== void 0;
  }
  /**
   * Get all parents as an array (for debugging/testing)
   */
  getAllParents() {
    const parents = [];
    let current = this.parentChain;
    while (current) {
      parents.push({ ref: current.ref, index: current.index });
      current = current.next;
    }
    return parents;
  }
};
function encodeValue(encoder, bytes, type, value, operation, it) {
  if (typeof type === "string") {
    encode[type]?.(bytes, value, it);
  } else if (type[Symbol.metadata] !== void 0) {
    encode.number(bytes, value[$refId], it);
    if ((operation & OPERATION.ADD) === OPERATION.ADD) {
      encoder.tryEncodeTypeId(bytes, type, value.constructor, it);
    }
  } else {
    encode.number(bytes, value[$refId], it);
  }
}
var encodeSchemaOperation = function(encoder, bytes, changeTree, index, operation, it, _, __, metadata) {
  bytes[it.offset++] = (index | operation) & 255;
  if (operation === OPERATION.DELETE) {
    return;
  }
  const ref = changeTree.ref;
  const field = metadata[index];
  encodeValue(encoder, bytes, metadata[index].type, ref[field.name], operation, it);
};
var encodeKeyValueOperation = function(encoder, bytes, changeTree, index, operation, it) {
  bytes[it.offset++] = operation & 255;
  encode.number(bytes, index, it);
  if (operation === OPERATION.DELETE) {
    return;
  }
  const ref = changeTree.ref;
  if ((operation & OPERATION.ADD) === OPERATION.ADD) {
    if (typeof ref["set"] === "function") {
      const dynamicIndex = changeTree.ref["$indexes"].get(index);
      encode.string(bytes, dynamicIndex, it);
    }
  }
  const type = ref[$childType];
  const value = ref[$getByIndex](index);
  encodeValue(encoder, bytes, type, value, operation, it);
};
var encodeArray = function(encoder, bytes, changeTree, field, operation, it, isEncodeAll, hasView) {
  const ref = changeTree.ref;
  const useOperationByRefId = hasView && changeTree.isFiltered && typeof changeTree.getType(field) !== "string";
  let refOrIndex;
  if (useOperationByRefId) {
    const item = ref["tmpItems"][field];
    if (!item) {
      return;
    }
    refOrIndex = item[$refId];
    if (operation === OPERATION.DELETE) {
      operation = OPERATION.DELETE_BY_REFID;
    } else if (operation === OPERATION.ADD) {
      operation = OPERATION.ADD_BY_REFID;
    }
  } else {
    refOrIndex = field;
  }
  bytes[it.offset++] = operation & 255;
  encode.number(bytes, refOrIndex, it);
  if (operation === OPERATION.DELETE || operation === OPERATION.DELETE_BY_REFID) {
    return;
  }
  const type = changeTree.getType(field);
  const value = changeTree.getValue(field, isEncodeAll);
  encodeValue(encoder, bytes, type, value, operation, it);
};
var DEFINITION_MISMATCH = -1;
function decodeValue(decoder2, operation, ref, index, type, bytes, it, allChanges) {
  const $root = decoder2.root;
  const previousValue = ref[$getByIndex](index);
  let value;
  if ((operation & OPERATION.DELETE) === OPERATION.DELETE) {
    const previousRefId = previousValue?.[$refId];
    if (previousRefId !== void 0) {
      $root.removeRef(previousRefId);
    }
    if (operation !== OPERATION.DELETE_AND_ADD) {
      ref[$deleteByIndex](index);
    }
    value = void 0;
  }
  if (operation === OPERATION.DELETE) ;
  else if (Schema.is(type)) {
    const refId = decode.number(bytes, it);
    value = $root.refs.get(refId);
    if ((operation & OPERATION.ADD) === OPERATION.ADD) {
      const childType = decoder2.getInstanceType(bytes, it, type);
      if (!value) {
        value = decoder2.createInstanceOfType(childType);
      }
      $root.addRef(refId, value, value !== previousValue || // increment ref count if value has changed
      operation === OPERATION.DELETE_AND_ADD && value === previousValue);
    }
  } else if (typeof type === "string") {
    value = decode[type](bytes, it);
  } else {
    const typeDef = getType(Object.keys(type)[0]);
    const refId = decode.number(bytes, it);
    const valueRef = $root.refs.has(refId) ? previousValue || $root.refs.get(refId) : new typeDef.constructor();
    value = valueRef.clone(true);
    value[$childType] = Object.values(type)[0];
    if (previousValue) {
      let previousRefId = previousValue[$refId];
      if (previousRefId !== void 0 && refId !== previousRefId) {
        const entries = previousValue.entries();
        let iter;
        while ((iter = entries.next()) && !iter.done) {
          const [key, value2] = iter.value;
          if (typeof value2 === "object") {
            previousRefId = value2[$refId];
            $root.removeRef(previousRefId);
          }
          allChanges.push({
            ref: previousValue,
            refId: previousRefId,
            op: OPERATION.DELETE,
            field: key,
            value: void 0,
            previousValue: value2
          });
        }
      }
    }
    $root.addRef(refId, value, valueRef !== previousValue || operation === OPERATION.DELETE_AND_ADD && valueRef === previousValue);
  }
  return { value, previousValue };
}
var decodeSchemaOperation = function(decoder2, bytes, it, ref, allChanges) {
  const first_byte = bytes[it.offset++];
  const metadata = ref.constructor[Symbol.metadata];
  const operation = first_byte >> 6 << 6;
  const index = first_byte % (operation || 255);
  const field = metadata[index];
  if (field === void 0) {
    console.warn("@colyseus/schema: field not defined at", { index, ref: ref.constructor.name, metadata });
    return DEFINITION_MISMATCH;
  }
  const { value, previousValue } = decodeValue(decoder2, operation, ref, index, field.type, bytes, it, allChanges);
  if (value !== null && value !== void 0) {
    ref[field.name] = value;
  }
  if (previousValue !== value) {
    allChanges.push({
      ref,
      refId: decoder2.currentRefId,
      op: operation,
      field: field.name,
      value,
      previousValue
    });
  }
};
var decodeKeyValueOperation = function(decoder2, bytes, it, ref, allChanges) {
  const operation = bytes[it.offset++];
  if (operation === OPERATION.CLEAR) {
    decoder2.removeChildRefs(ref, allChanges);
    ref.clear();
    return;
  }
  const index = decode.number(bytes, it);
  const type = ref[$childType];
  let dynamicIndex;
  if ((operation & OPERATION.ADD) === OPERATION.ADD) {
    if (typeof ref["set"] === "function") {
      dynamicIndex = decode.string(bytes, it);
      ref["setIndex"](index, dynamicIndex);
    } else {
      dynamicIndex = index;
    }
  } else {
    dynamicIndex = ref["getIndex"](index);
  }
  const { value, previousValue } = decodeValue(decoder2, operation, ref, index, type, bytes, it, allChanges);
  if (value !== null && value !== void 0) {
    if (typeof ref["set"] === "function") {
      ref["$items"].set(dynamicIndex, value);
    } else if (typeof ref["$setAt"] === "function") {
      ref["$setAt"](index, value, operation);
    } else if (typeof ref["add"] === "function") {
      const index2 = ref.add(value);
      if (typeof index2 === "number") {
        ref["setIndex"](index2, index2);
      }
    }
  }
  if (previousValue !== value) {
    allChanges.push({
      ref,
      refId: decoder2.currentRefId,
      op: operation,
      field: "",
      // FIXME: remove this
      dynamicIndex,
      value,
      previousValue
    });
  }
};
var decodeArray = function(decoder2, bytes, it, ref, allChanges) {
  let operation = bytes[it.offset++];
  let index;
  if (operation === OPERATION.CLEAR) {
    decoder2.removeChildRefs(ref, allChanges);
    ref.clear();
    return;
  } else if (operation === OPERATION.REVERSE) {
    ref.reverse();
    return;
  } else if (operation === OPERATION.DELETE_BY_REFID) {
    const refId = decode.number(bytes, it);
    const previousValue2 = decoder2.root.refs.get(refId);
    index = ref.findIndex((value2) => value2 === previousValue2);
    ref[$deleteByIndex](index);
    allChanges.push({
      ref,
      refId: decoder2.currentRefId,
      op: OPERATION.DELETE,
      field: "",
      // FIXME: remove this
      dynamicIndex: index,
      value: void 0,
      previousValue: previousValue2
    });
    return;
  } else if (operation === OPERATION.ADD_BY_REFID) {
    const refId = decode.number(bytes, it);
    const itemByRefId = decoder2.root.refs.get(refId);
    if (itemByRefId) {
      index = ref.findIndex((value2) => value2 === itemByRefId);
    }
    if (index === -1 || index === void 0) {
      index = ref.length;
    }
  } else {
    index = decode.number(bytes, it);
  }
  const type = ref[$childType];
  let dynamicIndex = index;
  const { value, previousValue } = decodeValue(decoder2, operation, ref, index, type, bytes, it, allChanges);
  if (value !== null && value !== void 0 && value !== previousValue) {
    ref["$setAt"](index, value, operation);
  }
  if (previousValue !== value) {
    allChanges.push({
      ref,
      refId: decoder2.currentRefId,
      op: operation,
      field: "",
      // FIXME: remove this
      dynamicIndex,
      value,
      previousValue
    });
  }
};
var EncodeSchemaError = class extends Error {
};
function assertType(value, type, klass, field) {
  let typeofTarget;
  let allowNull = false;
  switch (type) {
    case "number":
    case "int8":
    case "uint8":
    case "int16":
    case "uint16":
    case "int32":
    case "uint32":
    case "int64":
    case "uint64":
    case "float32":
    case "float64":
      typeofTarget = "number";
      if (isNaN(value)) {
        console.log(`trying to encode "NaN" in ${klass.constructor.name}#${field}`);
      }
      break;
    case "bigint64":
    case "biguint64":
      typeofTarget = "bigint";
      break;
    case "string":
      typeofTarget = "string";
      allowNull = true;
      break;
    case "boolean":
      return;
    default:
      return;
  }
  if (typeof value !== typeofTarget && (!allowNull || allowNull && value !== null)) {
    let foundValue = `'${JSON.stringify(value)}'${value && value.constructor && ` (${value.constructor.name})` || ""}`;
    throw new EncodeSchemaError(`a '${typeofTarget}' was expected, but ${foundValue} was provided in ${klass.constructor.name}#${field}`);
  }
}
function assertInstanceType(value, type, instance, field) {
  if (!(value instanceof type)) {
    throw new EncodeSchemaError(`a '${type.name}' was expected, but '${value && value.constructor.name}' was provided in ${instance.constructor.name}#${field}`);
  }
}
var DEFAULT_SORT = (a, b) => {
  const A = a.toString();
  const B = b.toString();
  if (A < B)
    return -1;
  else if (A > B)
    return 1;
  else
    return 0;
};
var _a, _b, _c, _d, _e, _f;
var _ArraySchema = class _ArraySchema {
  constructor(...items) {
    __publicField(this, _f);
    __publicField(this, _e);
    __publicField(this, _d);
    __publicField(this, "items", []);
    __publicField(this, "tmpItems", []);
    __publicField(this, "deletedIndexes", {});
    __publicField(this, "isMovingItems", false);
    // WORKAROUND for compatibility
    // - TypeScript 4 defines @@unscopables as a function
    // - TypeScript 5 defines @@unscopables as an object
    __publicField(this, _a);
    Object.defineProperty(this, $childType, {
      value: void 0,
      enumerable: false,
      writable: true,
      configurable: true
    });
    const proxy = new Proxy(this, {
      get: (obj, prop) => {
        if (typeof prop !== "symbol" && // FIXME: d8 accuses this as low performance
        !isNaN(prop)) {
          return this.items[prop];
        } else {
          return Reflect.get(obj, prop);
        }
      },
      set: (obj, key, setValue) => {
        if (typeof key !== "symbol" && !isNaN(key)) {
          if (setValue === void 0 || setValue === null) {
            obj.$deleteAt(key);
          } else {
            if (setValue[$changes]) {
              assertInstanceType(setValue, obj[$childType], obj, key);
              const previousValue = obj.items[key];
              if (!obj.isMovingItems) {
                obj.$changeAt(Number(key), setValue);
              } else {
                if (previousValue !== void 0) {
                  if (setValue[$changes].isNew) {
                    obj[$changes].indexedOperation(Number(key), OPERATION.MOVE_AND_ADD);
                  } else {
                    if ((obj[$changes].getChange(Number(key)) & OPERATION.DELETE) === OPERATION.DELETE) {
                      obj[$changes].indexedOperation(Number(key), OPERATION.DELETE_AND_MOVE);
                    } else {
                      obj[$changes].indexedOperation(Number(key), OPERATION.MOVE);
                    }
                  }
                } else if (setValue[$changes].isNew) {
                  obj[$changes].indexedOperation(Number(key), OPERATION.ADD);
                }
                setValue[$changes].setParent(this, obj[$changes].root, key);
              }
              if (previousValue !== void 0) {
                previousValue[$changes].root?.remove(previousValue[$changes]);
              }
            } else {
              obj.$changeAt(Number(key), setValue);
            }
            obj.items[key] = setValue;
            obj.tmpItems[key] = setValue;
          }
          return true;
        } else {
          return Reflect.set(obj, key, setValue);
        }
      },
      deleteProperty: (obj, prop) => {
        if (typeof prop === "number") {
          obj.$deleteAt(prop);
        } else {
          delete obj[prop];
        }
        return true;
      },
      has: (obj, key) => {
        if (typeof key !== "symbol" && !isNaN(Number(key))) {
          return Reflect.has(this.items, key);
        }
        return Reflect.has(obj, key);
      }
    });
    Object.defineProperty(this, $changes, {
      value: new ChangeTree(proxy),
      enumerable: false,
      writable: true
    });
    if (items.length > 0) {
      this.push(...items);
    }
    return proxy;
  }
  /**
   * Determine if a property must be filtered.
   * - If returns false, the property is NOT going to be encoded.
   * - If returns true, the property is going to be encoded.
   *
   * Encoding with "filters" happens in two steps:
   * - First, the encoder iterates over all "not owned" properties and encodes them.
   * - Then, the encoder iterates over all "owned" properties per instance and encodes them.
   */
  static [(_f = $changes, _e = $refId, _d = $childType, _c = $encoder, _b = $decoder, $filter)](ref, index, view2) {
    return !view2 || typeof ref[$childType] === "string" || view2.isChangeTreeVisible(ref["tmpItems"][index]?.[$changes]);
  }
  static is(type) {
    return (
      // type format: ["string"]
      Array.isArray(type) || // type format: { array: "string" }
      type["array"] !== void 0
    );
  }
  static from(iterable) {
    return new _ArraySchema(...Array.from(iterable));
  }
  set length(newLength) {
    if (newLength === 0) {
      this.clear();
    } else if (newLength < this.items.length) {
      this.splice(newLength, this.length - newLength);
    } else {
      console.warn("ArraySchema: can't set .length to a higher value than its length.");
    }
  }
  get length() {
    return this.items.length;
  }
  push(...values) {
    let length = this.tmpItems.length;
    const changeTree = this[$changes];
    for (let i = 0, l = values.length; i < l; i++, length++) {
      const value = values[i];
      if (value === void 0 || value === null) {
        return;
      } else if (typeof value === "object" && this[$childType]) {
        assertInstanceType(value, this[$childType], this, i);
      }
      changeTree.indexedOperation(length, OPERATION.ADD, this.items.length);
      this.items.push(value);
      this.tmpItems.push(value);
      value[$changes]?.setParent(this, changeTree.root, length);
    }
    return length;
  }
  /**
   * Removes the last element from an array and returns it.
   */
  pop() {
    let index = -1;
    for (let i = this.tmpItems.length - 1; i >= 0; i--) {
      if (this.deletedIndexes[i] !== true) {
        index = i;
        break;
      }
    }
    if (index < 0) {
      return void 0;
    }
    this[$changes].delete(index, void 0, this.items.length - 1);
    this.deletedIndexes[index] = true;
    return this.items.pop();
  }
  at(index) {
    if (index < 0)
      index += this.length;
    return this.items[index];
  }
  // encoding only
  $changeAt(index, value) {
    if (value === void 0 || value === null) {
      console.error("ArraySchema items cannot be null nor undefined; Use `deleteAt(index)` instead.");
      return;
    }
    if (this.items[index] === value) {
      return;
    }
    const operation = this.items[index] !== void 0 ? typeof value === "object" ? OPERATION.DELETE_AND_ADD : OPERATION.REPLACE : OPERATION.ADD;
    const changeTree = this[$changes];
    changeTree.change(index, operation);
    value[$changes]?.setParent(this, changeTree.root, index);
  }
  // encoding only
  $deleteAt(index, operation) {
    this[$changes].delete(index, operation);
  }
  // decoding only
  $setAt(index, value, operation) {
    if (index === 0 && operation === OPERATION.ADD && this.items[index] !== void 0) {
      this.items.unshift(value);
    } else if (operation === OPERATION.DELETE_AND_MOVE) {
      this.items.splice(index, 1);
      this.items[index] = value;
    } else {
      this.items[index] = value;
    }
  }
  clear() {
    if (this.items.length === 0) {
      return;
    }
    const changeTree = this[$changes];
    changeTree.forEachChild((childChangeTree, _) => {
      changeTree.root?.remove(childChangeTree);
    });
    changeTree.discard(true);
    changeTree.operation(OPERATION.CLEAR);
    this.items.length = 0;
    this.tmpItems.length = 0;
  }
  /**
   * Combines two or more arrays.
   * @param items Additional items to add to the end of array1.
   */
  // @ts-ignore
  concat(...items) {
    return new _ArraySchema(...this.items.concat(...items));
  }
  /**
   * Adds all the elements of an array separated by the specified separator string.
   * @param separator A string used to separate one element of an array from the next in the resulting String. If omitted, the array elements are separated with a comma.
   */
  join(separator) {
    return this.items.join(separator);
  }
  /**
   * Reverses the elements in an Array.
   */
  // @ts-ignore
  reverse() {
    this[$changes].operation(OPERATION.REVERSE);
    this.items.reverse();
    this.tmpItems.reverse();
    return this;
  }
  /**
   * Removes the first element from an array and returns it.
   */
  shift() {
    if (this.items.length === 0) {
      return void 0;
    }
    const changeTree = this[$changes];
    const index = this.tmpItems.findIndex((item) => item === this.items[0]);
    const allChangesIndex = this.items.findIndex((item) => item === this.items[0]);
    changeTree.delete(index, OPERATION.DELETE, allChangesIndex);
    changeTree.shiftAllChangeIndexes(-1, allChangesIndex);
    this.deletedIndexes[index] = true;
    return this.items.shift();
  }
  /**
   * Returns a section of an array.
   * @param start The beginning of the specified portion of the array.
   * @param end The end of the specified portion of the array. This is exclusive of the element at the index 'end'.
   */
  slice(start, end) {
    const sliced = new _ArraySchema();
    sliced.push(...this.items.slice(start, end));
    return sliced;
  }
  /**
   * Sorts an array.
   * @param compareFn Function used to determine the order of the elements. It is expected to return
   * a negative value if first argument is less than second argument, zero if they're equal and a positive
   * value otherwise. If omitted, the elements are sorted in ascending, ASCII character order.
   * ```ts
   * [11,2,22,1].sort((a, b) => a - b)
   * ```
   */
  sort(compareFn = DEFAULT_SORT) {
    this.isMovingItems = true;
    const changeTree = this[$changes];
    const sortedItems = this.items.sort(compareFn);
    sortedItems.forEach((_, i) => changeTree.change(i, OPERATION.REPLACE));
    this.tmpItems.sort(compareFn);
    this.isMovingItems = false;
    return this;
  }
  /**
   * Removes elements from an array and, if necessary, inserts new elements in their place, returning the deleted elements.
   * @param start The zero-based location in the array from which to start removing elements.
   * @param deleteCount The number of elements to remove.
   * @param insertItems Elements to insert into the array in place of the deleted elements.
   */
  splice(start, deleteCount, ...insertItems) {
    const changeTree = this[$changes];
    const itemsLength = this.items.length;
    const tmpItemsLength = this.tmpItems.length;
    const insertCount = insertItems.length;
    const indexes = [];
    for (let i = 0; i < tmpItemsLength; i++) {
      if (this.deletedIndexes[i] !== true) {
        indexes.push(i);
      }
    }
    if (itemsLength > start) {
      if (deleteCount === void 0) {
        deleteCount = itemsLength - start;
      }
      for (let i = start; i < start + deleteCount; i++) {
        const index = indexes[i];
        changeTree.delete(index, OPERATION.DELETE);
        this.deletedIndexes[index] = true;
      }
    } else {
      deleteCount = 0;
    }
    if (insertCount > 0) {
      if (insertCount > deleteCount) {
        console.error("Inserting more elements than deleting during ArraySchema#splice()");
        throw new Error("ArraySchema#splice(): insertCount must be equal or lower than deleteCount.");
      }
      for (let i = 0; i < insertCount; i++) {
        const addIndex = (indexes[start] ?? itemsLength) + i;
        changeTree.indexedOperation(addIndex, this.deletedIndexes[addIndex] ? OPERATION.DELETE_AND_ADD : OPERATION.ADD);
        insertItems[i][$changes]?.setParent(this, changeTree.root, addIndex);
      }
    }
    if (deleteCount > insertCount) {
      changeTree.shiftAllChangeIndexes(-(deleteCount - insertCount), indexes[start + insertCount]);
    }
    if (changeTree.filteredChanges !== void 0) {
      changeTree.root?.enqueueChangeTree(changeTree, "filteredChanges");
    } else {
      changeTree.root?.enqueueChangeTree(changeTree, "changes");
    }
    return this.items.splice(start, deleteCount, ...insertItems);
  }
  /**
   * Inserts new elements at the start of an array.
   * @param items  Elements to insert at the start of the Array.
   */
  unshift(...items) {
    const changeTree = this[$changes];
    changeTree.shiftChangeIndexes(items.length);
    if (changeTree.isFiltered) {
      setOperationAtIndex(changeTree.filteredChanges, this.items.length);
    } else {
      setOperationAtIndex(changeTree.allChanges, this.items.length);
    }
    items.forEach((_, index) => {
      changeTree.change(index, OPERATION.ADD);
    });
    this.tmpItems.unshift(...items);
    return this.items.unshift(...items);
  }
  /**
   * Returns the index of the first occurrence of a value in an array.
   * @param searchElement The value to locate in the array.
   * @param fromIndex The array index at which to begin the search. If fromIndex is omitted, the search starts at index 0.
   */
  indexOf(searchElement, fromIndex) {
    return this.items.indexOf(searchElement, fromIndex);
  }
  /**
   * Returns the index of the last occurrence of a specified value in an array.
   * @param searchElement The value to locate in the array.
   * @param fromIndex The array index at which to begin the search. If fromIndex is omitted, the search starts at the last index in the array.
   */
  lastIndexOf(searchElement, fromIndex = this.length - 1) {
    return this.items.lastIndexOf(searchElement, fromIndex);
  }
  every(callbackfn, thisArg) {
    return this.items.every(callbackfn, thisArg);
  }
  /**
   * Determines whether the specified callback function returns true for any element of an array.
   * @param callbackfn A function that accepts up to three arguments. The some method calls
   * the callbackfn function for each element in the array until the callbackfn returns a value
   * which is coercible to the Boolean value true, or until the end of the array.
   * @param thisArg An object to which the this keyword can refer in the callbackfn function.
   * If thisArg is omitted, undefined is used as the this value.
   */
  some(callbackfn, thisArg) {
    return this.items.some(callbackfn, thisArg);
  }
  /**
   * Performs the specified action for each element in an array.
   * @param callbackfn  A function that accepts up to three arguments. forEach calls the callbackfn function one time for each element in the array.
   * @param thisArg  An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
   */
  forEach(callbackfn, thisArg) {
    return this.items.forEach(callbackfn, thisArg);
  }
  /**
   * Calls a defined callback function on each element of an array, and returns an array that contains the results.
   * @param callbackfn A function that accepts up to three arguments. The map method calls the callbackfn function one time for each element in the array.
   * @param thisArg An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
   */
  map(callbackfn, thisArg) {
    return this.items.map(callbackfn, thisArg);
  }
  filter(callbackfn, thisArg) {
    return this.items.filter(callbackfn, thisArg);
  }
  /**
   * Calls the specified callback function for all the elements in an array. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.
   * @param callbackfn A function that accepts up to four arguments. The reduce method calls the callbackfn function one time for each element in the array.
   * @param initialValue If initialValue is specified, it is used as the initial value to start the accumulation. The first call to the callbackfn function provides this value as an argument instead of an array value.
   */
  reduce(callbackfn, initialValue) {
    return this.items.reduce(callbackfn, initialValue);
  }
  /**
   * Calls the specified callback function for all the elements in an array, in descending order. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.
   * @param callbackfn A function that accepts up to four arguments. The reduceRight method calls the callbackfn function one time for each element in the array.
   * @param initialValue If initialValue is specified, it is used as the initial value to start the accumulation. The first call to the callbackfn function provides this value as an argument instead of an array value.
   */
  reduceRight(callbackfn, initialValue) {
    return this.items.reduceRight(callbackfn, initialValue);
  }
  /**
   * Returns the value of the first element in the array where predicate is true, and undefined
   * otherwise.
   * @param predicate find calls predicate once for each element of the array, in ascending
   * order, until it finds one where predicate returns true. If such an element is found, find
   * immediately returns that element value. Otherwise, find returns undefined.
   * @param thisArg If provided, it will be used as the this value for each invocation of
   * predicate. If it is not provided, undefined is used instead.
   */
  find(predicate, thisArg) {
    return this.items.find(predicate, thisArg);
  }
  /**
   * Returns the index of the first element in the array where predicate is true, and -1
   * otherwise.
   * @param predicate find calls predicate once for each element of the array, in ascending
   * order, until it finds one where predicate returns true. If such an element is found,
   * findIndex immediately returns that element index. Otherwise, findIndex returns -1.
   * @param thisArg If provided, it will be used as the this value for each invocation of
   * predicate. If it is not provided, undefined is used instead.
   */
  findIndex(predicate, thisArg) {
    return this.items.findIndex(predicate, thisArg);
  }
  /**
   * Returns the this object after filling the section identified by start and end with value
   * @param value value to fill array section with
   * @param start index to start filling the array at. If start is negative, it is treated as
   * length+start where length is the length of the array.
   * @param end index to stop filling the array at. If end is negative, it is treated as
   * length+end.
   */
  fill(value, start, end) {
    throw new Error("ArraySchema#fill() not implemented");
  }
  /**
   * Returns the this object after copying a section of the array identified by start and end
   * to the same array starting at position target
   * @param target If target is negative, it is treated as length+target where length is the
   * length of the array.
   * @param start If start is negative, it is treated as length+start. If end is negative, it
   * is treated as length+end.
   * @param end If not specified, length of the this object is used as its default value.
   */
  copyWithin(target2, start, end) {
    throw new Error("ArraySchema#copyWithin() not implemented");
  }
  /**
   * Returns a string representation of an array.
   */
  toString() {
    return this.items.toString();
  }
  /**
   * Returns a string representation of an array. The elements are converted to string using their toLocalString methods.
   */
  toLocaleString() {
    return this.items.toLocaleString();
  }
  /** Iterator */
  [Symbol.iterator]() {
    return this.items[Symbol.iterator]();
  }
  static get [Symbol.species]() {
    return _ArraySchema;
  }
  /**
   * Returns an iterable of key, value pairs for every entry in the array
   */
  entries() {
    return this.items.entries();
  }
  /**
   * Returns an iterable of keys in the array
   */
  keys() {
    return this.items.keys();
  }
  /**
   * Returns an iterable of values in the array
   */
  values() {
    return this.items.values();
  }
  /**
   * Determines whether an array includes a certain element, returning true or false as appropriate.
   * @param searchElement The element to search for.
   * @param fromIndex The position in this array at which to begin searching for searchElement.
   */
  includes(searchElement, fromIndex) {
    return this.items.includes(searchElement, fromIndex);
  }
  //
  // ES2022
  //
  /**
   * Calls a defined callback function on each element of an array. Then, flattens the result into
   * a new array.
   * This is identical to a map followed by flat with depth 1.
   *
   * @param callback A function that accepts up to three arguments. The flatMap method calls the
   * callback function one time for each element in the array.
   * @param thisArg An object to which the this keyword can refer in the callback function. If
   * thisArg is omitted, undefined is used as the this value.
   */
  // @ts-ignore
  flatMap(callback, thisArg) {
    throw new Error("ArraySchema#flatMap() is not supported.");
  }
  /**
   * Returns a new array with all sub-array elements concatenated into it recursively up to the
   * specified depth.
   *
   * @param depth The maximum recursion depth
   */
  // @ts-ignore
  flat(depth) {
    throw new Error("ArraySchema#flat() is not supported.");
  }
  findLast() {
    return this.items.findLast.apply(this.items, arguments);
  }
  findLastIndex(...args) {
    return this.items.findLastIndex.apply(this.items, arguments);
  }
  //
  // ES2023
  //
  with(index, value) {
    const copy2 = this.items.slice();
    if (index < 0)
      index += this.length;
    copy2[index] = value;
    return new _ArraySchema(...copy2);
  }
  toReversed() {
    return this.items.slice().reverse();
  }
  toSorted(compareFn) {
    return this.items.slice().sort(compareFn);
  }
  // @ts-ignore
  toSpliced(start, deleteCount, ...items) {
    return this.items.toSpliced.apply(copy, arguments);
  }
  shuffle() {
    return this.move((_) => {
      let currentIndex = this.items.length;
      while (currentIndex != 0) {
        let randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [this[currentIndex], this[randomIndex]] = [this[randomIndex], this[currentIndex]];
      }
    });
  }
  /**
   * Allows to move items around in the array.
   *
   * Example:
   *     state.cards.move((cards) => {
   *         [cards[4], cards[3]] = [cards[3], cards[4]];
   *         [cards[3], cards[2]] = [cards[2], cards[3]];
   *         [cards[2], cards[0]] = [cards[0], cards[2]];
   *         [cards[1], cards[1]] = [cards[1], cards[1]];
   *         [cards[0], cards[0]] = [cards[0], cards[0]];
   *     })
   *
   * @param cb
   * @returns
   */
  move(cb) {
    this.isMovingItems = true;
    cb(this);
    this.isMovingItems = false;
    return this;
  }
  [(_a = Symbol.unscopables, $getByIndex)](index, isEncodeAll = false) {
    return isEncodeAll ? this.items[index] : this.deletedIndexes[index] ? this.items[index] : this.tmpItems[index] || this.items[index];
  }
  [$deleteByIndex](index) {
    this.items[index] = void 0;
    this.tmpItems[index] = void 0;
  }
  [$onEncodeEnd]() {
    this.tmpItems = this.items.slice();
    this.deletedIndexes = {};
  }
  [$onDecodeEnd]() {
    this.items = this.items.filter((item) => item !== void 0);
    this.tmpItems = this.items.slice();
  }
  toArray() {
    return this.items.slice(0);
  }
  toJSON() {
    return this.toArray().map((value) => {
      return typeof value["toJSON"] === "function" ? value["toJSON"]() : value;
    });
  }
  //
  // Decoding utilities
  //
  clone(isDecoding) {
    let cloned;
    if (isDecoding) {
      cloned = new _ArraySchema();
      cloned.push(...this.items);
    } else {
      cloned = new _ArraySchema(...this.map((item) => item[$changes] ? item.clone() : item));
    }
    return cloned;
  }
};
__publicField(_ArraySchema, _c, encodeArray);
__publicField(_ArraySchema, _b, decodeArray);
var ArraySchema = _ArraySchema;
registerType("array", { constructor: ArraySchema });
var _a2, _b2, _c2, _d2, _e2;
var _MapSchema = class _MapSchema {
  constructor(initialValues) {
    __publicField(this, _e2);
    __publicField(this, _d2);
    __publicField(this, "childType");
    __publicField(this, _c2);
    __publicField(this, "$items", /* @__PURE__ */ new Map());
    __publicField(this, "$indexes", /* @__PURE__ */ new Map());
    __publicField(this, "deletedItems", {});
    const changeTree = new ChangeTree(this);
    changeTree.indexes = {};
    Object.defineProperty(this, $changes, {
      value: changeTree,
      enumerable: false,
      writable: true
    });
    if (initialValues) {
      if (initialValues instanceof Map || initialValues instanceof _MapSchema) {
        initialValues.forEach((v, k) => this.set(k, v));
      } else {
        for (const k in initialValues) {
          this.set(k, initialValues[k]);
        }
      }
    }
    Object.defineProperty(this, $childType, {
      value: void 0,
      enumerable: false,
      writable: true,
      configurable: true
    });
  }
  /**
   * Determine if a property must be filtered.
   * - If returns false, the property is NOT going to be encoded.
   * - If returns true, the property is going to be encoded.
   *
   * Encoding with "filters" happens in two steps:
   * - First, the encoder iterates over all "not owned" properties and encodes them.
   * - Then, the encoder iterates over all "owned" properties per instance and encodes them.
   */
  static [(_e2 = $changes, _d2 = $refId, _c2 = $childType, _b2 = $encoder, _a2 = $decoder, $filter)](ref, index, view2) {
    return !view2 || typeof ref[$childType] === "string" || view2.isChangeTreeVisible((ref[$getByIndex](index) ?? ref.deletedItems[index])[$changes]);
  }
  static is(type) {
    return type["map"] !== void 0;
  }
  /** Iterator */
  [Symbol.iterator]() {
    return this.$items[Symbol.iterator]();
  }
  get [Symbol.toStringTag]() {
    return this.$items[Symbol.toStringTag];
  }
  static get [Symbol.species]() {
    return _MapSchema;
  }
  set(key, value) {
    if (value === void 0 || value === null) {
      throw new Error(`MapSchema#set('${key}', ${value}): trying to set ${value} value on '${key}'.`);
    } else if (typeof value === "object" && this[$childType]) {
      assertInstanceType(value, this[$childType], this, key);
    }
    key = key.toString();
    const changeTree = this[$changes];
    const isRef = value[$changes] !== void 0;
    let index;
    let operation;
    if (typeof changeTree.indexes[key] !== "undefined") {
      index = changeTree.indexes[key];
      operation = OPERATION.REPLACE;
      const previousValue = this.$items.get(key);
      if (previousValue === value) {
        return;
      } else if (isRef) {
        operation = OPERATION.DELETE_AND_ADD;
        if (previousValue !== void 0) {
          previousValue[$changes].root?.remove(previousValue[$changes]);
        }
      }
      if (this.deletedItems[index]) {
        delete this.deletedItems[index];
      }
    } else {
      index = changeTree.indexes[$numFields] ?? 0;
      operation = OPERATION.ADD;
      this.$indexes.set(index, key);
      changeTree.indexes[key] = index;
      changeTree.indexes[$numFields] = index + 1;
    }
    this.$items.set(key, value);
    changeTree.change(index, operation);
    if (isRef) {
      value[$changes].setParent(this, changeTree.root, index);
    }
    return this;
  }
  get(key) {
    return this.$items.get(key);
  }
  delete(key) {
    if (!this.$items.has(key)) {
      return false;
    }
    const index = this[$changes].indexes[key];
    this.deletedItems[index] = this[$changes].delete(index);
    return this.$items.delete(key);
  }
  clear() {
    const changeTree = this[$changes];
    changeTree.discard(true);
    changeTree.indexes = {};
    changeTree.forEachChild((childChangeTree, _) => {
      changeTree.root?.remove(childChangeTree);
    });
    this.$indexes.clear();
    this.$items.clear();
    changeTree.operation(OPERATION.CLEAR);
  }
  has(key) {
    return this.$items.has(key);
  }
  forEach(callbackfn) {
    this.$items.forEach(callbackfn);
  }
  entries() {
    return this.$items.entries();
  }
  keys() {
    return this.$items.keys();
  }
  values() {
    return this.$items.values();
  }
  get size() {
    return this.$items.size;
  }
  setIndex(index, key) {
    this.$indexes.set(index, key);
  }
  getIndex(index) {
    return this.$indexes.get(index);
  }
  [$getByIndex](index) {
    return this.$items.get(this.$indexes.get(index));
  }
  [$deleteByIndex](index) {
    const key = this.$indexes.get(index);
    this.$items.delete(key);
    this.$indexes.delete(index);
  }
  [$onEncodeEnd]() {
    const changeTree = this[$changes];
    for (const indexStr in this.deletedItems) {
      const index = parseInt(indexStr);
      const key = this.$indexes.get(index);
      delete changeTree.indexes[key];
      this.$indexes.delete(index);
    }
    this.deletedItems = {};
  }
  toJSON() {
    const map = {};
    this.forEach((value, key) => {
      map[key] = typeof value["toJSON"] === "function" ? value["toJSON"]() : value;
    });
    return map;
  }
  //
  // Decoding utilities
  //
  // @ts-ignore
  clone(isDecoding) {
    let cloned;
    if (isDecoding) {
      cloned = Object.assign(new _MapSchema(), this);
    } else {
      cloned = new _MapSchema();
      this.forEach((value, key) => {
        if (value[$changes]) {
          cloned.set(key, value["clone"]());
        } else {
          cloned.set(key, value);
        }
      });
    }
    return cloned;
  }
};
__publicField(_MapSchema, _b2, encodeKeyValueOperation);
__publicField(_MapSchema, _a2, decodeKeyValueOperation);
var MapSchema = _MapSchema;
registerType("map", { constructor: MapSchema });
var _a3, _b3, _c3, _d3, _e3;
var _CollectionSchema = class _CollectionSchema {
  constructor(initialValues) {
    __publicField(this, _e3);
    __publicField(this, _d3);
    __publicField(this, _c3);
    __publicField(this, "$items", /* @__PURE__ */ new Map());
    __publicField(this, "$indexes", /* @__PURE__ */ new Map());
    __publicField(this, "deletedItems", {});
    __publicField(this, "$refId", 0);
    this[$changes] = new ChangeTree(this);
    this[$changes].indexes = {};
    if (initialValues) {
      initialValues.forEach((v) => this.add(v));
    }
    Object.defineProperty(this, $childType, {
      value: void 0,
      enumerable: false,
      writable: true,
      configurable: true
    });
  }
  /**
   * Determine if a property must be filtered.
   * - If returns false, the property is NOT going to be encoded.
   * - If returns true, the property is going to be encoded.
   *
   * Encoding with "filters" happens in two steps:
   * - First, the encoder iterates over all "not owned" properties and encodes them.
   * - Then, the encoder iterates over all "owned" properties per instance and encodes them.
   */
  static [(_e3 = $changes, _d3 = $refId, _c3 = $childType, _b3 = $encoder, _a3 = $decoder, $filter)](ref, index, view2) {
    return !view2 || typeof ref[$childType] === "string" || view2.isChangeTreeVisible((ref[$getByIndex](index) ?? ref.deletedItems[index])[$changes]);
  }
  static is(type) {
    return type["collection"] !== void 0;
  }
  add(value) {
    const index = this.$refId++;
    const isRef = value[$changes] !== void 0;
    if (isRef) {
      value[$changes].setParent(this, this[$changes].root, index);
    }
    this[$changes].indexes[index] = index;
    this.$indexes.set(index, index);
    this.$items.set(index, value);
    this[$changes].change(index);
    return index;
  }
  at(index) {
    const key = Array.from(this.$items.keys())[index];
    return this.$items.get(key);
  }
  entries() {
    return this.$items.entries();
  }
  delete(item) {
    const entries = this.$items.entries();
    let index;
    let entry;
    while (entry = entries.next()) {
      if (entry.done) {
        break;
      }
      if (item === entry.value[1]) {
        index = entry.value[0];
        break;
      }
    }
    if (index === void 0) {
      return false;
    }
    this.deletedItems[index] = this[$changes].delete(index);
    this.$indexes.delete(index);
    return this.$items.delete(index);
  }
  clear() {
    const changeTree = this[$changes];
    changeTree.discard(true);
    changeTree.indexes = {};
    changeTree.forEachChild((childChangeTree, _) => {
      changeTree.root?.remove(childChangeTree);
    });
    this.$indexes.clear();
    this.$items.clear();
    changeTree.operation(OPERATION.CLEAR);
  }
  has(value) {
    return Array.from(this.$items.values()).some((v) => v === value);
  }
  forEach(callbackfn) {
    this.$items.forEach((value, key, _) => callbackfn(value, key, this));
  }
  values() {
    return this.$items.values();
  }
  get size() {
    return this.$items.size;
  }
  /** Iterator */
  [Symbol.iterator]() {
    return this.$items.values();
  }
  setIndex(index, key) {
    this.$indexes.set(index, key);
  }
  getIndex(index) {
    return this.$indexes.get(index);
  }
  [$getByIndex](index) {
    return this.$items.get(this.$indexes.get(index));
  }
  [$deleteByIndex](index) {
    const key = this.$indexes.get(index);
    this.$items.delete(key);
    this.$indexes.delete(index);
  }
  [$onEncodeEnd]() {
    this.deletedItems = {};
  }
  toArray() {
    return Array.from(this.$items.values());
  }
  toJSON() {
    const values = [];
    this.forEach((value, key) => {
      values.push(typeof value["toJSON"] === "function" ? value["toJSON"]() : value);
    });
    return values;
  }
  //
  // Decoding utilities
  //
  clone(isDecoding) {
    let cloned;
    if (isDecoding) {
      cloned = Object.assign(new _CollectionSchema(), this);
    } else {
      cloned = new _CollectionSchema();
      this.forEach((value) => {
        if (value[$changes]) {
          cloned.add(value["clone"]());
        } else {
          cloned.add(value);
        }
      });
    }
    return cloned;
  }
};
__publicField(_CollectionSchema, _b3, encodeKeyValueOperation);
__publicField(_CollectionSchema, _a3, decodeKeyValueOperation);
var CollectionSchema = _CollectionSchema;
registerType("collection", { constructor: CollectionSchema });
var _a4, _b4, _c4, _d4, _e4;
var _SetSchema = class _SetSchema {
  constructor(initialValues) {
    __publicField(this, _e4);
    __publicField(this, _d4);
    __publicField(this, _c4);
    __publicField(this, "$items", /* @__PURE__ */ new Map());
    __publicField(this, "$indexes", /* @__PURE__ */ new Map());
    __publicField(this, "deletedItems", {});
    __publicField(this, "$refId", 0);
    this[$changes] = new ChangeTree(this);
    this[$changes].indexes = {};
    if (initialValues) {
      initialValues.forEach((v) => this.add(v));
    }
    Object.defineProperty(this, $childType, {
      value: void 0,
      enumerable: false,
      writable: true,
      configurable: true
    });
  }
  /**
   * Determine if a property must be filtered.
   * - If returns false, the property is NOT going to be encoded.
   * - If returns true, the property is going to be encoded.
   *
   * Encoding with "filters" happens in two steps:
   * - First, the encoder iterates over all "not owned" properties and encodes them.
   * - Then, the encoder iterates over all "owned" properties per instance and encodes them.
   */
  static [(_e4 = $changes, _d4 = $refId, _c4 = $childType, _b4 = $encoder, _a4 = $decoder, $filter)](ref, index, view2) {
    return !view2 || typeof ref[$childType] === "string" || view2.visible.has((ref[$getByIndex](index) ?? ref.deletedItems[index])[$changes]);
  }
  static is(type) {
    return type["set"] !== void 0;
  }
  add(value) {
    if (this.has(value)) {
      return false;
    }
    const index = this.$refId++;
    if (value[$changes] !== void 0) {
      value[$changes].setParent(this, this[$changes].root, index);
    }
    const operation = this[$changes].indexes[index]?.op ?? OPERATION.ADD;
    this[$changes].indexes[index] = index;
    this.$indexes.set(index, index);
    this.$items.set(index, value);
    this[$changes].change(index, operation);
    return index;
  }
  entries() {
    return this.$items.entries();
  }
  delete(item) {
    const entries = this.$items.entries();
    let index;
    let entry;
    while (entry = entries.next()) {
      if (entry.done) {
        break;
      }
      if (item === entry.value[1]) {
        index = entry.value[0];
        break;
      }
    }
    if (index === void 0) {
      return false;
    }
    this.deletedItems[index] = this[$changes].delete(index);
    this.$indexes.delete(index);
    return this.$items.delete(index);
  }
  clear() {
    const changeTree = this[$changes];
    changeTree.discard(true);
    changeTree.indexes = {};
    this.$indexes.clear();
    this.$items.clear();
    changeTree.operation(OPERATION.CLEAR);
  }
  has(value) {
    const values = this.$items.values();
    let has = false;
    let entry;
    while (entry = values.next()) {
      if (entry.done) {
        break;
      }
      if (value === entry.value) {
        has = true;
        break;
      }
    }
    return has;
  }
  forEach(callbackfn) {
    this.$items.forEach((value, key, _) => callbackfn(value, key, this));
  }
  values() {
    return this.$items.values();
  }
  get size() {
    return this.$items.size;
  }
  /** Iterator */
  [Symbol.iterator]() {
    return this.$items.values();
  }
  setIndex(index, key) {
    this.$indexes.set(index, key);
  }
  getIndex(index) {
    return this.$indexes.get(index);
  }
  [$getByIndex](index) {
    return this.$items.get(this.$indexes.get(index));
  }
  [$deleteByIndex](index) {
    const key = this.$indexes.get(index);
    this.$items.delete(key);
    this.$indexes.delete(index);
  }
  [$onEncodeEnd]() {
    this.deletedItems = {};
  }
  toArray() {
    return Array.from(this.$items.values());
  }
  toJSON() {
    const values = [];
    this.forEach((value, key) => {
      values.push(typeof value["toJSON"] === "function" ? value["toJSON"]() : value);
    });
    return values;
  }
  //
  // Decoding utilities
  //
  clone(isDecoding) {
    let cloned;
    if (isDecoding) {
      cloned = Object.assign(new _SetSchema(), this);
    } else {
      cloned = new _SetSchema();
      this.forEach((value) => {
        if (value[$changes]) {
          cloned.add(value["clone"]());
        } else {
          cloned.add(value);
        }
      });
    }
    return cloned;
  }
};
__publicField(_SetSchema, _b4, encodeKeyValueOperation);
__publicField(_SetSchema, _a4, decodeKeyValueOperation);
var SetSchema = _SetSchema;
registerType("set", { constructor: SetSchema });
var DEFAULT_VIEW_TAG = -1;
function view(tag = DEFAULT_VIEW_TAG) {
  return function(target2, fieldName) {
    var _a6;
    const constructor = target2.constructor;
    const parentClass = Object.getPrototypeOf(constructor);
    const parentMetadata = parentClass[Symbol.metadata];
    const metadata = constructor[_a6 = Symbol.metadata] ?? (constructor[_a6] = Object.assign({}, constructor[Symbol.metadata], parentMetadata ?? /* @__PURE__ */ Object.create(null)));
    Metadata.setTag(metadata, fieldName, tag);
  };
}
function getPropertyDescriptor(fieldCached, fieldIndex, type, complexTypeKlass) {
  return {
    get: function() {
      return this[fieldCached];
    },
    set: function(value) {
      const previousValue = this[fieldCached] ?? void 0;
      if (value === previousValue) {
        return;
      }
      if (value !== void 0 && value !== null) {
        if (complexTypeKlass) {
          if (complexTypeKlass.constructor === ArraySchema && !(value instanceof ArraySchema)) {
            value = new ArraySchema(...value);
          }
          if (complexTypeKlass.constructor === MapSchema && !(value instanceof MapSchema)) {
            value = new MapSchema(value);
          }
          value[$childType] = type;
        } else if (typeof type !== "string") {
          assertInstanceType(value, type, this, fieldCached.substring(1));
        } else {
          assertType(value, type, this, fieldCached.substring(1));
        }
        const changeTree = this[$changes];
        if (previousValue !== void 0 && previousValue[$changes]) {
          changeTree.root?.remove(previousValue[$changes]);
          this.constructor[$track](changeTree, fieldIndex, OPERATION.DELETE_AND_ADD);
        } else {
          this.constructor[$track](changeTree, fieldIndex, OPERATION.ADD);
        }
        value[$changes]?.setParent(this, changeTree.root, fieldIndex);
      } else if (previousValue !== void 0) {
        this[$changes].delete(fieldIndex);
      }
      this[fieldCached] = value;
    },
    enumerable: true,
    configurable: true
  };
}
function schema(fieldsAndMethods, name, inherits = Schema) {
  const fields = {};
  const methods = {};
  const defaultValues = {};
  const viewTagFields = {};
  for (let fieldName in fieldsAndMethods) {
    const value = fieldsAndMethods[fieldName];
    if (typeof value === "object") {
      if (value["view"] !== void 0) {
        viewTagFields[fieldName] = typeof value["view"] === "boolean" ? DEFAULT_VIEW_TAG : value["view"];
      }
      if (value["sync"] !== false) {
        fields[fieldName] = getNormalizedType(value);
      }
      if (!Object.prototype.hasOwnProperty.call(value, "default")) {
        if (Array.isArray(value) || value["array"] !== void 0) {
          defaultValues[fieldName] = new ArraySchema();
        } else if (value["map"] !== void 0) {
          defaultValues[fieldName] = new MapSchema();
        } else if (value["collection"] !== void 0) {
          defaultValues[fieldName] = new CollectionSchema();
        } else if (value["set"] !== void 0) {
          defaultValues[fieldName] = new SetSchema();
        } else if (value["type"] !== void 0 && Schema.is(value["type"])) {
          if (!value["type"].prototype.initialize || value["type"].prototype.initialize.length === 0) {
            defaultValues[fieldName] = new value["type"]();
          }
        }
      } else {
        defaultValues[fieldName] = value["default"];
      }
    } else if (typeof value === "function") {
      if (Schema.is(value)) {
        if (!value.prototype.initialize || value.prototype.initialize.length === 0) {
          defaultValues[fieldName] = new value();
        }
        fields[fieldName] = getNormalizedType(value);
      } else {
        methods[fieldName] = value;
      }
    } else {
      fields[fieldName] = getNormalizedType(value);
    }
  }
  const getDefaultValues = () => {
    const defaults = {};
    for (const fieldName in defaultValues) {
      const defaultValue = defaultValues[fieldName];
      if (defaultValue && typeof defaultValue.clone === "function") {
        defaults[fieldName] = defaultValue.clone();
      } else {
        defaults[fieldName] = defaultValue;
      }
    }
    return defaults;
  };
  const getParentProps = (props) => {
    const fieldNames = Object.keys(fields);
    const parentProps = {};
    for (const key in props) {
      if (!fieldNames.includes(key)) {
        parentProps[key] = props[key];
      }
    }
    return parentProps;
  };
  const klass = Metadata.setFields(class extends inherits {
    constructor(...args) {
      if (methods.initialize && typeof methods.initialize === "function") {
        super(Object.assign({}, getDefaultValues(), getParentProps(args[0] || {})));
        if (new.target === klass) {
          methods.initialize.apply(this, args);
        }
      } else {
        super(Object.assign({}, getDefaultValues(), args[0] || {}));
      }
    }
  }, fields);
  klass._getDefaultValues = getDefaultValues;
  Object.assign(klass.prototype, methods);
  for (let fieldName in viewTagFields) {
    view(viewTagFields[fieldName])(klass.prototype, fieldName);
  }
  if (name) {
    Object.defineProperty(klass, "name", { value: name });
  }
  klass.extends = (fields2, name2) => schema(fields2, name2, klass);
  return klass;
}
function getIndent(level) {
  return new Array(level).fill(0).map((_, i) => i === level - 1 ? `\u2514\u2500 ` : `   `).join("");
}
var _a5, _b5, _c5, _d5;
var _Schema = class _Schema {
  // allow inherited classes to have a constructor
  constructor(arg) {
    __publicField(this, _a5);
    _Schema.initialize(this);
    if (arg) {
      Object.assign(this, arg);
    }
  }
  /**
   * Assign the property descriptors required to track changes on this instance.
   * @param instance
   */
  static initialize(instance) {
    Object.defineProperty(instance, $changes, {
      value: new ChangeTree(instance),
      enumerable: false,
      writable: true
    });
    Object.defineProperties(instance, instance.constructor[Symbol.metadata]?.[$descriptors] || {});
  }
  static is(type) {
    return typeof type[Symbol.metadata] === "object";
  }
  /**
   * Check if a value is an instance of Schema.
   * This method uses duck-typing to avoid issues with multiple @colyseus/schema versions.
   * @param obj Value to check
   * @returns true if the value is a Schema instance
   */
  static isSchema(obj) {
    return typeof obj?.assign === "function";
  }
  /**
   * Track property changes
   */
  static [(_d5 = Symbol.metadata, _c5 = $encoder, _b5 = $decoder, _a5 = $refId, $track)](changeTree, index, operation = OPERATION.ADD) {
    changeTree.change(index, operation);
  }
  /**
   * Determine if a property must be filtered.
   * - If returns false, the property is NOT going to be encoded.
   * - If returns true, the property is going to be encoded.
   *
   * Encoding with "filters" happens in two steps:
   * - First, the encoder iterates over all "not owned" properties and encodes them.
   * - Then, the encoder iterates over all "owned" properties per instance and encodes them.
   */
  static [$filter](ref, index, view2) {
    const metadata = ref.constructor[Symbol.metadata];
    const tag = metadata[index]?.tag;
    if (view2 === void 0) {
      return tag === void 0;
    } else if (tag === void 0) {
      return true;
    } else if (tag === DEFAULT_VIEW_TAG) {
      return view2.isChangeTreeVisible(ref[$changes]);
    } else {
      const tags = view2.tags?.get(ref[$changes]);
      return tags && tags.has(tag);
    }
  }
  /**
   * Assign properties to the instance.
   * @param props Properties to assign to the instance
   * @returns
   */
  assign(props) {
    Object.assign(this, props);
    return this;
  }
  /**
   * Restore the instance from JSON data.
   * @param jsonData JSON data to restore the instance from
   * @returns
   */
  restore(jsonData) {
    const metadata = this.constructor[Symbol.metadata];
    for (const fieldIndex in metadata) {
      const field = metadata[fieldIndex];
      const fieldName = field.name;
      const fieldType = field.type;
      const value = jsonData[fieldName];
      if (value === void 0 || value === null) {
        continue;
      }
      if (typeof fieldType === "string") {
        this[fieldName] = value;
      } else if (_Schema.is(fieldType)) {
        const instance = new fieldType();
        instance.restore(value);
        this[fieldName] = instance;
      } else if (typeof fieldType === "object") {
        const collectionType = Object.keys(fieldType)[0];
        const childType = fieldType[collectionType];
        if (collectionType === "map") {
          const mapSchema = this[fieldName];
          for (const key in value) {
            if (_Schema.is(childType)) {
              const childInstance = new childType();
              childInstance.restore(value[key]);
              mapSchema.set(key, childInstance);
            } else {
              mapSchema.set(key, value[key]);
            }
          }
        } else if (collectionType === "array") {
          const arraySchema = this[fieldName];
          for (let i = 0; i < value.length; i++) {
            if (_Schema.is(childType)) {
              const childInstance = new childType();
              childInstance.restore(value[i]);
              arraySchema.push(childInstance);
            } else {
              arraySchema.push(value[i]);
            }
          }
        }
      }
    }
    return this;
  }
  /**
   * (Server-side): Flag a property to be encoded for the next patch.
   * @param instance Schema instance
   * @param property string representing the property name, or number representing the index of the property.
   * @param operation OPERATION to perform (detected automatically)
   */
  setDirty(property, operation) {
    const metadata = this.constructor[Symbol.metadata];
    this[$changes].change(metadata[metadata[property]].index, operation);
  }
  clone() {
    const cloned = Object.create(this.constructor.prototype);
    _Schema.initialize(cloned);
    const metadata = this.constructor[Symbol.metadata];
    for (const fieldIndex in metadata) {
      const field = metadata[fieldIndex].name;
      if (typeof this[field] === "object" && typeof this[field]?.clone === "function") {
        cloned[field] = this[field].clone();
      } else {
        cloned[field] = this[field];
      }
    }
    return cloned;
  }
  toJSON() {
    const obj = {};
    const metadata = this.constructor[Symbol.metadata];
    for (const index in metadata) {
      const field = metadata[index];
      const fieldName = field.name;
      if (!field.deprecated && this[fieldName] !== null && typeof this[fieldName] !== "undefined") {
        obj[fieldName] = typeof this[fieldName]["toJSON"] === "function" ? this[fieldName]["toJSON"]() : this[fieldName];
      }
    }
    return obj;
  }
  /**
   * Used in tests only
   * @internal
   */
  discardAllChanges() {
    this[$changes].discardAll();
  }
  [$getByIndex](index) {
    const metadata = this.constructor[Symbol.metadata];
    return this[metadata[index].name];
  }
  [$deleteByIndex](index) {
    const metadata = this.constructor[Symbol.metadata];
    this[metadata[index].name] = void 0;
  }
  /**
   * Inspect the `refId` of all Schema instances in the tree. Optionally display the contents of the instance.
   *
   * @param ref Schema instance
   * @param showContents display JSON contents of the instance
   * @returns
   */
  static debugRefIds(ref, showContents = false, level = 0, decoder2, keyPrefix = "") {
    const contents = showContents ? ` - ${JSON.stringify(ref.toJSON())}` : "";
    const changeTree = ref[$changes];
    const refId = ref[$refId];
    const root = decoder2 ? decoder2.root : changeTree.root;
    const refCount = root?.refCount?.[refId] > 1 ? ` [\xD7${root.refCount[refId]}]` : "";
    let output = `${getIndent(level)}${keyPrefix}${ref.constructor.name} (refId: ${refId})${refCount}${contents}
`;
    changeTree.forEachChild((childChangeTree, indexOrKey) => {
      let key = indexOrKey;
      if (typeof indexOrKey === "number" && ref["$indexes"]) {
        key = ref["$indexes"].get(indexOrKey) ?? indexOrKey;
      }
      const keyPrefix2 = ref["forEach"] !== void 0 && key !== void 0 ? `["${key}"]: ` : "";
      output += this.debugRefIds(childChangeTree.ref, showContents, level + 1, decoder2, keyPrefix2);
    });
    return output;
  }
  static debugRefIdEncodingOrder(ref, changeSet = "allChanges") {
    let encodeOrder = [];
    let current = ref[$changes].root[changeSet].next;
    while (current) {
      if (current.changeTree) {
        encodeOrder.push(current.changeTree.ref[$refId]);
      }
      current = current.next;
    }
    return encodeOrder;
  }
  static debugRefIdsFromDecoder(decoder2) {
    return this.debugRefIds(decoder2.state, false, 0, decoder2);
  }
  /**
   * Return a string representation of the changes on a Schema instance.
   * The list of changes is cleared after each encode.
   *
   * @param instance Schema instance
   * @param isEncodeAll Return "full encode" instead of current change set.
   * @returns
   */
  static debugChanges(instance, isEncodeAll = false) {
    const changeTree = instance[$changes];
    const changeSet = isEncodeAll ? changeTree.allChanges : changeTree.changes;
    const changeSetName = isEncodeAll ? "allChanges" : "changes";
    let output = `${instance.constructor.name} (${instance[$refId]}) -> .${changeSetName}:
`;
    function dumpChangeSet(changeSet2) {
      changeSet2.operations.filter((op) => op).forEach((index) => {
        const operation = changeTree.indexedOperations[index];
        output += `- [${index}]: ${OPERATION[operation]} (${JSON.stringify(changeTree.getValue(Number(index), isEncodeAll))})
`;
      });
    }
    dumpChangeSet(changeSet);
    if (!isEncodeAll && changeTree.filteredChanges && changeTree.filteredChanges.operations.filter((op) => op).length > 0) {
      output += `${instance.constructor.name} (${instance[$refId]}) -> .filteredChanges:
`;
      dumpChangeSet(changeTree.filteredChanges);
    }
    if (isEncodeAll && changeTree.allFilteredChanges && changeTree.allFilteredChanges.operations.filter((op) => op).length > 0) {
      output += `${instance.constructor.name} (${instance[$refId]}) -> .allFilteredChanges:
`;
      dumpChangeSet(changeTree.allFilteredChanges);
    }
    return output;
  }
  static debugChangesDeep(ref, changeSetName = "changes") {
    let output = "";
    const rootChangeTree = ref[$changes];
    const root = rootChangeTree.root;
    const changeTrees = /* @__PURE__ */ new Map();
    const instanceRefIds = [];
    let totalOperations = 0;
    for (const [refId, changes] of Object.entries(root[changeSetName])) {
      const changeTree = root.changeTrees[refId];
      if (!changeTree) {
        continue;
      }
      let includeChangeTree = false;
      let parentChangeTrees = [];
      let parentChangeTree = changeTree.parent?.[$changes];
      if (changeTree === rootChangeTree) {
        includeChangeTree = true;
      } else {
        while (parentChangeTree !== void 0) {
          parentChangeTrees.push(parentChangeTree);
          if (parentChangeTree.ref === ref) {
            includeChangeTree = true;
            break;
          }
          parentChangeTree = parentChangeTree.parent?.[$changes];
        }
      }
      if (includeChangeTree) {
        instanceRefIds.push(changeTree.ref[$refId]);
        totalOperations += Object.keys(changes).length;
        changeTrees.set(changeTree, parentChangeTrees.reverse());
      }
    }
    output += "---\n";
    output += `root refId: ${rootChangeTree.ref[$refId]}
`;
    output += `Total instances: ${instanceRefIds.length} (refIds: ${instanceRefIds.join(", ")})
`;
    output += `Total changes: ${totalOperations}
`;
    output += "---\n";
    const visitedParents = /* @__PURE__ */ new WeakSet();
    for (const [changeTree, parentChangeTrees] of changeTrees.entries()) {
      parentChangeTrees.forEach((parentChangeTree, level2) => {
        if (!visitedParents.has(parentChangeTree)) {
          output += `${getIndent(level2)}${parentChangeTree.ref.constructor.name} (refId: ${parentChangeTree.ref[$refId]})
`;
          visitedParents.add(parentChangeTree);
        }
      });
      const changes = changeTree.indexedOperations;
      const level = parentChangeTrees.length;
      const indent = getIndent(level);
      const parentIndex = level > 0 ? `(${changeTree.parentIndex}) ` : "";
      output += `${indent}${parentIndex}${changeTree.ref.constructor.name} (refId: ${changeTree.ref[$refId]}) - changes: ${Object.keys(changes).length}
`;
      for (const index in changes) {
        const operation = changes[index];
        output += `${getIndent(level + 1)}${OPERATION[operation]}: ${index}
`;
      }
    }
    return `${output}`;
  }
};
__publicField(_Schema, _d5);
__publicField(_Schema, _c5, encodeSchemaOperation);
__publicField(_Schema, _b5, decodeSchemaOperation);
var Schema = _Schema;
var Root = class {
  // TODO: do not initialize it if filters are not used
  constructor(types) {
    __publicField(this, "types");
    __publicField(this, "nextUniqueId", 0);
    __publicField(this, "refCount", {});
    __publicField(this, "changeTrees", {});
    // all changes
    __publicField(this, "allChanges", createChangeTreeList());
    __publicField(this, "allFilteredChanges", createChangeTreeList());
    // TODO: do not initialize it if filters are not used
    // pending changes to be encoded
    __publicField(this, "changes", createChangeTreeList());
    __publicField(this, "filteredChanges", createChangeTreeList());
    this.types = types;
  }
  getNextUniqueId() {
    return this.nextUniqueId++;
  }
  add(changeTree) {
    const ref = changeTree.ref;
    if (ref[$refId] === void 0) {
      ref[$refId] = this.getNextUniqueId();
    }
    const refId = ref[$refId];
    const isNewChangeTree = this.changeTrees[refId] === void 0;
    if (isNewChangeTree) {
      this.changeTrees[refId] = changeTree;
    }
    const previousRefCount = this.refCount[refId];
    if (previousRefCount === 0) {
      const ops = changeTree.allChanges.operations;
      let len = ops.length;
      while (len--) {
        changeTree.indexedOperations[ops[len]] = OPERATION.ADD;
        setOperationAtIndex(changeTree.changes, len);
      }
    }
    this.refCount[refId] = (previousRefCount || 0) + 1;
    return isNewChangeTree;
  }
  remove(changeTree) {
    const refId = changeTree.ref[$refId];
    const refCount = this.refCount[refId] - 1;
    if (refCount <= 0) {
      changeTree.root = void 0;
      delete this.changeTrees[refId];
      this.removeChangeFromChangeSet("allChanges", changeTree);
      this.removeChangeFromChangeSet("changes", changeTree);
      if (changeTree.filteredChanges) {
        this.removeChangeFromChangeSet("allFilteredChanges", changeTree);
        this.removeChangeFromChangeSet("filteredChanges", changeTree);
      }
      this.refCount[refId] = 0;
      changeTree.forEachChild((child, _) => {
        if (child.removeParent(changeTree.ref)) {
          if (child.parentChain === void 0 || // no parent, remove it
          child.parentChain && this.refCount[child.ref[$refId]] > 0) {
            this.remove(child);
          } else if (child.parentChain) {
            this.moveNextToParent(child);
          }
        }
      });
    } else {
      this.refCount[refId] = refCount;
      this.recursivelyMoveNextToParent(changeTree);
    }
    return refCount;
  }
  recursivelyMoveNextToParent(changeTree) {
    this.moveNextToParent(changeTree);
    changeTree.forEachChild((child, _) => this.recursivelyMoveNextToParent(child));
  }
  moveNextToParent(changeTree) {
    if (changeTree.filteredChanges) {
      this.moveNextToParentInChangeTreeList("filteredChanges", changeTree);
      this.moveNextToParentInChangeTreeList("allFilteredChanges", changeTree);
    } else {
      this.moveNextToParentInChangeTreeList("changes", changeTree);
      this.moveNextToParentInChangeTreeList("allChanges", changeTree);
    }
  }
  moveNextToParentInChangeTreeList(changeSetName, changeTree) {
    const changeSet = this[changeSetName];
    const node = changeTree[changeSetName].queueRootNode;
    if (!node)
      return;
    const parent = changeTree.parent;
    if (!parent || !parent[$changes])
      return;
    const parentNode = parent[$changes][changeSetName]?.queueRootNode;
    if (!parentNode || parentNode === node)
      return;
    const parentPosition = parentNode.position;
    const childPosition = node.position;
    if (childPosition > parentPosition)
      return;
    if (node.prev) {
      node.prev.next = node.next;
    } else {
      changeSet.next = node.next;
    }
    if (node.next) {
      node.next.prev = node.prev;
    } else {
      changeSet.tail = node.prev;
    }
    node.prev = parentNode;
    node.next = parentNode.next;
    if (parentNode.next) {
      parentNode.next.prev = node;
    } else {
      changeSet.tail = node;
    }
    parentNode.next = node;
    this.updatePositionsAfterMove(changeSet, node, parentPosition + 1);
  }
  enqueueChangeTree(changeTree, changeSet, queueRootNode = changeTree[changeSet].queueRootNode) {
    if (queueRootNode) {
      return;
    }
    changeTree[changeSet].queueRootNode = this.addToChangeTreeList(this[changeSet], changeTree);
  }
  addToChangeTreeList(list, changeTree) {
    const node = {
      changeTree,
      next: void 0,
      prev: void 0,
      position: list.tail ? list.tail.position + 1 : 0
    };
    if (!list.next) {
      list.next = node;
      list.tail = node;
    } else {
      node.prev = list.tail;
      list.tail.next = node;
      list.tail = node;
    }
    return node;
  }
  updatePositionsAfterRemoval(list, removedPosition) {
    let current = list.next;
    let position3 = 0;
    while (current) {
      if (position3 >= removedPosition) {
        current.position = position3;
      }
      current = current.next;
      position3++;
    }
  }
  updatePositionsAfterMove(list, node, newPosition) {
    let current = list.next;
    let position3 = 0;
    while (current) {
      current.position = position3;
      current = current.next;
      position3++;
    }
  }
  removeChangeFromChangeSet(changeSetName, changeTree) {
    const changeSet = this[changeSetName];
    const node = changeTree[changeSetName].queueRootNode;
    if (node && node.changeTree === changeTree) {
      const removedPosition = node.position;
      if (node.prev) {
        node.prev.next = node.next;
      } else {
        changeSet.next = node.next;
      }
      if (node.next) {
        node.next.prev = node.prev;
      } else {
        changeSet.tail = node.prev;
      }
      this.updatePositionsAfterRemoval(changeSet, removedPosition);
      changeTree[changeSetName].queueRootNode = void 0;
      return true;
    }
    return false;
  }
};
function concatBytes(a, b) {
  const result = new Uint8Array(a.length + b.length);
  result.set(a, 0);
  result.set(b, a.length);
  return result;
}
var _Encoder = class _Encoder {
  constructor(state) {
    // 8KB
    __publicField(this, "sharedBuffer", new Uint8Array(_Encoder.BUFFER_SIZE));
    __publicField(this, "context");
    __publicField(this, "state");
    __publicField(this, "root");
    this.context = TypeContext.cache(state.constructor);
    this.root = new Root(this.context);
    this.setState(state);
  }
  setState(state) {
    this.state = state;
    this.state[$changes].setRoot(this.root);
  }
  encode(it = { offset: 0 }, view2, buffer = this.sharedBuffer, changeSetName = "changes", isEncodeAll = changeSetName === "allChanges", initialOffset = it.offset) {
    const hasView = view2 !== void 0;
    const rootChangeTree = this.state[$changes];
    let current = this.root[changeSetName];
    while (current = current.next) {
      const changeTree = current.changeTree;
      if (hasView) {
        if (!view2.isChangeTreeVisible(changeTree)) {
          view2.invisible.add(changeTree);
          continue;
        }
        view2.invisible.delete(changeTree);
      }
      const changeSet = changeTree[changeSetName];
      const ref = changeTree.ref;
      const numChanges = changeSet.operations.length;
      if (numChanges === 0) {
        continue;
      }
      const ctor = ref.constructor;
      const encoder = ctor[$encoder];
      const filter = ctor[$filter];
      const metadata = ctor[Symbol.metadata];
      if (hasView || it.offset > initialOffset || changeTree !== rootChangeTree) {
        buffer[it.offset++] = SWITCH_TO_STRUCTURE & 255;
        encode.number(buffer, ref[$refId], it);
      }
      for (let j = 0; j < numChanges; j++) {
        const fieldIndex = changeSet.operations[j];
        if (fieldIndex < 0) {
          buffer[it.offset++] = Math.abs(fieldIndex) & 255;
          continue;
        }
        const operation = isEncodeAll ? OPERATION.ADD : changeTree.indexedOperations[fieldIndex];
        if (fieldIndex === void 0 || operation === void 0 || filter && !filter(ref, fieldIndex, view2)) {
          continue;
        }
        encoder(this, buffer, changeTree, fieldIndex, operation, it, isEncodeAll, hasView, metadata);
      }
    }
    if (it.offset > buffer.byteLength) {
      const newSize = Math.ceil(it.offset / _Encoder.BUFFER_SIZE) * _Encoder.BUFFER_SIZE;
      console.warn(`@colyseus/schema buffer overflow. Encoded state is higher than default BUFFER_SIZE. Use the following to increase default BUFFER_SIZE:

    import { Encoder } from "@colyseus/schema";
    Encoder.BUFFER_SIZE = ${Math.round(newSize / 1024)} * 1024; // ${Math.round(newSize / 1024)} KB
`);
      const newBuffer = new Uint8Array(newSize);
      newBuffer.set(buffer);
      buffer = newBuffer;
      if (buffer === this.sharedBuffer) {
        this.sharedBuffer = buffer;
      }
      return this.encode({ offset: initialOffset }, view2, buffer, changeSetName, isEncodeAll);
    } else {
      return buffer.subarray(0, it.offset);
    }
  }
  encodeAll(it = { offset: 0 }, buffer = this.sharedBuffer) {
    return this.encode(it, void 0, buffer, "allChanges", true);
  }
  encodeAllView(view2, sharedOffset, it, bytes = this.sharedBuffer) {
    const viewOffset = it.offset;
    this.encode(it, view2, bytes, "allFilteredChanges", true, viewOffset);
    return concatBytes(bytes.subarray(0, sharedOffset), bytes.subarray(viewOffset, it.offset));
  }
  encodeView(view2, sharedOffset, it, bytes = this.sharedBuffer) {
    const viewOffset = it.offset;
    for (const [refId, changes] of view2.changes) {
      const changeTree = this.root.changeTrees[refId];
      if (changeTree === void 0) {
        view2.changes.delete(refId);
        continue;
      }
      const keys = Object.keys(changes);
      if (keys.length === 0) {
        continue;
      }
      const ref = changeTree.ref;
      const ctor = ref.constructor;
      const encoder = ctor[$encoder];
      const metadata = ctor[Symbol.metadata];
      bytes[it.offset++] = SWITCH_TO_STRUCTURE & 255;
      encode.number(bytes, ref[$refId], it);
      for (let i = 0, numChanges = keys.length; i < numChanges; i++) {
        const index = Number(keys[i]);
        const value = changeTree.ref[$getByIndex](index);
        const operation = value !== void 0 && changes[index] || OPERATION.DELETE;
        encoder(this, bytes, changeTree, index, operation, it, false, true, metadata);
      }
    }
    view2.changes.clear();
    this.encode(it, view2, bytes, "filteredChanges", false, viewOffset);
    return concatBytes(bytes.subarray(0, sharedOffset), bytes.subarray(viewOffset, it.offset));
  }
  discardChanges() {
    let current = this.root.changes.next;
    while (current) {
      current.changeTree.endEncode("changes");
      current = current.next;
    }
    this.root.changes = createChangeTreeList();
    current = this.root.filteredChanges.next;
    while (current) {
      current.changeTree.endEncode("filteredChanges");
      current = current.next;
    }
    this.root.filteredChanges = createChangeTreeList();
  }
  tryEncodeTypeId(bytes, baseType, targetType, it) {
    const baseTypeId = this.context.getTypeId(baseType);
    const targetTypeId = this.context.getTypeId(targetType);
    if (targetTypeId === void 0) {
      console.warn(`@colyseus/schema WARNING: Class "${targetType.name}" is not registered on TypeRegistry - Please either tag the class with @entity or define a @type() field.`);
      return;
    }
    if (baseTypeId !== targetTypeId) {
      bytes[it.offset++] = TYPE_ID & 255;
      encode.number(bytes, targetTypeId, it);
    }
  }
  get hasChanges() {
    return this.root.changes.next !== void 0 || this.root.filteredChanges.next !== void 0;
  }
};
__publicField(_Encoder, "BUFFER_SIZE", 8 * 1024);
var Encoder = _Encoder;
function spliceOne(arr, index) {
  if (index === -1 || index >= arr.length) {
    return false;
  }
  const len = arr.length - 1;
  for (let i = index; i < len; i++) {
    arr[i] = arr[i + 1];
  }
  arr.length = len;
  return true;
}
var DecodingWarning = class extends Error {
  constructor(message) {
    super(message);
    this.name = "DecodingWarning";
  }
};
var ReferenceTracker = class {
  constructor() {
    //
    // Relation of refId => Schema structure
    // For direct access of structures during decoding time.
    //
    __publicField(this, "refs", /* @__PURE__ */ new Map());
    __publicField(this, "refCount", {});
    __publicField(this, "deletedRefs", /* @__PURE__ */ new Set());
    __publicField(this, "callbacks", {});
    __publicField(this, "nextUniqueId", 0);
  }
  getNextUniqueId() {
    return this.nextUniqueId++;
  }
  // for decoding
  addRef(refId, ref, incrementCount = true) {
    this.refs.set(refId, ref);
    ref[$refId] = refId;
    if (incrementCount) {
      this.refCount[refId] = (this.refCount[refId] || 0) + 1;
    }
    if (this.deletedRefs.has(refId)) {
      this.deletedRefs.delete(refId);
    }
  }
  // for decoding
  removeRef(refId) {
    const refCount = this.refCount[refId];
    if (refCount === void 0) {
      try {
        throw new DecodingWarning("trying to remove refId that doesn't exist: " + refId);
      } catch (e) {
        console.warn(e);
      }
      return;
    }
    if (refCount === 0) {
      try {
        const ref = this.refs.get(refId);
        throw new DecodingWarning(`trying to remove refId '${refId}' with 0 refCount (${ref.constructor.name}: ${JSON.stringify(ref)})`);
      } catch (e) {
        console.warn(e);
      }
      return;
    }
    if ((this.refCount[refId] = refCount - 1) <= 0) {
      this.deletedRefs.add(refId);
    }
  }
  clearRefs() {
    this.refs.clear();
    this.deletedRefs.clear();
    this.callbacks = {};
    this.refCount = {};
  }
  // for decoding
  garbageCollectDeletedRefs() {
    this.deletedRefs.forEach((refId) => {
      if (this.refCount[refId] > 0) {
        return;
      }
      const ref = this.refs.get(refId);
      if (ref.constructor[Symbol.metadata] !== void 0) {
        const metadata = ref.constructor[Symbol.metadata];
        for (const index in metadata) {
          const field = metadata[index].name;
          const child = ref[field];
          if (typeof child === "object" && child) {
            const childRefId = child[$refId];
            if (childRefId !== void 0 && !this.deletedRefs.has(childRefId)) {
              this.removeRef(childRefId);
            }
          }
        }
      } else {
        if (typeof ref[$childType] === "function") {
          Array.from(ref.values()).forEach((child) => {
            const childRefId = child[$refId];
            if (childRefId !== void 0 && !this.deletedRefs.has(childRefId)) {
              this.removeRef(childRefId);
            }
          });
        }
      }
      this.refs.delete(refId);
      delete this.refCount[refId];
      delete this.callbacks[refId];
    });
    this.deletedRefs.clear();
  }
  addCallback(refId, fieldOrOperation, callback) {
    if (refId === void 0) {
      const name = typeof fieldOrOperation === "number" ? OPERATION[fieldOrOperation] : fieldOrOperation;
      throw new Error(`Can't addCallback on '${name}' (refId is undefined)`);
    }
    if (!this.callbacks[refId]) {
      this.callbacks[refId] = {};
    }
    if (!this.callbacks[refId][fieldOrOperation]) {
      this.callbacks[refId][fieldOrOperation] = [];
    }
    this.callbacks[refId][fieldOrOperation].push(callback);
    return () => this.removeCallback(refId, fieldOrOperation, callback);
  }
  removeCallback(refId, field, callback) {
    const index = this.callbacks?.[refId]?.[field]?.indexOf(callback);
    if (index !== void 0 && index !== -1) {
      spliceOne(this.callbacks[refId][field], index);
    }
  }
};
var Decoder = class {
  constructor(root, context) {
    __publicField(this, "context");
    __publicField(this, "state");
    __publicField(this, "root");
    __publicField(this, "currentRefId", 0);
    __publicField(this, "triggerChanges");
    this.setState(root);
    this.context = context || new TypeContext(root.constructor);
  }
  setState(root) {
    this.state = root;
    this.root = new ReferenceTracker();
    this.root.addRef(0, root);
  }
  decode(bytes, it = { offset: 0 }, ref = this.state) {
    const allChanges = [];
    const $root = this.root;
    const totalBytes = bytes.byteLength;
    let decoder2 = ref["constructor"][$decoder];
    this.currentRefId = 0;
    while (it.offset < totalBytes) {
      if (bytes[it.offset] == SWITCH_TO_STRUCTURE) {
        it.offset++;
        ref[$onDecodeEnd]?.();
        const nextRefId = decode.number(bytes, it);
        const nextRef = $root.refs.get(nextRefId);
        if (!nextRef) {
          console.error(`"refId" not found: ${nextRefId}`, { previousRef: ref, previousRefId: this.currentRefId });
          console.warn("Please report this issue to the developers.");
          this.skipCurrentStructure(bytes, it, totalBytes);
        } else {
          ref = nextRef;
          decoder2 = ref.constructor[$decoder];
          this.currentRefId = nextRefId;
        }
        continue;
      }
      const result = decoder2(this, bytes, it, ref, allChanges);
      if (result === DEFINITION_MISMATCH) {
        console.warn("@colyseus/schema: definition mismatch");
        this.skipCurrentStructure(bytes, it, totalBytes);
        continue;
      }
    }
    ref[$onDecodeEnd]?.();
    this.triggerChanges?.(allChanges);
    $root.garbageCollectDeletedRefs();
    return allChanges;
  }
  skipCurrentStructure(bytes, it, totalBytes) {
    const nextIterator = { offset: it.offset };
    while (it.offset < totalBytes) {
      if (bytes[it.offset] === SWITCH_TO_STRUCTURE) {
        nextIterator.offset = it.offset + 1;
        if (this.root.refs.has(decode.number(bytes, nextIterator))) {
          break;
        }
      }
      it.offset++;
    }
  }
  getInstanceType(bytes, it, defaultType) {
    let type;
    if (bytes[it.offset] === TYPE_ID) {
      it.offset++;
      const type_id = decode.number(bytes, it);
      type = this.context.get(type_id);
    }
    return type || defaultType;
  }
  createInstanceOfType(type) {
    return new type();
  }
  removeChildRefs(ref, allChanges) {
    const needRemoveRef = typeof ref[$childType] !== "string";
    const refId = ref[$refId];
    ref.forEach((value, key) => {
      allChanges.push({
        ref,
        refId,
        op: OPERATION.DELETE,
        field: key,
        value: void 0,
        previousValue: value
      });
      if (needRemoveRef) {
        this.root.removeRef(value[$refId]);
      }
    });
  }
};
var ReflectionField = schema({
  name: "string",
  type: "string",
  referencedType: "number"
});
var ReflectionType = schema({
  id: "number",
  extendsId: "number",
  fields: [ReflectionField]
});
var Reflection = schema({
  types: [ReflectionType],
  rootType: "number"
});
Reflection.encode = function(encoder, it = { offset: 0 }) {
  const context = encoder.context;
  const reflection = new Reflection();
  const reflectionEncoder = new Encoder(reflection);
  const rootType = context.schemas.get(encoder.state.constructor);
  if (rootType > 0) {
    reflection.rootType = rootType;
  }
  const includedTypeIds = /* @__PURE__ */ new Set();
  const pendingReflectionTypes = {};
  const addType = (type) => {
    if (type.extendsId === void 0 || includedTypeIds.has(type.extendsId)) {
      includedTypeIds.add(type.id);
      reflection.types.push(type);
      const deps = pendingReflectionTypes[type.id];
      if (deps !== void 0) {
        delete pendingReflectionTypes[type.id];
        deps.forEach((childType) => addType(childType));
      }
    } else {
      if (pendingReflectionTypes[type.extendsId] === void 0) {
        pendingReflectionTypes[type.extendsId] = [];
      }
      pendingReflectionTypes[type.extendsId].push(type);
    }
  };
  context.schemas.forEach((typeid, klass) => {
    const type = new ReflectionType();
    type.id = Number(typeid);
    const inheritFrom = Object.getPrototypeOf(klass);
    if (inheritFrom !== Schema) {
      type.extendsId = context.schemas.get(inheritFrom);
    }
    const metadata = klass[Symbol.metadata];
    if (metadata !== inheritFrom[Symbol.metadata]) {
      for (const fieldIndex in metadata) {
        const index = Number(fieldIndex);
        const fieldName = metadata[index].name;
        if (!Object.prototype.hasOwnProperty.call(metadata, fieldName)) {
          continue;
        }
        const reflectionField = new ReflectionField();
        reflectionField.name = fieldName;
        let fieldType;
        const field = metadata[index];
        if (typeof field.type === "string") {
          fieldType = field.type;
        } else {
          let childTypeSchema;
          if (Schema.is(field.type)) {
            fieldType = "ref";
            childTypeSchema = field.type;
          } else {
            fieldType = Object.keys(field.type)[0];
            if (typeof field.type[fieldType] === "string") {
              fieldType += ":" + field.type[fieldType];
            } else {
              childTypeSchema = field.type[fieldType];
            }
          }
          reflectionField.referencedType = childTypeSchema ? context.getTypeId(childTypeSchema) : -1;
        }
        reflectionField.type = fieldType;
        type.fields.push(reflectionField);
      }
    }
    addType(type);
  });
  for (const typeid in pendingReflectionTypes) {
    pendingReflectionTypes[typeid].forEach((type) => reflection.types.push(type));
  }
  const buf = reflectionEncoder.encodeAll(it);
  return buf.slice(0, it.offset);
};
Reflection.decode = function(bytes, it) {
  const reflection = new Reflection();
  const reflectionDecoder = new Decoder(reflection);
  reflectionDecoder.decode(bytes, it);
  const typeContext = new TypeContext();
  reflection.types.forEach((reflectionType) => {
    const parentClass = typeContext.get(reflectionType.extendsId) ?? Schema;
    const schema2 = class _ extends parentClass {
    };
    TypeContext.register(schema2);
    typeContext.add(schema2, reflectionType.id);
  }, {});
  const addFields = (metadata, reflectionType, parentFieldIndex) => {
    reflectionType.fields.forEach((field, i) => {
      const fieldIndex = parentFieldIndex + i;
      if (field.referencedType !== void 0) {
        let fieldType = field.type;
        let refType = typeContext.get(field.referencedType);
        if (!refType) {
          const typeInfo = field.type.split(":");
          fieldType = typeInfo[0];
          refType = typeInfo[1];
        }
        if (fieldType === "ref") {
          Metadata.addField(metadata, fieldIndex, field.name, refType);
        } else {
          Metadata.addField(metadata, fieldIndex, field.name, { [fieldType]: refType });
        }
      } else {
        Metadata.addField(metadata, fieldIndex, field.name, field.type);
      }
    });
  };
  reflection.types.forEach((reflectionType) => {
    const schema2 = typeContext.get(reflectionType.id);
    const metadata = Metadata.initialize(schema2);
    const inheritedTypes = [];
    let parentType = reflectionType;
    do {
      inheritedTypes.push(parentType);
      parentType = reflection.types.find((t) => t.id === parentType.extendsId);
    } while (parentType);
    let parentFieldIndex = 0;
    inheritedTypes.reverse().forEach((reflectionType2) => {
      addFields(metadata, reflectionType2, parentFieldIndex);
      parentFieldIndex += reflectionType2.fields.length;
    });
  });
  const state = new (typeContext.get(reflection.rootType || 0))();
  return new Decoder(state, typeContext);
};
registerType("map", { constructor: MapSchema });
registerType("array", { constructor: ArraySchema });
registerType("set", { constructor: SetSchema });
registerType("collection", { constructor: CollectionSchema });

// node_modules/@colyseus/msgpackr/unpack.js
var decoder;
try {
  decoder = new TextDecoder();
} catch (error) {
}
var src;
var srcEnd;
var position = 0;
var EMPTY_ARRAY = [];
var strings = EMPTY_ARRAY;
var stringPosition = 0;
var currentUnpackr = {};
var currentStructures;
var srcString;
var srcStringStart = 0;
var srcStringEnd = 0;
var bundledStrings;
var referenceMap;
var currentExtensions = [];
var dataView;
var defaultOptions = {
  useRecords: false,
  mapsAsObjects: true
};
var C1Type = class {
};
var C1 = new C1Type();
C1.name = "MessagePack 0xC1";
var sequentialMode = false;
var inlineObjectReadThreshold = 2;
var readStruct;
var onLoadedStructures;
var onSaveState;
try {
  new Function("");
} catch (error) {
  inlineObjectReadThreshold = Infinity;
}
var Unpackr = class _Unpackr {
  constructor(options) {
    if (options) {
      if (options.useRecords === false && options.mapsAsObjects === void 0)
        options.mapsAsObjects = true;
      if (options.sequential && options.trusted !== false) {
        options.trusted = true;
        if (!options.structures && options.useRecords != false) {
          options.structures = [];
          if (!options.maxSharedStructures)
            options.maxSharedStructures = 0;
        }
      }
      if (options.structures)
        options.structures.sharedLength = options.structures.length;
      else if (options.getStructures) {
        (options.structures = []).uninitialized = true;
        options.structures.sharedLength = 0;
      }
      if (options.int64AsNumber) {
        options.int64AsType = "number";
      }
    }
    Object.assign(this, options);
  }
  unpack(source, options) {
    if (src) {
      return saveState(() => {
        clearSource();
        return this ? this.unpack(source, options) : _Unpackr.prototype.unpack.call(defaultOptions, source, options);
      });
    }
    if (!source.buffer && source.constructor === ArrayBuffer)
      source = typeof Buffer !== "undefined" ? Buffer.from(source) : new Uint8Array(source);
    if (typeof options === "object") {
      srcEnd = options.end || source.length;
      position = options.start || 0;
    } else {
      position = 0;
      srcEnd = options > -1 ? options : source.length;
    }
    stringPosition = 0;
    srcStringEnd = 0;
    srcString = null;
    strings = EMPTY_ARRAY;
    bundledStrings = null;
    src = source;
    try {
      dataView = source.dataView || (source.dataView = new DataView(source.buffer, source.byteOffset, source.byteLength));
    } catch (error) {
      src = null;
      if (source instanceof Uint8Array)
        throw error;
      throw new Error("Source must be a Uint8Array or Buffer but was a " + (source && typeof source == "object" ? source.constructor.name : typeof source));
    }
    if (this instanceof _Unpackr) {
      currentUnpackr = this;
      if (this.structures) {
        currentStructures = this.structures;
        return checkedRead(options);
      } else if (!currentStructures || currentStructures.length > 0) {
        currentStructures = [];
      }
    } else {
      currentUnpackr = defaultOptions;
      if (!currentStructures || currentStructures.length > 0)
        currentStructures = [];
    }
    return checkedRead(options);
  }
  unpackMultiple(source, forEach) {
    let values, lastPosition = 0;
    try {
      sequentialMode = true;
      let size = source.length;
      let value = this ? this.unpack(source, size) : defaultUnpackr.unpack(source, size);
      if (forEach) {
        if (forEach(value, lastPosition, position) === false) return;
        while (position < size) {
          lastPosition = position;
          if (forEach(checkedRead(), lastPosition, position) === false) {
            return;
          }
        }
      } else {
        values = [value];
        while (position < size) {
          lastPosition = position;
          values.push(checkedRead());
        }
        return values;
      }
    } catch (error) {
      error.lastPosition = lastPosition;
      error.values = values;
      throw error;
    } finally {
      sequentialMode = false;
      clearSource();
    }
  }
  _mergeStructures(loadedStructures, existingStructures) {
    if (onLoadedStructures)
      loadedStructures = onLoadedStructures.call(this, loadedStructures);
    loadedStructures = loadedStructures || [];
    if (Object.isFrozen(loadedStructures))
      loadedStructures = loadedStructures.map((structure) => structure.slice(0));
    for (let i = 0, l = loadedStructures.length; i < l; i++) {
      let structure = loadedStructures[i];
      if (structure) {
        structure.isShared = true;
        if (i >= 32)
          structure.highByte = i - 32 >> 5;
      }
    }
    loadedStructures.sharedLength = loadedStructures.length;
    for (let id in existingStructures || []) {
      if (id >= 0) {
        let structure = loadedStructures[id];
        let existing = existingStructures[id];
        if (existing) {
          if (structure)
            (loadedStructures.restoreStructures || (loadedStructures.restoreStructures = []))[id] = structure;
          loadedStructures[id] = existing;
        }
      }
    }
    return this.structures = loadedStructures;
  }
  decode(source, options) {
    return this.unpack(source, options);
  }
};
function checkedRead(options) {
  try {
    if (!currentUnpackr.trusted && !sequentialMode) {
      let sharedLength = currentStructures.sharedLength || 0;
      if (sharedLength < currentStructures.length)
        currentStructures.length = sharedLength;
    }
    let result;
    if (currentUnpackr.randomAccessStructure && src[position] < 64 && src[position] >= 32 && readStruct) {
      result = readStruct(src, position, srcEnd, currentUnpackr);
      src = null;
      if (!(options && options.lazy) && result)
        result = result.toJSON();
      position = srcEnd;
    } else
      result = read();
    if (bundledStrings) {
      position = bundledStrings.postBundlePosition;
      bundledStrings = null;
    }
    if (sequentialMode)
      currentStructures.restoreStructures = null;
    if (position == srcEnd) {
      if (currentStructures && currentStructures.restoreStructures)
        restoreStructures();
      currentStructures = null;
      src = null;
      if (referenceMap)
        referenceMap = null;
    } else if (position > srcEnd) {
      throw new Error("Unexpected end of MessagePack data");
    } else if (!sequentialMode) {
      let jsonView;
      try {
        jsonView = JSON.stringify(result, (_, value) => typeof value === "bigint" ? `${value}n` : value).slice(0, 100);
      } catch (error) {
        jsonView = "(JSON view not available " + error + ")";
      }
      throw new Error("Data read, but end of buffer not reached " + jsonView);
    }
    return result;
  } catch (error) {
    if (currentStructures && currentStructures.restoreStructures)
      restoreStructures();
    clearSource();
    if (error instanceof RangeError || error.message.startsWith("Unexpected end of buffer") || position > srcEnd) {
      error.incomplete = true;
    }
    throw error;
  }
}
function restoreStructures() {
  for (let id in currentStructures.restoreStructures) {
    currentStructures[id] = currentStructures.restoreStructures[id];
  }
  currentStructures.restoreStructures = null;
}
function read() {
  let token = src[position++];
  if (token < 160) {
    if (token < 128) {
      if (token < 64)
        return token;
      else {
        let structure = currentStructures[token & 63] || currentUnpackr.getStructures && loadStructures()[token & 63];
        if (structure) {
          if (!structure.read) {
            structure.read = createStructureReader(structure, token & 63);
          }
          return structure.read();
        } else
          return token;
      }
    } else if (token < 144) {
      token -= 128;
      if (currentUnpackr.mapsAsObjects) {
        let object = {};
        for (let i = 0; i < token; i++) {
          let key = readKey();
          if (key === "__proto__")
            key = "__proto_";
          object[key] = read();
        }
        return object;
      } else {
        let map = /* @__PURE__ */ new Map();
        for (let i = 0; i < token; i++) {
          map.set(read(), read());
        }
        return map;
      }
    } else {
      token -= 144;
      let array = new Array(token);
      for (let i = 0; i < token; i++) {
        array[i] = read();
      }
      if (currentUnpackr.freezeData)
        return Object.freeze(array);
      return array;
    }
  } else if (token < 192) {
    let length = token - 160;
    if (srcStringEnd >= position) {
      return srcString.slice(position - srcStringStart, (position += length) - srcStringStart);
    }
    if (srcStringEnd == 0 && srcEnd < 140) {
      let string2 = length < 16 ? shortStringInJS(length) : longStringInJS(length);
      if (string2 != null)
        return string2;
    }
    return readFixedString(length);
  } else {
    let value;
    switch (token) {
      case 192:
        return null;
      case 193:
        if (bundledStrings) {
          value = read();
          if (value > 0)
            return bundledStrings[1].slice(bundledStrings.position1, bundledStrings.position1 += value);
          else
            return bundledStrings[0].slice(bundledStrings.position0, bundledStrings.position0 -= value);
        }
        return C1;
      // "never-used", return special object to denote that
      case 194:
        return false;
      case 195:
        return true;
      case 196:
        value = src[position++];
        if (value === void 0)
          throw new Error("Unexpected end of buffer");
        return readBin(value);
      case 197:
        value = dataView.getUint16(position);
        position += 2;
        return readBin(value);
      case 198:
        value = dataView.getUint32(position);
        position += 4;
        return readBin(value);
      case 199:
        return readExt(src[position++]);
      case 200:
        value = dataView.getUint16(position);
        position += 2;
        return readExt(value);
      case 201:
        value = dataView.getUint32(position);
        position += 4;
        return readExt(value);
      case 202:
        value = dataView.getFloat32(position);
        if (currentUnpackr.useFloat32 > 2) {
          let multiplier = mult10[(src[position] & 127) << 1 | src[position + 1] >> 7];
          position += 4;
          return (multiplier * value + (value > 0 ? 0.5 : -0.5) >> 0) / multiplier;
        }
        position += 4;
        return value;
      case 203:
        value = dataView.getFloat64(position);
        position += 8;
        return value;
      // uint handlers
      case 204:
        return src[position++];
      case 205:
        value = dataView.getUint16(position);
        position += 2;
        return value;
      case 206:
        value = dataView.getUint32(position);
        position += 4;
        return value;
      case 207:
        if (currentUnpackr.int64AsType === "number") {
          value = dataView.getUint32(position) * 4294967296;
          value += dataView.getUint32(position + 4);
        } else if (currentUnpackr.int64AsType === "string") {
          value = dataView.getBigUint64(position).toString();
        } else if (currentUnpackr.int64AsType === "auto") {
          value = dataView.getBigUint64(position);
          if (value <= BigInt(2) << BigInt(52)) value = Number(value);
        } else
          value = dataView.getBigUint64(position);
        position += 8;
        return value;
      // int handlers
      case 208:
        return dataView.getInt8(position++);
      case 209:
        value = dataView.getInt16(position);
        position += 2;
        return value;
      case 210:
        value = dataView.getInt32(position);
        position += 4;
        return value;
      case 211:
        if (currentUnpackr.int64AsType === "number") {
          value = dataView.getInt32(position) * 4294967296;
          value += dataView.getUint32(position + 4);
        } else if (currentUnpackr.int64AsType === "string") {
          value = dataView.getBigInt64(position).toString();
        } else if (currentUnpackr.int64AsType === "auto") {
          value = dataView.getBigInt64(position);
          if (value >= BigInt(-2) << BigInt(52) && value <= BigInt(2) << BigInt(52)) value = Number(value);
        } else
          value = dataView.getBigInt64(position);
        position += 8;
        return value;
      case 212:
        value = src[position++];
        if (value == 114) {
          return recordDefinition(src[position++] & 63);
        } else {
          let extension = currentExtensions[value];
          if (extension) {
            if (extension.read) {
              position++;
              return extension.read(read());
            } else if (extension.noBuffer) {
              position++;
              return extension();
            } else
              return extension(src.subarray(position, ++position));
          } else
            throw new Error("Unknown extension " + value);
        }
      case 213:
        value = src[position];
        if (value == 114) {
          position++;
          return recordDefinition(src[position++] & 63, src[position++]);
        } else
          return readExt(2);
      case 214:
        return readExt(4);
      case 215:
        return readExt(8);
      case 216:
        return readExt(16);
      case 217:
        value = src[position++];
        if (srcStringEnd >= position) {
          return srcString.slice(position - srcStringStart, (position += value) - srcStringStart);
        }
        return readString8(value);
      case 218:
        value = dataView.getUint16(position);
        position += 2;
        if (srcStringEnd >= position) {
          return srcString.slice(position - srcStringStart, (position += value) - srcStringStart);
        }
        return readString16(value);
      case 219:
        value = dataView.getUint32(position);
        position += 4;
        if (srcStringEnd >= position) {
          return srcString.slice(position - srcStringStart, (position += value) - srcStringStart);
        }
        return readString32(value);
      case 220:
        value = dataView.getUint16(position);
        position += 2;
        return readArray(value);
      case 221:
        value = dataView.getUint32(position);
        position += 4;
        return readArray(value);
      case 222:
        value = dataView.getUint16(position);
        position += 2;
        return readMap(value);
      case 223:
        value = dataView.getUint32(position);
        position += 4;
        return readMap(value);
      default:
        if (token >= 224)
          return token - 256;
        if (token === void 0) {
          let error = new Error("Unexpected end of MessagePack data");
          error.incomplete = true;
          throw error;
        }
        throw new Error("Unknown MessagePack token " + token);
    }
  }
}
var validName = /^[a-zA-Z_$][a-zA-Z\d_$]*$/;
function createStructureReader(structure, firstId) {
  function readObject() {
    if (readObject.count++ > inlineObjectReadThreshold) {
      let readObject2 = structure.read = new Function("r", "return function(){return " + (currentUnpackr.freezeData ? "Object.freeze" : "") + "({" + structure.map((key) => key === "__proto__" ? "__proto_:r()" : validName.test(key) ? key + ":r()" : "[" + JSON.stringify(key) + "]:r()").join(",") + "})}")(read);
      if (structure.highByte === 0)
        structure.read = createSecondByteReader(firstId, structure.read);
      return readObject2();
    }
    let object = {};
    for (let i = 0, l = structure.length; i < l; i++) {
      let key = structure[i];
      if (key === "__proto__")
        key = "__proto_";
      object[key] = read();
    }
    if (currentUnpackr.freezeData)
      return Object.freeze(object);
    return object;
  }
  readObject.count = 0;
  if (structure.highByte === 0) {
    return createSecondByteReader(firstId, readObject);
  }
  return readObject;
}
var createSecondByteReader = (firstId, read0) => {
  return function() {
    let highByte = src[position++];
    if (highByte === 0)
      return read0();
    let id = firstId < 32 ? -(firstId + (highByte << 5)) : firstId + (highByte << 5);
    let structure = currentStructures[id] || loadStructures()[id];
    if (!structure) {
      throw new Error("Record id is not defined for " + id);
    }
    if (!structure.read)
      structure.read = createStructureReader(structure, firstId);
    return structure.read();
  };
};
function loadStructures() {
  let loadedStructures = saveState(() => {
    src = null;
    return currentUnpackr.getStructures();
  });
  return currentStructures = currentUnpackr._mergeStructures(loadedStructures, currentStructures);
}
var readFixedString = readStringJS;
var readString8 = readStringJS;
var readString16 = readStringJS;
var readString32 = readStringJS;
function readStringJS(length) {
  let result;
  if (length < 16) {
    if (result = shortStringInJS(length))
      return result;
  }
  if (length > 64 && decoder)
    return decoder.decode(src.subarray(position, position += length));
  const end = position + length;
  const units = [];
  result = "";
  while (position < end) {
    const byte1 = src[position++];
    if ((byte1 & 128) === 0) {
      units.push(byte1);
    } else if ((byte1 & 224) === 192) {
      const byte2 = src[position++] & 63;
      units.push((byte1 & 31) << 6 | byte2);
    } else if ((byte1 & 240) === 224) {
      const byte2 = src[position++] & 63;
      const byte3 = src[position++] & 63;
      units.push((byte1 & 31) << 12 | byte2 << 6 | byte3);
    } else if ((byte1 & 248) === 240) {
      const byte2 = src[position++] & 63;
      const byte3 = src[position++] & 63;
      const byte4 = src[position++] & 63;
      let unit = (byte1 & 7) << 18 | byte2 << 12 | byte3 << 6 | byte4;
      if (unit > 65535) {
        unit -= 65536;
        units.push(unit >>> 10 & 1023 | 55296);
        unit = 56320 | unit & 1023;
      }
      units.push(unit);
    } else {
      units.push(byte1);
    }
    if (units.length >= 4096) {
      result += fromCharCode.apply(String, units);
      units.length = 0;
    }
  }
  if (units.length > 0) {
    result += fromCharCode.apply(String, units);
  }
  return result;
}
function readArray(length) {
  let array = new Array(length);
  for (let i = 0; i < length; i++) {
    array[i] = read();
  }
  if (currentUnpackr.freezeData)
    return Object.freeze(array);
  return array;
}
function readMap(length) {
  if (currentUnpackr.mapsAsObjects) {
    let object = {};
    for (let i = 0; i < length; i++) {
      let key = readKey();
      if (key === "__proto__")
        key = "__proto_";
      object[key] = read();
    }
    return object;
  } else {
    let map = /* @__PURE__ */ new Map();
    for (let i = 0; i < length; i++) {
      map.set(read(), read());
    }
    return map;
  }
}
var fromCharCode = String.fromCharCode;
function longStringInJS(length) {
  let start = position;
  let bytes = new Array(length);
  for (let i = 0; i < length; i++) {
    const byte = src[position++];
    if ((byte & 128) > 0) {
      position = start;
      return;
    }
    bytes[i] = byte;
  }
  return fromCharCode.apply(String, bytes);
}
function shortStringInJS(length) {
  if (length < 4) {
    if (length < 2) {
      if (length === 0)
        return "";
      else {
        let a = src[position++];
        if ((a & 128) > 1) {
          position -= 1;
          return;
        }
        return fromCharCode(a);
      }
    } else {
      let a = src[position++];
      let b = src[position++];
      if ((a & 128) > 0 || (b & 128) > 0) {
        position -= 2;
        return;
      }
      if (length < 3)
        return fromCharCode(a, b);
      let c = src[position++];
      if ((c & 128) > 0) {
        position -= 3;
        return;
      }
      return fromCharCode(a, b, c);
    }
  } else {
    let a = src[position++];
    let b = src[position++];
    let c = src[position++];
    let d = src[position++];
    if ((a & 128) > 0 || (b & 128) > 0 || (c & 128) > 0 || (d & 128) > 0) {
      position -= 4;
      return;
    }
    if (length < 6) {
      if (length === 4)
        return fromCharCode(a, b, c, d);
      else {
        let e = src[position++];
        if ((e & 128) > 0) {
          position -= 5;
          return;
        }
        return fromCharCode(a, b, c, d, e);
      }
    } else if (length < 8) {
      let e = src[position++];
      let f = src[position++];
      if ((e & 128) > 0 || (f & 128) > 0) {
        position -= 6;
        return;
      }
      if (length < 7)
        return fromCharCode(a, b, c, d, e, f);
      let g = src[position++];
      if ((g & 128) > 0) {
        position -= 7;
        return;
      }
      return fromCharCode(a, b, c, d, e, f, g);
    } else {
      let e = src[position++];
      let f = src[position++];
      let g = src[position++];
      let h = src[position++];
      if ((e & 128) > 0 || (f & 128) > 0 || (g & 128) > 0 || (h & 128) > 0) {
        position -= 8;
        return;
      }
      if (length < 10) {
        if (length === 8)
          return fromCharCode(a, b, c, d, e, f, g, h);
        else {
          let i = src[position++];
          if ((i & 128) > 0) {
            position -= 9;
            return;
          }
          return fromCharCode(a, b, c, d, e, f, g, h, i);
        }
      } else if (length < 12) {
        let i = src[position++];
        let j = src[position++];
        if ((i & 128) > 0 || (j & 128) > 0) {
          position -= 10;
          return;
        }
        if (length < 11)
          return fromCharCode(a, b, c, d, e, f, g, h, i, j);
        let k = src[position++];
        if ((k & 128) > 0) {
          position -= 11;
          return;
        }
        return fromCharCode(a, b, c, d, e, f, g, h, i, j, k);
      } else {
        let i = src[position++];
        let j = src[position++];
        let k = src[position++];
        let l = src[position++];
        if ((i & 128) > 0 || (j & 128) > 0 || (k & 128) > 0 || (l & 128) > 0) {
          position -= 12;
          return;
        }
        if (length < 14) {
          if (length === 12)
            return fromCharCode(a, b, c, d, e, f, g, h, i, j, k, l);
          else {
            let m = src[position++];
            if ((m & 128) > 0) {
              position -= 13;
              return;
            }
            return fromCharCode(a, b, c, d, e, f, g, h, i, j, k, l, m);
          }
        } else {
          let m = src[position++];
          let n = src[position++];
          if ((m & 128) > 0 || (n & 128) > 0) {
            position -= 14;
            return;
          }
          if (length < 15)
            return fromCharCode(a, b, c, d, e, f, g, h, i, j, k, l, m, n);
          let o = src[position++];
          if ((o & 128) > 0) {
            position -= 15;
            return;
          }
          return fromCharCode(a, b, c, d, e, f, g, h, i, j, k, l, m, n, o);
        }
      }
    }
  }
}
function readOnlyJSString() {
  let token = src[position++];
  let length;
  if (token < 192) {
    length = token - 160;
  } else {
    switch (token) {
      case 217:
        length = src[position++];
        break;
      case 218:
        length = dataView.getUint16(position);
        position += 2;
        break;
      case 219:
        length = dataView.getUint32(position);
        position += 4;
        break;
      default:
        throw new Error("Expected string");
    }
  }
  return readStringJS(length);
}
function readBin(length) {
  return currentUnpackr.copyBuffers ? (
    // specifically use the copying slice (not the node one)
    Uint8Array.prototype.slice.call(src, position, position += length)
  ) : src.subarray(position, position += length);
}
function readExt(length) {
  let type = src[position++];
  if (currentExtensions[type]) {
    let end;
    return currentExtensions[type](src.subarray(position, end = position += length), (readPosition) => {
      position = readPosition;
      try {
        return read();
      } finally {
        position = end;
      }
    });
  } else
    throw new Error("Unknown extension type " + type);
}
var keyCache = new Array(4096);
function readKey() {
  let length = src[position++];
  if (length >= 160 && length < 192) {
    length = length - 160;
    if (srcStringEnd >= position)
      return srcString.slice(position - srcStringStart, (position += length) - srcStringStart);
    else if (!(srcStringEnd == 0 && srcEnd < 180))
      return readFixedString(length);
  } else {
    position--;
    return asSafeString(read());
  }
  let key = (length << 5 ^ (length > 1 ? dataView.getUint16(position) : length > 0 ? src[position] : 0)) & 4095;
  let entry = keyCache[key];
  let checkPosition = position;
  let end = position + length - 3;
  let chunk;
  let i = 0;
  if (entry && entry.bytes == length) {
    while (checkPosition < end) {
      chunk = dataView.getUint32(checkPosition);
      if (chunk != entry[i++]) {
        checkPosition = 1879048192;
        break;
      }
      checkPosition += 4;
    }
    end += 3;
    while (checkPosition < end) {
      chunk = src[checkPosition++];
      if (chunk != entry[i++]) {
        checkPosition = 1879048192;
        break;
      }
    }
    if (checkPosition === end) {
      position = checkPosition;
      return entry.string;
    }
    end -= 3;
    checkPosition = position;
  }
  entry = [];
  keyCache[key] = entry;
  entry.bytes = length;
  while (checkPosition < end) {
    chunk = dataView.getUint32(checkPosition);
    entry.push(chunk);
    checkPosition += 4;
  }
  end += 3;
  while (checkPosition < end) {
    chunk = src[checkPosition++];
    entry.push(chunk);
  }
  let string2 = length < 16 ? shortStringInJS(length) : longStringInJS(length);
  if (string2 != null)
    return entry.string = string2;
  return entry.string = readFixedString(length);
}
function asSafeString(property) {
  if (typeof property === "string") return property;
  if (typeof property === "number" || typeof property === "boolean" || typeof property === "bigint") return property.toString();
  if (property == null) return property + "";
  if (currentUnpackr.allowArraysInMapKeys && Array.isArray(property) && property.flat().every((item) => ["string", "number", "boolean", "bigint"].includes(typeof item))) {
    return property.flat().toString();
  }
  throw new Error(`Invalid property type for record: ${typeof property}`);
}
var recordDefinition = (id, highByte) => {
  let structure = read().map(asSafeString);
  let firstByte = id;
  if (highByte !== void 0) {
    id = id < 32 ? -((highByte << 5) + id) : (highByte << 5) + id;
    structure.highByte = highByte;
  }
  let existingStructure = currentStructures[id];
  if (existingStructure && (existingStructure.isShared || sequentialMode)) {
    (currentStructures.restoreStructures || (currentStructures.restoreStructures = []))[id] = existingStructure;
  }
  currentStructures[id] = structure;
  structure.read = createStructureReader(structure, firstByte);
  return structure.read();
};
currentExtensions[0] = () => {
};
currentExtensions[0].noBuffer = true;
currentExtensions[66] = (data) => {
  let length = data.length;
  let value = BigInt(data[0] & 128 ? data[0] - 256 : data[0]);
  for (let i = 1; i < length; i++) {
    value <<= BigInt(8);
    value += BigInt(data[i]);
  }
  return value;
};
var errors = { Error, TypeError, ReferenceError };
currentExtensions[101] = () => {
  let data = read();
  return (errors[data[0]] || Error)(data[1], { cause: data[2] });
};
currentExtensions[105] = (data) => {
  if (currentUnpackr.structuredClone === false) throw new Error("Structured clone extension is disabled");
  let id = dataView.getUint32(position - 4);
  if (!referenceMap)
    referenceMap = /* @__PURE__ */ new Map();
  let token = src[position];
  let target2;
  if (token >= 144 && token < 160 || token == 220 || token == 221)
    target2 = [];
  else
    target2 = {};
  let refEntry = { target: target2 };
  referenceMap.set(id, refEntry);
  let targetProperties = read();
  if (refEntry.used)
    return Object.assign(target2, targetProperties);
  refEntry.target = targetProperties;
  return targetProperties;
};
currentExtensions[112] = (data) => {
  if (currentUnpackr.structuredClone === false) throw new Error("Structured clone extension is disabled");
  let id = dataView.getUint32(position - 4);
  let refEntry = referenceMap.get(id);
  refEntry.used = true;
  return refEntry.target;
};
currentExtensions[115] = () => new Set(read());
var typedArrays = ["Int8", "Uint8", "Uint8Clamped", "Int16", "Uint16", "Int32", "Uint32", "Float32", "Float64", "BigInt64", "BigUint64"].map((type) => type + "Array");
var glbl = typeof globalThis === "object" ? globalThis : window;
currentExtensions[116] = (data) => {
  let typeCode = data[0];
  let typedArrayName = typedArrays[typeCode];
  if (!typedArrayName) {
    if (typeCode === 16) {
      let ab = new ArrayBuffer(data.length - 1);
      let u8 = new Uint8Array(ab);
      u8.set(data.subarray(1));
      return ab;
    }
    throw new Error("Could not find typed array for code " + typeCode);
  }
  return new glbl[typedArrayName](Uint8Array.prototype.slice.call(data, 1).buffer);
};
currentExtensions[120] = () => {
  let data = read();
  return new RegExp(data[0], data[1]);
};
var TEMP_BUNDLE = [];
currentExtensions[98] = (data) => {
  let dataSize = (data[0] << 24) + (data[1] << 16) + (data[2] << 8) + data[3];
  let dataPosition = position;
  position += dataSize - data.length;
  bundledStrings = TEMP_BUNDLE;
  bundledStrings = [readOnlyJSString(), readOnlyJSString()];
  bundledStrings.position0 = 0;
  bundledStrings.position1 = 0;
  bundledStrings.postBundlePosition = position;
  position = dataPosition;
  return read();
};
currentExtensions[255] = (data) => {
  if (data.length == 4)
    return new Date((data[0] * 16777216 + (data[1] << 16) + (data[2] << 8) + data[3]) * 1e3);
  else if (data.length == 8)
    return new Date(
      ((data[0] << 22) + (data[1] << 14) + (data[2] << 6) + (data[3] >> 2)) / 1e6 + ((data[3] & 3) * 4294967296 + data[4] * 16777216 + (data[5] << 16) + (data[6] << 8) + data[7]) * 1e3
    );
  else if (data.length == 12)
    return new Date(
      ((data[0] << 24) + (data[1] << 16) + (data[2] << 8) + data[3]) / 1e6 + ((data[4] & 128 ? -281474976710656 : 0) + data[6] * 1099511627776 + data[7] * 4294967296 + data[8] * 16777216 + (data[9] << 16) + (data[10] << 8) + data[11]) * 1e3
    );
  else
    return /* @__PURE__ */ new Date("invalid");
};
function saveState(callback) {
  if (onSaveState)
    onSaveState();
  let savedSrcEnd = srcEnd;
  let savedPosition = position;
  let savedStringPosition = stringPosition;
  let savedSrcStringStart = srcStringStart;
  let savedSrcStringEnd = srcStringEnd;
  let savedSrcString = srcString;
  let savedStrings = strings;
  let savedReferenceMap = referenceMap;
  let savedBundledStrings = bundledStrings;
  let savedSrc = new Uint8Array(src.slice(0, srcEnd));
  let savedStructures = currentStructures;
  let savedStructuresContents = currentStructures.slice(0, currentStructures.length);
  let savedPackr = currentUnpackr;
  let savedSequentialMode = sequentialMode;
  let value = callback();
  srcEnd = savedSrcEnd;
  position = savedPosition;
  stringPosition = savedStringPosition;
  srcStringStart = savedSrcStringStart;
  srcStringEnd = savedSrcStringEnd;
  srcString = savedSrcString;
  strings = savedStrings;
  referenceMap = savedReferenceMap;
  bundledStrings = savedBundledStrings;
  src = savedSrc;
  sequentialMode = savedSequentialMode;
  currentStructures = savedStructures;
  currentStructures.splice(0, currentStructures.length, ...savedStructuresContents);
  currentUnpackr = savedPackr;
  dataView = new DataView(src.buffer, src.byteOffset, src.byteLength);
  return value;
}
function clearSource() {
  src = null;
  referenceMap = null;
  currentStructures = null;
}
var mult10 = new Array(147);
for (let i = 0; i < 256; i++) {
  mult10[i] = +("1e" + Math.floor(45.15 - i * 0.30103));
}
var defaultUnpackr = new Unpackr({ useRecords: false });
var unpack = defaultUnpackr.unpack;
var unpackMultiple = defaultUnpackr.unpackMultiple;
var decode2 = defaultUnpackr.unpack;
var FLOAT32_OPTIONS = {
  NEVER: 0,
  ALWAYS: 1,
  DECIMAL_ROUND: 3,
  DECIMAL_FIT: 4
};
var f32Array = new Float32Array(1);
var u8Array = new Uint8Array(f32Array.buffer, 0, 4);

// node_modules/@colyseus/msgpackr/pack.js
var textEncoder2;
try {
  textEncoder2 = new TextEncoder();
} catch (error) {
}
var extensions;
var extensionClasses;
var hasNodeBuffer = typeof Buffer !== "undefined";
var ByteArrayAllocate = hasNodeBuffer ? function(length) {
  return Buffer.allocUnsafeSlow(length);
} : Uint8Array;
var ByteArray = hasNodeBuffer ? Buffer : Uint8Array;
var MAX_BUFFER_SIZE = hasNodeBuffer ? 4294967296 : 2144337920;
var target;
var keysTarget;
var targetView;
var position2 = 0;
var safeEnd;
var bundledStrings2 = null;
var writeStructSlots;
var MAX_BUNDLE_SIZE = 21760;
var hasNonLatin = /[\u0080-\uFFFF]/;
var RECORD_SYMBOL = Symbol("record-id");
var Packr = class extends Unpackr {
  constructor(options) {
    super(options);
    this.offset = 0;
    let typeBuffer;
    let start;
    let hasSharedUpdate;
    let structures;
    let referenceMap2;
    let encodeUtf8 = ByteArray.prototype.utf8Write ? function(string2, position3) {
      return target.utf8Write(string2, position3, target.byteLength - position3);
    } : textEncoder2 && textEncoder2.encodeInto ? function(string2, position3) {
      return textEncoder2.encodeInto(string2, target.subarray(position3)).written;
    } : false;
    let packr = this;
    if (!options)
      options = {};
    let isSequential = options && options.sequential;
    let hasSharedStructures = options.structures || options.saveStructures;
    let maxSharedStructures = options.maxSharedStructures;
    if (maxSharedStructures == null)
      maxSharedStructures = hasSharedStructures ? 32 : 0;
    if (maxSharedStructures > 8160)
      throw new Error("Maximum maxSharedStructure is 8160");
    if (options.structuredClone && options.moreTypes == void 0) {
      this.moreTypes = true;
    }
    let maxOwnStructures = options.maxOwnStructures;
    if (maxOwnStructures == null)
      maxOwnStructures = hasSharedStructures ? 32 : 64;
    if (!this.structures && options.useRecords != false)
      this.structures = [];
    let useTwoByteRecords = maxSharedStructures > 32 || maxOwnStructures + maxSharedStructures > 64;
    let sharedLimitId = maxSharedStructures + 64;
    let maxStructureId = maxSharedStructures + maxOwnStructures + 64;
    if (maxStructureId > 8256) {
      throw new Error("Maximum maxSharedStructure + maxOwnStructure is 8192");
    }
    let recordIdsToRemove = [];
    let transitionsCount = 0;
    let serializationsSinceTransitionRebuild = 0;
    this.pack = this.encode = function(value, encodeOptions) {
      if (!target) {
        target = new ByteArrayAllocate(8192);
        targetView = target.dataView || (target.dataView = new DataView(target.buffer, 0, 8192));
        position2 = 0;
      }
      safeEnd = target.length - 10;
      if (safeEnd - position2 < 2048) {
        target = new ByteArrayAllocate(target.length);
        targetView = target.dataView || (target.dataView = new DataView(target.buffer, 0, target.length));
        safeEnd = target.length - 10;
        position2 = 0;
      } else
        position2 = position2 + 7 & 2147483640;
      start = position2;
      if (encodeOptions & RESERVE_START_SPACE) position2 += encodeOptions & 255;
      referenceMap2 = packr.structuredClone ? /* @__PURE__ */ new Map() : null;
      if (packr.bundleStrings && typeof value !== "string") {
        bundledStrings2 = [];
        bundledStrings2.size = Infinity;
      } else
        bundledStrings2 = null;
      structures = packr.structures;
      if (structures) {
        if (structures.uninitialized)
          structures = packr._mergeStructures(packr.getStructures());
        let sharedLength = structures.sharedLength || 0;
        if (sharedLength > maxSharedStructures) {
          throw new Error("Shared structures is larger than maximum shared structures, try increasing maxSharedStructures to " + structures.sharedLength);
        }
        if (!structures.transitions) {
          structures.transitions = /* @__PURE__ */ Object.create(null);
          for (let i = 0; i < sharedLength; i++) {
            let keys = structures[i];
            if (!keys)
              continue;
            let nextTransition, transition = structures.transitions;
            for (let j = 0, l = keys.length; j < l; j++) {
              let key = keys[j];
              nextTransition = transition[key];
              if (!nextTransition) {
                nextTransition = transition[key] = /* @__PURE__ */ Object.create(null);
              }
              transition = nextTransition;
            }
            transition[RECORD_SYMBOL] = i + 64;
          }
          this.lastNamedStructuresLength = sharedLength;
        }
        if (!isSequential) {
          structures.nextId = sharedLength + 64;
        }
      }
      if (hasSharedUpdate)
        hasSharedUpdate = false;
      let encodingError;
      try {
        if (packr.randomAccessStructure && value && value.constructor && value.constructor === Object)
          writeStruct(value);
        else
          pack2(value);
        let lastBundle = bundledStrings2;
        if (bundledStrings2)
          writeBundles(start, pack2, 0);
        if (referenceMap2 && referenceMap2.idsToInsert) {
          let idsToInsert = referenceMap2.idsToInsert.sort((a, b) => a.offset > b.offset ? 1 : -1);
          let i = idsToInsert.length;
          let incrementPosition = -1;
          while (lastBundle && i > 0) {
            let insertionPoint = idsToInsert[--i].offset + start;
            if (insertionPoint < lastBundle.stringsPosition + start && incrementPosition === -1)
              incrementPosition = 0;
            if (insertionPoint > lastBundle.position + start) {
              if (incrementPosition >= 0)
                incrementPosition += 6;
            } else {
              if (incrementPosition >= 0) {
                targetView.setUint32(
                  lastBundle.position + start,
                  targetView.getUint32(lastBundle.position + start) + incrementPosition
                );
                incrementPosition = -1;
              }
              lastBundle = lastBundle.previous;
              i++;
            }
          }
          if (incrementPosition >= 0 && lastBundle) {
            targetView.setUint32(
              lastBundle.position + start,
              targetView.getUint32(lastBundle.position + start) + incrementPosition
            );
          }
          position2 += idsToInsert.length * 6;
          if (position2 > safeEnd)
            makeRoom(position2);
          packr.offset = position2;
          let serialized = insertIds(target.subarray(start, position2), idsToInsert);
          referenceMap2 = null;
          return serialized;
        }
        packr.offset = position2;
        if (encodeOptions & REUSE_BUFFER_MODE) {
          target.start = start;
          target.end = position2;
          return target;
        }
        return target.subarray(start, position2);
      } catch (error) {
        encodingError = error;
        throw error;
      } finally {
        if (structures) {
          resetStructures();
          if (hasSharedUpdate && packr.saveStructures) {
            let sharedLength = structures.sharedLength || 0;
            let returnBuffer = target.subarray(start, position2);
            let newSharedData = prepareStructures(structures, packr);
            if (!encodingError) {
              if (packr.saveStructures(newSharedData, newSharedData.isCompatible) === false) {
                return packr.pack(value, encodeOptions);
              }
              packr.lastNamedStructuresLength = sharedLength;
              if (target.length > 1073741824) target = null;
              return returnBuffer;
            }
          }
        }
        if (target.length > 1073741824) target = null;
        if (encodeOptions & RESET_BUFFER_MODE)
          position2 = start;
      }
    };
    const resetStructures = () => {
      if (serializationsSinceTransitionRebuild < 10)
        serializationsSinceTransitionRebuild++;
      let sharedLength = structures.sharedLength || 0;
      if (structures.length > sharedLength && !isSequential)
        structures.length = sharedLength;
      if (transitionsCount > 1e4) {
        structures.transitions = null;
        serializationsSinceTransitionRebuild = 0;
        transitionsCount = 0;
        if (recordIdsToRemove.length > 0)
          recordIdsToRemove = [];
      } else if (recordIdsToRemove.length > 0 && !isSequential) {
        for (let i = 0, l = recordIdsToRemove.length; i < l; i++) {
          recordIdsToRemove[i][RECORD_SYMBOL] = 0;
        }
        recordIdsToRemove = [];
      }
    };
    const packArray = (value) => {
      var length = value.length;
      if (length < 16) {
        target[position2++] = 144 | length;
      } else if (length < 65536) {
        target[position2++] = 220;
        target[position2++] = length >> 8;
        target[position2++] = length & 255;
      } else {
        target[position2++] = 221;
        targetView.setUint32(position2, length);
        position2 += 4;
      }
      for (let i = 0; i < length; i++) {
        pack2(value[i]);
      }
    };
    const pack2 = (value) => {
      if (position2 > safeEnd)
        target = makeRoom(position2);
      var type = typeof value;
      var length;
      if (type === "string") {
        let strLength = value.length;
        if (bundledStrings2 && strLength >= 4 && strLength < 4096) {
          if ((bundledStrings2.size += strLength) > MAX_BUNDLE_SIZE) {
            let extStart;
            let maxBytes2 = (bundledStrings2[0] ? bundledStrings2[0].length * 3 + bundledStrings2[1].length : 0) + 10;
            if (position2 + maxBytes2 > safeEnd)
              target = makeRoom(position2 + maxBytes2);
            let lastBundle;
            if (bundledStrings2.position) {
              lastBundle = bundledStrings2;
              target[position2] = 200;
              position2 += 3;
              target[position2++] = 98;
              extStart = position2 - start;
              position2 += 4;
              writeBundles(start, pack2, 0);
              targetView.setUint16(extStart + start - 3, position2 - start - extStart);
            } else {
              target[position2++] = 214;
              target[position2++] = 98;
              extStart = position2 - start;
              position2 += 4;
            }
            bundledStrings2 = ["", ""];
            bundledStrings2.previous = lastBundle;
            bundledStrings2.size = 0;
            bundledStrings2.position = extStart;
          }
          let twoByte = hasNonLatin.test(value);
          bundledStrings2[twoByte ? 0 : 1] += value;
          target[position2++] = 193;
          pack2(twoByte ? -strLength : strLength);
          return;
        }
        let headerSize;
        if (strLength < 32) {
          headerSize = 1;
        } else if (strLength < 256) {
          headerSize = 2;
        } else if (strLength < 65536) {
          headerSize = 3;
        } else {
          headerSize = 5;
        }
        let maxBytes = strLength * 3;
        if (position2 + maxBytes > safeEnd)
          target = makeRoom(position2 + maxBytes);
        if (strLength < 64 || !encodeUtf8) {
          let i, c1, c2, strPosition = position2 + headerSize;
          for (i = 0; i < strLength; i++) {
            c1 = value.charCodeAt(i);
            if (c1 < 128) {
              target[strPosition++] = c1;
            } else if (c1 < 2048) {
              target[strPosition++] = c1 >> 6 | 192;
              target[strPosition++] = c1 & 63 | 128;
            } else if ((c1 & 64512) === 55296 && ((c2 = value.charCodeAt(i + 1)) & 64512) === 56320) {
              c1 = 65536 + ((c1 & 1023) << 10) + (c2 & 1023);
              i++;
              target[strPosition++] = c1 >> 18 | 240;
              target[strPosition++] = c1 >> 12 & 63 | 128;
              target[strPosition++] = c1 >> 6 & 63 | 128;
              target[strPosition++] = c1 & 63 | 128;
            } else {
              target[strPosition++] = c1 >> 12 | 224;
              target[strPosition++] = c1 >> 6 & 63 | 128;
              target[strPosition++] = c1 & 63 | 128;
            }
          }
          length = strPosition - position2 - headerSize;
        } else {
          length = encodeUtf8(value, position2 + headerSize);
        }
        if (length < 32) {
          target[position2++] = 160 | length;
        } else if (length < 256) {
          if (headerSize < 2) {
            target.copyWithin(position2 + 2, position2 + 1, position2 + 1 + length);
          }
          target[position2++] = 217;
          target[position2++] = length;
        } else if (length < 65536) {
          if (headerSize < 3) {
            target.copyWithin(position2 + 3, position2 + 2, position2 + 2 + length);
          }
          target[position2++] = 218;
          target[position2++] = length >> 8;
          target[position2++] = length & 255;
        } else {
          if (headerSize < 5) {
            target.copyWithin(position2 + 5, position2 + 3, position2 + 3 + length);
          }
          target[position2++] = 219;
          targetView.setUint32(position2, length);
          position2 += 4;
        }
        position2 += length;
      } else if (type === "number") {
        if (value >>> 0 === value) {
          if (value < 32 || value < 128 && this.useRecords === false || value < 64 && !this.randomAccessStructure) {
            target[position2++] = value;
          } else if (value < 256) {
            target[position2++] = 204;
            target[position2++] = value;
          } else if (value < 65536) {
            target[position2++] = 205;
            target[position2++] = value >> 8;
            target[position2++] = value & 255;
          } else {
            target[position2++] = 206;
            targetView.setUint32(position2, value);
            position2 += 4;
          }
        } else if (value >> 0 === value) {
          if (value >= -32) {
            target[position2++] = 256 + value;
          } else if (value >= -128) {
            target[position2++] = 208;
            target[position2++] = value + 256;
          } else if (value >= -32768) {
            target[position2++] = 209;
            targetView.setInt16(position2, value);
            position2 += 2;
          } else {
            target[position2++] = 210;
            targetView.setInt32(position2, value);
            position2 += 4;
          }
        } else {
          let useFloat32;
          if ((useFloat32 = this.useFloat32) > 0 && value < 4294967296 && value >= -2147483648) {
            target[position2++] = 202;
            targetView.setFloat32(position2, value);
            let xShifted;
            if (useFloat32 < 4 || // this checks for rounding of numbers that were encoded in 32-bit float to nearest significant decimal digit that could be preserved
            (xShifted = value * mult10[(target[position2] & 127) << 1 | target[position2 + 1] >> 7]) >> 0 === xShifted) {
              position2 += 4;
              return;
            } else
              position2--;
          }
          target[position2++] = 203;
          targetView.setFloat64(position2, value);
          position2 += 8;
        }
      } else if (type === "object" || type === "function") {
        if (!value)
          target[position2++] = 192;
        else {
          if (referenceMap2) {
            let referee = referenceMap2.get(value);
            if (referee) {
              if (!referee.id) {
                let idsToInsert = referenceMap2.idsToInsert || (referenceMap2.idsToInsert = []);
                referee.id = idsToInsert.push(referee);
              }
              target[position2++] = 214;
              target[position2++] = 112;
              targetView.setUint32(position2, referee.id);
              position2 += 4;
              return;
            } else
              referenceMap2.set(value, { offset: position2 - start });
          }
          let constructor = value.constructor;
          if (constructor === Object) {
            writeObject(value);
          } else if (constructor === Array) {
            packArray(value);
          } else if (constructor === Map) {
            if (this.mapAsEmptyObject) target[position2++] = 128;
            else {
              length = value.size;
              if (length < 16) {
                target[position2++] = 128 | length;
              } else if (length < 65536) {
                target[position2++] = 222;
                target[position2++] = length >> 8;
                target[position2++] = length & 255;
              } else {
                target[position2++] = 223;
                targetView.setUint32(position2, length);
                position2 += 4;
              }
              for (let [key, entryValue] of value) {
                pack2(key);
                pack2(entryValue);
              }
            }
          } else {
            for (let i = 0, l = extensions.length; i < l; i++) {
              let extensionClass = extensionClasses[i];
              if (value instanceof extensionClass) {
                let extension = extensions[i];
                if (extension.write) {
                  if (extension.type) {
                    target[position2++] = 212;
                    target[position2++] = extension.type;
                    target[position2++] = 0;
                  }
                  let writeResult = extension.write.call(this, value);
                  if (writeResult === value) {
                    if (Array.isArray(value)) {
                      packArray(value);
                    } else {
                      writeObject(value);
                    }
                  } else {
                    pack2(writeResult);
                  }
                  return;
                }
                let currentTarget = target;
                let currentTargetView = targetView;
                let currentPosition = position2;
                target = null;
                let result;
                try {
                  result = extension.pack.call(this, value, (size) => {
                    target = currentTarget;
                    currentTarget = null;
                    position2 += size;
                    if (position2 > safeEnd)
                      makeRoom(position2);
                    return {
                      target,
                      targetView,
                      position: position2 - size
                    };
                  }, pack2);
                } finally {
                  if (currentTarget) {
                    target = currentTarget;
                    targetView = currentTargetView;
                    position2 = currentPosition;
                    safeEnd = target.length - 10;
                  }
                }
                if (result) {
                  if (result.length + position2 > safeEnd)
                    makeRoom(result.length + position2);
                  position2 = writeExtensionData(result, target, position2, extension.type);
                }
                return;
              }
            }
            if (Array.isArray(value)) {
              packArray(value);
            } else {
              if (value.toJSON) {
                const json = value.toJSON();
                if (json !== value)
                  return pack2(json);
              }
              if (type === "function")
                return pack2(this.writeFunction && this.writeFunction(value));
              writeObject(value);
            }
          }
        }
      } else if (type === "boolean") {
        target[position2++] = value ? 195 : 194;
      } else if (type === "bigint") {
        if (value < BigInt(1) << BigInt(63) && value >= -(BigInt(1) << BigInt(63))) {
          target[position2++] = 211;
          targetView.setBigInt64(position2, value);
        } else if (value < BigInt(1) << BigInt(64) && value > 0) {
          target[position2++] = 207;
          targetView.setBigUint64(position2, value);
        } else {
          if (this.largeBigIntToFloat) {
            target[position2++] = 203;
            targetView.setFloat64(position2, Number(value));
          } else if (this.largeBigIntToString) {
            return pack2(value.toString());
          } else if (this.useBigIntExtension && value < BigInt(2) ** BigInt(1023) && value > -(BigInt(2) ** BigInt(1023))) {
            target[position2++] = 199;
            position2++;
            target[position2++] = 66;
            let bytes = [];
            let alignedSign;
            do {
              let byte = value & BigInt(255);
              alignedSign = (byte & BigInt(128)) === (value < BigInt(0) ? BigInt(128) : BigInt(0));
              bytes.push(byte);
              value >>= BigInt(8);
            } while (!((value === BigInt(0) || value === BigInt(-1)) && alignedSign));
            target[position2 - 2] = bytes.length;
            for (let i = bytes.length; i > 0; ) {
              target[position2++] = Number(bytes[--i]);
            }
            return;
          } else {
            throw new RangeError(value + " was too large to fit in MessagePack 64-bit integer format, use useBigIntExtension, or set largeBigIntToFloat to convert to float-64, or set largeBigIntToString to convert to string");
          }
        }
        position2 += 8;
      } else if (type === "undefined") {
        if (this.encodeUndefinedAsNil)
          target[position2++] = 192;
        else {
          target[position2++] = 212;
          target[position2++] = 0;
          target[position2++] = 0;
        }
      } else {
        throw new Error("Unknown type: " + type);
      }
    };
    const writePlainObject = this.variableMapSize || this.coercibleKeyAsNumber || this.skipValues ? (object) => {
      let keys;
      if (this.skipValues) {
        keys = [];
        for (let key2 in object) {
          if ((typeof object.hasOwnProperty !== "function" || object.hasOwnProperty(key2)) && !this.skipValues.includes(object[key2]))
            keys.push(key2);
        }
      } else {
        keys = Object.keys(object);
      }
      let length = keys.length;
      if (length < 16) {
        target[position2++] = 128 | length;
      } else if (length < 65536) {
        target[position2++] = 222;
        target[position2++] = length >> 8;
        target[position2++] = length & 255;
      } else {
        target[position2++] = 223;
        targetView.setUint32(position2, length);
        position2 += 4;
      }
      let key;
      if (this.coercibleKeyAsNumber) {
        for (let i = 0; i < length; i++) {
          key = keys[i];
          let num = Number(key);
          pack2(isNaN(num) ? key : num);
          pack2(object[key]);
        }
      } else {
        for (let i = 0; i < length; i++) {
          pack2(key = keys[i]);
          pack2(object[key]);
        }
      }
    } : (object) => {
      target[position2++] = 222;
      let objectOffset = position2 - start;
      position2 += 2;
      let size = 0;
      for (let key in object) {
        if (typeof object.hasOwnProperty !== "function" || object.hasOwnProperty(key)) {
          pack2(key);
          pack2(object[key]);
          size++;
        }
      }
      if (size > 65535) {
        throw new Error('Object is too large to serialize with fast 16-bit map size, use the "variableMapSize" option to serialize this object');
      }
      target[objectOffset++ + start] = size >> 8;
      target[objectOffset + start] = size & 255;
    };
    const writeRecord = this.useRecords === false ? writePlainObject : options.progressiveRecords && !useTwoByteRecords ? (
      // this is about 2% faster for highly stable structures, since it only requires one for-in loop (but much more expensive when new structure needs to be written)
      (object) => {
        let nextTransition, transition = structures.transitions || (structures.transitions = /* @__PURE__ */ Object.create(null));
        let objectOffset = position2++ - start;
        let wroteKeys;
        for (let key in object) {
          if (typeof object.hasOwnProperty !== "function" || object.hasOwnProperty(key)) {
            nextTransition = transition[key];
            if (nextTransition)
              transition = nextTransition;
            else {
              let keys = Object.keys(object);
              let lastTransition = transition;
              transition = structures.transitions;
              let newTransitions = 0;
              for (let i = 0, l = keys.length; i < l; i++) {
                let key2 = keys[i];
                nextTransition = transition[key2];
                if (!nextTransition) {
                  nextTransition = transition[key2] = /* @__PURE__ */ Object.create(null);
                  newTransitions++;
                }
                transition = nextTransition;
              }
              if (objectOffset + start + 1 == position2) {
                position2--;
                newRecord(transition, keys, newTransitions);
              } else
                insertNewRecord(transition, keys, objectOffset, newTransitions);
              wroteKeys = true;
              transition = lastTransition[key];
            }
            pack2(object[key]);
          }
        }
        if (!wroteKeys) {
          let recordId = transition[RECORD_SYMBOL];
          if (recordId)
            target[objectOffset + start] = recordId;
          else
            insertNewRecord(transition, Object.keys(object), objectOffset, 0);
        }
      }
    ) : (object) => {
      let nextTransition, transition = structures.transitions || (structures.transitions = /* @__PURE__ */ Object.create(null));
      let newTransitions = 0;
      for (let key in object) if (typeof object.hasOwnProperty !== "function" || object.hasOwnProperty(key)) {
        nextTransition = transition[key];
        if (!nextTransition) {
          nextTransition = transition[key] = /* @__PURE__ */ Object.create(null);
          newTransitions++;
        }
        transition = nextTransition;
      }
      let recordId = transition[RECORD_SYMBOL];
      if (recordId) {
        if (recordId >= 96 && useTwoByteRecords) {
          target[position2++] = ((recordId -= 96) & 31) + 96;
          target[position2++] = recordId >> 5;
        } else
          target[position2++] = recordId;
      } else {
        newRecord(transition, transition.__keys__ || Object.keys(object), newTransitions);
      }
      for (let key in object)
        if (typeof object.hasOwnProperty !== "function" || object.hasOwnProperty(key)) {
          pack2(object[key]);
        }
    };
    const checkUseRecords = typeof this.useRecords == "function" && this.useRecords;
    const writeObject = checkUseRecords ? (object) => {
      checkUseRecords(object) ? writeRecord(object) : writePlainObject(object);
    } : writeRecord;
    const makeRoom = (end) => {
      let newSize;
      if (end > 16777216) {
        if (end - start > MAX_BUFFER_SIZE)
          throw new Error("Packed buffer would be larger than maximum buffer size");
        newSize = Math.min(
          MAX_BUFFER_SIZE,
          Math.round(Math.max((end - start) * (end > 67108864 ? 1.25 : 2), 4194304) / 4096) * 4096
        );
      } else
        newSize = (Math.max(end - start << 2, target.length - 1) >> 12) + 1 << 12;
      let newBuffer = new ByteArrayAllocate(newSize);
      targetView = newBuffer.dataView || (newBuffer.dataView = new DataView(newBuffer.buffer, 0, newSize));
      end = Math.min(end, target.length);
      if (target.copy)
        target.copy(newBuffer, 0, start, end);
      else
        newBuffer.set(target.slice(start, end));
      position2 -= start;
      start = 0;
      safeEnd = newBuffer.length - 10;
      return target = newBuffer;
    };
    const newRecord = (transition, keys, newTransitions) => {
      let recordId = structures.nextId;
      if (!recordId)
        recordId = 64;
      if (recordId < sharedLimitId && this.shouldShareStructure && !this.shouldShareStructure(keys)) {
        recordId = structures.nextOwnId;
        if (!(recordId < maxStructureId))
          recordId = sharedLimitId;
        structures.nextOwnId = recordId + 1;
      } else {
        if (recordId >= maxStructureId)
          recordId = sharedLimitId;
        structures.nextId = recordId + 1;
      }
      let highByte = keys.highByte = recordId >= 96 && useTwoByteRecords ? recordId - 96 >> 5 : -1;
      transition[RECORD_SYMBOL] = recordId;
      transition.__keys__ = keys;
      structures[recordId - 64] = keys;
      if (recordId < sharedLimitId) {
        keys.isShared = true;
        structures.sharedLength = recordId - 63;
        hasSharedUpdate = true;
        if (highByte >= 0) {
          target[position2++] = (recordId & 31) + 96;
          target[position2++] = highByte;
        } else {
          target[position2++] = recordId;
        }
      } else {
        if (highByte >= 0) {
          target[position2++] = 213;
          target[position2++] = 114;
          target[position2++] = (recordId & 31) + 96;
          target[position2++] = highByte;
        } else {
          target[position2++] = 212;
          target[position2++] = 114;
          target[position2++] = recordId;
        }
        if (newTransitions)
          transitionsCount += serializationsSinceTransitionRebuild * newTransitions;
        if (recordIdsToRemove.length >= maxOwnStructures)
          recordIdsToRemove.shift()[RECORD_SYMBOL] = 0;
        recordIdsToRemove.push(transition);
        pack2(keys);
      }
    };
    const insertNewRecord = (transition, keys, insertionOffset, newTransitions) => {
      let mainTarget = target;
      let mainPosition = position2;
      let mainSafeEnd = safeEnd;
      let mainStart = start;
      target = keysTarget;
      position2 = 0;
      start = 0;
      if (!target)
        keysTarget = target = new ByteArrayAllocate(8192);
      safeEnd = target.length - 10;
      newRecord(transition, keys, newTransitions);
      keysTarget = target;
      let keysPosition = position2;
      target = mainTarget;
      position2 = mainPosition;
      safeEnd = mainSafeEnd;
      start = mainStart;
      if (keysPosition > 1) {
        let newEnd = position2 + keysPosition - 1;
        if (newEnd > safeEnd)
          makeRoom(newEnd);
        let insertionPosition = insertionOffset + start;
        target.copyWithin(insertionPosition + keysPosition, insertionPosition + 1, position2);
        target.set(keysTarget.slice(0, keysPosition), insertionPosition);
        position2 = newEnd;
      } else {
        target[insertionOffset + start] = keysTarget[0];
      }
    };
    const writeStruct = (object) => {
      let newPosition = writeStructSlots(object, target, start, position2, structures, makeRoom, (value, newPosition2, notifySharedUpdate) => {
        if (notifySharedUpdate)
          return hasSharedUpdate = true;
        position2 = newPosition2;
        let startTarget = target;
        pack2(value);
        resetStructures();
        if (startTarget !== target) {
          return { position: position2, targetView, target };
        }
        return position2;
      }, this);
      if (newPosition === 0)
        return writeObject(object);
      position2 = newPosition;
    };
  }
  useBuffer(buffer) {
    target = buffer;
    target.dataView || (target.dataView = new DataView(target.buffer, target.byteOffset, target.byteLength));
    position2 = 0;
  }
  set position(value) {
    position2 = value;
  }
  get position() {
    return position2;
  }
  set buffer(buffer) {
    target = buffer;
  }
  get buffer() {
    return target;
  }
  clearSharedData() {
    if (this.structures)
      this.structures = [];
    if (this.typedStructs)
      this.typedStructs = [];
  }
};
extensionClasses = [Date, Set, Error, RegExp, ArrayBuffer, Object.getPrototypeOf(Uint8Array.prototype).constructor, C1Type];
extensions = [{
  pack(date, allocateForWrite, pack2) {
    let seconds = date.getTime() / 1e3;
    if ((this.useTimestamp32 || date.getMilliseconds() === 0) && seconds >= 0 && seconds < 4294967296) {
      let { target: target2, targetView: targetView2, position: position3 } = allocateForWrite(6);
      target2[position3++] = 214;
      target2[position3++] = 255;
      targetView2.setUint32(position3, seconds);
    } else if (seconds > 0 && seconds < 4294967296) {
      let { target: target2, targetView: targetView2, position: position3 } = allocateForWrite(10);
      target2[position3++] = 215;
      target2[position3++] = 255;
      targetView2.setUint32(position3, date.getMilliseconds() * 4e6 + (seconds / 1e3 / 4294967296 >> 0));
      targetView2.setUint32(position3 + 4, seconds);
    } else if (isNaN(seconds)) {
      if (this.onInvalidDate) {
        allocateForWrite(0);
        return pack2(this.onInvalidDate());
      }
      let { target: target2, targetView: targetView2, position: position3 } = allocateForWrite(3);
      target2[position3++] = 212;
      target2[position3++] = 255;
      target2[position3++] = 255;
    } else {
      let { target: target2, targetView: targetView2, position: position3 } = allocateForWrite(15);
      target2[position3++] = 199;
      target2[position3++] = 12;
      target2[position3++] = 255;
      targetView2.setUint32(position3, date.getMilliseconds() * 1e6);
      targetView2.setBigInt64(position3 + 4, BigInt(Math.floor(seconds)));
    }
  }
}, {
  pack(set, allocateForWrite, pack2) {
    if (this.setAsEmptyObject) {
      allocateForWrite(0);
      return pack2({});
    }
    let array = Array.from(set);
    let { target: target2, position: position3 } = allocateForWrite(this.moreTypes ? 3 : 0);
    if (this.moreTypes) {
      target2[position3++] = 212;
      target2[position3++] = 115;
      target2[position3++] = 0;
    }
    pack2(array);
  }
}, {
  pack(error, allocateForWrite, pack2) {
    let { target: target2, position: position3 } = allocateForWrite(this.moreTypes ? 3 : 0);
    if (this.moreTypes) {
      target2[position3++] = 212;
      target2[position3++] = 101;
      target2[position3++] = 0;
    }
    pack2([error.name, error.message, error.cause]);
  }
}, {
  pack(regex, allocateForWrite, pack2) {
    let { target: target2, position: position3 } = allocateForWrite(this.moreTypes ? 3 : 0);
    if (this.moreTypes) {
      target2[position3++] = 212;
      target2[position3++] = 120;
      target2[position3++] = 0;
    }
    pack2([regex.source, regex.flags]);
  }
}, {
  pack(arrayBuffer, allocateForWrite) {
    if (this.moreTypes)
      writeExtBuffer(arrayBuffer, 16, allocateForWrite);
    else
      writeBuffer(hasNodeBuffer ? Buffer.from(arrayBuffer) : new Uint8Array(arrayBuffer), allocateForWrite);
  }
}, {
  pack(typedArray, allocateForWrite) {
    let constructor = typedArray.constructor;
    if (constructor !== ByteArray && this.moreTypes)
      writeExtBuffer(typedArray, typedArrays.indexOf(constructor.name), allocateForWrite);
    else
      writeBuffer(typedArray, allocateForWrite);
  }
}, {
  pack(c1, allocateForWrite) {
    let { target: target2, position: position3 } = allocateForWrite(1);
    target2[position3] = 193;
  }
}];
function writeExtBuffer(typedArray, type, allocateForWrite, encode3) {
  let length = typedArray.byteLength;
  if (length + 1 < 256) {
    var { target: target2, position: position3 } = allocateForWrite(4 + length);
    target2[position3++] = 199;
    target2[position3++] = length + 1;
  } else if (length + 1 < 65536) {
    var { target: target2, position: position3 } = allocateForWrite(5 + length);
    target2[position3++] = 200;
    target2[position3++] = length + 1 >> 8;
    target2[position3++] = length + 1 & 255;
  } else {
    var { target: target2, position: position3, targetView: targetView2 } = allocateForWrite(7 + length);
    target2[position3++] = 201;
    targetView2.setUint32(position3, length + 1);
    position3 += 4;
  }
  target2[position3++] = 116;
  target2[position3++] = type;
  if (!typedArray.buffer) typedArray = new Uint8Array(typedArray);
  target2.set(new Uint8Array(typedArray.buffer, typedArray.byteOffset, typedArray.byteLength), position3);
}
function writeBuffer(buffer, allocateForWrite) {
  let length = buffer.byteLength;
  var target2, position3;
  if (length < 256) {
    var { target: target2, position: position3 } = allocateForWrite(length + 2);
    target2[position3++] = 196;
    target2[position3++] = length;
  } else if (length < 65536) {
    var { target: target2, position: position3 } = allocateForWrite(length + 3);
    target2[position3++] = 197;
    target2[position3++] = length >> 8;
    target2[position3++] = length & 255;
  } else {
    var { target: target2, position: position3, targetView: targetView2 } = allocateForWrite(length + 5);
    target2[position3++] = 198;
    targetView2.setUint32(position3, length);
    position3 += 4;
  }
  target2.set(buffer, position3);
}
function writeExtensionData(result, target2, position3, type) {
  let length = result.length;
  switch (length) {
    case 1:
      target2[position3++] = 212;
      break;
    case 2:
      target2[position3++] = 213;
      break;
    case 4:
      target2[position3++] = 214;
      break;
    case 8:
      target2[position3++] = 215;
      break;
    case 16:
      target2[position3++] = 216;
      break;
    default:
      if (length < 256) {
        target2[position3++] = 199;
        target2[position3++] = length;
      } else if (length < 65536) {
        target2[position3++] = 200;
        target2[position3++] = length >> 8;
        target2[position3++] = length & 255;
      } else {
        target2[position3++] = 201;
        target2[position3++] = length >> 24;
        target2[position3++] = length >> 16 & 255;
        target2[position3++] = length >> 8 & 255;
        target2[position3++] = length & 255;
      }
  }
  target2[position3++] = type;
  target2.set(result, position3);
  position3 += length;
  return position3;
}
function insertIds(serialized, idsToInsert) {
  let nextId;
  let distanceToMove = idsToInsert.length * 6;
  let lastEnd = serialized.length - distanceToMove;
  while (nextId = idsToInsert.pop()) {
    let offset = nextId.offset;
    let id = nextId.id;
    serialized.copyWithin(offset + distanceToMove, offset, lastEnd);
    distanceToMove -= 6;
    let position3 = offset + distanceToMove;
    serialized[position3++] = 214;
    serialized[position3++] = 105;
    serialized[position3++] = id >> 24;
    serialized[position3++] = id >> 16 & 255;
    serialized[position3++] = id >> 8 & 255;
    serialized[position3++] = id & 255;
    lastEnd = offset;
  }
  return serialized;
}
function writeBundles(start, pack2, incrementPosition) {
  if (bundledStrings2.length > 0) {
    targetView.setUint32(bundledStrings2.position + start, position2 + incrementPosition - bundledStrings2.position - start);
    bundledStrings2.stringsPosition = position2 - start;
    let writeStrings = bundledStrings2;
    bundledStrings2 = null;
    pack2(writeStrings[0]);
    pack2(writeStrings[1]);
  }
}
function prepareStructures(structures, packr) {
  structures.isCompatible = (existingStructures) => {
    let compatible = !existingStructures || (packr.lastNamedStructuresLength || 0) === existingStructures.length;
    if (!compatible)
      packr._mergeStructures(existingStructures);
    return compatible;
  };
  return structures;
}
var defaultPackr = new Packr({ useRecords: false });
var pack = defaultPackr.pack;
var encode2 = defaultPackr.pack;
var { NEVER, ALWAYS, DECIMAL_ROUND, DECIMAL_FIT } = FLOAT32_OPTIONS;
var REUSE_BUFFER_MODE = 512;
var RESET_BUFFER_MODE = 1024;
var RESERVE_START_SPACE = 2048;

// node_modules/@colyseus/sdk/build/transport/H3Transport.mjs
var H3TransportTransport = class {
  // 9 bytes is the maximum length of a length prefix
  constructor(events) {
    __publicField(this, "wt");
    __publicField(this, "isOpen", false);
    __publicField(this, "events");
    __publicField(this, "reader");
    __publicField(this, "writer");
    __publicField(this, "unreliableReader");
    __publicField(this, "unreliableWriter");
    __publicField(this, "lengthPrefixBuffer", new Uint8Array(9));
    this.events = events;
  }
  connect(url, options = {}) {
    const wtOpts = options.fingerprint && {
      // requireUnreliable: true,
      // congestionControl: "default", // "low-latency" || "throughput"
      serverCertificateHashes: [{
        algorithm: "sha-256",
        value: new Uint8Array(options.fingerprint).buffer
      }]
    } || void 0;
    this.wt = new WebTransport(url, wtOpts);
    this.wt.ready.then((e) => {
      console.log("WebTransport ready!", e);
      this.isOpen = true;
      this.unreliableReader = this.wt.datagrams.readable.getReader();
      this.unreliableWriter = this.wt.datagrams.writable.getWriter();
      const incomingBidi = this.wt.incomingBidirectionalStreams.getReader();
      incomingBidi.read().then((stream) => {
        this.reader = stream.value.readable.getReader();
        this.writer = stream.value.writable.getWriter();
        this.sendSeatReservation(options.roomId, options.sessionId, options.reconnectionToken, options.skipHandshake);
        this.readIncomingData();
        this.readIncomingUnreliableData();
      }).catch((e2) => {
        console.error("failed to read incoming stream", e2);
        console.error("TODO: close the connection");
      });
    }).catch((e) => {
      console.log("WebTransport not ready!", e);
      this._close();
    });
    this.wt.closed.then((e) => {
      console.log("WebTransport closed w/ success", e);
      this.events.onclose({ code: e.closeCode, reason: e.reason });
    }).catch((e) => {
      console.log("WebTransport closed w/ error", e);
      this.events.onerror(e);
      this.events.onclose({ code: e.closeCode, reason: e.reason });
    }).finally(() => {
      this._close();
    });
  }
  send(data) {
    const prefixLength = encode.number(this.lengthPrefixBuffer, data.length, { offset: 0 });
    const dataWithPrefixedLength = new Uint8Array(prefixLength + data.length);
    dataWithPrefixedLength.set(this.lengthPrefixBuffer.subarray(0, prefixLength), 0);
    dataWithPrefixedLength.set(data, prefixLength);
    this.writer.write(dataWithPrefixedLength);
  }
  sendUnreliable(data) {
    const prefixLength = encode.number(this.lengthPrefixBuffer, data.length, { offset: 0 });
    const dataWithPrefixedLength = new Uint8Array(prefixLength + data.length);
    dataWithPrefixedLength.set(this.lengthPrefixBuffer.subarray(0, prefixLength), 0);
    dataWithPrefixedLength.set(data, prefixLength);
    this.unreliableWriter.write(dataWithPrefixedLength);
  }
  close(code, reason) {
    try {
      this.wt.close({ closeCode: code, reason });
    } catch (e) {
      console.error(e);
    }
  }
  async readIncomingData() {
    let result;
    while (this.isOpen) {
      try {
        result = await this.reader.read();
        const messages = result.value;
        const it = { offset: 0 };
        do {
          const length = decode.number(messages, it);
          this.events.onmessage({ data: messages.subarray(it.offset, it.offset + length) });
          it.offset += length;
        } while (it.offset < messages.length);
      } catch (e) {
        if (e.message.indexOf("session is closed") === -1) {
          console.error("H3Transport: failed to read incoming data", e);
        }
        break;
      }
      if (result.done) {
        break;
      }
    }
  }
  async readIncomingUnreliableData() {
    let result;
    while (this.isOpen) {
      try {
        result = await this.unreliableReader.read();
        const messages = result.value;
        const it = { offset: 0 };
        do {
          const length = decode.number(messages, it);
          this.events.onmessage({ data: messages.subarray(it.offset, it.offset + length) });
          it.offset += length;
        } while (it.offset < messages.length);
      } catch (e) {
        if (e.message.indexOf("session is closed") === -1) {
          console.error("H3Transport: failed to read incoming data", e);
        }
        break;
      }
      if (result.done) {
        break;
      }
    }
  }
  sendSeatReservation(roomId, sessionId, reconnectionToken, skipHandshake) {
    const it = { offset: 0 };
    const bytes = [];
    encode.string(bytes, roomId, it);
    encode.string(bytes, sessionId, it);
    if (reconnectionToken) {
      encode.string(bytes, reconnectionToken, it);
    }
    if (skipHandshake) {
      encode.boolean(bytes, 1, it);
    }
    this.writer.write(new Uint8Array(bytes).buffer);
  }
  _close() {
    this.isOpen = false;
  }
};

// node_modules/@colyseus/sdk/build/transport/WebSocketTransport.mjs
var import_ws = __toESM(require_browser(), 1);
var WebSocket = globalThis.WebSocket || import_ws.default;
var WebSocketTransport = class {
  constructor(events) {
    __publicField(this, "ws");
    __publicField(this, "protocols");
    __publicField(this, "events");
    this.events = events;
  }
  send(data) {
    this.ws.send(data);
  }
  sendUnreliable(data) {
    console.warn("@colyseus/sdk: The WebSocket transport does not support unreliable messages");
  }
  /**
   * @param url URL to connect to
   * @param headers custom headers to send with the connection (only supported in Node.js. Web Browsers do not allow setting custom headers)
   */
  connect(url, headers) {
    try {
      this.ws = new WebSocket(url, { headers, protocols: this.protocols });
    } catch (e) {
      this.ws = new WebSocket(url, this.protocols);
    }
    this.ws.binaryType = "arraybuffer";
    this.ws.onopen = (event) => this.events.onopen?.(event);
    this.ws.onmessage = (event) => this.events.onmessage?.(event);
    this.ws.onclose = (event) => this.events.onclose?.(event);
    this.ws.onerror = (event) => this.events.onerror?.(event);
  }
  close(code, reason) {
    if (code === CloseCode.MAY_TRY_RECONNECT && this.events.onclose) {
      this.ws.onclose = null;
      this.events.onclose({ code, reason });
    }
    this.ws.close(code, reason);
  }
  get isOpen() {
    return this.ws.readyState === WebSocket.OPEN;
  }
};

// node_modules/@colyseus/sdk/build/Connection.mjs
var onOfflineListeners = [];
var hasGlobalEventListeners = typeof addEventListener === "function" && typeof removeEventListener === "function";
if (hasGlobalEventListeners) {
  addEventListener("offline", () => {
    console.warn(`@colyseus/sdk: \u{1F6D1} Network offline. Closing ${onOfflineListeners.length} connection(s)`);
    onOfflineListeners.forEach((listener) => listener());
  }, false);
}
var __offlineListener;
var Connection = class {
  constructor(protocol) {
    __publicField(this, "transport");
    __publicField(this, "events", {});
    __publicField(this, "url");
    __publicField(this, "options");
    __privateAdd(this, __offlineListener, hasGlobalEventListeners ? () => this.close(CloseCode.MAY_TRY_RECONNECT) : null);
    switch (protocol) {
      case "h3":
        this.transport = new H3TransportTransport(this.events);
        break;
      default:
        this.transport = new WebSocketTransport(this.events);
        break;
    }
  }
  connect(url, options) {
    if (hasGlobalEventListeners) {
      const onOpen = this.events.onopen;
      this.events.onopen = (ev) => {
        onOfflineListeners.push(__privateGet(this, __offlineListener));
        onOpen?.(ev);
      };
      const onClose = this.events.onclose;
      this.events.onclose = (ev) => {
        onOfflineListeners.splice(onOfflineListeners.indexOf(__privateGet(this, __offlineListener)), 1);
        onClose?.(ev);
      };
    }
    this.url = url;
    this.options = options;
    this.transport.connect(url, options);
  }
  send(data) {
    this.transport.send(data);
  }
  sendUnreliable(data) {
    this.transport.sendUnreliable(data);
  }
  reconnect(queryParams) {
    const url = new URL(this.url);
    for (const key in queryParams) {
      url.searchParams.set(key, queryParams[key]);
    }
    this.transport.connect(url.toString(), this.options);
  }
  close(code, reason) {
    this.transport.close(code, reason);
  }
  get isOpen() {
    return this.transport.isOpen;
  }
};
__offlineListener = new WeakMap();

// node_modules/@colyseus/sdk/build/serializer/Serializer.mjs
var serializers = {};
function registerSerializer(id, serializer) {
  serializers[id] = serializer;
}
function getSerializer(id) {
  const serializer = serializers[id];
  if (!serializer) {
    throw new Error("missing serializer: " + id);
  }
  return serializer;
}

// node_modules/@colyseus/sdk/build/core/nanoevents.mjs
var createNanoEvents = () => ({
  emit(event, ...args) {
    let callbacks = this.events[event] || [];
    for (let i = 0, length = callbacks.length; i < length; i++) {
      callbacks[i](...args);
    }
  },
  events: {},
  on(event, cb) {
    this.events[event]?.push(cb) || (this.events[event] = [cb]);
    return () => {
      this.events[event] = this.events[event]?.filter((i) => cb !== i);
    };
  }
});

// node_modules/@colyseus/sdk/build/core/signal.mjs
var EventEmitter = class {
  constructor() {
    __publicField(this, "handlers", []);
  }
  register(cb, once = false) {
    this.handlers.push(cb);
    return this;
  }
  invoke(...args) {
    this.handlers.forEach((handler) => handler.apply(this, args));
  }
  invokeAsync(...args) {
    return Promise.all(this.handlers.map((handler) => handler.apply(this, args)));
  }
  remove(cb) {
    const index = this.handlers.indexOf(cb);
    this.handlers[index] = this.handlers[this.handlers.length - 1];
    this.handlers.pop();
  }
  clear() {
    this.handlers = [];
  }
};
function createSignal() {
  const emitter = new EventEmitter();
  function register(cb) {
    return emitter.register(cb, this === null);
  }
  ;
  register.once = (cb) => {
    const callback = function(...args) {
      cb.apply(this, args);
      emitter.remove(callback);
    };
    emitter.register(callback);
  };
  register.remove = (cb) => emitter.remove(cb);
  register.invoke = (...args) => emitter.invoke(...args);
  register.invokeAsync = (...args) => emitter.invokeAsync(...args);
  register.clear = () => emitter.clear();
  return register;
}

// node_modules/@colyseus/sdk/build/serializer/SchemaSerializer.mjs
var SchemaSerializer = class {
  constructor() {
    __publicField(this, "state");
    __publicField(this, "decoder");
  }
  setState(encodedState, it) {
    this.decoder.decode(encodedState, it);
  }
  getState() {
    return this.state;
  }
  patch(patches, it) {
    return this.decoder.decode(patches, it);
  }
  teardown() {
    this.decoder.root.clearRefs();
  }
  handshake(bytes, it) {
    if (this.state) {
      Reflection.decode(bytes, it);
      this.decoder = new Decoder(this.state);
    } else {
      this.decoder = Reflection.decode(bytes, it);
      this.state = this.decoder.state;
    }
  }
};

// node_modules/@colyseus/sdk/build/core/utils.mjs
function now() {
  return typeof performance !== "undefined" ? performance.now() : Date.now();
}

// node_modules/@colyseus/sdk/build/Room.mjs
var _lastPingTime, _pingCallback;
var Room = class {
  constructor(name, rootSchema) {
    __publicField(this, "roomId");
    __publicField(this, "sessionId");
    __publicField(this, "reconnectionToken");
    __publicField(this, "name");
    __publicField(this, "connection");
    // Public signals
    __publicField(this, "onStateChange", createSignal());
    __publicField(this, "onError", createSignal());
    __publicField(this, "onLeave", createSignal());
    __publicField(this, "onReconnect", createSignal());
    __publicField(this, "onDrop", createSignal());
    __publicField(this, "onJoin", createSignal());
    __publicField(this, "serializerId");
    __publicField(this, "serializer");
    // reconnection logic
    __publicField(this, "reconnection", {
      retryCount: 0,
      maxRetries: 15,
      delay: 100,
      minDelay: 100,
      maxDelay: 5e3,
      minUptime: 5e3,
      backoff: exponentialBackoff,
      maxEnqueuedMessages: 10,
      enqueuedMessages: [],
      isReconnecting: false
    });
    __publicField(this, "joinedAtTime", 0);
    __publicField(this, "onMessageHandlers", createNanoEvents());
    __publicField(this, "packr");
    __privateAdd(this, _lastPingTime, 0);
    __privateAdd(this, _pingCallback);
    this.name = name;
    this.packr = new Packr();
    this.packr.encode(void 0);
    if (rootSchema) {
      const serializer = new (getSerializer("schema"))();
      this.serializer = serializer;
      const state = new rootSchema();
      serializer.state = state;
      serializer.decoder = new Decoder(state);
    }
    this.onLeave(() => {
      this.removeAllListeners();
      this.destroy();
    });
  }
  connect(endpoint, options, headers) {
    this.connection = new Connection(options.protocol);
    this.connection.events.onmessage = this.onMessageCallback.bind(this);
    this.connection.events.onclose = (e) => {
      if (this.joinedAtTime === 0) {
        console.warn?.(`Room connection was closed unexpectedly (${e.code}): ${e.reason}`);
        this.onError.invoke(e.code, e.reason);
        return;
      }
      if (e.code === CloseCode.NO_STATUS_RECEIVED || e.code === CloseCode.ABNORMAL_CLOSURE || e.code === CloseCode.GOING_AWAY || e.code === CloseCode.MAY_TRY_RECONNECT) {
        this.onDrop.invoke(e.code, e.reason);
        this.handleReconnection();
      } else {
        this.onLeave.invoke(e.code, e.reason);
      }
    };
    this.connection.events.onerror = (e) => {
      this.onError.invoke(e.code, e.reason);
    };
    const skipHandshake = this.serializer?.getState() !== void 0;
    if (options.protocol === "h3") {
      const url = new URL(endpoint);
      this.connection.connect(url.origin, { ...options, skipHandshake });
    } else {
      this.connection.connect(`${endpoint}${skipHandshake ? "&skipHandshake=1" : ""}`, headers);
    }
  }
  leave(consented = true) {
    return new Promise((resolve) => {
      this.onLeave((code) => resolve(code));
      if (this.connection) {
        if (consented) {
          this.packr.buffer[0] = Protocol.LEAVE_ROOM;
          this.connection.send(this.packr.buffer.subarray(0, 1));
        } else {
          this.connection.close();
        }
      } else {
        this.onLeave.invoke(CloseCode.CONSENTED);
      }
    });
  }
  onMessage(type, callback) {
    return this.onMessageHandlers.on(this.getMessageHandlerKey(type), callback);
  }
  ping(callback) {
    if (!this.connection?.isOpen) {
      return;
    }
    __privateSet(this, _lastPingTime, now());
    __privateSet(this, _pingCallback, callback);
    this.packr.buffer[0] = Protocol.PING;
    this.connection.send(this.packr.buffer.subarray(0, 1));
  }
  send(messageType, payload) {
    const it = { offset: 1 };
    this.packr.buffer[0] = Protocol.ROOM_DATA;
    if (typeof messageType === "string") {
      encode.string(this.packr.buffer, messageType, it);
    } else {
      encode.number(this.packr.buffer, messageType, it);
    }
    this.packr.position = 0;
    const data = payload !== void 0 ? this.packr.pack(payload, 2048 + it.offset) : this.packr.buffer.subarray(0, it.offset);
    if (!this.connection.isOpen) {
      enqueueMessage(this, new Uint8Array(data));
    } else {
      this.connection.send(data);
    }
  }
  sendUnreliable(type, message) {
    if (!this.connection.isOpen) {
      return;
    }
    const it = { offset: 1 };
    this.packr.buffer[0] = Protocol.ROOM_DATA;
    if (typeof type === "string") {
      encode.string(this.packr.buffer, type, it);
    } else {
      encode.number(this.packr.buffer, type, it);
    }
    this.packr.position = 0;
    const data = message !== void 0 ? this.packr.pack(message, 2048 + it.offset) : this.packr.buffer.subarray(0, it.offset);
    this.connection.sendUnreliable(data);
  }
  sendBytes(type, bytes) {
    const it = { offset: 1 };
    this.packr.buffer[0] = Protocol.ROOM_DATA_BYTES;
    if (typeof type === "string") {
      encode.string(this.packr.buffer, type, it);
    } else {
      encode.number(this.packr.buffer, type, it);
    }
    if (bytes.byteLength + it.offset > this.packr.buffer.byteLength) {
      const newBuffer = new Uint8Array(it.offset + bytes.byteLength);
      newBuffer.set(this.packr.buffer);
      this.packr.useBuffer(newBuffer);
    }
    this.packr.buffer.set(bytes, it.offset);
    if (!this.connection.isOpen) {
      enqueueMessage(this, this.packr.buffer.subarray(0, it.offset + bytes.byteLength));
    } else {
      this.connection.send(this.packr.buffer.subarray(0, it.offset + bytes.byteLength));
    }
  }
  get state() {
    return this.serializer.getState();
  }
  removeAllListeners() {
    this.onJoin.clear();
    this.onStateChange.clear();
    this.onError.clear();
    this.onLeave.clear();
    this.onReconnect.clear();
    this.onDrop.clear();
    this.onMessageHandlers.events = {};
    if (this.serializer instanceof SchemaSerializer) {
      this.serializer.decoder.root.callbacks = {};
    }
  }
  onMessageCallback(event) {
    var _a6;
    const buffer = new Uint8Array(event.data);
    const it = { offset: 1 };
    const code = buffer[0];
    if (code === Protocol.JOIN_ROOM) {
      const reconnectionToken = decode.utf8Read(buffer, it, buffer[it.offset++]);
      this.serializerId = decode.utf8Read(buffer, it, buffer[it.offset++]);
      if (!this.serializer) {
        const serializer = getSerializer(this.serializerId);
        this.serializer = new serializer();
      }
      if (buffer.byteLength > it.offset && this.serializer.handshake) {
        this.serializer.handshake(buffer, it);
      }
      if (this.joinedAtTime === 0) {
        this.joinedAtTime = Date.now();
        this.onJoin.invoke();
      } else {
        console.info(`[Colyseus reconnection]: ${String.fromCodePoint(9989)} reconnection successful!`);
        this.reconnection.isReconnecting = false;
        this.onReconnect.invoke();
      }
      this.reconnectionToken = `${this.roomId}:${reconnectionToken}`;
      this.packr.buffer[0] = Protocol.JOIN_ROOM;
      this.connection.send(this.packr.buffer.subarray(0, 1));
      if (this.reconnection.enqueuedMessages.length > 0) {
        for (const message of this.reconnection.enqueuedMessages) {
          this.connection.send(message.data);
        }
        this.reconnection.enqueuedMessages = [];
      }
    } else if (code === Protocol.ERROR) {
      const code2 = decode.number(buffer, it);
      const message = decode.string(buffer, it);
      this.onError.invoke(code2, message);
    } else if (code === Protocol.LEAVE_ROOM) {
      this.leave();
    } else if (code === Protocol.ROOM_STATE) {
      this.serializer.setState(buffer, it);
      this.onStateChange.invoke(this.serializer.getState());
    } else if (code === Protocol.ROOM_STATE_PATCH) {
      this.serializer.patch(buffer, it);
      this.onStateChange.invoke(this.serializer.getState());
    } else if (code === Protocol.ROOM_DATA) {
      const type = decode.stringCheck(buffer, it) ? decode.string(buffer, it) : decode.number(buffer, it);
      const message = buffer.byteLength > it.offset ? unpack(buffer, { start: it.offset }) : void 0;
      this.dispatchMessage(type, message);
    } else if (code === Protocol.ROOM_DATA_BYTES) {
      const type = decode.stringCheck(buffer, it) ? decode.string(buffer, it) : decode.number(buffer, it);
      this.dispatchMessage(type, buffer.subarray(it.offset));
    } else if (code === Protocol.PING) {
      (_a6 = __privateGet(this, _pingCallback)) == null ? void 0 : _a6.call(this, Math.round(now() - __privateGet(this, _lastPingTime)));
      __privateSet(this, _pingCallback, void 0);
    }
  }
  dispatchMessage(type, message) {
    const messageType = this.getMessageHandlerKey(type);
    if (this.onMessageHandlers.events[messageType]) {
      this.onMessageHandlers.emit(messageType, message);
    } else if (this.onMessageHandlers.events["*"]) {
      this.onMessageHandlers.emit("*", type, message);
    } else if (!messageType.startsWith("__")) {
      console.warn?.(`@colyseus/sdk: onMessage() not registered for type '${type}'.`);
    }
  }
  destroy() {
    if (this.serializer) {
      this.serializer.teardown();
    }
  }
  getMessageHandlerKey(type) {
    switch (typeof type) {
      // string
      case "string":
        return type;
      // number
      case "number":
        return `i${type}`;
      default:
        throw new Error("invalid message type.");
    }
  }
  handleReconnection() {
    if (Date.now() - this.joinedAtTime < this.reconnection.minUptime) {
      console.info(`[Colyseus reconnection]: ${String.fromCodePoint(10060)} Room has not been up for long enough for automatic reconnection. (min uptime: ${this.reconnection.minUptime}ms)`);
      this.onLeave.invoke(CloseCode.ABNORMAL_CLOSURE, "Room uptime too short for reconnection.");
      return;
    }
    if (!this.reconnection.isReconnecting) {
      this.reconnection.retryCount = 0;
      this.reconnection.isReconnecting = true;
    }
    this.retryReconnection();
  }
  retryReconnection() {
    if (this.reconnection.retryCount >= this.reconnection.maxRetries) {
      console.info(`[Colyseus reconnection]: ${String.fromCodePoint(10060)} \u274C Reconnection failed after ${this.reconnection.maxRetries} attempts.`);
      this.reconnection.isReconnecting = false;
      this.onLeave.invoke(CloseCode.FAILED_TO_RECONNECT, "No more retries. Reconnection failed.");
      return;
    }
    this.reconnection.retryCount++;
    const delay = Math.min(this.reconnection.maxDelay, Math.max(this.reconnection.minDelay, this.reconnection.backoff(this.reconnection.retryCount, this.reconnection.delay)));
    console.info(`[Colyseus reconnection]: ${String.fromCodePoint(9203)} will retry in ${(delay / 1e3).toFixed(1)} seconds...`);
    setTimeout(() => {
      try {
        console.info(`[Colyseus reconnection]: ${String.fromCodePoint(128260)} Re-establishing sessionId '${this.sessionId}' with roomId '${this.roomId}'... (attempt ${this.reconnection.retryCount} of ${this.reconnection.maxRetries})`);
        this.connection.reconnect({
          reconnectionToken: this.reconnectionToken.split(":")[1],
          skipHandshake: true
          // we already applied the handshake on first join
        });
      } catch (e) {
        this.retryReconnection();
      }
    }, delay);
  }
};
_lastPingTime = new WeakMap();
_pingCallback = new WeakMap();
var exponentialBackoff = (attempt, delay) => {
  return Math.floor(Math.pow(2, attempt) * delay);
};
function enqueueMessage(room2, message) {
  room2.reconnection.enqueuedMessages.push({ data: message });
  if (room2.reconnection.enqueuedMessages.length > room2.reconnection.maxEnqueuedMessages) {
    room2.reconnection.enqueuedMessages.shift();
  }
}

// node_modules/@colyseus/sdk/build/HTTP.mjs
function isJSONSerializable(value) {
  if (value === void 0) {
    return false;
  }
  const t = typeof value;
  if (t === "string" || t === "number" || t === "boolean" || t === null) {
    return true;
  }
  if (t !== "object") {
    return false;
  }
  if (Array.isArray(value)) {
    return true;
  }
  if (value.buffer) {
    return false;
  }
  return value.constructor && value.constructor.name === "Object" || typeof value.toJSON === "function";
}
function getURLWithQueryParams(url, option) {
  const { params, query } = option || {};
  const [urlPath, urlQuery] = url.split("?");
  let path = urlPath;
  if (params) {
    if (Array.isArray(params)) {
      const paramPaths = path.split("/").filter((p) => p.startsWith(":"));
      for (const [index, key] of paramPaths.entries()) {
        const value = params[index];
        path = path.replace(key, value);
      }
    } else {
      for (const [key, value] of Object.entries(params)) {
        path = path.replace(`:${key}`, String(value));
      }
    }
  }
  const queryParams = new URLSearchParams(urlQuery);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value == null)
        continue;
      queryParams.set(key, String(value));
    }
  }
  let queryParamString = queryParams.toString();
  queryParamString = queryParamString.length > 0 ? `?${queryParamString}`.replace(/\+/g, "%20") : "";
  return `${path}${queryParamString}`;
}
var HTTP = class {
  constructor(sdk, baseOptions) {
    __publicField(this, "authToken");
    __publicField(this, "options");
    __publicField(this, "sdk");
    // alias "del()" to "delete()"
    __publicField(this, "del", this.delete);
    this.sdk = sdk;
    this.options = baseOptions;
  }
  async request(method, path, options) {
    return this.executeRequest(method, path, options);
  }
  get(path, options) {
    return this.request("GET", path, options);
  }
  post(path, options) {
    return this.request("POST", path, options);
  }
  delete(path, options) {
    return this.request("DELETE", path, options);
  }
  patch(path, options) {
    return this.request("PATCH", path, options);
  }
  put(path, options) {
    return this.request("PUT", path, options);
  }
  async executeRequest(method, path, requestOptions) {
    let body = this.options.body ? { ...this.options.body, ...requestOptions?.body || {} } : requestOptions?.body;
    const query = this.options.query ? { ...this.options.query, ...requestOptions?.query || {} } : requestOptions?.query;
    const params = this.options.params ? { ...this.options.params, ...requestOptions?.params || {} } : requestOptions?.params;
    const headers = new Headers(this.options.headers ? { ...this.options.headers, ...requestOptions?.headers || {} } : requestOptions?.headers);
    if (this.authToken && !headers.has("authorization")) {
      headers.set("authorization", `Bearer ${this.authToken}`);
    }
    if (isJSONSerializable(body) && typeof body === "object" && body !== null) {
      if (!headers.has("content-type")) {
        headers.set("content-type", "application/json");
      }
      for (const [key, value] of Object.entries(body)) {
        if (value instanceof Date) {
          body[key] = value.toISOString();
        }
      }
      body = JSON.stringify(body);
    }
    const mergedOptions = {
      credentials: requestOptions?.credentials || "include",
      ...this.options,
      ...requestOptions,
      query,
      params,
      headers,
      body,
      method
    };
    const url = getURLWithQueryParams(this.sdk["getHttpEndpoint"](path.toString()), mergedOptions);
    let raw;
    try {
      raw = await fetch(url, mergedOptions);
    } catch (err) {
      if (err.name === "AbortError") {
        throw err;
      }
      const networkError = new ServerError(err.cause?.code || err.code, err.message);
      networkError.response = raw;
      networkError.cause = err.cause;
      throw networkError;
    }
    const contentType = raw.headers.get("content-type");
    let data;
    if (contentType?.indexOf("json")) {
      data = await raw.json();
    } else if (contentType?.indexOf("text")) {
      data = await raw.text();
    } else {
      data = await raw.blob();
    }
    if (!raw.ok) {
      throw new ServerError(raw.status, data.message ?? data.error ?? raw.statusText, {
        headers: raw.headers,
        status: raw.status,
        response: raw,
        data
      });
    }
    return {
      raw,
      data,
      headers: raw.headers,
      status: raw.status,
      statusText: raw.statusText
    };
  }
};

// node_modules/@colyseus/sdk/build/Storage.mjs
var storage;
function getStorage() {
  if (!storage) {
    try {
      storage = typeof cc !== "undefined" && cc.sys && cc.sys.localStorage ? cc.sys.localStorage : window.localStorage;
    } catch (e) {
    }
  }
  if (!storage && typeof globalThis.indexedDB !== "undefined") {
    storage = new IndexedDBStorage();
  }
  if (!storage) {
    storage = {
      cache: {},
      setItem: function(key, value) {
        this.cache[key] = value;
      },
      getItem: function(key) {
        this.cache[key];
      },
      removeItem: function(key) {
        delete this.cache[key];
      }
    };
  }
  return storage;
}
function setItem(key, value) {
  getStorage().setItem(key, value);
}
function removeItem(key) {
  getStorage().removeItem(key);
}
function getItem(key, callback) {
  const value = getStorage().getItem(key);
  if (typeof Promise === "undefined" || // old browsers
  !(value instanceof Promise)) {
    callback(value);
  } else {
    value.then((id) => callback(id));
  }
}
var IndexedDBStorage = class {
  constructor() {
    __publicField(this, "dbPromise", new Promise((resolve) => {
      const request = indexedDB.open("_colyseus_storage", 1);
      request.onupgradeneeded = () => request.result.createObjectStore("store");
      request.onsuccess = () => resolve(request.result);
    }));
  }
  async tx(mode, fn) {
    const db = await this.dbPromise;
    const store = db.transaction("store", mode).objectStore("store");
    return fn(store);
  }
  setItem(key, value) {
    return this.tx("readwrite", (store) => store.put(value, key)).then();
  }
  async getItem(key) {
    const request = await this.tx("readonly", (store) => store.get(key));
    return new Promise((resolve) => {
      request.onsuccess = () => resolve(request.result);
    });
  }
  removeItem(key) {
    return this.tx("readwrite", (store) => store.delete(key)).then();
  }
};

// node_modules/@colyseus/sdk/build/Auth.mjs
var __initialized, __signInWindow, __events;
var Auth = class {
  constructor(http) {
    __publicField(this, "settings", {
      path: "/auth",
      key: "colyseus-auth-token"
    });
    __privateAdd(this, __initialized, false);
    __privateAdd(this, __signInWindow, null);
    __privateAdd(this, __events, createNanoEvents());
    __publicField(this, "http");
    this.http = http;
    getItem(this.settings.key, (token) => this.token = token);
  }
  set token(token) {
    this.http.authToken = token;
  }
  get token() {
    return this.http.authToken;
  }
  onChange(callback) {
    const unbindChange = __privateGet(this, __events).on("change", callback);
    if (!__privateGet(this, __initialized)) {
      this.getUserData().then((userData) => {
        this.emitChange({ ...userData, token: this.token });
      }).catch((e) => {
        this.emitChange({ user: null, token: void 0 });
      });
    }
    __privateSet(this, __initialized, true);
    return unbindChange;
  }
  async getUserData() {
    if (this.token) {
      return (await this.http.get(`${this.settings.path}/userdata`)).data;
    } else {
      throw new Error("missing auth.token");
    }
  }
  async registerWithEmailAndPassword(email, password, options) {
    const data = (await this.http.post(`${this.settings.path}/register`, {
      body: { email, password, options }
    })).data;
    this.emitChange(data);
    return data;
  }
  async signInWithEmailAndPassword(email, password) {
    const data = (await this.http.post(`${this.settings.path}/login`, {
      body: { email, password }
    })).data;
    this.emitChange(data);
    return data;
  }
  async signInAnonymously(options) {
    const data = (await this.http.post(`${this.settings.path}/anonymous`, {
      body: { options }
    })).data;
    this.emitChange(data);
    return data;
  }
  async sendPasswordResetEmail(email) {
    return (await this.http.post(`${this.settings.path}/forgot-password`, {
      body: { email }
    })).data;
  }
  async signInWithProvider(providerName, settings = {}) {
    return new Promise((resolve, reject) => {
      const w = settings.width || 480;
      const h = settings.height || 768;
      const upgradingToken = this.token ? `?token=${this.token}` : "";
      const title = `Login with ${providerName[0].toUpperCase() + providerName.substring(1)}`;
      const url = this.http["sdk"]["getHttpEndpoint"](`${settings.prefix || `${this.settings.path}/provider`}/${providerName}${upgradingToken}`);
      const left = screen.width / 2 - w / 2;
      const top = screen.height / 2 - h / 2;
      __privateSet(this, __signInWindow, window.open(url, title, "toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=" + w + ", height=" + h + ", top=" + top + ", left=" + left));
      const onMessage = (event) => {
        if (event.data.user === void 0 && event.data.token === void 0) {
          return;
        }
        clearInterval(rejectionChecker);
        __privateGet(this, __signInWindow)?.close();
        __privateSet(this, __signInWindow, null);
        window.removeEventListener("message", onMessage);
        if (event.data.error !== void 0) {
          reject(event.data.error);
        } else {
          resolve(event.data);
          this.emitChange(event.data);
        }
      };
      const rejectionChecker = setInterval(() => {
        if (!__privateGet(this, __signInWindow) || __privateGet(this, __signInWindow).closed) {
          __privateSet(this, __signInWindow, null);
          reject("cancelled");
          window.removeEventListener("message", onMessage);
        }
      }, 200);
      window.addEventListener("message", onMessage);
    });
  }
  async signOut() {
    this.emitChange({ user: null, token: null });
  }
  emitChange(authData) {
    if (authData.token !== void 0) {
      this.token = authData.token;
      if (authData.token === null) {
        removeItem(this.settings.key);
      } else {
        setItem(this.settings.key, authData.token);
      }
    }
    __privateGet(this, __events).emit("change", authData);
  }
};
__initialized = new WeakMap();
__signInWindow = new WeakMap();
__events = new WeakMap();

// node_modules/@colyseus/sdk/build/3rd_party/discord.mjs
function discordURLBuilder(url) {
  const localHostname = window?.location?.hostname || "localhost";
  const remoteHostnameSplitted = url.hostname.split(".");
  const subdomain = !url.hostname.includes("trycloudflare.com") && // ignore cloudflared subdomains
  !url.hostname.includes("discordsays.com") && // ignore discordsays.com subdomains
  remoteHostnameSplitted.length > 2 ? `/${remoteHostnameSplitted[0]}` : "";
  return url.pathname.startsWith("/.proxy") ? `${url.protocol}//${localHostname}${subdomain}${url.pathname}${url.search}` : `${url.protocol}//${localHostname}/.proxy/colyseus${subdomain}${url.pathname}${url.search}`;
}

// node_modules/@colyseus/sdk/build/Client.mjs
var DEFAULT_ENDPOINT = typeof window !== "undefined" && typeof window?.location?.hostname !== "undefined" ? `${window.location.protocol.replace("http", "ws")}//${window.location.hostname}${window.location.port && `:${window.location.port}`}` : "ws://127.0.0.1:2567";
var _ColyseusSDK = class _ColyseusSDK {
  constructor(settings = DEFAULT_ENDPOINT, options) {
    /**
     * The HTTP client to make requests to the server.
     */
    __publicField(this, "http");
    /**
     * The authentication module to authenticate into requests and rooms.
     */
    __publicField(this, "auth");
    /**
     * The settings used to connect to the server.
     */
    __publicField(this, "settings");
    __publicField(this, "urlBuilder");
    if (typeof settings === "string") {
      const url = settings.startsWith("/") ? new URL(settings, DEFAULT_ENDPOINT) : new URL(settings);
      const secure = url.protocol === "https:" || url.protocol === "wss:";
      const port = Number(url.port || (secure ? 443 : 80));
      this.settings = {
        hostname: url.hostname,
        pathname: url.pathname,
        port,
        secure,
        searchParams: url.searchParams.toString() || void 0
      };
    } else {
      if (settings.port === void 0) {
        settings.port = settings.secure ? 443 : 80;
      }
      if (settings.pathname === void 0) {
        settings.pathname = "";
      }
      this.settings = settings;
    }
    if (this.settings.pathname.endsWith("/")) {
      this.settings.pathname = this.settings.pathname.slice(0, -1);
    }
    if (options?.protocol) {
      this.settings.protocol = options.protocol;
    }
    this.http = new HTTP(this, {
      headers: options?.headers || {}
    });
    this.auth = new Auth(this.http);
    this.urlBuilder = options?.urlBuilder;
    if (!this.urlBuilder && typeof window !== "undefined" && window?.location?.hostname?.includes("discordsays.com")) {
      this.urlBuilder = discordURLBuilder;
      console.log("Colyseus SDK: Discord Embedded SDK detected. Using custom URL builder.");
    }
  }
  /**
   * Select the endpoint with the lowest latency.
   * @param endpoints Array of endpoints to select from.
   * @param options Client options.
   * @param latencyOptions Latency measurement options (protocol, pingCount).
   * @returns The client with the lowest latency.
   */
  static async selectByLatency(endpoints, options, latencyOptions = {}) {
    const clients = endpoints.map((endpoint) => new _ColyseusSDK(endpoint, options));
    const latencies = (await Promise.allSettled(clients.map((client2, index) => client2.getLatency(latencyOptions).then((latency) => {
      const settings = clients[index].settings;
      console.log(`\u{1F6DC} Endpoint Latency: ${latency}ms - ${settings.hostname}:${settings.port}${settings.pathname}`);
      return [index, latency];
    })))).filter((result) => result.status === "fulfilled").map((result) => result.value);
    if (latencies.length === 0) {
      throw new Error("All endpoints failed to respond");
    }
    return clients[latencies.sort((a, b) => a[1] - b[1])[0][0]];
  }
  // Implementation
  async joinOrCreate(roomName, options = {}, rootSchema) {
    return await this.createMatchMakeRequest("joinOrCreate", roomName, options, rootSchema);
  }
  // Implementation
  async create(roomName, options = {}, rootSchema) {
    return await this.createMatchMakeRequest("create", roomName, options, rootSchema);
  }
  // Implementation
  async join(roomName, options = {}, rootSchema) {
    return await this.createMatchMakeRequest("join", roomName, options, rootSchema);
  }
  // Implementation
  async joinById(roomId, options = {}, rootSchema) {
    return await this.createMatchMakeRequest("joinById", roomId, options, rootSchema);
  }
  // Implementation
  async reconnect(reconnectionToken, rootSchema) {
    if (typeof reconnectionToken === "string" && typeof rootSchema === "string") {
      throw new Error("DEPRECATED: .reconnect() now only accepts 'reconnectionToken' as argument.\nYou can get this token from previously connected `room.reconnectionToken`");
    }
    const [roomId, token] = reconnectionToken.split(":");
    if (!roomId || !token) {
      throw new Error("Invalid reconnection token format.\nThe format should be roomId:reconnectionToken");
    }
    return await this.createMatchMakeRequest("reconnect", roomId, { reconnectionToken: token }, rootSchema);
  }
  async consumeSeatReservation(response, rootSchema) {
    const room2 = this.createRoom(response.name, rootSchema);
    room2.roomId = response.roomId;
    room2.sessionId = response.sessionId;
    const options = { sessionId: room2.sessionId };
    if (response.reconnectionToken) {
      options.reconnectionToken = response.reconnectionToken;
    }
    room2.connect(this.buildEndpoint(response, options), response, this.http.options.headers);
    return new Promise((resolve, reject) => {
      const onError = (code, message) => reject(new ServerError(code, message));
      room2.onError.once(onError);
      room2["onJoin"].once(() => {
        room2.onError.remove(onError);
        resolve(room2);
      });
    });
  }
  /**
   * Create a new connection with the server, and measure the latency.
   * @param options Latency measurement options (protocol, pingCount).
   */
  getLatency(options = {}) {
    const protocol = options.protocol ?? "ws";
    const pingCount = options.pingCount ?? 1;
    return new Promise((resolve, reject) => {
      const conn = new Connection(protocol);
      const latencies = [];
      let pingStart = 0;
      conn.events.onopen = () => {
        pingStart = Date.now();
        conn.send(new Uint8Array([Protocol.PING]));
      };
      conn.events.onmessage = (_) => {
        latencies.push(Date.now() - pingStart);
        if (latencies.length < pingCount) {
          pingStart = Date.now();
          conn.send(new Uint8Array([Protocol.PING]));
        } else {
          conn.close();
          const average = latencies.reduce((sum, l) => sum + l, 0) / latencies.length;
          resolve(average);
        }
      };
      conn.events.onerror = (event) => {
        reject(new ServerError(CloseCode.ABNORMAL_CLOSURE, `Failed to get latency: ${event.message}`));
      };
      conn.connect(this.getHttpEndpoint());
    });
  }
  async createMatchMakeRequest(method, roomName, options = {}, rootSchema) {
    try {
      if (!roomName) {
        throw new Error("Must provide a room name");
      }
      const httpResponse = await this.http.post(`/matchmake/${method}/${roomName}`, {
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json"
        },
        body: options
      });
      const response = httpResponse.data;
      if (method === "reconnect") {
        response.reconnectionToken = options.reconnectionToken;
      }
      return await this.consumeSeatReservation(response, rootSchema);
    } catch (error) {
      if (error instanceof ServerError) {
        throw new MatchMakeError(error.message, error.code);
      }
      throw error;
    }
  }
  createRoom(roomName, rootSchema) {
    return new Room(roomName, rootSchema);
  }
  buildEndpoint(seatReservation, options = {}) {
    let protocol = this.settings.protocol || "ws";
    let searchParams = this.settings.searchParams || "";
    if (this.http.authToken) {
      options["_authToken"] = this.http.authToken;
    }
    for (const name in options) {
      if (!options.hasOwnProperty(name)) {
        continue;
      }
      searchParams += (searchParams ? "&" : "") + `${name}=${options[name]}`;
    }
    if (protocol === "h3") {
      protocol = "http";
    }
    let endpoint = this.settings.secure ? `${protocol}s://` : `${protocol}://`;
    if (seatReservation.publicAddress) {
      endpoint += `${seatReservation.publicAddress}`;
    } else {
      endpoint += `${this.settings.hostname}${this.getEndpointPort()}${this.settings.pathname}`;
    }
    const endpointURL = `${endpoint}/${seatReservation.processId}/${seatReservation.roomId}?${searchParams}`;
    return this.urlBuilder ? this.urlBuilder(new URL(endpointURL)) : endpointURL;
  }
  getHttpEndpoint(segments = "") {
    const path = segments.startsWith("/") ? segments : `/${segments}`;
    let endpointURL = `${this.settings.secure ? "https" : "http"}://${this.settings.hostname}${this.getEndpointPort()}${this.settings.pathname}${path}`;
    if (this.settings.searchParams) {
      endpointURL += `?${this.settings.searchParams}`;
    }
    return this.urlBuilder ? this.urlBuilder(new URL(endpointURL)) : endpointURL;
  }
  getEndpointPort() {
    return this.settings.port !== 80 && this.settings.port !== 443 ? `:${this.settings.port}` : "";
  }
};
__publicField(_ColyseusSDK, "VERSION", "0.17");
var ColyseusSDK = _ColyseusSDK;
var Client = ColyseusSDK;

// node_modules/@colyseus/sdk/build/serializer/NoneSerializer.mjs
var NoneSerializer = class {
  setState(rawState) {
  }
  getState() {
    return null;
  }
  patch(patches) {
  }
  teardown() {
  }
  handshake(bytes) {
  }
};

// node_modules/@colyseus/sdk/build/index.mjs
registerSerializer("schema", SchemaSerializer);
registerSerializer("none", NoneSerializer);

// src/network/Network.ts
var SERVER_URL = "ws://localhost:2567";
var client;
var room;
async function connect() {
  client = new Client(SERVER_URL);
  room = await client.joinOrCreate("my_room");
  console.log("Connected to room", room.roomId);
  console.log("Session ID:", room.sessionId);
  room.onStateChange((state) => {
    console.log("Room state:", JSON.stringify(state));
  });
  room.onLeave((code) => {
    console.log("Left room. Code:", code);
  });
  room.onError((code, message) => {
    console.error("Room error:", code, message);
  });
  return room;
}

// src/scenes/GameScene.ts
var GameScene = class extends phaser_default.Scene {
  constructor() {
    super("GameScene");
    this.dummies = [];
  }
  init(data) {
    this.classData = data?.classData ?? DEFAULT_CLASS;
  }
  create() {
    const worldW = MAP_W * TILE_SIZE;
    const worldH = MAP_H * TILE_SIZE;
    this.drawMap();
    this.drawBuildingLabels();
    const spawnX = 30 * TILE_SIZE + TILE_SIZE / 2;
    const spawnY = 36 * TILE_SIZE + TILE_SIZE / 2;
    this.player = new Player(this, spawnX, spawnY, this.classData);
    const dummySpots = [
      [44, 15],
      [91, 35],
      [30, 50],
      [75, 52],
      [40, 58],
      [55, 77]
    ];
    this.dummies = [];
    for (const [tx, ty] of dummySpots) {
      if (isWalkable(tx, ty)) {
        this.dummies.push(
          new Dummy(this, tx * TILE_SIZE + TILE_SIZE / 2, ty * TILE_SIZE + TILE_SIZE / 2)
        );
      }
    }
    this.cameras.main.setBounds(0, 0, worldW, worldH);
    this.cameras.main.startFollow(this.player.sprite, true, 0.1, 0.1);
    this.cameras.main.setBackgroundColor("#1a1a2e");
    const kb = this.input.keyboard;
    this.cursors = {
      up: kb.addKey(phaser_default.Input.Keyboard.KeyCodes.W),
      down: kb.addKey(phaser_default.Input.Keyboard.KeyCodes.S),
      left: kb.addKey(phaser_default.Input.Keyboard.KeyCodes.A),
      right: kb.addKey(phaser_default.Input.Keyboard.KeyCodes.D)
    };
    this.spaceKey = kb.addKey(phaser_default.Input.Keyboard.KeyCodes.SPACE);
    this.attackKey = kb.addKey(phaser_default.Input.Keyboard.KeyCodes.E);
    this.scene.launch("HUDScene", {
      classData: this.classData,
      gameScene: this
    });
    this.events.emit("playerHpChanged", this.player.hp, this.player.maxHp);
    connect().then((room2) => {
      this.connectedText = this.add.text(this.scale.width / 2, 40, "Player connected", {
        fontFamily: "Courier New, monospace",
        fontSize: "16px",
        color: "#00ff00",
        stroke: "#000000",
        strokeThickness: 3
      }).setOrigin(0.5).setScrollFactor(0).setDepth(100);
      this.time.delayedCall(3e3, () => {
        this.tweens.add({
          targets: this.connectedText,
          alpha: 0,
          duration: 500,
          onComplete: () => this.connectedText?.destroy()
        });
      });
    }).catch((err) => {
      console.error("Failed to connect:", err);
      this.add.text(this.scale.width / 2, 40, "Connection failed", {
        fontFamily: "Courier New, monospace",
        fontSize: "16px",
        color: "#ff0000",
        stroke: "#000000",
        strokeThickness: 3
      }).setOrigin(0.5).setScrollFactor(0).setDepth(100);
    });
  }
  drawMap() {
    const g = this.add.graphics();
    const tileColors = {
      [TILE.GRASS]: 3833156,
      [TILE.PATH]: 12759680,
      [TILE.BUILDING]: 5592405,
      [TILE.FIELD]: 5025616
    };
    for (let y = 0; y < MAP_H; y++) {
      for (let x = 0; x < MAP_W; x++) {
        const tile = MAP_DATA[y][x];
        let color = tileColors[tile] ?? 3833156;
        if (tile === TILE.BUILDING) {
          for (const b of BUILDINGS) {
            if (x >= b.x && x < b.x + b.w && y >= b.y && y < b.y + b.h) {
              color = b.color;
              break;
            }
          }
        }
        g.fillStyle(color, 1);
        g.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
      }
    }
    g.lineStyle(1, 0, 0.06);
    for (let y = 0; y <= MAP_H; y++) {
      g.lineBetween(0, y * TILE_SIZE, MAP_W * TILE_SIZE, y * TILE_SIZE);
    }
    for (let x = 0; x <= MAP_W; x++) {
      g.lineBetween(x * TILE_SIZE, 0, x * TILE_SIZE, MAP_H * TILE_SIZE);
    }
    g.setDepth(0);
  }
  drawBuildingLabels() {
    for (const b of BUILDINGS) {
      const cx = (b.x + b.w / 2) * TILE_SIZE;
      const cy = (b.y + b.h / 2) * TILE_SIZE;
      this.add.text(cx, cy, b.name, {
        fontFamily: "Courier New, monospace",
        fontSize: "14px",
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 3,
        fontStyle: "bold"
      }).setOrigin(0.5).setDepth(1);
    }
  }
  update(time, delta) {
    this.player.update(time, delta, this.cursors);
    if (phaser_default.Input.Keyboard.JustDown(this.spaceKey)) {
      this.player.dash(time);
    }
    if (phaser_default.Input.Keyboard.JustDown(this.attackKey)) {
      this.player.tryAttack(time, this.dummies);
    }
  }
};

// src/scenes/HUDScene.ts
var HUDScene = class extends phaser_default.Scene {
  constructor() {
    super("HUDScene");
    this.hpBarW = 300;
    this.hpBarH = 24;
    this.hpBarX = 0;
    // set in create
    this.hpBarY = 38;
  }
  init(data) {
    this.classData = data.classData;
    this.gameScene = data.gameScene;
  }
  create() {
    const { width, height } = this.scale;
    this.hpBarX = Math.floor((width - this.hpBarW) / 2);
    this.add.text(width / 2, 14, "CAMPUS CLASH", {
      fontFamily: "Courier New, monospace",
      fontSize: "24px",
      color: "#e63946",
      fontStyle: "bold",
      stroke: "#000000",
      strokeThickness: 4
    }).setOrigin(0.5);
    const hpBg = this.add.graphics();
    hpBg.fillStyle(3355443, 1);
    hpBg.fillRoundedRect(this.hpBarX, this.hpBarY, this.hpBarW, this.hpBarH, 4);
    hpBg.lineStyle(2, 0, 1);
    hpBg.strokeRoundedRect(this.hpBarX, this.hpBarY, this.hpBarW, this.hpBarH, 4);
    this.hpBarFill = this.add.graphics();
    this.drawHpBar(1);
    this.hpText = this.add.text(
      width / 2,
      this.hpBarY + this.hpBarH / 2,
      `${this.classData.maxHp} / ${this.classData.maxHp}`,
      {
        fontFamily: "Courier New, monospace",
        fontSize: "14px",
        color: "#ffffff",
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: 3
      }
    ).setOrigin(0.5);
    this.add.text(width / 2, this.hpBarY + this.hpBarH + 8, `${this.classData.name} - ${this.classData.weaponName}`, {
      fontFamily: "Courier New, monospace",
      fontSize: "14px",
      color: "#f1faee",
      stroke: "#000000",
      strokeThickness: 2
    }).setOrigin(0.5);
    this.dashText = this.add.text(width / 2, this.hpBarY + this.hpBarH + 28, "DASH: READY", {
      fontFamily: "Courier New, monospace",
      fontSize: "13px",
      color: "#2a9d8f",
      stroke: "#000000",
      strokeThickness: 2
    }).setOrigin(0.5);
    this.add.text(width / 2, height - 24, "WASD: Move  |  E: Attack  |  SPACE: Dash", {
      fontFamily: "Courier New, monospace",
      fontSize: "14px",
      color: "#a8dadc",
      stroke: "#000000",
      strokeThickness: 3
    }).setOrigin(0.5);
    this.gameScene.events.on("playerHpChanged", (hp, maxHp) => {
      this.drawHpBar(hp / maxHp);
      this.hpText.setText(`${hp} / ${maxHp}`);
    });
  }
  drawHpBar(ratio) {
    this.hpBarFill.clear();
    const color = ratio > 0.5 ? 52292 : ratio > 0.25 ? 13421568 : 13369344;
    this.hpBarFill.fillStyle(color, 1);
    this.hpBarFill.fillRoundedRect(
      this.hpBarX,
      this.hpBarY,
      Math.floor(this.hpBarW * ratio),
      this.hpBarH,
      4
    );
  }
  update() {
    if (!this.gameScene.player) return;
    const cd = this.gameScene.player.dashCooldown;
    if (cd > 0) {
      this.dashText.setText(`DASH: ${(cd / 1e3).toFixed(1)}s`);
      this.dashText.setColor("#cc0000");
    } else {
      this.dashText.setText("DASH: READY");
      this.dashText.setColor("#2a9d8f");
    }
  }
};

// src/main.ts
var config = {
  type: phaser_default.AUTO,
  title: "Campus Clash",
  parent: "game-container",
  width: 1280,
  height: 720,
  backgroundColor: "#1a1a2e",
  pixelArt: true,
  scene: [GameScene, HUDScene],
  scale: {
    mode: phaser_default.Scale.FIT,
    autoCenter: phaser_default.Scale.CENTER_BOTH
  }
};
new phaser_default.Game(config);
