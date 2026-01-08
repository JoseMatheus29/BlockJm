const { ethers } = require('ethers');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');
const path = require('path');

// Carregar ABI
const abiPath = path.resolve(__dirname, '../../artifacts/contracts/Lock.sol/DocumentCertification.json');
const contractABI = JSON.parse(fs.readFileSync(abiPath, 'utf8')).abi;

const contractAddress = process.env.CONTRACT_ADDRESS;
const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');
let wallet = null;
let contract = null;
try {
  if (process.env.PRIVATE_KEY && contractAddress) {
    wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    contract = new ethers.Contract(contractAddress, contractABI, wallet);
  }
} catch (err) {
  // Avoid throwing during module load (tests/environments without envs)
  console.warn('certificationService: wallet/contract not initialized:', err && err.message);
  wallet = null;
  contract = null;
}

exports.certifyDocument = async (documentHash) => {
  if (!contract) throw new Error('Contract not configured');

  const tx = await contract.certifyDocument(documentHash);

  const existing = await prisma.certification.findUnique({
    where: { documentHash }
  });

  if (existing) {
    throw new Error("Documento já certificado");
  }

  await prisma.certification.create({
    data: {
      documentHash,
      txHash: tx.hash,
      timestamp: new Date(),
      certifier: wallet ? wallet.address : null,
    },
  });

  return { message: 'Documento certificado', txHash: tx.hash };
};

exports.getCertification = async (documentHash) => {
  if (!contract) throw new Error('Contract not configured');

  const [timestamp, certifier] = await contract.getCertification(documentHash);
  if (!timestamp) throw new Error('Documento não certificado');

  return { documentHash, timestamp: new Date(Number(timestamp) * 1000), certifier };
};

exports.listAll = async () => {
  return await prisma.certification.findMany();
};

exports.updateCertification = async (documentHash, data) => {
  const existing = await prisma.certification.findUnique({
    where: { documentHash },
  });
  if (!existing) throw new Error('Certificação não encontrada');

  return await prisma.certification.update({
    where: { documentHash },
    data,
  });
};

exports.deleteCertification = async (documentHash) => {
  const existing = await prisma.certification.findUnique({
    where: { documentHash },
  });
  if (!existing) throw new Error('Certificação não encontrada');

  return await prisma.certification.delete({
    where: { documentHash },
  });
};
exports.getByCertifier = async (certifier) => {
  return await prisma.certification.findMany({
    where: { certifier },
  });
};
