const express = require('express');
const cors = require('cors');
const path = require('path');
const certificationRoutes = require('../api/routes/certificationRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Configuração das views
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Rotas da API
app.use('/certification', certificationRoutes);

// Rota para página inicial via EJS
app.get('/', (req, res) => {
  res.render('index', {
    title: 'Página Inicial',
    message: req.query.message,
    messageType: req.query.type || 'success',
  });
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server rodando na porta ${PORT}`);
});
