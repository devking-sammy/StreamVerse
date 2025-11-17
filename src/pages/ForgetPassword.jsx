import React, { useState } from "react";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { app } from "../firebase/firebase";
import Swal from "sweetalert2";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const auth = getAuth(app);

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      Swal.fire({
        icon: "success",
        title: "Reset Link Sent!",
        text: "Check your email to reset your password.",
        confirmButtonColor: "#e50914",
      });
      setEmail("");
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error.code === "auth/user-not-found"
            ? "No account found with this email."
            : error.message,
        confirmButtonColor: "#e50914",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <form
        onSubmit={handleReset}
        className="bg-gray-900 p-8 rounded-2xl shadow-lg w-96"
      >
        <h2 className="text-2xl font-bold mb-4 text-center">
          Forgot Password
        </h2>
        <p className="text-sm text-gray-400 text-center mb-4">
          Enter your email address, and we’ll send you a reset link.
        </p>

        <input
          type="email"
          placeholder="Enter your email"
          className="w-full mb-4 p-2 rounded bg-gray-800 outline-none"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <button
          type="submit"
          className={`w-full py-2 rounded font-semibold transition ${
            loading
              ? "bg-gray-700 cursor-not-allowed"
              : "bg-red-600 hover:bg-red-700"
          }`}
          disabled={loading}
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
      </form>
    </div>
  );
}
