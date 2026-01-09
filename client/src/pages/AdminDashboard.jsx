import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MagnifyingGlassIcon,
  ArrowLeftOnRectangleIcon,
  ChatBubbleLeftIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  UserCircleIcon,
  PhotoIcon,
  MapPinIcon,
  DocumentTextIcon,
  ArrowPathIcon,
  FunnelIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PaperAirplaneIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  UsersIcon,
  EyeIcon
} from "@heroicons/react/24/solid";
import {
  BellAlertIcon,
  CalendarDaysIcon
} from "@heroicons/react/24/outline";

export default function AdminDashboard() {
  const [defects, setDefects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  // search + pagination
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 6;
  const [totalPages, setTotalPages] = useState(1);

  // carousel + modals
  const [currentIndex, setCurrentIndex] = useState({});
  const [fullscreen, setFullscreen] = useState({ open: false, src: "" });
  const [descView, setDescView] = useState({ open: false, text: "", title: "" });

  // comment
  const [comment, setComment] = useState({});
  const [sendingComment, setSendingComment] = useState(null);

  // stats
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
    users: 0
  });

  // status filter
  const [statusFilter, setStatusFilter] = useState("all");

  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  // normalize images safely
  const normalizeImages = (d) => {
    if (Array.isArray(d.images)) {
      return d.images.map(p =>
        p.startsWith("http") ? p : `http://localhost:5000${p}`
      );
    }

    if (d.imageUrl) {
      if (Array.isArray(d.imageUrl)) {
        return d.imageUrl.map(p =>
          p.startsWith("http") ? p : `http://localhost:5000${p}`
        );
      }

      if (typeof d.imageUrl === "string") {
        return [
          d.imageUrl.startsWith("http")
            ? d.imageUrl
            : `http://localhost:5000${d.imageUrl}`,
        ];
      }
    }

    return [];
  };

  // load data
  const loadReports = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const res = await fetch(
        `http://localhost:5000/api/defects?page=${page}&limit=${limit}&search=${search}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();

      if (data.success) {
        setDefects(Array.isArray(data.data) ? data.data : []);
        setTotalPages(data.totalPages || 1);
        
        // Calculate stats
        const total = data.totalItems || data.data.length;
        const pending = data.data.filter(d => d.status === "pending").length;
        const inProgress = data.data.filter(d => d.status === "in_progress").length;
        const resolved = data.data.filter(d => d.status === "resolved").length;
        
        // Count unique users
        const userEmails = new Set(data.data.map(d => d.reportedBy?.email).filter(Boolean));
        
        setStats({
          total,
          pending,
          inProgress,
          resolved,
          users: userEmails.size
        });
      } else {
        setError(data.message || "Failed to load reports");
      }
    } catch {
      setError("Failed to load reports");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const delay = setTimeout(loadReports, 300);
    return () => clearTimeout(delay);
  }, [page, search]);

  // Filter defects by status
  const filteredDefects = defects.filter(d => 
    statusFilter === "all" || d.status === statusFilter
  );

  // update status
  const changeStatus = async (id, status) => {
    try {
      setSaving(id);
      const token = localStorage.getItem("token");

      const res = await fetch(
        `http://localhost:5000/api/defects/${id}/status`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Update failed");

      // Update local state immediately for better UX
      setDefects(prev => prev.map(d => 
        d._id === id ? { ...d, status } : d
      ));

      // Refresh stats
      setTimeout(loadReports, 100);
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(null);
    }
  };

  // send comment to user
  const sendComment = async (id) => {
    try {
      if (!comment[id]?.trim()) {
        alert("Please write a message first");
        return;
      }

      setSendingComment(id);
      const token = localStorage.getItem("token");

      const res = await fetch(
        `http://localhost:5000/api/defects/${id}/comment`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message: comment[id] }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send");

      // Clear comment and show success
      setComment(p => ({ ...p, [id]: "" }));
      
      // Show temporary success message
      const successMsg = document.createElement("div");
      successMsg.className = "fixed top-4 right-4 px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white z-50 animate-fade-in";
      successMsg.textContent = "Message sent successfully!";
      document.body.appendChild(successMsg);
      
      setTimeout(() => {
        successMsg.classList.add("animate-fade-out");
        setTimeout(() => successMsg.remove(), 300);
      }, 2000);

      // Refresh to show new comment
      setTimeout(loadReports, 500);
    } catch (err) {
      alert(err.message);
    } finally {
      setSendingComment(null);
    }
  };

  // carousel controls
  const next = (id, imgs) => {
    setCurrentIndex(p => ({ ...p, [id]: ((p[id] || 0) + 1) % imgs.length }));
  };

  const prev = (id, imgs) => {
    setCurrentIndex(p => ({
      ...p,
      [id]: (p[id] || 0) === 0 ? imgs.length - 1 : p[id] - 1,
    }));
  };

  // Get status color
  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'verified': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'in_progress': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'resolved': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'rejected': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  // Get type color
  const getTypeColor = (type) => {
    switch(type) {
      case 'urgent': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'hazardous': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'recyclable': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
    }
  };

  // Get status options
  const statusOptions = [
    { value: "pending", label: "Pending", color: "text-yellow-400" },
    { value: "verified", label: "Verified", color: "text-blue-400" },
    { value: "in_progress", label: "In Progress", color: "text-purple-400" },
    { value: "resolved", label: "Resolved", color: "text-emerald-400" },
    { value: "rejected", label: "Rejected", color: "text-red-400" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black text-white">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-grid-small opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-blue-500/5 to-purple-500/5" />
      </div>

      {/* Main Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500">
                <ShieldCheckIcon className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold">
                  <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Admin Dashboard
                  </span>
                </h1>
                <p className="text-gray-400">Manage reports and communicate with users</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => {
                setRefreshing(true);
                loadReports();
              }}
              disabled={refreshing}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gray-800/50 border border-gray-700/50 hover:border-gray-600 hover:bg-gray-800 transition-all duration-300"
            >
              <ArrowPathIcon className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
            </button>
            
            <button
              onClick={logout}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-500/20 to-rose-500/20 border border-red-500/30 text-red-400 hover:from-red-500/30 hover:to-rose-500/30 hover:border-red-500/50 transition-all duration-300"
            >
              <ArrowLeftOnRectangleIcon className="h-5 w-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          {[
            { label: "Total Reports", value: stats.total, icon: DocumentTextIcon, color: "from-cyan-500 to-blue-500" },
            { label: "Pending", value: stats.pending, icon: ClockIcon, color: "from-yellow-500 to-amber-500" },
            { label: "In Progress", value: stats.inProgress, icon: ChartBarIcon, color: "from-purple-500 to-pink-500" },
            { label: "Resolved", value: stats.resolved, icon: CheckCircleIcon, color: "from-emerald-500 to-teal-500" },
            { label: "Active Users", value: stats.users, icon: UsersIcon, color: "from-indigo-500 to-blue-500" },
          ].map((stat, idx) => (
            <div
              key={idx}
              className="group bg-gradient-to-br from-gray-800/30 to-gray-900/30 backdrop-blur-sm border border-gray-700/30 rounded-2xl p-6 hover:border-gray-600/50 transition-all duration-500 hover:-translate-y-1"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <span className="text-2xl font-bold">{stat.value}</span>
              </div>
              <h3 className="text-gray-400 text-sm">{stat.label}</h3>
            </div>
          ))}
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-6">
          {/* Search Bar */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search reports by title, description, user email, or location..."
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
              className="w-full pl-12 pr-4 py-4 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/30 transition-all duration-300"
            />
          </div>

          {/* Status Filters */}
          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-400 mb-2">
              <FunnelIcon className="h-4 w-4" />
              <span>Filter by Status</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {["all", "pending", "verified", "in_progress", "resolved", "rejected"].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-2 rounded-xl border transition-all duration-300 capitalize ${
                    statusFilter === status
                      ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-400"
                      : "bg-gray-800/30 border-gray-700/30 text-gray-400 hover:bg-gray-800/50 hover:border-gray-600"
                  }`}
                >
                  {status === "all" ? "All Status" : status.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 p-4 rounded-2xl bg-gradient-to-r from-red-500/10 to-rose-500/10 border border-red-500/20 backdrop-blur-sm animate-fade-in">
            <div className="flex items-center space-x-3">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-400" />
              <span className="text-red-300">{error}</span>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-solid border-cyan-500 border-r-transparent mb-4" />
            <p className="text-gray-400">Loading reports...</p>
          </div>
        ) : filteredDefects.length === 0 ? (
          <div className="text-center py-20 animate-fade-in">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700/50 mb-6">
              <DocumentTextIcon className="h-12 w-12 text-gray-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-300 mb-2">No reports found</h3>
            <p className="text-gray-500">
              {search || statusFilter !== "all"
                ? "Try adjusting your search or filters"
                : "No reports have been submitted yet"}
            </p>
          </div>
        ) : (
          <>
            {/* Reports Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
              {filteredDefects.map((d) => {
                const imgs = normalizeImages(d);
                const idx = currentIndex[d._id] || 0;

                return (
                  <div
                    key={d._id}
                    className="group bg-gradient-to-br from-gray-800/30 to-gray-900/30 backdrop-blur-sm border border-gray-700/30 rounded-2xl overflow-hidden hover:border-gray-600/50 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
                  >
                    {/* Image Carousel */}
                    {imgs.length > 0 ? (
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={imgs[idx]}
                          alt={d.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          onClick={() => setFullscreen({ open: true, src: imgs[idx] })}
                        />
                        
                        {/* Image Count */}
                        {imgs.length > 1 && (
                          <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-black/60 backdrop-blur-sm text-xs">
                            {idx + 1}/{imgs.length}
                          </div>
                        )}

                        {/* Carousel Controls */}
                        {imgs.length > 1 && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                prev(d._id, imgs);
                              }}
                              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 backdrop-blur-sm hover:bg-black/80 transition-colors"
                            >
                              <ChevronLeftIcon className="h-5 w-5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                next(d._id, imgs);
                              }}
                              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 backdrop-blur-sm hover:bg-black/80 transition-colors"
                            >
                              <ChevronRightIcon className="h-5 w-5" />
                            </button>
                          </>
                        )}
                      </div>
                    ) : (
                      <div className="relative h-48 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                        <PhotoIcon className="h-12 w-12 text-gray-600" />
                      </div>
                    )}

                    {/* Card Content */}
                    <div className="p-6">
                      {/* Title and Date */}
                      <div className="flex items-start justify-between mb-3">
                        <h3 
                          className="text-lg font-semibold text-white cursor-pointer hover:text-cyan-400 transition-colors line-clamp-1"
                          onClick={() => setDescView({ 
                            open: true, 
                            text: d.description, 
                            title: d.title 
                          })}
                        >
                          {d.title}
                        </h3>
                        <span className="text-xs text-gray-500 whitespace-nowrap">
                          {new Date(d.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      {/* Description Preview */}
                      <p 
                        className="text-gray-400 text-sm mb-4 line-clamp-2 cursor-pointer hover:text-gray-300 transition-colors"
                        onClick={() => setDescView({ 
                          open: true, 
                          text: d.description, 
                          title: d.title 
                        })}
                      >
                        {d.description}
                      </p>

                      {/* User and Location */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-sm text-gray-500">
                          <UserCircleIcon className="h-4 w-4 mr-2" />
                          <span className="line-clamp-1">{d.reportedBy?.email || "Unknown User"}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <MapPinIcon className="h-4 w-4 mr-2" />
                          <span className="line-clamp-1">{d.location?.text || "No location"}</span>
                        </div>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mb-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(d.type)}`}>
                          {d.type}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(d.status)}`}>
                          {d.status.replace("_", " ")}
                        </span>
                      </div>

                      {/* Status Update */}
                      <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                          Update Status
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {statusOptions.map((option) => (
                            <button
                              key={option.value}
                              onClick={() => changeStatus(d._id, option.value)}
                              disabled={saving === d._id || d.status === option.value}
                              className={`px-3 py-1.5 rounded-lg border transition-all duration-300 text-sm ${
                                d.status === option.value
                                  ? `${getStatusColor(option.value)} cursor-default`
                                  : "bg-gray-800/30 border-gray-700/30 text-gray-400 hover:bg-gray-800/50 hover:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                              }`}
                            >
                              {saving === d._id && d.status === option.value ? (
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent mx-auto" />
                              ) : (
                                option.label
                              )}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Comment Section */}
                      <div className="border-t border-gray-800/50 pt-6">
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                          Send Message to User
                        </label>
                        <div className="space-y-3">
                          <textarea
                            placeholder="Type your message here..."
                            value={comment[d._id] || ""}
                            onChange={(e) =>
                              setComment(p => ({ ...p, [d._id]: e.target.value }))
                            }
                            rows="2"
                            className="w-full px-4 py-3 bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all duration-300 resize-none"
                          />
                          <button
                            onClick={() => sendComment(d._id)}
                            disabled={sendingComment === d._id || !comment[d._id]?.trim()}
                            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center space-x-2"
                          >
                            {sendingComment === d._id ? (
                              <>
                                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                <span>Sending...</span>
                              </>
                            ) : (
                              <>
                                <PaperAirplaneIcon className="h-5 w-5" />
                                <span>Send Message</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-xl border border-gray-700/50 bg-gray-800/30 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-800/50 transition-colors"
                >
                  <ChevronLeftIcon className="h-5 w-5" />
                </button>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`px-4 py-2 rounded-xl border transition-all duration-300 ${
                        page === pageNum
                          ? "bg-gradient-to-r from-cyan-500 to-blue-500 border-transparent text-white"
                          : "border-gray-700/50 bg-gray-800/30 text-gray-400 hover:bg-gray-800/50"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 rounded-xl border border-gray-700/50 bg-gray-800/30 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-800/50 transition-colors"
                >
                  <ChevronRightIcon className="h-5 w-5" />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      {/* Fullscreen Image Modal */}
      {fullscreen.open && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setFullscreen({ open: false, src: "" })}
        >
          <button 
            className="absolute top-4 right-4 p-2 rounded-full bg-gray-800/50 hover:bg-gray-800 transition-colors"
            onClick={() => setFullscreen({ open: false, src: "" })}
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
          <img 
            src={fullscreen.src} 
            alt="Fullscreen view" 
            className="max-w-full max-h-full rounded-lg shadow-2xl"
          />
        </div>
      )}

      {/* Description Modal */}
      {descView.open && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setDescView({ open: false, text: "", title: "" })}
        >
          <div 
            className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800/50 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-800/50">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">{descView.title}</h3>
                <button 
                  onClick={() => setDescView({ open: false, text: "", title: "" })}
                  className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <p className="text-gray-300 whitespace-pre-wrap">{descView.text}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}