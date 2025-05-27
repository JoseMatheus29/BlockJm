require('dotenv').config();
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { ethers } = require('ethers');
const path = require('path');
const fs = require('fs');

// Caminho até o arquivo JSON da ABI
const abiPath = path.resolve(__dirname, '../artifacts/contracts/Lock.sol/DocumentCertification.json');

// Carrega o JSON completo
const artifact = JSON.parse(fs.readFileSync(abiPath, 'utf8'));


const app = express();
app.use(express.json());

const prisma = new PrismaClient();

// Setup provider e wallet
const provider = new ethers.AlchemyProvider('sepolia', process.env.ALCHEMY_API_KEY);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// ABI e endereço do contrato (coloque os seus!)
const contractAddress = '0xe675d25eb3cda9bf81055c962e0da794add2662c';
const contractABI = artifact.abi;

const contract = new ethers.Contract(contractAddress, contractABI, wallet);

// Endpoint para certificar documento
app.post('/certify', async (req, res) => {
  const { documentHash } = req.body;
  if (!documentHash) return res.status(400).json({ error: 'documentHash is required' });

  try {
    const tx = await contract.certifyDocument(documentHash);
    const receipt = await tx.wait();

    // Salva no banco
    await prisma.certification.create({
      data: {
        documentHash,
        txHash: tx.hash,
        timestamp: new Date(),  // você pode pegar do evento no receipt para mais precisão
        certifier: wallet.address,
      },
    });
    res.json({ message: 'Documento certificado', txHash: tx.hash });
  } catch (error) {
        console.log(contract.interface.fragments.map(f => f.name));

    res.status(500).json({ error: error.message });
  }
});

// Endpoint para consultar certificação
app.get('/certification/:hash', async (req, res) => {
  const documentHash = req.params.hash;

  try {
    const [timestamp, certifier] = await contract.getCertification(documentHash);
    res.json({ documentHash, timestamp: new Date(timestamp * 1000), certifier });
  } catch (error) {
    res.status(404).json({ error: 'Documento não certificado' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
