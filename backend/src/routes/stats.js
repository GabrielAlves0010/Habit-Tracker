const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');
const authMiddleware = require('../middleware/auth');

// Todas as rotas requerem autenticação
router.use(authMiddleware);

router.get('/', statsController.getStats);
router.get('/progress', statsController.getProgress);
router.get('/heatmap', statsController.getHeatmap);

module.exports = router;
