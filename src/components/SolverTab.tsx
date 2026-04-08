import type { PuzzleCase } from "../data/cases";

type SolverTabProps = {
  selectedCase: PuzzleCase;
};

export default function SolverTab({ selectedCase }: SolverTabProps) {
  return (
    <div
      style={{
        padding: "24px",
        borderRadius: "16px",
        background: "#f8fafc",
        textAlign: "center",
        color: "#334155",
      }}
    >
      <div style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "8px" }}>
        ソルバー開発タブ
      </div>
      <div>現在のケース: {selectedCase.label}</div>
      <div style={{ marginTop: "12px" }}>次で UDRL 再生機能を入れます。</div>
    </div>
  );
}
