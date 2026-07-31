import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/api";
import { KeyRound, Mail, AlertCircle, RefreshCw } from "lucide-react";

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError(null);
    setLoading(true);

    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      const { token, user } = response.data;

      login(token, user);

      if (user.role === "ADMIN") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.error || "Something went wrong during login.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl border border-slate-200 shadow-xl">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome Back
          </h2>

          <p className="mt-2 text-sm text-slate-600">
            Or{" "}
            <Link
              to="/register"
              className="font-medium text-brand-600 hover:text-brand-500 transition"
            >
              create a new account
            </Link>
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-start space-x-2">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4 rounded-md">
            <div>
              <label
                htmlFor="email-address"
                className="block text-sm font-medium text-slate-700"
              >
                Email Address
              </label>

              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>

                <input
                  id="email-address"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700"
              >
                Password
              </label>

              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <KeyRound className="h-5 w-5 text-slate-400" />
                </div>

                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2.5 px-4 rounded-lg text-white bg-brand-600 hover:bg-brand-700 transition disabled:opacity-50"
          >
            {loading ? (
              <RefreshCw className="animate-spin h-5 w-5" />
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mt-6 text-xs text-slate-500 space-y-1">
          <p className="font-semibold text-slate-700">
            Default Seed Credentials:
          </p>

          <p>
            User:{" "}
            <code className="bg-slate-200 px-1 py-0.5 rounded text-red-600 font-mono">
              user@example.com
            </code>{" "}
            /{" "}
            <code className="bg-slate-200 px-1 py-0.5 rounded text-red-600 font-mono">
              User@123
            </code>
          </p>

          <p>
            Admin:{" "}
            <code className="bg-slate-200 px-1 py-0.5 rounded text-red-600 font-mono">
              admin@example.com
            </code>{" "}
            /{" "}
            <code className="bg-slate-200 px-1 py-0.5 rounded text-red-600 font-mono">
              Admin@123
            </code>
          </p>
        </div>
      </div>
    </div>
  );
};
