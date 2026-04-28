import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { ClipboardDocumentIcon, CheckIcon } from "@heroicons/react/24/outline";

const Dashboard = () => {
  const { user } = useAuth();

  const [name, setName] = useState("");
  const [jobRole, setJobRole] = useState("");
  const [experience, setExperience] = useState("0-1");
  const [prompt, setPrompt] = useState("");

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState("");

  const [guestUsage, setGuestUsage] = useState(0);

  useEffect(() => {
    const count = localStorage.getItem("guestUsage");
    setGuestUsage(Number(count) || 0);
  }, []);

  const handleGenerate = async (e) => {
    e.preventDefault();

    if (!name.trim() || !jobRole.trim()) {
      toast.error("Please fill name and job role");
      return;
    }

    /* Guest Limit Check */
    if (!user && guestUsage >= 2) {
      toast.error("Free limit reached. Please login to continue.");
      return;
    }

    setLoading(true);

    try {
      const finalPrompt = `
Candidate Name: ${name}
Target Job Role: ${jobRole}
Experience Level: ${experience} Years
Additional Details: ${prompt}
`;

      const headers = user?.token
        ? {
            Authorization: `Bearer ${user.token}`,
          }
        : {};

      const { data } = await api.post(
        "/ai/generate-email",
        {
          name,
          jobRole,
          experience,
          prompt: finalPrompt,
        },
        { headers },
      );

      setResult(data);

      /* Guest usage increment */
      if (!user) {
        const newCount = guestUsage + 1;
        localStorage.setItem("guestUsage", newCount);
        setGuestUsage(newCount);
      }

      toast.success("Successfully generated!");
    } catch (error) {
      toast.error("Failed to generate.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopied(type);

    toast.success("Copied!");

    setTimeout(() => {
      setCopied("");
    }, 2000);
  };

  const ResultCard = ({ title, content, type }) => (
    <div className="bg-[#111111] p-6 rounded-2xl border border-gray-800 mb-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-white text-lg">{title}</h3>

        <button
          onClick={() => copyToClipboard(content, type)}
          className="text-gray-400 hover:text-purple-300"
        >
          {copied === type ? (
            <CheckIcon className="w-5 h-5 text-green-400" />
          ) : (
            <ClipboardDocumentIcon className="w-5 h-5" />
          )}
        </button>
      </div>

      <div className="text-sm text-gray-300 whitespace-pre-line leading-7">
        {content}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white px-6 py-10">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
        {/* LEFT PANEL */}
        <div className="w-full lg:w-1/3 bg-[#111111] p-6 rounded-2xl border border-gray-800">
          <h2 className="text-xl font-bold mb-2">New Campaign</h2>

          {/* Guest Usage */}
          {!user && (
            <p className="text-sm text-gray-400 mb-5">
              Free Uses Left:{" "}
              <span className="text-purple-300 font-semibold">
                {2 - guestUsage > 0 ? 2 - guestUsage : 0}
              </span>
            </p>
          )}

          {user && (
            <p className="text-sm text-green-400 mb-5">
              Unlimited Access Enabled
            </p>
          )}

          <form onSubmit={handleGenerate} className="flex flex-col">
            <label className="text-sm text-gray-400 mb-2">Your Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="mb-4 bg-[#050505] border border-gray-800 rounded-xl px-4 py-3 text-white"
            />

            <label className="text-sm text-gray-400 mb-2">
              Target Job Role
            </label>
            <input
              type="text"
              value={jobRole}
              onChange={(e) => setJobRole(e.target.value)}
              placeholder="Frontend Developer"
              className="mb-4 bg-[#050505] border border-gray-800 rounded-xl px-4 py-3 text-white"
            />

            <label className="text-sm text-gray-400 mb-2">Experience</label>

            <select
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              className="mb-4 bg-[#050505] border border-gray-800 rounded-xl px-4 py-3 text-white"
            >
              <option value="0-1">0 - 1 Years</option>
              <option value="1-2">1 - 2 Years</option>
              <option value="2-3">2 - 3 Years</option>
              <option value="3-5">3 - 5 Years</option>
              <option value="5-10">5 - 10 Years</option>
              <option value="10+">10+ Years</option>
            </select>

            <label className="text-sm text-gray-400 mb-2">
              Additional Details
            </label>

            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Skills, projects, company..."
              className="h-40 bg-[#050505] border border-gray-800 rounded-xl p-4 text-white resize-none"
            />

            <button
              type="submit"
              disabled={loading}
              className="mt-5 bg-purple-400 text-black py-3 rounded-full font-semibold hover:bg-purple-300"
            >
              {loading ? "Generating..." : "Generate Output"}
            </button>

            {/* Guest Lock */}
            {!user && guestUsage >= 2 && (
              <div className="mt-5 text-center">
                <p className="text-red-400 text-sm mb-3">Free limit reached</p>

                <div className="flex gap-3 justify-center">
                  <Link
                    to="/login"
                    className="px-5 py-2 rounded-full bg-purple-400 text-black font-semibold"
                  >
                    Login
                  </Link>

                  <Link
                    to="/signup"
                    className="px-5 py-2 rounded-full border border-gray-700"
                  >
                    Sign Up
                  </Link>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* RIGHT PANEL */}
        <div className="w-full lg:w-2/3">
          {result ? (
            <>
              <h2 className="text-xl font-bold mb-5">AI Results</h2>

              <ResultCard
                title="Subject Line"
                content={result.subject}
                type="subject"
              />

              <ResultCard
                title="Cold Email"
                content={result.emailBody}
                type="email"
              />

              <ResultCard
                title="LinkedIn DM"
                content={result.linkedInDM}
                type="linkedin"
              />

              <ResultCard
                title="Follow-up Email"
                content={result.followUpEmail}
                type="followup"
              />
            </>
          ) : (
            <div className="h-full min-h-[500px] flex items-center justify-center bg-[#111111] border border-gray-800 rounded-2xl text-gray-500">
              Fill details and generate outreach instantly.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
