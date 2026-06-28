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
                if (!bar.startTime && bar.startTime !== 0) {
                    throw new Error("startTime là bắt buộc");
                }
                // if (!bar.endTime && bar.endTime !== 0) {
                //     throw new Error("endTime là bắt buộc");
                // }
                if (!bar.videoId) {
                    throw new Error("videoId là bắt buộc");
                }

                // Kiểm tra video tồn tại
                await checkVideoExists(bar.videoId);

                const newBar = await Bar.create({
                    startTime: bar.startTime,
                    endTime: bar.endTime,
                    content: bar.content || null,
                    videoId: bar.videoId,
                });
                bars.push(newBar);
            }
            return bars;
        } else {
            // Một bar
            if (!barData.startTime && barData.startTime !== 0) {
                throw new Error("startTime là bắt buộc");
            }
            if (!barData.endTime && barData.endTime !== 0) {
                throw new Error("endTime là bắt buộc");
            }
            if (!barData.videoId) {
                throw new Error("videoId là bắt buộc");
            }

            // Kiểm tra video tồn tại
            await checkVideoExists(barData.videoId);

            const bar = await Bar.create({
                startTime: barData.startTime,
                endTime: barData.endTime,
                content: barData.content || null,
                videoId: barData.videoId,
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

        // Validation startTime và endTime nếu có cập nhật
        if (barData.startTime !== undefined && !barData.startTime && barData.startTime !== 0) {
            throw new Error("startTime không được để trống");
        }
        if (barData.endTime !== undefined && !barData.endTime && barData.endTime !== 0) {
            throw new Error("endTime không được để trống");
        }

        await bar.update({
            startTime: barData.startTime !== undefined ? barData.startTime : bar.startTime,
            endTime: barData.endTime !== undefined ? barData.endTime : bar.endTime,
            content: barData.content !== undefined ? barData.content : bar.content,
            videoId: barData.videoId !== undefined ? barData.videoId : bar.videoId,
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

module.exports = {
    createBar,
    getBarsByVideoId,
    getBarById,
    updateBar,
    deleteBar,
};
