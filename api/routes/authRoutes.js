const express = require('express');
const router = express.Router();
const { generateNonce, verifyLogin } = require('../controllers/authController');

// Rota para gerar o nonce
router.get('/nonce', (req, res) => {
   const { address } = req.query;  // Obtém o parâmetro address da query string
  const nonce = generateNonce(address);
  res.json({ nonce });
});

// Rota para o login
router.post('/login', async (req, res) => {
  const { address, signature, nonce } = req.body;

  // verifica o nonce armazenado e a assinatura
  const isValid = await verifyLogin(address, signature, nonce);

  if (isValid) {
    // O login é bem-sucedido, podemos gerar um JWT ou apenas retornar uma resposta
    res.status(200).json({ message: 'Login bem-sucedido', address });
  } else {
    res.status(400).json({ error: 'Falha na autenticação' });
  }
});

module.exports = router;
