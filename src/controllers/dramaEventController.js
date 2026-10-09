const dramaEventService = require("../services/dramaEventService");

const isValidId = (id) => Number.isInteger(Number(id)) && Number(id) > 0;
const isValidText = (value) => value === null || typeof value === "string";
const isValidJsonValue = (value) => value === null
    || ["string", "number", "boolean", "object"].includes(typeof value);
const isValidTime = (value) => value === null
    || (typeof value === "string" && value.trim() !== "" && Number.isFinite(Date.parse(value)));
const sendError = (res, error) => {
    res.status(error.statusCode || 500).json({
        success: false,
        message: error.message,
    });
};

const validateTextFields = (data) => ["link", "title"].every(
    (field) => data[field] === undefined || isValidText(data[field])
) && (data.review === undefined || isValidJsonValue(data.review));
const invalidTextFieldsMessage = "link và title phải là chuỗi hoặc null; review phải là giá trị JSON hợp lệ hoặc null";
const validateMetadataFields = (data) => ["facebookUrl", "pageName", "postId"].every(
    (field) => data[field] === undefined || isValidText(data[field])
) && (data.time === undefined || isValidTime(data.time));

const createDramaEventController = async (req, res) => {
    const eventData = req.body;
    if (!eventData || typeof eventData !== "object" || Array.isArray(eventData)) {
        return res.status(400).json({
            success: false,
            message: "Vui lòng cung cấp dữ liệu dramaEvent",
        });
    }
    if (!isValidId(eventData.dramaID)) {
        return res.status(400).json({
            success: false,
            message: "dramaID phải là một số nguyên dương hợp lệ",
        });
    }
    if (eventData.videoID !== undefined && eventData.videoID !== null
        && !isValidId(eventData.videoID)) {
        return res.status(400).json({
            success: false,
            message: "videoID phải là một số nguyên dương hợp lệ hoặc null",
        });
    }
    if (!validateTextFields(eventData) || !validateMetadataFields(eventData)) {
        return res.status(400).json({
            success: false,
            message: `${invalidTextFieldsMessage}; facebookUrl, pageName và postId phải là chuỗi hoặc null; time phải là ngày hợp lệ hoặc null`,
        });
    }
    if (Object.keys(eventData).some((field) => ![
        "link", "title", "review", "dramaID", "videoID", "facebookUrl", "pageName", "postId", "time",
    ].includes(field))) {
        return res.status(400).json({
            success: false,
            message: "Dữ liệu chứa trường không được hỗ trợ",
        });
    }

    try {
        const dramaEvent = await dramaEventService.createDramaEvent({
            ...eventData,
            dramaID: Number(eventData.dramaID),
            videoID: eventData.videoID === undefined || eventData.videoID === null
                ? eventData.videoID
                : Number(eventData.videoID),
        });
        return res.status(201).json({
            success: true,
            message: "Tạo dramaEvent thành công",
            data: dramaEvent,
        });
    } catch (error) {
        return sendError(res, error);
    }
};

const bulkCreateDramaEventsController = async (req, res) => {
    const events = req.body;
    if (!Array.isArray(events) || events.length === 0) {
        return res.status(400).json({
            success: false,
            message: "Body phải là một mảng dramaEvent không rỗng",
        });
    }

    const allowedFields = ["id", "link", "title", "review", "dramaID", "videoID", "facebookUrl", "pageName", "postId", "time"];
    const normalizedEvents = [];
    for (const [index, event] of events.entries()) {
        if (!event || typeof event !== "object" || Array.isArray(event)) {
            return res.status(400).json({
                success: false,
                message: `DramaEvent tại vị trí ${index} phải là một object`,
            });
        }
        if (Object.keys(event).some((field) => !allowedFields.includes(field))) {
            return res.status(400).json({
                success: false,
                message: `DramaEvent tại vị trí ${index} chứa trường không được hỗ trợ`,
            });
        }
        if (event.id !== undefined && event.id !== null && !isValidId(event.id)) {
            return res.status(400).json({
                success: false,
                message: `id tại vị trí ${index} phải là số nguyên dương hợp lệ hoặc null`,
            });
        }
        if (!isValidId(event.dramaID)) {
            return res.status(400).json({
                success: false,
                message: `dramaID tại vị trí ${index} phải là số nguyên dương hợp lệ`,
            });
        }
        if (event.videoID !== undefined && event.videoID !== null
            && !isValidId(event.videoID)) {
            return res.status(400).json({
                success: false,
                message: `videoID tại vị trí ${index} phải là số nguyên dương hợp lệ hoặc null`,
            });
        }
        if (!validateTextFields(event) || !validateMetadataFields(event)) {
            return res.status(400).json({
                success: false,
                message: `${invalidTextFieldsMessage} tại vị trí ${index}; facebookUrl, pageName và postId phải là chuỗi hoặc null; time phải là ngày hợp lệ hoặc null`,
            });
        }
        normalizedEvents.push({
            ...event,
            ...(event.id === undefined || event.id === null ? {} : { id: Number(event.id) }),
            dramaID: Number(event.dramaID),
            videoID: event.videoID === undefined || event.videoID === null
                ? event.videoID
                : Number(event.videoID),
        });
    }

    try {
        const dramaEvents = await dramaEventService.bulkUpsertDramaEvents(normalizedEvents);
        return res.status(200).json({
            success: true,
            message: `Đã upsert ${dramaEvents.length} dramaEvent thành công`,
            data: dramaEvents,
        });
    } catch (error) {
        return sendError(res, error);
    }
};

const getAllDramaEventsController = async (req, res) => {
    let dramaID;
    let videoID;
    if (req.query.dramaID !== undefined) {
        if (!isValidId(req.query.dramaID)) {
            return res.status(400).json({
                success: false,
                message: "dramaID phải là một số nguyên dương hợp lệ",
            });
        }
        dramaID = Number(req.query.dramaID);
    }
    if (req.query.videoID !== undefined) {
        if (!isValidId(req.query.videoID)) {
            return res.status(400).json({
                success: false,
                message: "videoID phải là một số nguyên dương hợp lệ",
            });
        }
        videoID = Number(req.query.videoID);
    }

    try {
        const dramaEvents = await dramaEventService.getAllDramaEvents(dramaID, videoID);
        return res.status(200).json({ success: true, data: dramaEvents });
    } catch (error) {
        return sendError(res, error);
    }
};

const getAllDramaEventByVideoIDController = async (req, res) => {
    const { videoID } = req.params;
    if (!isValidId(videoID)) {
        return res.status(400).json({
            success: false,
            message: "videoID phải là một số nguyên dương hợp lệ",
        });
    }

    try {
        const dramaEvents = await dramaEventService.getAllDramaEventByVideoID(Number(videoID));
        return res.status(200).json({ success: true, data: dramaEvents });
    } catch (error) {
        return sendError(res, error);
    }
};

const getAllDramaEventByDramaIDController = async (req, res) => {
    const { dramaID } = req.params;
    if (!isValidId(dramaID)) {
        return res.status(400).json({
            success: false,
            message: "dramaID phải là một số nguyên dương hợp lệ",
        });
    }

    try {
        const dramaEvents = await dramaEventService.getAllDramaEventByDramaID(Number(dramaID));
        return res.status(200).json({ success: true, data: dramaEvents });
    } catch (error) {
        return sendError(res, error);
    }
};

const getDramaEventByIdController = async (req, res) => {
    const { id } = req.params;
    if (!isValidId(id)) {
        return res.status(400).json({
            success: false,
            message: "ID phải là một số nguyên dương hợp lệ",
        });
    }

    try {
        const dramaEvent = await dramaEventService.getDramaEventById(Number(id));
        return res.status(200).json({ success: true, data: dramaEvent });
    } catch (error) {
        return sendError(res, error);
    }
};

const updateDramaEventController = async (req, res) => {
    const { id } = req.params;
    const eventData = req.body;
    if (!isValidId(id)) {
        return res.status(400).json({
            success: false,
            message: "ID phải là một số nguyên dương hợp lệ",
        });
    }
    if (!eventData || typeof eventData !== "object" || Array.isArray(eventData)) {
        return res.status(400).json({
            success: false,
            message: "Vui lòng cung cấp dữ liệu dramaEvent cần cập nhật",
        });
    }

    const allowedFields = ["link", "title", "review", "dramaID", "videoID", "facebookUrl", "pageName", "postId", "time"];
    const fields = Object.keys(eventData);
    if (fields.length === 0 || fields.some((field) => !allowedFields.includes(field))) {
        return res.status(400).json({
            success: false,
            message: "Chỉ có thể cập nhật link, title, review, dramaID, videoID, facebookUrl, pageName, postId và time",
        });
    }
    if (!validateTextFields(eventData) || !validateMetadataFields(eventData)) {
        return res.status(400).json({
            success: false,
            message: `${invalidTextFieldsMessage}; facebookUrl, pageName và postId phải là chuỗi hoặc null; time phải là ngày hợp lệ hoặc null`,
        });
    }
    if (eventData.dramaID !== undefined && eventData.dramaID !== null
        && !isValidId(eventData.dramaID)) {
        return res.status(400).json({
            success: false,
            message: "dramaID phải là một số nguyên dương hợp lệ hoặc null",
        });
    }
    if (eventData.videoID !== undefined && eventData.videoID !== null
        && !isValidId(eventData.videoID)) {
        return res.status(400).json({
            success: false,
            message: "videoID phải là một số nguyên dương hợp lệ hoặc null",
        });
    }

    try {
        const normalizedEventData = {
            ...eventData,
            ...(eventData.dramaID === undefined || eventData.dramaID === null
                ? {}
                : { dramaID: Number(eventData.dramaID) }),
            ...(eventData.videoID === undefined || eventData.videoID === null
                ? {}
                : { videoID: Number(eventData.videoID) }),
        };
        const dramaEvent = await dramaEventService.updateDramaEvent(Number(id), normalizedEventData);
        return res.status(200).json({
            success: true,
            message: "Cập nhật dramaEvent thành công",
            data: dramaEvent,
        });
    } catch (error) {
        return sendError(res, error);
    }
};

const deleteDramaEventController = async (req, res) => {
    const { id } = req.params;
    if (!isValidId(id)) {
        return res.status(400).json({
            success: false,
            message: "ID phải là một số nguyên dương hợp lệ",
        });
    }

    try {
        await dramaEventService.deleteDramaEvent(Number(id));
        return res.status(200).json({
            success: true,
            message: "Xóa dramaEvent thành công",
        });
    } catch (error) {
        return sendError(res, error);
    }
};

module.exports = {
    createDramaEventController,
    bulkCreateDramaEventsController,
    getAllDramaEventsController,
    getAllDramaEventByDramaIDController,
    getAllDramaEventByVideoIDController,
    getDramaEventByIdController,
    updateDramaEventController,
    deleteDramaEventController,
};
