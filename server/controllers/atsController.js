const fs = require("fs");
const pdfParse = require("pdf-parse");

exports.analyzeResume = async (req, res) => {
  try {
    const jobDesc = req.body.jobDesc.toLowerCase();

    const dataBuffer = fs.readFileSync(req.file.path);
    const pdfData = await pdfParse(dataBuffer);

    const resumeText = pdfData.text.toLowerCase();

    const jobWords = jobDesc.split(/\W+/);
    const resumeWords = new Set(resumeText.split(/\W+/));

    let matchCount = 0;
    let missing = [];

    jobWords.forEach((word) => {
      if (resumeWords.has(word)) {
        matchCount++;
      } else if (word.length > 4) {
        missing.push(word);
      }
    });

    const score = Math.min(
      100,
      Math.floor((matchCount / jobWords.length) * 100)
    );

    res.json({
      score,
      missing: missing.slice(0, 10),
      suggestions:
        "Add missing keywords, improve formatting, and avoid images/tables."
    });
  } catch (error) {
    res.status(500).json({ message: "Error analyzing resume" });
  }
};