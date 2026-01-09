// Home.jsx - Updated with user-specific notifications and environment variable
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { 
  SparklesIcon, 
  MapPinIcon, 
  BoltIcon, 
  ShieldCheckIcon,
  ArrowUpRightIcon,
  ChartBarIcon,
  ChatBubbleBottomCenterTextIcon,
  UserGroupIcon,
  ClockIcon,
  CheckBadgeIcon,
  BellIcon
} from "@heroicons/react/24/solid";
import { 
  ArrowRightIcon,
  DocumentPlusIcon,
  ArrowLeftOnRectangleIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// NotificationBell Component (User-specific)
const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch user-specific notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      if (!token) return;

      // Fetch user's defects (reports)
      const response = await fetch(`${API_BASE_URL}/api/defects`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.success && data.data) {
          const userNotifications = [];
          
          // Process each defect that belongs to this user
          data.data.forEach(defect => {
            // Add admin comments as notifications
            if (defect.adminComments && defect.adminComments.length > 0) {
              defect.adminComments.forEach(comment => {
                // Only add if comment is unread
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

            // Add status change notifications
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

          // Sort by date (newest first)
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

  // Mark notification as read
  const markAsRead = async (notificationId, defectId) => {
    try {
      const token = localStorage.getItem("token");
      
      // Update notification locally first for instant feedback
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      );
      
      setUnreadCount(prev => Math.max(0, prev - 1));

      // Mark comments as read on backend
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

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem("token");
      const unreadNotifications = notifications.filter(n => !n.read);
      
      // Mark all as read locally
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, read: true }))
      );
      setUnreadCount(0);

      // Update each defect's notifications on backend
      const defectIds = [...new Set(unreadNotifications
        .filter(n => n.defectId)
        .map(n => n.defectId)
      )];

      await Promise.all(
        defectIds.map(id =>
          fetch(`${API_BASE_URL}/api/defects/${id}/read-comments`, {
            method: "PUT",
            headers: { Authorization: `Bearer ${token}` },
          })
        )
      );
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  // Fetch notifications on mount and periodically
  useEffect(() => {
    fetchNotifications();
    
    // Refresh notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative">
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-2 rounded-xl bg-gray-800/50 border border-gray-700/50 hover:border-gray-600 hover:bg-gray-800 transition-all duration-300 group"
      >
        <BellIcon className="h-5 w-5 text-gray-300 group-hover:text-white" />
        
        {/* Notification badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 bg-gradient-to-r from-red-500 to-rose-500 text-white text-xs font-bold rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification dropdown */}
      {showNotifications && (
        <div className="absolute right-0 mt-2 w-80 bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl z-50 overflow-hidden animate-fade-in">
          {/* Header */}
          <div className="p-4 border-b border-gray-700/50">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white">Notifications</h3>
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setShowNotifications(false)}
                  className="p-1 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <XMarkIcon className="h-4 w-4 text-gray-400" />
                </button>
              </div>
            </div>
          </div>

          {/* Notifications list */}
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="p-6 text-center">
                <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-cyan-500 border-r-transparent" />
                <p className="mt-2 text-gray-400 text-sm">Loading...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-6 text-center">
                <div className="inline-flex p-3 rounded-xl bg-gray-800/50 mb-3">
                  <BellIcon className="h-6 w-6 text-gray-500" />
                </div>
                <p className="text-gray-400">No notifications yet</p>
                <p className="text-gray-500 text-sm mt-1">
                  You'll see updates about your reports here
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-800/50">
                {notifications.map(notification => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-800/30 transition-colors cursor-pointer ${
                      !notification.read ? 'bg-cyan-500/5' : ''
                    }`}
                    onClick={() => {
                      if (!notification.read) {
                        markAsRead(notification.id, notification.defectId);
                      }
                      setShowNotifications(false);
                      // Navigate to dashboard with defect focus
                      window.location.href = `/home/dashboard?defect=${notification.defectId}`;
                    }}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`mt-1 p-1.5 rounded-lg ${
                        notification.type === 'comment' 
                          ? 'bg-cyan-500/20 text-cyan-400'
                          : 'bg-purple-500/20 text-purple-400'
                      }`}>
                        {notification.type === 'comment' ? (
                          <ChatBubbleBottomCenterTextIcon className="h-4 w-4" />
                        ) : (
                          <BoltIcon className="h-4 w-4" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {notification.defectTitle}
                        </p>
                        <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                          {notification.text}
                        </p>
                        {notification.adminName && (
                          <p className="text-xs text-cyan-400 mt-1">
                            By {notification.adminName}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(notification.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      
                      {!notification.read && (
                        <div className="w-2 h-2 rounded-full bg-cyan-500 flex-shrink-0 mt-2" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-700/50 text-center">
              <Link
                to="/home/dashboard"
                onClick={() => setShowNotifications(false)}
                className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                View all reports →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default function Home() {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  const stats = [
    { value: "98.7%", label: "Report Accuracy", icon: CheckBadgeIcon, color: "text-emerald-400" },
    { value: "2.4K", label: "Active Reports", icon: DocumentPlusIcon, color: "text-blue-400" },
    { value: "18.7K", label: "Issues Resolved", icon: ShieldCheckIcon, color: "text-purple-400" },
    { value: "2.1", label: "Avg Days to Resolve", icon: ClockIcon, color: "text-amber-400" },
  ];

  const features = [
    {
      icon: MapPinIcon,
      title: "Precision Mapping",
      description: "Pinpoint exact locations with our AI-powered geotagging system",
      gradient: "from-cyan-500 to-blue-500",
      delay: "100"
    },
    {
      icon: BoltIcon,
      title: "Real-time Updates",
      description: "Live tracking with instant notifications on status changes",
      gradient: "from-violet-500 to-purple-500",
      delay: "200"
    },
    {
      icon: ShieldCheckIcon,
      title: "Verified Responses",
      description: "Official updates from municipal authorities and agencies",
      gradient: "from-emerald-500 to-teal-500",
      delay: "300"
    },
    {
      icon: UserGroupIcon,
      title: "Community Driven",
      description: "Collaborate with neighbors and local organizations",
      gradient: "from-rose-500 to-pink-500",
      delay: "400"
    },
    {
      icon: ChartBarIcon,
      title: "Analytics Dashboard",
      description: "Track trends and impact with detailed insights",
      gradient: "from-orange-500 to-amber-500",
      delay: "500"
    },
    {
      icon: ChatBubbleBottomCenterTextIcon,
      title: "Direct Communication",
      description: "Real-time chat with administrators and responders",
      gradient: "from-indigo-500 to-blue-500",
      delay: "600"
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black text-white overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Floating particles */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-blue-400/20 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${5 + Math.random() * 10}s`
              }}
            />
          ))}
        </div>

        {/* Grid overlay */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
                             linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
            transform: `translateY(${scrollY * 0.1}px)`
          }}
        />

        {/* Mouse follower glow */}
        <div 
          className="absolute w-[800px] h-[800px] rounded-full bg-gradient-to-r from-blue-500/5 to-purple-500/5 blur-3xl"
          style={{
            left: `${mousePosition.x - 400}px`,
            top: `${mousePosition.y - 400}px`,
            transition: 'left 0.3s ease-out, top 0.3s ease-out'
          }}
        />
      </div>

      {/* Navigation Bar - Glass Morphism */}
      <nav className="sticky top-0 z-50 bg-gray-900/40 backdrop-blur-2xl border-b border-white/10 shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo with animation */}
            <Link to="/home" className="group flex items-center space-x-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl blur-lg group-hover:blur-xl transition-all duration-500" />
                <div className="relative bg-gradient-to-r from-cyan-500 to-blue-500 p-3 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <SparklesIcon className="h-6 w-6" />
                </div>
              </div>
              <div className="relative">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  InfraWatch
                </h1>
                <div className="absolute -bottom-1 left-0 w-0 group-hover:w-full h-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500" />
              </div>
            </Link>

            {/* Right Actions */}
            <div className="flex items-center space-x-4">
              {/* Updated NotificationBell component */}
              <NotificationBell />
              
              <div className="hidden lg:flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium bg-gradient-to-r from-gray-300 to-gray-100 bg-clip-text text-transparent">
                    Community Builder
                  </p>
                  <p className="text-xs text-gray-400">Active Now</p>
                </div>
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full p-0.5 animate-spin-slow">
                    <div className="h-9 w-9 bg-gray-900 rounded-full" />
                  </div>
                  <div className="relative h-10 w-10 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full border-2 border-gray-800 shadow-xl flex items-center justify-center">
                    <span className="text-sm font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                      U
                    </span>
                  </div>
                </div>
              </div>
              
              <button
                onClick={handleLogout}
                className="group flex items-center space-x-2 px-4 py-2.5 text-sm font-medium text-gray-300 hover:text-white bg-gray-800/50 hover:bg-gray-800 rounded-xl transition-all duration-300 border border-gray-700/50 hover:border-gray-600"
              >
                <ArrowLeftOnRectangleIcon className="h-5 w-5 group-hover:rotate-180 transition-transform duration-500" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative max-w-7xl mx-auto px-6 pt-20 pb-32">
        {/* Hero Content */}
        <div className="relative z-10">
          {/* Animated badge */}
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 mb-8 animate-pulse">
            <div className="h-2 w-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 mr-2" />
            <span className="text-sm font-medium bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              🚀 AI-Powered Infrastructure Monitoring
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-8">
            <div className="relative">
              <span className="block opacity-90">Build Better</span>
              <span className="block">
                <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent animate-gradient-x">
                  Communities
                </span>
                <span className="ml-4">Together</span>
              </span>
            </div>
          </h1>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mb-12 leading-relaxed">
            Transform your neighborhood with our intelligent platform that connects citizens, 
            local authorities, and technology to create safer, smarter communities.
          </p>

          {/* Action Buttons - UPDATED with "My Dashboard" */}
          <div className="flex flex-col sm:flex-row gap-6 mb-20">
            <Link
              to="/home/reports"
              className="group relative overflow-hidden px-10 py-5 text-lg font-semibold rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 transition-all duration-500 transform hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-500/30"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-400 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative flex items-center justify-center">
                <DocumentPlusIcon className="h-6 w-6 mr-3 group-hover:rotate-12 transition-transform" />
                Report Issue
                <ArrowUpRightIcon className="h-5 w-5 ml-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
              </div>
            </Link>

            <Link
              to="/home/dashboard"
              className="group px-10 py-5 text-lg font-semibold rounded-2xl bg-gray-800/50 border border-gray-700/50 hover:border-gray-600 hover:bg-gray-800 transition-all duration-500 transform hover:-translate-y-1"
            >
              <div className="flex items-center justify-center">
                <ChartBarIcon className="h-6 w-6 mr-3 text-cyan-400 group-hover:scale-110 transition-transform" />
                My Dashboard
                <ArrowRightIcon className="h-5 w-5 ml-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
              </div>
            </Link>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-24">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="group p-6 rounded-2xl bg-gray-800/30 backdrop-blur-sm border border-gray-700/30 hover:border-gray-600/50 transition-all duration-500 hover:scale-105"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 ${stat.color}`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
                    <div className="text-sm text-gray-400">{stat.label}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hero Image Placeholder (Animated) */}
        <div className="relative mt-20 mb-32">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 blur-3xl rounded-3xl" />
          <div className="relative rounded-3xl overflow-hidden border border-gray-700/50 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm">
            <div className="aspect-video flex items-center justify-center">
              <div className="text-center p-12">
                <div className="inline-flex p-8 rounded-3xl bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700/50 mb-6 animate-pulse">
                  <MapPinIcon className="h-16 w-16 text-cyan-400" />
                </div>
                <p className="text-gray-400">📸 Interactive Map Interface - Add Your Screenshot Here</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-6 pb-32">
        <div className="text-center mb-20">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 mb-6">
            <span className="text-sm font-medium bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              ✨ Premium Features
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-gray-200 to-gray-400 bg-clip-text text-transparent">
              Everything You Need
            </span>
            <span className="block text-gray-300">To Make an Impact</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Advanced tools powered by cutting-edge technology for modern community management
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative p-8 rounded-3xl bg-gradient-to-br from-gray-800/30 to-gray-900/30 backdrop-blur-sm border border-gray-700/30 hover:border-transparent transition-all duration-500 hover:scale-105 hover:shadow-2xl"
              style={{ animationDelay: `${feature.delay}ms` }}
            >
              {/* Animated border gradient */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-lg" />
              
              {/* Icon */}
              <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${feature.gradient} mb-6 group-hover:scale-110 transition-transform duration-500`}>
                <feature.icon className="h-8 w-8" />
              </div>

              <h3 className="text-2xl font-bold mb-4 group-hover:bg-gradient-to-r group-hover:from-cyan-400 group-hover:to-blue-400 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-500">
                {feature.title}
              </h3>
              <p className="text-gray-400 leading-relaxed mb-6">
                {feature.description}
              </p>
              
              <div className="flex items-center text-sm font-medium text-cyan-400 group-hover:text-cyan-300 transition-colors">
                Learn more
                <ArrowRightIcon className="h-4 w-4 ml-2 group-hover:translate-x-2 transition-transform duration-300" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Image Gallery Placeholder */}
      <div className="max-w-7xl mx-auto px-6 pb-32">
        <div className="rounded-3xl overflow-hidden border border-gray-700/50 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-0.5 p-0.5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="aspect-square bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="inline-flex p-6 rounded-2xl bg-gradient-to-br from-gray-700 to-gray-800 border border-gray-600/50 mb-4">
                    <div className="h-12 w-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg" />
                  </div>
                  <p className="text-gray-500">Image {i} Placeholder</p>
                  <p className="text-sm text-gray-600">Add your screenshot here</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10" />
        
        <div className="relative max-w-7xl mx-auto px-6 py-32">
          <div className="text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-8">
              <span className="block bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Ready to Transform
              </span>
              <span className="block text-gray-200">Your Community?</span>
            </h2>
            
            <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-12">
              Join thousands of proactive citizens who are already building better neighborhoods
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-6">
              <Link
                to="/home/reports"
                className="group px-12 py-6 text-lg font-semibold rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 transition-all duration-500 transform hover:-translate-y-1 hover:shadow-2xl hover:shadow-cyan-500/30"
              >
                <div className="flex items-center justify-center">
                  Start Free Trial
                  <ArrowUpRightIcon className="h-5 w-5 ml-3 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </div>
              </Link>
              
              <Link
                to="/home/dashboard"
                className="group px-12 py-6 text-lg font-semibold rounded-2xl bg-gray-800/50 border border-gray-700/50 hover:border-gray-600 hover:bg-gray-800 transition-all duration-500"
              >
                <div className="flex items-center justify-center">
                  Schedule Demo
                  <ArrowRightIcon className="h-5 w-5 ml-3 group-hover:translate-x-2 transition-transform" />
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-800/50 bg-gradient-to-b from-gray-900 to-gray-950">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid md:grid-cols-4 gap-12">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="h-10 w-10 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl" />
                <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  InfraWatch
                </span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Empowering communities through intelligent infrastructure monitoring and civic engagement.
              </p>
            </div>
            
            {['Product', 'Resources', 'Company', 'Legal'].map((section) => (
              <div key={section}>
                <h4 className="text-white font-semibold mb-6 text-lg">{section}</h4>
                <ul className="space-y-3">
                  {['Features', 'Pricing', 'Documentation', 'Support'].map((item) => (
                    <li key={item}>
                      <a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors duration-300">
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center">
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} InfraWatch. Building better communities, together.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}