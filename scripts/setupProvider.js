// scripts/setupProvider.js
require('dotenv').config();     // Carrega ALCHEMY_API_KEY e PRIVATE_KEY
              

const { ethers } = require('ethers');

async function main() {
  // 1) Cria o provider apontando para Sepolia via Alchemy
const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

  // 2) Cria a wallet a partir da chave privada e conecta ao provider
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  //const contract = new ethers.Contract(contractAddress, contractABI, wallet);


  // 3) Teste simples: pegue o número do bloco atual
  const blockNumber = await provider.getBlockNumber();
  console.log(`🛠 Conectado à Rede Local . Bloco atual: ${blockNumber}`);

  // 4) Exemplo de envio de transação (gasLimit baixo apenas para teste)
  // const tx = await wallet.sendTransaction({
  //   to: wallet.address, // envia para si mesmo
  //   value: ethers.utils.parseEther('0.001'),
  //   gasLimit: 21000
  // });
  // console.log('Tx enviada:', tx.hash);
  // await tx.wait();
  // console.log('Tx confirmada!');
}

main().catch(err => {
  console.error('❌ Erro ao configurar provider:', err);
  process.exit(1);
});
