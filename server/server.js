require("dotenv").config();

const express = require('express');
const cors = require('cors');
const app = express();

const connectDB = require('./config/db');


const atsRoutes = require("./routes/atsRoutes");
const authRoutes = require('./routes/authRoutes');
const aiRoutes = require('./routes/aiRoutes');


const PORT = process.env.PORT || 3000;


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


connectDB();


app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);
app.use("/api/ats", atsRoutes);




app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});