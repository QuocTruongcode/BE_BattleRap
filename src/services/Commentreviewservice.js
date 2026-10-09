// services/commentReviewService.js
// Điều phối toàn bộ luồng: lấy comment -> lấy reply -> format -> hỏi AI.
// Không tự gọi axios/network trực tiếp, chỉ gọi xuống các service con và truyền signal.

const { fetchCommentThreads, fetchReplies } = require('./Youtubeapi');
const { mapComments, mapReplies, convertCommentsToTextList } = require('./Mapper');
const { askQuestion } = require('./Aiclient');
const { getBarsByMatchId } = require('./barService');

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
 * @param {string} videoId - YouTube video ID used to fetch comments
 * @param {number} matchID - internal video/match ID used to fetch bars
 * @param {function} onProgress - callback báo tiến trình cho SSE
 * @param {AbortSignal} signal - truyền từ jobManager, dùng để hủy giữa chừng ở BẤT KỲ bước nào
 */
const getComments = async (videoId, matchID, onProgress = () => { }, signal) => {
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

        onProgress('step', { step: 'fetching_bars', message: 'Đang lấy các bar của video...' });
        const bars = await getBarsByMatchId(matchID);

        onProgress('step', { step: 'formatting', message: 'Đang định dạng dữ liệu...' });
        const commentsTextList = convertCommentsToTextList(mappedComments);
        const barsText = bars
            .map((bar) => bar.content ?? '')
            .join('\n');
        const reviewPrompt = [
            ContextPrompt,
            'Các bar trong video:',
            barsText || '(Video chưa có bar nào.)',
            'Các bình luận:',
            commentsTextList || '(Video chưa có bình luận nào.)'
        ].join('\n\n');
        console.log('Review prompt length:', reviewPrompt);

        onProgress('step', { step: 'analyzing', message: 'Đang phân tích với AI...' });
        const aiResponse = await askQuestion(reviewPrompt, signal);

        return { textList: aiResponse };
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