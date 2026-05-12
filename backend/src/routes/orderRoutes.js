const express    = require('express');
const router     = express.Router();
const ctrl       = require('../controllers/OrderController');
const verifyToken = require('../middlewares/authMiddleware');
const isAdmin    = require('../middlewares/adminMiddleware');

router.post  ('/orders',               verifyToken, ctrl.create.bind(ctrl));
router.get   ('/orders/mine',          verifyToken, ctrl.getMyOrders.bind(ctrl));
router.get   ('/admin/orders',         verifyToken, isAdmin, ctrl.getAllOrders.bind(ctrl));
router.patch ('/admin/orders/:id/status', verifyToken, isAdmin, ctrl.updateStatus.bind(ctrl));

module.exports = router;
