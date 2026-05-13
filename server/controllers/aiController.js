const axios = require('axios');
const EmailHistory = require('../models/EmailHistory');

exports.generateEmail = async (req, res) => {
  try {
    const { prompt, experience, tone, name, jobRole } = req.body;

    if (!prompt) {
      return res.status(400).json({ message: 'Prompt is required' });
    }

    const groqApiKey = process.env.GROQ_API_KEY;

    if (!groqApiKey) {
      return res.status(500).json({ message: 'AI service is not configured' });
    }

    let experienceMode = "Mid-level professional";

    if (experience === "0-1") experienceMode = "Fresher / Entry-level candidate";
    if (experience === "1-2") experienceMode = "Junior professional";
    if (experience === "2-3") experienceMode = "Mid-level candidate";
    if (experience === "3-5") experienceMode = "Experienced professional";
    if (experience === "5-10") experienceMode = "Senior professional";
    if (experience === "10+") experienceMode = "Leadership / Managerial candidate";

    const selectedTone = tone || "formal";

    const systemPrompt = `
Return ONLY valid JSON:

{
  "subject": "",
  "emailBody": "",
  "linkedInDM": "",
  "followUpEmail": ""
}

STRICT RULES:
- Each field MUST be completely different
- Do NOT reuse sentences across sections
- Do NOT include markdown or extra text
- Follow structure EXACTLY

--------------------------------------------------
EMAIL (emailBody) — DETAILED PROFESSIONAL EMAIL
--------------------------------------------------

Write a ${selectedTone} professional cold email.

Use a clearly ${selectedTone} tone with noticeable language differences.  
Adjust sentence style, word choice, and personality accordingly.

Structure EXACTLY:

Dear Hiring Manager,

I am [Candidate Name], and I am writing to express my interest in the [Job Role].  
Briefly introduce your background and core expertise.

Mention:
- Key skills (2–3)
- One or two relevant projects or experiences
- Technologies you have worked with

Explain:
- Why you are a strong fit for the role
- What value you can bring to the company

Show genuine interest in the company or role.

Best Regards,  
[Candidate Name]

 Length: 120–160 words  

--------------------------------------------------
LINKEDIN DM (linkedInDM) — SHORT BUT IMPACTFUL
--------------------------------------------------

Write in a ${selectedTone} tone.

Use a clearly ${selectedTone} tone with noticeable language differences.  
Adjust sentence style, word choice, and personality accordingly.

Structure EXACTLY:

Hi Recruiter,

I came across the [Job Role] opportunity and wanted to connect.  
I have experience in [key skill/project] and would love to explore this further.

Looking forward to connecting.

Thanks,  
[Candidate Name]

 Length: 40–60 words  

--------------------------------------------------
FOLLOW-UP EMAIL (followUpEmail) — POLITE REMINDER
--------------------------------------------------

Write in a ${selectedTone} tone.

Use a clearly ${selectedTone} tone with noticeable language differences.  
Adjust sentence style, word choice, and personality accordingly.

Structure EXACTLY:

Hello,

I am following up on my previous email regarding the [Job Role] position.  
I wanted to reiterate my interest in the opportunity.

Briefly remind:
- Your key strength OR project (1 line only)

I would appreciate any update regarding my application.

Regards,  
[Candidate Name]

 Length: 70–100 words  

--------------------------------------------------
SUBJECT
--------------------------------------------------

- 6–10 words
- Professional and relevant to job role

--------------------------------------------------
USER INPUT:
${prompt}
`;

    const aiResponse = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: systemPrompt }],
        temperature: 0.7,
        max_tokens: 1024
      },
      {
        headers: {
          Authorization: `Bearer ${groqApiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    let text = aiResponse.data.choices[0].message.content.trim();
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();

    let parsed;

    try {
      const match = text.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(match ? match[0] : text);
    } catch (err) {
      console.log("Parse failed, using fallback split");

      return res.status(200).json({
        subject: "",
        emailBody: text,
        linkedInDM: text,
        followUpEmail: text
      });
    }

    const result = {
      subject: parsed.subject || "",
      emailBody: parsed.emailBody || "No email generated",
      linkedInDM: parsed.linkedInDM || "No LinkedIn message generated",
      followUpEmail: parsed.followUpEmail || "No follow-up generated"
    };

    if (req.user) {
      const historyEntry = await EmailHistory.create({
        userId: req.user._id,
        name,
        jobRole,
        experience,
        prompt,
        tone,
        ...result
      });

      return res.status(200).json(historyEntry);
    }

    return res.status(200).json(result);

  } catch (error) {
    console.log("ERROR:", error.response?.data || error.message);

    return res.status(500).json({
      message: 'Failed to generate email'
    });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const history = await EmailHistory.find({
      userId: req.user._id
    }).sort({ createdAt: -1 });

    res.status(200).json(history);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch history'
    });
  }
};

exports.deleteHistory = async (req, res) => {
  try {
    const deleted = await EmailHistory.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!deleted) {
      return res.status(404).json({ message: "Not found" });
    }

    res.status(200).json({ message: "Deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Delete failed" });
  }
};