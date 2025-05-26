const { ethers } = require('ethers');
// Cria uma wallet nova e imprime a chave privada e o endereço
const wallet = ethers.Wallet.createRandom();
console.log('Endereço:', wallet.address);
console.log('Chave privada:', wallet.privateKey);