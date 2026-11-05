'use strict';
const videoJobService = require("../services/videoJobService");

const getPendingVideoJobController = async (req, res) => {
    try {
        const job = await videoJobService.getPendingVideoJob(req.body.workerId);
        console.log("Worker claimed job:", job); // log thông tin job được claim
        if (!job) return res.sendStatus(204); // không có job, Worker chờ rồi hỏi lại

        return res.status(200).json({
            success: true,
            data: { jobId: job.id, videoId: job.videoID, fileName: job.fileName }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const syncFilesController = async (req, res) => {
    const files = req.body;

    if (!Array.isArray(files) || !files.every(file => typeof file === "string")) {
        return res.status(400).json({
            success: false,
            message: "Request body must contain a files array of file names"
        });
    }

    try {
        await require("../services/workerFileService").syncFiles(files);
        return res.status(200).json({ success: true, data: { count: files.length } });
    } catch (error) {
        console.error("Failed to sync worker files:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

const completeVideoJobController = async (req, res) => {
    const jobId = Number(req.params.jobId);
    const { storageId, key } = req.body || {};

    if (!Number.isInteger(jobId) || jobId <= 0) {
        return res.status(400).json({
            success: false,
            message: "jobId phải là số nguyên dương"
        });
    }

    if (typeof storageId !== "string" || !storageId.trim() ||
        typeof key !== "string" || !key.trim()) {
        return res.status(400).json({
            success: false,
            message: "storageId và key là bắt buộc"
        });
    }

    try {
        const job = await videoJobService.completeVideoJob(jobId, { storageId, key });
        return res.status(200).json({ success: true, data: job });
    } catch (error) {
        console.error("Failed to complete worker video job:", error);
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    getPendingVideoJobController,
    syncFilesController,
    completeVideoJobController
};