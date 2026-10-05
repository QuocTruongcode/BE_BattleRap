const { Drama, DramaEvent } = require("../../models");
const { Op } = require("sequelize");

const POST_ID_UNIQUE_INDEX = "drama_events_drama_post_unique";

const createDuplicatePostError = (event) => {
    const error = new Error(
        `post có link ${event.link ?? event.facebookUrl ?? "(không có link)"} đã có trong event của drama rồi`
    );
    error.statusCode = 409;
    return error;
};

const isPostIdUniqueConstraintError = (error) => {
    const message = [error.message, error.original?.message, error.parent?.message]
        .filter(Boolean)
        .join(" ");
    return message.includes(POST_ID_UNIQUE_INDEX);
};

const createDramaEventWithDuplicateHandling = async (eventData) => {
    try {
        return await DramaEvent.create(eventData);
    } catch (error) {
        if (isPostIdUniqueConstraintError(error)) {
            throw createDuplicatePostError(eventData);
        }
        throw error;
    }
};

const bulkCreateDramaEventsWithDuplicateHandling = async (events) => {
    try {
        return await DramaEvent.bulkCreate(events, { validate: true });
    } catch (error) {
        if (isPostIdUniqueConstraintError(error)) {
            const duplicateEvent = events.find((event) => event.postId !== undefined && event.postId !== null);
            if (duplicateEvent) {
                throw createDuplicatePostError(duplicateEvent);
            }
        }
        throw error;
    }
};

const ensurePostIdsUnique = async (events) => {
    const postsByDrama = new Map();

    for (const event of events) {
        if (event.postId === undefined || event.postId === null) {
            continue;
        }

        let postsById = postsByDrama.get(event.dramaID);
        if (!postsById) {
            postsById = new Map();
            postsByDrama.set(event.dramaID, postsById);
        }

        if (postsById.has(event.postId)) {
            throw createDuplicatePostError(event);
        }
        postsById.set(event.postId, event);
    }

    for (const [dramaID, postsById] of postsByDrama) {
        const postIds = [...postsById.keys()];
        const chunkSize = 1000;

        for (let offset = 0; offset < postIds.length; offset += chunkSize) {
            const existingEvents = await DramaEvent.findAll({
                where: {
                    dramaID,
                    postId: { [Op.in]: postIds.slice(offset, offset + chunkSize) },
                },
                attributes: ["postId"],
            });
            const existingPostIds = new Set(existingEvents.map((event) => event.postId));

            for (const [postId, event] of postsById) {
                if (existingPostIds.has(postId)) {
                    throw createDuplicatePostError(event);
                }
            }
        }
    }
};

const getDramaOrThrow = async (dramaID) => {
    const drama = await Drama.findByPk(dramaID);
    if (!drama) {
        const error = new Error(`Drama với ID ${dramaID} không tồn tại`);
        error.statusCode = 400;
        throw error;
    }
    return drama;
};

const createDramaEvent = async (eventData) => {
    await getDramaOrThrow(eventData.dramaID);
    const post = {
        ...eventData,
        link: eventData.link ?? null,
        title: eventData.title ?? null,
        review: eventData.review ?? null,
        dramaID: eventData.dramaID,
        facebookUrl: eventData.facebookUrl ?? null,
        pageName: eventData.pageName ?? null,
        postId: eventData.postId ?? null,
        time: eventData.time ?? null,
    };
    await ensurePostIdsUnique([post]);
    return createDramaEventWithDuplicateHandling(post);
};

const bulkCreateDramaEvents = async (events) => {
    if (!Array.isArray(events) || events.length === 0) {
        const error = new Error("Danh sách dramaEvent không được để trống");
        error.statusCode = 400;
        throw error;
    }

    const dramaIDs = [...new Set(events.map((event) => event.dramaID))];
    const dramas = await Drama.findAll({
        where: { id: dramaIDs },
        attributes: ["id"],
    });
    const existingDramaIDs = new Set(dramas.map((drama) => Number(drama.id)));
    for (const [index, event] of events.entries()) {
        if (!existingDramaIDs.has(event.dramaID)) {
            const error = new Error(
                `Drama với ID ${event.dramaID} không tồn tại ở vị trí ${index}`
            );
            error.statusCode = 400;
            throw error;
        }
    }

    await ensurePostIdsUnique(events);
    return bulkCreateDramaEventsWithDuplicateHandling(events.map((event) => ({
        link: event.link ?? null,
        title: event.title ?? null,
        review: event.review ?? null,
        dramaID: event.dramaID,
        facebookUrl: event.facebookUrl ?? null,
        pageName: event.pageName ?? null,
        postId: event.postId ?? null,
        time: event.time ?? null,
    })));
};

const getAllDramaEvents = async (dramaID) => {
    const where = dramaID === undefined ? undefined : { dramaID };
    return DramaEvent.findAll({
        where,
        include: [{
            model: Drama,
            as: "Drama",
        }],
        order: [["createdAt", "DESC"]],
    });
};

const getDramaEventById = async (id) => {
    const dramaEvent = await DramaEvent.findByPk(id, {
        include: [{
            model: Drama,
            as: "Drama",
        }],
    });
    if (!dramaEvent) {
        const error = new Error("DramaEvent không tồn tại");
        error.statusCode = 404;
        throw error;
    }
    return dramaEvent;
};

const updateDramaEvent = async (id, eventData) => {
    const dramaEvent = await DramaEvent.findByPk(id);
    if (!dramaEvent) {
        const error = new Error("DramaEvent không tồn tại");
        error.statusCode = 404;
        throw error;
    }
    if (eventData.dramaID !== undefined && eventData.dramaID !== null) {
        await getDramaOrThrow(eventData.dramaID);
    }

    await dramaEvent.update({
        link: eventData.link !== undefined ? eventData.link : dramaEvent.link,
        title: eventData.title !== undefined ? eventData.title : dramaEvent.title,
        review: eventData.review !== undefined ? eventData.review : dramaEvent.review,
        dramaID: eventData.dramaID !== undefined ? eventData.dramaID : dramaEvent.dramaID,
        facebookUrl: eventData.facebookUrl !== undefined ? eventData.facebookUrl : dramaEvent.facebookUrl,
        pageName: eventData.pageName !== undefined ? eventData.pageName : dramaEvent.pageName,
        postId: eventData.postId !== undefined ? eventData.postId : dramaEvent.postId,
        time: eventData.time !== undefined ? eventData.time : dramaEvent.time,
    });
    return dramaEvent;
};

const deleteDramaEvent = async (id) => {
    const dramaEvent = await DramaEvent.findByPk(id);
    if (!dramaEvent) {
        const error = new Error("DramaEvent không tồn tại");
        error.statusCode = 404;
        throw error;
    }
    await dramaEvent.destroy();
};

module.exports = {
    createDramaEvent,
    bulkCreateDramaEvents,
    getAllDramaEvents,
    getDramaEventById,
    updateDramaEvent,
    deleteDramaEvent,
};
