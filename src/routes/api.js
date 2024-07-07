const express = require('express');
const router = express.Router();
const api = require('../app/controllers/APIController');
const { cache } = require('../middleware/cache');

router.get('/interpreter', cache, api.getInterpreter);
router.post('/interpreter/create', cache, api.createInterpreter);
router.put('/interpreter/update', cache, api.updateInterpreter);
router.get('/', api.index);

module.exports = router;
