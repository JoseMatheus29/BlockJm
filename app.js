const express = require('express');
const Web3 = require('web3');

const app = express();
const port = 3000;

// URL do endpoint da Alchemy para Sepolia — substitua pela sua chave
const ALCHEMY_RPC_URL = 'https://eth-sepolia.g.alchemy.com/v2/SUA_API_KEY';

// Inicializa o Web3 usando o endpoint da Alchemy
const web3 = new Web3(ALCHEMY_RPC_URL);

// ABI e endereço do contrato — substitua pelos seus valores
const contractABI = [ /* Cole sua ABI aqui */ ];
const contractAddress = '0xSEU_CONTRATO';

const contract = new web3.eth.Contract(contractABI, contractAddress);

// Para interpretar JSON no body das requisições POST
app.use(express.json());

// Rota para testar se API está online
app.get('/', (req, res) => {
  res.send('API Blockchain com Alchemy está no ar!');
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
