const allCodeService = require("../services/allCodeService");

const validateAllCodePayload = (data) => {
    if (!data) {
        return "Vui lòng cung cấp dữ liệu AllCode";
    }

    const requiredFields = ["KeyMap", "Type", "ValueVi", "ValueEn"];
    const missingFields = requiredFields.filter((field) => !data[field]);

    if (missingFields.length > 0) {
        return `Thiếu trường bắt buộc: ${missingFields.join(", ")}`;
    }

    return null;
};

const createAllCodeController = async (req, res) => {
    try {
        const allCodeData = req.body;
        const errorMessage = validateAllCodePayload(allCodeData);

        if (errorMessage) {
            return res.status(400).json({
                success: false,
                message: errorMessage,
            });
        }

        const allCode = await allCodeService.createAllCode(allCodeData);
        res.status(201).json({
            success: true,
            message: "Tạo AllCode thành công",
            data: allCode,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

const getAllCodesController = async (req, res) => {
    try {
        const allCodes = await allCodeService.getAllCodes();
        res.status(200).json({
            success: true,
            data: allCodes,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const getAllCodeByIdController = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id || isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: "ID phải là một số nguyên hợp lệ",
            });
        }

        const allCode = await allCodeService.getAllCodeById(id);
        res.status(200).json({
            success: true,
            data: allCode,
        });
    } catch (error) {
        res.status(404).json({
            success: false,
            message: error.message,
        });
    }
};

const updateAllCodeController = async (req, res) => {
    try {
        const { id } = req.params;
        const allCodeData = req.body;

        if (!id || isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: "ID phải là một số nguyên hợp lệ",
            });
        }

        const errorMessage = validateAllCodePayload(allCodeData);
        if (errorMessage) {
            return res.status(400).json({
                success: false,
                message: errorMessage,
            });
        }

        const updatedAllCode = await allCodeService.updateAllCode(id, allCodeData);
        res.status(200).json({
            success: true,
            message: "Cập nhật AllCode thành công",
            data: updatedAllCode,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

const deleteAllCodeController = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id || isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: "ID phải là một số nguyên hợp lệ",
            });
        }

        const result = await allCodeService.deleteAllCode(id);
        res.status(200).json({
            success: true,
            message: result.message,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = {
    createAllCodeController,
    getAllCodesController,
    getAllCodeByIdController,
    updateAllCodeController,
    deleteAllCodeController,
};
