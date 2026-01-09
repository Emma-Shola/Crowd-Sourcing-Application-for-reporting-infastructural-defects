// Report.jsx - Fixed for file uploads
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  CameraIcon,
  MapPinIcon,
  DocumentTextIcon,
  XMarkIcon,
  ArrowUpTrayIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from "@heroicons/react/24/solid";

export default function Report() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "normal",
    location: "",
  });

  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [locationLoading, setLocationLoading] = useState(false);

  // Get user location - optimized
  const getLocation = useCallback(() => {
    setLocationLoading(true);
    setError("");
    
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      setLocationLoading(false);
      return;
    }

    const timeoutId = setTimeout(() => {
      setError("Location request timed out. Please enter manually.");
      setLocationLoading(false);
    }, 10000);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        clearTimeout(timeoutId);
        const { latitude, longitude } = position.coords;
        
        // Get address from coordinates (optional)
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
          .then(res => res.json())
          .then(data => {
            const address = data.display_name || `Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`;
            setFormData(prev => ({
              ...prev,
              location: address
            }));
            setLocationLoading(false);
          })
          .catch(() => {
            setFormData(prev => ({
              ...prev,
              location: `Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`
            }));
            setLocationLoading(false);
          });
      },
      (err) => {
        clearTimeout(timeoutId);
        console.error("Geolocation error:", err);
        setError("Unable to get location. Please enter manually.");
        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 30000
      }
    );
  }, []);

  // Load location on component mount
  useEffect(() => {
    getLocation();
  }, [getLocation]);

  // Handle image upload
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.slice(0, 5 - imageFiles.length); // Max 5 images
    
    if (validFiles.length === 0) {
      setError("Maximum 5 images allowed");
      return;
    }

    // Validate file size (max 5MB each)
    const oversizedFiles = validFiles.filter(file => file.size > 5 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      setError("Some images exceed 5MB limit");
      return;
    }

    // Create previews
    const newPreviews = validFiles.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...newPreviews]);
    setImageFiles(prev => [...prev, ...validFiles]);
  };

  // Remove image
  const removeImage = (index) => {
    // Revoke object URL
    if (imagePreviews[index]) {
      URL.revokeObjectURL(imagePreviews[index]);
    }
    
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Handle form submission - FIXED for file uploads
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title.trim()) {
      setError("Please enter a title");
      return;
    }
    
    if (!formData.description.trim()) {
      setError("Please enter a description");
      return;
    }

    if (!formData.location.trim()) {
      setError("Please enter a location");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        setError("Authentication required. Please login again.");
        navigate("/login");
        return;
      }

      // Create FormData for file upload
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title.trim());
      formDataToSend.append("description", formData.description.trim());
      formDataToSend.append("type", formData.type);
      formDataToSend.append("location", formData.location.trim());

      // Append images if any
      imageFiles.forEach((file, index) => {
        formDataToSend.append("images", file); // Note: backend expects "images" (plural)
      });

      console.log("Sending FormData with:", {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        location: formData.location,
        imageCount: imageFiles.length
      });

      // Use fetch with FormData
      const response = await fetch("http://localhost:5000/api/defects", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
          // NOTE: Don't set Content-Type manually for FormData
          // Let the browser set it automatically with boundary
        },
        body: formDataToSend
      });

      const responseText = await response.text();
      console.log("Raw response:", responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("Failed to parse response:", parseError);
        throw new Error("Invalid server response");
      }

      if (!response.ok) {
        throw new Error(data.message || `Server error: ${response.status}`);
      }

      if (data.success) {
        setSuccess("Report submitted successfully!");
        
        // Clear form
        setFormData({
          title: "",
          description: "",
          type: "normal",
          location: "",
        });
        
        // Clear images
        imagePreviews.forEach(url => URL.revokeObjectURL(url));
        setImagePreviews([]);
        setImageFiles([]);
        
        // Redirect to dashboard after delay
        setTimeout(() => {
          navigate("/home/dashboard");
        }, 1500);
      } else {
        throw new Error(data.message || "Submission failed");
      }
    } catch (err) {
      console.error("Submission error:", err);
      setError(err.message || "Failed to submit report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      imagePreviews.forEach(url => URL.revokeObjectURL(url));
    };
  }, [imagePreviews]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black text-white">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-grid-small opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-blue-500/5 to-purple-500/5" />
      </div>

      {/* Main Content */}
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              Report Infrastructure Issue
            </span>
          </h1>
          <p className="text-gray-400">Submit details about infrastructure problems in your area</p>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-red-500/10 to-rose-500/10 border border-red-500/20 backdrop-blur-sm animate-fade-in">
            <div className="flex items-center space-x-3">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-400" />
              <span className="text-red-300">{error}</span>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 backdrop-blur-sm animate-fade-in">
            <div className="flex items-center space-x-3">
              <CheckCircleIcon className="h-6 w-6 text-emerald-400" />
              <span className="text-emerald-300">{success}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Issue Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Pothole on Main Street, Broken Streetlight"
              className="w-full px-4 py-3 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/30 transition-all duration-300"
              required
              maxLength={100}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Detailed Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Provide detailed information about the issue..."
              rows={4}
              className="w-full px-4 py-3 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/30 transition-all duration-300 resize-none"
              required
              maxLength={1000}
            />
          </div>

          {/* Issue Type */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Issue Type *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {["normal", "urgent", "hazardous", "recyclable"].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, type }))}
                  className={`px-4 py-3 rounded-xl border transition-all duration-300 capitalize ${
                    formData.type === type
                      ? type === "urgent"
                        ? "bg-red-500/20 border-red-500/50 text-red-400"
                        : type === "hazardous"
                        ? "bg-orange-500/20 border-orange-500/50 text-orange-400"
                        : type === "recyclable"
                        ? "bg-green-500/20 border-green-500/50 text-green-400"
                        : "bg-cyan-500/20 border-cyan-500/50 text-cyan-400"
                      : "bg-gray-800/30 border-gray-700/30 text-gray-400 hover:bg-gray-800/50"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <div className="flex items-center space-x-2">
                <MapPinIcon className="h-4 w-4" />
                <span>Location *</span>
              </div>
            </label>
            
            <div className="space-y-3">
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={getLocation}
                  disabled={locationLoading}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {locationLoading ? (
                    <span className="flex items-center space-x-2">
                      <ClockIcon className="h-4 w-4 animate-spin" />
                      <span>Getting Location...</span>
                    </span>
                  ) : (
                    "Use Current Location"
                  )}
                </button>
              </div>

              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Enter address or location description"
                className="w-full px-4 py-3 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/30 transition-all duration-300"
                required
              />
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <div className="flex items-center space-x-2">
                <CameraIcon className="h-4 w-4" />
                <span>Photos (Optional, max 5)</span>
              </div>
            </label>
            
            <div className="space-y-4">
              {/* Image Upload Button */}
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  disabled={imageFiles.length >= 5 || loading}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl transition-all duration-300 ${
                    imageFiles.length >= 5 || loading
                      ? "border-gray-700/30 bg-gray-800/20"
                      : "border-gray-600/50 bg-gray-800/30 hover:border-cyan-500/50 hover:bg-gray-800/50"
                  }`}
                >
                  <ArrowUpTrayIcon className="h-8 w-8 text-gray-500 mb-2" />
                  <span className="text-gray-400">
                    {imageFiles.length >= 5
                      ? "Maximum 5 images reached"
                      : "Click to upload images"}
                  </span>
                  <span className="text-xs text-gray-500 mt-1">
                    PNG, JPG, JPEG up to 5MB each
                  </span>
                </label>
              </div>

              {/* Image Previews */}
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 p-1 bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-6 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl font-semibold text-white hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <ClockIcon className="h-5 w-5 animate-spin" />
                  <span>Submitting Report...</span>
                </>
              ) : (
                <>
                  <DocumentTextIcon className="h-5 w-5" />
                  <span>Submit Report</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Back to Dashboard Link */}
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate("/home/dashboard")}
            className="text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}