import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { FaBell, FaX, FaCheck, FaTrash } from "react-icons/fa6";

export default function NotificationDropdown() {
  const [notifications, setNotifications] = useState([]);
  const [overlayNotification, setOverlayNotification] = useState(null);
  const [open, setOpen] = useState(false);

  const [prevUnreadCount, setPrevUnreadCount] = useState(0);
  const [animateBell, setAnimateBell] = useState(false);

  const fetchNotifications = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error) {
      setNotifications(data);

      const currentUnread = data.filter((n) => !n.read).length;
      if (currentUnread > prevUnreadCount) {
        setAnimateBell(true);
        setTimeout(() => setAnimateBell(false), 1000);
      }
      setPrevUnreadCount(currentUnread);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      await supabase
        .from("notifications")
        .update({ read: true })
        .eq("id", notification.id);
    }

    setNotifications((prev) =>
      prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n))
    );

    setOpen(false);
    setOverlayNotification(notification);
  };

  const markAllRead = async () => {
    if (notifications.length === 0) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", user.id);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const deleteAll = async () => {
    if (notifications.length === 0) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("notifications").delete().eq("user_id", user.id);
    setNotifications([]);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="notification-wrapper">
      <button className="bell-btn" onClick={() => setOpen(!open)}>
        <FaBell />
        {unreadCount > 0 && (
          <span className="notification-count">{unreadCount}</span>
        )}
      </button>

      {open && (
        <div className="notification-dropdown">
          <div className="dropdown-header">
            <h4>Notifications</h4>
            <button className="icon-btn" onClick={markAllRead}>
              <FaCheck className="icons"/>
              <span className="btn-text">Mark all as read</span>
            </button>
            {notifications.length > 0 && (
              <button className="icon-btn" onClick={deleteAll}>
                <FaTrash className="icons" />
                <span className="btn-text">Delete All</span>
              </button>
            )}
          </div>

          <div className="notification-list">
            {notifications.length === 0 ? (
              <span className="not-notification">
                <span className="notify-icon" style={{ fontSize: "50px" }}>
                  🔔
                </span>
                <p>No notifications</p>
                <p>You're all caught up!</p>
              </span>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`notification-item ${n.read ? "read" : "unread"}`}
                  onClick={() => handleNotificationClick(n)}
                >
                  <h5>{n.title}</h5>
                  <p>{n.message.slice(0, 70)}...</p>
                  <small>{new Date(n.created_at).toLocaleString()}</small>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {overlayNotification && (
        <div
          className="notification-overlay"
          onClick={() => setOverlayNotification(null)}
        >
          <div className="overlay-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="overlay-close"
              onClick={() => setOverlayNotification(null)}
            >
              <FaX />
            </button>

            <h3>{overlayNotification.title}</h3>
            <small className="overlay-time">
              {new Date(overlayNotification.created_at).toLocaleString()}
            </small>
            <p className="overlay-message">{overlayNotification.message}</p>
          </div>
        </div>
      )}
    </div>
  );
}
