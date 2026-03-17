require('dotenv').config();
const express = require('express');
const http = require('http');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const { initializeSocket } = require('./socket/socketHandler');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const reelRoutes = require('./routes/reels');
const messageRoutes = require('./routes/messages');
const notificationRoutes = require('./routes/notifications');
const searchRoutes = require('./routes/search');
const storyRoutes = require('./routes/stories');
const adminRoutes = require('./routes/admin');
const feedRoutes = require('./routes/feed');
const highlightRoutes = require('./routes/highlights');
const { errorHandler } = require('./middleware/errorHandler');
const rateLimit = require('express-rate-limit');

process.on('unhandledRejection', (err) => console.error('Unhandled rejection:', err.message));

const app = express();
const server = http.createServer(app);

app.set('trust proxy', 1);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

connectDB();

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(compression());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'development' ? 2000 : 500,
  standardHeaders: true,
  legacyHeaders: false
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'development' ? 200 : 20,
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api/', limiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.set('io', io);
initializeSocket(io);

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reels', reelRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/stories', storyRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/feed', feedRoutes);
app.use('/api/highlights', highlightRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`ReelAY server running on port ${PORT}`));

module.exports = { app, io };
