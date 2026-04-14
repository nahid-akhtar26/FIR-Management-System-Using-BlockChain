const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const requestLogger = require('./middleware/requestLogger');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'FIR Management System API is running' });
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/fir', require('./routes/fir'));
app.use('/api/user', require('./routes/user'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/blockchain', require('./routes/blockchain'));

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => logger.info(`Server running on port ${PORT}`));
  })
  .catch((error) => {
    logger.error('Failed to start server', error);
    process.exit(1);
  });
