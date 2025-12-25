// src/components/rewards/RewardBox.jsx

export default function RewardBox({ reward }) {
  return (
    <div className="reward-box">
      <div className="reward-icons" style={{ fontSize: "22px", marginBottom: "10px", width: "50px", height: "50px", background: "#f9f2ff", borderRadius: "10px" }}>
        {reward.icon}
      </div>

      <h4>{reward.title}</h4>
      <p style={{ fontSize: "13px", color: "#6b7280", marginBottom: "12px" }}>
        {reward.description}
      </p>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: "10px",
          marginTop: "12px",
        }}
      >
        <span style={{ fontSize: "12px", color: "#7c3aed", fontWeight: "500" }}>
          ⭐ {reward.points} pts
        </span>

        {reward.status === "locked" && (
          <span className="badge locked">Locked</span>
        )}

        {reward.status === "unlocked" && (
          <span className="badge unlocked">Unlocked</span>
        )}

        {reward.status === "coming-soon" && (
          <span className="badge soon" style={{padding: "10px 50px"}}>Coming Soon</span>
        )}
      </div>
    </div>
  );
}
