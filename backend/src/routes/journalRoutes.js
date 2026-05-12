const express = require("express");
const router = express.Router();
const journalController = require("../controllers/JournalController");
const verifyToken = require("../middlewares/authMiddleware");

router.get("/journal",         verifyToken, journalController.getAll.bind(journalController));
router.post("/journal",        verifyToken, journalController.create.bind(journalController));
router.delete("/journal/:id",  verifyToken, journalController.delete.bind(journalController));

module.exports = router;
