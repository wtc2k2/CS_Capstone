export const TILE = {
  GRASS: 0,
  PATH: 1,
  BUILDING: 2,
  FIELD: 3,
} as const;

export const TILE_SIZE = 16;
export const MAP_W = 150;
export const MAP_H = 105;

export interface Building {
  name: string;
  x: number;
  y: number;
  w: number;
  h: number;
  color: number;
}

// Layout matches the campus image:
//   Field (tall, left)  Stadium (small, right of Field)   Arena (large, upper-right)
//                          Craton (center)
//                 Robey (left-center)        Round Table (center-right)
//   Library (bot-left)  Academic (bot-center)  Main Hall (large, bot-right)  PAC (far right)
export const BUILDINGS: Building[] = [
  { name: 'Field',       x: 4,   y: 5,   w: 15, h: 38, color: 0x2d8a4e },
  { name: 'Stadium',     x: 26,  y: 8,   w: 7,  h: 13, color: 0x7a5c3a },
  { name: 'Arena',       x: 55,  y: 2,   w: 40, h: 22, color: 0x8b4513 },
  { name: 'Craton',      x: 38,  y: 30,  w: 13, h: 10, color: 0x556b2f },
  { name: 'Robey',       x: 26,  y: 43,  w: 8,  h: 14, color: 0x6b4226 },
  { name: 'Round Table', x: 60,  y: 47,  w: 10, h: 8,  color: 0x8b6914 },
  { name: 'Library',     x: 4,   y: 76,  w: 15, h: 12, color: 0x4a708b },
  { name: 'Academic',    x: 33,  y: 72,  w: 17, h: 12, color: 0x5f6b4e },
  { name: 'Main Hall',   x: 62,  y: 70,  w: 32, h: 24, color: 0x8b0000 },
  { name: 'PAC',         x: 100, y: 55,  w: 9,  h: 16, color: 0x4b0082 },
];

function hPath(
  grid: number[][],
  y: number,
  x1: number,
  x2: number,
  width = 3,
): void {
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

function vPath(
  grid: number[][],
  x: number,
  y1: number,
  y2: number,
  width = 3,
): void {
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

function generateMap(): number[][] {
  const grid: number[][] = [];
  for (let y = 0; y < MAP_H; y++) {
    grid[y] = [];
    for (let x = 0; x < MAP_W; x++) {
      grid[y][x] = TILE.GRASS;
    }
  }

  // Place buildings
  for (const b of BUILDINGS) {
    for (let dy = 0; dy < b.h; dy++) {
      for (let dx = 0; dx < b.w; dx++) {
        const tx = b.x + dx;
        const ty = b.y + dy;
        if (tx < MAP_W && ty < MAP_H) {
          grid[ty][tx] = b.name === 'Field' ? TILE.FIELD : TILE.BUILDING;
        }
      }
    }
  }

  // ── Paths (matching the campus image connections) ──

  // Stadium → east → Arena (top horizontal)
  hPath(grid, 14, 33, 55, 3);

  // Stadium → south → Craton (left vertical spine)
  vPath(grid, 29, 21, 30, 3);

  // Craton east side → east toward Arena's right edge
  hPath(grid, 34, 51, 90, 3);

  // Arena right side → south → Round Table area
  vPath(grid, 90, 24, 50, 3);

  // Left spine continues: below Craton → through Robey → down to Academic level
  vPath(grid, 29, 40, 72, 3);

  // Short connector: Robey right → Craton left
  hPath(grid, 43, 34, 38, 3);

  // Robey area → diagonal SE to Academic (zigzag: south then east)
  hPath(grid, 57, 31, 50, 3);
  vPath(grid, 50, 57, 72, 3);

  // Library → east to left spine
  hPath(grid, 80, 19, 29, 3);

  // Left spine → east to Academic
  hPath(grid, 72, 29, 33, 3);

  // Academic → east to Main Hall
  hPath(grid, 76, 50, 62, 3);

  // Round Table → south to Main Hall
  vPath(grid, 65, 55, 70, 3);

  // Round Table → east to PAC
  hPath(grid, 51, 70, 100, 3);

  // PAC → south to Main Hall horizontal
  vPath(grid, 104, 71, 80, 3);
  hPath(grid, 80, 94, 104, 3);

  // Main Hall south-east corner → PAC bottom
  hPath(grid, 85, 94, 109, 3);

  return grid;
}

export const MAP_DATA: number[][] = generateMap();

export function isWalkable(tileX: number, tileY: number): boolean {
  if (tileX < 0 || tileX >= MAP_W || tileY < 0 || tileY >= MAP_H) {
    return false;
  }
  const tile = MAP_DATA[tileY][tileX];
  return tile === TILE.GRASS || tile === TILE.PATH || tile === TILE.FIELD;
}
