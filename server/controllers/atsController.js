const fs = require("fs");
const pdfParse = require("pdf-parse");

exports.analyzeResume = async (req, res) => {
  try {
    const jobDesc = req.body.jobDesc.toLowerCase();

    const dataBuffer = fs.readFileSync(req.file.path);
    const pdfData = await pdfParse(dataBuffer);

    const resumeText = pdfData.text.toLowerCase();

    // =========================
    // 1. KEYWORD MATCH (50%)
    // =========================
    const jobWords = jobDesc.split(/\W+/).filter(w => w.length > 3);
    const resumeWords = new Set(resumeText.split(/\W+/));

    let matchCount = 0;
    let missing = [];

    jobWords.forEach((word) => {
      if (resumeWords.has(word)) {
        matchCount++;
      } else {
        missing.push(word);
      }
    });

    const keywordScore = Math.min(50, (matchCount / jobWords.length) * 50);

    // =========================
    // 2. SECTION DETECTION (20%)
    // =========================
    const sections = ["education", "experience", "skills", "projects"];
    let sectionFound = 0;

    sections.forEach(sec => {
      if (resumeText.includes(sec)) sectionFound++;
    });

    const sectionScore = (sectionFound / sections.length) * 20;

    // =========================
    // 3. FORMATTING (15%)
    // =========================
    let formatScore = 15;

    if (resumeText.length < 300) formatScore -= 5;
    if (resumeText.includes("table")) formatScore -= 3;
    if (resumeText.includes("image")) formatScore -= 3;

    // =========================
    // 4. READABILITY (15%)
    // =========================
    const sentences = resumeText.split(".");
    const avgLength =
      sentences.reduce((acc, s) => acc + s.length, 0) / sentences.length;

    let readabilityScore = 15;
    if (avgLength > 200) readabilityScore -= 5;

    // =========================
    // FINAL SCORE
    // =========================
    const totalScore = Math.floor(
      keywordScore + sectionScore + formatScore + readabilityScore
    );

    res.json({
      score: totalScore,
      breakdown: {
        keywordScore: Math.floor(keywordScore),
        sectionScore: Math.floor(sectionScore),
        formatScore: Math.floor(formatScore),
        readabilityScore: Math.floor(readabilityScore),
      },
      missing: missing.slice(0, 10),
      suggestions: [
        "Add missing keywords from job description",
        "Ensure sections like Skills, Experience are present",
        "Avoid tables and images in resume",
        "Keep sentences concise and readable"
      ]
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error analyzing resume" });
  }
};