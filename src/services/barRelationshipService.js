const { BarRelationship, Bar, Entity, AllCode } = require("../../models");

const checkBarExists = async (barId) => {
    const bar = await Bar.findByPk(barId);
    if (!bar) {
        throw new Error(`Bar với ID ${barId} không tồn tại`);
    }
};

const checkEntityExists = async (entityId) => {
    if (!entityId) return;
    const entity = await Entity.findByPk(entityId);
    if (!entity) {
        throw new Error(`Entity với ID ${entityId} không tồn tại`);
    }
};

const checkRelationTypeExists = async (relationType) => {
    if (!relationType) return;
    const relationTypeRecord = await AllCode.findOne({ where: { KeyMap: relationType } });
    if (!relationTypeRecord) {
        throw new Error(`RelationType với KeyMap ${relationType} không tồn tại`);
    }
};

const createBarRelationship = async (barRelationshipData) => {
    try {
        if (!barRelationshipData.SourceBarID) {
            throw new Error("SourceBarID là bắt buộc");
        }

        await checkBarExists(barRelationshipData.SourceBarID);
        // if (barRelationshipData.TargetBarID) {
        //     await checkBarExists(barRelationshipData.TargetBarID);
        // }
        await checkEntityExists(barRelationshipData.EntityID);
        await checkRelationTypeExists(barRelationshipData.RelationType);

        const barRelationship = await BarRelationship.create({
            RelationType: barRelationshipData.RelationType || null,
            SourceBarID: barRelationshipData.SourceBarID,
            EntityID: barRelationshipData.EntityID || null,
        });

        return barRelationship;
    } catch (error) {
        throw new Error(`Lỗi khi tạo BarRelationship: ${error.message}`);
    }
};

const getAllBarRelationships = async () => {
    try {
        return await BarRelationship.findAll({
            include: [
                { model: Bar, as: "SourceBar" },
                { model: Entity, as: "Entity" },
                { model: AllCode, as: "RelationTypeRef" },
            ],
        });
    } catch (error) {
        throw new Error(`Lỗi khi lấy danh sách BarRelationship: ${error.message}`);
    }
};

const getBarRelationshipById = async (id) => {
    try {
        const barRelationship = await BarRelationship.findByPk(id, {
            include: [
                { model: Bar, as: "SourceBar" },
                { model: Entity, as: "Entity" },
                { model: AllCode, as: "RelationTypeRef" },
            ],
        });

        if (!barRelationship) {
            throw new Error("BarRelationship không tồn tại");
        }

        return barRelationship;
    } catch (error) {
        throw new Error(`Lỗi khi lấy BarRelationship: ${error.message}`);
    }
};

const getBarRelationshipsBySourceBarId = async (sourceBarId) => {
    try {
        return await BarRelationship.findAll({
            where: { SourceBarID: sourceBarId },
            include: [
                { model: Bar, as: "SourceBar" },
                { model: Entity, as: "Entity" },
                { model: AllCode, as: "RelationTypeRef" },
            ],
        });
    } catch (error) {
        throw new Error(`Lỗi khi lấy BarRelationship theo SourceBarID: ${error.message}`);
    }
};

const updateBarRelationship = async (id, barRelationshipData) => {
    try {
        const barRelationship = await BarRelationship.findByPk(id);
        if (!barRelationship) {
            throw new Error("BarRelationship không tồn tại");
        }

        if (barRelationshipData.SourceBarID && barRelationshipData.SourceBarID !== barRelationship.SourceBarID) {
            await checkBarExists(barRelationshipData.SourceBarID);
        }

        if (barRelationshipData.EntityID !== undefined && barRelationshipData.EntityID !== barRelationship.EntityID) {
            await checkEntityExists(barRelationshipData.EntityID);
        }

        if (barRelationshipData.RelationType !== undefined && barRelationshipData.RelationType !== barRelationship.RelationType) {
            await checkRelationTypeExists(barRelationshipData.RelationType);
        }

        await barRelationship.update({
            RelationType: barRelationshipData.RelationType !== undefined ? barRelationshipData.RelationType : barRelationship.RelationType,
            SourceBarID: barRelationshipData.SourceBarID !== undefined ? barRelationshipData.SourceBarID : barRelationship.SourceBarID,
            EntityID: barRelationshipData.EntityID !== undefined ? barRelationshipData.EntityID : barRelationship.EntityID,
        });

        return barRelationship;
    } catch (error) {
        throw new Error(`Lỗi khi cập nhật BarRelationship: ${error.message}`);
    }
};

const deleteBarRelationship = async (id) => {
    try {
        const barRelationship = await BarRelationship.findByPk(id);
        if (!barRelationship) {
            throw new Error("BarRelationship không tồn tại");
        }

        await barRelationship.destroy();
        return { message: "Xóa BarRelationship thành công" };
    } catch (error) {
        throw new Error(`Lỗi khi xóa BarRelationship: ${error.message}`);
    }
};

module.exports = {
    createBarRelationship,
    getAllBarRelationships,
    getBarRelationshipById,
    getBarRelationshipsBySourceBarId,
    updateBarRelationship,
    deleteBarRelationship,
};
