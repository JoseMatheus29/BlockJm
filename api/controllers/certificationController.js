const fs = require('fs');
const crypto = require('crypto');
const certificationService = require('../services/certificationService');
const { PrismaClient } = require('@prisma/client');

exports.certifyDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Arquivo PDF é obrigatório' });
    }
    if (req.file.mimetype !== 'application/pdf') {
      // Limpar arquivo inválido
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ error: 'Somente PDF é aceito' });
    }

    // Ler o arquivo para gerar hash
    const fileBuffer = fs.readFileSync(req.file.path);
    const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');

    // Chamar o serviço para certificar documento na blockchain
    const result = await certificationService.certifyDocument(`0x${hash}`);

    // Opcional: apagar arquivo após processamento
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    // Retornar resposta JSON de sucesso
    return res.status(200).json({ 
      message: 'Documento certificado com sucesso',
      documentHash: `0x${hash}`,
      txHash: result.txHash,
      blockNumber: result.blockNumber
    });
  } catch (error) {
    // Limpar arquivo em caso de erro
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    // Tratamento de erro específico
    if (error.message.includes('já certificado')) {
      return res.status(409).json({ error: 'Documento já foi certificado' });
    }
    if (error.message.includes('Falha ao certificar')) {
      return res.status(500).json({ error: error.message });
    }
    
    // Retornar resposta JSON de erro genérico
    return res.status(400).json({ error: error.message });
  }
};

exports.getCertification = async (req, res) => {
  try {
    const { hash } = req.params;
    
    // Validar formato do hash
    if (!hash || !hash.startsWith('0x')) {
      return res.status(400).json({ 
        error: 'Hash inválido. Deve começar com 0x' 
      });
    }

    const result = await certificationService.getCertification(hash);
    
    // Se o status é inconsistent, retorna 409 (Conflict)
    if (result.status === 'inconsistent') {
      return res.status(409).json(result);
    }
    
    res.json(result);
  } catch (error) {
    res.status(404).json({ 
      error: error.message,
      status: 'not_found'
    });
  }
};

exports.listAll = async (req, res) => {
  try {
    const results = await certificationService.listAll();
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.updateCertification = async (req, res) => {
  try {
    const { hash } = req.params;
    const data = req.body;

    const updated = await certificationService.updateCertification(hash, data);
    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
exports.deleteCertification = async (req, res) => {
  try {
    const { hash } = req.params;

    await certificationService.deleteCertification(hash);
    res.json({ message: 'Certificação deletada com sucesso' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
exports.getByCertifier = async (req, res) => {
  try {
    const { address } = req.params;
    const results = await certificationService.getByCertifier(address);
    res.json(results);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.renderHomePage = async (req, res) => {
  const prisma = new PrismaClient();
  try {
    const certifications = await prisma.certification.findMany({
      orderBy: { id: 'desc' }
    });

    res.render('index', {
      title: 'Página Inicial',
      certifications,
      message: req.query.message,
      messageType: req.query.type || 'success'
    });
  } catch (error) {
    res.render('index', {
      title: 'Página Inicial',
      certifications: [],
      message: 'Erro ao carregar documentos.',
      messageType: 'danger'
    });
  }
};