const { Drama, DramaEvent, Video, sequelize } = require("../../models");
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

const bulkCreateDramaEventsWithDuplicateHandling = async (events, transaction) => {
    try {
        return await DramaEvent.bulkCreate(events, { validate: true, transaction });
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

const ensurePostIdsUnique = async (events, excludedIDs = [], transaction) => {
    const postsByDrama = new Map();
    const excludedIDSet = new Set(excludedIDs);

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
                attributes: ["id", "postId"],
                transaction,
            });
            const existingPostIds = new Set(existingEvents
                .filter((event) => !excludedIDSet.has(Number(event.id)))
                .map((event) => event.postId));

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

const getVideoOrThrow = async (videoID) => {
    const video = await Video.findByPk(videoID);
    if (!video) {
        const error = new Error(`Video với ID ${videoID} không tồn tại`);
        error.statusCode = 400;
        throw error;
    }
    return video;
};

const createDramaEvent = async (eventData) => {
    await getDramaOrThrow(eventData.dramaID);
    if (eventData.videoID !== undefined && eventData.videoID !== null) {
        await getVideoOrThrow(eventData.videoID);
    }
    const post = {
        ...eventData,
        link: eventData.link ?? null,
        title: eventData.title ?? null,
        review: eventData.review ?? null,
        dramaID: eventData.dramaID,
        videoID: eventData.videoID ?? null,
        facebookUrl: eventData.facebookUrl ?? null,
        pageName: eventData.pageName ?? null,
        postId: eventData.postId ?? null,
        time: eventData.time ?? null,
    };
    await ensurePostIdsUnique([post]);
    return createDramaEventWithDuplicateHandling(post);
};

const bulkUpsertDramaEventsInTransaction = async (events, transaction) => {
    if (!Array.isArray(events) || events.length === 0) {
        const error = new Error("Danh sách dramaEvent không được để trống");
        error.statusCode = 400;
        throw error;
    }

    const suppliedIDs = events
        .map((event) => event.id)
        .filter((id) => id !== undefined && id !== null);
    const normalizedIDs = suppliedIDs.map(Number);
    if (new Set(normalizedIDs).size !== normalizedIDs.length) {
        const error = new Error("Danh sách không được chứa id DramaEvent trùng nhau");
        error.statusCode = 400;
        throw error;
    }

    const dramaIDs = [...new Set(events.map((event) => event.dramaID))];
    const dramas = await Drama.findAll({
        where: { id: dramaIDs },
        attributes: ["id"],
        transaction,
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

    const videoIDs = [...new Set(events
        .map((event) => event.videoID)
        .filter((videoID) => videoID !== undefined && videoID !== null))];
    if (videoIDs.length > 0) {
        const videos = await Video.findAll({
            where: { id: videoIDs },
            attributes: ["id"],
            transaction,
        });
        const existingVideoIDs = new Set(videos.map((video) => Number(video.id)));
        for (const [index, event] of events.entries()) {
            if (event.videoID !== undefined && event.videoID !== null
                && !existingVideoIDs.has(event.videoID)) {
                const error = new Error(
                    `Video với ID ${event.videoID} không tồn tại ở vị trí ${index}`
                );
                error.statusCode = 400;
                throw error;
            }
        }
    }

    const eventIDs = [...new Set(normalizedIDs)];
    const existingEvents = eventIDs.length > 0
        ? await DramaEvent.findAll({
            where: { id: eventIDs },
            transaction,
        })
        : [];
    const existingEventsByID = new Map(
        existingEvents.map((event) => [Number(event.id), event])
    );
    const updateIDs = [];
    const createEvents = [];
    const resultByIndex = new Array(events.length);
    const finalEvents = events.map((event, index) => {
        const existingEvent = event.id === undefined || event.id === null
            ? undefined
            : existingEventsByID.get(Number(event.id));

        if (existingEvent) {
            updateIDs.push(Number(existingEvent.id));
            return {
                id: Number(existingEvent.id),
                dramaID: event.dramaID === undefined ? existingEvent.dramaID : event.dramaID,
                postId: event.postId === undefined ? existingEvent.postId : event.postId,
            };
        }

        const newEvent = {
            link: event.link ?? null,
            title: event.title ?? null,
            review: event.review ?? null,
            dramaID: event.dramaID,
            videoID: event.videoID ?? null,
            facebookUrl: event.facebookUrl ?? null,
            pageName: event.pageName ?? null,
            postId: event.postId ?? null,
            time: event.time ?? null,
        };
        createEvents.push({ index, event: newEvent });
        return { dramaID: newEvent.dramaID, postId: newEvent.postId };
    });

    await ensurePostIdsUnique(finalEvents, updateIDs, transaction);

    for (const [index, event] of events.entries()) {
        const existingEvent = event.id === undefined || event.id === null
            ? undefined
            : existingEventsByID.get(Number(event.id));
        if (!existingEvent) {
            continue;
        }

        const changes = Object.fromEntries(
            Object.entries({
                link: event.link,
                title: event.title,
                review: event.review,
                dramaID: event.dramaID,
                videoID: event.videoID,
                facebookUrl: event.facebookUrl,
                pageName: event.pageName,
                postId: event.postId,
                time: event.time,
            }).filter(([, value]) => value !== undefined)
        );
        await existingEvent.update(changes, { transaction });
        resultByIndex[index] = existingEvent;
    }

    if (createEvents.length > 0) {
        const createdEvents = await bulkCreateDramaEventsWithDuplicateHandling(
            createEvents.map(({ event }) => event),
            transaction
        );
        createEvents.forEach(({ index }, createdIndex) => {
            resultByIndex[index] = createdEvents[createdIndex];
        });
    }
    return resultByIndex;
};

const bulkUpsertDramaEvents = async (events) => {
    return sequelize.transaction((transaction) => (
        bulkUpsertDramaEventsInTransaction(events, transaction)
    )).catch((error) => {
        if (isPostIdUniqueConstraintError(error)) {
            const duplicateEvent = events.find((event) => event.postId !== undefined && event.postId !== null);
            if (duplicateEvent) {
                throw createDuplicatePostError(duplicateEvent);
            }
        }
        throw error;
    });
};

const getAllDramaEvents = async (dramaID, videoID) => {
    const where = {};
    if (dramaID !== undefined) {
        where.dramaID = dramaID;
    }
    if (videoID !== undefined) {
        where.videoID = videoID;
    }
    return DramaEvent.findAll({
        where: Object.keys(where).length === 0 ? undefined : where,
        // include: [{
        //     model: Drama,
        //     as: "Drama",
        // }],
        order: [
            // ["createdAt", "DESC"],
            ["id", "ASC"], // đổi thành tên khóa chính thực tế của model

        ],
    });
};

const getAllDramaEventByDramaID = async (dramaID) => {
    return getAllDramaEvents(dramaID);
};

const getAllDramaEventByVideoID = async (videoID) => {
    return getAllDramaEvents(undefined, videoID);
};

const getDramaEventById = async (id) => {
    const dramaEvent = await DramaEvent.findByPk(id, {
        include: [{
            model: Drama,
            as: "Drama",
        }, {
            model: Video,
            as: "Video",
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
    if (eventData.videoID !== undefined && eventData.videoID !== null) {
        await getVideoOrThrow(eventData.videoID);
    }

    await dramaEvent.update({
        link: eventData.link !== undefined ? eventData.link : dramaEvent.link,
        title: eventData.title !== undefined ? eventData.title : dramaEvent.title,
        review: eventData.review !== undefined ? eventData.review : dramaEvent.review,
        dramaID: eventData.dramaID !== undefined ? eventData.dramaID : dramaEvent.dramaID,
        videoID: eventData.videoID !== undefined ? eventData.videoID : dramaEvent.videoID,
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
    bulkUpsertDramaEvents,
    getAllDramaEvents,
    getAllDramaEventByDramaID,
    getAllDramaEventByVideoID,
    getDramaEventById,
    updateDramaEvent,
    deleteDramaEvent,
};
