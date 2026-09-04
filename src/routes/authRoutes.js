// routes/authRoutes.js
const express = require("express");
const authController = require("../controllers/authController");
const authenticate = require("../middleware/authenticate");
const requireAuth = require("../middleware/requireAuth");
const router = express.Router();

router.post("/google", authController.googleLogin);
router.post("/guest", authController.guestLogin);
router.get("/me", authenticate, requireAuth, authController.getMe);

module.exports = router;