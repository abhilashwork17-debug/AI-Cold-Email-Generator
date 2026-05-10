import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  BoltIcon,
  ChartBarIcon,
  DocumentTextIcon,
  StarIcon,
  ShieldCheckIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

const LandingPage = () => {
  const { user } = useAuth();

  const features = [
    {
      name: "Lightning Fast Generation",
      description:
        "Generate premium cold emails, LinkedIn messages, and follow-ups in seconds.",
      icon: BoltIcon,
    },
    {
      name: "Higher Reply Rates",
      description:
        "Smart personalization helps improve open rates and recruiter responses.",
      icon: ChartBarIcon,
    },
    {
      name: "Complete Outreach Suite",
      description:
        "Email + LinkedIn + Follow-up messaging from one powerful dashboard.",
      icon: DocumentTextIcon,
    },
  ];

  return (
    <div className="bg-[#050505] min-h-screen text-white overflow-hidden">
      <nav className="fixed top-0 left-0 w-full z-50 border-b border-gray-800 bg-[#050505]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <h1 className="text-2xl font-black bg-gradient-to-r from-purple-300 to-violet-400 bg-clip-text text-transparent">
            MailSmith
          </h1>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="px-6 py-3 rounded-full bg-purple-400 text-black font-semibold hover:bg-purple-300 transition"
                >
                  Dashboard
                </Link>

                <Link
                  to="/login"
                  className="px-6 py-3 rounded-full border border-gray-700 hover:border-purple-400 text-white transition"
                >
                  Login
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-6 py-3 rounded-full border border-gray-700 hover:border-purple-400 text-white transition"
                >
                  Login
                </Link>

                <Link
                  to="/signup"
                  className="px-6 py-3 rounded-full bg-purple-400 text-black font-semibold hover:bg-purple-300 transition"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <section className="pt-36 pb-28 px-6 relative">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-purple-500/20 blur-[140px] rounded-full"></div>

        <div className="max-w-6xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-400/30 bg-[#111111] text-sm text-purple-300 mb-8">
            <SparklesIcon className="w-4 h-4" />
            AI Powered Outreach Platform
          </div>

          <h1 className="text-5xl md:text-7xl font-black leading-tight">
            Cold Emails That <br />
            <span className="bg-gradient-to-r from-purple-300 to-violet-400 bg-clip-text text-transparent">
              Actually Get Replies
            </span>
          </h1>

          <p className="mt-8 text-xl text-gray-400 max-w-3xl mx-auto">
            Generate premium recruiter emails, LinkedIn DMs, and follow-ups in
            seconds using smart AI.
          </p>

          <div className="mt-12 flex flex-col sm:flex-row justify-center gap-6">
            <Link
              to="/ats"
              className="px-10 py-5 rounded-full bg-green-400 text-black text-lg font-bold hover:bg-green-300 hover:scale-105 transition-all duration-300"
            >
              ATS Checker
            </Link>
          </div>
        </div>
      </section>

      <section className="px-6 pb-28 pt-6 relative">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-purple-500/5 blur-[180px] rounded-full"></div>

        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 80 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            whileHover={{
              scale: 1.02,
            }}
            className="group relative bg-[#111111]/90 backdrop-blur-xl border border-gray-800 rounded-[32px] p-8 overflow-hidden"
          >
            <motion.div
              animate={{
                rotate: 360,
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "linear",
              }}
              className="absolute -top-32 -right-32 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"
            />

            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-400/20 flex items-center justify-center">
                  <ChartBarIcon className="w-7 h-7 text-purple-300" />
                </div>

                <motion.div
                  initial={{ opacity: 0.5 }}
                  animate={{ opacity: 1 }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    repeatType: "reverse",
                  }}
                  className="text-purple-300 text-sm"
                >
                  Live Scan
                </motion.div>
              </div>

              <div className="w-full h-3 bg-black rounded-full overflow-hidden mb-6">
                <motion.div
                  initial={{ width: "0%" }}
                  whileInView={{ width: "92%" }}
                  transition={{
                    duration: 2,
                    ease: "easeOut",
                  }}
                  viewport={{ once: true }}
                  className="h-full bg-gradient-to-r from-purple-400 to-violet-500 rounded-full"
                />
              </div>

              <h3 className="text-3xl font-black mb-4">ATS Analyzer</h3>

              <p className="text-gray-400 leading-relaxed">
                AI-powered resume scanning with intelligent keyword optimization
                and ATS compatibility insights.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 80 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
            whileHover={{
              scale: 1.02,
            }}
            className="group relative bg-[#111111]/90 backdrop-blur-xl border border-gray-800 rounded-[32px] p-8 overflow-hidden"
          >
            <motion.div
              animate={{
                rotate: -360,
              }}
              transition={{
                duration: 25,
                repeat: Infinity,
                ease: "linear",
              }}
              className="absolute -bottom-32 -left-32 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"
            />

            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-400/20 flex items-center justify-center">
                  <BoltIcon className="w-7 h-7 text-blue-300" />
                </div>

                <motion.div
                  animate={{
                    opacity: [0.4, 1, 0.4],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                  }}
                  className="text-blue-300 text-sm"
                >
                  AI Generating...
                </motion.div>
              </div>

              <motion.div
                animate={{
                  x: [0, 6, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
                className="bg-black border border-gray-800 rounded-2xl p-4 mb-6 text-gray-300 text-sm"
              >
                Generating personalized recruiter outreach...
              </motion.div>

              <h3 className="text-3xl font-black mb-4">AI Mail Generator</h3>

              <p className="text-gray-400 leading-relaxed">
                Generate recruiter emails, LinkedIn outreach, and follow-ups
                instantly using advanced AI.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 80 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2 }}
            viewport={{ once: true }}
            whileHover={{
              scale: 1.02,
            }}
            className="group relative bg-[#111111]/90 backdrop-blur-xl border border-gray-800 rounded-[32px] p-8 overflow-hidden"
          >
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
              }}
              className="absolute top-0 right-0 w-48 h-48 bg-green-500/10 rounded-full blur-3xl"
            />

            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 rounded-2xl bg-green-500/10 border border-green-400/20 flex items-center justify-center">
                  <DocumentTextIcon className="w-7 h-7 text-green-300" />
                </div>

                <motion.div
                  animate={{
                    y: [0, -5, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                  className="text-green-300 text-sm"
                >
                  Auto Saved
                </motion.div>
              </div>

              <motion.div
                animate={{
                  y: [0, -6, 0],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                }}
                className="space-y-3 mb-6"
              >
                <div className="h-3 rounded-full bg-black border border-gray-800 w-full"></div>
                <div className="h-3 rounded-full bg-black border border-gray-800 w-5/6"></div>
                <div className="h-3 rounded-full bg-black border border-gray-800 w-4/6"></div>
              </motion.div>

              <h3 className="text-3xl font-black mb-4">History Tracking</h3>

              <p className="text-gray-400 leading-relaxed">
                Access, manage, and revisit your previously generated outreach
                campaigns securely.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="px-6 py-24 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold">Why Choose MailSmith?</h2>

            <p className="text-gray-400 mt-4">
              Built for job seekers, freelancers, and professionals.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div
                key={feature.name}
                className="p-8 rounded-2xl bg-[#111111] border border-gray-800 hover:bg-[#1a1a1a] transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-purple-400/10 flex items-center justify-center mb-6">
                  <feature.icon className="w-6 h-6 text-purple-300" />
                </div>

                <h3 className="text-xl font-semibold mb-3">{feature.name}</h3>

                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-6 relative">
        <div className="absolute inset-0 flex justify-center">
          <div className="w-[400px] h-[400px] bg-purple-500/10 blur-[120px] rounded-full"></div>
        </div>

        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8 text-center relative z-10">
          <div className="p-8 rounded-2xl bg-[#111111]/70 backdrop-blur-lg border border-gray-800 hover:border-purple-400 hover:shadow-[0_0_30px_rgba(168,85,247,0.15)] transition-all duration-300">
            <ShieldCheckIcon className="w-10 h-10 text-purple-300 mx-auto mb-4" />

            <h3 className="font-semibold text-lg">Secure</h3>

            <p className="text-gray-400 mt-2">
              Your data stays protected with strong encryption.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-[#111111]/70 backdrop-blur-lg border border-gray-800 hover:border-purple-400 hover:shadow-[0_0_30px_rgba(168,85,247,0.15)] transition-all duration-300">
            <StarIcon className="w-10 h-10 text-purple-300 mx-auto mb-4" />

            <h3 className="font-semibold text-lg">Loved by Users</h3>

            <p className="text-gray-400 mt-2">
              Trusted by professionals improving their outreach daily.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-[#111111]/70 backdrop-blur-lg border border-gray-800 hover:border-purple-400 hover:shadow-[0_0_30px_rgba(168,85,247,0.15)] transition-all duration-300">
            <SparklesIcon className="w-10 h-10 text-purple-300 mx-auto mb-4" />

            <h3 className="font-semibold text-lg">AI Optimized</h3>

            <p className="text-gray-400 mt-2">
              Smart AI ensures better results and higher success rates.
            </p>
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-800 py-10 text-center bg-black">
        <p className="text-gray-500 text-sm">
          © {new Date().getFullYear()} MailSmith. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;
