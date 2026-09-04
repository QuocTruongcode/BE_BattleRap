const userService = require("../services/userService");

const validateUserPayload = (data) => {
    if (!data) {
        return "Vui lòng cung cấp dữ liệu User";
    }

    const requiredFields = ["UserName", "Email", "google_sub"];
    const missingFields = requiredFields.filter((field) => !data[field]);

    if (missingFields.length > 0) {
        return `Thiếu trường bắt buộc: ${missingFields.join(", ")}`;
    }

    return null;
};

const validateId = (id) => id && Number.isInteger(Number(id)) && Number(id) > 0;

const createUserController = async (req, res) => {
    try {
        const errorMessage = validateUserPayload(req.body);
        if (errorMessage) {
            return res.status(400).json({ success: false, message: errorMessage });
        }

        const user = await userService.createUser(req.body);
        res.status(201).json({
            success: true,
            message: "Tạo User thành công",
            data: user,
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const getUsersController = async (req, res) => {
    try {
        const users = await userService.getUsers();
        res.status(200).json({ success: true, data: users });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getUserByIdController = async (req, res) => {
    if (!validateId(req.params.id)) {
        return res.status(400).json({
            success: false,
            message: "ID phải là một số nguyên dương hợp lệ",
        });
    }

    try {
        const user = await userService.getUserById(req.params.id);
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        res.status(404).json({ success: false, message: error.message });
    }
};

const updateUserController = async (req, res) => {
    if (!validateId(req.params.id)) {
        return res.status(400).json({
            success: false,
            message: "ID phải là một số nguyên dương hợp lệ",
        });
    }

    try {
        const errorMessage = validateUserPayload(req.body);
        if (errorMessage) {
            return res.status(400).json({ success: false, message: errorMessage });
        }

        const user = await userService.updateUser(req.params.id, req.body);
        res.status(200).json({
            success: true,
            message: "Cập nhật User thành công",
            data: user,
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const deleteUserController = async (req, res) => {
    if (!validateId(req.params.id)) {
        console.log("Check id: ", req.params.id)
        return res.status(400).json({
            success: false,
            message: "ID phải là một số nguyên dương hợp lệ",
        });
    }

    try {
        const result = await userService.deleteUser(req.params.id);
        res.status(200).json({ success: true, message: result.message });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

module.exports = {
    createUserController,
    getUsersController,
    getUserByIdController,
    updateUserController,
    deleteUserController,
};
