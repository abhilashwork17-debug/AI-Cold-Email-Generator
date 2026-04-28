const express = require('express');
const cors = require('cors');
const app = express();
const connectDB = require('./config/db');
const dotenv = require('dotenv');

const authRoutes = require('./routes/authRoutes');
const aiRoutes = require('./routes/aiRoutes');

dotenv.config();

const PORT = process.env.PORT || 3000;

// MIDDLEWARE
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
connectDB();

app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes); // ONLY necessary fix added here

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});