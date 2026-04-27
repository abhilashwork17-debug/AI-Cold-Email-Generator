import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  ArrowRightIcon,
  BoltIcon,
  ChartBarIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";

const LandingPage = () => {
  const { user } = useAuth();

  const features = [
    {
      name: "Lightning Fast Generation",
      description:
        "Generate highly custom cold emails in seconds using state-of-the-art AI.",
      icon: BoltIcon,
    },
    {
      name: "Omnichannel Outreach",
      description:
        "Get an email, a follow-up, and a LinkedIn DM perfectly synced for your prospect.",
      icon: DocumentTextIcon,
    },
    {
      name: "Higher Conversion Rates",
      description:
        "Personalized copy ensures higher open rates and better reply outcomes.",
      icon: ChartBarIcon,
    },
  ];

  return (
    <div className="bg-[#050505] min-h-screen font-sans text-white selection:bg-purple-400 selection:text-white cursor-default">
      {/* Navigation */}
      <nav className="border-b border-gray-800 bg-[#050505]/95 backdrop-blur-md fixed w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <span className="text-2xl font-black bg-gradient-to-r from-purple-300 to-violet-400 bg-clip-text text-transparent">
              MailSmith
            </span>

            <div className="flex items-center space-x-4">
              {user ? (
                <Link
                  to="/dashboard"
                  className="px-6 py-2.5 rounded-full text-sm font-medium bg-purple-400 text-black hover:bg-purple-300 hover:scale-105 transition-all duration-300"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-gray-300 hover:text-white px-3 py-2 text-sm transition-all duration-300"
                  >
                    Log in
                  </Link>

                  <Link
                    to="/signup"
                    className="px-6 py-2.5 rounded-full text-sm font-medium bg-purple-400 text-black hover:bg-purple-300 hover:scale-105 transition-all duration-300"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-36 pb-24 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight">
            Write Cold Emails That <br />
            <span className="bg-gradient-to-r from-purple-300 to-violet-400 bg-clip-text text-transparent">
              Actually Get Replies
            </span>
          </h1>

          <p className="mt-8 text-xl text-gray-400 max-w-3xl mx-auto">
            Stop wasting hours drafting outreach. Let AI create perfect cold
            email sequences instantly.
          </p>

          <div className="mt-10">
            <Link
              to={user ? "/dashboard" : "/signup"}
              className="inline-flex items-center px-8 py-4 rounded-full bg-purple-400 text-black font-semibold hover:bg-purple-300 hover:scale-110 transition-all duration-300"
            >
              Start Generating
              <ArrowRightIcon className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold">Everything You Need</h2>
            <p className="text-gray-400 mt-4">
              Built for professionals who want results.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div
                key={feature.name}
                className="p-8 rounded-2xl bg-[#111111] border border-gray-800 hover:bg-[#1a1a1a] hover:shadow-[0_0_25px_rgba(168,85,247,0.15)] transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-lg bg-purple-400/10 flex items-center justify-center mb-6">
                  <feature.icon className="w-5 h-5 text-purple-300" />
                </div>

                <h3 className="text-xl font-semibold mb-3">{feature.name}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 text-center">
        <h2 className="text-4xl font-bold">Ready to scale your outreach?</h2>
        <p className="text-gray-400 mt-4">
          Join hundreds of professionals using MailSmith.
        </p>

        <div className="mt-10">
          <Link
            to="/signup"
            className="px-8 py-4 rounded-full bg-purple-400 text-black font-semibold hover:bg-purple-300 hover:scale-110 transition-all duration-300"
          >
            Create Free Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-10 text-center bg-black">
        <p className="text-gray-500 text-sm">
          © {new Date().getFullYear()} MailSmith. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;
