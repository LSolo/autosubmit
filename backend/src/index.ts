import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import http from 'http';
import { initSocket } from './socket';

dotenv.config();

import imageRoutes from './routes/imageRoutes';
import aiRoutes from './routes/aiRoutes';
import submissionRoutes from './routes/submissionRoutes';
import configRoutes from './routes/configRoutes';

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

// Initialize Socket.IO
initSocket(server);

import path from 'path';

app.use(cors());
app.use(helmet({
  crossOriginResourcePolicy: false, // Allow loading images from different origins/ports
}));
app.use(express.json());

// Serve uploads statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/images', imageRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/submit', submissionRoutes);
app.use('/api/config', configRoutes);

app.get('/', (req, res) => {
  res.send('Autosubmit Backend is running');
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
