import { useMemo, useState } from "react";
import "./styles/app.css";
import { puzzleCases } from "./data/cases";
import PlayTab from "./components/PlayTab";
import SolverTab from "./components/SolverTab";
import TabSwitcher from "./components/TabSwitcher";

type TabType = "play" | "solver";

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>("play");
  const [selectedCaseId, setSelectedCaseId] = useState<string>(puzzleCases[0].id);

  const selectedCase = useMemo(() => {
    return puzzleCases.find((c) => c.id === selectedCaseId) ?? puzzleCases[0];
  }, [selectedCaseId]);

  return (
    <div className="app-root">
      <div className="app-container">
        <header className="app-header">
          <h1>Slide Puzzle Visualizer</h1>
          <p>プレイ用とソルバー開発用の2モードを切り替えできます。</p>
        </header>

        <div className="case-selector">
          {puzzleCases.map((puzzleCase) => (
            <button
              key={puzzleCase.id}
              className={puzzleCase.id === selectedCaseId ? "case-button active" : "case-button"}
              onClick={() => setSelectedCaseId(puzzleCase.id)}
            >
              {puzzleCase.label}
            </button>
          ))}
        </div>

        <TabSwitcher activeTab={activeTab} onChange={setActiveTab} />

        <main>
          {activeTab === "play" ? (
            <PlayTab selectedCase={selectedCase} />
          ) : (
            <SolverTab selectedCase={selectedCase} />
          )}
        </main>
      </div>
    </div>
  );
}
