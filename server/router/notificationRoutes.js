import express from "express";
import {
    getNotifications,
    deleteNotification,
    markAllAsRead,
    markAsRead
} from "../controllers/notificationController.js";
import {
  isAuthenticated,
  isAuthorized,
} from "../middlewares/authMiddleware.js";


const router = express.Router();

router.get("/", isAuthenticated, getNotifications);
router.put("/:id/read", isAuthenticated, markAsRead);
router.put("/read-all", isAuthenticated, markAllAsRead);
router.delete("/:id/delete", isAuthenticated, deleteNotification);



export default router;
