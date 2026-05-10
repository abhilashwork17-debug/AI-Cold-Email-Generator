import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

const ATSPage = () => {
  const [file, setFile] = useState(null);
  const [jobDesc, setJobDesc] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file || !jobDesc.trim()) {
      toast.error("Upload resume and job description");
      return;
    }

    const formData = new FormData();
    formData.append("resume", file);
    formData.append("jobDesc", jobDesc);

    setLoading(true);

    try {
      const { data } = await axios.post(
        "http://localhost:3000/api/ats/analyze",
        formData,
      );

      console.log("API RESPONSE:", data);

      setResult(data);
      toast.success("Analysis done!");
    } catch (error) {
      console.log("FULL ERROR:", error);
      console.log("RESPONSE:", error.response);
      console.log("DATA:", error.response?.data);
      console.log("STATUS:", error.response?.status);

      toast.error("Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#111111] to-[#0a0a0a] text-white px-6 py-10">
      <div className="max-w-5xl mx-auto">
        {/* HEADER */}
        <h1 className="text-3xl font-bold mb-8 text-center">
          ATS Resume Checker
        </h1>

        {/* INPUT CARD */}
        <div className="bg-[#111111]/80 backdrop-blur-lg border border-gray-800 rounded-3xl p-6 shadow-lg">
          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            className="mb-4 w-full text-gray-300"
          />

          <textarea
            placeholder="Paste Job Description"
            value={jobDesc}
            onChange={(e) => setJobDesc(e.target.value)}
            className="w-full p-4 bg-[#050505] border border-gray-700 rounded-xl mb-4 focus:outline-none focus:border-purple-400 transition"
            rows={6}
          />

          <button
            onClick={handleUpload}
            className="w-full bg-purple-400 text-black py-3 rounded-xl font-semibold hover:bg-purple-300 transition-all duration-300"
          >
            {loading ? "Analyzing..." : "Check ATS Score"}
          </button>
        </div>

        {/* RESULT SECTION */}
        {result && (
          <div className="mt-10 space-y-6">
            {/* SCORE */}
            <div className="bg-[#111111]/80 backdrop-blur-lg border border-gray-800 rounded-3xl p-6 text-center shadow-lg">
              <h2 className="text-3xl font-bold text-purple-300">
                {result.score || 0}%
              </h2>
              <p className="text-gray-400 mt-2">ATS Compatibility Score</p>
            </div>

            {/* FEEDBACK */}
            <div className="bg-[#111111]/80 backdrop-blur-lg border border-gray-800 rounded-3xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold mb-4">Feedback</h3>

              <div className="space-y-3 text-gray-300">
                {/* Overall */}
                <p>
                  <strong>Overall:</strong>{" "}
                  {result.score > 80
                    ? "Your resume is strong and well-optimized."
                    : result.score > 60
                      ? "Your resume is decent but needs improvement."
                      : "Your resume needs significant improvement."}
                </p>

                {/* Suggestions */}
                <div>
                  <strong>Suggestions:</strong>
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    {(result.suggestions || ["No suggestions available"]).map(
                      (s, i) => (
                        <li key={i}>{s}</li>
                      ),
                    )}
                  </ul>
                </div>

                {/* Missing Keywords */}
                <div>
                  <strong>Missing Keywords:</strong>
                  <p className="mt-1">
                    {result.missing && result.missing.length > 0
                      ? result.missing.join(", ")
                      : "No critical keywords missing"}
                  </p>
                </div>

                {/* 🤖 AI FEEDBACK (NEW - ONLY ADDITION) */}
                <div>
                  <strong>AI Analysis:</strong>
                  <p className="mt-2 whitespace-pre-line">
                    {result.aiFeedback || "AI feedback not available"}
                  </p>
                </div>
              </div>
            </div>

            {/* BREAKDOWN */}
            <div className="bg-[#111111]/80 backdrop-blur-lg border border-gray-800 rounded-3xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold mb-4">Score Breakdown</h3>
              <div className="space-y-2 text-gray-300">
                <p>Keywords: {result.breakdown?.keywordScore || 0}/60</p>
                <p>Sections: {result.breakdown?.sectionScore || 0}/20</p>
                <p>Formatting: {result.breakdown?.formatScore || 0}/15</p>
                <p>Readability: {result.breakdown?.readabilityScore || 0}/15</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ATSPage;
