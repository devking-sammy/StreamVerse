// src/components/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { app } from "../firebase/firebase";

export default function ProtectedRoute({ children }) {
  const auth = getAuth(app);
  const user = auth.currentUser;

  // If no user is logged in, redirect to /login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Otherwise, render the protected content
  return children;
}
