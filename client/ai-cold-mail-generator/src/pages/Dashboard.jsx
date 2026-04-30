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
  const [experience, setExperience] = useState("0-2");
  const [prompt, setPrompt] = useState("");
  const [tone, setTone] = useState("formal");

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState("");
  const [guestUsage, setGuestUsage] = useState(0);

  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const count = localStorage.getItem("guestUsage");
    setGuestUsage(Number(count) || 0);
  }, []);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user?.token) return;

      try {
        const { data } = await api.get("/ai/history", {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });

        setHistory(data);
      } catch (err) {
        console.log("Failed to fetch history");
      }
    };

    fetchHistory();
  }, [user]);

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
Write a ${tone} professional cold outreach email.

Candidate Name: ${name}
Target Job Role: ${jobRole}
Experience Level: ${experience} Years

Additional Details:
${prompt}

Make sure the tone is clearly ${tone}.
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

      if (user) {
        setHistory((prev) => [data, ...prev]);
      }

      toast.success("Successfully generated!");
    } catch {
      toast.error("Failed to generate.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async () => {
    if (!name.trim() || !jobRole.trim()) {
      toast.error("Missing data to regenerate");
      return;
    }

    setLoading(true);

    try {
      const finalPrompt = `
Write a ${tone} professional cold outreach email.

Candidate Name: ${name}
Target Job Role: ${jobRole}
Experience Level: ${experience} Years

Additional Details:
${prompt}

Make sure the tone is clearly ${tone}.
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

      if (user) {
        setHistory((prev) => [data, ...prev]);
      }

      toast.success("Regenerated!");
    } catch {
      toast.error("Failed to regenerate.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ NEW DELETE FUNCTION
  const handleDelete = async (id) => {
    try {
      await api.delete(`/ai/history/${id}`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      setHistory((prev) => prev.filter((item) => item._id !== id));

      toast.success("Deleted!");
    } catch {
      toast.error("Failed to delete");
    }
  };

  const SectionCard = ({ title, content, type, subject }) => {
    const handleCopy = (e) => {
      e.preventDefault();
      e.stopPropagation();

      let textToCopy = content;

      if (type === "email") {
        textToCopy = `Subject: ${subject}\n\n${content}`;
      }

      navigator.clipboard.writeText(textToCopy);
      setCopied(type);
      toast.success("Copied!");
    };

    return (
      <div className="bg-[#111111] p-6 rounded-3xl border border-gray-800 mb-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">{title}</h3>

          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleCopy}
            className="text-gray-400 hover:text-purple-300"
          >
            {copied === type && Date.now() % 2000 < 1000 ? (
              <CheckIcon className="w-5 h-5 text-green-400" />
            ) : (
              <ClipboardDocumentIcon className="w-5 h-5" />
            )}
          </button>
        </div>

        <div className="bg-[#050505] p-5 rounded-2xl border border-gray-700 whitespace-pre-line">
          {content}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white px-6 py-10 relative">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-1/3 bg-[#111111] p-6 rounded-3xl border border-gray-800">
          <h2 className="text-xl font-bold mb-4">New Campaign</h2>

          <form onSubmit={handleGenerate} className="flex flex-col gap-3">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your Name"
              className="p-3 rounded-xl bg-black border border-gray-800"
            />
            <input
              value={jobRole}
              onChange={(e) => setJobRole(e.target.value)}
              placeholder="Job Role"
              className="p-3 rounded-xl bg-black border border-gray-800"
            />

            <select
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              className="p-3 rounded-xl bg-black border border-gray-800"
            >
              <option value="0-2">0-2 Years</option>
              <option value="2-5">2-5 Years</option>
              <option value="5+">5+ Years</option>
              <option value="10+">10+ Years</option>
            </select>

            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="p-3 rounded-xl bg-black border border-gray-800"
            >
              <option value="formal">Formal</option>
              <option value="casual">Casual</option>
              <option value="confident">Confident</option>
              <option value="friendly">Friendly</option>
            </select>

            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="p-3 rounded-xl bg-black border border-gray-800"
              rows={6}
            />

            <button className="bg-purple-400 text-black py-3 rounded-full font-semibold">
              {loading ? "Generating..." : "Generate Output"}
            </button>
          </form>

          <button
            onClick={() => setShowHistory(true)}
            className="mt-4 w-full border border-gray-700 py-3 rounded-full"
          >
            View History
          </button>
        </div>

        <div className="w-full lg:w-2/3">
          {result ? (
            <>
              <div className="mb-4 flex justify-end">
                <button
                  onClick={handleRegenerate}
                  className="bg-yellow-400 text-black px-4 py-2 rounded-full font-semibold"
                >
                  {loading ? "Regenerating..." : "Regenerate"}
                </button>
              </div>

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
            <div className="h-full flex items-center justify-center text-gray-500">
              Generate output to see results
            </div>
          )}
        </div>
      </div>

      {/* UPDATED HISTORY MODAL */}
      {showHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>

          <div className="relative bg-[#111111] p-6 rounded-3xl w-full max-w-2xl max-h-[80vh] overflow-y-auto border border-gray-800">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">History</h2>

              <button
                onClick={() => setShowHistory(false)}
                className="bg-red-500 px-4 py-1 rounded-full text-sm"
              >
                Close
              </button>
            </div>

            {history.map((item, i) => (
              <div
                key={i}
                className="p-4 mb-3 border border-gray-800 rounded-2xl flex justify-between items-center"
              >
                <div
                  onClick={() => {
                    setResult(item);
                    setName(item.name || "");
                    setJobRole(item.jobRole || "");
                    setExperience(item.experience || "0-2");
                    setPrompt(item.prompt || "");
                    setTone(item.tone || "formal");
                    setShowHistory(false);
                  }}
                  className="cursor-pointer flex-1"
                >
                  {item.subject}
                </div>

                <button
                  onClick={() => handleDelete(item._id)}
                  className="ml-4 text-red-400"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
