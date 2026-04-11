import { useState, type ChangeEvent, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { apiUrl } from "../config/api";
import { loginStart, loginSuccess } from "../redux/slices/auth-slice/authSlice";
import { useAppDispatch, useAppSelector } from "../redux/store";

export function Login() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.auth);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setError("");
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    dispatch(loginStart());
    try {
      const res = await axios.post(apiUrl("/api/auth/login"), {
        email: formData.email,
        password: formData.password,
      });
      const { token, user } = res.data;
      localStorage.setItem("token", token);
      dispatch(loginSuccess({ token, user }));
      // Role-based redirect
      if (user.role === "PRACTITIONER") navigate("/practitioner");
      else if (user.role === "VOLUNTEER") navigate("/volunteer");
      else navigate("/home");
    } catch (err: any) {
      const msg = err.response?.data?.error || "Login failed. Try again.";
      setError(msg);
      dispatch({ type: "auth/loginFailure", payload: msg });
    }
  };

  return (
    <div className="min-h-screen bg-gray-200 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold text-purple-600 mb-2">MindLink</h1>
          <p className="text-gray-600">Welcome back! Please sign in to your account.</p>
        </div>

        <div className="bg-white rounded-xl shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                id="email" name="email" type="email"
                value={formData.email} onChange={handleInputChange} required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter your email"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                id="password" name="password" type="password"
                value={formData.password} onChange={handleInputChange} required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter your password"
              />
            </div>

            {error && <p className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg">{error}</p>}

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input type="checkbox" className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500" />
                <span className="ml-2 text-sm text-gray-600">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-sm text-purple-600 hover:text-purple-700">Forgot password?</Link>
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full bg-purple-700 hover:bg-purple-500 py-2 text-white rounded-lg transition-all duration-200 disabled:opacity-50"
            >
              {loading ? 'Please wait...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link to="/signup" className="text-purple-600 font-medium hover:text-purple-700">Sign up</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
