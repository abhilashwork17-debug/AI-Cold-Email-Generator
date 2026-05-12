import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import api from "../utils/api";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await api.post("/auth/register", {
        name,
        email,
        password,
      });

      toast.success(data.message);

      navigate("/verify-otp", {
        state: { userId: data.userId, email },
      });
    } catch (error) {
      const msg = error.response?.data?.message;

      if (msg === "Email already registered. Please try logging in.") {
        toast.error(msg);
        navigate("/login");
        return;
      }

      toast.error(msg || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md bg-[#111111] border border-gray-800 rounded-2xl p-8 hover:bg-[#1a1a1a] hover:shadow-[0_0_25px_rgba(168,85,247,0.12)] transition-all duration-300">
        <h2 className="text-3xl font-extrabold text-white text-center">
          Create Account
        </h2>

        <p className="text-gray-400 text-center mt-2 mb-8">
          Join MailSmith today
        </p>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full Name"
            className="w-full px-4 py-3 rounded-xl bg-[#050505] border border-gray-800 text-white placeholder-gray-500 focus:outline-none focus:border-purple-400"
          />

          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email Address"
            className="w-full px-4 py-3 rounded-xl bg-[#050505] border border-gray-800 text-white placeholder-gray-500 focus:outline-none focus:border-purple-400"
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full px-4 py-3 pr-12 rounded-xl bg-[#050505] border border-gray-800 text-white placeholder-gray-500 focus:outline-none focus:border-purple-400"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-300"
            >
              {showPassword ? (
                <EyeSlashIcon className="w-5 h-5" />
              ) : (
                <EyeIcon className="w-5 h-5" />
              )}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-full bg-purple-400 text-black font-semibold hover:bg-purple-300 hover:scale-105 transition-all duration-300 disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Sign up"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <span className="text-gray-400">Already have an account? </span>

          <Link
            to="/login"
            className="text-purple-300 hover:text-purple-200 font-medium"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
