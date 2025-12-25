const express = require('express');
const router = express.Router();
const templateController = require('../controllers/templateController');

router.get('/', templateController.getAllTemplates);
router.get('/:id', templateController.getTemplateById);
router.put('/:id', templateController.updateTemplate);
router.post('/', templateController.createTemplate);
router.delete('/:id', templateController.deleteTemplate);

module.exports = router;
