import React, { useState, useEffect } from "react";
import { registerUser } from "../firebase/auth";
import { db, app } from "../firebase/firebase";
import { doc, setDoc } from "firebase/firestore";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import LiveWallpaper from "../assets/LiveWallpaper.mp4"; // ✅ Import your live wallpaper

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const auth = getAuth(app);

  // 👇 Redirect if already logged in
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

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userCredential = await registerUser(email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        name,
        email,
      });

      Swal.fire({
        icon: "success",
        title: "Account Created Successfully!",
        text: "Welcome to StreamVerse 🔥",
        confirmButtonColor: "#e50914",
      }).then(() => {
        navigate("/login");
      });
    } catch (error) {
      let message = "Something went wrong. Please try again.";
      if (error.code === "auth/email-already-in-use")
        message = "This email is already registered.";
      else if (error.code === "auth/invalid-email")
        message = "Please enter a valid email address.";
      else if (error.code === "auth/weak-password")
        message = "Password should be at least 6 characters.";

      Swal.fire({
        icon: "error",
        title: "Registration Failed",
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

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/60"></div>

      {/* Registration Form */}
      <form
        onSubmit={handleRegister}
        className="relative z-10 bg-gray-900 p-8 rounded-2xl shadow-lg w-96"
      >
        <h2 className="text-2xl font-bold mb-4 text-center">Create Account</h2>

        <input
          type="text"
          placeholder="Full Name"
          className="w-full mb-3 p-2 rounded bg-gray-800 outline-none"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <input
          type="email"
          placeholder="Email"
          className="w-full mb-3 p-2 rounded bg-gray-800 outline-none"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        {/* 🔒 Password with show/hide toggle */}
        <div className="relative mb-4">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            className="w-full p-2 rounded bg-gray-800 outline-none pr-10"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-2.5 text-gray-400 hover:text-white"
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>

        <button
          type="submit"
          className={`w-full py-2 rounded font-semibold transition ${
            loading
              ? "bg-gray-700 cursor-not-allowed"
              : "bg-red-600 hover:bg-red-700"
          }`}
          disabled={loading}
        >
          {loading ? "Creating Account..." : "Sign Up"}
        </button>

        <button
          onClick={() => navigate("/login")}
          className="mt-4 text-gray-300 hover:text-white underline"
        >
          Already have an account? Login
        </button>
      </form>
    </div>
  );
}
