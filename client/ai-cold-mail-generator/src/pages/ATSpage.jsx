import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";

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

      setResult(data);

      toast.success("Analysis done!");
    } catch (error) {
      toast.error("Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white px-6 py-10">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <h1 className="text-5xl font-black tracking-tight text-purple-300 mb-4">
            ATS Resume Analyzer
          </h1>

          <p className="text-gray-400 text-lg">
            Optimize your resume for Applicant Tracking Systems using AI.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="bg-[#111111] border border-gray-800 rounded-3xl p-8 mb-10"
        >
          <div className="mb-5">
            <label className="block mb-3 text-sm text-gray-400">
              Upload Resume
            </label>

            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              className="w-full bg-black border border-gray-800 rounded-2xl p-4 text-gray-300"
            />
          </div>

          <div className="mb-6">
            <label className="block mb-3 text-sm text-gray-400">
              Job Description
            </label>

            <textarea
              placeholder="Paste Job Description"
              value={jobDesc}
              onChange={(e) => setJobDesc(e.target.value)}
              className="w-full p-5 bg-black border border-gray-800 rounded-2xl focus:outline-none focus:border-purple-400 transition-all duration-300 resize-none"
              rows={8}
            />
          </div>

          <button
            onClick={handleUpload}
            className="w-full bg-purple-400 hover:bg-purple-300 text-black py-4 rounded-2xl font-bold transition-all duration-300"
          >
            {loading ? "Analyzing Resume..." : "Analyze Resume"}
          </button>
        </motion.div>

        {result && (
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="bg-[#111111] border border-gray-800 rounded-3xl p-8 text-center relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-purple-500/10 blur-3xl"></div>

              <div className="relative z-10">
                <div className="w-full h-4 bg-black rounded-full overflow-hidden mb-6">
                  <motion.div
                    initial={{ width: "0%" }}
                    animate={{ width: `${result.score || 0}%` }}
                    transition={{ duration: 2 }}
                    className="h-full bg-purple-400"
                  />
                </div>

                <h2 className="text-6xl font-black text-purple-300">
                  {result.score || 0}%
                </h2>

                <p className="text-gray-400 mt-4 text-lg">
                  ATS Compatibility Score
                </p>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7 }}
                className="bg-[#111111] border border-gray-800 rounded-3xl p-6"
              >
                <h3 className="text-2xl font-bold text-purple-300 mb-6">
                  Suggestions
                </h3>

                <div className="space-y-4">
                  {(result.suggestions || []).map((s, i) => (
                    <div
                      key={i}
                      className="bg-black border border-gray-800 rounded-2xl p-4 text-gray-300"
                    >
                      {s}
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7 }}
                className="bg-[#111111] border border-gray-800 rounded-3xl p-6"
              >
                <h3 className="text-2xl font-bold text-purple-300 mb-6">
                  Missing Keywords
                </h3>

                {result.missing && result.missing.length > 0 ? (
                  <div className="flex flex-wrap gap-3">
                    {result.missing.map((item, i) => (
                      <div
                        key={i}
                        className="bg-black border border-gray-800 px-4 py-2 rounded-2xl text-gray-300"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-black border border-gray-800 rounded-2xl p-4 text-gray-400">
                    No critical keywords missing
                  </div>
                )}
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="bg-[#111111] border border-gray-800 rounded-3xl p-6"
            >
              <h3 className="text-2xl font-bold text-purple-300 mb-6">
                AI Resume Analysis
              </h3>

              <div className="bg-black border border-gray-800 rounded-2xl p-6 text-gray-300 whitespace-pre-line leading-relaxed">
                {result.aiFeedback || "AI feedback not available"}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9 }}
              className="bg-[#111111] border border-gray-800 rounded-3xl p-6"
            >
              <h3 className="text-2xl font-bold text-purple-300 mb-6">
                Score Breakdown
              </h3>

              <div className="space-y-5">
                <div>
                  <div className="flex justify-between mb-2">
                    <span>Keywords</span>
                    <span>{result.breakdown?.keywordScore || 0}/60</span>
                  </div>

                  <div className="w-full h-3 bg-black rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: "0%" }}
                      animate={{
                        width: `${((result.breakdown?.keywordScore || 0) / 60) * 100}%`,
                      }}
                      transition={{ duration: 1.5 }}
                      className="h-full bg-purple-400"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span>Sections</span>
                    <span>{result.breakdown?.sectionScore || 0}/20</span>
                  </div>

                  <div className="w-full h-3 bg-black rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: "0%" }}
                      animate={{
                        width: `${((result.breakdown?.sectionScore || 0) / 20) * 100}%`,
                      }}
                      transition={{ duration: 1.5 }}
                      className="h-full bg-blue-400"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span>Formatting</span>
                    <span>{result.breakdown?.formatScore || 0}/15</span>
                  </div>

                  <div className="w-full h-3 bg-black rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: "0%" }}
                      animate={{
                        width: `${((result.breakdown?.formatScore || 0) / 15) * 100}%`,
                      }}
                      transition={{ duration: 1.5 }}
                      className="h-full bg-green-400"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span>Readability</span>
                    <span>{result.breakdown?.readabilityScore || 0}/15</span>
                  </div>

                  <div className="w-full h-3 bg-black rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: "0%" }}
                      animate={{
                        width: `${((result.breakdown?.readabilityScore || 0) / 15) * 100}%`,
                      }}
                      transition={{ duration: 1.5 }}
                      className="h-full bg-yellow-400"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ATSPage;
