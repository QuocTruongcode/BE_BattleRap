// services/jobs/jobManager.js
// Quản lý vòng đời của 1 "job" (1 lượt xử lý getComments) để có thể hủy giữa chừng.

const activeJobs = new Map(); // jobId -> AbortController

/**
 * Tạo 1 job mới, trả về AbortController tương ứng.
 * Gọi hàm này ngay khi bắt đầu xử lý 1 request (VD: khi client mở kết nối SSE).
 */
function createJob(jobId) {
    const controller = new AbortController();
    activeJobs.set(jobId, controller);
    return controller;
}

/**
 * Hủy 1 job đang chạy theo jobId.
 * Trả về true nếu tìm thấy và đã hủy, false nếu job không tồn tại (có thể đã chạy xong).
 */
function cancelJob(jobId) {
    const controller = activeJobs.get(jobId);
    if (!controller) return false;

    controller.abort(); // ngắt ngay lập tức mọi request đang gắn signal này
    activeJobs.delete(jobId);
    return true;
}

/**
 * Dọn job khỏi bộ nhớ khi đã xử lý xong (thành công, lỗi, hoặc đã bị hủy).
 * Luôn gọi hàm này trong khối finally ở nơi khởi tạo job.
 */
function removeJob(jobId) {
    activeJobs.delete(jobId);
}

/**
 * Kiểm tra job có đang tồn tại (chưa bị hủy/chưa xong) hay không.
 */
function hasJob(jobId) {
    return activeJobs.has(jobId);
}

module.exports = {
    createJob,
    cancelJob,
    removeJob,
    hasJob
};