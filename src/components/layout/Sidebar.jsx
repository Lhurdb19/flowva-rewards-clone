import { useState } from "react";
import {
  FaBook,
  FaCogs,
  FaCompass,
  FaCreditCard,
  FaGem,
  FaHome,
} from "react-icons/fa";
import { FaGear, FaBars, FaX } from "react-icons/fa6";
import { useAuth } from "../Auth/AuthContext";

export default function Sidebar() {
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const menuItems = [
    { label: "Home", icon: <FaHome /> },
    { label: "Discover", icon: <FaCompass /> },
    { label: "Library", icon: <FaBook /> },
    { label: "Tech Stack", icon: <FaCogs /> },
    { label: "Subscriptions", icon: <FaCreditCard /> },
    { label: "Rewards Hub", icon: <FaGem /> },
    { label: "Settings", icon: <FaGear /> },
  ];

  return (
    <>
      <button
        className={`hamburger-btn ${open ? "open" : ""}`}
        onClick={() => {
          setOpen((prev) => !prev);
          setUserMenuOpen(false);
        }}
      >
        {open ? <FaX /> : <FaBars />}
      </button>

      {open && (
        <div className="sidebar-overlay" onClick={() => setOpen(false)} />
      )}

      <aside className={`sidebar ${open ? "open" : ""}`}>
        <span className="logo">
          <img src="/flowva_logo.png" alt="flowva logo" />
        </span>

        <nav className="menu">
          {menuItems.map((item) => (
            <div
              key={item.label}
              className={`menu-item ${
                item.label === "Rewards Hub" ? "active" : ""
              }`}
              onClick={() => setOpen(false)}
            >
              <span className="menu-icon">{item.icon}</span>
              <span className="menu-text">{item.label}</span>
            </div>
          ))}
        </nav>

        {user && (
          <div className="user-wrapper">
            <div
              className="user"
              onClick={() => setUserMenuOpen((prev) => !prev)}
            >
              <div className="avatar">{user.email[0].toUpperCase()}</div>

              <div className="user-info">
                <p className="username">{user.email.split("@")[0]}</p>
                <span className="email">{user.email}</span>
              </div>
            </div>

            {userMenuOpen && (
              <>
                <div
                  className="user-dropdown-overlay"
                  onClick={() => setUserMenuOpen(false)}
                />

                <div className="user-dropdown">
                  <button className="dropdown-item">💬 Feedback</button>
                  <button className="dropdown-item">🛟 Support</button>
                  <button className="dropdown-item logout" onClick={signOut}>
                    🚪 Logout
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </aside>
    </>
  );
}
