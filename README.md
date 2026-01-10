# CV Editor - ATS Compliance Tool

A comprehensive web application that allows users to upload their CVs, edit them online, and check them against ATS (Applicant Tracking System) standards to optimize visibility with recruiters.

## ✨ Features

- 📄 **File Upload**: Upload CVs in PDF or DOCX format (up to 10MB)
- ✏️ **Rich Text Editor**: Edit CV content with a full-featured WYSIWYG editor
- ✅ **ATS Compliance Checking**: Automated analysis with scoring (0-100)
- 📊 **Detailed Feedback**: 
  - Required sections detection
  - Keyword density analysis
  - Formatting issue detection
  - Readability scoring
  - Actionable recommendations
- 💾 **Save & Download**: Save edits and download CVs as text or HTML
- 🔄 **Real-time Analysis**: Re-analyze CV after editing

## 🛠 Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Chakra UI, ReactQuill
- **Backend**: Node.js, Express.js, MongoDB, Mongoose
- **File Processing**: pdf-parse (PDF), mammoth (DOCX)
- **Analysis**: Custom ATS analyzer with natural language processing

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Install all dependencies:**
```bash
npm run install:all
```

2. **Configure environment variables:**

   Create `backend/.env`:
   ```env
   MONGODB_URI=mongodb://localhost:27017/cv-editor
   PORT=5000
   NODE_ENV=development
   ```

   Create `frontend/.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```

3. **Start MongoDB** (if using local):
```bash
mongod
```

4. **Run the application:**
```bash
npm run dev
```

This starts both:
- Backend API: http://localhost:5000
- Frontend App: http://localhost:3000

## 📖 Documentation

- [SETUP.md](./SETUP.md) - Detailed setup instructions
- [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) - Project architecture and API documentation

## 🎯 Usage

1. Open http://localhost:3000
2. Upload a PDF or DOCX CV file
3. Edit the CV content in the rich text editor
4. View ATS compliance score and detailed feedback
5. Make improvements based on recommendations
6. Re-analyze to see updated scores
7. Download the edited CV

## 📡 API Endpoints

- `POST /api/upload` - Upload CV file
- `GET /api/cv/:id` - Get CV by ID
- `PUT /api/cv/:id` - Update CV content
- `POST /api/cv/:id/analyze` - Re-analyze CV
- `GET /api/download/:id/text` - Download as text
- `GET /api/download/:id/html` - Download as HTML

See [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) for complete API documentation.

## 🏗 Project Structure

```
cv-editor/
├── frontend/          # Next.js application
│   ├── components/    # React components
│   ├── pages/         # Next.js pages
│   └── styles/        # Chakra UI theme
├── backend/           # Express.js API server
│   ├── models/        # MongoDB schemas
│   ├── routes/        # API routes
│   └── services/      # Business logic
└── README.md
```

## 🔍 ATS Analysis

The ATS analyzer evaluates CVs across four key areas:

1. **Required Sections (30 pts)**: Work Experience, Education, Skills, Contact, Summary
2. **Keywords (30 pts)**: Keyword density and relevance
3. **Formatting (20 pts)**: ATS-friendly formatting (no tables, images, text boxes)
4. **Readability (20 pts)**: Sentence length, paragraph structure

Total score: 0-100 (80+ = Excellent, 60-79 = Good, <60 = Needs Improvement)

## 📝 License

This project is open source and available for educational purposes.

