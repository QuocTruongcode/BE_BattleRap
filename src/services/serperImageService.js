const axios = require("axios");

const SERPER_API_KEY = process.env.SERPER_API_KEY;
const SERPER_IMAGE_URL = process.env.SERPER_IMAGE_URL;

const searchImages = async ({ query, num = 10, page = 1 }) => {
    if (!SERPER_API_KEY) {
        throw new Error("Missing SERPER_API_KEY in environment variables");
    }

    if (!SERPER_IMAGE_URL) {
        throw new Error("Missing SERPER_IMAGE_URL in environment variables");
    }

    const response = await axios.post(
        SERPER_IMAGE_URL,
        {
            q: query,
            num,
            page,
        },
        {
            headers: {
                "X-API-KEY": SERPER_API_KEY,
                "Content-Type": "application/json",
            },
        }
    );

    return response.data;
};

module.exports = {
    searchImages,
};