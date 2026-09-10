const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authenticate = require("./middleware/authenticate");
const guestReadOnly = require("./middleware/guestReadOnly");
const requireAuth = require("./middleware/requireAuth");

const app = express();

// Import routes
const videoRoutes = require("./routes/videoRoutes");
const barRoutes = require("./routes/barRoutes");
const explanationRoutes = require("./routes/explanationRoutes");
const barRelationshipRoutes = require("./routes/barRelationshipRoutes");
const allCodeRoutes = require("./routes/allCodeRoutes");
const userRoutes = require("./routes/userRoutes");
const createReviewRouter = require("./routes/createReviewRouter");
const searchRoutes = require("./routes/searchRoutes");
const barReactionRoutes = require("./routes/barReactionRoutes");
const authRoutes = require("./routes/authRoutes"); // 👈 route mới

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({
    limit: "50mb",
    extended: true
}));

app.get("/", (req, res) => {
    res.send("DissLens Backend running");
});

// Route login KHÔNG cần authenticate (vì đây là nơi tạo token, chưa có token)
app.use("/api/auth", authRoutes);

// 👇 Áp dụng cho toàn bộ route bên dưới
app.use(authenticate);
app.use(guestReadOnly);

// nếu không có token hoặc không hợp lệ => trả về 401 Unauthorized
// app.use(requireAuth);

app.use("/api/videos", videoRoutes);
app.use("/api/bars", barRoutes);
app.use("/api/explanations", explanationRoutes);
app.use("/api/bar-relationships", barRelationshipRoutes);
app.use("/api/allcodes", allCodeRoutes);
app.use("/api/users", userRoutes);
app.use("/api/review", createReviewRouter);
app.use("/api/search", searchRoutes);
app.use("/api/bar-reactions", barReactionRoutes);

app.listen(3001, () => {
    console.log("Server started at port 3001");
});