const express = require("express");
const router = express.Router();
const userController = require("../controllers/UserController");
const verifyToken = require("../middlewares/authMiddleware");

router.get("/profile",               verifyToken, userController.getProfile.bind(userController));
router.put("/profile",               verifyToken, userController.updateProfile.bind(userController));
router.post("/profile/avatar",       verifyToken, (req, res) => userController.uploadAvatar(req, res));
router.get("/wishlist",              verifyToken, userController.getWishlist.bind(userController));
router.post("/wishlist/:petId",      verifyToken, userController.addToWishlist.bind(userController));
router.delete("/wishlist/:petId",    verifyToken, userController.removeFromWishlist.bind(userController));

module.exports = router;
