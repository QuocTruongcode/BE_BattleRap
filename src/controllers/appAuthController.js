// controllers/appAuthController.js
const crypto = require("crypto");
const { User } = require("../../models");                               // đổi đường dẫn cho khớp project
const { generateUserToken } = require("../services/authService");   // nơi bạn export hàm này

const CODE_TTL_MS = 60_000; // code sống 60 giây
const codes = new Map();    // code -> { userId, challenge, exp }

// Dọn các code hết hạn mỗi phút để Map không phình to
setInterval(() => {
    const now = Date.now();
    for (const [k, v] of codes) {
        if (v.exp < now) codes.delete(k);
    }
}, 60_000).unref();

// POST /api/auth/app/code
// Trình duyệt gọi (đã có JWT thường): xin code để chuyển về app
function createAppCode(req, res) {
    const { challenge } = req.body || {};

    // SHA256 base64url luôn dài đúng 43 ký tự
    if (typeof challenge !== "string" || !/^[A-Za-z0-9_-]{43}$/.test(challenge)) {
        return res.status(400).json({ message: "challenge không hợp lệ" });
    }

    const code = crypto.randomBytes(32).toString("base64url");
    codes.set(code, {
        userId: req.user.userId,
        challenge,
        exp: Date.now() + CODE_TTL_MS,
    });

    res.json({ code });
}

// POST /api/auth/app/exchange
// App gọi (chưa có token): gửi code + verifier để nhận JWT mới
async function exchangeAppCode(req, res) {
    try {
        const { code, verifier } = req.body || {};

        const entry = typeof code === "string" ? codes.get(code) : null;
        if (entry) codes.delete(code); // dùng 1 lần: xóa ngay, trước mọi bước kiểm tra

        if (!entry || entry.exp < Date.now() || typeof verifier !== "string") {
            return res.status(400).json({ message: "Code không hợp lệ hoặc đã hết hạn" });
        }

        // Băm verifier rồi so với challenge đã lưu (so sánh thời gian hằng số)
        const hash = crypto.createHash("sha256").update(verifier).digest();
        const expected = Buffer.from(entry.challenge, "base64url");
        if (hash.length !== expected.length || !crypto.timingSafeEqual(hash, expected)) {
            return res.status(400).json({ message: "Code không hợp lệ hoặc đã hết hạn" });
        }

        // Tra lại user từ DB để JWT mới phản ánh dữ liệu hiện tại
        const user = await User.findByPk(entry.userId);
        if (!user) {
            return res.status(404).json({ message: "Không tìm thấy người dùng" });
        }

        const token = generateUserToken(user, { client: "app" });
        res.json({ token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Lỗi máy chủ" });
    }
}

module.exports = { createAppCode, exchangeAppCode };