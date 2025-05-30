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
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contract = new ethers.Contract(contractAddress, contractABI, wallet);

exports.certifyDocument = async (documentHash) => {
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
            certifier: wallet.address,
        },
    });


    return { message: 'Documento certificado', txHash: tx.hash };
};

exports.getCertification = async (documentHash) => {
    const [timestamp, certifier] = await contract.getCertification(documentHash);
    if (!timestamp) throw new Error('Documento não certificado');

    return { documentHash, timestamp: new Date(timestamp * 1000), certifier };
};
