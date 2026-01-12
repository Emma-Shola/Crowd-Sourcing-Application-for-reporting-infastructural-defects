// Dashboard.jsx - With Delete and Update functionality
import { useEffect, useState, useCallback, useMemo, memo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  MagnifyingGlassIcon, 
  FunnelIcon,
  PhotoIcon,
  MapPinIcon,
  ChatBubbleLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
  ClockIcon,
  UserCircleIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowUpTrayIcon,
  HomeIcon,
  TrashIcon,
  PencilSquareIcon // Added for update
} from "@heroicons/react/24/solid";
import {
  DocumentTextIcon,
  CalendarDaysIcon,
  ArrowTrendingUpIcon
} from "@heroicons/react/24/outline";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// Memoized components for better performance
const StatusFilterButton = memo(({ status, isActive, onClick }) => {
  const getStatusLabel = (status) => {
    return status === "all" ? "All Status" : status.replace("_", " ");
  };

  return (
    <button
      onClick={() => onClick(status)}
      className={`px-4 py-2 rounded-xl border transition-all duration-300 capitalize ${
        isActive
          ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-400"
          : "bg-gray-800/30 border-gray-700/30 text-gray-400 hover:bg-gray-800/50 hover:border-gray-600"
      }`}
    >
      {getStatusLabel(status)}
    </button>
  );
});

StatusFilterButton.displayName = 'StatusFilterButton';

const TypeFilterButton = memo(({ type, isActive, onClick }) => {
  return (
    <button
      onClick={() => onClick(type)}
      className={`px-4 py-2 rounded-xl border transition-all duration-300 capitalize ${
        isActive
          ? "bg-purple-500/20 border-purple-500/50 text-purple-400"
          : "bg-gray-800/30 border-gray-700/30 text-gray-400 hover:bg-gray-800/50 hover:border-gray-600"
      }`}
    >
      {type === "all" ? "All Types" : type}
    </button>
  );
});

TypeFilterButton.displayName = 'TypeFilterButton';

const StatCard = memo(({ label, value, icon: Icon, color }) => {
  return (
    <div className="group bg-gradient-to-br from-gray-800/30 to-gray-900/30 backdrop-blur-sm border border-gray-700/30 rounded-2xl p-6 hover:border-gray-600/50 transition-all duration-500 hover:-translate-y-1">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl bg-gradient-to-r ${color}`}>
          <Icon className="h-6 w-6" />
        </div>
        <span className="text-2xl font-bold">{value}</span>
      </div>
      <h3 className="text-gray-400 text-sm">{label}</h3>
    </div>
  );
});

StatCard.displayName = 'StatCard';

export default function Dashboard() {
  const [defects, setDefects] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 6;
  const [totalPages, setTotalPages] = useState(1);

  const [currentIndex, setCurrentIndex] = useState({});
  const [fullscreen, setFullscreen] = useState({ open: false, src: "" });
  const [descView, setDescView] = useState({ open: false, text: "", title: "" });
  const [commentView, setCommentView] = useState({
    open: false,
    text: "",
    defectId: null,
    defectTitle: "",
    adminName: "",
    date: ""
  });

  // NEW: State for update modal
  const [updateModal, setUpdateModal] = useState({
    open: false,
    defectId: null,
    title: "",
    description: "",
    type: "normal",
    location: ""
  });

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0
  });

  const navigate = useNavigate(); // For navigation

  // Memoize expensive calculations
  const normalizeImages = useCallback((d) => {
    try {
      if (Array.isArray(d.images)) {
        return d.images.map(p => 
          p && typeof p === "string"
            ? p.startsWith("http") ? p : `${API_BASE_URL}${p}`
            : ""
        ).filter(Boolean);
      }

      if (d.imageUrl) {
        if (Array.isArray(d.imageUrl)) {
          return d.imageUrl.map(p =>
            p && typeof p === "string"
              ? p.startsWith("http") ? p : `${API_BASE_URL}${p}`
              : ""
          ).filter(Boolean);
        }

        if (typeof d.imageUrl === "string" && d.imageUrl.trim()) {
          const url = d.imageUrl.startsWith("http") 
            ? d.imageUrl 
            : `${API_BASE_URL}${d.imageUrl}`;
          return [url];
        }
      }

      return [];
    } catch (err) {
      console.error("Error normalizing images:", err);
      return [];
    }
  }, [API_BASE_URL]);

  // Load reports with useCallback
  const loadReports = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Authentication required. Please login again.");
        return;
      }

      const res = await fetch(
        `${API_BASE_URL}/api/defects?page=${page}&limit=${limit}&search=${search}`,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Cache-Control': 'no-cache'
          }
        }
      );

      if (!res.ok) {
        throw new Error(`Failed to load: ${res.status}`);
      }

      const data = await res.json();

      if (data.success) {
        setDefects(Array.isArray(data.data) ? data.data : []);
        setTotalPages(data.totalPages || 1);
        
        // Calculate stats
        const total = data.totalItems || data.data.length;
        const pending = data.data.filter(d => d.status === "pending").length;
        const inProgress = data.data.filter(d => d.status === "in_progress").length;
        const resolved = data.data.filter(d => d.status === "resolved").length;
        
        setStats({ total, pending, inProgress, resolved });
      } else {
        setError(data.message || "Failed to load reports");
      }
    } catch (err) {
      console.error("Load error:", err);
      setError(err.message || "Failed to load reports");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [API_BASE_URL, page, search]);

  useEffect(() => {
    const delay = setTimeout(loadReports, 300);
    return () => clearTimeout(delay);
  }, [loadReports]);

  // NEW: Delete defect function
  const handleDeleteDefect = useCallback(async (defectId) => {
    if (!window.confirm("Are you sure you want to delete this report? This action cannot be undone.")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/defects/${defectId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        // Remove the deleted defect from state
        setDefects(prevDefects => prevDefects.filter(defect => defect._id !== defectId));
        
        // Update stats
        setStats(prevStats => ({
          ...prevStats,
          total: prevStats.total - 1
        }));
        
        // Show success message
        alert("Report deleted successfully!");
      } else {
        alert(data.message || "Failed to delete report");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Error deleting report. Please try again.");
    }
  }, [API_BASE_URL]);

  // NEW: Open update modal
  const handleOpenUpdateModal = useCallback((defect) => {
    setUpdateModal({
      open: true,
      defectId: defect._id,
      title: defect.title,
      description: defect.description,
      type: defect.type || "normal",
      location: defect.location?.text || ""
    });
  }, []);

  // NEW: Handle update submission
  const handleUpdateDefect = useCallback(async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/defects/${updateModal.defectId}`, {
        method: "PUT",
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: updateModal.title,
          description: updateModal.description,
          type: updateModal.type,
          location: updateModal.location
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Update the defect in state
        setDefects(prevDefects => 
          prevDefects.map(defect => 
            defect._id === updateModal.defectId 
              ? { ...defect, ...data.data }
              : defect
          )
        );
        
        // Close modal
        setUpdateModal({
          open: false,
          defectId: null,
          title: "",
          description: "",
          type: "normal",
          location: ""
        });
        
        // Show success message
        alert("Report updated successfully!");
      } else {
        alert(data.message || "Failed to update report");
      }
    } catch (error) {
      console.error("Update error:", error);
      alert("Error updating report. Please try again.");
    }
  }, [API_BASE_URL, updateModal]);

  // Memoized filtered defects
  const filtered = useMemo(() => {
    return defects.filter(
      (d) =>
        (statusFilter === "all" || d.status === statusFilter) &&
        (typeFilter === "all" || d.type === typeFilter)
    );
  }, [defects, statusFilter, typeFilter]);

  // Memoized carousel controls
  const next = useCallback((id, imgs) => {
    setCurrentIndex(p => ({ 
      ...p, 
      [id]: ((p[id] || 0) + 1) % imgs.length 
    }));
  }, []);

  const prev = useCallback((id, imgs) => {
    setCurrentIndex(p => ({
      ...p,
      [id]: (p[id] || 0) === 0 ? imgs.length - 1 : p[id] - 1,
    }));
  }, []);

  // Memoized auto slide
  useEffect(() => {
    const t = setInterval(() => {
      setCurrentIndex(prev => {
        const updated = { ...prev };
        filtered.forEach(d => {
          const imgs = normalizeImages(d);
          if (imgs.length > 1) {
            updated[d._id] = ((prev[d._id] || 0) + 1) % imgs.length;
          }
        });
        return updated;
      });
    }, 5000);

    return () => clearInterval(t);
  }, [filtered, normalizeImages]);

  // Memoized mark as read
  const markAsRead = useCallback(async (id) => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`${API_BASE_URL}/api/defects/${id}/read-comments`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  }, [API_BASE_URL]);

  // Memoized getStatusColor
  const getStatusColor = useCallback((status) => {
    switch(status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'verified': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'in_progress': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'resolved': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'rejected': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  }, []);

  // Memoized getTypeColor
  const getTypeColor = useCallback((type) => {
    switch(type) {
      case 'urgent': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'hazardous': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'recyclable': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
    }
  }, []);

  // Memoized getStatusIcon
  const getStatusIcon = useCallback((status) => {
    switch(status) {
      case 'pending': return '⏳';
      case 'verified': return '✅';
      case 'in_progress': return '🛠️';
      case 'resolved': return '🎉';
      case 'rejected': return '❌';
      default: return '📋';
    }
  }, []);

  // Memoized status filters
  const statusFilters = useMemo(() => 
    ["all", "pending", "verified", "in_progress", "resolved", "rejected"], 
    []
  );

  const typeFilters = useMemo(() => 
    ["all", "normal", "urgent", "hazardous", "recyclable"], 
    []
  );

  const statsData = useMemo(() => [
    { label: "Total Reports", value: stats.total, icon: DocumentTextIcon, color: "from-cyan-500 to-blue-500" },
    { label: "Pending", value: stats.pending, icon: ClockIcon, color: "from-yellow-500 to-amber-500" },
    { label: "In Progress", value: stats.inProgress, icon: ArrowTrendingUpIcon, color: "from-purple-500 to-pink-500" },
    { label: "Resolved", value: stats.resolved, icon: CheckCircleIcon, color: "from-emerald-500 to-teal-500" },
  ], [stats]);

  // Optimized pagination
  const paginationButtons = useMemo(() => {
    const buttons = [];
    const maxButtons = 5;
    
    if (totalPages <= maxButtons) {
      for (let i = 1; i <= totalPages; i++) {
        buttons.push(i);
      }
    } else {
      let start = Math.max(1, page - 2);
      let end = Math.min(totalPages, page + 2);
      
      if (page <= 3) {
        end = maxButtons;
      } else if (page >= totalPages - 2) {
        start = totalPages - maxButtons + 1;
      }
      
      for (let i = start; i <= end; i++) {
        buttons.push(i);
      }
    }
    
    return buttons;
  }, [totalPages, page]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black text-white">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-grid-small opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-blue-500/5 to-purple-500/5" />
      </div>

      {/* Main Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Home Button */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                My Reports
              </span>
            </h1>
            <p className="text-gray-400">Track and manage your infrastructure reports</p>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Home Button in Header */}
            <Link
              to="/home"
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30 hover:border-emerald-500/50 hover:text-emerald-300 transition-all duration-300 group"
            >
              <HomeIcon className="h-5 w-5 group-hover:scale-110 transition-transform" />
              <span>Go to Home</span>
            </Link>
            
            {/* Refresh Button */}
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
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsData.map((stat, idx) => (
            <StatCard key={idx} {...stat} />
          ))}
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-6">
          {/* Search Bar */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search reports by title, description, type, or location..."
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
              className="w-full pl-12 pr-4 py-4 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/30 transition-all duration-300"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-400 mb-2">
                <FunnelIcon className="h-4 w-4" />
                <span>Status Filter</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {statusFilters.map((status) => (
                  <StatusFilterButton
                    key={status}
                    status={status}
                    isActive={statusFilter === status}
                    onClick={setStatusFilter}
                  />
                ))}
              </div>
            </div>

            <div className="flex-1">
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-400 mb-2">
                <FunnelIcon className="h-4 w-4" />
                <span>Type Filter</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {typeFilters.map((type) => (
                  <TypeFilterButton
                    key={type}
                    type={type}
                    isActive={typeFilter === type}
                    onClick={setTypeFilter}
                  />
                ))}
              </div>
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
            <p className="text-gray-400">Loading your reports...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 animate-fade-in">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700/50 mb-6">
              <DocumentTextIcon className="h-12 w-12 text-gray-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-300 mb-2">No reports found</h3>
            <p className="text-gray-500 mb-6">
              {search || statusFilter !== "all" || typeFilter !== "all"
                ? "Try adjusting your search or filters"
                : "You haven't submitted any reports yet"}
            </p>
            {(!search && statusFilter === "all" && typeFilter === "all") && (
              <Link
                to="/home/reports"
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl font-semibold hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 inline-block"
              >
                Submit Your First Report
              </Link>
            )}
          </div>
        ) : (
          <>
            {/* Reports Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {filtered.map((d) => {
                const imgs = normalizeImages(d);
                const idx = currentIndex[d._id] || 0;
                const hasNewComment = d.adminComments?.some(c => !c.read) || 
                                     d.notifications?.some(n => !n.read);
                const isOwnerOrAdmin = true; // You can add user role check here

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

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(d.type)}`}>
                          {getStatusIcon(d.type)} {d.type}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(d.status)}`}>
                          {getStatusIcon(d.status)} {d.status.replace("_", " ")}
                        </span>
                      </div>

                      {/* Location */}
                      <div className="flex items-center text-sm text-gray-500 mb-4">
                        <MapPinIcon className="h-4 w-4 mr-2" />
                        <span className="line-clamp-1">{d.location?.text || "No location"}</span>
                      </div>

                      {/* Action Buttons */}
                      <div className="space-y-3">
                        {/* Admin Comments Button */}
                        {d.adminComments?.length > 0 && (
                          <button
                            onClick={() => {
                              const latestComment = d.adminComments[d.adminComments.length - 1];
                              setCommentView({
                                open: true,
                                text: latestComment.message,
                                defectId: d._id,
                                defectTitle: d.title,
                                adminName: latestComment.admin?.name || "Admin",
                                date: new Date(latestComment.createdAt).toLocaleDateString()
                              });
                              markAsRead(d._id);
                            }}
                            className={`w-full py-3 rounded-xl border transition-all duration-300 flex items-center justify-center space-x-2 ${
                              hasNewComment
                                ? "bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20"
                                : "bg-gray-800/30 border-gray-700/30 text-gray-400 hover:bg-gray-800/50"
                            }`}
                          >
                            <ChatBubbleLeftIcon className="h-5 w-5" />
                            <span>View Admin Response</span>
                            {hasNewComment && (
                              <span className="h-2 w-2 rounded-full bg-cyan-500 animate-pulse" />
                            )}
                          </button>
                        )}

                        {/* Update and Delete Buttons */}
                        {isOwnerOrAdmin && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleOpenUpdateModal(d)}
                              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 transition-all duration-300 flex items-center justify-center space-x-2"
                            >
                              <PencilSquareIcon className="h-5 w-5" />
                              <span>Update</span>
                            </button>
                            
                            <button
                              onClick={() => handleDeleteDefect(d._id)}
                              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-red-500/10 to-rose-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-all duration-300 flex items-center justify-center space-x-2"
                            >
                              <TrashIcon className="h-5 w-5" />
                              <span>Delete</span>
                            </button>
                          </div>
                        )}
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
                
                {paginationButtons.map((pageNum) => (
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
                ))}
                
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

      {/* Floating Home Button (Always Visible) */}
      <Link
        to="/home"
        className="fixed bottom-8 right-8 z-50 flex items-center space-x-2 px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold shadow-2xl shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:-translate-y-1 transition-all duration-300 group animate-fade-in"
      >
        <HomeIcon className="h-5 w-5 group-hover:scale-110 transition-transform" />
        <span>Go to Home</span>
      </Link>

      {/* Modals */}
      {/* Fullscreen Image Modal */}
      {fullscreen.open && (
        <div 
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
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
          className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
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

      {/* Admin Comment Modal */}
      {commentView.open && (
        <div 
          className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setCommentView({ open: false, text: "", defectId: null, defectTitle: "", adminName: "", date: "" })}
        >
          <div 
            className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800/50 rounded-2xl max-w-lg w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-800/50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white">Admin Response</h3>
                  <p className="text-sm text-gray-400 mt-1">{commentView.defectTitle}</p>
                </div>
                <button 
                  onClick={() => setCommentView({ open: false, text: "", defectId: null, defectTitle: "", adminName: "", date: "" })}
                  className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="flex items-start space-x-4 mb-6">
                <div className="p-3 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30">
                  <UserCircleIcon className="h-8 w-8 text-cyan-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-white">{commentView.adminName}</h4>
                  <p className="text-sm text-gray-400">{commentView.date}</p>
                </div>
              </div>
              
              <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/50">
                <p className="text-gray-300 whitespace-pre-wrap">{commentView.text}</p>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setCommentView({ open: false, text: "", defectId: null, defectTitle: "", adminName: "", date: "" })}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-gray-800 to-gray-900 border border-gray-700 hover:border-gray-600 transition-all duration-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Update Report Modal */}
      {updateModal.open && (
        <div 
          className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setUpdateModal({ open: false, defectId: null, title: "", description: "", type: "normal", location: "" })}
        >
          <div 
            className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800/50 rounded-2xl max-w-lg w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-800/50">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Update Report</h3>
                <button 
                  onClick={() => setUpdateModal({ open: false, defectId: null, title: "", description: "", type: "normal", location: "" })}
                  className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <form onSubmit={handleUpdateDefect} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={updateModal.title}
                    onChange={(e) => setUpdateModal(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/30 transition-all duration-300"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Description
                  </label>
                  <textarea
                    value={updateModal.description}
                    onChange={(e) => setUpdateModal(prev => ({ ...prev, description: e.target.value }))}
                    rows="4"
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/30 transition-all duration-300"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Type
                  </label>
                  <select
                    value={updateModal.type}
                    onChange={(e) => setUpdateModal(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/30 transition-all duration-300"
                  >
                    <option value="normal">Normal</option>
                    <option value="urgent">Urgent</option>
                    <option value="hazardous">Hazardous</option>
                    <option value="recyclable">Recyclable</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={updateModal.location}
                    onChange={(e) => setUpdateModal(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/30 transition-all duration-300"
                    placeholder="Enter location"
                  />
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setUpdateModal({ open: false, defectId: null, title: "", description: "", type: "normal", location: "" })}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-gray-800 to-gray-900 border border-gray-700 hover:border-gray-600 transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold hover:from-blue-600 hover:to-indigo-600 transition-all duration-300"
                >
                  Update Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}