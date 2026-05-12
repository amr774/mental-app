const express = require("express");
const router = express.Router();
const petController = require("../controllers/PetController");
const verifyToken = require("../middlewares/authMiddleware");
const isAdmin = require("../middlewares/adminMiddleware");

// Static routes MUST come before /:id routes
router.get("/pets/adopted",        verifyToken, petController.getAdopted.bind(petController));

router.get("/pets",                petController.getAll.bind(petController));
router.post("/pets",               verifyToken, isAdmin, petController.create.bind(petController));
router.put("/pets/:id",            verifyToken, isAdmin, petController.update.bind(petController));
router.delete("/pets/:id",         verifyToken, isAdmin, petController.delete.bind(petController));

router.post("/pets/:id/adopt",     verifyToken, petController.adopt.bind(petController));
router.delete("/pets/:id/adopt",   verifyToken, petController.unadopt.bind(petController));

module.exports = router;
