const express = require("express");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const axios = require("axios");
const FormData = require("form-data");
const Groq = require("groq-sdk");

const router = express.Router();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Multer setup with 5MB file size limit and PDF file filter
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf" || file.originalname.endsWith(".pdf")) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"));
    }
  }
});

// POST /api/ats/analyze
router.post("/analyze", upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const jobDesc = req.body.jobDesc || "";
    let nlpResult = null;

    // 1. Try Python NLP Microservice First (Port 8000)
    try {
      const formData = new FormData();
      formData.append("resume", req.file.buffer, {
        filename: req.file.originalname || "resume.pdf",
        contentType: "application/pdf"
      });
      formData.append("jobDesc", jobDesc);

      const pyRes = await axios.post("http://localhost:8000/analyze", formData, {
        headers: formData.getHeaders(),
        timeout: 5000 // 5s timeout
      });

      nlpResult = pyRes.data;
    } catch (pyErr) {
      console.log("ℹ️ Python NLP microservice offline or timed out, falling back to Node.js parser.");
    }

    // 2. Fallback to Node.js Parsing if Python Microservice is unavailable
    if (!nlpResult) {
      let resumeText = "";
      try {
        const data = await pdfParse(req.file.buffer);
        resumeText = (data.text || "").toLowerCase();
      } catch (err) {
        console.error("❌ PDF PARSE ERROR:", err.message);
        return res.status(500).json({ message: "Invalid or unreadable PDF" });
      }

      const cleanJob = jobDesc.toLowerCase();
      const stopWords = ["with", "that", "this", "have", "from", "your", "will"];

      const keywords = cleanJob
        ? cleanJob.split(/\W+/).filter((w) => w.length > 3 && !stopWords.includes(w))
        : [];

      const normalize = (text) => text.replace(/react\.js/g, "react").replace(/node\.js/g, "node").replace(/javascript/g, "js");
      const cleanResume = normalize(resumeText);

      let matchCount = 0;
      const missing = [];
      keywords.forEach((word) => {
        if (cleanResume.includes(word)) matchCount++;
        else missing.push(word);
      });

      const keywordScore = keywords.length > 0 ? Math.min((matchCount / keywords.length) * 60, 60) : 0;
      const sections = ["education", "experience", "skills", "projects"];
      let sectionScore = 0;
      sections.forEach((sec) => { if (cleanResume.includes(sec)) sectionScore += 5; });

      const formatScore = cleanResume.length > 1000 ? 15 : 8;
      const readabilityScore = cleanResume.split(" ").length > 300 ? 15 : 8;
      const totalScore = Math.min(Math.round(keywordScore + sectionScore + formatScore + readabilityScore), 100);

      const suggestions = [];
      if (totalScore > 80) suggestions.push("Your resume is strong and well aligned with the job role");
      else if (totalScore > 60) suggestions.push("Your resume is decent but needs improvement to better match the job");
      else suggestions.push("Your resume needs significant improvement to pass ATS filters");

      if (missing.length > 0) {
        suggestions.push(`Missing important skills: ${missing.slice(0, 5).join(", ")}`);
      }

      nlpResult = {
        score: totalScore,
        breakdown: {
          keywordScore: Math.round(keywordScore),
          sectionScore,
          formatScore,
          readabilityScore,
        },
        missing: missing.slice(0, 10),
        suggestions
      };
    }

    // 3. Groq AI Qualitative Review
    let aiFeedback = "";
    if (process.env.GROQ_API_KEY) {
      try {
        let textSample = "";
        try {
          const parsedData = await pdfParse(req.file.buffer);
          textSample = (parsedData.text || "").slice(0, 1500);
        } catch (e) {
          textSample = "Resume text extracted";
        }

        const completion = await groq.chat.completions.create({
          model: "llama-3.1-8b-instant",
          messages: [
            { role: "system", content: "You are an expert ATS resume reviewer." },
            {
              role: "user",
              content: `Analyze this resume snippet and give clear improvement feedback.\n\nResume:\n${textSample}\n\nJob Description:\n${jobDesc}\n\nGive:\n1. Overall evaluation\n2. Key improvements\n3. Missing skills\n4. Formatting suggestions\n\nKeep it short and structured.`
            }
          ]
        });

        aiFeedback = (completion.choices[0]?.message?.content || "")
          .replace(/\*\*/g, "")
          .replace(/#/g, "")
          .replace(/\*/g, "")
          .trim();
      } catch (err) {
        console.error("Groq Error:", err.message);
        aiFeedback = "AI feedback not available right now.";
      }
    } else {
      aiFeedback = "Groq API Key not configured for detailed AI feedback.";
    }

    nlpResult.aiFeedback = aiFeedback;

    res.json(nlpResult);

  } catch (error) {
    console.error("❌ ATS ERROR FULL:", error);
    res.status(500).json({ message: error.message || "ATS failed" });
  }
});

module.exports = router;