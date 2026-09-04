// middleware/guestReadOnly.js
function guestReadOnly(req, res, next) {
    const isGuest = req.user?.role === "guest";
    const isWriteMethod = ["POST", "PUT", "PATCH", "DELETE"].includes(req.method);

    if (isGuest && isWriteMethod) {
        return res.status(403).json({ message: "Tài khoản khách không có quyền chỉnh sửa dữ liệu" });
    }

    next();
}

module.exports = guestReadOnly;