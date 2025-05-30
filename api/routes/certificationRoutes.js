const express = require('express');
const router = express.Router();
const certificationController = require('../controllers/certificationController');

router.post('/certify', certificationController.certifyDocument);
router.get('/:hash', certificationController.getCertification);

module.exports = router;
