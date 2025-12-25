import { useEffect, useState } from "react";
import {
  FiCalendar,
  FiCopy,
  FiGift,
  FiShare2,
  FiStar,
  FiUserPlus,
  FiUsers,
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { FaFacebookF, FaLinkedinIn, FaX, FaXTwitter } from "react-icons/fa6";
import { BsFillLayersFill } from "react-icons/bs";
import { supabase } from "../../lib/supabase";
import "./rewards.css";
import { toast } from "react-toastify";
import { BiCheckCircle } from "react-icons/bi";
import { useAuth } from "../Auth/AuthContext";

export default function RewardCard() {
  const [userLoaded, setUserLoaded] = useState(false);
  const [userId, setUserId] = useState(null);

  const [points, setPoints] = useState(0);
  const [streak, setStreak] = useState(1);
  const [claimedToday, setClaimedToday] = useState(false);
  const [showClaimPopup, setShowClaimPopup] = useState(false);

  const [showClaimModal, setShowClaimModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const { user } = useAuth();
  const [referralLink, setReferralLink] = useState("");
  const [referrals, setReferrals] = useState(0);
  const [pointsEarned, setPointsEarned] = useState(0);

  const handleOpenShare = () => setShowShareModal(true);
  const handleCloseShare = () => setShowShareModal(false);

  const DAILY_POINTS = 5;
  const GOAL_POINTS = 5000;

  const getLocalDateString = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().split("T")[0];
  };

  // Load user rewards and streaks
  useEffect(() => {
    let mounted = true;

    const loadRewards = async () => {
      setUserLoaded(false);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        if (!mounted) return;
        setUserId(null);
        setPoints(0);
        setStreak(0);
        setClaimedToday(false);
        setUserLoaded(true);
        return;
      }

      setUserId(user.id);

      // Ensure profile exists
      let { data: profile } = await supabase
        .from("profiles")
        .select("points")
        .eq("id", user.id)
        .maybeSingle();

      if (!profile) {
        await supabase.from("profiles").insert({ id: user.id, points: 0 });
        profile = { points: 0 };
      }

      setPoints(profile?.points ?? 0);

      // Ensure daily_streaks exists
      let { data: streakData } = await supabase
        .from("daily_streaks")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (!streakData) {
        await supabase
          .from("daily_streaks")
          .insert({ id: user.id, current_streak: 0, last_claim_date: null });
        streakData = { current_streak: 0, last_claim_date: null };
      }

      const today = getLocalDateString();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setMinutes(yesterday.getMinutes() - yesterday.getTimezoneOffset());
      const yesterdayStr = yesterday.toISOString().split("T")[0];

      let currentStreak = streakData?.current_streak ?? 0;

      if (streakData?.last_claim_date === today) {
        setClaimedToday(true);
      } else {
        setClaimedToday(false);
        if (streakData?.last_claim_date !== yesterdayStr) {
          currentStreak = 0;
        }
      }

      setStreak(currentStreak);
      setUserLoaded(true);
    };

    loadRewards();

    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      loadRewards();
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  // Claim daily reward
  const claimDaily = async () => {
    if (!user) {
      toast.error("Please login to claim rewards");
      return;
    }

    const userId = user.id;
    const today = getLocalDateString();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setMinutes(yesterday.getMinutes() - yesterday.getTimezoneOffset());
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    try {
      // Fetch streak
      let { data: streakData } = await supabase
        .from("daily_streaks")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (!streakData) {
        await supabase.from("daily_streaks").insert({
          id: userId,
          current_streak: 0,
          last_claim_date: null,
        });
        streakData = { current_streak: 0, last_claim_date: null };
      }

      if (streakData.last_claim_date === today) {
        toast.info("You already claimed today's reward");
        setClaimedToday(true);
        return;
      }

      const newStreak =
        streakData.last_claim_date === yesterdayStr
          ? streakData.current_streak + 1
          : 1;

      // Fetch profile
      let { data: profile } = await supabase
        .from("profiles")
        .select("points")
        .eq("id", userId)
        .maybeSingle();

      if (!profile) {
        await supabase.from("profiles").insert({ id: userId, points: 0 });
        profile = { points: 0 };
      }

      const updatedPoints = profile.points + DAILY_POINTS;

      // Update everything atomically using Promise.all
      const [pointsRes, streakRes, transactionRes, notificationRes] =
        await Promise.all([
          supabase.from("profiles").update({ points: updatedPoints }).eq("id", userId),
          supabase
            .from("daily_streaks")
            .upsert({ id: userId, current_streak: newStreak, last_claim_date: today }),
          supabase.from("transactions").insert({
            user_id: userId,
            type: "daily_reward",
            points: DAILY_POINTS,
            date: today,
          }),
          supabase.from("notifications").insert({
            user_id: userId,
            type: "daily_reward",
            title: "Daily Reward Claimed! 🎉",
            message: `You earned ${DAILY_POINTS} points for your daily streak. Keep it going!`,
            url: "/rewards",
          }),
        ]);

      setPoints(updatedPoints);
      setStreak(newStreak);
      setClaimedToday(true);
      setShowClaimPopup(true);

      toast.success(`🎉 +${DAILY_POINTS} points added! See you tomorrow.`);
    } catch (error) {
      console.error("Claim daily error:", error);
      toast.error("Failed to claim daily reward. Please try again.");
    }
  };

  const getActiveStreakDays = () => {
    const jsToday = new Date().getDay();
    const todayIndex = jsToday === 0 ? 6 : jsToday - 1;
    const days = ["M", "T", "W", "T", "F", "S", "S"];
    return days.map((_, i) => (todayIndex - i + 7) % 7 < streak);
  };

  // Fetch referral data
  useEffect(() => {
    if (!user) return;

    const fetchReferralData = async () => {
      const { data: profile } = await supabase
        .from("profiles")
        .select("referral_code, referral_count, referral_points")
        .eq("id", user.id)
        .single();

      if (profile) {
        setReferralLink(
          `${window.location.origin}/signup?ref=${profile.referral_code}`
        );
        setReferrals(profile.referral_count);
        setPointsEarned(profile.referral_points);
      }
    };

    fetchReferralData();
  }, [user]);

  if (!userLoaded) {
    return (
      <div className="reward-card">
        <span>
          <p></p>
          <div className="skeleton skel-title" />
        </span>
        <div className="cards">
          {/* Skeleton cards */}
          <div className="card">
            <div className="card-header">
              <div className="skeleton skel-icon" />
              <div className="skeleton skel-text sm" />
            </div>
            <div className="points-row">
              <div className="skeleton skel-number" />
              <div className="skeleton skel-icon" />
            </div>
            <div className="progress-info">
              <div className="skeleton skel-text sm" />
              <div className="skeleton skel-text sm" />
            </div>
            <div className="progress-card">
              <div className="progress-bar skeleton" />
              <div className="skeleton skel-text sm" style={{ marginTop: 10 }} />
            </div>
          </div>
          <div className="card">
            <div className="card-header">
              <div className="skeleton skel-icon" />
              <div className="skeleton skel-text sm" />
            </div>
            <div className="streak-card">
              <div className="skeleton skel-number" />
              <div className="skeleton skel-text sm" />
              <div className="streak-days">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div key={i} className="skeleton day" />
                ))}
              </div>
            </div>
            <div className="skeleton skel-button" />
          </div>
          <div className="card">
            <div className="skeleton skel-title" />
            <div className="skeleton skel-text" style={{ margin: 10 }} />
            <div className="skeleton skel-text sm" style={{ margin: 10 }} />
            <div className="skeleton skel-button" style={{ margin: 10 }} />
          </div>
        </div>
      </div>
    );
  }


  return (
    <>
      <div className="reward-card">
        <span>
          {" "}
          <p></p>
          <h2>Your Rewards Journey</h2>
        </span>
        <div className="cards">
          <div className="card">
            <div className="card-header">
              <span className="icon purple">
                <img src="/award.png" alt="" />
              </span>
              <h3>Points Balance</h3>
            </div>

            <div className="points-row">
              <span className="points">{points}</span>
              <span className="coin">
                <img src="/star.png" alt="" />
              </span>
            </div>

            <div className="progress-info">
              <span>Progress to $5 Gift Card</span>
              <span>
                {points}/{GOAL_POINTS}
              </span>
            </div>

            <div className="progress-card">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{
                    width: `${Math.min((points / GOAL_POINTS) * 100, 100)}%`,
                  }}
                />
              </div>

              <p className="hint">
                🚀 Just getting started — keep earning points!
              </p>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <span className="icon blue">📅</span>
              <h3>Daily Streak</h3>
            </div>

            <div className="streak-card">
              <h2 className="streak-count">
                {streak} day{streak > 1 ? "s" : ""}
              </h2>

              <p>Check in daily to to earn +5 points</p>
              <div className="streak-days">
                {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                  <span
                    key={i}
                    className={`day ${
                      getActiveStreakDays()[i] ? "active" : ""
                    }`}
                  >
                    {d}
                  </span>
                ))}
              </div>
            </div>
            <button
              className="claimed-btn"
              disabled={claimedToday}
              style={{
                background: claimedToday ? "#ccc" : "#9013fe",
                cursor: claimedToday ? "not-allowed" : "pointer",
              }}
              onClick={claimDaily}
            >
              ⚡ {claimedToday ? "Claimed Today" : "Claim Today's Points"}
            </button>

          </div>
            {showClaimPopup && (
              <div className="point-claim-overlay">
                <div className="point-claim-modal">
                  <button
                    className="close-btn"
                    onClick={() => setShowClaimPopup(false)}
                  >
                    ✕
                  </button>

                  <div className="check-icon">
                    <BiCheckCircle />
                  </div>

                  <div className="overlay-check"> 
                  <h2>Level Up! 🎉</h2>
                  <h1 className="points">+5 Points</h1>

                  <div className="sparkles">✨ 💎 🎯</div>

                  <p>
                    You've claimed your daily points!
                    Come back tomorrow for more!
                  </p>
                  </div>
                </div>
              </div>
            )}

          <div className="card">
            <div className="top-card">
              <span className="featured">Featured</span>
              <span className="tool">
                <h2>Top Tool Spotlight</h2>
                <img src="/reclaim.png" alt="reclaim" />
              </span>
              <h5>Reclaim</h5>
            </div>

            <div className="mid-card">
              <span className="auto-card">
                <FiCalendar className="icon" />
                <p className="promo-title">
                  Automate and Optimize Your Schedule
                </p>
              </span>

              <p className="promo-text">
                Reclaim.ai is an AI-powered calendar assistant that helps you
                plan smarter. Free to try — earn Flowva Points when you sign up!
              </p>

              <span className="bottom-card">
                <span>
                  <a href="#" onClick={(e) => e.preventDefault()}>
                    <FiUserPlus /> Sign up
                  </a>
                </span>

                <span>
                  <button
                    className="claim-btn"
                    onClick={() => setShowClaimModal(true)}
                  >
                    <FiGift /> Claim 50 pts
                  </button>
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {showClaimModal && (
        <div className="modal-overlay">
          <div className="claim-modal">
            <span className="close-top">
              <h3>Claim Your 25 Points</h3>
              <button onClick={() => setShowClaimModal()} className="close-btn">
                <FaX />
              </button>
            </span>

            <p className="modal-text">
              Sign up for Reclaim (free, no payment needed), then complete the
              steps below:
            </p>

            <div className="list">
              <p>1️⃣ Enter your Reclaim sign-up email</p>
              <p>
                2️⃣ Upload a screenshot of your Reclaim profile showing your
                email
              </p>
            </div>

            <label>
              Email used on Reclaim
              <input type="email" placeholder="user@example.com" />
            </label>

            <label>
              Upload screenshot (mandatory)
              <input type="file" />
            </label>

            <div className="modal-actions">
              <button
                className="cancel-btn"
                onClick={() => setShowClaimModal(false)}
              >
                Cancel
              </button>

              <button className="submit-btn">Submit Claim</button>
            </div>
          </div>
        </div>
      )}

      <div className="earn-point-container">
        <span>
          <p></p>
          <h2>Earn More Points</h2>
        </span>

        <div className="earn-container">
          <div className="earn-card">
            <span>
              <FiStar />
              <h3>Refer and win 10,000 points!</h3>
            </span>
            <p>
              Invite 3 friends by Nov 20 and earn a chance to be one of 5
              winners of <span style={{ color: "#9013fe" }}>10,000 points</span>
              . Friends must complete onboarding to qualify.
            </p>
          </div>

          <div className="earn-card">
            <span>
              <FiShare2 />
              <small>
                <h3>Share Your Stack</h3>
                <p>Earn +25 pts</p>
              </small>
            </span>
            <div className="stack">
              <h3>Share your tool stack</h3>
              <button className="share-btn" onClick={handleOpenShare}>
                <FiShare2 className="share2" />
                <p>Share</p>
              </button>
            </div>
          </div>
        </div>

        {showShareModal && (
          <div className="modal-share-overlay">
            <div className="share-modal">
              <div className="close-top">
                <h3>Share Your Stack</h3>
                <button className="close-btn" onClick={handleCloseShare}>
                  <FaX />
                </button>
              </div>

              <BsFillLayersFill className="stack-icon" />

              <p className="share-text">
                You have no stack created yet, go to Tech Stack to create one.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="refer-container">
        <span>
          <p></p>
          <h2>Refer & Earn</h2>
        </span>
        <div className="refers-card">
          <span className="top-refer-card">
            <FiUsers className="icon-user" />
            <small>
              <h3>Share Your Link</h3>
              <p>Invite friends and earn 25 points when they join!</p>
            </small>
          </span>
          <div className="mid-refer-card">
            <span>
              <h2>0</h2>
              <p>Referrals</p>
            </span>
            <span>
              <h2>0</h2>
              <p>Point Earned</p>
            </span>
          </div>

          <div className="bottom-refer-card">
            <span>
              <p>Your personal referral link:</p>
              <input placeholder="https://app.flowvahub.com/signup/?ref=hejid2626" />
            </span>

            <span className="social-medials">
              <a href="#" className="face">
                {" "}
                <FaFacebookF />
              </a>
              <a href="#" className="twit">
                {" "}
                <FaXTwitter />{" "}
              </a>
              <a href="#" className="link">
                {" "}
                <FaLinkedinIn />{" "}
              </a>
              <a href="#" className="what">
                {" "}
                <FaWhatsapp />{" "}
              </a>
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
