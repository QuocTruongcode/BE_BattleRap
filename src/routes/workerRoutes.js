'use strict';

const express = require("express");
const workerController = require("../controllers/workerController");

const router = express.Router();

function workerAuth(req, res, next) {
    if (!process.env.WORKER_API_KEY || req.header('x-worker-key') !== process.env.WORKER_API_KEY) {
        return res.status(401).json({ message: 'Unauthorized worker' });
    }
    next();
}

router.use(workerAuth);   // mọi route bên dưới đều phải qua bước kiểm tra này
router.post("/jobs/claim", workerController.getPendingVideoJobController);
router.post("/jobs/:jobId/result", workerController.completeVideoJobController);
router.post("/files/sync", workerController.syncFilesController);
module.exports = router;