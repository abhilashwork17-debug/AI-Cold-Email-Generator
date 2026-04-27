import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";

const VerifyOtp = () => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();

  const userId = location.state?.userId;
  const email = location.state?.email;

  if (!userId) {
    navigate("/signup");
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await api.post("/auth/verify-otp", {
        userId,
        otp,
      });

      login(data);
      toast.success("Email verified successfully!");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md bg-[#111111] border border-gray-800 rounded-2xl p-8 hover:bg-[#1a1a1a] hover:shadow-[0_0_25px_rgba(168,85,247,0.12)] transition-all duration-300">
        <h2 className="text-3xl font-extrabold text-white text-center">
          Verify Email
        </h2>

        <p className="text-gray-400 text-center mt-2 mb-8">
          We sent a 6-digit code to
        </p>

        <p className="text-purple-300 text-center font-medium mb-8 break-all">
          {email}
        </p>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm text-gray-300 text-center mb-3">
              Enter OTP
            </label>

            <input
              type="text"
              required
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="000000"
              className="w-full px-4 py-4 rounded-xl bg-[#050505] border border-gray-800 text-white text-center text-2xl tracking-[0.4em] font-mono placeholder-gray-600 focus:outline-none focus:border-purple-400 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="w-full py-3 rounded-full bg-purple-400 text-black font-semibold hover:bg-purple-300 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Verifying..." : "Verify Email"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default VerifyOtp;
