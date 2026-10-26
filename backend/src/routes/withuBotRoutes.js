const express    = require("express");
const router     = express.Router();
const controller = require("../controllers/WithUBotController");
const auth       = require("../middlewares/authMiddleware");

router.post("/withubot/chat", auth, controller.chat);

module.exports = router;
