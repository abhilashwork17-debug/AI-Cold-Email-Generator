# ✉️ MailSmith — AI Cold Email Generator

##  Overview
MailSmith is an AI-powered platform that generates personalized cold emails for job applications, networking, and outreach. It leverages high-speed LLM inference via the Groq API to deliver fast, context-aware, and professional email content tailored to user inputs.

 **Status:** This project is currently under active development with new features being continuously added.

---
##  Features

* AI-generated cold emails (job outreach, internships, networking)
* Ultra-fast generation using Groq-powered LLMs
* Personalized emails based on role, company, and user profile
* Tone selection (formal, casual, persuasive)
* Resume-based email generation
* ATS score calculation based on resume and job description
* Editable and copy-ready output
* Full-stack web application

---

##  Tech Stack

* **Frontend:** React, HTML, CSS, JavaScript
* **Backend:** Node.js, Express
* **AI/NLP:** Groq API (LLM inference)
* **Database:** MongoDB
* **Other:** REST APIs, JWT Authentication

---

## How It Works

1. User inputs:

   * Target role
   * Company name
   * Resume / skills
   * Job description (for ATS scoring)
2. Backend processes the input and constructs optimized prompts
3. Request is sent to Groq API for LLM inference
4. System generates:

   * Personalized cold email
   * ATS compatibility score
5. Results are displayed in a clean, structured format

---

##  Project Structure


mailsmith/
│
├── frontend/          # React UI
├── backend/           # Node.js + Express server
├── models/            # Database schemas
├── routes/            # API routes
├── utils/             # Prompt engineering & ATS logic
├── assets/            # Screenshots / UI images
├── docs/              # Documentation
└── README.md
```
---
##Future Improvements

* Advanced ATS feedback with keyword suggestions
* Company-specific personalization using job scraping
* Email performance tracking (open/reply rate)
* Chrome extension for one-click email sending
* Multi-language support

---

## Author

Abhilash Mishra
B.Tech CSE | AI & Full-Stack Developer
