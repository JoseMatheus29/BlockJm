    const express = require('express');
    const router = express.Router();
    const certificationController = require('../controllers/certificationController');
    const multer = require('multer');
    const upload = multer({ dest: 'uploads/' });

    // Rotas específicas primeiro (antes das rotas com parâmetros dinâmicos)
    router.get('/', certificationController.listAll);
    router.post('/certify', upload.single('file'), certificationController.certifyDocument);
    router.get('/certifier/:address', certificationController.getByCertifier);
    
    // Rotas com parâmetros dinâmicos por último
    router.get('/:hash', certificationController.getCertification);
    router.put('/:hash', certificationController.updateCertification);
    router.delete('/:hash', certificationController.deleteCertification);

    module.exports = router;
