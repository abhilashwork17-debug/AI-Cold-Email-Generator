import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const LoginPromptModal = () => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-lg bg-[#111111]/95 border border-gray-800 rounded-[32px] p-10 overflow-hidden"
      >
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-purple-500/20 blur-3xl rounded-full"></div>

        <div className="relative z-10 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-purple-500/10 border border-purple-400/20 mb-8">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-r from-purple-400 to-violet-500"></div>
          </div>

          <h1 className="text-4xl font-black text-white mb-5">
            Welcome to MailSmith
          </h1>

          <p className="text-gray-400 leading-relaxed mb-10">
            Login or create an account to access ATS analysis, AI cold email
            generation, and smart outreach tools.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to="/login"
              className="flex-1 bg-purple-400 hover:bg-purple-300 text-black font-bold py-4 rounded-2xl transition-all duration-300 text-center"
            >
              Login
            </Link>

            <Link
              to="/signup"
              className="flex-1 border border-gray-700 hover:border-purple-400 text-white py-4 rounded-2xl transition-all duration-300 text-center"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPromptModal;
