const express = require("express");
const multer = require("multer");
const pdfParse = require("pdf-parse/lib/pdf-parse");

const router = express.Router();
const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Multer setup
const storage = multer.memoryStorage();
const upload = multer({ storage });

// POST /api/ats/analyze
router.post("/analyze", upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Extract text from PDF (SAFE)
    let resumeText = "";
    try {
      const data = await pdfParse(req.file.buffer);
      resumeText = (data.text || "").toLowerCase();
    } catch (err) {
      console.error("❌ PDF PARSE ERROR:", err.message);
      return res.status(500).json({ message: "Invalid or unreadable PDF" });
    }

    const jobDesc = (req.body.jobDesc || "").toLowerCase();

    // STOPWORDS
    const stopWords = ["with", "that", "this", "have", "from", "your", "will"];

    // Extract keywords
    const keywords = jobDesc
      ? jobDesc.split(/\W+/).filter(
        (w) => w.length > 3 && !stopWords.includes(w)
      )
      : [];

    // NORMALIZATION
    const normalize = (text) => {
      return text
        .replace(/react\.js/g, "react")
        .replace(/node\.js/g, "node")
        .replace(/javascript/g, "js");
    };

    const cleanResume = normalize(resumeText);

    let matchCount = 0;
    const missing = [];

    keywords.forEach((word) => {
      if (cleanResume.includes(word)) {
        matchCount++;
      } else {
        missing.push(word);
      }
    });

    // Keyword score
    const keywordScore =
      keywords.length > 0
        ? Math.min((matchCount / keywords.length) * 60, 60)
        : 0;

    // Section detection
    const sections = ["education", "experience", "skills", "projects"];
    let sectionScore = 0;

    sections.forEach((sec) => {
      if (cleanResume.includes(sec)) {
        sectionScore += 5;
      }
    });

    // Formatting
    const formatScore = cleanResume.length > 1000 ? 15 : 8;

    // Readability
    const readabilityScore =
      cleanResume.split(" ").length > 300 ? 15 : 8;

    const totalScore = Math.min(
      Math.round(
        keywordScore + sectionScore + formatScore + readabilityScore
      ),
      100
    );

    // 🔥 STRONG SUGGESTIONS (UNCHANGED)
    const suggestions = [];

    if (totalScore > 80) {
      suggestions.push(
        "Your resume is strong and well aligned with the job role"
      );
    } else if (totalScore > 60) {
      suggestions.push(
        "Your resume is decent but needs improvement to better match the job"
      );
    } else {
      suggestions.push(
        "Your resume needs significant improvement to pass ATS filters"
      );
    }

    if (missing.length > 0) {
      suggestions.push(
        `Missing important skills: ${missing.slice(0, 5).join(", ")}`
      );
      suggestions.push(
        "Add more job-specific keywords from the job description"
      );
    }

    if (sectionScore < 15) {
      suggestions.push(
        "Include all key sections: Education, Skills, Experience, Projects"
      );
    } else {
      suggestions.push("All important sections are well structured");
    }

    if (formatScore < 10) {
      suggestions.push(
        "Improve resume formatting and spacing for better readability"
      );
    } else {
      suggestions.push("Resume formatting looks clean and professional");
    }

    if (readabilityScore < 10) {
      suggestions.push(
        "Add more detailed descriptions and bullet points"
      );
    } else {
      suggestions.push("Content is clear and well explained");
    }

    // 🤖 GROQ AI FEEDBACK (FIXED + CLEANED)
    let aiFeedback = "";

    try {
      const completion = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content: "You are an expert ATS resume reviewer.",
          },
          {
            role: "user",
            content: `
Analyze this resume and give clear improvement feedback.

Resume:
${resumeText.slice(0, 1500)}

Job Description:
${jobDesc}

Give:
1. Overall evaluation
2. Key improvements
3. Missing skills
4. Formatting suggestions

Keep it short and structured.
            `,
          },
        ],
      });

      aiFeedback = completion.choices[0].message.content;

      // ✅ CLEAN MARKDOWN SYMBOLS
      aiFeedback = aiFeedback
        .replace(/\*\*/g, "")
        .replace(/#/g, "")
        .replace(/\*/g, "")
        .trim();

    } catch (err) {
      console.error("Groq Error:", err.message);
      aiFeedback = "AI feedback not available right now.";
    }

    // RESPONSE
    res.json({
      score: totalScore,
      breakdown: {
        keywordScore: Math.round(keywordScore),
        sectionScore,
        formatScore,
        readabilityScore,
      },
      missing: missing.slice(0, 10),
      suggestions,
      aiFeedback,
    });

  } catch (error) {
    console.error("❌ ATS ERROR FULL:", error);
    console.error("❌ MESSAGE:", error.message);
    res.status(500).json({ message: "ATS failed" });
  }
});

module.exports = router;