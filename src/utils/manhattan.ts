import type { Board } from "./puzzle";

export function getGoalPosition(value: number, n: number): { row: number; col: number } {
  if (value === 0) {
    return { row: n - 1, col: n - 1 };
  }

  const idx = value - 1;
  return {
    row: Math.floor(idx / n),
    col: idx % n,
  };
}

export function getManhattanDistance(value: number, row: number, col: number, n: number): number {
  if (value === 0) return 0;
  const goal = getGoalPosition(value, n);
  return Math.abs(row - goal.row) + Math.abs(col - goal.col);
}

export function getManhattanMap(board: Board): number[][] {
  const n = board.length;
  return board.map((row, r) =>
    row.map((value, c) => getManhattanDistance(value, r, c, n)),
  );
}

export function getMaxManhattan(board: Board): number {
  const distMap = getManhattanMap(board);
  let maxValue = 0;
  for (const row of distMap) {
    for (const v of row) {
      maxValue = Math.max(maxValue, v);
    }
  }
  return maxValue;
}
