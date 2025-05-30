const certificationService = require('../services/certificationService');

exports.certifyDocument = async (req, res) => {
  try {
    const { documentHash } = req.body;
    if (!documentHash) {
      return res.status(400).json({ error: 'documentHash é obrigatório'   });
    }
    const result = await certificationService.certifyDocument(documentHash);
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
