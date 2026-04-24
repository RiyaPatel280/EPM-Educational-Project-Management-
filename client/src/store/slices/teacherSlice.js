import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-toastify";

export const getTeacherDashboardStats = createAsyncThunk(
  "getTeacherdashboardstats",
  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.get("/teacher/fetch-dashboard-stats");
      return res.data.data?.dashboardStats || res.data.data;
    } catch (error) {
      toast.error(
        error.response.data.message || "Failed to fetch dashboard stats",
      );
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  },
);

export const getTeacherRequests = createAsyncThunk(
  "getTeacherRequests",
  async (supervisorId, thunkAPI) => {
    try {
      const res = await axiosInstance.get(
        `/teacher/requests?supervisor=${supervisorId}`,
      );
      return res.data.data?.requests || res.data.data;
    } catch (error) {
      toast.error(error.response.data.message || "Failed to fetch requests");
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  },
);

export const acceptRequest = createAsyncThunk(
  "acceptRequest",
  async (requestId, thunkAPI) => {
    try {
      const res = await axiosInstance.put(
        `/teacher/requests/${requestId}/accept`,
      );
      toast.success(res.data.message || "Request accepted successfully");
      return res.data.data?.request || res.data.data;
    } catch (error) {
      toast.error(error.response.data.message || "Failed to accept requests");
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  },
);

export const rejectRequest = createAsyncThunk(
  "rejectRequest",
  async (requestId, thunkAPI) => {
    try {
      const res = await axiosInstance.put(
        `/teacher/requests/${requestId}/reject`,
      );
      toast.success(res.data.message || "Request rejected successfully");
      return res.data.data?.request || res.data.data;
    } catch (error) {
      toast.error(error.response.data.message || "Failed to reject requests");
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  },
);

export const markComplete = createAsyncThunk(
  "markComplete",
  async (projectId, thunkAPI) => {
    try {
      const res = await axiosInstance.post(
        `/teacher/mark-complete/${projectId}`,
      );
      toast.success(res.data.data.message || "Project marked as completed");
      return { projectId };
    } catch (error) {
      toast.error(error.response.data.message || "Failed to mark completed");
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  },
);

export const downloadFileTeacherFile = createAsyncThunk(
  "downloadFileTeacherFile",
  async ({ projectId, fileId }, thunkAPI) => {
    try {
      const res = await axiosInstance.get(
        `/teacher/download/${projectId}/${fileId}`,
        {
          responseType: "blob",
        },
      );

      return { blob: res.data, projectId, fileId };
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to download file");
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  },
);

export const getFiles = createAsyncThunk(
  "getTeacherFiles",
  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.get(`/teacher/files`);

      return res.data?.data?.files || res.data.data;
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to fetch teacher files",
      );
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  },
);

export const addFeedback = createAsyncThunk(
  "addFeedback",
  async ({ projectId, payload }, thunkAPI) => {
    try {
      const res = await axiosInstance.post(
        `/teacher/feedback/${projectId}`,
        payload,
      );
      toast.success(res.data.data.message || "Feedback posted");
      return {
        projectId,
        feedback: res.data?.feedback || res.data.data || res.data,
      };
    } catch (error) {
      toast.error(error.response.data.message || "Failed to post feedback");
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  },
);

export const getAssignedStudents = createAsyncThunk(
  "getAssignedStudents",
  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.get(`/teacher/assigned-students`);
      return res.data.data?.students || res.data.data || res.data;
    } catch (error) {
      toast.error(
        error.response.data.message || "Failed to fetch assigned students",
      );
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  },
);

export const addTask = createAsyncThunk(
  "teacher/addTask",
  async ({ projectId, text }, thunkAPI) => {
    try {
      const res = await axiosInstance.post(`/teacher/${projectId}/task`, {
        text,
      });
      return res.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  },
);

export const toggleTask = createAsyncThunk(
  "teacher/toggleTask",
  async ({ projectId, taskId }, thunkAPI) => {
    try {
      const res = await axiosInstance.patch(
        `/teacher/${projectId}/task/${taskId}`,
        { toggle: true } // 🔥 VERY IMPORTANT
      );
      return res.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  }
);

export const deleteTask = createAsyncThunk(
  "teacher/deleteTask",
  async ({ projectId, taskId }, thunkAPI) => {
    try {
      const res = await axiosInstance.delete(
        `/teacher/${projectId}/task/${taskId}`,
      );
      return res.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  },
);

export const editTask = createAsyncThunk(
  "teacher/editTask",
  async ({ projectId, taskId, text }, thunkAPI) => {
    try {
      const res = await axiosInstance.patch(
        `/teacher/${projectId}/task/${taskId}/text`,
        { text }
      );

      return res.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Something went wrong"
      );
    }
  }
);

const teacherSlice = createSlice({
  name: "teacher",
  initialState: {
    assignedStudents: [],
    files: [],
    pendingRequests: [],
    dashboardStats: null,
    loading: false,
    error: null,
    list: [],
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getAssignedStudents.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(getAssignedStudents.fulfilled, (state, action) => {
      state.loading = false;
      state.assignedStudents = action.payload || [];
    });
    builder.addCase(getAssignedStudents.rejected, (state, action) => {
      state.error = action.payload || "Failed to fetch assigned students";
      state.loading = false;
    });
    builder.addCase(addFeedback.fulfilled, (state, action) => {
      const { projectId, feedback } = action.payload;
      state.assignedStudents = state.assignedStudents.map((s) =>
        s.project?._id === projectId ? { ...s, feedback } : s,
      );
    });
    builder.addCase(markComplete.fulfilled, (state, action) => {
      const { projectId } = action.payload;
      state.assignedStudents = state.assignedStudents.map((s) => {
        if (s.project._id === projectId) {
          return {
            ...s,
            project: {
              ...s.project,
              status: "completed",
            },
          };
        }
        return s;
      });
    });

    builder.addCase(getTeacherDashboardStats.fulfilled, (state, action) => {
      state.dashboardStats = action.payload;
    });
    builder.addCase(getTeacherRequests.fulfilled, (state, action) => {
      state.list = action.payload?.requests || action.payload;
    });
    builder.addCase(acceptRequest.fulfilled, (state, action) => {
      const updatedRequest = action.payload;
      state.list = state.list.map((r) =>
        r._id === updatedRequest._id ? updatedRequest : r,
      );
    });
    builder.addCase(rejectRequest.fulfilled, (state, action) => {
      const rejectedRequest = action.payload;
      state.list = state.list.filter((r) => r._id !== rejectedRequest._id);
    });
    builder.addCase(getFiles.fulfilled, (state, action) => {
      state.files = action.payload;
    });
    builder.addCase(addTask.fulfilled, (state, action) => {
      const updatedProject = action.payload;

      state.assignedStudents = state.assignedStudents.map((s) =>
        s.project?._id === updatedProject._id
          ? { ...s, project: updatedProject }
          : s,
      );
    });

    builder.addCase(toggleTask.fulfilled, (state, action) => {
      const updatedProject = action.payload;

      state.assignedStudents = state.assignedStudents.map((s) =>
        s.project?._id === updatedProject._id
          ? { ...s, project: updatedProject }
          : s,
      );
    });

    builder.addCase(deleteTask.fulfilled, (state, action) => {
      const updatedProject = action.payload;

      state.assignedStudents = state.assignedStudents.map((s) =>
        s.project?._id === updatedProject._id
          ? { ...s, project: updatedProject }
          : s,
      );
    });

   builder.addCase(editTask.fulfilled, (state, action) => {
  const updatedProject = action.payload;

  state.assignedStudents = state.assignedStudents.map((s) => {
    if (String(s.project?._id) === String(updatedProject._id)) {
      return {
        ...s,
        project: { ...updatedProject }, // 🔥 important clone
      };
    }
    return s;
  });
});
  },
});

export default teacherSlice.reducer;
