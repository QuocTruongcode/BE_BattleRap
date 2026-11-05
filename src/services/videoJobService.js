const { VideoJob, KeyR2, sequelize } = require("../../models");
const { QueryTypes } = require("sequelize");   // thêm dòng này ở đầu file
const videoService = require("./videoService");

const createJob = async ({ videoID, fileName }, options = {}) => {
    return VideoJob.create(
        { videoID, fileName, status: "PENDING" },
        { transaction: options.transaction }
    );
};


const getPendingVideoJob = async (workerId) => {
    console.log("Worker ID requesting job:", workerId); // log workerId
    const table = VideoJob.getTableName();
    console.log("VideoJob table name:", table); // log tên bảng
    const rows = await sequelize.query(
        `WITH next_job AS (
             SELECT TOP (1) *
             FROM ${table} WITH (ROWLOCK, UPDLOCK, READPAST)
             WHERE status = 'PENDING'
             ORDER BY createdAt, id
         )
         UPDATE next_job
         SET status = 'PROCESSING',
             workerID = :workerId,
             updatedAt = GETDATE()
         OUTPUT inserted.*;`,
        {
            replacements: { workerId: workerId || null },
            type: QueryTypes.SELECT,
        }
    );

    console.log("Claimed job rows:", rows); // log kết quả trả về từ query

    return rows[0] || null; // null nếu không còn job PENDING
};

const completeVideoJob = async (jobId, { storageId, key }) => {
    return sequelize.transaction(async (transaction) => {
        const job = await VideoJob.findByPk(jobId, { transaction });
        if (!job) {
            const error = new Error("Không tìm thấy job");
            error.statusCode = 404;
            throw error;
        }

        await KeyR2.create({
            VideoID: job.videoID,
            key
        }, { transaction });

        await videoService.updateVideo(job.videoID, { storageId }, { transaction });
        await job.update({ status: "DONE" }, { transaction });

        return job;
    });
};

module.exports = { createJob, getPendingVideoJob, completeVideoJob };
