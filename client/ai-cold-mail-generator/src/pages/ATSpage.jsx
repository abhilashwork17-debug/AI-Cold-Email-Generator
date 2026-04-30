import React, { useState } from "react";
import api from "../utils/api";
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
      const { data } = await api.post("/ats/analyze", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setResult(data);
      toast.success("Analysis done!");
    } catch {
      toast.error("Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-10">
      <h1 className="text-2xl mb-6 font-bold">ATS Resume Checker</h1>

      <input
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
        className="mb-4"
      />

      <textarea
        placeholder="Paste Job Description"
        value={jobDesc}
        onChange={(e) => setJobDesc(e.target.value)}
        className="w-full p-3 bg-black border border-gray-700 rounded mb-4"
        rows={6}
      />

      <button
        onClick={handleUpload}
        className="bg-purple-400 text-black px-6 py-2 rounded"
      >
        {loading ? "Analyzing..." : "Check ATS Score"}
      </button>

      {result && (
        <div className="mt-6">
          <h2 className="text-xl">ATS Score: {result.score}%</h2>

          <div className="mt-4">
            <h3 className="font-semibold">Missing Keywords:</h3>
            <p>{result.missing.join(", ")}</p>
          </div>

          <div className="mt-4">
            <h3 className="font-semibold">Suggestions:</h3>
            <p>{result.suggestions}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ATSPage;
