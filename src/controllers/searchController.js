// controllers/searchController.js

const searchService = require('../services/searchService');

async function searchVideos(req, res) {
    try {
        const { keyword, page = 1, pageSize = 20 } = req.query;

        // Kiểm tra keyword
        if (!keyword || keyword.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng nhập từ khóa tìm kiếm'
            });
        }

        // Chuyển page và pageSize sang Number
        const pageNumber = Number(page);
        const pageSizeNumber = Number(pageSize);

        // Kiểm tra phân trang
        if (
            !Number.isInteger(pageNumber) ||
            pageNumber < 1 ||
            !Number.isInteger(pageSizeNumber) ||
            pageSizeNumber < 1
        ) {
            return res.status(400).json({
                success: false,
                message: 'page và pageSize phải là số nguyên dương'
            });
        }

        // Gọi service tìm kiếm
        const result = await searchService.searchVideos(
            keyword.trim(),
            {
                page: pageNumber,
                pageSize: pageSizeNumber
            }
        );

        return res.status(200).json({
            success: true,
            ...result
        });

    } catch (error) {
        console.error('Lỗi searchVideos:', error);

        return res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra khi tìm kiếm video'
        });
    }
}

async function searchBattlers(req, res) {
    try {
        const { keyword, limit = 5 } = req.query;

        if (!keyword || keyword.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng nhập từ khóa tìm kiếm battler'
            });
        }

        const limitNumber = Number(limit);

        if (!Number.isInteger(limitNumber) || limitNumber < 1) {
            return res.status(400).json({
                success: false,
                message: 'limit phải là số nguyên dương'
            });
        }

        const result = await searchService.searchBattlers(keyword.trim(), {
            limit: limitNumber
        });

        return res.status(200).json({
            success: true,
            ...result
        });
    } catch (error) {
        console.error('Lỗi searchBattlers:', error);

        return res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra khi tìm kiếm battler'
        });
    }
}

module.exports = {
    searchVideos,
    searchBattlers
};