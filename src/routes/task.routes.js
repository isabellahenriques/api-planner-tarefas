const { Router } = require('express');
const taskController = require('../controllers/task.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

const router = Router();

router.use(authMiddleware);

router.get('/', taskController.listar);
router.post('/', taskController.criar);
router.get('/:id', taskController.obter);
router.patch('/:id', taskController.patch);
router.delete('/:id', taskController.remover);

module.exports = router;
