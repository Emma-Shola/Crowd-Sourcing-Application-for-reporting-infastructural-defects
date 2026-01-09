import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

import { 
  LockClosedIcon, 
  EnvelopeIcon, 
  EyeIcon,
  EyeSlashIcon,
  ArrowRightIcon,
  ShieldCheckIcon,
  SparklesIcon,
} from "@heroicons/react/24/solid";
import { 
  KeyIcon,
  BuildingLibraryIcon
} from "@heroicons/react/24/outline";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [animateSuccess, setAnimateSuccess] = useState(false);
  const [particles, setParticles] = useState([]);

  // Create floating particles
  useEffect(() => {
    const newParticles = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      size: Math.random() * 4 + 1,
      left: Math.random() * 100,
      top: Math.random() * 100,
      duration: Math.random() * 10 + 10,
      delay: Math.random() * 5
    }));
    setParticles(newParticles);
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Login failed");

      // Success animation
      setAnimateSuccess(true);
      
      // Store token with delay for animation
      setTimeout(() => {
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.user.role);
        localStorage.setItem("userName", data.user.name || data.user.email.split('@')[0]);

        // Navigate based on role
        if (data.user.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/home");
        }
      }, 800);

    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black text-white overflow-hidden relative">
      {/* Animated Background Particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 animate-float"
            style={{
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              animationDuration: `${particle.duration}s`,
              animationDelay: `${particle.delay}s`
            }}
          />
        ))}
        <div className="absolute inset-0 bg-grid-small opacity-10" />
      </div>

      {/* Success Animation Overlay */}
      {animateSuccess && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center animate-fade-in">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 mb-8 animate-scale-in">
              <ShieldCheckIcon className="h-16 w-16 text-white animate-pulse" />
            </div>
            <h3 className="text-3xl font-bold mb-4 bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              Welcome!
            </h3>
            <p className="text-gray-300">Redirecting to your dashboard...</p>
          </div>
        </div>
      )}

      <div className="relative min-h-screen flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <Link to="/" className="inline-block mb-8">
              <div className="flex items-center justify-center space-x-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl blur-lg animate-pulse" />
                  <div className="relative bg-gradient-to-r from-cyan-500 to-blue-500 p-3 rounded-xl">
                    <BuildingLibraryIcon className="h-8 w-8" />
                  </div>
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                  InfraWatch
                </h1>
              </div>
            </Link>
            
            <div className="mb-2">
              <h2 className="text-4xl font-bold">
                <span className="block text-gray-300">Welcome Back</span>
                <span className="block bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  to Community Care
                </span>
              </h2>
            </div>
            
            <p className="text-gray-400 text-lg">
              Log in to manage infrastructure reports and improve your community
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-red-500/10 to-rose-500/10 border border-red-500/20 backdrop-blur-sm animate-fade-in">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-red-500/20">
                  <LockClosedIcon className="h-5 w-5 text-red-400" />
                </div>
                <span className="text-red-300">{error}</span>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="group">
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-400 mb-2">
                <EnvelopeIcon className="h-4 w-4" />
                <span>Email Address</span>
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <EnvelopeIcon className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-4 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/30 transition-all duration-300"
                  placeholder="you@example.com"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="group">
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-400 mb-2">
                <KeyIcon className="h-4 w-4" />
                <span>Password</span>
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <LockClosedIcon className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  className="w-full pl-12 pr-12 py-4 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/30 transition-all duration-300"
                  placeholder="Enter your password"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-lg hover:bg-gray-800/50 transition-colors"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-700 bg-gray-800/50 text-cyan-500 focus:ring-cyan-500/30"
                />
                <span className="text-sm text-gray-400">Remember me</span>
              </label>
              <button
                type="button"
                className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full py-5 text-lg font-semibold rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-500 transform hover:-translate-y-1 hover:shadow-2xl hover:shadow-cyan-500/30"
            >
              <div className="relative flex items-center justify-center space-x-3">
                {loading ? (
                  <>
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRightIcon className="h-5 w-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                  </>
                )}
              </div>
              {!loading && (
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-400 blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500" />
              )}
            </button>
          </form>

          {/* Register Link */}
          <div className="text-center pt-6 border-t border-gray-800/50">
            <p className="text-gray-400">
              New to InfraWatch?{" "}
              <Link
                to="/register"
                className="font-semibold text-cyan-400 hover:text-cyan-300 transition-colors group inline-flex items-center space-x-1"
              >
                <span>Create an account</span>
                <ArrowRightIcon className="h-4 w-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
              </Link>
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8">
            {[
              { icon: ShieldCheckIcon, text: "Secure Login", color: "text-emerald-400" },
              { icon: SparklesIcon, text: "Real-time Updates", color: "text-cyan-400" },
              { icon: BuildingLibraryIcon, text: "Community Focus", color: "text-purple-400" },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-gradient-to-br from-gray-800/30 to-gray-900/30 border border-gray-700/30 text-center backdrop-blur-sm"
              >
                <feature.icon className={`h-6 w-6 mx-auto mb-2 ${feature.color}`} />
                <p className="text-sm text-gray-400">{feature.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 py-4 text-center border-t border-gray-800/50">
        <p className="text-sm text-gray-500">
          © {new Date().getFullYear()} InfraWatch. Building better communities together.
        </p>
      </div>
    </div>
  );
}