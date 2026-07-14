const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Import routes
const videoRoutes = require("./routes/videoRoutes");
const barRoutes = require("./routes/barRoutes");
const explanationRoutes = require("./routes/explanationRoutes");
const barRelationshipRoutes = require("./routes/barRelationshipRoutes");
const allCodeRoutes = require("./routes/allCodeRoutes");
const youtubeRoute = require("./routes/youtobeRouter");
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("DissLens Backend running");
});

// Sử dụng router
app.use("/api/videos", videoRoutes);
app.use("/api/bars", barRoutes);
app.use("/api/explanations", explanationRoutes);
app.use("/api/bar-relationships", barRelationshipRoutes);
app.use("/api/allcodes", allCodeRoutes);
app.use("/api/youtube", youtubeRoute);
app.listen(3001, () => {
    console.log("Server started at port 3001");
});