const axios = require('axios')
const EmailHistory = require('../models/emailHistory');

exports.generateEmail = async (req, res) => {
  const { prompt, type } = req.body;

  if (!prompt) {
    return res.status(400).json({ message: 'Prompt is required' });
  }

  // 🔥 Advanced Professional Prompt
  const fullPrompt = `
You are a world-class expert in professional outreach, cold emailing, and LinkedIn communication.

Your goal is to generate a HIGH-CONVERTING, HUMAN-LIKE, and PERSONALIZED outreach message that increases response rates.

Type of message: ${type || "general"}

You MUST generate output strictly in the following JSON format:
{
  "subject": "Compelling and attention-grabbing subject line",
  "emailBody": "Highly personalized and professional cold email",
  "linkedInDM": "Short, engaging LinkedIn message",
  "followUpEmail": "Polite and persuasive follow-up email"
}

--- CORE OBJECTIVE ---
Create messages that:
- Feel written by a real human (NOT AI)
- Are personalized and context-aware
- Build trust quickly
- Show clear value to the recipient
- Increase chances of reply

--- WRITING PRINCIPLES ---
1. PERSONALIZATION:
   - Adapt tone based on the request
   - Mention role, company, or intent naturally
   - Avoid generic templates

2. HOOK (VERY IMPORTANT):
   - Start with a strong, engaging opening line
   - Avoid "I hope you're doing well"

3. VALUE PROPOSITION:
   - Clearly show what you bring to the table
   - Highlight skills, impact, or intent

4. CLARITY & STRUCTURE:
   - Keep sentences short and crisp
   - Avoid unnecessary fluff
   - Make it easy to read

5. CALL TO ACTION:
   - Include a clear, polite ask (e.g., quick call, feedback, opportunity)

6. TONE:
   - Professional but conversational
   - Confident, not desperate
   - Friendly and respectful

7. LINKEDIN DM RULES:
   - Short (3–5 lines max)
   - Direct and engaging

8. FOLLOW-UP EMAIL:
   - Polite reminder
   - Add slight urgency
   - Do NOT sound pushy

--- IMPORTANT ---
- DO NOT include placeholders like [Your Name]
- DO NOT repeat instructions
- DO NOT output anything outside JSON
- Ensure content is realistic and ready to send

--- USER REQUEST ---
${prompt}
`;

  try {
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'user',
            content: fullPrompt
          }
        ],
        max_tokens: 1024,
        temperature: 0.7
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        },
        timeout: 30000
      }
    );

    // 🔥 RAW CONTENT
    let content =
      response.data?.choices?.[0]?.message?.content || "";

    // 🔥 CLEAN (handles ```json blocks)
    content = content
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    let parsed;

    try {
      parsed = JSON.parse(content);
    } catch {
      // 🔥 Try extracting JSON substring
      const match = content.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          parsed = JSON.parse(match[0]);
        } catch {
          parsed = {};
        }
      } else {
        parsed = {};
      }
    }

    const {
      subject = "",
      emailBody = content,
      linkedInDM = "",
      followUpEmail = ""
    } = parsed;

    const emailRecord = await EmailHistory.create({
      user: req.user._id,
      prompt,
      subject,
      emailBody,
      linkedInDM,
      followUpEmail,
      type: type || "general",
      createdAt: new Date()
    });

    return res.status(200).json({
      message: "Email generated successfully",
      email: {
        subject,
        emailBody,
        linkedInDM,
        followUpEmail
      },
      data: emailRecord
    });

  } catch (error) {
    console.error("AI Error:", error.response?.data || error.message);

    return res.status(500).json({
      message: "Error generating email",
      error: error.response?.data || error.message
    });
  }
};