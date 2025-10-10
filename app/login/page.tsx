"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("aditya123@gmail.com");
  const [password, setPassword] = useState("12345678");
  const [showForgot, setShowForgot] = useState(false);
  const [resetEmail, setResetEmail] = useState("aditya123@gmail.com");
  const [loading, setLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState("");

  // ✅ Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post("https://393rb0pp-5000.inc1.devtunnels.ms/api/auth/admin-login", {
        email,
        password,
      });
      console.log("hhhhhhhhhhhhhhhh", res)

      if (res.data.success) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("isLoggedIn", "true");
        router.push("/dashboard");
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Invalid email or password!");
    }
  };

  // ✅ Handle Forgot Password (request reset link)
  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResetMessage("");

    try {
      const res = await axios.post("https://393rb0pp-5000.inc1.devtunnels.ms/api/auth/request-password-reset", {
        email: resetEmail,
      });

      // Show message from API
      setResetMessage(res.data.message);

      // For testing, you can log the reset URL
      console.log("Reset URL:", res.data.resetUrl);

      // Optionally show alert for user
      alert(res.data.message);
      setResetEmail("");
      setShowForgot(false);
    } catch (err: any) {
      alert(err.response?.data?.message || "Error sending reset link!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100">
      {/* === LOGIN BOX === */}
      <div className="bg-white p-8 rounded-2xl shadow-md w-96">
        <h1 className="text-2xl font-semibold text-center mb-6 text-gray-800">
          Admin Login
        </h1>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Enter Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />

          <input
            type="password"
            placeholder="Enter Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />

          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition"
          >
            Log In
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => setShowForgot(true)}
            className="text-sm text-blue-600 hover:underline"
          >
            Forgot Password?
          </button>
        </div>
      </div>

      {/* === FORGOT PASSWORD MODAL === */}
      {showForgot && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl p-6 w-[380px] shadow-lg relative">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Reset Your Password
            </h3>

            <form onSubmit={handleForgot} className="space-y-4">
              <input
                type="email"
                placeholder="Enter your registered email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50"
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>

            <button
              onClick={() => setShowForgot(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
