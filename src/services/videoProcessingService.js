'use strict';

const fs = require('fs').promises;
const path = require('path');
const videoService = require("./videoService");
const { runPipeline } = require("./hls-pipeline");
const { KeyR2 } = require("../../models");

const processVideoFile = async ({ videoId, fullPath, endPath, bucket }) => {
    const id = String(videoId);

    let meta;
    try {
        meta = await runPipeline({
            id,
            input: fullPath,
            bucket,
            force: false,
        });

        await KeyR2.create({
            VideoID: videoId,
            key: meta.key_hex,
        });

        await videoService.updateVideo(videoId, {
            storageId: meta.storage_id,
        });
    } catch (error) {
        console.error(`Pipeline lỗi cho video ${id}:`, error);
        await videoService
            .updateVideo(videoId, { status: "failed" })
            .catch(() => { });
        return;
    }

    // Pipeline đã thành công, move file lỗi cũng không làm video thất bại
    try {
        await fs.mkdir(path.dirname(endPath), { recursive: true });
        await fs.rename(fullPath, endPath);
    } catch (error) {
        console.error(`Không move được file của video ${id}:`, error);
    }
};

module.exports = {
    processVideoFile,
};