"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import axios from "axios";
import { useRouter } from "next/navigation";

const BASE_URL = "https://viafarm-1.onrender.com";

export default function LoginPage() {
  const router = useRouter();

  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [forgotStep, setForgotStep] = useState<"email" | "otp" | "success">("email");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [forgotEmail, setForgotEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  /* ------------ LOGIN FUNCTION -------------- */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        `${BASE_URL}/api/auth/admin-login`,
        { email, password },
        { headers: { "Content-Type": "application/json" }, withCredentials: true }
      );

      if (res.data?.success && res.data?.token) {
        // ✅ Token save only on login
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

  /* ------------ STEP 1: REQUEST OTP -------------- */
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(
        `${BASE_URL}/api/auth/request-password-otp`,
        { email: forgotEmail },
        { headers: { "Content-Type": "application/json" } }
      );

      if (res.data?.success) {
        alert("✅ " + res.data.message);
        setForgotStep("otp");
      } else {
        alert(res.data?.message || "Failed to send OTP!");
      }
    } catch (err: any) {
      alert(err?.response?.data?.message || "Error sending OTP!");
    } finally {
      setLoading(false);
    }
  };

  /* ------------ STEP 2: VERIFY OTP + RESET PASSWORD -------------- */
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(
        `${BASE_URL}/api/auth/reset-password-otp`,
        {
          email: forgotEmail, // ✅ include email
          otp,
          password: newPassword,
        },
        { headers: { "Content-Type": "application/json" } }
      );

      if (res.data?.success) {
        alert("✅ " + res.data.message);
        setForgotStep("success");
      } else {
        alert(res.data?.message || "Invalid OTP!");
      }
    } catch (err: any) {
      alert(err?.response?.data?.message || "Error verifying OTP!");
    } finally {
      setLoading(false);
    }
  };

  /* ------------ STEP 3: BACK TO LOGIN AFTER SUCCESS -------------- */
  const handleBackToLogin = () => {
    setForgotEmail("");
    setOtp("");
    setNewPassword("");
    setForgotStep("email");
    setIsForgotOpen(false);
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

      {/* RIGHT SIDE LOGIN */}
      <div className="md:w-1/2 w-full flex items-center justify-center bg-white relative h-full px-6">
        <div className="w-full max-w-md rounded-2xl bg-white z-10 h-full flex flex-col justify-center">
          <div className="flex justify-center mb-6">
            <img
              src="/images/logo.png"
              alt="Logo"
              className="h-60 w-auto object-contain"
            />
          </div>

          {/* ---------------- LOGIN FORM ---------------- */}
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
              {/* ---------------- FORGOT PASSWORD FORMS ---------------- */}
              <h2 className="text-2xl font-semibold text-gray-800 mb-2 text-center">
                {forgotStep === "email"
                  ? "Forgot Password"
                  : forgotStep === "otp"
                  ? "Enter OTP"
                  : "Password Reset Successful!"}
              </h2>

              <p className="text-sm text-gray-500 mb-6 text-center">
                {forgotStep === "email"
                  ? "Enter your email to receive an OTP"
                  : forgotStep === "otp"
                  ? "Enter OTP and your new password"
                  : "Your password has been reset successfully!"}
              </p>

              {/* Step 1: Request OTP */}
              {forgotStep === "email" && (
                <form onSubmit={handleRequestOtp} className="space-y-5">
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
                    {loading ? "Sending..." : "Send OTP"}
                  </button>
                </form>
              )}

              {/* Step 2: Verify OTP */}
              {forgotStep === "otp" && (
                <form onSubmit={handleVerifyOtp} className="space-y-5">
                  <input
                    type="email"
                    placeholder="Enter Email Id"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required
                    className="w-full border border-gray-300 rounded-full px-4 py-3 focus:ring-2 focus:ring-green-500 focus:outline-none"
                  />

                  <input
                    type="text"
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                    className="w-full border border-gray-300 rounded-full px-4 py-3 focus:ring-2 focus:ring-green-500 focus:outline-none"
                  />

                  <input
                    type="password"
                    placeholder="Enter New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="w-full border border-gray-300 rounded-full px-4 py-3 focus:ring-2 focus:ring-green-500 focus:outline-none"
                  />

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-full transition disabled:opacity-50"
                  >
                    {loading ? "Verifying..." : "Verify & Reset Password"}
                  </button>
                </form>
              )}

              {/* Step 3: Success */}
              {forgotStep === "success" && (
                <div className="text-center space-y-5">
                  <p className="text-green-600 font-medium">
                    ✅ Password has been reset successfully!
                  </p>
                  <button
                    onClick={handleBackToLogin}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-full transition"
                  >
                    Back to Login
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
