import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/firebase";
import animeBG from "../assets/Anime-backgroundimg.mp4";


const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

export default function Home() {
  const [featured, setFeatured] = useState(null);
  const [trending, setTrending] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [action, setAction] = useState([]);
  const [isSubscribed, setIsSubscribed] = useState(false);

  // 🎬 Trailer rotation & mute state
  const [trailerIndex, setTrailerIndex] = useState(0);
  const [muted, setMuted] = useState(true);

  const trailers = [
    "/videos/trailer1.mp4",
    "/videos/trailer2.mp4",
    "/videos/trailer3.mp4",
  ];

  const navigate = useNavigate();

  // ✅ Subscription check
  useEffect(() => {
  const auth = getAuth();
  const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
    if (user) {
      const unsubDoc = onSnapshot(doc(db, "subscriptions", user.uid), (snapshot) => {
        const data = snapshot.data();
        setIsSubscribed(data?.active || false);
      });
      return () => unsubDoc();
    } else {
      setIsSubscribed(false);
    }
  });

  return () => unsubscribeAuth();
}, []);


  // ✅ Fetch movies
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await axios.get(`${BASE_URL}/movie/popular?api_key=${API_KEY}`);
        const popularMovies = res.data.results;
        setFeatured(
          popularMovies[Math.floor(Math.random() * popularMovies.length)]
        );

        const [trendRes, topRes, actionRes] = await Promise.all([
          axios.get(`${BASE_URL}/trending/movie/week?api_key=${API_KEY}`),
          axios.get(`${BASE_URL}/movie/top_rated?api_key=${API_KEY}`),
          axios.get(`${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=28`),
        ]);

        setTrending(trendRes.data.results);
        setTopRated(topRes.data.results);
        setAction(actionRes.data.results);
      } catch (err) {
        console.error("Error fetching movies:", err);
      }
    }

    fetchData();
  }, []);

  // 🎥 Auto-rotate trailers
  useEffect(() => {
    const interval = setInterval(() => {
      setTrailerIndex((prev) => (prev + 1) % trailers.length);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // 🎞 Hero Section
  const HeroSection = () => {
    if (!featured) return null;

    return (
      <div className="relative w-full h-[80vh] mb-12 overflow-hidden text-white">

        {/* 🔥 TMDB image (fallback layer) */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(https://image.tmdb.org/t/p/original${featured.backdrop_path})`,
          }}
        />

        {/* 🎥 Background trailer video (on top now) */}
        <video
          key={trailerIndex}
          src={trailers[trailerIndex]}
          autoPlay
          loop
          muted={muted}
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-0 animate-fadeIn z-10"
        />

        {/* Dark fade overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>

        {/* Text */}
        <div className="absolute bottom-20 left-6 sm:left-10 z-20 max-w-xl">
          <h1
            className="text-3xl sm:text-5xl font-extrabold mb-4 cursor-pointer drop-shadow-lg"
            onClick={() => navigate(`/movie/${featured.id}`)}
          >
            {featured.title}
          </h1>

          <p className="text-gray-200 text-sm sm:text-base mb-6 line-clamp-3 drop-shadow-md">
            {featured.overview}
          </p>

          <div className="flex items-center gap-4">
            {isSubscribed ? (
              <button
                onClick={() => navigate(`/movie/${featured.id}`)}
                className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg font-semibold shadow-lg transition flex items-center gap-2"
              >
                ▶ Play
              </button>
            ) : (
              <button
                onClick={() => navigate("/subscribe")}
                className="bg-yellow-500 hover:bg-yellow-600 px-6 py-3 rounded-lg font-semibold shadow-lg transition"
              >
                🔒 Subscribe to Watch
              </button>
            )}

            {/* Mute */}
            <button
              onClick={() => setMuted(!muted)}
              className="bg-white/20 hover:bg-white/30 p-3 rounded-full backdrop-blur"
            >
              {muted ? "🔇" : "🔊"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ✅ Movie Row
  const MovieRow = ({ title, movies }) => (
    <div className="mb-10">
      <h2 className="text-2xl font-semibold mb-4">{title}</h2>
      <div className="carousel-container flex overflow-x-auto gap-4 pb-4 scrollbar-hide hover:scrollbar-default">
        {movies.map((movie) => (
          <div
            key={movie.id}
            className="min-w-[160px] sm:min-w-[180px] cursor-pointer hover:scale-105 transition duration-300"
            onClick={() =>
              isSubscribed ? navigate(`/movie/${movie.id}`) : navigate("/subscribe")
            }
          >
            <img
              src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
              className="rounded-lg shadow-lg"
            />
          </div>
        ))}
      </div>
    </div>
  );

return (
  <div className="relative min-h-screen text-white pt-20 px-6 sm:px-12 overflow-x-hidden">

    {/* 🎥 Background Video */}
    <video
      src={animeBG}
      autoPlay
      loop
      muted={true}
      playsInline
      className="absolute inset-0 w-full h-full object-cover brightness-50 z-0"
    />

    {/* DARK overlay for readability */}
    <div className="absolute inset-0 bg-black/70 z-0"></div>

    {/* Content */}
    <div className="relative z-10">
      <HeroSection />
      <MovieRow title="🔥 Trending This Week" movies={trending} />
      <MovieRow title="⭐ Top Rated" movies={topRated} />
      <MovieRow title="💥 Action Hits" movies={action} />
    </div>

  </div>
);
}


