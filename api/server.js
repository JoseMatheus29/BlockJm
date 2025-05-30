const express = require('express');
const cors = require('cors');
const certificationRoutes = require('../api/routes/certificationRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Usar rotas de certificação
app.use('/certification', certificationRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server rodando na porta ${PORT}`);
});
