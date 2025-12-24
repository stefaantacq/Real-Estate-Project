const express = require('express');
const router = express.Router();
const dossierController = require('../controllers/dossierController');

router.get('/', dossierController.getAllDossiers);
router.post('/', dossierController.createDossier);
router.get('/:id', dossierController.getDossierById);
router.delete('/:id', dossierController.deleteDossier);

module.exports = router;
