const express = require('express');
const router = express.Router();
const dossierController = require('../controllers/dossierController');

router.get('/', dossierController.getAllDossiers);
router.patch('/reorder', dossierController.reorderDossiers);
router.post('/', (req, res, next) => req.app.get('upload').array('files')(req, res, next), dossierController.createDossier);
router.get('/:id', dossierController.getDossierById);
router.put('/:id', dossierController.updateDossier);
router.delete('/:id', dossierController.deleteDossier);
router.post('/:id/analyze', dossierController.reAnalyzeDossier);
router.post('/:id/documents', (req, res, next) => req.app.get('upload').array('files')(req, res, next), dossierController.addDossierDocuments);

// Versions
router.get('/versions/:id', dossierController.getVersionById);
router.put('/versions/:id', dossierController.updateVersion);
router.delete('/versions/:id', dossierController.deleteVersion);
router.patch('/versions/:id/rename', dossierController.renameVersion);
router.patch('/versions/:id/bookmark', dossierController.toggleVersionBookmark);
router.get('/versions/:id/export', dossierController.exportVersion);

// Agreements
router.post('/:id/agreements', dossierController.createAgreement);
router.post('/agreements/:id/versions', (req, res, next) => req.app.get('upload').single('file')(req, res, next), dossierController.createVersion);
router.delete('/agreements/:id', dossierController.deleteAgreement);

module.exports = router;
