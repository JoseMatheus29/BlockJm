const express = require('express');
const cors = require('cors');
const certificationRoutes = require('./routes/certificationRoutes');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/certification', certificationRoutes);


const swaggerSetup = require('./config/swagger');
swaggerSetup(app);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server rodando na porta ${PORT}`);
});
