const axios = require("axios");

const TAVILY_API_KEY = process.env.TAVILY_API_KEY;
const TAVILY_API_URL = process.env.TAVILY_API_URL;

/**
 * Search bằng 1 đoạn văn bản (vd: 1 câu bar), trả về context đã tóm tắt
 * kèm danh sách nguồn (link).
 * @param {string} message - Đoạn văn bản dùng làm query search
 * @param {number} maxResults - Số lượng link tối đa muốn lấy
 * @returns {Promise<{ answer: string, context: string, sources: Array }>}
 */
const searchInternetContextService = async (message, maxResults = 3) => {
    if (!TAVILY_API_KEY) {
        throw new Error("Missing TAVILY_API_KEY in environment variables");
    }

    const response = await axios.post(
        TAVILY_API_URL,
        {
            query: message,
            search_depth: "basic",   // đủ dùng, tiết kiệm credit
            include_answer: true,    // Tavily tự tổng hợp 1 câu trả lời chung
            max_results: maxResults,
        },
        {
            headers: {
                Authorization: `Bearer ${TAVILY_API_KEY}`,
                "Content-Type": "application/json",
            },
        }
    );

    const { answer, results } = response.data;

    const sources = (results || []).map((r) => ({
        title: r.title,
        url: r.url,
        summary: r.content, // nội dung đã được Tavily trích/tóm tắt sẵn
    }));

    // Ghép thành 1 đoạn context hoàn chỉnh, sẵn sàng nhét vào prompt LLM
    const context = buildContextText(answer, sources);

    return {
        answer: answer || "",
        context,
        sources,
    };
};

/**
 * Format kết quả thành 1 đoạn text duy nhất.
 */
const buildContextText = (answer, sources) => {
    let text = "";

    if (answer) {
        text += `TÓM TẮT CHUNG: ${answer}\n\n`;
    }

    text += sources
        .map((s, i) => `[${i + 1}] ${s.title}\n${s.summary}\nNguồn: ${s.url}`)
        .join("\n\n");

    return text;
};

module.exports = {
    searchInternetContextService,
};