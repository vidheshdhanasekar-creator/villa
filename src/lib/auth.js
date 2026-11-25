import {
  browserLocalPersistence,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { getFirebaseAuth } from "./firebase.js";

const DEFAULT_ADMIN_USERNAME = "admin";
const DEFAULT_ADMIN_DOMAIN = "residency.local";

/**
 * Maps a simple admin username (e.g. "admin") to its backing Firebase Auth email.
 * Passes through inputs that already contain "@".
 */
export function resolveAdminEmail(usernameOrEmail) {
  const trimmed = String(usernameOrEmail || "").trim();
  if (!trimmed) {
    return "";
  }
  if (trimmed.includes("@")) {
    return trimmed.toLowerCase();
  }

  const configuredUsername = (
    import.meta.env.VITE_ADMIN_USERNAME || DEFAULT_ADMIN_USERNAME
  )
    .trim()
    .toLowerCase();
  const configuredEmail = import.meta.env.VITE_ADMIN_EMAIL?.trim().toLowerCase();

  if (configuredEmail && trimmed.toLowerCase() === configuredUsername) {
    return configuredEmail;
  }

  const domain = (
    import.meta.env.VITE_ADMIN_EMAIL_DOMAIN || DEFAULT_ADMIN_DOMAIN
  ).trim();
  return `${trimmed.toLowerCase()}@${domain}`;
}

/**
 * Checks whether a signed-in user's email matches the configured single admin email (if set).
 */
export function isAuthorizedAdminEmail(email) {
  const configuredEmail = import.meta.env.VITE_ADMIN_EMAIL?.trim().toLowerCase();
  if (!configuredEmail) {
    return Boolean(email);
  }
  return (email ?? "").trim().toLowerCase() === configuredEmail;
}

/**
 * Signs in the single admin user using Firebase Email/Password authentication.
 */
export async function signInAdmin(usernameOrEmail, password) {
  const auth = getFirebaseAuth();
  await setPersistence(auth, browserLocalPersistence);
  const email = resolveAdminEmail(usernameOrEmail);

  if (!isAuthorizedAdminEmail(email)) {
    throw new Error("Unauthorized account. Only the residency admin can sign in.");
  }

  const credential = await signInWithEmailAndPassword(auth, email, password);
  if (!isAuthorizedAdminEmail(credential.user.email)) {
    await signOut(auth);
    throw new Error("Unauthorized account. Only the residency admin can sign in.");
  }
  return credential;
}

export async function signOutAdmin() {
  const auth = getFirebaseAuth();
  await signOut(auth);
}

/**
 * Maps Firebase Auth error codes to clean user-facing messages.
 */
export function getAuthErrorMessage(error) {
  if (typeof error === "object" && error !== null && "code" in error) {
    const code = String(error.code);
    switch (code) {
      case "auth/invalid-credential":
      case "auth/wrong-password":
      case "auth/user-not-found":
      case "auth/invalid-email":
        return "Invalid username or password.";
      case "auth/too-many-requests":
        return "Too many failed attempts. Please wait a moment and try again.";
      case "auth/network-request-failed":
        return "Network error. Please check your internet connection.";
      default:
        return "Unable to sign in. Please verify your credentials.";
    }
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return "Unable to sign in.";
}
