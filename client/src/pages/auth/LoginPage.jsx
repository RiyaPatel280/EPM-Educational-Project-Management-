import { useEffect, useState } from "react";
import { Form, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { BookOpen, Loader } from "lucide-react";
import { login } from "../../store/slices/authSlice";

const LoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { authUser, isLoggingIn } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "Student",
  });

  const [error, setError] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (error[name]) {
      setError((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newError = {};

    if (!formData.email) {
      newError.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newError.email = "Email is invalid";
    }

    if (!formData.password) {
      newError.password = "Password is required";
    } else if (formData.password.length < 8) {
      newError.password = "Password must be at least 8 characters";
    }

    setError(newError);
    return Object.keys(newError).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const data = new FormData();

    data.append("email", formData.email);
    data.append("password", formData.password);
    data.append("role", formData.role);

    dispatch(login(formData));
  };

  useEffect(() => {
    if (authUser) {
      switch (formData.role) {
        case "Student":
          navigate("/student");
          break;
        case "Teacher":
          navigate("/teacher");
          break;
        case "Admin":
          navigate("/admin");
          break;

        default:
          navigate("/login");
      }
    }
  }, [authUser]);

  return (
    <>
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500 rounded-full mb-4">
              <BookOpen className="w-8 h-8 text-white" />
            </div>

            <h1 className="text-2xl font-bold text-slate-800">
              Educational Project Management
            </h1>
            <p className="text-slate-600 mt-2">Sign in to your account</p>
          </div>

          {/* Login Form */}
          <div className="card">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error.general && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error.general}</p>
                </div>
              )}

              {/* Role Selection */}
              <div>
                <label className="label">Select Role</label>
                <select
                  className="input"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="Student">Student</option>
                  <option value="Teacher">Teacher</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>

              {/* Email Field */}
              <div>
                <label className="label">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`input ${error.email ? "input-error" : ""}`}
                  placeholder="Enter your email"
                />
                {error.email && (
                  <p className="text-sm text-red-500 mt-1">{error.email}</p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label className="label">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`input ${error.password ? "input-error" : ""}`}
                  placeholder="Enter your password"
                />
                {error.password && (
                  <p className="text-sm text-red-500 mt-1">{error.password}</p>
                )}
              </div>

              {/*Forgot Password Link */}
              <div className="text-right">
                <Link
                  to="/forgot-password"
                  className="text-sm text-blue-500 hover:text-blue-500"
                >
                  Forgot your password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoggingIn ? (
                  <div className="flex justify-center items-center">
                    <Loader className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                    Siging in...
                  </div>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
