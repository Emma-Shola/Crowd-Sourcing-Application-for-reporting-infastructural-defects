// Report.jsx - FIXED (safe fetch + proper error handling)
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

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

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

  /* ===================== LOCATION ===================== */
  const getLocation = useCallback(() => {
    setLocationLoading(true);
    setError("");

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      setLocationLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await res.json();
          setFormData((prev) => ({
            ...prev,
            location:
              data.display_name ||
              `Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`,
          }));
        } catch {
          setFormData((prev) => ({
            ...prev,
            location: `Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`,
          }));
        } finally {
          setLocationLoading(false);
        }
      },
      () => {
        setError("Unable to get location. Please enter manually.");
        setLocationLoading(false);
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  }, []);

  useEffect(() => {
    getLocation();
  }, [getLocation]);

  /* ===================== IMAGES ===================== */
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const allowed = files.slice(0, 5 - imageFiles.length);

    if (!allowed.length) {
      setError("Maximum 5 images allowed");
      return;
    }

    for (const file of allowed) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Each image must be under 5MB");
        return;
      }
    }

    setImageFiles((prev) => [...prev, ...allowed]);
    setImagePreviews((prev) => [
      ...prev,
      ...allowed.map((f) => URL.createObjectURL(f)),
    ]);
  };

  const removeImage = (index) => {
    URL.revokeObjectURL(imagePreviews[index]);
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  /* ===================== SUBMIT ===================== */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.title || !formData.description || !formData.location) {
      setError("All required fields must be filled");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    setLoading(true);

    try {
      const fd = new FormData();
      fd.append("title", formData.title.trim());
      fd.append("description", formData.description.trim());
      fd.append("type", formData.type);
      fd.append("location", formData.location.trim());
      imageFiles.forEach((f) => fd.append("images", f));

      const response = await fetch(`${API_BASE_URL}/api/defects`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: fd,
      });

      const contentType = response.headers.get("content-type");
      let data;

      if (contentType?.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        console.error("Non-JSON response:", text);
        throw new Error("Server error. Please try again.");
      }

      if (response.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || `Server error (${response.status})`);
      }

      setSuccess("Report submitted successfully!");
      setFormData({
        title: "",
        description: "",
        type: "normal",
        location: "",
      });

      imagePreviews.forEach(URL.revokeObjectURL);
      setImageFiles([]);
      setImagePreviews([]);

      setTimeout(() => navigate("/home/dashboard"), 1200);
    } catch (err) {
      console.error("Submission error:", err);
      setError(err.message || "Submission failed");
    } finally {
      setLoading(false);
    }
  };

  /* ===================== CHANGE ===================== */
  const handleChange = (e) =>
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));

  useEffect(() => {
    return () => imagePreviews.forEach(URL.revokeObjectURL);
  }, [imagePreviews]);

  /* ===================== UI ===================== */
  return (
    <div className="min-h-screen bg-black text-white px-4 py-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Report Infrastructure Issue</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg flex items-center gap-2">
          <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-500/20 border border-green-500 rounded-lg flex items-center gap-2">
          <CheckCircleIcon className="h-5 w-5 text-green-400" />
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <input
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Issue title"
          className="w-full p-3 bg-gray-800 rounded-lg"
        />

        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Detailed description"
          rows={4}
          className="w-full p-3 bg-gray-800 rounded-lg"
        />

        <input
          name="location"
          value={formData.location}
          onChange={handleChange}
          placeholder="Location"
          className="w-full p-3 bg-gray-800 rounded-lg"
        />

        <input type="file" multiple accept="image/*" onChange={handleImageUpload} />

        {imagePreviews.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {imagePreviews.map((src, i) => (
              <div key={i} className="relative">
                <img src={src} className="rounded" />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute top-1 right-1 bg-red-500 p-1 rounded"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        <button
          disabled={loading}
          className="w-full p-4 bg-cyan-600 rounded-lg font-semibold"
        >
          {loading ? "Submitting..." : "Submit Report"}
        </button>
      </form>
    </div>
  );
}

console.log("ENV:", import.meta.env);
console.log("API BASE:", API_BASE_URL);
