import React, { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
  addDoc,
  collection,
} from "firebase/firestore";
import { db, app } from "../firebase/firebase";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

// ✅ Import your live wallpaper
import LiveWallpaper from "../assets/LiveWallpaper.mp4"; // or .webm/.mov if needed

export default function Subscribe() {
  const [user, setUser] = useState(null);
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const auth = getAuth(app);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        const subRef = doc(db, "subscriptions", currentUser.uid);
        const subSnap = await getDoc(subRef);

        if (subSnap.exists() && subSnap.data().active) {
          setSubscribed(true);
        }
      }
    });
    return () => unsubscribe();
  }, [auth]);

  const handleSubscribe = async (plan) => {
    if (!user) {
      Swal.fire({
        icon: "warning",
        title: "Login Required",
        text: "Please log in to subscribe.",
        confirmButtonColor: "#e50914",
      });
      navigate("/login");
      return;
    }

    const { isConfirmed } = await Swal.fire({
      title: `Confirm ${plan} Plan Payment`,
      text: `Proceed to pay for ${plan} plan?`,
      icon: "question",
      confirmButtonText: "Pay Now",
      showCancelButton: true,
      confirmButtonColor: "#e50914",
    });

    if (!isConfirmed) return;

    try {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const startDate = new Date();
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 1);

      await setDoc(doc(db, "subscriptions", user.uid), {
        plan,
        active: true,
        startDate,
        endDate,
      });

      await addDoc(collection(db, "payments"), {
        uid: user.uid,
        plan,
        amount: plan === "Premium" ? 2999 : 0,
        date: serverTimestamp(),
        status: "Success",
        transactionId: Math.floor(Math.random() * 1000000000),
      });

      setSubscribed(true);
      Swal.fire({
        icon: "success",
        title: "Payment Successful!",
        text: `You are now subscribed to the ${plan} plan.`,
        confirmButtonColor: "#e50914",
      }).then(() => navigate("/home"));
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Payment Failed",
        text: error.message,
        confirmButtonColor: "#e50914",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-4 text-white">
      {/* 🔥 Live Wallpaper Background */}
      <video
        autoPlay
        loop
        muted
        className="absolute top-0 left-0 w-full h-full object-cover z-0 opacity-70"
      >
        <source src={LiveWallpaper} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Content Overlay */}
      <div className="relative z-10 w-full max-w-5xl">
        <h1 className="text-3xl font-bold mb-8 text-center">
          Choose Your Plan
        </h1>

        {subscribed ? (
          <div className="bg-gray-900 bg-opacity-90 p-6 rounded-2xl shadow-lg text-center w-full max-w-md mx-auto">
            <h2 className="text-2xl font-semibold mb-2">You're Subscribed 🎉</h2>
            <p className="text-gray-400 mb-4">
              Enjoy unlimited access to all StreamVerse content!
            </p>
            <button
              onClick={() => navigate("/billing")}
              className="bg-gray-700 hover:bg-gray-600 px-6 py-2 rounded-lg font-semibold transition mr-3"
            >
              View Billing History
            </button>
            <button
              onClick={() => navigate("/home")}
              className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded-lg font-semibold transition"
            >
              Go to Home
            </button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 max-w-4xl mx-auto">
            {/* Basic Plan */}
            <div className="bg-gray-900 bg-opacity-90 p-6 rounded-2xl shadow-lg hover:scale-105 transition-transform border border-gray-700">
              <h2 className="text-2xl font-semibold mb-2 text-red-500">Basic</h2>
              <p className="text-gray-400 mb-4">Free access to limited movies.</p>
              <p className="text-3xl font-bold mb-6">₦0 / month</p>
              <button
                onClick={() => handleSubscribe("Basic")}
                className="w-full bg-gray-700 hover:bg-gray-600 py-2 rounded-lg font-semibold transition"
                disabled={loading}
              >
                {loading ? "Processing..." : "Select Basic"}
              </button>
            </div>

            {/* Premium Plan */}
            <div className="bg-gray-900 bg-opacity-90 p-6 rounded-2xl shadow-lg hover:scale-105 transition-transform border border-red-600">
              <h2 className="text-2xl font-semibold mb-2 text-red-500">
                Premium
              </h2>
              <p className="text-gray-400 mb-4">
                Unlock all movies, shows & exclusive content.
              </p>
              <p className="text-3xl font-bold mb-6">₦2,999 / month</p>
              <button
                onClick={() => handleSubscribe("Premium")}
                className="w-full bg-red-600 hover:bg-red-700 py-2 rounded-lg font-semibold transition"
                disabled={loading}
              >
                {loading ? "Processing..." : "Subscribe Now"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
