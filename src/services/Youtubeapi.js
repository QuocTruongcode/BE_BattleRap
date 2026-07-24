// services/youtube/youtubeApi.js
// Chỉ chịu trách nhiệm gọi API YouTube. Không biết gì về mapping dữ liệu hay nghiệp vụ.

const axios = require("axios");
const API_KEY = process.env.YOUTUBE_API_KEY;

/**
 * Lấy toàn bộ comment thread (top-level comments) của 1 video, có phân trang.
 * @param {string} videoId
 * @param {AbortSignal} signal - dùng để hủy giữa chừng
 */
const fetchCommentThreads = async (videoId, signal) => {
    const allItems = [];
    let nextPageToken = null;

    do {
        const response = await axios.get(
            "https://www.googleapis.com/youtube/v3/commentThreads",
            {
                params: {
                    part: "snippet",
                    videoId,
                    maxResults: 100,
                    key: API_KEY,
                    pageToken: nextPageToken
                },
                signal
            }
        );

        nextPageToken = response.data.nextPageToken;
        allItems.push(...response.data.items);
    } while (nextPageToken);

    return allItems;
};

/**
 * Lấy toàn bộ reply của 1 comment cha, có phân trang.
 * @param {string} parentId
 * @param {AbortSignal} signal
 */
const fetchReplies = async (parentId, signal) => {
    const allItems = [];
    let nextPageToken = null;

    do {
        const response = await axios.get(
            "https://www.googleapis.com/youtube/v3/comments",
            {
                params: {
                    part: "snippet",
                    parentId,
                    maxResults: 100,
                    pageToken: nextPageToken,
                    key: API_KEY
                },
                signal
            }
        );

        nextPageToken = response.data.nextPageToken;
        allItems.push(...response.data.items);
    } while (nextPageToken);

    return allItems;
};

module.exports = {
    fetchCommentThreads,
    fetchReplies
};