const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const certificationRoutes = require('./routes/certificationRoutes');
const authRoutes = require('./routes/authRoutes');
const swaggerSetup = require('./config/swagger');

const app = express();

// Garantir que o diretório de uploads existe
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/certification', certificationRoutes);
app.use('/auth', authRoutes);

// Swagger docs
swaggerSetup(app);

// Middleware de tratamento de rotas não encontradas
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

module.exports = app;
