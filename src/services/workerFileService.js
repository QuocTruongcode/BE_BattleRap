'use strict';

const fs = require("fs/promises");
const path = require("path");

const dataDirectory = path.resolve(__dirname, "../../data");
const filesPath = path.join(dataDirectory, "file.json");

const syncFiles = async (files) => {
    await fs.mkdir(dataDirectory, { recursive: true });
    await fs.writeFile(filesPath, JSON.stringify(files, null, 2), "utf8");
};

const getFiles = async () => {
    try {
        return JSON.parse(await fs.readFile(filesPath, "utf8"));
    } catch (error) {
        if (error.code === "ENOENT") return [];
        throw error;
    }
};

module.exports = { syncFiles, getFiles };