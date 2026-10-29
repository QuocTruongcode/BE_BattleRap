'use strict';

const fs = require("fs/promises");
const path = require("path");

const VIDEO_EXTENSIONS = new Set([
    ".3gp",
    ".avi",
    ".flv",
    ".m2ts",
    ".m4v",
    ".mkv",
    ".mov",
    ".mp4",
    ".mpeg",
    ".mpg",
    ".mts",
    ".ogv",
    ".ts",
    ".webm",
    ".wmv",
]);

const getFolderVideoNames = async () => {
    const folderPath = process.env.FOLDER_VIDEO_PATH;
    if (!folderPath || folderPath.trim() === "") {
        throw new Error("FOLDER_VIDEO_PATH chưa được cấu hình");
    }

    const entries = await fs.readdir(path.resolve(folderPath), {
        withFileTypes: true,
    });

    return entries
        .filter((entry) => (
            entry.isFile()
            && VIDEO_EXTENSIONS.has(path.extname(entry.name).toLowerCase())
        ))
        .map((entry) => entry.name);
};

module.exports = {
    getFolderVideoNames,
};
