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
    ]);

    const importantSkills = [
      "react",
      "nextjs",
      "javascript",
      "typescript",
      "nodejs",
      "express",
      "mongodb",
      "mysql",
      "postgresql",
      "redis",
      "docker",
      "kubernetes",
      "aws",
      "azure",
      "firebase",
      "tailwind",
      "python",
      "java",
      "c++",
      "machine learning",
      "deep learning",
      "tensorflow",
      "pytorch",
      "rest api",
      "graphql",
      "jwt",
      "git",
      "github",
      "linux",
      "html",
      "css",
      "socketio",
      "django",
      "flask",
      "fastapi",
      "microservices",
      "devops",
      "ci/cd",
      "figma",
      "seo",
      "nlp",
      "ai",
      "data structures",
      "algorithms",
    ];

    const normalizeText = (text) => {
      return text
        .toLowerCase()
        .replace(/[^a-z0-9+#.\s]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
    };

    const jobDesc = normalizeText(req.body.jobDesc);

    const dataBuffer = fs.readFileSync(req.file.path);
    const pdfData = await pdfParse(dataBuffer);

    const resumeText = normalizeText(pdfData.text);

    const extractedKeywords = [];

    importantSkills.forEach((skill) => {
      if (
        jobDesc.includes(skill) &&
        !extractedKeywords.includes(skill)
      ) {
        extractedKeywords.push(skill);
      }
    });

    const jobWords = jobDesc
      .split(" ")
      .filter(
        (word) =>
          word.length > 2 &&
          !stopWords.has(word)
      );

    jobWords.forEach((word) => {
      if (
        !extractedKeywords.includes(word) &&
        word.match(/[a-z]/)
      ) {
        extractedKeywords.push(word);
      }
    });

    const uniqueKeywords = [...new Set(extractedKeywords)];

    const matchedKeywords = [];
    const missingKeywords = [];

    uniqueKeywords.forEach((keyword) => {
      if (resumeText.includes(keyword)) {
        matchedKeywords.push(keyword);
      } else {
        missingKeywords.push(keyword);
      }
    });

    const keywordScore = Math.min(
      60,
      Math.floor(
        (matchedKeywords.length / uniqueKeywords.length) * 60
      )
    );

    const sections = [
      "education",
      "experience",
      "skills",
      "projects",
      "certifications",
      "internship",
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

    if (resumeText.length > 6000) {
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
        "Add more job-specific technical keywords to improve ATS matching."
      );
    }

    if (sectionScore < 15) {
      suggestions.push(
        "Include important resume sections like Projects, Skills, Certifications, and Experience."
      );
    }

    if (formatScore < 12) {
      suggestions.push(
        "Avoid overly complex formatting, tables, and images for better ATS parsing."
      );
    }

    if (readabilityScore < 12) {
      suggestions.push(
        "Use shorter and clearer bullet points for better readability."
      );
    }

    if (totalScore >= 85) {
      suggestions.push(
        "Excellent ATS compatibility. Your resume is highly optimized."
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