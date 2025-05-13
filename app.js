const express = require('express');
const {Web3} = require('web3');
const app = express();
const port = 3000;

// Conectar à rede Ethereum (testnet ou mainnet)
const web3 = new Web3(new Web3.providers.HttpProvider('https://sepolia.etherscan.io/tx/0xb6fbf89d2d091af51e4b559f3e9b2ed1909244416ab92ca3244e934dee005c28'));

// ABI do contrato inteligente (substitua com a ABI do seu contrato)
const contractABI = [
	{
		"inputs": [],
		"name": "dataHash",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getDataHash",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_dataHash",
				"type": "string"
			}
		],
		"name": "registerData",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	}
];
// Endereço do contrato implantado
const contractAddress = '0xe3B3aCfb31a3040CD5fE8381193F3BC4f00C55FE'; // Endereço do contrato inteligente

// Criando instância do contrato
const contract = new web3.eth.Contract(contractABI, contractAddress);
console.log(contract.methods.getDataHash().call())
// Definindo a rota para interagir com o contrato inteligente
app.get('/', async (req, res) => {
  try {
    const result = await contract.methods.getDataHash().call();


    res.send(`Resultado da função do contrato: ${result}`);
  } catch (error) {
    res.send(`Erro ao interagir com o contrato: ${error.message}`);
  }
});

// Rodando o servidor na porta 3000
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
