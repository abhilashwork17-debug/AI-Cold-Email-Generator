const express = require('express')
const cors = require('cors')
const app = express();

const authRoutes = require('./routes/authRoutes')
const aiRoutes = require('./routes/aiRoutes')
const PORT = process.env.PORT || 3000;



app.use('/api/auth',authRoutes)
app.use('/api/ai',aiRoutes)


app.listen(PORT,()=>{
  console.log(`Server is running at http://localhost:${PORT}`);
  
})