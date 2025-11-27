import { getAuth } from "firebase/auth";
import { app, db } from "../firebase/firebase";
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  query,
  where,
  doc,
} from "firebase/firestore";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

export default function MovieDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [trailer, setTrailer] = useState("");
  const [showTrailer, setShowTrailer] = useState(false);
  const [cast, setCast] = useState([]);
  const [related, setRelated] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const auth = getAuth(app);

  useEffect(() => {
    async function fetchMovie() {
      const res = await axios.get(
        `${BASE_URL}/movie/${id}?api_key=${API_KEY}&append_to_response=videos,credits`
      );
      setMovie(res.data);

      // Trailer
      const videos = res.data?.videos?.results || [];
      const trailerVideo =
        videos.find(
          (vid) => vid.type === "Trailer" && vid.site === "YouTube"
        ) || videos.find((vid) => vid.site === "YouTube");

      if (trailerVideo) {
        setTrailer(`https://www.youtube.com/watch?v=${trailerVideo.key}`);
      }

      // Cast
      setCast(res.data?.credits?.cast?.slice(0, 10) || []);

      // Recommended
      if (res.data.genres.length > 0) {
        const genreId = res.data.genres[0].id;
        const similar = await axios.get(
          `${BASE_URL}/movie/${id}/similar?api_key=${API_KEY}`
        );
        const genreRelated = await axios.get(
          `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${genreId}`
        );

        setRelated([
          ...similar.data.results,
          ...genreRelated.data.results,
        ].filter((m) => m.id !== Number(id)).slice(0, 12));
      }

      checkIfFavorite();
    }

    fetchMovie();
  }, [id]);

  const checkIfFavorite = async () => {
    if (!auth.currentUser) return;
    const favoritesRef = collection(db, "favorites");
    const q = query(
      favoritesRef,
      where("id", "==", parseInt(id)),
      where("userId", "==", auth.currentUser.uid)
    );
    const snapshot = await getDocs(q);
    setIsFavorite(!snapshot.empty);
  };

  const handleFavorite = async () => {
    if (!auth.currentUser) return navigate("/login");
    const favoritesRef = collection(db, "favorites");

    if (isFavorite) {
      const q = query(
        favoritesRef,
        where("id", "==", movie.id),
        where("userId", "==", auth.currentUser.uid)
      );
      const snapshot = await getDocs(q);
      snapshot.forEach(async (snap) => await deleteDoc(doc(db, "favorites", snap.id)));
      setIsFavorite(false);
    } else {
      await addDoc(favoritesRef, {
        id: movie.id,
        title: movie.title,
        poster: movie.poster_path,
        userId: auth.currentUser.uid,
        createdAt: new Date(),
      });
      setIsFavorite(true);
    }
  };

  if (!movie) return <div className="text-white p-6">Loading...</div>;

  return (
    <div className="relative min-h-screen text-white overflow-hidden">

      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-40 blur-sm"
        style={{
          backgroundImage: `url(https://image.tmdb.org/t/p/original${movie.backdrop_path})`,
        }}
      ></div>

      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>

      <div className="relative z-10 flex flex-col md:flex-row gap-10 p-6 md:p-16">
        <img
          src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
          alt={movie.title}
          className="rounded-2xl shadow-xl w-full md:w-80"
        />

        <div className="flex-1">
          <h1 className="text-4xl md:text-6xl font-bold mb-3">{movie.title}</h1>
          <p className="text-gray-300 mb-2">
            {movie.release_date?.split("-")[0]} •{" "}
            {movie.genres.map((g) => g.name).join(", ")} • ⭐{" "}
            {movie.vote_average.toFixed(1)}
          </p>

          <p className="text-gray-200 mb-6 leading-relaxed">{movie.overview}</p>

          <div className="flex flex-wrap gap-4 mb-6">
            <button
              onClick={() => setShowTrailer(!showTrailer)}
              className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded-lg font-semibold"
            >
              {showTrailer ? "Hide Trailer" : "▶ Watch Trailer"}
            </button>

            <button
              onClick={handleFavorite}
              className={`px-6 py-2 rounded-lg font-semibold ${
                isFavorite ? "bg-gray-700" : "bg-gray-900"
              }`}
            >
              {isFavorite ? "❤️ Added to Favorites" : "🤍 Add to Favorites"}
            </button>
          </div>

          {showTrailer && trailer && (
            <div className="mt-6">
              <iframe
                src={`https://www.youtube.com/embed/${
                  trailer.split("v=")[1]
                }?autoplay=1`}
                className="w-full aspect-video rounded-xl shadow-2xl"
                allowFullScreen
              ></iframe>
            </div>
          )}
        </div>
      </div>

      {/* ✅ CAST SECTION */}
      {cast.length > 0 && (
        <div className="relative z-10 px-6 md:px-16 mb-12">
          <h2 className="text-2xl font-bold mb-4">Cast</h2>
          <div className="flex gap-4 overflow-x-auto hide-scrollbar">
            {cast.map((actor) => (
              <div key={actor.id} className="text-center">
                <img
                  src={
                    actor.profile_path
                      ? `https://image.tmdb.org/t/p/w200${actor.profile_path}`
                      : "/placeholder.jpg"
                  }
                  className="w-28 h-28 object-cover rounded-full mb-2 border border-gray-700"
                />
                <p className="text-sm font-semibold">{actor.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ✅ RELATED SECTION — Netflix Carousel */}
{related.length > 0 && (
  <div className="relative z-10 px-6 md:px-16 pb-20">
    <h2 className="text-2xl font-bold mb-4">Recommended For You</h2>

    <div className="flex overflow-x-auto gap-4 pb-4 hide-scrollbar">
      {related.map((m) => (
        <div
          key={m.id}
          onClick={() => navigate(`/movie/${m.id}`)}
          className="min-w-[160px] sm:min-w-[180px] cursor-pointer hover:scale-105 transition duration-300"
        >
          <img
            src={`https://image.tmdb.org/t/p/w500${m.poster_path}`}
            className="rounded-lg shadow-lg"
            alt={m.title}
          />
          <p className="mt-2 text-sm font-medium line-clamp-1">{m.title}</p>
        </div>
      ))}
    </div>
  </div>
)}

    </div>
  );
}
