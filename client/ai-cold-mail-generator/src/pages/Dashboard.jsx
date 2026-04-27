import React, { useState } from "react";
import { toast } from "react-hot-toast";
import api from "../utils/api";
import { ClipboardDocumentIcon, CheckIcon } from "@heroicons/react/24/outline";

const Dashboard = () => {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState("");

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);

    try {
      const { data } = await api.post("/ai/generate-email", { prompt });
      setResult(data);
      toast.success("Successfully generated!");
    } catch (error) {
      toast.error("Failed to generate. Please try again.");
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
    <div className="bg-[#111111] p-6 rounded-2xl border border-gray-800 mb-4 hover:bg-[#1a1a1a] hover:shadow-[0_0_20px_rgba(168,85,247,0.12)] transition-all duration-300">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-white">{title}</h3>

        <button
          onClick={() => copyToClipboard(content, type)}
          className="text-gray-400 hover:text-purple-300 transition-all duration-300 hover:scale-110"
        >
          {copied === type ? (
            <CheckIcon className="w-5 h-5 text-green-400" />
          ) : (
            <ClipboardDocumentIcon className="w-5 h-5" />
          )}
        </button>
      </div>

      <p className="text-sm text-gray-400 whitespace-pre-wrap">{content}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white px-6 py-10">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
        {/* Input Section */}
        <div className="w-full lg:w-1/3 bg-[#111111] p-6 rounded-2xl border border-gray-800 hover:bg-[#1a1a1a] transition-all duration-300">
          <h2 className="text-xl font-bold mb-5">New Campaign</h2>

          <form onSubmit={handleGenerate} className="flex flex-col">
            <label className="text-sm text-gray-400 mb-2">
              Context / Prompt
            </label>

            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Write a cold email for SaaS founder..."
              className="h-72 bg-[#050505] border border-gray-800 rounded-xl p-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-400 resize-none transition-all"
            />

            <button
              type="submit"
              disabled={loading || !prompt.trim()}
              className="mt-5 w-full bg-purple-400 text-black font-semibold py-3 rounded-full hover:bg-purple-300 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Generating..." : "Generate Output"}
            </button>
          </form>
        </div>

        {/* Output Section */}
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
            <div className="h-full min-h-[500px] flex flex-col items-center justify-center bg-[#111111] border border-gray-800 rounded-2xl text-gray-500">
              <div className="w-16 h-16 rounded-full bg-[#1a1a1a] flex items-center justify-center mb-4">
                <ClipboardDocumentIcon className="w-8 h-8 text-purple-300" />
              </div>

              <p>Submit a prompt to generate AI outputs.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
