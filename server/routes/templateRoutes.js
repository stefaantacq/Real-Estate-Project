const express = require('express');
const router = express.Router();
const templateController = require('../controllers/templateController');

router.get('/', templateController.getAllTemplates);
router.get('/:id', templateController.getTemplateById);

router.put('/:id', templateController.updateTemplate);
router.post('/', (req, res, next) => {
    const upload = req.app.get('upload');
    upload.single('file')(req, res, next);
}, templateController.createTemplate);
router.delete('/:id', templateController.deleteTemplate);
router.patch('/:id/archive', templateController.toggleArchive);

module.exports = router;
