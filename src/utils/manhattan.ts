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

export function isCorrectTile(value: number, row: number, col: number, n: number): boolean {
  if (value === 0) {
    return row === n - 1 && col === n - 1;
  }
  const goal = getGoalPosition(value, n);
  return goal.row === row && goal.col === col;
}

export function getTotalManhattan(board: Board): number {
  const n = board.length;
  let total = 0;
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      total += getManhattanDistance(board[r][c], r, c, n);
    }
  }
  return total;
}

function countRowLinearConflicts(board: Board): number {
  const n = board.length;
  let conflicts = 0;

  for (let r = 0; r < n; r++) {
    const rowTiles: { currentCol: number; goalCol: number }[] = [];

    for (let c = 0; c < n; c++) {
      const value = board[r][c];
      if (value === 0) continue;

      const goal = getGoalPosition(value, n);
      if (goal.row === r) {
        rowTiles.push({ currentCol: c, goalCol: goal.col });
      }
    }

    for (let i = 0; i < rowTiles.length; i++) {
      for (let j = i + 1; j < rowTiles.length; j++) {
        if (rowTiles[i].goalCol > rowTiles[j].goalCol) {
          conflicts++;
        }
      }
    }
  }

  return conflicts;
}

function countColLinearConflicts(board: Board): number {
  const n = board.length;
  let conflicts = 0;

  for (let c = 0; c < n; c++) {
    const colTiles: { currentRow: number; goalRow: number }[] = [];

    for (let r = 0; r < n; r++) {
      const value = board[r][c];
      if (value === 0) continue;

      const goal = getGoalPosition(value, n);
      if (goal.col === c) {
        colTiles.push({ currentRow: r, goalRow: goal.row });
      }
    }

    for (let i = 0; i < colTiles.length; i++) {
      for (let j = i + 1; j < colTiles.length; j++) {
        if (colTiles[i].goalRow > colTiles[j].goalRow) {
          conflicts++;
        }
      }
    }
  }

  return conflicts;
}

export function getLinearConflict(board: Board): number {
  const rowConflicts = countRowLinearConflicts(board);
  const colConflicts = countColLinearConflicts(board);
  return 2 * (rowConflicts + colConflicts);
}

export function getManhattanPlusLinearConflict(board: Board): number {
  return getTotalManhattan(board) + getLinearConflict(board);
}
