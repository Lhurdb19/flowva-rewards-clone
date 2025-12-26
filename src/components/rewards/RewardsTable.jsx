import { useState } from "react";
import { motion } from "framer-motion";
import { rewardsData } from "../../data/rewardsData";
import RewardBox from "./RewardBox";
import "../../styles/rewards-table.css";

export default function RewardsTable() {
  const [activeTab, setActiveTab] = useState("all");

  const filteredRewards = rewardsData.filter((reward) => {
    if (activeTab === "all") return true;
    if (activeTab === "unlocked") return reward.status === "unlocked";
    if (activeTab === "locked") return reward.status === "locked";
    if (activeTab === "coming-soon") return reward.status === "coming-soon";
    return false;
  });

  const counts = {
    all: rewardsData.length,
    unlocked: rewardsData.filter(r => r.status === "unlocked").length,
    locked: rewardsData.filter(r => r.status === "locked").length,
    comingSoon: rewardsData.filter(r => r.status === "coming-soon").length,
  };

  const tabs = [
    { id: "all", label: "All Rewards", count: counts.all },
    { id: "unlocked", label: "Unlocked", count: counts.unlocked },
    { id: "locked", label: "Locked", count: counts.locked },
    { id: "coming-soon", label: "Coming Soon", count: counts.comingSoon },
  ];

  return (
    <div className="rewards-table-page">
      <span>
        <p></p>
        <h2>Redeem Your Points</h2>
      </span>

      <div className="rewards-switch">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={activeTab === tab.id ? "active" : ""}
          >
            {tab.label} <span className="bg-count">{tab.count}</span>

            {activeTab === tab.id && (
              <motion.div
                className="switch-indicator"
                layoutId="switch-indicator"
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 30,
                }}
              />
            )}
          </button>
        ))}
      </div>

      <div className="rewards-grid">
        {filteredRewards.length === 0 ? (
          <p className="empty-text">No rewards available.</p>
        ) : (
          filteredRewards.map((reward) => (
            <RewardBox key={reward.id} reward={reward} />
          ))
        )}
      </div>
    </div>
  );
}
