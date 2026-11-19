const express = require("express");
const userController = require("../controllers/userController");
const requireRole = require("../middleware/requireRole");

const router = express.Router();

router.post("/", requireRole("U0"), userController.createUserController);
router.get("/", requireRole("U0"), userController.getUsersController);
router.get("/:id", requireRole("U0"), userController.getUserByIdController);
router.put("/:id", requireRole("U0"), userController.updateUserController);
router.delete("/:id", requireRole("U0"), userController.deleteUserController);

module.exports = router;
