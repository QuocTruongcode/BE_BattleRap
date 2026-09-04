const { User, AllCode } = require("../../models");

const validateUserType = async (userType) => {
    if (!userType) {
        throw new Error("UserType không được để trống");
    }

    const allCode = await AllCode.findOne({
        where: {
            Type: "User",
            KeyMap: userType,
        },
    });

    if (!allCode) {
        throw new Error("UserType không tồn tại trong AllCode hoặc không thuộc Type User");
    }
};

const createUser = async (userData) => {
    try {
        await validateUserType(userData.UserType);

        return await User.create({
            UserName: userData.UserName,
            Email: userData.Email,
            google_sub: userData.google_sub,
            UserType: userData.UserType,
        });
    } catch (error) {
        throw new Error(`Lỗi khi tạo User: ${error.message}`);
    }
};

const getUsers = async () => {
    try {
        return await User.findAll({
            include: [{
                model: AllCode,
                as: "Type",
                attributes: ["KeyMap", "Type", "ValueVi", "ValueEn"]
            }],
            order: [["id", "ASC"]]
        });
    } catch (error) {
        throw new Error(`Lỗi khi lấy danh sách User: ${error.message}`);
    }
};

const getUserById = async (id) => {
    try {
        const user = await User.findByPk(id, {
            include: [{
                model: AllCode,
                as: "Type",
                attributes: ["KeyMap", "Type", "ValueVi", "ValueEn"]
            }]
        });

        if (!user) {
            throw new Error("User không tồn tại");
        }

        return user;
    } catch (error) {
        throw new Error(`Lỗi khi lấy User: ${error.message}`);
    }
};

const updateUser = async (id, userData) => {
    try {
        const user = await User.findByPk(id);
        if (!user) {
            throw new Error("User không tồn tại");
        }

        await validateUserType(userData.UserType);

        await user.update({
            UserName: userData.UserName,
            Email: userData.Email,
            google_sub: userData.google_sub,
            UserType: userData.UserType,
        });

        return user;
    } catch (error) {
        throw new Error(`Lỗi khi cập nhật User: ${error.message}`);
    }
};

const deleteUser = async (id) => {
    try {
        const user = await User.findByPk(id);
        if (!user) {
            throw new Error("User không tồn tại");
        }

        await user.destroy();
        return { message: "Xóa User thành công" };
    } catch (error) {
        throw new Error(`Lỗi khi xóa User: ${error.message}`);
    }
};

module.exports = {
    createUser,
    getUsers,
    getUserById,
    updateUser,
    deleteUser,
};
