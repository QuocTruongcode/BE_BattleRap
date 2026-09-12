const { Battler } = require("../../models");

// Tạo battler mới
const createBattler = async (battlerData) => {
    try {
        const battler = await Battler.create({
            RapName: battlerData.RapName,
            FullName: battlerData.FullName,
            Describe: battlerData.Describe,
            image: battlerData.image,
        });

        return battler;
    } catch (error) {
        throw new Error(`Lỗi khi tạo battler: ${error.message}`);
    }
};

// Lấy tất cả battler
const getAllBattlers = async () => {
    try {
        const battlers = await Battler.findAll({
            order: [["createdAt", "DESC"]],
        });

        return battlers;
    } catch (error) {
        throw new Error(`Lỗi khi lấy danh sách battler: ${error.message}`);
    }
};

// Lấy battler theo ID
const getBattlerById = async (id) => {
    try {
        const battler = await Battler.findByPk(id);

        if (!battler) {
            throw new Error("Battler không tồn tại");
        }

        return battler;
    } catch (error) {
        throw new Error(`Lỗi khi lấy battler: ${error.message}`);
    }
};

// Cập nhật battler
const updateBattler = async (id, battlerData) => {
    try {
        const battler = await Battler.findByPk(id);

        if (!battler) {
            throw new Error("Battler không tồn tại");
        }

        await battler.update({
            RapName: battlerData.RapName ?? battler.RapName,
            FullName: battlerData.FullName ?? battler.FullName,
            Describe: battlerData.Describe ?? battler.Describe,
            image: battlerData.image ?? battler.image,
        });

        return battler;
    } catch (error) {
        throw new Error(`Lỗi khi cập nhật battler: ${error.message}`);
    }
};

// Xóa battler
const deleteBattler = async (id) => {
    try {
        const battler = await Battler.findByPk(id);

        if (!battler) {
            throw new Error("Battler không tồn tại");
        }

        await battler.destroy();
        return { message: "Xóa battler thành công" };
    } catch (error) {
        throw new Error(`Lỗi khi xóa battler: ${error.message}`);
    }
};

module.exports = {
    createBattler,
    getAllBattlers,
    getBattlerById,
    updateBattler,
    deleteBattler,
};
