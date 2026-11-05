'use strict';

const folderVideoService = require("../services/folderVideoService");
const workerFileService = require("../services/workerFileService");
const getFolderVideoNamesController = async (req, res) => {
    try {
        // const fileNames = await folderVideoService.getFolderVideoNames();
        const fileNames = await workerFileService.getFiles();

        return res.status(200).json({
            success: true,
            data: fileNames,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = {
    getFolderVideoNamesController,
};
