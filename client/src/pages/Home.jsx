// Home.jsx - Professional clean version
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { 
  BellIcon,
  DocumentPlusIcon,
  ChartBarIcon,
  ArrowLeftOnRectangleIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";
import { 
  ChatBubbleBottomCenterTextIcon,
  BoltIcon 
} from "@heroicons/react/24/solid";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:10000';

// NotificationBell Component
const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/api/defects`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.success && data.data) {
          const userNotifications = [];
          
          data.data.forEach(defect => {
            if (defect.adminComments && defect.adminComments.length > 0) {
              defect.adminComments.forEach(comment => {
                if (!comment.read) {
                  userNotifications.push({
                    id: `${defect._id}-${comment._id || Date.now()}`,
                    type: 'comment',
                    text: comment.message,
                    defectTitle: defect.title,
                    defectId: defect._id,
                    createdAt: comment.createdAt,
                    read: comment.read || false,
                    adminName: comment.admin?.name || "Admin"
                  });
                }
              });
            }

            if (defect.notifications && defect.notifications.length > 0) {
              defect.notifications.forEach(notif => {
                if (!notif.read) {
                  userNotifications.push({
                    id: `${defect._id}-${notif._id || Date.now()}`,
                    type: 'status',
                    text: notif.text,
                    defectTitle: defect.title,
                    defectId: defect._id,
                    createdAt: notif.createdAt,
                    read: notif.read || false
                  });
                }
              });
            }
          });

          userNotifications.sort((a, b) => 
            new Date(b.createdAt) - new Date(a.createdAt)
          );
          
          setNotifications(userNotifications);
          setUnreadCount(userNotifications.filter(n => !n.read).length);
        }
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId, defectId) => {
    try {
      const token = localStorage.getItem("token");
      
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      );
      
      setUnreadCount(prev => Math.max(0, prev - 1));

      if (defectId) {
        await fetch(`${API_BASE_URL}/api/defects/${defectId}/read-comments`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative">
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-2 rounded-lg bg-gray-800 border border-gray-700 hover:bg-gray-700 transition-colors"
      >
        <BellIcon className="h-5 w-5 text-gray-300" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 bg-red-600 text-white text-xs font-bold rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {showNotifications && (
        <div className="absolute right-0 mt-2 w-80 bg-gray-900 border border-gray-800 rounded-lg shadow-xl z-50">
          <div className="p-4 border-b border-gray-800">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-white">Notifications</h3>
              <button
                onClick={() => setShowNotifications(false)}
                className="p-1 rounded hover:bg-gray-800 transition-colors"
              >
                <XMarkIcon className="h-4 w-4 text-gray-400" />
              </button>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-400">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-400">
                No notifications
              </div>
            ) : (
              notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-gray-800 hover:bg-gray-800/50 cursor-pointer ${
                    !notification.read ? 'bg-gray-800/30' : ''
                  }`}
                  onClick={() => {
                    if (!notification.read) {
                      markAsRead(notification.id, notification.defectId);
                    }
                    setShowNotifications(false);
                    window.location.href = `/home/dashboard?defect=${notification.defectId}`;
                  }}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`mt-1 p-1.5 rounded ${
                      notification.type === 'comment' 
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'bg-purple-500/20 text-purple-400'
                    }`}>
                      {notification.type === 'comment' ? (
                        <ChatBubbleBottomCenterTextIcon className="h-4 w-4" />
                      ) : (
                        <BoltIcon className="h-4 w-4" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">
                        {notification.defectTitle}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {notification.text}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(notification.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    
                    {!notification.read && (
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default function Home() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Navigation */}
      <nav className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-blue-600 rounded-lg" />
              <span className="text-xl font-semibold text-white">
                InfraWatch
              </span>
            </div>

            <div className="flex items-center space-x-4">
              <NotificationBell />
              
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-300 hover:text-white bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <ArrowLeftOnRectangleIcon className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-3xl">
          <h1 className="text-4xl font-bold text-white mb-4">
            Infrastructure Reporting Platform
          </h1>
          <p className="text-lg text-gray-400 mb-8">
            Report and track infrastructure issues in your community.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to="/home/reports"
              className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors"
            >
              <DocumentPlusIcon className="h-5 w-5 mr-2" />
              Report Issue
            </Link>
            
            <Link
              to="/home/dashboard"
              className="inline-flex items-center justify-center px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-white font-medium transition-colors"
            >
              <ChartBarIcon className="h-5 w-5 mr-2" />
              My Dashboard
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} InfraWatch
          </p>
        </div>
      </footer>
    </div>
  );
}