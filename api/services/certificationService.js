const { ethers } = require('ethers');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');
const path = require('path');

// Carregar ABI
const abiPath = path.resolve(__dirname, '../../artifacts/contracts/Lock.sol/DocumentCertification.json');
const contractABI = JSON.parse(fs.readFileSync(abiPath, 'utf8')).abi;

const contractAddress = process.env.CONTRACT_ADDRESS;
const blockchainUrl = process.env.BLOCKCHAIN_RPC_URL || 'http://127.0.0.1:8545';
const provider = new ethers.JsonRpcProvider(blockchainUrl);
let wallet = null;
let contract = null;

const initializeContract = async () => {
  try {
    console.log('🔧 Iniciando contrato...');
    console.log('📋 PRIVATE_KEY está definido:', !!process.env.PRIVATE_KEY);
    console.log('📋 CONTRACT_ADDRESS:', contractAddress);
    
    if (!process.env.PRIVATE_KEY || !contractAddress) {
      throw new Error('PRIVATE_KEY ou CONTRACT_ADDRESS não configurados');
    }

    wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    console.log('✅ Wallet criado:', wallet.address);
    
    contract = new ethers.Contract(contractAddress, contractABI, wallet);
    console.log('✅ Contract instância criada');

    // Verificar se o contrato realmente existe na blockchain
    const code = await provider.getCode(contractAddress);
    if (code === '0x') {
      throw new Error(`Contrato não encontrado no endereço ${contractAddress}. Execute: npx hardhat run scripts/deploy.js --network localhost`);
    }

    const maskedKey = process.env.PRIVATE_KEY
      ? `${process.env.PRIVATE_KEY.slice(0, 6)}...${process.env.PRIVATE_KEY.slice(-4)}`
      : 'N/A';

    console.log('✅ Contrato inicializado com sucesso:', contractAddress);
    console.log('🔑 Assinatura (address) utilizada:', wallet.address);
    console.log('🧾 Chave (mascarada) carregada:', maskedKey);
  } catch (err) {
    console.warn('❌ Erro ao inicializar contrato:', err.message);
    console.warn('📍 Stack:', err.stack);
    wallet = null;
    contract = null;
  }
};

// Chamar com await para garantir que completa antes de usar
initializeContract().catch(err => {
  console.error('❌ Falha crítica ao inicializar:', err.message);
});

exports.certifyDocument = async (documentHash) => {
  if (!contract || !wallet) {
    throw new Error('❌ Contrato não inicializado. Verifique: 1) Hardhat node rodando, 2) npx hardhat run scripts/deploy.js --network localhost, 3) CONTRACT_ADDRESS no .env');
  }

  // Verificar se o contrato ainda existe
  const code = await provider.getCode(contractAddress);
  if (code === '0x') {
    throw new Error('Contrato foi removido da blockchain. Execute: npx hardhat run scripts/deploy.js --network localhost');
  }

  // Verificar se já existe no BD
  const existing = await prisma.certification.findUnique({
    where: { documentHash }
  });

  if (existing) {
    throw new Error("Documento já certificado");
  }

  try {
    // Enviar transação
    const tx = await contract.certifyDocument(documentHash);
    console.log(`📤 Transação enviada: ${tx.hash}`);

    // Aguardar confirmação (mínimo 1 bloco)
    const receipt = await tx.wait(1);
    
    if (!receipt || receipt.status === 0) {
      throw new Error('Transação falhou na blockchain');
    }

    console.log(`✅ Transação confirmada em bloco: ${receipt.blockNumber}`);

    // Só salva no BD se a transação foi bem-sucedida
    await prisma.certification.create({
      data: {
        documentHash,
        txHash: tx.hash,
        timestamp: new Date(),
        certifier: wallet ? wallet.address : null,
      },
    });

    return { message: 'Documento certificado com sucesso', txHash: tx.hash, blockNumber: receipt.blockNumber };
  } catch (error) {
    console.error(`❌ Erro ao certificar documento ${documentHash}:`, error.message);
    throw new Error(`Falha ao certificar na blockchain: ${error.message}`);
  }
};

exports.getCertification = async (documentHash) => {
  if (!contract) throw new Error('Contract not configured');

  try {
    const [timestamp, certifier] = await contract.getCertification(documentHash);
    
    if (!timestamp || timestamp === 0n) {
      throw new Error('Documento não certificado na blockchain');
    }

    return { 
      documentHash, 
      timestamp: new Date(Number(timestamp) * 1000), 
      certifier,
      status: 'verified'
    };
  } catch (error) {
    // Verifica se existe no BD mas não na blockchain (órfão)
    const inDatabase = await prisma.certification.findUnique({
      where: { documentHash }
    });

    if (inDatabase) {
      return {
        documentHash,
        status: 'inconsistent',
        message: 'Documento encontrado no banco de dados, mas não verificado na blockchain',
        databaseRecord: inDatabase,
        error: 'Este registro pode estar com a transação pendente ou falha'
      };
    }

    throw new Error(`Documento não encontrado: ${error.message}`);
  }
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
