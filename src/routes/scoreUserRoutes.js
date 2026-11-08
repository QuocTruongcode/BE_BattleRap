const express = require("express");
const scoreUserController = require("../controllers/scoreUserController");

const router = express.Router();

function ggFormAuth(req, res, next) {
    if (!process.env.GGFORM_API_KEY || req.header('X-Secret') !== process.env.GGFORM_API_KEY) {
        return res.status(401).json({ message: 'Unauthorized worker' });
    }
    next();
}

router.post("/", ggFormAuth, scoreUserController.updateScoreByEmailController);

module.exports = router;
