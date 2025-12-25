import RewardCard from "./RewardCard";
import "./rewards.css";

export default function RewardsSummary() {
  return (
    <div className="rewards-summary">
      <RewardCard title="Total Earned" value="₦5,000" />
      <RewardCard title="Redeemed" value="₦2,000" />
      <RewardCard title="Balance" value="₦3,000" />
    </div>
  );
}
