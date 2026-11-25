import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { getAuthErrorMessage, signInAdmin } from "../lib/auth.js";

export default function LoginPage() {
  const { isConfigured } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!username.trim() || !password) {
      setError("Please enter both username and password.");
      return;
    }

    setSubmitting(true);
    try {
      await signInAdmin(username, password);
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F7F5F0] text-[#243B53] flex items-center justify-center px-4 py-10">
      <section className="w-full max-w-md rounded-xl border border-[#243B53]/15 bg-[#F7F5F0] p-8 shadow-sm">
        <div className="mb-7 border-b border-[#243B53]/15 pb-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#43A6A1]">
            Residency Management
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#243B53]">
            Villa Residency
          </h1>
          <p className="mt-1 text-sm text-[#243B53]/70">
            Sign in with the admin account to manage rooms 101–107.
          </p>
        </div>

        {!isConfigured && (
          <div className="mb-6 rounded-lg border border-[#243B53]/30 bg-[#243B53]/5 p-4 text-sm text-[#243B53]">
            <p className="font-medium">Firebase configuration required</p>
            <p className="mt-1 text-xs leading-relaxed text-[#243B53]/80">
              Copy <code className="font-mono">.env.example</code> to{" "}
              <code className="font-mono">.env</code> and fill in your{" "}
              <code className="font-mono">VITE_FIREBASE_*</code> credentials, then
              restart the dev server.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-[#243B53]"
            >
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
              disabled={!isConfigured || submitting}
              className="mt-1.5 w-full rounded-lg border border-[#243B53]/25 bg-[#F7F5F0] px-3.5 py-2.5 text-sm text-[#243B53] placeholder:text-[#243B53]/40 focus:border-[#43A6A1] focus:outline-none disabled:opacity-60"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-[#243B53]"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={!isConfigured || submitting}
              className="mt-1.5 w-full rounded-lg border border-[#243B53]/25 bg-[#F7F5F0] px-3.5 py-2.5 text-sm text-[#243B53] placeholder:text-[#243B53]/40 focus:border-[#43A6A1] focus:outline-none disabled:opacity-60"
            />
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-lg border border-[#243B53]/30 bg-[#243B53]/10 px-3.5 py-2.5 text-sm text-[#243B53]"
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={!isConfigured || submitting}
            className="w-full rounded-lg bg-[#243B53] px-4 py-2.5 text-sm font-medium text-[#F7F5F0] hover:bg-[#243B53]/90 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </section>
    </main>
  );
}
