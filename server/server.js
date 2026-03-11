const express = require('express')
const cors = require('cors')
const app = express();
const connectDB = require('./config/db');
const dotenv = require('dotenv');

const authRoutes = require('./routes/authRoutes')
const aiRoutes = require('./routes/aiRoutes')
const PORT = process.env.PORT || 3000;


// ENV
require('dotenv').config();
connectDB();

app.use('/api/auth',authRoutes)
app.use('/api/ai',aiRoutes)


app.listen(PORT,()=>{
  console.log(`Server is running at http://localhost:${PORT}`);
  
})