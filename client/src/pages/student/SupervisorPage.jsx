import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllSupervisors,
  fetchProject,
  getSupervisor,
  requestSupervisor,
} from "../../store/slices/studentSlice.js";
import { X } from "lucide-react";

const SupervisorPage = () => {
  const dispatch = useDispatch();
  const { authUser } = useSelector((state) => state.auth);
  const { project, supervisors, supervisor } = useSelector(
    (state) => state.student,
  );

  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestMessage, setRequestMessage] = useState("");
  const [selectedSupervisor, setSelectedSupervisor] = useState(null);

  useEffect(() => {
    dispatch(fetchProject());
    dispatch(getSupervisor());
    dispatch(fetchAllSupervisors());
  }, [dispatch]);

  const hasSupervisor = useMemo(
    () => !!(supervisor && supervisor._id),
    [supervisor],
  );

  const hasProject = useMemo(() => project && project._id, [project]);

  const formatDeadline = (dateStr) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "-";
    const day = date.getDate();
    const j = day % 10,
      k = day % 100;
    const suffix =
      j === 1 && k !== 11
        ? "st"
        : j === 2 && k !== 12
          ? "nd"
          : j === 3 && k !== 13
            ? "rd"
            : "th";
    const month = date.toLocaleString("en-US", { month: "long" });
    const year = date.getFullYear();
    return `${day}${suffix} ${month} ${year}`;
  };

  const handleOpenRequest = (supervisor) => {
    setSelectedSupervisor(supervisor);
    setShowRequestModal(true);
  };

  const submitRequest = () => {
    if (!selectedSupervisor) return;
    const message =
      requestMessage?.trim() ||
      `${authUser.name || "Student"} has request ${
        selectedSupervisor.name
      } to be their supervisor.`;
    dispatch(
      requestSupervisor({ teacherId: selectedSupervisor._id, message }),
    ).then((res) => {
      if (res.type === "student/requestSupervisor/fulfilled") {
        setShowRequestModal(false);
      }
    });
  };
  const getProgress = (tasks = []) => {
    if (!tasks.length) return 0;
    const done = tasks.filter((t) => t.completed).length;
    return Math.round((done / tasks.length) * 100);
  };

  return (
    <>
      <div className="space-y-6">
        {/* CURRENT SUPERVISOR */}
        <div className="card">
          <div className="card-header">
            <h1 className="card-title">Current Supervisor</h1>
            {hasSupervisor && (
              <span className="badge badge-approved">Assigned</span>
            )}
          </div>
          {/* SUPERVISOR DETAILS */}
          {hasSupervisor ? (
            <div className="space-y-6">
              <div className="flex items-start space-x-6">
                <img
                  src="/placeholder.jpg"
                  alt="Supervisor Avatar"
                  className="w-20 h-20 rounded-full object-cover shadow-md"
                />
                <div className="flex-1 space-y-4">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-800">
                      {supervisor?.name || "-"}
                    </h3>
                    <p className="text-lg font-bold text-slate-600">
                      {supervisor?.department || "-"}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-slate-500 uppercase tracking-wide">
                        Email
                      </label>
                      <p className="text-slate-800 font-medium">
                        {supervisor?.email || "-"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-500 uppercase tracking-wide">
                        Expertise
                      </label>
                      <p className="text-slate-800 font-medium">
                        {Array.isArray(supervisor?.expertise)
                          ? supervisor.expertise.join(", ")
                          : supervisor?.expertise || "-"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center">
              <p className="text-slate-600 text-lg">
                Supervisor not assigned yet.
              </p>
            </div>
          )}
        </div>

        {/* PROJECT DETAILS - ONLY SHOW IF PROJECT EXISTS */}
        {hasProject && (
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Project Details</h2>
            </div>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-slate-500 uppercase tracking-wide">
                      Project Title
                    </label>
                    <p className="text-lg font-semibold text-slate-800 mt-1">
                      {project?.title || "-"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-500 uppercase tracking-wide">
                      Status
                    </label>
                    <div className="mt-1">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full font-medium capitalize text-sm ${
                          project?.status === "approved"
                            ? "bg-green-100 text-green-800"
                            : project?.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : project?.status === "rejected"
                                ? "bg-red-100 text-red-800"
                                : project?.status === "completed"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {project?.status || "Invalid"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-slate-500 uppercase tracking-wide">
                      Deadline
                    </label>
                    <p className="text-lg font-semibold text-slate-800 mt-1">
                      {project?.deadline
                        ? formatDeadline(project.deadline)
                        : "No deadline set"}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-500 uppercase tracking-wide">
                      Created
                    </label>
                    <p className="text-lg font-semibold text-slate-800 mt-1">
                      {project?.createdAt
                        ? formatDeadline(project.createdAt)
                        : "Unknown"}
                    </p>
                  </div>
                </div>
              </div>

              {project?.description && (
                <div>
                  <label className="text-sm font-medium text-slate-500 uppercase tracking-wide">
                    Description
                  </label>
                  <p className="text-slate-700 mt-2 leading-relaxed">
                    {project?.description || "-"}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Project Progress */}
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 mt-5 transition-all">
          {/* HEADER */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-800">
                Project Progress
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Real-time task completion overview
              </p>
            </div>

            <div className="text-right">
              <div className="text-3xl font-bold text-blue-600">
                {getProgress(project?.tasks)}%
              </div>
              <p className="text-xs text-slate-500">Completed</p>
            </div>
          </div>

          {/* PROGRESS BAR (ANIMATED FEEL) */}
          <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden mb-6 relative">
            <div
              className="h-4 rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-500 transition-all duration-700 ease-out"
              style={{ width: `${getProgress(project?.tasks)}%` }}
            />

            {/* FLOATING TEXT */}
            <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-slate-600">
              Overall Project Progress
            </div>
          </div>

          {/* MINI STATS */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* COMPLETED / TOTAL */}
            <div className="bg-slate-50 rounded-xl p-4 hover:shadow-sm transition">
              <p className="text-xs text-slate-500 uppercase">
                Completed Tasks
              </p>
              <p className="text-base font-semibold text-slate-800 mt-1">
                {project?.tasks?.filter((t) => t.completed).length || 0} /{" "}
                {project?.tasks?.length || 0}
              </p>
            </div>

            {/* REMAINING */}
            <div className="bg-slate-50 rounded-xl p-4 hover:shadow-sm transition">
              <p className="text-xs text-slate-500 uppercase">Remaining</p>
              <p className="text-base font-semibold text-slate-800 mt-1">
                {(project?.tasks?.length || 0) -
                  (project?.tasks?.filter((t) => t.completed).length || 0)}
              </p>
            </div>
          </div>

          {/* TASK LIST (MODERN ROW STYLE) */}
          <div className="space-y-2">
            {project?.tasks?.length > 0 ? (
              project.tasks.map((task) => (
                <div
                  key={task._id}
                  className="group flex items-center justify-between px-4 py-3 rounded-xl border border-slate-100 bg-white hover:bg-slate-50 hover:shadow-sm transition-all"
                >
                  {/* LEFT SIDE */}
                  <div className="flex items-center gap-3">
                    {/* DOT */}
                    <span
                      className={`w-2 h-2 rounded-full transition ${
                        task.completed ? "bg-green-500" : "bg-slate-300"
                      }`}
                    />

                    {/* TEXT */}
                    <span className="text-slate-700 text-sm">{task.text}</span>
                  </div>

                  {/* STATUS */}
                  <span
                    className={`text-xs px-3 py-1 rounded-full font-medium transition ${
                      task.completed
                        ? "bg-green-50 text-green-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {task.completed ? "Completed" : "Pending"}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">No tasks available</p>
            )}
          </div>
        </div>
        {/* IF NO PROJECT */}
        {!hasProject && (
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Project Required</h2>
            </div>

            <div className="p-6 text-center">
              <p className="text-slate-600 text-lg">
                You haven't submitted any project proposal yet, so you cannot
                request a supervisor.
              </p>
            </div>
          </div>
        )}

        {/* AVAILABLE SUPERVISORS | ONLY WHEN PROJECT EXISTS AND NO SUPERVISOR ASSIGNED */}

        {hasProject && !hasSupervisor && (
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Available Supervisors</h2>
              <p className="card-subtitle">
                Browse and request supervision from available faculty members.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
              {supervisors &&
                supervisors.map((sup) => (
                  <div
                    key={sup._id}
                    className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-12 h-12 bg-slate-300 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-slate-600">
                          {sup.name || "Anonymous"}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-slate-800">
                          {sup.name}
                        </h4>
                        <p className="text-sm text-slate-600">
                          {sup.department}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div>
                        <label className="text-xs font-medium text-slate-500">
                          Email
                        </label>
                        <p className="text-sm text-slate-700">
                          {sup.email || "-"}
                        </p>
                      </div>

                      <div>
                        <label className="text-xs font-medium text-slate-500">
                          Expertise
                        </label>
                        <p className="text-sm text-slate-700">
                          {Array.isArray(sup?.expertise)
                            ? sup.expertise.join(", ")
                            : sup?.expertise || "-"}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleOpenRequest(sup)}
                      className="btn-primary w-full"
                    >
                      Request Supervisor
                    </button>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* REQUEST MODAL */}
        {showRequestModal && selectedSupervisor && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-800">
                    Request Supervision
                  </h3>
                  <button
                    className="text-slate-400 hover:text-slate-600"
                    onClick={() => {
                      setShowRequestModal(false);
                      setSelectedSupervisor(null);
                      setRequestMessage("");
                    }}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 rounded-md">
                    <p className="text-sm text-slate-600">
                      {selectedSupervisor?.name}
                    </p>
                  </div>
                  <div>
                    <label className="label">Message to Supervisor</label>
                    <textarea
                      className="input min-h-[120px]"
                      required
                      value={requestMessage}
                      onChange={(e) => setRequestMessage(e.target.value)}
                      placeholder="Introduce yourself and explain why you'd life this professor to supervise your project..."
                    />
                  </div>

                  <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
                    <button
                      onClick={() => {
                        setShowRequestModal(false);
                        setSelectedSupervisor(null);
                        setRequestMessage("");
                      }}
                      className="btn-outline"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={submitRequest}
                      className="btn-primary"
                      disabled={!requestMessage.trim()}
                    >
                      Send Request
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default SupervisorPage;
