import re
import io
from typing import List, Dict, Any
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pypdf import PdfReader
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

app = FastAPI(title="MailSmith NLP ATS Microservice", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

STOPWORDS = set([
    "a", "about", "above", "after", "again", "against", "all", "am", "an", "and",
    "any", "are", "aren't", "as", "at", "be", "because", "been", "before", "being",
    "below", "between", "both", "but", "by", "can", "cannot", "could", "couldn't",
    "did", "didn't", "do", "does", "doesn't", "doing", "don't", "down", "during",
    "each", "few", "for", "from", "further", "had", "hadn't", "has", "hasn't",
    "have", "haven't", "having", "he", "he'd", "he'll", "he's", "her", "here",
    "here's", "hers", "herself", "him", "himself", "his", "how", "how's", "i",
    "i'd", "i'll", "i'm", "i've", "if", "in", "into", "is", "isn't", "it", "it's",
    "its", "itself", "let's", "me", "more", "most", "mustn't", "my", "myself",
    "no", "nor", "not", "of", "off", "on", "once", "only", "or", "other", "ought",
    "our", "ours", "ourselves", "out", "over", "own", "same", "shan't", "she",
    "she'd", "she'll", "she's", "should", "shouldn't", "so", "some", "such",
    "than", "that", "that's", "the", "their", "theirs", "them", "themselves",
    "then", "there", "there's", "these", "they", "they'd", "they'll", "they're",
    "they've", "this", "those", "through", "to", "too", "under", "until", "up",
    "very", "was", "wasn't", "we", "we'd", "we'll", "we're", "we've", "were",
    "weren't", "what", "what's", "when", "when's", "where", "where's", "which",
    "while", "who", "who's", "whom", "why", "why's", "with", "won't", "would",
    "wouldn't", "you", "you'd", "you'll", "you're", "you've", "your", "yours",
    "yourself", "yourselves", "work", "working", "candidate", "role", "job", "position",
    "requirement", "requirements", "responsible", "accomplished", "experience", "ability"
])

ALIAS_MAP = {
    "react.js": "react",
    "reactjs": "react",
    "node.js": "node",
    "nodejs": "node",
    "express.js": "express",
    "expressjs": "express",
    "javascript": "js",
    "typescript": "ts",
    "postgres": "postgresql",
    "mongo": "mongodb",
    "py": "python",
    "vue.js": "vue",
    "vuejs": "vue",
    "next.js": "nextjs",
    "aws": "amazon web services",
}

def normalize_text(text: str) -> str:
    """Clean and normalize raw text for NLP analysis."""
    text = text.lower()
    for k, v in ALIAS_MAP.items():
        text = re.sub(r'\b' + re.escape(k) + r'\b', v, text)
    # Retain alphanumeric, spaces, and tech symbols like +, #, .
    text = re.sub(r'[^a-z0-9+#.\-\s]', ' ', text)
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def stem_word(word: str) -> str:
    """Lightweight rule-based suffix stemming for tech vocabulary."""
    if len(word) <= 4:
        return word
    for suffix in ["ing", "edly", "ed", "ment", "tions", "tion", "ers", "er", "ies", "es", "s"]:
        if word.endswith(suffix) and len(word) - len(suffix) >= 3:
            return word[:-len(suffix)]
    return word

@app.post("/analyze")
async def analyze_resume(
    resume: UploadFile = File(...),
    jobDesc: str = Form("")
):
    try:
        # Read PDF File
        contents = await resume.read()
        pdf_file = io.BytesIO(contents)
        reader = PdfReader(pdf_file)
        
        raw_resume_text = ""
        for page in reader.pages:
            raw_resume_text += page.extract_text() or ""
            
        if not raw_resume_text.strip():
            raise HTTPException(status_code=400, detail="Could not extract text from PDF")

        clean_resume = normalize_text(raw_resume_text)
        clean_job = normalize_text(jobDesc)

        if not clean_job:
            clean_job = clean_resume

        # TF-IDF & Cosine Similarity Semantic Vector Match
        vectorizer = TfidfVectorizer(
            ngram_range=(1, 2),
            stop_words="english",
            max_features=500
        )
        
        try:
            tfidf_matrix = vectorizer.fit_transform([clean_job, clean_resume])
            cosine_sim = float(cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0])
        except Exception:
            cosine_sim = 0.5

        # Feature Importance & Keyword Overlap
        feature_names = vectorizer.get_feature_names_out()
        job_vector = tfidf_matrix.toarray()[0]
        
        # Rank top keywords by TF-IDF score
        weighted_keywords = []
        for idx, score in enumerate(job_vector):
            kw = feature_names[idx]
            if score > 0 and len(kw) > 2 and kw not in STOPWORDS:
                weighted_keywords.append((kw, score))
                
        weighted_keywords.sort(key=lambda x: x[1], reverse=True)
        top_keywords = [kw for kw, score in weighted_keywords[:35]]

        matched_keywords = []
        missing_keywords = []

        # Check matched vs missing using stemmed matching
        resume_words = set(clean_resume.split())
        stemmed_resume_words = set(stem_word(w) for w in resume_words)

        for kw in top_keywords:
            parts = kw.split()
            if len(parts) == 1:
                stemmed_kw = stem_word(kw)
                if kw in clean_resume or stemmed_kw in stemmed_resume_words:
                    matched_keywords.append(kw)
                else:
                    missing_keywords.append(kw)
            else:
                if kw in clean_resume:
                    matched_keywords.append(kw)
                else:
                    missing_keywords.append(kw)

        # Keyword Match Score (Max 60 pts)
        kw_ratio = len(matched_keywords) / max(len(top_keywords), 1)
        keyword_score = round((cosine_sim * 0.5 + kw_ratio * 0.5) * 60)
        keyword_score = min(60, max(0, keyword_score))

        # Section Detection (Max 20 pts)
        sections = ["education", "experience", "skills", "projects", "certifications", "internship", "achievements", "summary"]
        section_found = sum(1 for sec in sections if sec in clean_resume)
        section_score = min(20, round((section_found / len(sections)) * 20))

        # Format Score (Max 15 pts)
        format_score = 15
        if len(clean_resume) < 500:
            format_score -= 5
        if len(clean_resume) > 7000:
            format_score -= 3
        if "table" in clean_resume or "image" in clean_resume:
            format_score -= 3
        format_score = max(0, format_score)

        # Readability Score (Max 15 pts)
        sentences = [s.strip() for s in re.split(r'[.!?]', clean_resume) if s.strip()]
        avg_sentence_len = sum(len(s) for s in sentences) / max(len(sentences), 1)
        
        readability_score = 15
        if avg_sentence_len > 180:
            readability_score -= 5
        if avg_sentence_len > 250:
            readability_score -= 5
        readability_score = max(0, readability_score)

        total_score = min(100, keyword_score + section_score + format_score + readability_score)

        # Generate Actionable NLP Suggestions
        suggestions = []
        if total_score >= 85:
            suggestions.append("Outstanding alignment! Your resume closely matches the technical and semantic requirements.")
        elif total_score >= 65:
            suggestions.append("Good match! Incorporating a few missing domain keywords will further boost your ATS ranking.")
        else:
            suggestions.append("Significant alignment gaps detected. Add key technical skills directly from the job description.")

        if missing_keywords:
            suggestions.append(f"Top missing keywords to include: {', '.join(missing_keywords[:5])}")

        if section_score < 15:
            suggestions.append("Ensure your resume has explicit section headers (Skills, Experience, Projects, Education).")

        if readability_score < 12:
            suggestions.append("Break down lengthy paragraphs into concise, bulleted accomplishment statements.")

        return {
            "score": total_score,
            "breakdown": {
                "keywordScore": keyword_score,
                "sectionScore": section_score,
                "formatScore": format_score,
                "readabilityScore": readability_score,
            },
            "missing": missing_keywords[:15],
            "matchedKeywords": matched_keywords[:20],
            "suggestions": suggestions,
            "semanticCosineSimilarity": round(cosine_sim, 3)
        }

    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"NLP Analysis Error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
