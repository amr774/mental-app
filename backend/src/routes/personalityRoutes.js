const express = require("express");
const router = express.Router();
const personalityController = require("../controllers/PersonalityController");
const verifyToken = require("../middlewares/authMiddleware");

router.post("/personality-test",     verifyToken, personalityController.takeTest.bind(personalityController));
router.get("/personality-test/my",   verifyToken, personalityController.getMyTests.bind(personalityController));

module.exports = router;
