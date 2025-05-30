const express = require('express');
const router = express.Router();
const certificationController = require('../controllers/certificationController');

router.post('/certify', certificationController.certifyDocument);
router.get('/:hash', certificationController.getCertification);
router.get('/', certificationController.listAll);
router.put('/:hash', certificationController.updateCertification);
router.delete('/:hash', certificationController.deleteCertification);

module.exports = router;
