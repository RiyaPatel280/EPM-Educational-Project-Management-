import { SupervisorRequest } from "../models/supervisorRequest.js";
import { User } from "../models/user.js";

export const createRequest = async (requestData) => {
  const exisitingRequest = await SupervisorRequest.findOne({
    student: requestData.student,
    supervisor: requestData.supervisor,
    status: "pending",
  });

  if (exisitingRequest) {
    throw new Error(
      "You have already sent a request to this supervisor. Please wait for their response.",
    );
  }

  const request = await SupervisorRequest.create(requestData);
  return await request.save();
};

export const getAllRequests = async (filters) => {
  const requests = await SupervisorRequest.find(filters)
    .populate("student", "name email")
    .populate("supervisor", "name email")
    .sort({ createdAt: -1 });

  const total = await SupervisorRequest.countDocuments(filters);

  return { requests, total };
};


export const acceptRequest = async (requestId, supervisorId) => {
  const request = await SupervisorRequest.findById(requestId)
    .populate("student", "name email supervisor project")
    .populate("supervisor", "name email");

  if (!request) throw new Error("Request not found");

  // ✅ Authorization check
  if (request.supervisor._id.toString() !== supervisorId.toString()) {
    throw new Error("Not authorized to accept this request");
  }

  // ✅ Status check
  if (request.status !== "pending") {
    throw new Error("Request has already been processed");
  }

  // 🔥 IMPORTANT: Always fetch fresh teacher data
  const teacher = await User.findById(supervisorId);

  if (!teacher) throw new Error("Supervisor not found");

  // ✅ Capacity check (FIXED)
  if (teacher.assignedStudents.length >= teacher.maxStudents) {
    throw new Error("Supervisor has reached maximum student limit");
  }

  // ✅ 1. Update request
  request.status = "accepted";
  await request.save();

  // ✅ 2. Assign supervisor to student
  await User.findByIdAndUpdate(request.student._id, {
    supervisor: supervisorId,
  });

  // ✅ 3. Add student to teacher
  await User.findByIdAndUpdate(supervisorId, {
    $addToSet: { assignedStudents: request.student._id },
  });

  // ✅ 4. Reject other pending requests (PRO FEATURE 🔥)
  await SupervisorRequest.updateMany(
    {
      student: request.student._id,
      status: "pending",
      _id: { $ne: requestId },
    },
    { status: "rejected" }
  );

  return request;
};

export const rejectRequest = async (requestId, supervisorId) => {
  const request = await SupervisorRequest.findById(requestId)
    .populate("student", "name email supervisor project")
    .populate("supervisor", "name email assignedStudents maxStudents");

  if (!request) throw new Error("Request not found");
  if (request.supervisor._id.toString() !== supervisorId.toString()) {
    throw new Error("Not authorized to reject this request");
  }

  if (request.status !== "pending") {
    throw new Error("Request has already been processed");
  }
  request.status = "rejected";
  await request.save();
  return request;
};
