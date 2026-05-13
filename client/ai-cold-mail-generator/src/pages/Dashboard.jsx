import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { ClipboardDocumentIcon, CheckIcon } from "@heroicons/react/24/outline";

const Dashboard = () => {
  const { user } = useAuth();

  const [name, setName] = useState("");
  const [jobRole, setJobRole] = useState("");
  const [experience, setExperience] = useState("0-1");
  const [tone, setTone] = useState("Professional");
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

    if (!user && guestUsage >= 2) return;

    setLoading(true);

    try {
      const finalPrompt = `
Candidate Name: ${name}
Target Job Role: ${jobRole}
Experience Level: ${experience} Years
Tone: ${tone}
Additional Details: ${prompt}
`;

      const headers = user?.token
        ? { Authorization: `Bearer ${user.token}` }
        : {};

      const { data } = await api.post(
        "/ai/generate-email",
        {
          name,
          jobRole,
          experience,
          tone,
          prompt: finalPrompt,
        },
        { headers },
      );

      setResult(data);

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

  const isBlocked = !user && guestUsage >= 2;

  const SectionCard = ({ title, content, type, subject }) => {
    const handleCopy = (e) => {
      e.preventDefault();
      e.stopPropagation();

      const scrollY = window.scrollY;

      let textToCopy = content;

      if (type === "email") {
        textToCopy = `Subject: ${subject}\n\n${content}`;
      }

      navigator.clipboard.writeText(textToCopy);

      setCopied(type);
      toast.success("Copied!");

      window.scrollTo({
        top: scrollY,
        behavior: "instant",
      });

      setTimeout(() => setCopied(""), 2000);
    };

    return (
      <div className="bg-[#111111] p-6 rounded-2xl border border-gray-800 mb-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">{title}</h3>

          <button
            type="button"
            onClick={handleCopy}
            className="text-gray-400 hover:text-purple-300 focus:outline-none"
          >
            {copied === type ? (
              <CheckIcon className="w-5 h-5 text-green-400" />
            ) : (
              <ClipboardDocumentIcon className="w-5 h-5" />
            )}
          </button>
        </div>

        <div className="bg-[#050505] p-5 rounded-xl border border-gray-700 text-gray-300 whitespace-pre-line leading-7">
          {content?.replace(/\\n/g, "\n")}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white px-6 py-10 relative">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-1/3 bg-[#111111] p-6 rounded-2xl border border-gray-800">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold">New Campaign</h2>
          </div>

          {!user ? (
            <p className="text-sm text-gray-400 mb-5">
              Free Uses Left:{" "}
              <span className="text-purple-300 font-semibold">
                {2 - guestUsage > 0 ? 2 - guestUsage : 0}
              </span>
            </p>
          ) : (
            <p className="text-sm text-green-400 mb-5">
              Unlimited Access Enabled
            </p>
          )}

          <form onSubmit={handleGenerate} className="flex flex-col">
            <label className="text-sm text-gray-400 mb-2">Your Name</label>

            <input
              disabled={isBlocked}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mb-4 bg-[#050505] border border-gray-800 rounded-xl px-4 py-3"
            />

            <label className="text-sm text-gray-400 mb-2">
              Target Job Role
            </label>

            <input
              disabled={isBlocked}
              value={jobRole}
              onChange={(e) => setJobRole(e.target.value)}
              className="mb-4 bg-[#050505] border border-gray-800 rounded-xl px-4 py-3"
            />

            <label className="text-sm text-gray-400 mb-2">Experience</label>

            <select
              disabled={isBlocked}
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              className="mb-4 bg-[#050505] border border-gray-800 rounded-xl px-4 py-3"
            >
              <option value="intern">Intern</option>
              <option value="0-1">0 - 1 Years</option>
              <option value="1-2">1 - 2 Years</option>
              <option value="2-3">2 - 3 Years</option>
              <option value="3-5">3 - 5 Years</option>
              <option value="5-10">5 - 10 Years</option>
              <option value="10+">10+ Years</option>
            </select>

            <label className="text-sm text-gray-400 mb-2">Tone</label>

            <select
              disabled={isBlocked}
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="mb-4 bg-[#050505] border border-gray-800 rounded-xl px-4 py-3"
            >
              <option value="Professional">Professional</option>
              <option value="Friendly">Friendly</option>
              <option value="Formal">Formal</option>
              <option value="Confident">Confident</option>
              <option value="Persuasive">Persuasive</option>
            </select>

            <textarea
              disabled={isBlocked}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={10}
              placeholder={`Skills: React, Node.js  

Projects:
- Chat App
- AI Project  

Experience Summary:

Goal:`}
              className="bg-[#050505] border border-gray-800 rounded-xl p-4 resize-none placeholder:text-gray-400"
            />

            <button
              disabled={loading || isBlocked}
              className="mt-5 bg-purple-400 text-black py-3 rounded-full font-semibold"
            >
              {loading ? "Generating..." : "Generate Output"}
            </button>
          </form>
        </div>

        <div className="w-full lg:w-2/3">
          {result ? (
            <>
              <h2 className="text-xl font-bold mb-5">AI Results</h2>

              <SectionCard
                title="Subject"
                content={result.subject}
                type="subject"
              />

              <SectionCard
                title="Cold Email"
                content={result.emailBody}
                type="email"
                subject={result.subject}
              />

              <SectionCard
                title="LinkedIn Message"
                content={result.linkedInDM}
                type="linkedin"
              />

              <SectionCard
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

      {isBlocked && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
          <div className="bg-[#111111] border border-gray-800 rounded-3xl p-8 max-w-md text-center">
            <h2 className="text-2xl font-bold mb-3">Login Required</h2>

            <p className="text-gray-400 mb-6">
              You've used your 2 free generations. Please login to continue.
            </p>

            <div className="flex gap-3">
              <a
                href="/login"
                className="flex-1 bg-purple-400 py-3 rounded-full text-black font-semibold"
              >
                Sign In
              </a>

              <a
                href="/signup"
                className="flex-1 border border-gray-700 py-3 rounded-full"
              >
                Sign Up
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
