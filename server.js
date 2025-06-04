const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); // serve static files from /public folder

mongoose.connect('mongodb+srv://jikew32666:nih7jgcq1pkSSyGY@cluster0.jbdxjkc.mongodb.net/autoreplydb', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const ReplySchema = new mongoose.Schema({
  name: String,
  comment: String,
  date: { type: Date, default: Date.now }
});

const CommentSchema = new mongoose.Schema({
  name: String,
  comment: String,
  date: { type: Date, default: Date.now },
  replies: [ReplySchema]
});

const Comment = mongoose.model('Comment', CommentSchema);

// GET all comments with replies
app.get('/comments', async (req, res) => {
  try {
    const comments = await Comment.find().sort({ date: -1 });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST a new comment
app.post('/comments', async (req, res) => {
  const { name, comment } = req.body;
  if (!name || !comment) return res.status(400).json({ error: 'Missing fields' });
  try {
    const newComment = new Comment({ name, comment });
    await newComment.save();
    res.status(201).json(newComment);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST a reply to a comment
app.post('/comments/reply', async (req, res) => {
  const { parentId, name, comment } = req.body;
  if (!parentId || !name || !comment) return res.status(400).json({ error: 'Missing fields' });
  try {
    const parent = await Comment.findById(parentId);
    if (!parent) return res.status(404).json({ error: 'Comment not found' });
    parent.replies.push({ name, comment });
    await parent.save();
    res.status(201).json(parent);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
