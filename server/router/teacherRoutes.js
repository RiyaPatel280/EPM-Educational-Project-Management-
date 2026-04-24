import express from "express";
import { acceptRequest, addFeedback, addTask, deleteTask, downloadFile, getAssignedStudents, getFiles, getRequests, getTeacherDashboardStats, markComplete, rejectRequest, toggleTask, updateTask } from "../controllers/teacherController.js";
import {
  isAuthenticated,
  isAuthorized,
} from "../middlewares/authMiddleware.js";


const router = express.Router();

router.get(
  "/fetch-dashboard-stats",
  isAuthenticated,
  isAuthorized("Teacher"),
  getTeacherDashboardStats,
);

router.get(
  "/requests",
  isAuthenticated,
  isAuthorized("Teacher"),
  getRequests,
);

router.put(
  "/requests/:requestId/accept",
  isAuthenticated,
  isAuthorized("Teacher"),
  acceptRequest,
);

router.put(
  "/requests/:requestId/reject",
  isAuthenticated,
  isAuthorized("Teacher"),
  rejectRequest,
);

router.post(
  "/feedback/:projectId",
  isAuthenticated,
  isAuthorized("Teacher"),
  addFeedback,
);

router.post(
  "/mark-complete/:projectId",
  isAuthenticated,
  isAuthorized("Teacher"),
  markComplete,
);

router.get(
  "/assigned-students",
  isAuthenticated,
  isAuthorized("Teacher"),
  getAssignedStudents,
);

router.get(
  "/download/:projectId/:fileId",
  isAuthenticated,
  isAuthorized("Teacher"),
  downloadFile,
);

router.get(
  "/files",
  isAuthenticated,
  isAuthorized("Teacher"),
  getFiles,
);

router.post(
  "/:projectId/task",
  isAuthenticated,
  isAuthorized("Teacher"),
  addTask
);

router.patch(
  "/:projectId/task/:taskId", // ✅ FIXED
  isAuthenticated,
  isAuthorized("Teacher"),
  toggleTask
);

router.delete(
  "/:projectId/task/:taskId",
  isAuthenticated,
  isAuthorized("Teacher"),
  deleteTask
);

router.patch(
  "/:projectId/task/:taskId/text",
  isAuthenticated,
  isAuthorized("Teacher"),
  updateTask 
);
export default router;
