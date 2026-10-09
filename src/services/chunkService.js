const barService = require("./barService");
const dramaEventService = require("./dramaEventService");
const { Bar, Explanation, Video, Battler, Drama } = require("../../models");

const createBarChunk = async (barId) => {
    const [barDetails, explanations] = await Promise.all([
        barService.getBarExplanation(barId),
        Explanation.findAll({
            attributes: ["meaning"],
            where: { barId },
            raw: true,
        }),
    ]);
    const meanings = explanations
        .map(({ meaning }) => meaning)
        .filter((meaning) => typeof meaning === "string" && meaning.trim() !== "")
        .join("; ");

    const text = [
        ["Bar content", barDetails.content],
        ["Rap name", barDetails.RapName],
        ["Full name", barDetails.FullName],
        ["Description", barDetails.Describe],
        ["Video title", barDetails.title],
        ["Meanings", meanings],
    ]
        .filter(([, value]) => value !== null && value !== undefined && String(value).trim() !== "")
        .map(([label, value]) => `${label}: ${String(value).trim()}`)
        .join(". ");

    return {
        chunkID: `chunk_bar_${barId}`,
        text,
        metadata: {
            type: "bar",
            match_id: barDetails.videoID,
            battler_id: barDetails.battlerId,
        },
    };
};

const createAllBarChunks = async () => {
    const bars = await Bar.findAll({
        attributes: ["id"],
        raw: true,
    });

    return Promise.all(bars.map(({ id }) => createBarChunk(id)));
};

const createVideoChunk = async (video) => {
    const dramaEvents = await dramaEventService.getAllDramaEventByVideoID(video.id);
    const text = [
        ["Title", video.title],
        ["Review", video.review],
    ]
        .filter(([, value]) => value !== null && value !== undefined && String(value).trim() !== "")
        .map(([label, value]) => `${label}: ${String(value).trim()}`)
        .join(". ");

    return {
        chunkID: `chunk_match_${video.id}`,
        text,
        metadata: {
            type: "match",
            dramaEvent_id: dramaEvents.map(({ id }) => id),
        },
    };
};

const createChunksByVideoId = async (videoId) => {
    const [video, bars] = await Promise.all([
        Video.findByPk(videoId, {
            attributes: ["id", "title", "review"],
            raw: true,
        }),
        Bar.findAll({
            attributes: ["id"],
            where: { videoId },
            raw: true,
        }),
    ]);

    if (!video) {
        return null;
    }

    const barChunks = await Promise.all(bars.map(({ id }) => createBarChunk(id)));
    return [await createVideoChunk(video), ...barChunks];
};

const createAllVideoChunks = async () => {
    const videos = await Video.findAll({
        attributes: ["id", "title", "review"],
        raw: true,
    });

    return Promise.all(videos.map(createVideoChunk));
};

const createAllBattlerChunks = async () => {
    const battlers = await Battler.findAll({
        attributes: ["id", "RapName", "FullName", "Describe"],
        raw: true,
    });

    return battlers.map((battler) => {
        const text = [
            ["Rap name", battler.RapName],
            ["Full name", battler.FullName],
            ["Description", battler.Describe],
        ]
            .filter(([, value]) => value !== null && value !== undefined && String(value).trim() !== "")
            .map(([label, value]) => `${label}: ${String(value).trim()}`)
            .join(". ");

        return {
            chunkID: `chunk_battler_${battler.id}`,
            text,
            metadata: {
                type: "battler",

            },
        };
    });
};

const createDramaChunk = async (dramaId) => {
    const [drama, dramaEvents] = await Promise.all([
        Drama.findByPk(dramaId, {
            attributes: ["id", "title", "summary"],
            raw: true,
        }),
        dramaEventService.getAllDramaEventByDramaID(dramaId),
    ]);

    if (!drama) {
        return null;
    }

    const dramaChunk = {
        chunkID: `chunk_drama_${drama.id}`,
        text: `Drama có tên là ${drama.title ?? ""}\nDiễn biến chính: ${drama.summary ?? ""}`,
        metadata: {
            type: "drama",
            drama_id: drama.id,
        },
    };

    const dramaEventChunks = dramaEvents.map((dramaEvent) => {
        const review = typeof dramaEvent.review === "string"
            ? dramaEvent.review
            : JSON.stringify(dramaEvent.review ?? "");
        return {
            chunkID: `dramaEvent_${dramaEvent.id}`,
            text: `Sự kiện: ${dramaEvent.title ?? ""} Các phản ứng của cộng đồng được ghi lại như sau như sau: ${review}`,
            metadata: {
                type: "drama_event",
                drama_id: drama.id,
                dramaEvent_id: dramaEvent.id,
            },
        };
    });

    return [dramaChunk, ...dramaEventChunks];
};

module.exports = {
    createBarChunk,
    createAllBarChunks,
    createChunksByVideoId,
    createAllVideoChunks,
    createAllBattlerChunks,
    createDramaChunk,
};