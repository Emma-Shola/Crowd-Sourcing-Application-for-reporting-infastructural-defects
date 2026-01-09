import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
  BuildingLibraryIcon,
  SparklesIcon,
  UserGroupIcon
} from "@heroicons/react/24/solid";
import {
  DocumentTextIcon,
  KeyIcon
} from "@heroicons/react/24/outline";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    location: "",
    password: "",
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [animateSuccess, setAnimateSuccess] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [strength, setStrength] = useState(0);
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

  // Password strength checker
  useEffect(() => {
    let score = 0;
    if (form.password.length >= 8) score += 25;
    if (/[A-Z]/.test(form.password)) score += 25;
    if (/[0-9]/.test(form.password)) score += 25;
    if (/[^A-Za-z0-9]/.test(form.password)) score += 25;
    setStrength(score);
  }, [form.password]);

  const getStrengthColor = (score) => {
    if (score >= 75) return "bg-emerald-500";
    if (score >= 50) return "bg-yellow-500";
    if (score >= 25) return "bg-orange-500";
    return "bg-red-500";
  };

  const getStrengthText = (score) => {
    if (score >= 75) return "Strong";
    if (score >= 50) return "Medium";
    if (score >= 25) return "Weak";
    return "Very Weak";
  };

  const validateForm = () => {
    const errors = {};

    if (!form.firstName.trim()) errors.firstName = "First name is required";
    if (!form.lastName.trim()) errors.lastName = "Last name is required";
    
    if (!form.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errors.email = "Please enter a valid email";
    }

    if (!form.phone.trim()) {
      errors.phone = "Phone number is required";
    } else if (!/^[\+]?[1-9][\d]{0,15}$/.test(form.phone.replace(/\D/g, ''))) {
      errors.phone = "Please enter a valid phone number";
    }

    if (!form.location.trim()) errors.location = "Location is required";
    
    if (!form.password) {
      errors.password = "Password is required";
    } else if (form.password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    }

    if (form.password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      setError("Please fix the errors above");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok || !data.success)
        throw new Error(data.message || "Registration failed");

      // Success animation
      setAnimateSuccess(true);
      
      // Delay navigation for animation
      setTimeout(() => {
        navigate("/login");
      }, 1500);

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
            className="absolute rounded-full bg-gradient-to-r from-emerald-500/20 to-teal-500/20 animate-float"
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
              <CheckCircleIcon className="h-16 w-16 text-white animate-pulse" />
            </div>
            <h3 className="text-3xl font-bold mb-4 bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              Registration Successful!
            </h3>
            <p className="text-gray-300">Redirecting to login...</p>
          </div>
        </div>
      )}

      <div className="relative min-h-screen flex items-center justify-center px-4 py-12">
        <div className="max-w-lg w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <Link to="/" className="inline-block mb-8">
              <div className="flex items-center justify-center space-x-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl blur-lg animate-pulse" />
                  <div className="relative bg-gradient-to-r from-emerald-500 to-teal-500 p-3 rounded-xl">
                    <BuildingLibraryIcon className="h-8 w-8" />
                  </div>
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                  InfraWatch
                </h1>
              </div>
            </Link>
            
            <div className="mb-2">
              <h2 className="text-4xl font-bold">
                <span className="block text-gray-300">Join the Community</span>
                <span className="block bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                  Build a Better Neighborhood
                </span>
              </h2>
            </div>
            
            <p className="text-gray-400 text-lg">
              Create your account and start improving infrastructure in your area
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-red-500/10 to-rose-500/10 border border-red-500/20 backdrop-blur-sm animate-fade-in">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-red-500/20">
                  <ShieldCheckIcon className="h-5 w-5 text-red-400" />
                </div>
                <span className="text-red-300">{error}</span>
              </div>
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Fields - Side by Side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* First Name */}
              <div className="group">
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-400 mb-2">
                  <UserIcon className="h-4 w-4" />
                  <span>First Name</span>
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <UserIcon className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    name="firstName"
                    value={form.firstName}
                    onChange={handleChange}
                    className={`w-full pl-12 pr-4 py-4 bg-gray-800/50 backdrop-blur-sm border rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all duration-300 ${
                      formErrors.firstName 
                        ? "border-red-500/50 focus:ring-red-500/30" 
                        : "border-gray-700/50 focus:border-emerald-500/50 focus:ring-emerald-500/30"
                    }`}
                    placeholder="John"
                    required
                    disabled={loading}
                  />
                </div>
                {formErrors.firstName && (
                  <p className="mt-2 text-sm text-red-400">{formErrors.firstName}</p>
                )}
              </div>

              {/* Last Name */}
              <div className="group">
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-400 mb-2">
                  <UserIcon className="h-4 w-4" />
                  <span>Last Name</span>
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <UserIcon className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    name="lastName"
                    value={form.lastName}
                    onChange={handleChange}
                    className={`w-full pl-12 pr-4 py-4 bg-gray-800/50 backdrop-blur-sm border rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all duration-300 ${
                      formErrors.lastName 
                        ? "border-red-500/50 focus:ring-red-500/30" 
                        : "border-gray-700/50 focus:border-emerald-500/50 focus:ring-emerald-500/30"
                    }`}
                    placeholder="Doe"
                    required
                    disabled={loading}
                  />
                </div>
                {formErrors.lastName && (
                  <p className="mt-2 text-sm text-red-400">{formErrors.lastName}</p>
                )}
              </div>
            </div>

            {/* Email */}
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
                  className={`w-full pl-12 pr-4 py-4 bg-gray-800/50 backdrop-blur-sm border rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all duration-300 ${
                    formErrors.email 
                      ? "border-red-500/50 focus:ring-red-500/30" 
                      : "border-gray-700/50 focus:border-emerald-500/50 focus:ring-emerald-500/30"
                  }`}
                  placeholder="you@example.com"
                  required
                  disabled={loading}
                />
              </div>
              {formErrors.email && (
                <p className="mt-2 text-sm text-red-400">{formErrors.email}</p>
              )}
            </div>

            {/* Phone Number */}
            <div className="group">
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-400 mb-2">
                <PhoneIcon className="h-4 w-4" />
                <span>Phone Number</span>
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <PhoneIcon className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  className={`w-full pl-12 pr-4 py-4 bg-gray-800/50 backdrop-blur-sm border rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all duration-300 ${
                    formErrors.phone 
                      ? "border-red-500/50 focus:ring-red-500/30" 
                      : "border-gray-700/50 focus:border-emerald-500/50 focus:ring-emerald-500/30"
                  }`}
                  placeholder="+1 (555) 123-4567"
                  required
                  disabled={loading}
                />
              </div>
              {formErrors.phone && (
                <p className="mt-2 text-sm text-red-400">{formErrors.phone}</p>
              )}
            </div>

            {/* Location */}
            <div className="group">
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-400 mb-2">
                <MapPinIcon className="h-4 w-4" />
                <span>Location</span>
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <MapPinIcon className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  className={`w-full pl-12 pr-4 py-4 bg-gray-800/50 backdrop-blur-sm border rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all duration-300 ${
                    formErrors.location 
                      ? "border-red-500/50 focus:ring-red-500/30" 
                      : "border-gray-700/50 focus:border-emerald-500/50 focus:ring-emerald-500/30"
                  }`}
                  placeholder="City, State"
                  required
                  disabled={loading}
                />
              </div>
              {formErrors.location && (
                <p className="mt-2 text-sm text-red-400">{formErrors.location}</p>
              )}
            </div>

            {/* Password */}
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
                  className={`w-full pl-12 pr-12 py-4 bg-gray-800/50 backdrop-blur-sm border rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all duration-300 ${
                    formErrors.password 
                      ? "border-red-500/50 focus:ring-red-500/30" 
                      : "border-gray-700/50 focus:border-emerald-500/50 focus:ring-emerald-500/30"
                  }`}
                  placeholder="Create a secure password"
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
              
              {/* Password Strength Meter */}
              {form.password && (
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Password strength:</span>
                    <span className={`font-medium ${strength >= 75 ? 'text-emerald-400' : strength >= 50 ? 'text-yellow-400' : strength >= 25 ? 'text-orange-400' : 'text-red-400'}`}>
                      {getStrengthText(strength)}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-800/50 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${getStrengthColor(strength)} transition-all duration-500`}
                      style={{ width: `${strength}%` }}
                    />
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-gray-500">
                    <div className={`flex items-center ${form.password.length >= 8 ? 'text-emerald-400' : ''}`}>
                      <div className={`h-2 w-2 rounded-full mr-2 ${form.password.length >= 8 ? 'bg-emerald-500' : 'bg-gray-600'}`} />
                      8+ characters
                    </div>
                    <div className={`flex items-center ${/[A-Z]/.test(form.password) ? 'text-emerald-400' : ''}`}>
                      <div className={`h-2 w-2 rounded-full mr-2 ${/[A-Z]/.test(form.password) ? 'bg-emerald-500' : 'bg-gray-600'}`} />
                      Uppercase
                    </div>
                    <div className={`flex items-center ${/[0-9]/.test(form.password) ? 'text-emerald-400' : ''}`}>
                      <div className={`h-2 w-2 rounded-full mr-2 ${/[0-9]/.test(form.password) ? 'bg-emerald-500' : 'bg-gray-600'}`} />
                      Number
                    </div>
                    <div className={`flex items-center ${/[^A-Za-z0-9]/.test(form.password) ? 'text-emerald-400' : ''}`}>
                      <div className={`h-2 w-2 rounded-full mr-2 ${/[^A-Za-z0-9]/.test(form.password) ? 'bg-emerald-500' : 'bg-gray-600'}`} />
                      Special
                    </div>
                  </div>
                </div>
              )}
              
              {formErrors.password && (
                <p className="mt-2 text-sm text-red-400">{formErrors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="group">
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-400 mb-2">
                <LockClosedIcon className="h-4 w-4" />
                <span>Confirm Password</span>
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <LockClosedIcon className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full pl-12 pr-12 py-4 bg-gray-800/50 backdrop-blur-sm border rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all duration-300 ${
                    formErrors.confirmPassword 
                      ? "border-red-500/50 focus:ring-red-500/30" 
                      : "border-gray-700/50 focus:border-emerald-500/50 focus:ring-emerald-500/30"
                  }`}
                  placeholder="Confirm your password"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-lg hover:bg-gray-800/50 transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {formErrors.confirmPassword && (
                <p className="mt-2 text-sm text-red-400">{formErrors.confirmPassword}</p>
              )}
            </div>

            {/* Terms and Conditions */}
            <label className="flex items-start space-x-3 cursor-pointer group">
              <input
                type="checkbox"
                className="h-5 w-5 mt-0.5 rounded border-gray-700 bg-gray-800/50 text-emerald-500 focus:ring-emerald-500/30"
                required
              />
              <span className="text-sm text-gray-400">
                I agree to the{" "}
                <button type="button" className="text-emerald-400 hover:text-emerald-300 transition-colors">
                  Terms of Service
                </button>{" "}
                and{" "}
                <button type="button" className="text-emerald-400 hover:text-emerald-300 transition-colors">
                  Privacy Policy
                </button>
              </span>
            </label>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full py-5 text-lg font-semibold rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-500 transform hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-500/30"
            >
              <div className="relative flex items-center justify-center space-x-3">
                {loading ? (
                  <>
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRightIcon className="h-5 w-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                  </>
                )}
              </div>
              {!loading && (
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-400 blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500" />
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="text-center pt-6 border-t border-gray-800/50">
            <p className="text-gray-400">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold text-emerald-400 hover:text-emerald-300 transition-colors group inline-flex items-center space-x-1"
              >
                <span>Sign in here</span>
                <ArrowRightIcon className="h-4 w-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
              </Link>
            </p>
          </div>

          {/* Benefits */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8">
            {[
              { icon: ShieldCheckIcon, text: "Secure & Private", color: "text-emerald-400" },
              { icon: SparklesIcon, text: "Real-time Updates", color: "text-cyan-400" },
              { icon: UserGroupIcon, text: "Community Impact", color: "text-purple-400" },
            ].map((benefit, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-gradient-to-br from-gray-800/30 to-gray-900/30 border border-gray-700/30 text-center backdrop-blur-sm"
              >
                <benefit.icon className={`h-6 w-6 mx-auto mb-2 ${benefit.color}`} />
                <p className="text-sm text-gray-400">{benefit.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 py-4 text-center border-t border-gray-800/50">
        <p className="text-sm text-gray-500">
          © {new Date().getFullYear()} InfraWatch. Join thousands making a difference.
        </p>
      </div>
    </div>
  );
}