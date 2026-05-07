// client/src/hooks/useAuth.js

import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

/**
 * useAuth hook
 *
 * Gives any component access to the current user and auth actions.
 *
 * Usage:
 *   const { user, login, logout, loading } = useAuth();
 *
 * user object shape (decoded from JWT):
 *   { id, email, name, major }   ← whatever your backend signed into the token
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return context;
}