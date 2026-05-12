const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/GoalController');
const verifyToken = require('../middlewares/authMiddleware');

router.get('/goals',                    verifyToken, ctrl.getAll.bind(ctrl));
router.post('/goals',                   verifyToken, ctrl.create.bind(ctrl));
router.patch('/goals/:id/toggle',       verifyToken, ctrl.toggleDay.bind(ctrl));
router.delete('/goals/:id',             verifyToken, ctrl.delete.bind(ctrl));

module.exports = router;
