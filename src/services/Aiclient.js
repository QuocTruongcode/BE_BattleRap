// services/ai/aiClient.js
// Chỉ chịu trách nhiệm gọi AI server. Đây là chỗ QUAN TRỌNG NHẤT cần signal,
// vì lời gọi LLM thường chạy rất lâu (có thể vài chục giây) so với các bước khác.

const axios = require("axios");
const AI_SERVER_URL = process.env.AI_SERVER_URL;

/**
 * Gửi câu hỏi/nội dung tới AI server và chờ kết quả.
 * @param {string} question
 * @param {AbortSignal} signal - bắt buộc truyền để có thể ngắt ngay khi người dùng bấm Hủy,
 *                                thay vì phải chờ LLM trả lời xong.
 */
async function askQuestion(question, signal) {
    try {
        const response = await axios.post(
            `${AI_SERVER_URL}/post-input-question`,
            { message: question },
            { signal }
        );

        return response.data;
    } catch (error) {
        if (axios.isCancel(error) || error.name === "CanceledError") {
            throw error; // để tầng trên phân biệt lỗi hủy với lỗi thật
        }
        console.error('Lỗi gọi API server AI:', error.message);
        throw error;
    }
}

module.exports = {
    askQuestion
};