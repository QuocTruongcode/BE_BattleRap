const barService = require("./barService");
const { Bar, Explanation, Video, Battler } = require("../../models");

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

const createAllVideoChunks = async () => {
    const videos = await Video.findAll({
        attributes: ["id", "title", "review"],
        raw: true,
    });

    return videos.map((video) => {
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

            },
        };
    });
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

module.exports = {
    createBarChunk,
    createAllBarChunks,
    createAllVideoChunks,
    createAllBattlerChunks,
};