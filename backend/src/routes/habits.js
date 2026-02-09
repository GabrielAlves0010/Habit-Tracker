const express = require('express');
const router = express.Router();
const habitController = require('../controllers/habitController');
const authMiddleware = require('../middleware/auth');

// Todas as rotas requerem autenticação
router.use(authMiddleware);

// CRUD de hábitos
router.get('/', habitController.getAll);
router.post('/', habitController.create);
router.put('/:id', habitController.update);
router.delete('/:id', habitController.delete);

// Marcar/desmarcar como completo
router.post('/:id/toggle', habitController.toggleComplete);

// Histórico e calendário
router.get('/:id/history', habitController.getHistory);
router.get('/calendar/all', habitController.getCalendar);

module.exports = router;
