import mongoose from 'mongoose';

const cvSchema = new mongoose.Schema({
  userId: {
    type: String,
    default: null,
    index: true
  },
  originalFileName: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    enum: ['pdf', 'docx'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  editedContent: {
    type: String,
    default: ''
  },
  atsAnalysis: {
    score: {
      type: Number,
      default: 0
    },
    feedback: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    analyzedAt: {
      type: Date,
      default: null
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

cvSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('CV', cvSchema);

