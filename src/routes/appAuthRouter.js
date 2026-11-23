const express = require("express");

const appAuthController = require("../controllers/appAuthController");
const authenticate = require("../middleware/authenticate");
const requireAuth = require("../middleware/requireAuth");
const requireRealUser = (req, res, next) => {
    if (req.user.role === "guest") {
        return res.status(403).json({ message: "Tài khoản khách không dùng được luồng này" });
    }
    next();
};
const router = express.Router();


router.post("/code", authenticate, requireAuth, requireRealUser, appAuthController.createAppCode);
router.post("/exchange", appAuthController.exchangeAppCode);

module.exports = router;
