import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaSearch,
  FaChevronDown,
  FaUserCircle,
  FaHeart,
  FaSignOutAlt,
  FaCrown,
  FaFileInvoiceDollar,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { app, db } from "../firebase/firebase";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import Logo from "../assets/Logo.png";

export default function Navbar() {
  const navigate = useNavigate();
  const auth = getAuth(app);
  const [user, setUser] = useState(null);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [plan, setPlan] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef();

  // 🔥 REAL-TIME AUTH & SUBSCRIPTION LISTENER
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        // --- Get user profile ---
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserName(data.name);
          setUserEmail(data.email);
        } else {
          setUserName(currentUser.displayName || "User");
          setUserEmail(currentUser.email || "");
        }

        // --- 🔥 REAL-TIME subscription listener ---
        const subDocRef = doc(db, "subscriptions", currentUser.uid);

        const unsubscribeSub = onSnapshot(subDocRef, (snap) => {
          if (snap.exists() && snap.data().active) {
            setPlan(snap.data().plan);
          } else {
            setPlan(null);
          }
        });

        return () => unsubscribeSub();
      } else {
        setUser(null);
        setUserName("");
        setUserEmail("");
        setPlan(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setMenuOpen(false);
    setMobileMenuOpen(false);
    navigate("/login");
  };

  return (
    <nav className="fixed top-0 left-0 w-full bg-black/80 backdrop-blur-lg z-50 border-b border-gray-800">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">

        {/* Logo */}
        <Link to="/home" className="flex items-center gap-2">
          <img src={Logo} alt="StreamVerse Logo" className="w-32 sm:w-36 object-contain" />
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8 text-gray-300 font-medium">
          <Link to="/home" className="hover:text-white transition duration-200">
            Home
          </Link>

          <Link to="/search" className="flex items-center gap-2 hover:text-white transition duration-200">
            <FaSearch className="text-lg" />
            <span className="hidden sm:inline">Search</span>
          </Link>

          {user ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 text-white hover:text-red-500 transition"
              >
                <FaUserCircle className="text-2xl" />
                <span className="hidden sm:inline">{userName || "User"}</span>
                <FaChevronDown
                  className={`text-sm transition-transform duration-200 ${
                    menuOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-gray-900 border border-gray-700 rounded-xl shadow-lg overflow-hidden z-50 animate-fade-in">
                  <div className="px-4 py-3 border-b border-gray-700">
                    <p className="text-sm text-gray-300 font-semibold">{userName}</p>
                    <p className="text-xs text-gray-500 truncate">{userEmail}</p>
                  </div>

                  <div className="flex flex-col py-1">
                    <Link
                      to="/favorites"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-3 text-sm text-gray-300 hover:bg-gray-800 transition"
                    >
                      <FaHeart className="text-red-500" /> Favorites
                    </Link>

                    {/* REAL-TIME subscription UI */}
                    {plan ? (
                      <>
                        <div className="flex items-center gap-2 px-4 py-3 text-sm text-yellow-400 font-semibold">
                          <FaCrown /> {plan} Plan
                        </div>

                        <Link
                          to="/billing"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-3 text-sm text-gray-300 hover:bg-gray-800 transition"
                        >
                          <FaFileInvoiceDollar className="text-green-400" /> Billing History
                        </Link>
                      </>
                    ) : (
                      <Link
                        to="/subscribe"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-3 text-sm text-gray-300 hover:bg-gray-800 transition"
                      >
                        <FaCrown className="text-yellow-400" /> Subscribe
                      </Link>
                    )}

                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full text-left px-4 py-3 text-sm text-gray-300 hover:bg-red-600 hover:text-white transition"
                    >
                      <FaSignOutAlt /> Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                to="/login"
                className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg text-white font-semibold transition"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-white font-semibold transition"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger */}
        <div className="md:hidden flex items-center">
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? (
              <FaTimes className="text-2xl text-white" />
            ) : (
              <FaBars className="text-2xl text-white" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-gray-900 border-t border-gray-700 w-full text-gray-300 font-medium animate-fade-in">
          <Link
            to="/home"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-6 py-3 hover:bg-gray-800 transition"
          >
            Home
          </Link>

          <Link
            to="/search"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-6 py-3 hover:bg-gray-800 transition flex items-center gap-2"
          >
            <FaSearch /> Search
          </Link>

          {user ? (
            <>
              <Link
                to="/favorites"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-6 py-3 hover:bg-gray-800 transition flex items-center gap-2"
              >
                <FaHeart className="text-red-500" /> Favorites
              </Link>

              {/* REAL-TIME subscription for mobile */}
              {plan ? (
                <>
                  <div className="px-6 py-3 text-yellow-400 font-semibold flex items-center gap-2">
                    <FaCrown /> {plan} Plan
                  </div>
                  <Link
                    to="/billing"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-6 py-3 hover:bg-gray-800 transition flex items-center gap-2"
                  >
                    <FaFileInvoiceDollar className="text-green-400" /> Billing History
                  </Link>
                </>
              ) : (
                <Link
                  to="/subscribe"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-6 py-3 hover:bg-gray-800 transition flex items-center gap-2"
                >
                  <FaCrown className="text-yellow-400" /> Subscribe
                </Link>
              )}

              <button
                onClick={handleLogout}
                className="w-full text-left px-6 py-3 hover:bg-red-600 hover:text-white transition flex items-center gap-2"
              >
                <FaSignOutAlt /> Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-6 py-3 hover:bg-gray-800 transition"
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-6 py-3 hover:bg-gray-800 transition"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
