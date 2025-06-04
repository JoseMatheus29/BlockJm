    const express = require('express');
    const router = express.Router();
    const certificationController = require('../controllers/certificationController');
    const multer = require('multer');
    const upload = multer({ dest: 'uploads/' });

    router.post('/certify', upload.single('file'), certificationController.certifyDocument);
    router.get('/:hash', certificationController.getCertification);
    router.get('/', certificationController.listAll);
    router.put('/:hash', certificationController.updateCertification);
    router.delete('/:hash', certificationController.deleteCertification);
    router.get('/certifier/:address', certificationController.getByCertifier);

    module.exports = router;
