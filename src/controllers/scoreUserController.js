const scoreUserService = require("../services/scoreUserService");

const updateScoreByEmailController = async (req, res) => {
    const { email, totalScore } = req.body || {};

    if (typeof email !== "string" || !email.trim()) {
        return res.status(400).json({
            success: false,
            message: "Email không được để trống",
        });
    }

    if (typeof totalScore !== "number" || !Number.isFinite(totalScore)) {
        return res.status(400).json({
            success: false,
            message: "totalScore phải là một số hợp lệ",
        });
    }

    try {
        const user = await scoreUserService.updateScoreByEmail(email.trim(), totalScore);
        res.status(200).json({
            success: true,
            message: "Cập nhật điểm User thành công",
            data: {
                id: user.id,
                Email: user.Email,
                score: user.score,
            },
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = {
    updateScoreByEmailController,
};
