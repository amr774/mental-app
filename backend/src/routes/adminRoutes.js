const express = require("express");
const router = express.Router();
const adminController = require("../controllers/AdminController");
const verifyToken = require("../middlewares/authMiddleware");
const isAdmin = require("../middlewares/adminMiddleware");

router.get("/admin/stats",                verifyToken, isAdmin, adminController.getStats.bind(adminController));
router.get("/admin/users",                verifyToken, isAdmin, adminController.getAllUsers.bind(adminController));
router.delete("/admin/users/:id",         verifyToken, isAdmin, adminController.deleteUser.bind(adminController));
router.get("/admin/personality-results",  verifyToken, isAdmin, adminController.getPersonalityResults.bind(adminController));

module.exports = router;
