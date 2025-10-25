const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const emotionSocket = require('./sockets/emotionSocket');

dotenv.config();

const app = express();
const server = http.createServer(app);

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Connect DB
connectDB();

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/sessions', require('./routes/sessions'));
app.use('/api/analyze', require('./routes/analyze'));

// Health
app.get('/api/health', (req, res) => res.json({ ok: true, ts: Date.now() }));

// Socket.IO
const io = new Server(server, { cors: { origin: '*' } });
emotionSocket(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
