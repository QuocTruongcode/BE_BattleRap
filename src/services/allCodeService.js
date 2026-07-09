const { AllCode } = require("../../models");

const createAllCode = async (allCodeData) => {
    try {
        return await AllCode.create({
            KeyMap: allCodeData.KeyMap,
            Type: allCodeData.Type,
            ValueVi: allCodeData.ValueVi,
            ValueEn: allCodeData.ValueEn,
        });
    } catch (error) {
        throw new Error(`Lỗi khi tạo AllCode: ${error.message}`);
    }
};

const getAllCodes = async () => {
    try {
        return await AllCode.findAll({ order: [["id", "ASC"]] });
    } catch (error) {
        throw new Error(`Lỗi khi lấy danh sách AllCode: ${error.message}`);
    }
};

const getAllCodeById = async (id) => {
    try {
        const allCode = await AllCode.findByPk(id);
        if (!allCode) {
            throw new Error("AllCode không tồn tại");
        }
        return allCode;
    } catch (error) {
        throw new Error(`Lỗi khi lấy AllCode: ${error.message}`);
    }
};

const updateAllCode = async (id, allCodeData) => {
    try {
        const allCode = await AllCode.findByPk(id);
        if (!allCode) {
            throw new Error("AllCode không tồn tại");
        }

        await allCode.update({
            KeyMap: allCodeData.KeyMap,
            Type: allCodeData.Type,
            ValueVi: allCodeData.ValueVi,
            ValueEn: allCodeData.ValueEn,
        });

        return allCode;
    } catch (error) {
        throw new Error(`Lỗi khi cập nhật AllCode: ${error.message}`);
    }
};

const deleteAllCode = async (id) => {
    try {
        const allCode = await AllCode.findByPk(id);
        if (!allCode) {
            throw new Error("AllCode không tồn tại");
        }
        await allCode.destroy();
        return { message: "Xóa AllCode thành công" };
    } catch (error) {
        throw new Error(`Lỗi khi xóa AllCode: ${error.message}`);
    }
};

module.exports = {
    createAllCode,
    getAllCodes,
    getAllCodeById,
    updateAllCode,
    deleteAllCode,
};
