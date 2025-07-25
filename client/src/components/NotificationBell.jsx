import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { FaBell } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../config/api";

const NotificationBell = ({ socket }) => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    // Fetch initial notifications
    fetchNotifications();

    // Listen for new notifications via socket
    if (socket) {
      socket.on('newNotification', (notification) => {
        setNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);
        
        // Show toast notification
        toast.info(`New notification: ${notification.message}`, {
          position: "top-right",
          autoClose: 3000,
        });
      });

      // Listen for notification updates
      socket.on('notificationRead', (notificationId) => {
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === notificationId 
              ? { ...notif, read: true }
              : notif
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      });
    }

    // Handle click outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (socket) {
        socket.off('newNotification');
        socket.off('notificationRead');
      }
    };
  }, [socket]);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const token = sessionStorage.getItem("token");
      if (!token) return;

      console.log("🔔 Fetching notifications...");
      
      const response = await api.get('/notifications', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log("🔔 Notifications response:", response.data);

      if (response.data.status === "success") {
        setNotifications(response.data.data);
        const unread = response.data.data.filter(notif => !notif.read).length;
        setUnreadCount(unread);
        console.log(`🔔 Loaded ${response.data.data.length} notifications, ${unread} unread`);
      } else {
        console.error("🔔 Failed to fetch notifications:", response.data);
      }
    } catch (error) {
      console.error("🔔 Error fetching notifications:", error);
      toast.error("Failed to load notifications");
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) return;

      console.log(`🔔 Marking notification ${notificationId} as read`);

      await api.put(`/notifications/${notificationId}/read`, {}, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, read: true }
            : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      console.log(`🔔 Notification ${notificationId} marked as read`);
    } catch (error) {
      console.error("🔔 Error marking notification as read:", error);
      toast.error("Failed to mark notification as read");
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) return;

      console.log(`🔔 Deleting notification ${notificationId}`);

      await api.delete(`/notifications/${notificationId}`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Remove from local state
      setNotifications(prev => {
        const updatedNotifications = prev.filter(notif => notif.id !== notificationId);
        const deletedNotification = prev.find(notif => notif.id === notificationId);
        
        // Update unread count if the deleted notification was unread
        if (deletedNotification && !deletedNotification.read) {
          setUnreadCount(prevCount => Math.max(0, prevCount - 1));
        }
        
        return updatedNotifications;
      });
      
      toast.success("Notification deleted");
      console.log(`🔔 Notification ${notificationId} deleted successfully`);
    } catch (error) {
      console.error(`🔔 Error deleting notification ${notificationId}:`, error);
      toast.error("Failed to delete notification");
    }
  };

  const handleNotificationClick = (notification) => {
    console.log("🔔 Notification clicked:", notification);
    console.log("🔔 Post ID:", notification.post_id);
    console.log("🔔 Notification type:", notification.type);
    
    // Mark as read when clicked
    if (!notification.read) {
      markAsRead(notification.id);
    }
    
    // Close dropdown
    setIsDropdownOpen(false);
    
    // Handle different notification types
    if (notification.type === 'meeting_request') {
      // For meeting requests, navigate to a dedicated meeting management page
      console.log(`🔔 Navigating to meeting requests page`);
      navigate('/meetings');
    } else if (notification.type === 'meeting_approve' || notification.type === 'meeting_decline') {
      // For meeting responses, navigate to sent meetings page
      console.log(`🔔 Navigating to sent meetings page`);
      navigate('/meetings/sent');
    } else if (notification.post_id) {
      // For regular notifications (comments, likes), navigate to the post
      console.log(`🔔 Navigating to post: /post/${notification.post_id}`);
      navigate(`/post/${notification.post_id}`);
    } else {
      console.log("🔔 No post_id found, cannot navigate");
      toast.info("Notification details not available");
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) return;

      console.log("🔔 Marking all notifications as read");

      await api.put('/notifications/mark-all-read', {}, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setNotifications(prev => 
        prev.map(notif => ({ ...notif, read: true }))
      );
      setUnreadCount(0);
      toast.success("All notifications marked as read");
      console.log("🔔 All notifications marked as read");
    } catch (error) {
      console.error("🔔 Error marking all notifications as read:", error);
      toast.error("Failed to mark notifications as read");
    }
  };

  const clearAllNotifications = async () => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) return;

      console.log("🔔 Clearing all notifications");

      await api.delete('/notifications/clear-all', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setNotifications([]);
      setUnreadCount(0);
      toast.success("All notifications cleared");
      console.log("🔔 All notifications cleared successfully");
    } catch (error) {
      console.error("🔔 Error clearing notifications:", error);
      toast.error("Failed to clear notifications");
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now - time) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-800 focus:outline-none transition-colors duration-200"
        title="Notifications"
      >
        <FaBell size={20} className={`${unreadCount > 0 ? 'text-blue-600' : 'text-gray-600'}`} />
        
        {/* Unread count badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
              {unreadCount > 0 && (
                <span className="text-sm text-blue-600 font-medium">
                  {unreadCount} new
                </span>
              )}
            </div>
            
            {/* Action buttons */}
            {notifications.length > 0 && (
              <div className="flex gap-2 mt-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={clearAllNotifications}
                  className="text-xs text-red-600 hover:text-red-800 font-medium"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-64 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-sm">Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <FaBell size={32} className="mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No notifications yet</p>
                <p className="text-xs text-gray-400 mt-1">
                  You&apos;ll see notifications for comments on your posts here
                </p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 border-b border-gray-100 transition-colors duration-200 ${
                    !notification.read ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                  }`}
                >
                  <div 
                    className="flex justify-between items-start cursor-pointer hover:bg-gray-50 -m-3 p-3 rounded"
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex-1">
                      <p className={`text-sm ${!notification.read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                        {notification.message}
                      </p>
                      {notification.postTitle && (
                        <p className="text-xs text-gray-500 mt-1">
                          on &quot;{notification.postTitle}&quot;
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        {formatTimeAgo(notification.createdAt)}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full ml-2 mt-1 flex-shrink-0"></div>
                    )}
                  </div>
                  
                  {/* Action buttons */}
                  <div className="flex justify-end gap-2 mt-2 pt-2 border-t border-gray-100">
                    {!notification.read && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(notification.id);
                        }}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium px-2 py-1 rounded hover:bg-blue-100"
                        title="Mark as read"
                      >
                        Mark as read
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification.id);
                      }}
                      className="text-xs text-red-600 hover:text-red-800 font-medium px-2 py-1 rounded hover:bg-red-100"
                      title="Delete notification"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
              <button className="text-xs text-blue-600 hover:text-blue-800 font-medium w-full text-center">
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

NotificationBell.propTypes = {
  socket: PropTypes.object
};

export default NotificationBell;
