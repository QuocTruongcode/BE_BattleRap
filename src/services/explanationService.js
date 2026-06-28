const { Explanation, Bar } = require("../../models");

// Kiểm tra bar có tồn tại không
const checkBarExists = async (barId) => {
    const bar = await Bar.findByPk(barId);
    if (!bar) {
        throw new Error(`Bar với ID ${barId} không tồn tại`);
    }
};

// Tạo 1 explanation hoặc nhiều explanation
const createExplanation = async (explanationData) => {
    try {
        // Kiểm tra xem là array hay object
        if (Array.isArray(explanationData)) {
            // Nhiều explanation
            const explanations = [];
            for (const explanation of explanationData) {
                // Validation
                if (!explanation.barId) {
                    throw new Error("barId là bắt buộc");
                }

                // Kiểm tra bar tồn tại
                await checkBarExists(explanation.barId);

                const newExplanation = await Explanation.create({
                    meaning: explanation.meaning || null,
                    reference: explanation.reference || null,
                    whyGood: explanation.whyGood || null,
                    barId: explanation.barId,
                });
                explanations.push(newExplanation);
            }
            return explanations;
        } else {
            // Một explanation
            if (!explanationData.barId) {
                throw new Error("barId là bắt buộc");
            }

            // Kiểm tra bar tồn tại
            await checkBarExists(explanationData.barId);

            const explanation = await Explanation.create({
                meaning: explanationData.meaning || null,
                reference: explanationData.reference || null,
                whyGood: explanationData.whyGood || null,
                barId: explanationData.barId,
            });
            return explanation;
        }
    } catch (error) {
        throw new Error(`Lỗi khi tạo explanation: ${error.message}`);
    }
};

// Lấy tất cả explanation theo barId
const getExplanationsByBarId = async (barId) => {
    try {
        const explanations = await Explanation.findAll({
            where: { barId },
        });
        return explanations;
    } catch (error) {
        throw new Error(`Lỗi khi lấy danh sách explanation: ${error.message}`);
    }
};

// Lấy explanation theo ID
const getExplanationById = async (id) => {
    try {
        const explanation = await Explanation.findByPk(id);
        if (!explanation) {
            throw new Error("Explanation không tồn tại");
        }
        return explanation;
    } catch (error) {
        throw new Error(`Lỗi khi lấy explanation: ${error.message}`);
    }
};

// Cập nhật explanation
const updateExplanation = async (id, explanationData) => {
    try {
        const explanation = await Explanation.findByPk(id);
        if (!explanation) {
            throw new Error("Explanation không tồn tại");
        }

        // Nếu có cập nhật barId, kiểm tra bar mới có tồn tại không
        if (explanationData.barId && explanationData.barId !== explanation.barId) {
            await checkBarExists(explanationData.barId);
        }

        const updatedExplanation = await explanation.update({
            meaning: explanationData.meaning !== undefined ? explanationData.meaning : explanation.meaning,
            reference: explanationData.reference !== undefined ? explanationData.reference : explanation.reference,
            whyGood: explanationData.whyGood !== undefined ? explanationData.whyGood : explanation.whyGood,
            barId: explanationData.barId !== undefined ? explanationData.barId : explanation.barId,
        });
        return updatedExplanation;
    } catch (error) {
        throw new Error(`Lỗi khi cập nhật explanation: ${error.message}`);
    }
};

// Xóa explanation theo ID
const deleteExplanation = async (id) => {
    try {
        const explanation = await Explanation.findByPk(id);
        if (!explanation) {
            throw new Error("Explanation không tồn tại");
        }

        await explanation.destroy();
        return { message: "Xóa explanation thành công" };
    } catch (error) {
        throw new Error(`Lỗi khi xóa explanation: ${error.message}`);
    }
};

// Lấy tất cả explanation
const getAllExplanations = async () => {
    try {
        const explanations = await Explanation.findAll();
        return explanations;
    } catch (error) {
        throw new Error(`Lỗi khi lấy danh sách explanation: ${error.message}`);
    }
};

module.exports = {
    createExplanation,
    getExplanationsByBarId,
    getExplanationById,
    updateExplanation,
    deleteExplanation,
    getAllExplanations,
};
