// services/commentReviewService.js
// Điều phối toàn bộ luồng: lấy comment -> lấy reply -> format -> hỏi AI.
// Không tự gọi axios/network trực tiếp, chỉ gọi xuống các service con và truyền signal.

const { fetchCommentThreads, fetchReplies } = require('./youtubeApi');
const { mapComments, mapReplies, convertCommentsToTextList } = require('./mapper');
const { askQuestion } = require('./aiClient');

const ContextPrompt = process.env.PROMPT_REVIEW_COMMENT;

/**
 * Lấy toàn bộ replies của 1 comment (đã map sẵn về format nội bộ).
 */
const getReplies = async (parentId, signal) => {
    const rawReplies = await fetchReplies(parentId, signal);
    return mapReplies(rawReplies);
};

/**
 * Luồng chính: lấy comment YouTube -> lấy reply -> format -> hỏi AI.
 *
 * @param {string} videoId
 * @param {function} onProgress - callback báo tiến trình cho SSE
 * @param {AbortSignal} signal - truyền từ jobManager, dùng để hủy giữa chừng ở BẤT KỲ bước nào
 */
const getComments = async (videoId, onProgress = () => { }, signal) => {
    try {
        onProgress('step', { step: 'fetching_comments', message: 'Đang lấy bình luận từ YouTube...' });
        const rawComments = await fetchCommentThreads(videoId, signal);
        const mappedComments = mapComments(rawComments);

        onProgress('step', { step: 'fetching_replies', message: 'Đang lấy phản hồi bình luận...' });
        for (const comment of mappedComments) {
            if (comment.replyCount > 0) {
                comment.replies = await getReplies(comment.commentId, signal);
            }
        }

        // onProgress('step', { step: 'formatting', message: 'Đang định dạng dữ liệu...' });
        // const commentsTextList = convertCommentsToTextList(mappedComments);

        // onProgress('step', { step: 'analyzing', message: 'Đang phân tích với AI...' });
        // const aiResponse = await askQuestion(ContextPrompt + commentsTextList, signal);

        return { textList: mappedComments };
    } catch (error) {
        // Phân biệt lỗi do hủy chủ động và lỗi thật, để controller xử lý khác nhau
        if (error.name === 'CanceledError' || error.code === 'ERR_CANCELED') {
            const cancelError = new Error('Đã hủy theo yêu cầu người dùng');
            cancelError.isCancelled = true;
            throw cancelError;
        }
        throw error; // để controller bắt và gửi event 'error'
    }
};

module.exports = {
    getComments
};