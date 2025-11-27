import React, { useState, useEffect } from "react";
import { loginUser } from "../firebase/auth";
import Swal from "sweetalert2";
import { useNavigate, Link } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { app } from "../firebase/firebase";
import LiveWallpaper from "../assets/LiveWallpaper.mp4"; // ✅ Import your live wallpaper

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const auth = getAuth(app);

  // 👇 Auto redirect if user is already logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        Swal.fire({
          icon: "info",
          title: "You're already logged in!",
          text: "Redirecting to the main page...",
          timer: 2000,
          showConfirmButton: false,
        });
        navigate("/home");
      }
    });
    return () => unsubscribe();
  }, [auth, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await loginUser(email, password);

      Swal.fire({
        icon: "success",
        title: "Login Successful!",
        text: "Welcome back to StreamVerse 🔥",
        confirmButtonColor: "#e50914",
      }).then(() => {
        navigate("/home");
      });
    } catch (error) {
      let message = "Something went wrong. Please try again.";
      if (error.code === "auth/user-not-found")
        message = "No account found with that email.";
      else if (error.code === "auth/wrong-password")
        message = "Incorrect password. Try again.";
      else if (error.code === "auth/invalid-email")
        message = "Please enter a valid email address.";

      Swal.fire({
        icon: "error",
        title: "Login Failed",
        text: message,
        confirmButtonColor: "#e50914",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center text-white overflow-hidden">
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-80"
        src={LiveWallpaper}
      ></video>

      {/* Dark Overlay for readability */}
      <div className="absolute inset-0 bg-black/60"></div>

      {/* Login Form */}
      <form
        onSubmit={handleLogin}
        className="relative z-10 bg-gray-900 p-8 rounded-2xl shadow-lg w-96"
      >
        <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>

        {/* Email Field */}
        <input
          type="email"
          placeholder="Email"
          className="w-full mb-3 p-2 rounded bg-gray-800 outline-none"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        {/* Password Field with Toggle */}
        <div className="relative mb-4">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            className="w-full p-2 rounded bg-gray-800 outline-none pr-10"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <span
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-2.5 cursor-pointer text-gray-400 hover:text-white"
          >
            {showPassword ? (
              // Hide icon
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.98 8.223a10.477 10.477 0 00-.713 1.15C2.743 10.379 2.5 11.165 2.5 12s.243 1.621.767 2.627C4.594 17.84 8.27 21 12 21c1.465 0 2.884-.304 4.207-.879M9.88 9.88l4.24 4.24m1.82-3.06a3 3 0 11-4.24-4.24m6.183 6.183A10.45 10.45 0 0021.5 12c0-.835-.243-1.621-.767-2.627C19.406 6.16 15.73 3 12 3c-1.258 0-2.47.259-3.586.733"
                />
              </svg>
            ) : (
              // Show icon
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.036 12.322a9.967 9.967 0 0119.928 0A9.967 9.967 0 012.036 12.322z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            )}
          </span>
        </div>

        {/* Login Button */}
        <button
          type="submit"
          className={`w-full py-2 rounded font-semibold transition ${
            loading ? "bg-gray-700 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"
          }`}
          disabled={loading}
        >
          {loading ? "Please wait..." : "Login"}
        </button>

        {/* Forgot Password Link */}
        <div className="text-center mt-3">
          <Link
            to="/forgot-password"
            className="text-sm text-gray-400 hover:text-white transition"
          >
            Forgot Password?
          </Link>
        </div>

        <button
          onClick={() => navigate("/register")}
          className="mt-4 text-gray-300 hover:text-white underline"
        >
          Don't have an account? Register
        </button>
      </form>
    </div>
  );
}
