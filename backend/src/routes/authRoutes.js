const express = require("express");
const router = express.Router();
const authController = require("../controllers/AuthController");

router.post("/register",        authController.register.bind(authController));
router.post("/login",           authController.login.bind(authController));
router.post("/forgot-password", authController.forgotPassword.bind(authController));
router.post("/reset-password",  authController.resetPassword.bind(authController));

module.exports = router;
