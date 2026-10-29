'use strict';

const { KeyR2 } = require("../../models");

const getKeyByVideoId = async (videoId) => {
    const keyRecord = await KeyR2.findOne({
        attributes: ["key"],
        where: { VideoID: videoId },
    });

    return keyRecord?.key ?? null;
};

module.exports = {
    getKeyByVideoId,
};
