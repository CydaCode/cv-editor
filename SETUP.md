# Setup Guide

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (running locally or MongoDB Atlas connection string)
- npm or yarn

## Installation Steps

### 1. Install Root Dependencies

```bash
npm install
```

### 2. Install Frontend Dependencies

```bash
cd frontend
npm install
cd ..
```

### 3. Install Backend Dependencies

```bash
cd backend
npm install
cd ..
```

Or use the convenience script:

```bash
npm run install:all
```

### 4. Configure Environment Variables

#### Backend (.env)

Create `backend/.env`:

```env
MONGODB_URI=mongodb://localhost:27017/cv-editor
PORT=5000
NODE_ENV=development
```

For MongoDB Atlas, use:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cv-editor
```

#### Frontend (.env.local)

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 5. Start MongoDB

If using local MongoDB:

```bash
mongod
```

Or use MongoDB Atlas (cloud) - no local setup needed.

### 6. Run the Application

#### Option 1: Run Both Together

```bash
npm run dev
```

This starts:
- Backend on http://localhost:5000
- Frontend on http://localhost:3000

#### Option 2: Run Separately

Terminal 1 (Backend):
```bash
npm run dev:backend
```

Terminal 2 (Frontend):
```bash
npm run dev:frontend
```

## Usage

1. Open http://localhost:3000 in your browser
2. Upload a PDF or DOCX CV file
3. Edit the CV content in the rich text editor
4. View ATS compliance feedback and score
5. Download the edited CV as text or HTML

## API Endpoints

- `POST /api/upload` - Upload a CV file
- `GET /api/cv/:id` - Get CV by ID
- `PUT /api/cv/:id` - Update CV content
- `POST /api/cv/:id/analyze` - Re-analyze CV
- `GET /api/cv` - Get all CVs (optional userId query)
- `DELETE /api/cv/:id` - Delete CV
- `GET /api/download/:id/text` - Download as text
- `GET /api/download/:id/html` - Download as HTML
- `GET /api/health` - Health check

## Troubleshooting

### MongoDB Connection Issues

- Ensure MongoDB is running: `mongod` or check MongoDB Atlas connection
- Verify the MONGODB_URI in `backend/.env` is correct
- Check firewall settings if using MongoDB Atlas

### Port Already in Use

- Change PORT in `backend/.env` if 5000 is taken
- Change Next.js port: `npm run dev:frontend -- -p 3001`

### File Upload Issues

- Ensure `backend/uploads` directory exists (created automatically)
- Check file size limit (10MB)
- Verify file type is PDF or DOCX

### Module Not Found Errors

- Run `npm install` in both frontend and backend directories
- Delete `node_modules` and reinstall if issues persist

