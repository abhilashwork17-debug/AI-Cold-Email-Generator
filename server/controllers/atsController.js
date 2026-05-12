const fs = require("fs");
const pdfParse = require("pdf-parse");

exports.analyzeResume = async (req, res) => {
  try {
    const stopWords = new Set([
      "with",
      "have",
      "from",
      "that",
      "this",
      "will",
      "your",
      "about",
      "their",
      "there",
      "which",
      "would",
      "could",
      "should",
      "both",
      "side",
      "client",
      "server",
      "functional",
      "capable",
      "good",
      "strong",
      "using",
      "used",
      "into",
      "over",
      "under",
      "through",
      "while",
      "where",
      "when",
      "what",
      "were",
      "been",
      "being",
      "able",
      "very",
      "also",
      "than",
      "then",
      "them",
      "they",
      "some",
      "many",
      "more",
      "most",
      "such",
      "each",
      "other",
      "like",
      "just",
      "only",
      "across",
      "accomplished",
      "responsible",
      "development",
      "developer",
      "engineering",
      "software",
      "team",
      "project",
      "projects",
      "application",
      "system",
      "work",
      "working",
      "skills",
      "skill",
      "knowledge",
      "experience",
      "experiences",
      "resume",
      "job",
      "role",
      "candidate",
      "position",
      "requirements",
      "requirement",
      "preferred",
      "ability",
      "understanding",
      "including",
      "ensure",
      "support",
      "supporting",
      "manage",
      "management",
      "managing",
    ]);

    const normalizeText = (text) => {
      return text
        .toLowerCase()
        .replace(/[^a-z0-9+#.\-\s]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
    };

    const jobDesc = normalizeText(req.body.jobDesc);

    const dataBuffer = fs.readFileSync(req.file.path);
    const pdfData = await pdfParse(dataBuffer);

    const resumeText = normalizeText(pdfData.text);

    const words = jobDesc
      .split(" ")
      .map((word) => word.trim())
      .filter(
        (word) =>
          word.length > 2 &&
          !stopWords.has(word) &&
          /^[a-zA-Z0-9+#.\-]+$/.test(word)
      );

    const frequencyMap = {};

    words.forEach((word) => {
      frequencyMap[word] = (frequencyMap[word] || 0) + 1;
    });

    const uniqueKeywords = Object.keys(frequencyMap)
      .sort((a, b) => frequencyMap[b] - frequencyMap[a])
      .slice(0, 40);

    const matchedKeywords = [];
    const missingKeywords = [];

    uniqueKeywords.forEach((keyword) => {
      if (resumeText.includes(keyword)) {
        matchedKeywords.push(keyword);
      } else {
        missingKeywords.push(keyword);
      }
    });

    const totalKeywords = uniqueKeywords.length;

    const matchedCount = matchedKeywords.length;

    const missingCount = missingKeywords.length;

    const keywordMatchPercentage = Math.floor(
      (matchedCount / totalKeywords) * 100
    );

    const keywordScore = Math.min(
      60,
      Math.floor((keywordMatchPercentage / 100) * 60)
    );

    const sections = [
      "education",
      "experience",
      "skills",
      "projects",
      "certifications",
      "internship",
      "achievements",
      "summary",
    ];

    let sectionFound = 0;

    sections.forEach((section) => {
      if (resumeText.includes(section)) {
        sectionFound++;
      }
    });

    const sectionScore = Math.min(
      20,
      Math.floor((sectionFound / sections.length) * 20)
    );

    let formatScore = 15;

    if (resumeText.length < 500) {
      formatScore -= 5;
    }

    if (resumeText.length > 7000) {
      formatScore -= 3;
    }

    if (
      resumeText.includes("table") ||
      resumeText.includes("image")
    ) {
      formatScore -= 3;
    }

    if (formatScore < 0) {
      formatScore = 0;
    }

    const sentences = resumeText
      .split(/[.!?]/)
      .filter((s) => s.trim().length > 0);

    const avgSentenceLength =
      sentences.reduce((acc, curr) => acc + curr.length, 0) /
      (sentences.length || 1);

    let readabilityScore = 15;

    if (avgSentenceLength > 180) {
      readabilityScore -= 5;
    }

    if (avgSentenceLength > 250) {
      readabilityScore -= 5;
    }

    if (readabilityScore < 0) {
      readabilityScore = 0;
    }

    const totalScore =
      keywordScore +
      sectionScore +
      formatScore +
      readabilityScore;

    const suggestions = [];

    if (missingKeywords.length > 0) {
      suggestions.push(
        "Add more job-specific keywords and technical skills from the job description."
      );
    }

    if (sectionScore < 15) {
      suggestions.push(
        "Include important resume sections like Skills, Experience, Projects, and Certifications."
      );
    }

    if (formatScore < 12) {
      suggestions.push(
        "Avoid overly complex formatting, tables, graphics, and images for better ATS compatibility."
      );
    }

    if (readabilityScore < 12) {
      suggestions.push(
        "Use concise bullet points and shorter sentences to improve readability."
      );
    }

    if (matchedKeywords.length < 10) {
      suggestions.push(
        "Increase alignment between your resume and the job description by adding more relevant domain-specific keywords."
      );
    }

    if (totalScore >= 85) {
      suggestions.push(
        "Excellent ATS compatibility. Your resume is highly optimized for this role."
      );
    }

    res.json({
      score: totalScore,
      breakdown: {
        keywordScore,
        sectionScore,
        formatScore,
        readabilityScore,
      },
      totalKeywords,
      matchedCount,
      missingCount,
      keywordMatchPercentage,
      matchedKeywords: matchedKeywords.slice(0, 20),
      missing: missingKeywords.slice(0, 15),
      suggestions,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Error analyzing resume",
    });
  }
};