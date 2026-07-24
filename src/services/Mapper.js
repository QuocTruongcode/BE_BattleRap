// services/youtube/mapper.js
// Chỉ biến đổi dữ liệu (pure function). Không gọi network nên không cần/không thể hủy.

const mapComments = (youtubeComments) => {
    return youtubeComments.map(item => {
        const comment = item.snippet.topLevelComment.snippet;

        return {
            commentId: item.id,
            content: comment.textOriginal,
            likeCount: comment.likeCount,
            replyCount: item.snippet.totalReplyCount,
            replies: []
        };
    });
};

const mapReplies = (youtubeReplies) => {
    return youtubeReplies.map(reply => {
        const snippet = reply.snippet;

        return {
            replyId: reply.id,
            content: snippet.textOriginal,
            likeCount: snippet.likeCount
        };
    });
};

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

module.exports = {
    mapComments,
    mapReplies,
    convertCommentsToTextList
};