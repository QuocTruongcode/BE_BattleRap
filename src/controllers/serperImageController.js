const serperImageService = require("../services/serperImageService");

const searchImages = async (req, res) => {
    try {
        const {
            q,
            query,
            num = 1,
            page = 1,
        } = req.body;
        const searchQuery = q ?? query;
        const numNumber = Number(num);
        const pageNumber = Number(page);

        if (
            typeof searchQuery !== "string" ||
            !searchQuery.trim() ||
            !Number.isInteger(numNumber) ||
            numNumber < 1 ||
            numNumber > 100 ||
            !Number.isInteger(pageNumber) ||
            pageNumber < 1
        ) {
            return res.status(400).json({
                success: false,
                message: "q phải là chuỗi không rỗng; num từ 1 đến 100; page là số nguyên dương",
            });
        }

        const data = await serperImageService.searchImages({
            query: searchQuery.trim(),
            num: numNumber,
            page: pageNumber,
        });

        return res.status(200).json({
            success: true,
            data,
        });
    } catch (error) {
        console.error("Lỗi searchImages:", error);

        const status = error.response?.status;
        return res.status(status >= 400 && status < 600 ? status : 500).json({
            success: false,
            message: "Có lỗi xảy ra khi tìm kiếm hình ảnh",
            ...(error.response?.data?.message && {
                details: error.response.data.message,
            }),
        });
    }
};

module.exports = {
    searchImages,
};