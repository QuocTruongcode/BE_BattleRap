const dramaEventService = require("../services/dramaEventService");

const isValidId = (id) => Number.isInteger(Number(id)) && Number(id) > 0;
const isValidText = (value) => value === null || typeof value === "string";
const isValidTime = (value) => value === null
    || (typeof value === "string" && value.trim() !== "" && Number.isFinite(Date.parse(value)));
const sendError = (res, error) => {
    res.status(error.statusCode || 500).json({
        success: false,
        message: error.message,
    });
};

const validateTextFields = (data) => ["link", "title", "review"].every(
    (field) => data[field] === undefined || isValidText(data[field])
);
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
    if (!validateTextFields(eventData) || !validateMetadataFields(eventData)) {
        return res.status(400).json({
            success: false,
            message: "link, title, review, facebookUrl, pageName và postId phải là chuỗi hoặc null; time phải là ngày hợp lệ hoặc null",
        });
    }
    if (Object.keys(eventData).some((field) => ![
        "link", "title", "review", "dramaID", "facebookUrl", "pageName", "postId", "time",
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

    const allowedFields = ["link", "title", "review", "dramaID", "facebookUrl", "pageName", "postId", "time"];
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
        if (!isValidId(event.dramaID)) {
            return res.status(400).json({
                success: false,
                message: `dramaID tại vị trí ${index} phải là số nguyên dương hợp lệ`,
            });
        }
        if (!validateTextFields(event) || !validateMetadataFields(event)) {
            return res.status(400).json({
                success: false,
                message: `link, title, review, facebookUrl, pageName và postId tại vị trí ${index} phải là chuỗi hoặc null; time phải là ngày hợp lệ hoặc null`,
            });
        }
        normalizedEvents.push({
            ...event,
            dramaID: Number(event.dramaID),
        });
    }

    try {
        const dramaEvents = await dramaEventService.bulkCreateDramaEvents(normalizedEvents);
        return res.status(201).json({
            success: true,
            message: `Tạo ${dramaEvents.length} dramaEvent thành công`,
            data: dramaEvents,
        });
    } catch (error) {
        return sendError(res, error);
    }
};

const getAllDramaEventsController = async (req, res) => {
    let dramaID;
    if (req.query.dramaID !== undefined) {
        if (!isValidId(req.query.dramaID)) {
            return res.status(400).json({
                success: false,
                message: "dramaID phải là một số nguyên dương hợp lệ",
            });
        }
        dramaID = Number(req.query.dramaID);
    }

    try {
        const dramaEvents = await dramaEventService.getAllDramaEvents(dramaID);
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

    const allowedFields = ["link", "title", "review", "dramaID", "facebookUrl", "pageName", "postId", "time"];
    const fields = Object.keys(eventData);
    if (fields.length === 0 || fields.some((field) => !allowedFields.includes(field))) {
        return res.status(400).json({
            success: false,
            message: "Chỉ có thể cập nhật link, title, review, dramaID, facebookUrl, pageName, postId và time",
        });
    }
    if (!validateTextFields(eventData) || !validateMetadataFields(eventData)) {
        return res.status(400).json({
            success: false,
            message: "link, title, review, facebookUrl, pageName và postId phải là chuỗi hoặc null; time phải là ngày hợp lệ hoặc null",
        });
    }
    if (eventData.dramaID !== undefined && eventData.dramaID !== null
        && !isValidId(eventData.dramaID)) {
        return res.status(400).json({
            success: false,
            message: "dramaID phải là một số nguyên dương hợp lệ hoặc null",
        });
    }

    try {
        const normalizedEventData = eventData.dramaID === undefined || eventData.dramaID === null
            ? eventData
            : { ...eventData, dramaID: Number(eventData.dramaID) };
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
    getDramaEventByIdController,
    updateDramaEventController,
    deleteDramaEventController,
};
