type TabType = "play" | "solver";

type TabSwitcherProps = {
  activeTab: TabType;
  onChange: (tab: TabType) => void;
};

export default function TabSwitcher({ activeTab, onChange }: TabSwitcherProps) {
  return (
    <div
      style={{
        display: "flex",
        gap: "8px",
        justifyContent: "center",
        marginBottom: "20px",
        flexWrap: "wrap",
      }}
    >
      <button
        onClick={() => onChange("play")}
        style={buttonStyle(activeTab === "play")}
      >
        プレイ
      </button>
      <button
        onClick={() => onChange("solver")}
        style={buttonStyle(activeTab === "solver")}
      >
        ソルバー開発
      </button>
    </div>
  );
}

function buttonStyle(active: boolean): React.CSSProperties {
  return {
    border: "none",
    borderRadius: "999px",
    padding: "10px 18px",
    fontSize: "0.95rem",
    fontWeight: 700,
    cursor: "pointer",
    background: active ? "#2563eb" : "#e2e8f0",
    color: active ? "#ffffff" : "#0f172a",
  };
}
