import { useEffect, useMemo, useRef, useState } from "react";
import type { PuzzleCase } from "../data/cases";
import PuzzleBoard from "./PuzzleBoard";
import { isSolved, moveZeroByDirection, type Board } from "../utils/puzzle";
import {
  getLinearConflict,
  getManhattanPlusLinearConflict,
  getTotalManhattan,
} from "../utils/manhattan";

type SolverTabProps = {
  selectedCase: PuzzleCase;
};

type ViewMode = "normal" | "heatmap" | "correctness";

function normalizeMoves(input: string): string[] {
  return input
    .toUpperCase()
    .replace(/[^UDLR]/g, "")
    .split("");
}

function cloneBoard(board: Board): Board {
  return board.map((row) => [...row]);
}

type ReplayResult = {
  board: Board;
  appliedSteps: number;
  errorMessage: string;
  history: Board[];
};

function replayToStep(baseBoard: Board, moves: string[], targetStep: number): ReplayResult {
  let board = cloneBoard(baseBoard);
  const history: Board[] = [];
  const cappedTarget = Math.max(0, Math.min(targetStep, moves.length));

  for (let step = 0; step < cappedTarget; step++) {
    const dir = moves[step];
    const next = moveZeroByDirection(board, dir);

    if (next == null) {
      return {
        board,
        appliedSteps: step,
        errorMessage: `step ${step + 1}: move ${dir} is invalid`,
        history,
      };
    }

    history.push(cloneBoard(board));
    board = next;
  }

  return {
    board,
    appliedSteps: cappedTarget,
    errorMessage: "",
    history,
  };
}

export default function SolverTab({ selectedCase }: SolverTabProps) {
  const initialBoard = useMemo(
    () => selectedCase.board.map((row) => [...row]),
    [selectedCase],
  );

  const [baseBoard, setBaseBoard] = useState<Board>(initialBoard);
  const [board, setBoard] = useState<Board>(initialBoard);
  const [history, setHistory] = useState<Board[]>([]);
  const [moveInput, setMoveInput] = useState("");
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speedMs, setSpeedMs] = useState(300);
  const [viewMode, setViewMode] = useState<ViewMode>("normal");
  const [errorMessage, setErrorMessage] = useState("");

  const timerRef = useRef<number | null>(null);

  const moves = useMemo(() => normalizeMoves(moveInput), [moveInput]);
  const solved = isSolved(board);
  const totalManhattan = useMemo(() => getTotalManhattan(board), [board]);
  const linearConflict = useMemo(() => getLinearConflict(board), [board]);
  const mdPlusLc = useMemo(() => getManhattanPlusLinearConflict(board), [board]);

  useEffect(() => {
    setBaseBoard(initialBoard);
    setBoard(initialBoard);
    setHistory([]);
    setMoveInput("");
    setCurrentStep(0);
    setIsPlaying(false);
    setErrorMessage("");
    setViewMode("normal");
  }, [initialBoard]);

  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current != null) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    timerRef.current = window.setInterval(() => {
      stepForward();
    }, speedMs);

    return () => {
      if (timerRef.current != null) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isPlaying, speedMs, currentStep, moves, board]);

  function applyReplayResult(result: ReplayResult) {
    setBoard(result.board);
    setHistory(result.history);
    setCurrentStep(result.appliedSteps);
    setErrorMessage(result.errorMessage);

    if (result.errorMessage !== "") {
      setIsPlaying(false);
    }
  }

  function jumpToStep(step: number) {
    setIsPlaying(false);
    const result = replayToStep(baseBoard, moves, step);
    applyReplayResult(result);
  }

  function stepForward() {
    jumpToStep(currentStep + 1);
  }

  function handleReset() {
    setIsPlaying(false);
    setBoard(baseBoard);
    setHistory([]);
    setCurrentStep(0);
    setErrorMessage("");
  }

  function handleApplyOneStep() {
    stepForward();
  }

  function handleUndoOneStep() {
    jumpToStep(currentStep - 1);
  }

  function handleStart() {
    if (moves.length === 0) return;
    if (currentStep >= moves.length) return;
    if (errorMessage !== "") return;
    setErrorMessage("");
    setIsPlaying(true);
  }

  function handlePause() {
    setIsPlaying(false);
  }

  function handleSliderChange(step: number) {
    jumpToStep(step);
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "18px",
        alignItems: "center",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))",
          gap: "12px",
          width: "100%",
          maxWidth: "720px",
        }}
      >
        <InfoCard label="サイズ" value={selectedCase.label} />
        <InfoCard label="総手数" value={String(moves.length)} />
        <InfoCard label="現在手数" value={String(currentStep)} />
        <InfoCard label="状態" value={solved ? "完成" : isPlaying ? "再生中" : "停止中"} />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))",
          gap: "12px",
          width: "100%",
          maxWidth: "720px",
        }}
      >
        <InfoCard label="MD" value={String(totalManhattan)} />
        <InfoCard label="LC" value={String(linearConflict)} />
        <InfoCard label="MD + LC" value={String(mdPlusLc)} />
      </div>

      <div
        style={{
          width: "100%",
          maxWidth: "720px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        <label style={{ fontWeight: 700 }}>UDRL 入力（空きマス基準）</label>
        <textarea
          value={moveInput}
          onChange={(e) => {
            const nextInput = e.target.value;
            setMoveInput(nextInput);
            setIsPlaying(false);

            const nextMoves = normalizeMoves(nextInput);
            const result = replayToStep(baseBoard, nextMoves, 0);
            applyReplayResult(result);
          }}
          rows={6}
          placeholder="例: UDLR..."
          style={{
            width: "100%",
            resize: "vertical",
            borderRadius: "12px",
            border: "1px solid #cbd5e1",
            padding: "12px",
            fontFamily: "monospace",
            fontSize: "0.95rem",
          }}
        />
        <div style={{ color: "#475569", fontSize: "0.9rem" }}>
          空白や改行、UDRL以外の文字は無視されます。
        </div>
      </div>

      <div
        style={{
          width: "100%",
          maxWidth: "720px",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          padding: "12px 14px",
          borderRadius: "12px",
          background: "#f8fafc",
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "12px",
            flexWrap: "wrap",
            fontSize: "0.95rem",
            color: "#334155",
          }}
        >
          <span>ターン指定</span>
          <span>
            {currentStep} / {moves.length}
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={moves.length}
          step={1}
          value={currentStep}
          onChange={(e) => handleSliderChange(Number(e.target.value))}
          style={{ width: "100%" }}
        />
      </div>

      <div
        style={{
          width: "100%",
          maxWidth: "720px",
          display: "flex",
          flexWrap: "wrap",
          gap: "10px",
          justifyContent: "center",
        }}
      >
        <button onClick={handleStart} style={actionButtonStyle}>
          再生
        </button>
        <button onClick={handlePause} style={actionButtonStyleSecondary}>
          停止
        </button>
        <button onClick={handleReset} style={actionButtonStyleSecondary}>
          リセット
        </button>
        <button onClick={handleApplyOneStep} style={actionButtonStyleSecondary}>
          1手進む
        </button>
        <button onClick={handleUndoOneStep} style={actionButtonStyleSecondary}>
          1手戻る
        </button>
      </div>

      <div
        style={{
          width: "100%",
          maxWidth: "720px",
          display: "flex",
          flexWrap: "wrap",
          gap: "18px",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontWeight: 700,
          }}
        >
          再生速度
          <input
            type="range"
            min={50}
            max={1000}
            step={50}
            value={speedMs}
            onChange={(e) => setSpeedMs(Number(e.target.value))}
          />
          <span style={{ minWidth: "72px", textAlign: "right" }}>{speedMs} ms</span>
        </label>

        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontWeight: 700,
          }}
        >
          表示モード
          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value as ViewMode)}
            style={{
              borderRadius: "10px",
              border: "1px solid #cbd5e1",
              padding: "8px 10px",
              background: "#ffffff",
            }}
          >
            <option value="normal">通常</option>
            <option value="heatmap">マンハッタン距離</option>
            <option value="correctness">正位置ハイライト</option>
          </select>
        </label>
      </div>

      <div style={{ color: "#475569", fontSize: "0.95rem" }}>
        {currentStep < moves.length
          ? `next move: ${moves[currentStep]}`
          : "next move: -"}
      </div>

      {errorMessage && (
        <div
          style={{
            width: "100%",
            maxWidth: "720px",
            padding: "12px 16px",
            borderRadius: "12px",
            background: "#fee2e2",
            color: "#991b1b",
            fontWeight: 700,
          }}
        >
          {errorMessage}
        </div>
      )}

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

      <PuzzleBoard board={board} solved={solved} viewMode={viewMode} />
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

const actionButtonStyleSecondary: React.CSSProperties = {
  border: "none",
  borderRadius: "12px",
  padding: "10px 16px",
  background: "#e2e8f0",
  color: "#0f172a",
  fontWeight: 700,
  cursor: "pointer",
};
