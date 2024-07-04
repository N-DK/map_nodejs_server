const express = require('express');
const router = express.Router();
const api = require('../app/controllers/APIController');
const { cache } = require('../middleware/cache');

router.get('/interpreter', cache, api.getInterpreter);
router.get('/', api.index);

module.exports = router;
