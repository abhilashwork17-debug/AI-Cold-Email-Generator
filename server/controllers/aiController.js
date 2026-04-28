const axios = require("axios");
const EmailHistory = require("../models/EmailHistory");

exports.generateEmail = async (req, res) => {
  try {
    const { prompt, experience } = req.body;

    if (!prompt) {
      return res.status(400).json({
        message: "Prompt is required",
      });
    }

    const groqApiKey = process.env.GROQ_API_KEY;

    if (!groqApiKey) {
      return res.status(500).json({
        message: "AI service is not configured",
      });
    }

    let experienceMode = "Mid-level professional";

    if (experience === "0-1")
      experienceMode = "Fresher / Entry-level candidate";

    if (experience === "1-2")
      experienceMode = "Junior professional";

    if (experience === "2-3")
      experienceMode = "Mid-level candidate";

    if (experience === "3-5")
      experienceMode = "Experienced professional";

    if (experience === "5-10")
      experienceMode = "Senior professional";

    if (experience === "10+")
      experienceMode = "Leadership / Managerial candidate";


    const systemPrompt = `
You are an elite recruiter outreach strategist.

Create premium outreach content for job opportunities.

Candidate Level:
${experienceMode}

Use this experience level while writing confidence, achievements, and tone.

==================================================
RETURN ONLY VALID JSON
==================================================

{
  "subject": "",
  "emailBody": "",
  "linkedInDM": "",
  "followUpEmail": ""
}

==================================================
RULES
==================================================

SUBJECT:
- 6 to 10 words
- Powerful
- Professional
- Relevant to job role

==================================================
COLD EMAIL FORMAT
==================================================

Dear Hiring Manager,

[ONE LINE GAP]

Professional body introducing candidate, skills, achievements, interest.

[ONE LINE GAP]

Best Regards,
Candidate Name

==================================================
LINKEDIN DM FORMAT
==================================================

Hi Recruiter,

[ONE LINE GAP]

Short personalized outreach message.

[ONE LINE GAP]

Thanks,
Candidate Name

==================================================
FOLLOW UP EMAIL FORMAT
==================================================

Hello,

[ONE LINE GAP]

Following up on previous message professionally.

[ONE LINE GAP]

Regards,
Candidate Name

==================================================
PROMPT FROM USER:
${prompt}

Return ONLY JSON.
`;

    const aiResponse = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "user",
            content: systemPrompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1024,
      },
      {
        headers: {
          Authorization: `Bearer ${groqApiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    const generatedText =
      aiResponse.data.choices[0].message.content;

    const jsonMatch = generatedText.match(/\{[\s\S]*\}/);

    const parsedResponse = jsonMatch
      ? JSON.parse(jsonMatch[0])
      : JSON.parse(generatedText);


    if (req.user) {
      const historyEntry = await EmailHistory.create({
        userId: req.user._id,
        prompt,
        subject: parsedResponse.subject || "",
        emailBody: parsedResponse.emailBody || "",
        linkedInDM: parsedResponse.linkedInDM || "",
        followUpEmail: parsedResponse.followUpEmail || "",
      });

      return res.status(200).json(historyEntry);
    }

    /* Guest Response */
    return res.status(200).json({
      subject: parsedResponse.subject || "",
      emailBody: parsedResponse.emailBody || "",
      linkedInDM: parsedResponse.linkedInDM || "",
      followUpEmail: parsedResponse.followUpEmail || "",
    });

  } catch (error) {
    console.error(error.message);

    return res.status(500).json({
      message: "Failed to generate email",
    });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const history = await EmailHistory.find({
      userId: req.user._id,
    }).sort({ createdAt: -1 });

    res.status(200).json(history);

  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch history",
    });
  }
};