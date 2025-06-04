const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const app = express();

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); // to serve HTML

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/commentsDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

// Schema
const replySchema = new mongoose.Schema({
  name: String,
  comment: String,
  date: { type: Date, default: Date.now }
});

const commentSchema = new mongoose.Schema({
  name: String,
  comment: String,
  date: { type: Date, default: Date.now },
  replies: [replySchema]
});

const Comment = mongoose.model('Comment', commentSchema);

// Routes
app.get('/comments', async (req, res) => {
  const comments = await Comment.find().sort({ date: -1 });
  res.json(comments);
});

app.post('/comments', async (req, res) => {
  const { name, comment } = req.body;
  if (!name || !comment) return res.status(400).send('Missing fields');
  await Comment.create({ name, comment });
  res.sendStatus(201);
});

app.post('/comments/reply', async (req, res) => {
  const { parentId, name, comment } = req.body;
  if (!parentId || !name || !comment) return res.status(400).send('Missing fields');
  const parentComment = await Comment.findById(parentId);
  if (!parentComment) return res.status(404).send('Comment not found');

  parentComment.replies.push({ name, comment });
  await parentComment.save();
  res.sendStatus(201);
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
