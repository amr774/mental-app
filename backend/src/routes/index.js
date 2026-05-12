// routes/index.js
const express = require("express");
const router = express.Router();

router.use(require("./authRoutes"));
router.use(require("./userRoutes"));
router.use(require("./articleRoutes"));
router.use(require("./petRoutes"));
router.use(require("./personalityRoutes"));
router.use(require("./chatbotRoutes"));
router.use(require("./adminRoutes"));
router.use(require("./moodRoutes"));
router.use(require("./journalRoutes"));
router.use(require("./storeRoutes"));
router.use(require("./postRoutes"));
router.use(require("./goalRoutes"));
router.use(require("./dashboardRoutes"));
router.use(require("./orderRoutes"));

module.exports = router;