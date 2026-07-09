const { Bar, Video } = require("../../models");

// Kiểm tra video có tồn tại không
const checkVideoExists = async (videoId) => {
    const video = await Video.findByPk(videoId);
    if (!video) {
        throw new Error(`Video với ID ${videoId} không tồn tại`);
    }
};

// Tạo 1 bar hoặc nhiều bar
const createBar = async (barData) => {
    try {
        // Kiểm tra xem là array hay object
        if (Array.isArray(barData)) {
            // Nhiều bar
            const bars = [];
            for (const bar of barData) {
                // Validation
                if (!bar.time && bar.time !== 0) {
                    throw new Error("startTime là bắt buộc");
                }
                if (!bar.videoId) {
                    throw new Error("videoId là bắt buộc");
                }

                // Kiểm tra video tồn tại
                await checkVideoExists(bar.videoId);

                const newBar = await Bar.create({
                    startTime: bar.time,
                    content: bar.content || null,
                    videoId: bar.videoId,
                    barttelID: bar.barttelID ?? null,
                    barType: bar.barType || null,
                });
                bars.push(newBar);
            }
            return bars;
        } else {
            // Một bar
            if (!barData.time && barData.time !== 0) {
                throw new Error("startTime là bắt buộc");
            }
            if (!barData.videoId) {
                throw new Error("videoId là bắt buộc");
            }

            // Kiểm tra video tồn tại
            await checkVideoExists(barData.videoId);

            const bar = await Bar.create({
                startTime: barData.time,
                content: barData.content || null,
                videoId: barData.videoId,
                barttelID: barData.barttelID ?? null,
                barType: barData.barType || null,
            });
            return bar;
        }
    } catch (error) {
        throw new Error(`Lỗi khi tạo bar: ${error.message}`);
    }
};

// Lấy tất cả bar theo videoId
const getBarsByVideoId = async (videoId) => {
    try {
        const bars = await Bar.findAll({
            where: { videoId },
        });
        return bars;
    } catch (error) {
        throw new Error(`Lỗi khi lấy danh sách bar: ${error.message}`);
    }
};

// Lấy bar theo ID
const getBarById = async (id) => {
    try {
        const bar = await Bar.findByPk(id);
        if (!bar) {
            throw new Error("Bar không tồn tại");
        }
        return bar;
    } catch (error) {
        throw new Error(`Lỗi khi lấy bar: ${error.message}`);
    }
};

// Cập nhật bar
const updateBar = async (id, barData) => {
    try {
        const bar = await Bar.findByPk(id);
        if (!bar) {
            throw new Error("Bar không tồn tại");
        }

        // Nếu cập nhật videoId, kiểm tra tồn tại
        if (barData.videoId && barData.videoId !== bar.videoId) {
            await checkVideoExists(barData.videoId);
        }

        // Validation startTime nếu có cập nhật
        if (barData.startTime !== undefined && !barData.startTime && barData.startTime !== 0) {
            throw new Error("startTime không được để trống");
        }

        await bar.update({
            startTime: barData.startTime !== undefined ? barData.startTime : bar.startTime,
            content: barData.content !== undefined ? barData.content : bar.content,
            videoId: barData.videoId !== undefined ? barData.videoId : bar.videoId,
            barttelID: barData.barttelID !== undefined ? barData.barttelID : bar.barttelID,
            barType: barData.barType !== undefined ? barData.barType : bar.barType,
        });
        return bar;
    } catch (error) {
        throw new Error(`Lỗi khi cập nhật bar: ${error.message}`);
    }
};

// Xóa bar
const deleteBar = async (id) => {
    try {
        const bar = await Bar.findByPk(id);
        if (!bar) {
            throw new Error("Bar không tồn tại");
        }
        await bar.destroy();
        return { message: "Xóa bar thành công" };
    } catch (error) {
        throw new Error(`Lỗi khi xóa bar: ${error.message}`);
    }
};

// Xoá all bar theo videoId
const deleteBarsByVideoId = async (videoId) => {
    try {
        const bars = await Bar.findAll({
            where: { videoId },
        });
        if (!bars || bars.length === 0) {
            throw new Error("Không tìm thấy bar nào cho video này");
        }
        await Bar.destroy({
            where: { videoId },
        });
        return { message: "Xóa tất cả bar thành công" };
    } catch (error) {
        throw new Error(`Lỗi khi xóa bar: ${error.message}`);
    }
};

module.exports = {
    createBar,
    getBarsByVideoId,
    getBarById,
    updateBar,
    deleteBar, deleteBarsByVideoId,
};
