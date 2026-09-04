// middleware/requireRole.js
function requireRole(...allowedTypes) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        if (!allowedTypes.includes(req.user.UserType)) {
            return res.status(403).json({
                message: "Forbidden: bạn không có quyền thực hiện hành động này",
            });
        }

        next();
    };
}

module.exports = requireRole;