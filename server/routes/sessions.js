const express = require('express');
const router = express.Router();
const Session = require('../models/Session');

// GET /api/sessions
router.get('/', async (req, res) => {
  const sessions = await Session.find().sort({ createdAt: -1 }).limit(100);
  res.json(sessions);
});

// GET /api/sessions/:id
router.get('/:id', async (req, res) => {
  const session = await Session.findById(req.params.id);
  if (!session) return res.status(404).json({ message: 'Not found' });
  res.json(session);
});

// POST create
router.post('/', async (req, res) => {
  const s = new Session(req.body);
  await s.save();
  res.json(s);
});

// DELETE
router.delete('/:id', async (req, res) => {
  await Session.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

module.exports = router;
