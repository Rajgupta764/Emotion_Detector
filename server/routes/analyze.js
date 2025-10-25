const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const mlService = require('../services/mlService');

// text
router.post('/text', async (req, res) => {
  const { text } = req.body;
  const out = await mlService.analyzeText(text);
  res.json(out);
});

// audio file
router.post('/audio', upload.single('file'), async (req, res) => {
  const file = req.file;
  const out = await mlService.analyzeAudioFile(file.path);
  res.json(out);
});

// image
router.post('/image', upload.single('file'), async (req, res) => {
  const out = await mlService.analyzeImage(req.file.path);
  res.json(out);
});

// fuse
router.post('/fuse', async (req, res) => {
  const { textResult, audioResult, videoResult } = req.body;
  const fusion = require('../services/fusionService');
  const r = fusion.fuseEmotions(textResult, audioResult, videoResult);
  res.json(r);
});

module.exports = router;
