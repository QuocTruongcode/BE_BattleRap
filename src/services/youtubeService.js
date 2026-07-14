const axios = require("axios");
const API_KEY = process.env.YOUTUBE_API_KEY;


const AI_SERVER_URL = process.env.AI_SERVER_URL;

const ContextPrompt = process.env.PROMPT_REVIEW_COMMENT;


const mapComments = (youtubeComments) => {
    try {
        return youtubeComments.map(item => {
            const comment = item.snippet.topLevelComment.snippet;

            return {
                commentId: item.id,
                // author: comment.authorDisplayName,
                content: comment.textOriginal,
                likeCount: comment.likeCount,
                // publishTime: comment.publishedAt,
                replyCount: item.snippet.totalReplyCount,
                replies: []
            };
        });
    } catch (error) {
        throw error;
    }

};
const mapReplies = (youtubeReplies) => {
    return youtubeReplies.map(reply => {
        const snippet = reply.snippet;

        return {
            replyId: reply.id,
            // author: snippet.authorDisplayName,
            content: snippet.textOriginal,
            likeCount: snippet.likeCount,
            // publishTime: snippet.publishedAt
        };
    });
};



const getReplies = async (parentId) => {
    const allReplies = [];
    let nextPageToken = null;

    try {
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
                    }
                }
            );

            nextPageToken = response.data.nextPageToken;
            allReplies.push(...response.data.items);

        } while (nextPageToken);
        const mappedReplies = mapReplies(allReplies);

        return mappedReplies;

    } catch (error) {
        throw error;
    }
}

const getComments = async (videoId) => {
    const allComments = [];
    let nextPageToken = null;
    try {
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
                    }
                }
            );
            nextPageToken = response.data.nextPageToken;
            allComments.push(...response.data.items);
        } while (nextPageToken);
        const mappedComments = mapComments(allComments);
        for (const comment of mappedComments) {
            if (comment.replyCount > 0) {
                comment.replies = await getReplies(comment.commentId);
            }
        }
        const commentsTextList = convertCommentsToTextList(mappedComments);
        const aiResponse = await askQuestion(ContextPrompt + commentsTextList);

        return {
            textList: aiResponse,

        }
    } catch (error) {
        throw error;
    }
}

function convertCommentsToTextList(comments) {
    if (!Array.isArray(comments)) return "";

    const formatComment = (comment, indent = "") => {
        const { content, likeCount = 0, replies = [] } = comment;

        // Escape xuống dòng trong content để không phá format list
        const safeContent = (content || "").replace(/\n/g, " ").trim();

        let line = `${indent}- "${safeContent}" (${likeCount} likes)`;

        if (Array.isArray(replies) && replies.length > 0) {
            const replyLines = replies
                .map((reply) => formatComment(reply, indent + "  "))
                .join("\n");
            line += "\n" + replyLines;
        }

        return line;
    };
    return comments.map((comment) => formatComment(comment)).join("\n");
}

// Call Service  AI

async function askQuestion(question) {
    try {
        const response = await axios.post(`${AI_SERVER_URL}/post-input-question`, {
            message: question
        });

        // console.log(response.data); // { answer: "..." }
        return response.data;
    } catch (error) {
        console.error('Lỗi gọi API server AI:', error.message);
        throw error;
    }
}


module.exports = {
    getComments
};