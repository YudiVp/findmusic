const express = require('express');
const multer = require('multer');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const AUDD_API_TOKEN = '021cade3b138a759de9f593c8ccc13cb';

// Configurar uploads
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (_, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

app.use(express.static('public'));

app.post('/upload', upload.single('music'), async (req, res) => {
  try {
    const filePath = req.file.path;
    const fileData = fs.readFileSync(filePath);
    const fileBase64 = fileData.toString('base64');

    const response = await axios.post('https://api.audd.io/', {
      api_token: AUDD_API_TOKEN,
      audio: fileBase64,
      return: 'apple_music,spotify',
    });

    fs.unlinkSync(filePath);

    const result = response.data.result;
    if (result) {
      res.json({
        title: result.title,
        artist: result.artist,
        album: result.album,
        release_date: result.release_date,
        spotify: result.spotify,
        apple_music: result.apple_music,
      });
    } else {
      res.status(404).json({ error: 'Música não identificada.' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao processar o arquivo.' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
