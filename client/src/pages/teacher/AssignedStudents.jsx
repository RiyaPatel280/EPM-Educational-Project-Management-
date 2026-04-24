import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  MessageSquare,
  CheckCircle,
  X,
  ClipboardList,
  Trash2,
  Pencil,
} from "lucide-react";
import {
  addFeedback,
  getAssignedStudents,
  markComplete,
  toggleTask,
  addTask,
  deleteTask,
  editTask,
} from "../../store/slices/teacherSlice";

const AssignedStudents = () => {
  const [sortBy, setSortBy] = useState("name");
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editText, setEditText] = useState("");
  const [newTask, setNewTask] = useState({});
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskText, setTaskText] = useState("");
  const [feedbackData, setFeedbackData] = useState({
    title: "",
    message: "",
    type: "general",
  });

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getAssignedStudents());
  }, [dispatch]);

  const { assignedStudents, loading, error } = useSelector(
    (state) => state.teacher,
  );

  const currentStudent = assignedStudents.find(
    (s) => String(s.project?._id) === String(selectedStudent?.project?._id),
  );

  useEffect(() => {
    if (selectedStudent?.project?._id) {
      const updated = assignedStudents.find(
        (s) => String(s.project?._id) === String(selectedStudent.project._id),
      );

      if (updated) {
        setSelectedStudent(updated);
      }
    }
  }, [assignedStudents]);

  const handleSave = async (task) => {
    if (!editText.trim()) return;

    const res = await dispatch(
      editTask({
        projectId: currentStudent.project._id,
        taskId: task._id,
        text: editText,
      }),
    );

    console.log("UPDATED PROJECT:", res.payload); // 🔍 DEBUG

    setEditingTaskId(null);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-700 border border-green-300";
      case "approved":
        return "bg-blue-100 text-blue-700 border border-blue-300";
      default:
        return "bg-yellow-100 text-yellow-700 border border-yellow-300";
    }
  };

  const getStatusText = (status) => {
    if (status === "completed") return "Completed";
    if (status === "approved") return "Approved";
    return "Pending";
  };

  const handleFeedback = (student) => {
    setSelectedStudent(student);
    setFeedbackData({ title: "", message: "", type: "general" });
    setShowFeedbackModal(true);
  };

  const handleMarkComplete = (student) => {
    setSelectedStudent(student);
    setShowCompleteModal(true);
  };

  const closeModal = () => {
    setShowFeedbackModal(false);
    setShowCompleteModal(false);
    setSelectedStudent(null);
    setFeedbackData({ title: "", message: "", type: "general" });
  };

  const submitFeedback = () => {
    if (
      selectedStudent?.project?._id &&
      feedbackData.title &&
      feedbackData.message
    ) {
      dispatch(
        addFeedback({
          projectId: selectedStudent.project._id,
          payload: feedbackData,
        }),
      );
      closeModal();
    }
  };

  const confirmMarkComplete = () => {
    if (selectedStudent?.project?._id) {
      dispatch(markComplete(selectedStudent.project._id));
      closeModal();
    }
  };

  const sortedStudents = [...(assignedStudents || [])].sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.name.localeCompare(b.name);
      case "lastActivity":
        return new Date(b.project?.updatedAt) - new Date(a.project?.updatedAt);
      default:
        return 0;
    }
  });

  const getProgress = (tasks = []) => {
    if (!tasks.length) return 0;
    const done = tasks.filter((t) => t.completed).length;
    return Math.round((done / tasks.length) * 100);
  };

  const stats = [
    {
      label: "Total Students",
      value: sortedStudents.length,
      bg: "bg-blue-50",
      text: "text-blue-700",
      sub: "text-blue-600",
    },
    {
      label: "Projects Completed",
      value: sortedStudents.filter((s) => s.project?.status === "completed")
        .length,
      bg: "bg-green-50",
      text: "text-green-700",
      sub: "text-green-600",
    },
    {
      label: "In Progress",
      value: sortedStudents.filter((s) => s.project?.status === "approved")
        .length,
      bg: "bg-yellow-50",
      text: "text-yellow-700",
      sub: "text-yellow-600",
    },
    {
      label: "Total Projects",
      value: sortedStudents.length,
      bg: "bg-purple-50",
      text: "text-purple-700",
      sub: "text-purple-600",
    },
  ];

  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-10 text-red-600 font-medium">
        Error loading students
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="card">
        <div className="card-header">
          <h1 className="card-title">Assigned Students</h1>
          <p className="card-subtitle">
            Manage your assigned students and their projects
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {stats.map((item) => {
            return (
              <div key={item.label} className={`${item.bg} p-4 rounded-lg`}>
                <p className={`text-sm ${item.sub}`}>{item.label}</p>
                <p className={`text-2xl ${item.text} font-bold`}>
                  {item.value}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* STUDENTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {sortedStudents.map((student) => (
          <div
            key={student._id}
            className="card hover:shadow-lg transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold">
                    {student.name
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("") || "S"}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">
                    {student.name}
                  </h3>
                  <p className="text-sm text-slate-600">{student.email}</p>
                </div>
              </div>

              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(student.project?.status)}`}
              >
                {getStatusText(student.project?.status)}
              </span>
            </div>

            <div className="mb-5">
              <h4 className="font-medium text-slate-700 mb-1">
                {student.project?.title || "No project title"}
              </h4>
              <p className="text-xs text-slate-500">
                Last Update:{" "}
                {new Date(
                  student.project?.updatedAt || new Date(),
                ).toLocaleDateString()}
              </p>
            </div>

            <div className="mb-5">
              {/* Header */}
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-slate-800 text-base">
                  Progress
                </h3>

                <span className="text-sm font-bold text-blue-600">
                  {getProgress(student.project?.tasks)}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                  style={{
                    width: `${getProgress(student.project?.tasks)}%`,
                  }}
                ></div>
              </div>
            </div>
            {/* ACTIONS */}
            <div className="flex gap-3">
              <button
                onClick={() => handleFeedback(student)}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition"
              >
                <MessageSquare className="w-4 h-4" /> Feedback
              </button>

              <button
  onClick={() => handleMarkComplete(student)}
  disabled={
    student?.project?.status === "completed" ||
    getProgress(student.project?.tasks) < 100
  }
  className={`flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white text-sm rounded-lg transition ${
    student?.project?.status === "completed" ||
    getProgress(student.project?.tasks) < 100
      ? "opacity-50 cursor-not-allowed"
      : "hover:bg-green-700"
  }`}
>
  <CheckCircle className="w-4 h-4" /> Mark Complete
</button>
              <button
                onClick={() => {
                  setSelectedStudent(student);
                  setTaskText("");
                  setShowTaskModal(true);
                }}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white text-sm rounded-lg transition hover:bg-purple-700"
              >
                <ClipboardList className="w-4 h-4" />
                Manage Tasks
              </button>
            </div>
          </div>
        ))}
        {sortedStudents.length === 0 && (
          <div className="card text-center py-10 text-slate-600">
            No assigned student found
          </div>
        )}
      </div>

      {/* FEEDBACK MODAL */}
      {showFeedbackModal && selectedStudent && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-md transform scale-100 transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-800">
                  Provide Feedback
                </h2>

                <button
                  onClick={closeModal}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* PROJECT INFO */}
              <div className="bg-slate-50 rounded-lg p-4 mb-6">
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium text-slate-600">Project:</span>
                    <span className="ml-2 text-slate-800">
                      {selectedStudent.project?.title || "No title"}
                    </span>
                  </div>

                  <div>
                    <span className="font-medium text-slate-600">Student:</span>
                    <span className="ml-2 text-slate-800">
                      {selectedStudent.name}
                    </span>
                  </div>

                  {selectedStudent.project?.deadline && (
                    <div>
                      <span className="font-medium text-slate-600">
                        Deadline:
                      </span>
                      <span className="ml-2 text-slate-800">
                        {new Date(
                          selectedStudent.project?.deadline,
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  <div>
                    <span className="font-medium text-slate-600">
                      Last Updated:
                    </span>
                    <span className="ml-2 text-slate-800">
                      {new Date(
                        selectedStudent.project?.updatedAt || new Date(),
                      ).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Feedback Form */}
                <div className="space-y-4">
                  <div className="mt-5">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Feedback Title
                    </label>
                    <input
                      type="text"
                      value={feedbackData.title}
                      onChange={(e) =>
                        setFeedbackData({
                          ...feedbackData,
                          title: e.target.value,
                        })
                      }
                      className="w-full px-3 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter feedback title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Feedback Type
                    </label>

                    <select
                      value={feedbackData.type}
                      onChange={(e) =>
                        setFeedbackData({
                          ...feedbackData,
                          type: e.target.value,
                        })
                      }
                      className="w-full px-3 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="general">General</option>
                      <option value="positive">Positive</option>
                      <option value="negative">Negative</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Feedback Message
                    </label>
                    <textarea
                      value={feedbackData.message}
                      onChange={(e) =>
                        setFeedbackData({
                          ...feedbackData,
                          message: e.target.value,
                        })
                      }
                      rows={4}
                      className="w-full px-3 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      placeholder="Enter your feedback message..."
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button onClick={closeModal} className="btn-danger">
                    Cancel
                  </button>
                  <button
                    className="btn-primary"
                    onClick={submitFeedback}
                    disabled={!feedbackData.title || !feedbackData.message}
                  >
                    Submit Feedback
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* COMPLETE MODAL */}
      {showCompleteModal && selectedStudent && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex backdrop-blur-sm items-center justify-center z-50 p-4"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-md transform scale-100 transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-800">
                  Mark Project as Completed?
                </h2>
                <button
                  onClick={closeModal}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="bg-slate-50 rounded-lg p-4 mb-6">
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium text-slate-600">Student</span>
                    <span className="ml-2 text-slate-800">
                      {selectedStudent.name}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-slate-600">Project</span>
                    <span className="ml-2 text-slate-800">
                      {selectedStudent.project?.title || "No title"}
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-slate-600 mb-6">
                Are you sure to mark this project as completed? This action
                cannot be undone.
              </p>
              <div className="flex gap-3">
                <button onClick={closeModal} className="btn-danger">
                  Cancel
                </button>
                <button onClick={confirmMarkComplete} className="btn-primary">
                  Mark as Completed
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD TASK */}
      {showTaskModal && selectedStudent && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowTaskModal(false)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              {/* HEADER */}
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Manage Tasks</h2>
                <button onClick={() => setShowTaskModal(false)}>
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* PROJECT INFO */}
              <div className="bg-slate-50 p-3 rounded mb-4 text-sm">
                <p className="font-semibold text-slate-800">
                  Student:{" "}
                  <span className="font-normal">{selectedStudent.name}</span>
                </p>

                <p className="font-semibold text-slate-800">
                  Project:{" "}
                  <span className="font-normal">
                    {selectedStudent.project?.title}
                  </span>
                </p>
              </div>

              {/* TASK LIST 🔥 */}
              <div className="space-y-2 max-h-40 overflow-y-auto mb-4">
                {currentStudent?.project?.tasks?.map((task) => (
                  <div
                    key={task._id}
                    className="flex items-center justify-between gap-2"
                  >
                    {/* LEFT SIDE */}
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="checkbox"
                        checked={!!task.completed}
                        onChange={() =>
                          dispatch(
                            toggleTask({
                              projectId: currentStudent.project._id,
                              taskId: task._id,
                            }),
                          )
                        }
                      />

                      {/* 🔥 EDIT MODE */}
                      {editingTaskId === task._id ? (
                        <input
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="border px-2 py-1 rounded w-full text-sm"
                        />
                      ) : (
                        <span
                          className={
                            task.completed ? "line-through text-gray-400" : ""
                          }
                        >
                          {task.text}
                        </span>
                      )}
                    </div>

                    {/* RIGHT SIDE BUTTONS */}
                    <div className="flex gap-2">
                      {/* EDIT BUTTON */}
                      {editingTaskId === task._id ? (
                        <button
                          onClick={() => handleSave(task)}
                          className="text-green-600 text-xs"
                        >
                          Save
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingTaskId(task._id);
                            setEditText(task.text);
                          }}
                          className="text-blue-500 text-xs"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                      )}

                      {/* DELETE BUTTON */}
                      <button
                        onClick={() =>
                          dispatch(
                            deleteTask({
                              projectId: currentStudent.project._id,
                              taskId: task._id,
                            }),
                          )
                        }
                        className="text-red-500 text-xs"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                {currentStudent?.project?.tasks?.length === 0 && (
                  <p className="text-sm text-gray-400">No tasks yet</p>
                )}
              </div>

              {/* ADD TASK INPUT */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="New task..."
                  value={taskText}
                  onChange={(e) => setTaskText(e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-lg"
                />

                <button
                  onClick={() => {
                    if (!taskText || !currentStudent?.project?._id) return;

                    dispatch(
                      addTask({
                        projectId: currentStudent.project._id,
                        text: taskText,
                      }),
                    );

                    setTaskText("");
                  }}
                  className="btn-primary"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignedStudents;
