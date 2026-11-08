const { User } = require("../../models");

const updateScoreByEmail = async (email, score) => {
    try {
        const user = await User.findOne({ where: { Email: email } });
        if (!user) {
            const error = new Error("Không tìm thấy User với email này");
            error.statusCode = 404;
            throw error;
        }

        await user.update({ score });
        return user;
    } catch (error) {
        if (error.statusCode) {
            throw error;
        }
        throw new Error(`Lỗi khi cập nhật điểm User: ${error.message}`);
    }
};

module.exports = {
    updateScoreByEmail,
};
