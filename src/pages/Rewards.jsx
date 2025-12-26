import { useState } from "react";

import DashboardLayout from "../components/layout/DashboardLayout";
import RewardCard from "../components/rewards/RewardCard";
import RewardsTable from "../components/rewards/RewardsTable";
import "../styles/rewards-switch.css";
import NotificationDropdown from "../components/notifications/NotificationDropdown";
import { FaX } from "react-icons/fa6";
import { FaBars } from "react-icons/fa";

export default function Rewards() {
  const [activeTab, setActiveTab] = useState("cards");
  const [open, setOpen] = useState(false);

  const tabs = [
    { id: "cards", label: "Earn Points" },
    { id: "table", label: "Redeem Rewards" },
  ];

  return (
    <DashboardLayout>
      <header className="navbar">
  <div className="navbar-left">
    <button
      className={`hamburger-btn ${open ? "open" : ""}`}
      onClick={() => setOpen((prev) => !prev)}
    >
      {open ? <FaX /> : <FaBars />}
    </button>

    <div className="navbar-title">
      <h1>Rewards Hub</h1>
      <p>Earn points, unlock rewards, and celebrate your progress!</p>
    </div>
  </div>

  <div className="navbar-right">
    <NotificationDropdown />
  </div>
</header>



      <div className="page-content">
       <div className="rewards-switch">
  {tabs.map((tab) => (
    <div key={tab.id} className="tab-wrapper">
      <button
        onClick={() => setActiveTab(tab.id)}
        className={activeTab === tab.id ? "active" : ""}
      >
        {tab.label}
      </button>
      {activeTab === tab.id && <span className="switch-indicator" />}
    </div>
  ))}
</div>


        <div className="switch-content">
          {activeTab === "cards" && <RewardCard />}
          {activeTab === "table" && <RewardsTable />}
        </div>
      </div>
    </DashboardLayout>
  );
}
