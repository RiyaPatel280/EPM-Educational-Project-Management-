import {
  CheckCircle,
  Clock,
  Loader,
  MoveDiagonal,
  Users,
} from "lucide-react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getTeacherDashboardStats } from "../../store/slices/teacherSlice";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const TeacherDashboard = () => {
  const dispatch = useDispatch();
  const { dashboardStats, loading } = useSelector((state) => state.teacher);
  const { authUser } = useSelector((state) => state.auth);

  // ✅ MUST BE ABOVE USAGE
  const getProgress = (tasks = []) => {
    if (!tasks.length) return 0;
    const completed = tasks.filter((t) => t.completed).length;
    return Math.round((completed / tasks.length) * 100);
  };

  // ✅ SAFE DATA
  const chartData =
    dashboardStats?.allProjects?.map((project) => ({
      name: project.title,
      progress: getProgress(project.tasks || []),
    })) || [];

  useEffect(() => {
    dispatch(getTeacherDashboardStats());
  }, [dispatch]);

  const statsCards = [
    {
      title: "Assigned Students",
      value: authUser?.assignedStudents?.length || 0,
      loading,
      Icon: Users,
      bg: "bg-blue-100",
      color: "text-blue-600",
    },
    {
      title: "Pending Requests",
      value: dashboardStats?.totalPendingRequests || 0,
      loading,
      Icon: Clock,
      bg: "bg-yellow-100",
      color: "text-yellow-600",
    },
    {
      title: "Completed Projects",
      value: dashboardStats?.completedProjects || 0,
      loading,
      Icon: CheckCircle,
      bg: "bg-green-100",
      color: "text-green-600",
    },
  ];

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Teacher Dashboard</h1>
        <p className="text-green-100">
          Manage your students and provide guidance on their projects.
        </p>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statsCards.map(({ title, value, loading, Icon, bg, color }, index) => (
          <div key={index} className="card">
            <div className="flex items-center">
              <div className={`p-3 ${bg} rounded-lg`}>
                <Icon className={`w-6 h-6 ${color}`} />
              </div>

              <div className="ml-3">
                <p className="text-sm font-medium text-slate-600">{title}</p>
                <p className="text-sm font-bold text-slate-800">
                  {loading ? "..." : value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* LINE CHART */}
    <div className="card mt-6">
  <div className="card-header">
    <h2 className="card-title">Project Progress Chart</h2>
    <p className="card-subtitle">Overall progress visualization</p>
  </div>

  <div className="h-72 w-full">
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis domain={[0, 100]} />
        <Tooltip />

        <Bar
          dataKey="progress"
          fill="#2563eb"
          radius={[6, 6, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  </div>
</div>

      {/* RECENT ACTIVITY */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Recent Activity</h2>
          <p className="card-subtitle">Latest notifications and updates</p>
        </div>

        <div className="space-y-4">
          {loading ? (
            <Loader size={32} className="animate-spin" />
          ) : dashboardStats?.recentNotifications?.length > 0 ? (
            dashboardStats.recentNotifications.map((notification) => (
              <div
                key={notification._id}
                className="flex items-center p-3 bg-slate-50 rounded-lg"
              >
                <div className="p-2 bg-white rounded-lg">
                  <MoveDiagonal className="w-5 h-5" />
                </div>

                <div className="ml-3 flex-1">
                  <p className="text-sm text-slate-800">
                    {notification.message}
                  </p>
                  <p className="text-xs text-slate-500">
                    {new Date(notification.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-slate-500">
              No recent activity
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;