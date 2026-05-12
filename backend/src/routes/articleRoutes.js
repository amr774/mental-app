const express = require("express");
const router = express.Router();
const articleController = require("../controllers/ArticleController");
const verifyToken = require("../middlewares/authMiddleware");
const isAdmin = require("../middlewares/adminMiddleware");

router.get("/articles",       articleController.getAll.bind(articleController));
router.post("/articles",      verifyToken, isAdmin, articleController.create.bind(articleController));
router.put("/articles/:id",   verifyToken, isAdmin, articleController.update.bind(articleController));
router.delete("/articles/:id",verifyToken, isAdmin, articleController.delete.bind(articleController));

module.exports = router;
