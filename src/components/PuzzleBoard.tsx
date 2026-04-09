import type { Board } from "../utils/puzzle";
import {
  getManhattanDistance,
  getMaxManhattan,
  isCorrectTile,
} from "../utils/manhattan";

type ViewMode = "normal" | "heatmap" | "correctness";

type PuzzleBoardProps = {
  board: Board;
  onTileClick?: (row: number, col: number) => void;
  solved?: boolean;
  viewMode?: ViewMode;
};

function getCellSize(n: number): string {
  if (n <= 4) return "72px";
  if (n <= 5) return "60px";
  return "min(7.6vw, 40px)";
}

function getGapSize(n: number): string {
  if (n <= 5) return "6px";
  return "4px";
}

function getBoardPadding(n: number): string {
  if (n <= 5) return "12px";
  return "8px";
}

function getFontSize(n: number): string {
  if (n <= 4) return "1.35rem";
  if (n <= 5) return "1.1rem";
  return "0.82rem";
}

function getHeatColor(distance: number, maxDistance: number, isZero: boolean): string {
  if (isZero) {
    return "#cbd5e1";
  }
  if (maxDistance === 0) {
    return "#ffffff";
  }

  const t = distance / maxDistance;
  const alpha = 0.06 + 0.84 * Math.pow(t, 0.9);
  return `rgba(239, 68, 68, ${alpha})`;
}

function getCorrectnessStyle(
  value: number,
  row: number,
  col: number,
  n: number,
  isZero: boolean,
) {
  const correct = isCorrectTile(value, row, col, n);

  if (isZero) {
    return {
      background: correct ? "#bbf7d0" : "#cbd5e1",
      boxShadow: correct
        ? "0 0 0 2px rgba(34,197,94,0.35), inset 0 2px 6px rgba(0,0,0,0.08)"
        : "inset 0 2px 6px rgba(0,0,0,0.08)",
    };
  }

  if (correct) {
    return {
      background: "#dcfce7",
      boxShadow:
        "0 0 0 2px rgba(34,197,94,0.45), 0 0 18px rgba(34,197,94,0.45), 0 3px 10px rgba(0,0,0,0.10)",
    };
  }

  return {
    background: "#ffffff",
    boxShadow: "0 3px 10px rgba(0,0,0,0.10)",
  };
}

export default function PuzzleBoard({
  board,
  onTileClick,
  solved = false,
  viewMode = "normal",
}: PuzzleBoardProps) {
  const n = board.length;
  const cellSize = getCellSize(n);
  const gapSize = getGapSize(n);
  const boardPadding = getBoardPadding(n);
  const fontSize = getFontSize(n);
  const maxDistance = getMaxManhattan(board);

  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        overflowX: "hidden",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${n}, ${cellSize})`,
          gap: gapSize,
          padding: boardPadding,
          background: solved ? "#dcfce7" : "#e5e7eb",
          borderRadius: "16px",
          width: "fit-content",
          maxWidth: "100%",
          margin: "0 auto",
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
        }}
      >
        {board.map((row, r) =>
          row.map((value, c) => {
            const isZero = value === 0;
            const distance = getManhattanDistance(value, r, c, n);

            let background = "#ffffff";
            let boxShadow = isZero
              ? "inset 0 2px 6px rgba(0,0,0,0.08)"
              : "0 3px 10px rgba(0,0,0,0.10)";

            if (viewMode === "heatmap") {
              background = getHeatColor(distance, maxDistance, isZero);
            } else if (viewMode === "correctness") {
              const style = getCorrectnessStyle(value, r, c, n, isZero);
              background = style.background;
              boxShadow = style.boxShadow;
            } else {
              background = isZero
                ? solved
                  ? "#bbf7d0"
                  : "#cbd5e1"
                : solved
                  ? "#86efac"
                  : "#ffffff";
            }

            return (
              <button
                key={`${r}-${c}`}
                onClick={() => onTileClick?.(r, c)}
                disabled={isZero || onTileClick == null}
                style={{
                  width: cellSize,
                  height: cellSize,
                  border: "none",
                  borderRadius: n >= 10 ? "9px" : "12px",
                  fontSize,
                  fontWeight: 700,
                  cursor: onTileClick && !isZero ? "pointer" : "default",
                  background,
                  color: isZero ? "transparent" : "#0f172a",
                  boxShadow,
                  transition: "all 0.18s ease",
                  touchAction: "manipulation",
                  userSelect: "none",
                  padding: 0,
                }}
                title={
                  viewMode === "heatmap" && !isZero
                    ? `Manhattan distance: ${distance}`
                    : viewMode === "correctness"
                      ? isCorrectTile(value, r, c, n)
                        ? "Correct position"
                        : "Incorrect position"
                      : undefined
                }
              >
                {isZero ? "" : value}
              </button>
            );
          }),
        )}
      </div>
    </div>
  );
}
