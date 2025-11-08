"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import axios from "axios";
import { useRouter } from "next/navigation";

const BASE_URL = "https://viafarm-1.onrender.com";

export default function LoginPage() {
  const router = useRouter();
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [forgotEmail, setForgotEmail] = useState("");
  const [loading, setLoading] = useState(false);

  /* ------------ LOGIN -------------- */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // ✅ Added "withCredentials" for mobile cookie & CORS support
      const res = await axios.post(
        `${BASE_URL}/api/auth/admin-login`,
        { email, password },
        { withCredentials: true }
      );

      if (res.data?.success) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("isLoggedIn", "true");
        router.push("/dashboard");
      } else {
        alert(res.data?.message || "Invalid login credentials!");
      }
    } catch (err: any) {
      alert(err?.response?.data?.message || "Invalid email or password!");
    }
  };

  /* ------------ FORGOT PASSWORD -------------- */
  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // ✅ Same fix added here for mobile request stability
      const res = await axios.post(
        `${BASE_URL}/api/auth/request-password-reset`,
        { email: forgotEmail },
        { withCredentials: true }
      );
      alert(res.data?.message || "Reset link sent successfully!");
      setForgotEmail("");
      setIsForgotOpen(false);
    } catch (err: any) {
      alert(err?.response?.data?.message || "Error sending reset link!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen w-full">
      {/* LEFT SIDE IMAGE */}
      <div className="md:w-1/2 w-full h-1/3 md:h-full relative">
        <img
          src="/images/farmers.png"
          alt="Farmers"
          className="w-full h-full object-cover object-center"
        />
      </div>

      {/* RIGHT SIDE LOGIN FORM */}
      <div className="md:w-1/2 w-full flex items-center justify-center bg-white relative h-full px-6">
        <div className="w-full max-w-md rounded-2xl bg-white z-10 h-full flex flex-col justify-center">
          <div className="flex justify-center mb-6">
            <img
              src="/images/logo.png"
              alt="Logo"
              className="h-60 w-auto object-contain"
            />
          </div>

          {!isForgotOpen ? (
            <>
              <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
                Welcome Back!
              </h2>

              <form onSubmit={handleLogin} className="space-y-5">
                <input
                  type="email"
                  placeholder="Enter Email Id"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-full px-4 py-3 focus:ring-2 focus:ring-green-500 focus:outline-none"
                />

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full border border-gray-300 rounded-full px-4 py-3 pr-12 focus:ring-2 focus:ring-green-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3 top-3 text-gray-500"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => setIsForgotOpen(true)}
                    className="text-sm text-green-600 hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>

                <button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-full transition"
                >
                  Log In
                </button>
              </form>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-semibold text-gray-800 mb-2 text-center">
                Forgot Password
              </h2>
              <p className="text-sm text-gray-500 mb-6 text-center">
                Please enter the Email address you’d like your password reset
                information sent to
              </p>

              <form onSubmit={handleForgot} className="space-y-5">
                <input
                  type="email"
                  placeholder="Enter Email Id"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-full px-4 py-3 focus:ring-2 focus:ring-green-500 focus:outline-none"
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-full transition disabled:opacity-50"
                >
                  {loading ? "Sending..." : "Request Reset Link"}
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setIsForgotOpen(false)}
                    className="text-sm text-green-600 hover:underline"
                  >
                    Back To Login
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
