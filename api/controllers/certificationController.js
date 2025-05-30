const certificationService = require('../services/certificationService');

exports.certifyDocument = async (req, res) => {
  try {
    const { documentHash } = req.body;
    if (!documentHash) {
      return res.status(400).json({ error: 'documentHash é obrigatório' });
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
