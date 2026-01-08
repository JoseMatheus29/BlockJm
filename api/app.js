const express = require('express');
const cors = require('cors');
const certificationRoutes = require('./routes/certificationRoutes');
const authRoutes = require('./routes/authRoutes');
const swaggerSetup = require('./config/swagger');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/certification', certificationRoutes);
app.use('/auth', authRoutes);

// Swagger docs
swaggerSetup(app);

module.exports = app;
