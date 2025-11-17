import React from "react";
import { useNavigate } from "react-router-dom";
import AnimeBg from "../assets/Anime-background2.mp4";
import Logo from "../assets/Logo.png"; // ✅ Import your logo

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="relative h-screen w-full overflow-hidden bg-black text-white">

      {/* Background Video */}
      <video
       src={AnimeBg}
        autoPlay
        loop
        muted={true}
        playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-70"
      ></video>

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/60"></div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-6 text-center">
        {/* Logo Only */}
        <img src={Logo} alt="StreamVerse Logo"  />

        <p className="text-gray-300 text-lg md:text-xl max-w-xl mb-8">
          Unlimited movies, shows, and entertainment. Stream anytime, anywhere.
        </p>

        <button
          onClick={() => navigate("/register")}
          className="bg-red-600 hover:bg-red-700 transition px-10 py-3 rounded-lg font-semibold text-lg shadow-lg"
        >
          Get Started
        </button>

        <button
          onClick={() => navigate("/login")}
          className="mt-4 text-gray-300 hover:text-white underline"
        >
          Already have an account? Login
        </button>
      </div>
    </div>
  );
}
