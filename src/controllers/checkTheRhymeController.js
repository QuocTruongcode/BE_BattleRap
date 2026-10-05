const { Bar } = require("../../models");
const { checkTheRhyme } = require("../services/checkTheRhymeService");

const checkTheRhymeByVideoIdController = async (req, res) => {
    const { videoId } = req.params;

    if (!/^\d+$/.test(videoId)) {
        return res.status(400).json({
            success: false,
            message: "videoId phải là một số nguyên hợp lệ",
        });
    }

    try {
        const bars = await Bar.findAll({
            attributes: ["content"],
            where: { videoId: Number(videoId) },
            order: [["id", "ASC"]],
            raw: true,
        });
        const text = bars.map(({ content }) => content ?? "").join("\n");
        const result = checkTheRhyme(text);

        return res.status(200).json({
            success: true,
            data: result.html,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = { checkTheRhymeByVideoIdController };