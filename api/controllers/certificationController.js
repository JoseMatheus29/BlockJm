const fs = require('fs');
const crypto = require('crypto');
const certificationService = require('../services/certificationService');

exports.certifyDocument = async (req, res) => {
  try {
    if (!req.file) {
      console.log(req)
      return res.status(400).json({ error: 'Arquivo PDF é obrigatório' });
    }
    if (req.file.mimetype !== 'application/pdf') {
      return res.status(400).json({ error: 'Somente arquivos PDF são aceitos' });
    }
    const fileBuffer = fs.readFileSync(req.file.path);
    const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
    const result = await certificationService.certifyDocument(`0x${hash}`);
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getCertification = async (req, res) => {
  try {
    const { hash } = req.params;
    const result = await certificationService.getCertification(hash);
    res.json(result);
  } catch (error) {
    res.status(404).json({ error: error.message });
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
