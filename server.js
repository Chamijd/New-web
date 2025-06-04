const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();

// ====== CONFIG ======
const PORT = process.env.PORT || 3000;
const MONGO_URL = 'mongodb+srv://jikew32666:nih7jgcq1pkSSyGY@cluster0.jbdxjkc.mongodb.net/autoreplydb?retryWrites=true&w=majority&appName=Cluster0'; // Or use your Atlas URI

// ====== MONGOOSE SETUP ======
mongoose.connect(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('✅ MongoDB connected!'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// ====== SCHEMA ======
const commentSchema = new mongoose.Schema({
  name: String,
  comment: String,
  date: { type: Date, default: Date.now },
  replies: [
    {
      name: String,
      comment: String,
      date: { type: Date, default: Date.now }
    }
  ]
});

const Comment = mongoose.model('Comment', commentSchema);

// ====== MIDDLEWARE ======
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname))); // So it can serve the HTML file

// ====== ROUTES ======

// Serve the HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'main.html'));
});

// Get all comments
app.get('/comments', async (req, res) => {
  try {
    const comments = await Comment.find().sort({ date: -1 });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch comments.' });
  }
});

// Post a new comment
app.post('/comments', async (req, res) => {
  const { name, comment } = req.body;
  if (!name || !comment) return res.status(400).json({ error: 'Name and comment required.' });

  try {
    const newComment = new Comment({ name, comment });
    await newComment.save();
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save comment.' });
  }
});

// Post a reply
app.post('/comments/reply', async (req, res) => {
  const { parentId, name, comment } = req.body;
  if (!parentId || !name || !comment) return res.status(400).json({ error: 'All fields required.' });

  try {
    const parentComment = await Comment.findById(parentId);
    if (!parentComment) return res.status(404).json({ error: 'Parent comment not found.' });

    parentComment.replies.push({ name, comment });
    await parentComment.save();
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save reply.' });
  }
});

// ====== START SERVER ======
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
