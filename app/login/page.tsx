"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Eye, EyeOff } from "lucide-react";

const BASE_URL = "https://393rb0pp-5000.inc1.devtunnels.ms";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [loading, setLoading] = useState(false);

  /* ---------------- LOGIN ---------------- */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${BASE_URL}/api/auth/admin-login`, {
        email,
        password,
      });

      if (res.data.success) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("isLoggedIn", "true");
        router.push("/dashboard");
      } else {
        alert(res.data.message || "Invalid login credentials!");
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Invalid email or password!");
    }
  };

  /* ---------------- FORGOT PASSWORD ---------------- */
  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post(
        `${BASE_URL}/api/auth/request-password-reset`,
        { email: resetEmail }
      );
      alert(res.data.message);
      setForgotMode(false);
    } catch (err: any) {
      alert(err.response?.data?.message || "Error sending reset link!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-white">
      {!forgotMode ? (
        /* ================= LOGIN FORM ================= */
        <div className="bg-white p-10 rounded-2xl shadow-lg w-[400px] text-center">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            Welcome Back !
          </h2>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <input
                type="email"
                placeholder="Enter Email Id"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:outline-none"
              />
            </div>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:outline-none"
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-500 cursor-pointer"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </span>
            </div>

            <div className="text-right">
              <button
                type="button"
                onClick={() => setForgotMode(true)}
                className="text-sm text-blue-600 hover:underline"
              >
                Forgot password ?
              </button>
            </div>

            <button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition"
            >
              Log In
            </button>
          </form>
        </div>
      ) : (
        /* ================= FORGOT PASSWORD FORM ================= */
        <div className="bg-white p-10 rounded-2xl shadow-lg w-[400px] text-center">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            Forgot Password
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Please enter the Email address you’d like your password reset
            information sent to
          </p>

          <form onSubmit={handleForgot} className="space-y-5">
            <input
              type="email"
              placeholder="Enter Email Id"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:outline-none"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50"
            >
              {loading ? "Sending..." : "Request reset link"}
            </button>
          </form>

          <button
            onClick={() => setForgotMode(false)}
            className="mt-5 text-sm text-blue-600 hover:underline"
          >
            Back To Login
          </button>
        </div>
      )}
    </div>
  );
}
