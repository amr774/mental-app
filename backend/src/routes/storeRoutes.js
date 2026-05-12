const express     = require("express");
const router      = express.Router();
const ctrl        = require("../controllers/StoreController");
const verifyToken = require("../middlewares/authMiddleware");
const isAdmin     = require("../middlewares/adminMiddleware");

router.get   ("/store",               ctrl.getAll.bind(ctrl));                              // public — browse
router.get   ("/store/mine",          verifyToken, ctrl.getMine.bind(ctrl));                // my listings
router.get   ("/store/admin/all",     verifyToken, isAdmin, ctrl.getAdminAll.bind(ctrl));   // admin — all items
router.post  ("/store",               verifyToken, ctrl.create.bind(ctrl));                 // create listing
router.put   ("/store/:id",           verifyToken, isAdmin, ctrl.update.bind(ctrl));        // admin edit
router.patch ("/store/:id/sold",      verifyToken, ctrl.markSold.bind(ctrl));               // mark as sold
router.delete("/store/:id",           verifyToken, ctrl.delete.bind(ctrl));                 // delete

module.exports = router;
