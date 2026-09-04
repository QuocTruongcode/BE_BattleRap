// controllers/authController.js
const authService = require("../services/authService");

async function googleLogin(req, res) {
    try {
        const { idToken } = req.body;

        if (!idToken) {
            return res.status(400).json({ message: "Thiếu idToken" });
        }

        const token = await authService.loginWithGoogle(idToken);
        console.log("Check token: ", token)
        res.json({ token });
    } catch (err) {
        console.error(err);
        res.status(401).json({ message: "Đăng nhập Google thất bại" });
    }
}

function guestLogin(req, res) {
    const token = authService.loginAsGuest();
    res.json({ token });
}

async function getMe(req, res) {
    try {
        const profile = await authService.getUserProfile(req.user.userId);
        res.json(profile);
    } catch (err) {
        console.error(err);
        const statusCode = err.statusCode || 500;
        res.status(statusCode).json({ error: err.message || "Internal server error" });
    }
}

module.exports = {
    googleLogin,
    guestLogin,
    getMe
};