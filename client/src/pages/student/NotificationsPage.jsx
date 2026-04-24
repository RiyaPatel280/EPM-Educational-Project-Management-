import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from "../../store/slices/notificationSlice";

import {
  AlertCircle,
  BadgeCheck,
  BellOff,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Clock,
  Clock5,
  MessageCircle,
  Settings,
  User,
} from "lucide-react";

const NotificationsPage = () => {
  const dispatch = useDispatch();

  const notificationsRaw = useSelector((state) => state.notification.list);
  const unreadCount = useSelector((state) => state.notification.unreadCount);

  // ✅ Ensure notifications is always an array
  const notifications = Array.isArray(notificationsRaw)
    ? notificationsRaw
    : notificationsRaw?.notifications || [];

  useEffect(() => {
    dispatch(getNotifications());
  }, [dispatch]);

  const markAsReadHandler = (id) => dispatch(markAsRead(id));
  const markAllAsReadHandler = () => dispatch(markAllAsRead());
  const deleteNotificationHandler = (id) => dispatch(deleteNotification(id));

  const getNotificationIcon = (type) => {
    switch (type) {
      case "feedback":
        return <MessageCircle className="w-6 h-6 text-blue-500" />;

      case "deadline":
        return <Clock5 className="w-6 h-6 text-red-500" />;

      case "approval":
        return <BadgeCheck className="w-6 h-6 text-green-500" />;

      case "meeting":
        return <Calendar className="w-6 h-6 text-purple-500" />;

      case "system":
        return <Settings className="w-6 h-6 text-gray-500" />;

      default:
        return (
          <div className="relative w-6 h-6 text-slate-500 flex items-center justify-center">
            <User className="w-5 h-5 absolute" />
            <ChevronDown className="w-4 h-4 absolute top-4" />
          </div>
        );
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "border-red-500";
      case "medium":
        return "border-yellow-500";
      case "low":
        return "border-green-500";
      default:
        return "border-slate-300";
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();

    const diffMs = now - date;
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) return "Just now";
    if (diffMinutes < 60) return `${diffMinutes} min ago`;
    if (diffHours === 1) return "1 hr ago";
    if (diffHours < 24) return `${diffHours} hrs ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays <= 7) return `${diffDays} days ago`;

    return date.toLocaleDateString();
  };

  const stats = [
    {
      title: "Total",
      value: notifications.length,
      bg: "bg-blue-50",
      iconBg: "bg-blue-100",
      textColor: "text-blue-600",
      titleColor: "text-blue-800",
      valueColor: "text-blue-900",
      Icon: User,
    },
    {
      title: "Unread",
      value: unreadCount || 0,
      bg: "bg-red-50",
      iconBg: "bg-red-100",
      textColor: "text-red-600",
      titleColor: "text-red-800",
      valueColor: "text-red-900",
      Icon: AlertCircle,
    },
    {
      title: "High Priority",
      value: notifications.filter((n) => n.priority === "high").length,
      bg: "bg-yellow-50",
      iconBg: "bg-yellow-100",
      textColor: "text-yellow-600",
      titleColor: "text-yellow-800",
      valueColor: "text-yellow-900",
      Icon: Clock,
    },
    {
      title: "This Week",
      value: notifications.filter((n) => {
        const notifDate = new Date(n.createdAt);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return notifDate >= weekAgo;
      }).length,
      bg: "bg-green-50",
      iconBg: "bg-green-100",
      textColor: "text-green-600",
      titleColor: "text-green-800",
      valueColor: "text-green-900",
      Icon: CheckCircle2,
    },
  ];

  return (
    <>
      <div className="space-y-6">
        <div className="card">
          {/*CARD HEADER*/}
          <div className="card-header">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="card-title">Notifications</h1>
                <p className="card-subtitle">
                  Stay updated with your project progress and deadlines
                </p>
              </div>
              {unreadCount > 0 && (
                <button
                  className="btn-outline btn-small"
                  onClick={markAllAsReadHandler}
                >
                  Mark all as read ({unreadCount})
                </button>
              )}
            </div>
          </div>

          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                className={`group flex items-start justify-between gap-4 rounded-xl border p-4 transition-all duration-200
      ${
        notification.isRead
          ? "bg-white border-slate-200 hover:shadow-sm hover:bg-slate-50"
          : "bg-blue-50 border-blue-200"
      }`}
              >
                {/* LEFT SECTION */}
                <div className="flex items-start gap-3 flex-1">
                  {/* ICON */}
                  <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-slate-100">
                    {getNotificationIcon(notification.type)}

                    {!notification.isRead && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-blue-500 rounded-full"></span>
                    )}
                  </div>

                  {/* MESSAGE */}
                  <div className="flex flex-col gap-1">
                    <p
                      className={`text-sm leading-relaxed ${
                        notification.isRead
                          ? "text-slate-600"
                          : "text-slate-800 font-medium"
                      }`}
                    >
                      {notification.message}
                    </p>

                    <div className="flex items-center gap-2 mt-1">
                      {/* TYPE BADGE */}
                      <span className="text-xs px-2 py-1 rounded-md bg-slate-100 text-slate-600 capitalize">
                        {notification.type || "General"}
                      </span>

                      {/* PRIORITY BADGE */}
                      <span
                        className={`text-xs px-2 py-1 rounded-md capitalize
              ${
                notification.priority === "high"
                  ? "bg-red-100 text-red-600"
                  : notification.priority === "medium"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-green-100 text-green-600"
              }`}
                      >
                        {notification.priority}
                      </span>
                    </div>
                  </div>
                </div>

                {/* RIGHT SIDE */}
                <div className="flex flex-col items-end gap-2">
                  <span className="text-xs text-slate-400">
                    {formatDate(notification.createdAt)}
                  </span>

                  {/* ACTIONS */}
                  <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition">
                    {!notification.isRead && (
                      <button
                        onClick={() => markAsReadHandler(notification._id)}
                        className="text-xs font-medium text-blue-600 hover:text-blue-700"
                      >
                        Mark read
                      </button>
                    )}

                    <button
                      onClick={() =>
                        deleteNotificationHandler(notification._id)
                      }
                      className="text-xs font-medium text-red-500 hover:text-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {notifications.length === 0 && (
            <div className="text-center py-8">
              <div className="flex items-center justify-center mb-3 text-slate-600">
                <BellOff className="w-12 h-12" />
              </div>
              <p className="text-slate-500">No Notification yet.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default NotificationsPage;
