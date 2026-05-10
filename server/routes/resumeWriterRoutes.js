const express = require("express");
const multer = require("multer");
const pdfParse = require("pdf-parse/lib/pdf-parse");
const Groq = require("groq-sdk");

const router = express.Router();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// multer
const storage = multer.memoryStorage();
const upload = multer({ storage });

// POST /api/resume/rewrite
router.post("/rewrite", upload.single("resume"), async (req, res) => {
  try {
    if (!req.file || !req.body.jobDesc) {
      return res.status(400).json({ message: "Missing resume or job description" });
    }

    // 📄 Extract resume text
    let resumeText = "";
    try {
      const data = await pdfParse(req.file.buffer);
      resumeText = data.text;
    } catch (err) {
      return res.status(500).json({ message: "Invalid PDF" });
    }

    const jobDesc = req.body.jobDesc;

    // 🤖 GROQ AI
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: "You are an expert ATS resume optimizer.",
        },
        {
          role: "user",
          content: `
Rewrite this resume to match the job description.

Rules:
- Improve bullet points with strong action verbs
- Add missing keywords from job description
- Keep it concise and professional
- Make it ATS-friendly
- Do NOT add fake info

Resume:
${resumeText.slice(0, 2000)}

Job Description:
${jobDesc}
          `,
        },
      ],
    });

    res.json({
      rewrittenResume: completion.choices[0].message.content,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Rewrite failed" });
  }
});

module.exports = router;