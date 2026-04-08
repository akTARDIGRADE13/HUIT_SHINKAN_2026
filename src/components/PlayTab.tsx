import { useEffect, useMemo, useState } from "react";
import type { PuzzleCase } from "../data/cases";
import PuzzleBoard from "./PuzzleBoard";
import { isSolved, moveTile, type Board } from "../utils/puzzle";

type PlayTabProps = {
  selectedCase: PuzzleCase;
};

export default function PlayTab({ selectedCase }: PlayTabProps) {
  const initialBoard = useMemo(() => selectedCase.board.map((row) => [...row]), [selectedCase]);

  const [board, setBoard] = useState<Board>(initialBoard);
  const [history, setHistory] = useState<Board[]>([]);
  const [moveCount, setMoveCount] = useState(0);

  useEffect(() => {
    setBoard(initialBoard);
    setHistory([]);
    setMoveCount(0);
  }, [initialBoard]);

  const solved = isSolved(board);

  function handleTileClick(row: number, col: number) {
    const next = moveTile(board, row, col);
    if (next == null) return;

    setHistory((prev) => [...prev, board.map((r) => [...r])]);
    setBoard(next);
    setMoveCount((prev) => prev + 1);
  }

  function handleUndo() {
    if (history.length === 0) return;

    const prevBoard = history[history.length - 1];
    setHistory((prev) => prev.slice(0, -1));
    setBoard(prevBoard);
    setMoveCount((prev) => Math.max(0, prev - 1));
  }

  function handleReset() {
    setBoard(initialBoard);
    setHistory([]);
    setMoveCount(0);
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        alignItems: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: "12px",
          flexWrap: "wrap",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <InfoCard label="サイズ" value={selectedCase.label} />
        <InfoCard label="手数" value={String(moveCount)} />
        <InfoCard label="状態" value={solved ? "完成" : "プレイ中"} />
      </div>

      <div
        style={{
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        <button onClick={handleUndo} disabled={history.length === 0} style={actionButtonStyle}>
          一手戻す
        </button>
        <button onClick={handleReset} style={actionButtonStyle}>
          リセット
        </button>
      </div>

      {solved && (
        <div
          style={{
            padding: "10px 16px",
            borderRadius: "12px",
            background: "#dcfce7",
            color: "#166534",
            fontWeight: 700,
          }}
        >
          完成です！
        </div>
      )}

      <PuzzleBoard board={board} onTileClick={handleTileClick} solved={solved} />
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        minWidth: "110px",
        padding: "10px 14px",
        borderRadius: "12px",
        background: "#f8fafc",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: "0.8rem", color: "#475569" }}>{label}</div>
      <div style={{ fontSize: "1rem", fontWeight: 700, color: "#0f172a" }}>{value}</div>
    </div>
  );
}

const actionButtonStyle: React.CSSProperties = {
  border: "none",
  borderRadius: "12px",
  padding: "10px 16px",
  background: "#2563eb",
  color: "#ffffff",
  fontWeight: 700,
  cursor: "pointer",
};
