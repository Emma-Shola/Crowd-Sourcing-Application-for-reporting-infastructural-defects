import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  BellIcon,
  XMarkIcon,
  CheckCircleIcon,
  ChatBubbleLeftRightIcon,
  ExclamationTriangleIcon,
  ArrowRightIcon
} from "@heroicons/react/24/solid";
import { 
  ChevronRightIcon,
  CheckBadgeIcon 
} from "@heroicons/react/24/outline";

export default function NotificationBell() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);
  const [isHovering, setIsHovering] = useState(false);

  // Mock notifications with realistic data
  useEffect(() => {
    const mockNotifications = [
      {
        id: 1,
        type: 'success',
        icon: CheckCircleIcon,
        title: 'Issue Resolved',
        message: 'Pothole on Main Street has been fixed',
        time: '2 hours ago',
        read: false,
        defectId: '1234',
        color: 'text-emerald-400',
        bgColor: 'bg-emerald-400/10',
        borderColor: 'border-emerald-400/20'
      },
      {
        id: 2,
        type: 'comment',
        icon: ChatBubbleLeftRightIcon,
        title: 'New Comment',
        message: 'Admin replied to your drainage report',
        time: '1 day ago',
        read: false,
        defectId: '5678',
        color: 'text-blue-400',
        bgColor: 'bg-blue-400/10',
        borderColor: 'border-blue-400/20'
      },
      {
        id: 3,
        type: 'warning',
        icon: ExclamationTriangleIcon,
        title: 'Action Required',
        message: 'Additional photos needed for verification',
        time: '2 days ago',
        read: true,
        defectId: '9012',
        color: 'text-amber-400',
        bgColor: 'bg-amber-400/10',
        borderColor: 'border-amber-400/20'
      },
      {
        id: 4,
        type: 'success',
        icon: CheckBadgeIcon,
        title: 'Status Update',
        message: 'Street light repair scheduled for tomorrow',
        time: '3 days ago',
        read: true,
        defectId: '3456',
        color: 'text-purple-400',
        bgColor: 'bg-purple-400/10',
        borderColor: 'border-purple-400/20'
      },
    ];
    
    setNotifications(mockNotifications);
    setUnreadCount(mockNotifications.filter(n => !n.read).length);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
    setUnreadCount(0);
  };

  const clearAll = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Animated Notification Button */}
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        className="relative p-3 rounded-xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 hover:border-cyan-500/50 transition-all duration-500 group"
        aria-label="Notifications"
      >
        {/* Animated rings */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500/0 via-blue-500/0 to-purple-500/0 group-hover:from-cyan-500/10 group-hover:via-blue-500/10 group-hover:to-purple-500/10 transition-all duration-500" />
        
        <div className="relative">
          <BellIcon className={`h-6 w-6 transition-all duration-500 ${
            isHovering ? 'text-cyan-400 scale-110' : 'text-gray-400'
          }`} />
          
          {/* Pulsing badge */}
          {unreadCount > 0 && (
            <>
              <div className="absolute -top-2 -right-2 h-5 w-5 bg-gradient-to-r from-red-500 to-rose-500 rounded-full animate-ping opacity-75" />
              <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-rose-500 text-xs font-bold text-white shadow-lg">
                {unreadCount}
              </span>
            </>
          )}
        </div>
      </button>

      {/* Animated Notification Dropdown */}
      {showNotifications && (
        <div className="absolute right-0 mt-3 w-[420px] bg-gradient-to-br from-gray-900 to-gray-950 rounded-2xl shadow-2xl border border-gray-800/50 overflow-hidden z-50 animate-in slide-in-from-top-5 duration-300 backdrop-blur-xl">
          {/* Header with gradient */}
          <div className="relative p-6 border-b border-gray-800/50">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-blue-500/5" />
            <div className="relative flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30">
                  <BellIcon className="h-6 w-6 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Notifications</h3>
                  <p className="text-sm text-gray-400">
                    {unreadCount} unread • {notifications.length} total
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="px-3 py-1.5 text-xs font-medium text-cyan-400 hover:text-cyan-300 hover:bg-cyan-400/10 rounded-lg transition-colors duration-300"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setShowNotifications(false)}
                  className="p-2 hover:bg-gray-800/50 rounded-lg transition-colors duration-300"
                >
                  <XMarkIcon className="h-5 w-5 text-gray-400" />
                </button>
              </div>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-[480px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-12 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700/50 mb-6">
                  <BellIcon className="h-10 w-10 text-gray-600" />
                </div>
                <h4 className="text-xl font-semibold text-white mb-2">All caught up!</h4>
                <p className="text-gray-400">No new notifications</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-800/50">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`group relative p-5 transition-all duration-300 hover:bg-gray-800/30 cursor-pointer ${
                      !notif.read ? 'bg-gradient-to-r from-cyan-500/5 to-blue-500/5' : ''
                    }`}
                    onClick={() => {
                      markAsRead(notif.id);
                      navigate(`/home/dashboard?defect=${notif.defectId}`);
                      setShowNotifications(false);
                    }}
                  >
                    {/* Unread indicator */}
                    {!notif.read && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-cyan-500 to-blue-500" />
                    )}

                    <div className="flex items-start space-x-4">
                      {/* Icon with gradient background */}
                      <div className={`p-3 rounded-xl border ${notif.borderColor} ${notif.bgColor} group-hover:scale-110 transition-transform duration-300`}>
                        <notif.icon className={`h-6 w-6 ${notif.color}`} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className={`font-semibold ${
                            notif.read ? 'text-gray-300' : 'text-white'
                          }`}>
                            {notif.title}
                          </h4>
                          <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                            {notif.time}
                          </span>
                        </div>
                        <p className="text-gray-400 text-sm mb-3 leading-relaxed">
                          {notif.message}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className={`text-xs px-3 py-1 rounded-full font-medium ${notif.bgColor} ${notif.color}`}>
                            {notif.type.charAt(0).toUpperCase() + notif.type.slice(1)}
                          </span>
                          <ChevronRightIcon className="h-4 w-4 text-gray-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all duration-300" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          {notifications.length > 0 && (
            <div className="p-4 border-t border-gray-800/50 bg-gradient-to-r from-gray-900/50 to-gray-950/50">
              <div className="flex justify-between">
                <button
                  onClick={clearAll}
                  className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all duration-300"
                >
                  Clear All
                </button>
                <button
                  onClick={() => {
                    navigate('/home/dashboard');
                    setShowNotifications(false);
                  }}
                  className="px-4 py-2 text-sm font-medium text-cyan-400 hover:text-cyan-300 hover:bg-cyan-400/10 rounded-lg transition-all duration-300 flex items-center"
                >
                  View All
                  <ArrowRightIcon className="h-4 w-4 ml-2" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}