const Commentreviewservice = require("../services/commentReviewService");
const { createJob, cancelJob, removeJob } = require("../services/jobManager");

const getComments = async (req, res) => {
    const { videoId, jobId: queryJobId } = req.query;

    // Nên có jobId riêng biệt với videoId, để hủy đúng job
    // (phòng trường hợp 1 video được xử lý nhiều lần cùng lúc)
    const jobId = queryJobId || videoId;

    // 1. Tạo job -> lấy AbortController để có thể hủy sau này
    const controller = createJob(jobId);

    // 2. Thiết lập header báo cho client biết đây là luồng SSE, không phải JSON thường
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
    });

    // 3. Hàm tiện ích: đóng gói dữ liệu đúng định dạng SSE rồi ghi ra response
    const sendEvent = (event, data) => {
        res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    };

    // 4. Nếu client tự đóng kết nối (tắt tab, mất mạng) -> tự động hủy job
    req.on('close', () => {
        cancelJob(jobId);
    });

    try {
        // 5. Truyền thêm controller.signal xuống service
        const result = await Commentreviewservice.getComments(videoId, sendEvent, controller.signal);

        // 6. Bắn event cuối cùng chứa kết quả
        sendEvent('result', result);

    } catch (error) {
        // 7. Phân biệt lỗi do hủy chủ động và lỗi thật
        if (error.isCancelled) {
            sendEvent('cancelled', { message: error.message });
        } else {
            sendEvent('error', { message: error.message });
        }

    } finally {
        // 8. Dọn job khỏi bộ nhớ (dù thành công, lỗi, hay bị hủy)
        removeJob(jobId);
        res.end();
    }
};

// Route mới: xử lý yêu cầu hủy từ nút "Hủy" trên UI
const cancelComments = async (req, res) => {
    const { jobId } = req.params; // hoặc req.query, tùy bạn thiết kế route

    const cancelled = cancelJob(jobId);

    res.json({ cancelled });
};

module.exports = {
    getComments,
    cancelComments
};