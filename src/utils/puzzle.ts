export type Board = number[][];
export type Position = { row: number; col: number };

export function cloneBoard(board: Board): Board {
  return board.map((row) => [...row]);
}

export function findZero(board: Board): Position {
  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[row].length; col++) {
      if (board[row][col] === 0) {
        return { row, col };
      }
    }
  }
  throw new Error("Zero tile not found");
}

export function isInside(board: Board, row: number, col: number): boolean {
  const n = board.length;
  return 0 <= row && row < n && 0 <= col && col < n;
}

export function isAdjacent(a: Position, b: Position): boolean {
  const dr = Math.abs(a.row - b.row);
  const dc = Math.abs(a.col - b.col);
  return dr + dc === 1;
}

export function canMoveTile(board: Board, row: number, col: number): boolean {
  const zero = findZero(board);
  return isAdjacent({ row, col }, zero);
}

export function moveTile(board: Board, row: number, col: number): Board | null {
  if (!canMoveTile(board, row, col)) {
    return null;
  }

  const next = cloneBoard(board);
  const zero = findZero(next);

  [next[row][col], next[zero.row][zero.col]] = [next[zero.row][zero.col], next[row][col]];
  return next;
}

// 開発タブ用: 空きマスが UDLR に動く
export function moveZeroByDirection(board: Board, dir: string): Board | null {
  const next = cloneBoard(board);
  const zero = findZero(next);

  let nr = zero.row;
  let nc = zero.col;

  if (dir === "U") nr--;
  else if (dir === "D") nr++;
  else if (dir === "L") nc--;
  else if (dir === "R") nc++;
  else return null;

  if (!isInside(next, nr, nc)) {
    return null;
  }

  [next[zero.row][zero.col], next[nr][nc]] = [next[nr][nc], next[zero.row][zero.col]];
  return next;
}

export function createSolvedBoard(n: number): Board {
  const board: Board = [];
  let value = 1;

  for (let row = 0; row < n; row++) {
    const currentRow: number[] = [];
    for (let col = 0; col < n; col++) {
      if (row === n - 1 && col === n - 1) {
        currentRow.push(0);
      } else {
        currentRow.push(value++);
      }
    }
    board.push(currentRow);
  }

  return board;
}

export function isSolved(board: Board): boolean {
  const solved = createSolvedBoard(board.length);
  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board.length; col++) {
      if (board[row][col] !== solved[row][col]) {
        return false;
      }
    }
  }
  return true;
}
