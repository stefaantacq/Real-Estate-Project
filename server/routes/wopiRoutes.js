const express = require('express');
const router = express.Router();
const wopiController = require('../controllers/wopiController');

// Standard WOPI Endpoints
// URL Convention: /files/<id>

router.get('/files/:id', wopiController.checkFileInfo);
router.get('/files/:id/contents', wopiController.getFile);
router.post('/files/:id/contents', wopiController.putFile);

module.exports = router;
