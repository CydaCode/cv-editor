# Project Structure

```
cv-editor/
├── backend/                    # Express.js API server
│   ├── models/                # MongoDB models
│   │   ├── CV.js             # CV document schema
│   │   └── User.js           # User document schema (optional)
│   ├── routes/               # API routes
│   │   ├── upload.js         # File upload endpoint
│   │   ├── cv.js             # CV CRUD operations
│   │   └── download.js       # Download endpoints
│   ├── services/             # Business logic
│   │   ├── fileParser.js     # PDF/DOCX parsing
│   │   └── atsAnalyzer.js    # ATS compliance analysis
│   ├── uploads/              # Uploaded files directory (created at runtime)
│   ├── server.js             # Express server entry point
│   ├── package.json
│   └── .env                  # Environment variables (create from .env.example)
│
├── frontend/                  # Next.js application
│   ├── components/           # React components
│   │   ├── FileUploader.tsx  # File upload interface
│   │   ├── CVEditor.tsx      # Rich text editor
│   │   └── ATSFeedback.tsx   # ATS analysis display
│   ├── pages/                # Next.js pages
│   │   ├── _app.tsx          # App wrapper with Chakra UI
│   │   └── index.tsx         # Main page
│   ├── styles/               # Styling
│   │   └── theme.ts          # Chakra UI theme
│   ├── package.json
│   ├── next.config.js
│   ├── tsconfig.json
│   └── .env.local            # Environment variables (create from .env.example)
│
├── package.json              # Root package.json with scripts
├── README.md                 # Project overview
├── SETUP.md                  # Detailed setup instructions
└── .gitignore
```

## Key Features Implemented

### Backend
- ✅ File upload handling (PDF/DOCX) with Multer
- ✅ PDF parsing using pdf-parse
- ✅ DOCX parsing using mammoth
- ✅ MongoDB integration with Mongoose
- ✅ ATS analysis service with scoring:
  - Section detection (Work Experience, Education, Skills, etc.)
  - Keyword density analysis
  - Formatting issue detection
  - Readability scoring
  - Actionable recommendations
- ✅ RESTful API endpoints
- ✅ Download functionality (text/HTML)

### Frontend
- ✅ Next.js 14 with TypeScript
- ✅ Chakra UI for modern, responsive design
- ✅ File upload interface with drag-and-drop styling
- ✅ Rich text editor (ReactQuill) for CV editing
- ✅ Real-time ATS feedback display
- ✅ Tabbed interface for better UX
- ✅ Download options (text/HTML formats)

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/upload` | Upload CV file (PDF/DOCX) |
| GET | `/api/cv/:id` | Get CV by ID |
| PUT | `/api/cv/:id` | Update CV content |
| POST | `/api/cv/:id/analyze` | Re-analyze CV |
| GET | `/api/cv` | Get all CVs (optional userId) |
| DELETE | `/api/cv/:id` | Delete CV |
| GET | `/api/download/:id/text` | Download as text file |
| GET | `/api/download/:id/html` | Download as HTML file |
| GET | `/api/health` | Health check |

## ATS Analysis Scoring

The ATS analyzer provides a score out of 100 based on:

1. **Required Sections (30 points)**: Checks for Work Experience, Education, Skills, Contact, Summary/Objective
2. **Keywords (30 points)**: Analyzes keyword density and presence of common ATS keywords
3. **Formatting (20 points)**: Detects problematic formatting (tables, images, text boxes)
4. **Readability (20 points)**: Evaluates sentence length, paragraph structure, and overall readability

## Database Schema

### CV Collection
```javascript
{
  userId: String (optional),
  originalFileName: String,
  filePath: String,
  fileType: String ('pdf' | 'docx'),
  content: String (extracted text),
  editedContent: String,
  atsAnalysis: {
    score: Number (0-100),
    feedback: Object,
    analyzedAt: Date
  },
  createdAt: Date,
  updatedAt: Date
}
```

## Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Chakra UI, ReactQuill, Axios
- **Backend**: Node.js, Express.js, MongoDB, Mongoose, Multer, pdf-parse, mammoth, natural
- **Database**: MongoDB

