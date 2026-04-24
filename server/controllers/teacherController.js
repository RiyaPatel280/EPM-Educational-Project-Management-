import { asyncHandler } from "../middlewares/asyncHandler.js";
import ErrorHandler from "../middlewares/error.js";
import { User } from "../models/user.js";
import * as userServices from "../services/userServices.js";
import * as projectServices from "../services/projectServices.js";
import * as requestServices from "../services/requestServices.js";
import * as notificationServices from "../services/notificationServices.js";
import { Notification } from "../models/notification.js";
import { Project } from "../models/project.js";
import * as fileServices from "../services/fileServices.js";
import { SupervisorRequest } from "../models/supervisorRequest.js";
import { sendEmail } from "../services/emailService.js";
import {
  generateRequestAcceptedTemplate,
  generateRequestRejectedTemplate,
} from "../utils/emailTempltes.js";

export const getTeacherDashboardStats = asyncHandler(async (req, res, next) => {
  const teacherId = req.user._id;

  const projects = await Project.find({ supervisor: teacherId }); // 🔥 FIX

  const totalPendingRequests = await SupervisorRequest.countDocuments({
    supervisor: teacherId,
    status: "pending",
  });

  const completedProjects = await Project.countDocuments({
    supervisor: teacherId,
    status: "completed",
  });

  const recentNotifications = await Notification.find({
    user: teacherId,
  })
    .sort({ createdAt: -1 })
    .limit(5);

  const dashboardStats = {
    allProjects: projects, // ✅ now correct
    totalPendingRequests,
    completedProjects,
    recentNotifications,
  };

  res.status(200).json({
    success: true,
    message: "Teacher dashboard stats fetched successfully",
    data: { dashboardStats },
  });
});

export const getRequests = asyncHandler(async (req, res, next) => {
  const { supervisor } = req.query;

  const filters = {};
  if (supervisor) filters.supervisor = supervisor;

  const { requests, total } = await requestServices.getAllRequests(filters);

  const updatedRequests = await Promise.all(
    requests.map(async (reqObj) => {
      const requestObj = reqObj.toObject ? reqObj.toObject() : reqObj;

      if (requestObj?.student?._id) {
        const latestProject = await Project.findOne({
          student: requestObj.student._id,
        })
          .sort({ createdAt: -1 })
          .lean();

        return { ...requestObj, latestProject };
      }

      return requestObj;
    }),
  );

  res.status(200).json({
    success: true,
    message: "Request fetched successfully",
    data: {
      requests: updatedRequests,
      total,
    },
  });
});

export const acceptRequest = asyncHandler(async (req, res, next) => {
  const { requestId } = req.params;
  const teacherId = req.user._id;

  const request = await requestServices.acceptRequest(requestId, teacherId);
  if (!request) return next(new ErrorHandler("Request not found", 404));

  // ✅ STEP 1: Find project of student
  const project = await Project.findOne({ student: request.student._id });

  if (!project) {
    return next(new ErrorHandler("Project not found for this student", 404));
  }

  // ❗ OPTIONAL (agar validation strict hai)
  if (!project.description) {
    return next(
      new ErrorHandler("Project description is required before assigning supervisor", 400)
    );
  }

  // ✅ STEP 2: Assign supervisor in project
  project.supervisor = teacherId;
  await project.save();

  // ✅ STEP 3: Update student also (VERY IMPORTANT)
  await User.findByIdAndUpdate(request.student._id, {
    supervisor: teacherId,
  });

  // ✅ Notifications
  await notificationServices.notifyUser(
    request.student._id,
    `Your supervisor request has been accepted by ${req.user.name}`,
    "approval",
    "/students/status",
    "low"
  );

  const student = await User.findById(request.student._id);

  await sendEmail({
    to: student.email,
    subject: "EPM SYSTEM - ✅ Your Supervisor Request Has Been Accepted",
    message: generateRequestAcceptedTemplate(req.user.name),
  });

  res.status(200).json({
    success: true,
    message: "Request accepted and supervisor assigned",
    data: { request, project },
  });
});

export const rejectRequest = asyncHandler(async (req, res, next) => {
  const { requestId } = req.params;
  const teacherId = req.user._id;

  const request = await requestServices.rejectRequest(requestId, teacherId);
  if (!request) return next(new ErrorHandler("Request not found", 404));

  await notificationServices.notifyUser(
    request.student._id,
    `Your supervisor request has been rejected by ${req.user.name}`,
    "rejection",
    "/students/status",
    "high",
  );
  const student = await User.findById(request.student._id);
  const studentEmail = student.email;
  const message = generateRequestRejectedTemplate(req.user.name);
  await sendEmail({
    to: studentEmail,
    subject: "EPM SYSTEM - ❌ Your Supervisor Request Has Been Rejected",
    message,
  });

  res.status(200).json({
    success: true,
    message: "Request rejected successfully",
    data: { request },
  });
});

export const getAssignedStudents = asyncHandler(async (req, res, next) => {
  const teacherId = req.user._id;

  const students = await User.find({ supervisor: teacherId }).sort({
    createdAt: -1,
  });

  const studentsWithProject = await Promise.all(
    students.map(async (student) => {
      const project = await Project.findOne({ student: student._id });

      return {
        ...student.toObject(),
        project: project || null,
      };
    }),
  );

  const total = studentsWithProject.length;

  res.status(200).json({
    success: true,
    data: {
      students: studentsWithProject,
      total,
    },
  });
});

export const markComplete = asyncHandler(async (req, res, next) => {
  const { projectId } = req.params;
  const teacherId = req.user._id;

  const project = await projectServices.getProjectById(projectId);

  if (!project) return next(new ErrorHandler("Project not found", 404));
  if (project.supervisor._id.toString() !== teacherId.toString()) {
    return next(new ErrorHandler("Not authorized to mark complete", 403));
  }

  const updatedProject = await projectServices.markComplete(projectId);
  await notificationServices.notifyUser(
    project.student._id,
    `Your project has been marked as completed by your supervisor (${req.user.name})`,
    "general",
    "/students/status",
    "low",
  );

  res.status(200).json({
    success: true,
    data: {
      project: updatedProject,
    },
    message: "Project marked as completed",
  });
});

export const addFeedback = asyncHandler(async (req, res, next) => {
  const { projectId } = req.params;
  const teacherId = req.user._id;
  const { message, title, type } = req.body;

  const project = await projectServices.getProjectById(projectId);

  if (!project) return next(new ErrorHandler("Project not found", 404));

  if (project.supervisor._id.toString() !== teacherId.toString()) {
    return next(new ErrorHandler("Not authorized to mark complete", 403));
  }

  if (!message || !title)
    return next(
      new ErrorHandler("Feedback title and message are required", 400),
    );
  const { project: updatedProject, latestFeedback } =
    await projectServices.addFeedback(
      projectId,
      teacherId,
      message,
      title,
      type,
    );

  await notificationServices.notifyUser(
    project.student._id,
    `New feedback from your supervisor (${req.user.name})`,
    "feedback",
    "/students/feedback",
    type === "positive" ? "low" : type === "negative" ? "high" : "low",
  );

  res.status(200).json({
    success: true,
    message: "Feedback posted successfully",
    data: { project: updatedProject, feedback: latestFeedback },
  });
});

export const getFiles = asyncHandler(async (req, res, next) => {
  const teacherId = req.user._id;
  const projects = await projectServices.getProjectsBySupervisor(teacherId);

  const allFiles = projects.flatMap((project) =>
    project.files.map((file) => ({
      ...file.toObject(),
      projectId: project._id,
      projectTitle: project.title,
      studentName: project.student.name,
      studentEmail: project.student.email,
    })),
  );

  res.status(200).json({
    success: true,
    message: "File fetched",
    data: {
      files: allFiles,
    },
  });
});


export const downloadFile = asyncHandler(async (req, res, next) => {
  const { projectId, fileId } = req.params;
  const supervisorId = req.user._id;

  const project = await projectServices.getProjectById(projectId);
  if (!project) return next(new ErrorHandler("Project not found", 404));
  
  if (project.supervisor._id.toString() !== supervisorId.toString()) {
    return next(new ErrorHandler("Not authorized to download file", 403));
  }

  const file = project.files.id(fileId);
  if (!file) return next(new ErrorHandler("File not found", 404));

  fileServices.streamDownload(file.fileUrl, res, file.originalName);
});

export const addTask = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { text } = req.body;

  const project = await Project.findById(projectId);

  if (!project) throw new ErrorHandler("Project not found", 404);

  if (!project.tasks) project.tasks = [];

project.tasks.push({ text });

  await project.save();

  res.status(200).json({
    success: true,
    data: project,
  });
});

export const toggleTask = asyncHandler(async (req, res, next) => {
  console.log("🔥 toggleTask API HIT");

  const { projectId, taskId } = req.params;

  const project = await Project.findById(projectId);

  if (!project) {
    console.log("❌ Project not found");
    return next(new ErrorHandler("Project not found", 404));
  }

  console.log("Project ID:", projectId);
  console.log("TaskId:", taskId);
  console.log("All Tasks:", project.tasks.map(t => t._id.toString()));

  const task = project.tasks.find(
    (t) => t._id.toString() === taskId.toString()
  );

  if (!task) {
    console.log("❌ Task NOT found");
    return next(new ErrorHandler("Task not found", 404));
  }

  console.log("✅ Task FOUND");

  task.completed = !task.completed;

  await project.save();

  res.status(200).json({
    success: true,
    data: project,
  });
});

export const deleteTask = asyncHandler(async (req, res) => {
  const { projectId, taskId } = req.params;

  const project = await Project.findById(projectId);

  if (!project) {
    return res.status(404).json({
      success: false,
      message: "Project not found",
    });
  }

  project.tasks = project.tasks.filter(
    (task) => task._id.toString() !== taskId
  );

  await project.save();

  res.status(200).json({
    success: true,
    data: project,
  });
});

export const updateTask = asyncHandler(async (req, res, next) => {
  const { projectId, taskId } = req.params;
  const { text } = req.body;

  if (!text) {
    return next(new ErrorHandler("Text is required", 400));
  }

  const updatedProject = await Project.findOneAndUpdate(
    {
      _id: projectId,
      "tasks._id": taskId.trim(), // 🔥 important fix
    },
    {
      $set: {
        "tasks.$.text": text,
      },
    },
    { new: true }
  );

  if (!updatedProject) {
    return next(new ErrorHandler("Project or Task not found", 404));
  }

  res.status(200).json({
    success: true,
    data: updatedProject,
  });
});